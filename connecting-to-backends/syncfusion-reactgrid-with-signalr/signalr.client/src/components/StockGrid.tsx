import React, { useRef, useEffect, useMemo } from "react";
import * as SignalR from '@microsoft/SignalR';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Sort,
  Filter,
  Search,
  Toolbar,
} from "@syncfusion/ej2-react-grids";
import "../styles/StockGrid.css";
import { DataManager, UrlAdaptor } from "@syncfusion/ej2-data";

const StockGrid: React.FC = () => {
  const gridRef = useRef<GridComponent>(null);
  const connectionRef = useRef<SignalR.HubConnection | null>(null);

  const stock = useMemo(() => {
    return new DataManager({
      url: 'http://localhost:5083/api/Stock/UrlDatasource',
      adaptor: new UrlAdaptor(),
      crossDomain: true,
    });
  }, []);

  // Initialize SignalR connection for real-time updates
  useEffect(() => {
    let isSubscribed = true; // Track if component is still mounted
    let isSubscriptionPending = false; // Prevent duplicate subscription calls
    
    const conn = new SignalR.HubConnectionBuilder()
      .withUrl("http://localhost:5083/stockHub", {
        withCredentials: true,
        skipNegotiation: false,
        transport: SignalR.HttpTransportType.WebSockets | SignalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(SignalR.LogLevel.Information)
      .build();

    connectionRef.current = conn;

    // Handler for initial stock data on connection
    conn.on("InitializeStocks", (stocks: any[]) => {      
      if (!stocks || stocks.length === 0) {
        return;
      }

      if (!gridRef.current) {
        return;
      }

      const grid = gridRef.current as any;
      
      // Update each stock's cells using formatted display values from server
      stocks.forEach((stock) => {
        try {
          grid?.setCellValue(stock.stockId, 'CurrentPrice', stock.currentPrice);
          grid?.setCellValue(stock.stockId, 'ChangeDisplay', stock.changeDisplay);
          grid?.setCellValue(stock.stockId, 'ChangePercentDisplay', stock.changePercentDisplay);
          grid?.setCellValue(stock.stockId, 'VolumeDisplay', stock.volumeDisplay);
          grid?.setCellValue(stock.stockId, 'LastUpdated', stock.lastUpdated);
        } catch (err) {
          console.error(`Error updating stock ${stock?.symbol}:`, err);
        }
      });
    });

    // Handler for real-time stock updates
    conn.on("ReceiveStockUpdate", (updatedStocks: any[]) => {      
      if (!updatedStocks || updatedStocks.length === 0) {
        return;
      }

      if (!gridRef.current) {
        return;
      }

      const grid = gridRef.current as any;
      
      // Update each stock's cells with real-time data
      updatedStocks.forEach((stock) => {
        try {
          grid?.setCellValue(stock.stockId, 'CurrentPrice', stock.currentPrice);
          grid?.setCellValue(stock.stockId, 'ChangeDisplay', stock.changeDisplay);
          grid?.setCellValue(stock.stockId, 'ChangePercentDisplay', stock.changePercentDisplay);
          grid?.setCellValue(stock.stockId, 'VolumeDisplay', stock.volumeDisplay);
          grid?.setCellValue(stock.stockId, 'LastUpdated', stock.lastUpdated);
        } catch (err) {
          console.error(`Error updating stock ${stock?.symbol}:`, err);
        }
      });
    });

    // Helper function to subscribe - called only once per connection
    const subscribeToStocks = async () => {
      if (isSubscriptionPending || !isSubscribed) {
        return;
      }
      
      isSubscriptionPending = true;
      try {
        await conn.invoke("SubscribeToStocks");
        if (isSubscribed) {
          console.log("✅ Subscribed to stock updates");
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("❌ Error subscribing to stocks:", err);
        }
      } finally {
        isSubscriptionPending = false;
      }
    };

    // Connection state logging
    conn.onreconnecting((error) => {
      console.log(`SignalR connection lost. Attempting to reconnect: ${error?.message}`);
    });

    conn.onclose((error) => {
      console.error(`SignalR connection closed: ${error?.message || "Unknown error"}`);
    });

    // Start connection - do not manually call subscribe here
    conn.start()
      .then(() => {
        if (!isSubscribed) {
          // Component unmounted during connection - stop immediately
          conn.stop();
          return;
        }
        console.log("✅ SignalR connection established successfully");
        return subscribeToStocks();
      })
      .catch((err: Error) => {
        if (isSubscribed) {
          console.error("❌ Error establishing SignalR connection:", err.message);
        }
      });

    return () => {
      isSubscribed = false; // Mark as unsubscribed
      
      if (connectionRef.current) {
        const currentConn = connectionRef.current;
        
        // Only try to unsubscribe if connection is in Connected state
        if (currentConn.state === SignalR.HubConnectionState.Connected) {
          currentConn.invoke("UnsubscribeFromStocks")
            .catch(() => {
              // Silently catch - connection might already be closing
            });
        }
        
        currentConn.off("InitializeStocks");
        currentConn.off("ReceiveStockUpdate");
        
        currentConn.stop().catch(() => {
          // Silently catch - already stopped or stopping
        });
        
        connectionRef.current = null;
      }
    };
  }, []);

  const filterSettings = { type: "Excel" as const };
  const toolbar: string[] = ["Search"];

  // Column templates for custom styling
  const symbolTemplate = (props: any) => (
    <div className="symbol-cell">
      <div className="symbol-text">{props?.Symbol}</div>
    </div>
  );

  const companyTemplate = (props: any) => (
    <div className="company-cell">
      <div className="company-name">{props?.Company}</div>
    </div>
  );

  // Helper function to determine if a value is positive or negative by parsing the display string
  const isPositiveChange = (displayValue: string): boolean => {
    if (!displayValue) return false;
    // Check for positive indicators: starts with "+" or contains "▲" (up arrow)
    return displayValue.includes('+') || displayValue.includes('▲');
  };

  const isNegativeChange = (displayValue: string): boolean => {
    if (!displayValue) return false;
    // Check for negative indicators: starts with "-" or contains "▼" (down arrow) or "(" for parentheses notation
    return displayValue.includes('-') || displayValue.includes('▼') || displayValue.includes('(');
  };

  // queryCellInfo handler - applies CSS classes for styling based on column type and display values
  const queryCellInfo = (args: any) => {
    try {
      // Remove all possible styling classes first
      args.cell?.classList.remove('e-poscell', 'e-negcell', 'e-volumecell', 'e-price');
      
      const columnField = args.column?.field;

      // CURRENT PRICE: Blue text, no background
      if (columnField === 'CurrentPrice') {
        args.cell?.classList.add('e-price');
      }
      
      // CHANGE DISPLAY: Parse the display string to determine color
      else if (columnField === 'ChangeDisplay') {
        const changeDisplay = args.data?.ChangeDisplay ?? '';
        if (isNegativeChange(changeDisplay)) {
          args.cell?.classList.add('e-negcell'); // RED for price drop
        } else if (isPositiveChange(changeDisplay)) {
          args.cell?.classList.add('e-poscell'); // GREEN for price increase
        }
      }
      
      // CHANGE PERCENT DISPLAY: Parse the display string to determine color
      else if (columnField === 'ChangePercentDisplay') {
        const changePercentDisplay = args.data?.ChangePercentDisplay ?? '';
        if (isNegativeChange(changePercentDisplay)) {
          args.cell?.classList.add('e-negcell'); // RED for percentage drop
        } else if (isPositiveChange(changePercentDisplay)) {
          args.cell?.classList.add('e-poscell'); // GREEN for percentage increase
        }
      }
      
      // VOLUME: Default styling
      else if (columnField === 'VolumeDisplay') {
        args.cell?.classList.add('e-volumecell');
      }
      
      // LAST UPDATED: Format the timestamp
      else if (columnField === 'LastUpdated') {
        const raw = args.data?.LastUpdated;
        if (raw) {
          const dt = new Date(raw);
          const day = String(dt.getDate()).padStart(2, '0');
          const mon = dt.toLocaleString('en-US', { month: 'short' });
          const year = dt.getFullYear();
          let hour = dt.getHours();
          hour = hour % 12 || 12;
          const hh = String(hour).padStart(2, '0');
          const mm = String(dt.getMinutes()).padStart(2, '0');
          const ss = String(dt.getSeconds()).padStart(2, '0');
          const formatted = `${day} ${mon} ${year} ${hh}:${mm}:${ss}`;
          if (args.cell) args.cell.textContent = formatted;
        }
      }
    } catch (err) {
      console.error("Error in queryCellInfo:", err);
    }
  };

  return (
    <div className="app-container">
      <div className="stock-header">
        <h1>Live Stock Market</h1>
        <p className="subtitle">Real-time stock prices updated every 2 seconds via SignalR</p>
      </div>
      <GridComponent
        ref={gridRef}
        dataSource={stock}
        height="500"
        cssClass="stock-grid"
        toolbar={toolbar}
        queryCellInfo={queryCellInfo}
        allowSorting
        allowFiltering
        filterSettings={filterSettings}>
        <ColumnsDirective>
          <ColumnDirective 
            field="StockId" 
            headerText="ID" 
            width={0} 
            visible={false}
            isPrimaryKey={true}
          />
          <ColumnDirective 
            field="Company" 
            headerText="Company" 
            width={250} 
            clipMode="EllipsisWithTooltip"
            template={companyTemplate}
          />
           <ColumnDirective 
            field="Symbol" 
            headerText="Symbol" 
            width={100} 
            template={symbolTemplate}
          />
          <ColumnDirective 
            field="CurrentPrice" 
            headerText="Current Price" 
            width={140} 
            textAlign="Right"
            format="C2"
            type="number"
            allowFiltering={false}
          />
          <ColumnDirective 
            field="ChangeDisplay" 
            headerText="Change" 
            width={130} 
            textAlign="Right"
            allowFiltering={false}
          />
          <ColumnDirective 
            field="ChangePercentDisplay" 
            headerText="Change %" 
            width={120} 
            textAlign="Right"
            allowFiltering={false}
          />
          <ColumnDirective 
            field="VolumeDisplay" 
            headerText="Volume" 
            width={120} 
            textAlign="Right"
          />
          <ColumnDirective 
            field="LastUpdated" 
            headerText="Last Updated" 
            width={140} 
            textAlign="Center"
          />
        </ColumnsDirective>
        <Inject services={[Sort, Filter, Search, Toolbar]} />
      </GridComponent>
    </div>
  );
};

export default StockGrid;
