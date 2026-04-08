import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { GridComponent, ToolbarItems, FilterService, SortService, ToolbarService, GridModule, FilterSettingsModel } from '@syncfusion/ej2-angular-grids';
import { DataManager, UrlAdaptor } from '@syncfusion/ej2-data';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { HubConnection } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';

// client model matching server-side Stock model (PascalCase)
export interface StockItem {
  stockId: number;
  symbol: string;
  company: string;
  currentPrice: number;
  previousPrice?: number;
  change: number;
  changePercent: number;
  changeDisplay?: string;
  changePercentDisplay?: string;
  volume: number;
  volumeDisplay?: string;
  lastUpdated?: string;
}

@Component({ 
  selector: 'app-root',
  standalone:true,
  providers:[FilterService, SortService, ToolbarService],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  imports:[GridModule]
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('grid')
  public grid?: GridComponent;
  public data?: DataManager;
  public editSettings?: EditSettingsModel;
  public toolbar?: ToolbarItems[];
  private connection!: HubConnection;
  private localData: StockItem[] = [];
  public filterSettings! : FilterSettingsModel;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this. filterSettings = { type:'Excel'}
    // Use the Stock UrlDatasource endpoint (Syncfusion expects POST)
    this.data = new DataManager({
      url: 'http://localhost:5083/api/Stock/UrlDatasource',
      adaptor: new UrlAdaptor(),
      // headers are optional; kept for parity with the React sample
      headers: [
        { 'Content-Type': 'application/json' }
      ]
    });

    // Enable editing if needed
    this.editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal' };
    this.toolbar = ['Search'];

    // build hub connection to the StockHub (server maps to /stockHub)
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5083/stockHub', {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .build();
  }

  created() {
    // Initial snapshot from hub
    this.connection.on('InitializeStocks', (items: StockItem[]) => {
      if (!items || items.length === 0) return;
      if (!this.grid) return;
      const grid = this.grid as any;
      console.log("created")
      // Update existing rows by primary key using setCellValue to avoid full refresh
      items.forEach((stock) => {
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

    // Real-time updates
    this.connection.on('ReceiveStockUpdate', (updates: StockItem[]) => {
      if (!updates || updates.length === 0) return;
      if (!this.grid) return;
      const grid = this.grid as any;
      updates.forEach((stock) => {
          grid?.setCellValue(stock.stockId, 'CurrentPrice', stock.currentPrice);
          grid?.setCellValue(stock.stockId, 'ChangeDisplay', stock.changeDisplay);
          grid?.setCellValue(stock.stockId, 'ChangePercentDisplay', stock.changePercentDisplay);
          grid?.setCellValue(stock.stockId, 'VolumeDisplay', stock.volumeDisplay);
          grid?.setCellValue(stock.stockId, 'LastUpdated', stock.lastUpdated);
      });
    });

    // Start connection and subscribe to group
    this.connection.start()
      .then(() => {
        console.log('SignalR connected to /stockHub');
        this.connection.invoke('SubscribeToStocks')
          .catch(err => console.error('SubscribeToStocks failed', err));
      })
      .catch(err => console.error('SignalR start failed', err));
  }

  // Optional: style cells similar to React queryCellInfo
  queryCellInfo(args: any) {
    if (args.column?.field === 'CurrentPrice') {
        args.cell?.classList.add('e-price');
      } else if (args.column?.field === 'ChangeDisplay') {
        const change = args.data?.Change ?? 0;
        if (change < 0) args.cell?.classList.add('e-negcell');
        else if (change > 0) args.cell?.classList.add('e-poscell');
      } else if (args.column?.field === 'ChangePercentDisplay') {
        const cp = args.data?.ChangePercent ?? 0;
        if (cp < 0) args.cell?.classList.add('e-negcell');
        else if (cp > 0) args.cell?.classList.add('e-poscell');
      } else if (args.column?.field === 'VolumeDisplay') {
        args.cell?.classList.add('e-volumecell');
      } else if (args.column?.field === 'LastUpdated') {
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
  }

  ngOnDestroy(): void {
    if (this.connection) {
      try {
        this.connection.invoke('UnsubscribeFromStocks').catch(() => {});
        this.connection.stop();
      } catch { }
    }
  }

}
