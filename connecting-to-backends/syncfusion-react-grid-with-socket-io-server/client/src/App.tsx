import { useEffect, useRef, useState, useCallback } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Sort,
  Filter,
  Edit,
  Toolbar,
  Search,
  Resize,
  type DataStateChangeEventArgs,
  type DataSourceChangedEventArgs,
} from '@syncfusion/ej2-react-grids';
import { Query } from '@syncfusion/ej2-data';
import { io, Socket } from 'socket.io-client';

// ─── Grid settings ───────────────────────────────────────────────────────────
const editSettings = {
  allowEditing: true,
  allowAdding: true,
  allowDeleting: true,
};

const toolbarItems = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
const filterSettings = { type: 'Excel' as const };
const pageSettings = { pageSize: 10, pageSizes: true };

const departmentParams = {
  params: {
    dataSource: ['Admin', 'HR', 'Finance', 'IT', 'Operations', 'Support', 'Sales', 'Engineering', 'Marketing'],
    query: new Query(),
  },
};

// ─── Helper: wrap socket.emit as an awaitable Promise via ack callback ────────
function socketEmit<T>(socket: Socket, event: string, data: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Socket timeout on "${event}"`)), 10_000);
    socket.emit(event, data, (response: T) => {
      clearTimeout(timer);
      resolve(response);
    });
  });
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const gridRef = useRef<GridComponent>(null);
  const socketRef = useRef<Socket | null>(null);

  const [connected, setConnected] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [syncFlash, setSyncFlash] = useState(false);

  // ── READ — triggered by every grid state change (page / sort / filter / search) ──
  const dataStateChange = useCallback(async (args: DataStateChangeEventArgs) => {
    const socket = socketRef.current;
    if (!socket) return;

    const params = {
      skip:   args.skip,
      take:   args.take,
      sorted: args.sorted,
      where:  args.where,
      search: args.search,
    };

    const res = await socketEmit<{ result: object[]; count: number }>(socket, 'readData', params);

    // Excel-filter popup requests its own distinct data source via a callback
    const action = (args as any).action;
    if (
      action &&
      (
        action.requestType === 'filterchoicerequest' ||
        action.requestType === 'filterSearchBegin'   ||
        action.requestType === 'stringfilterrequest'
      )
    ) {
      (args as any).dataSource(res.result);
    } else {
      if (gridRef.current)
        gridRef.current.dataSource = res;       // { result, count } update grid data
    }
  }, []);

  // ── CRUD — triggered after the user confirms add / edit / delete ──────────
  const dataSourceChanged = useCallback(async (args: DataSourceChangedEventArgs) => {
    const socket = socketRef.current;
    if (!socket) return;

    const data: any = args.data;

    // INSERT
    if (args.action === 'add' && args.requestType === 'save') {
      await socketEmit(socket, 'crudAction', { action: 'insert', value: data });
      (args as any).endEdit();
      return;
    }

    // UPDATE
    if (args.action === 'edit' && args.requestType === 'save') {
      await socketEmit(socket, 'crudAction', { action: 'update', value: data });
      (args as any).endEdit();
      return;
    }

    // DELETE
    if (args.requestType === 'delete') {
      const record = Array.isArray(data) ? data[0] : data;
      await socketEmit(socket, 'crudAction', {
        action: 'remove',
        key:    record?.EmployeeID,
        value:  record,
      });
      (args as any).endEdit();
      return;
    }
  }, []);

  // ── Socket.IO ──────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Load initial page once socket is ready
      const initialState = { skip: 0, take: pageSettings.pageSize } as DataStateChangeEventArgs;
      dataStateChange(initialState);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // ★ Key Socket.IO use-case:
    // listening on server side broadcast for changes
    socket.on('dataChanged', () => {
      gridRef.current?.refresh();
      setSyncFlash(true);
      setTimeout(() => setSyncFlash(false), 1500);
    });

    socket.on('clientCount', (count: number) => {
      setClientCount(count);
    });

    return () => { socket.disconnect(); };
  }, [dataStateChange]);

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <span className="app-title">Employee Management</span>
          <span className="app-subtitle">Real-Time CRUD · Socket.IO + Syncfusion Grid</span>
        </div>
        <div className="status-bar">
          {syncFlash && (
            <span className="sync-flash">⚡ Clients synced </span>
          )}
          <span className={`conn-badge ${connected ? 'connected' : 'disconnected'}`}>
            <span className="conn-dot" />
            {connected ? 'Live' : 'Offline'}
          </span>
          {connected && (
            <span className="client-count">
              👥 {clientCount} user{clientCount !== 1 ? 's' : ''} online
            </span>
          )}
        </div>
      </header>

      {/* Info banner */}
      <div className="info-banner">
        <span className="info-icon">ℹ️</span>
        Open this app in <strong>two browser tabs</strong> and make a CRUD
        change in one, the other tab reflects changes <strong>instantly</strong> via
        Socket.IO broadcast.
      </div>

      {/* Grid */}
      <div className={`grid-wrapper${syncFlash ? ' sync-highlight' : ''}`}>
        <GridComponent
          ref={gridRef}
          allowPaging={true}
          allowSorting={true}
          allowMultiSorting={true}
          allowFiltering={true}
          allowResizing={true}
          toolbar={toolbarItems}
          editSettings={editSettings}
          filterSettings={filterSettings}
          pageSettings={pageSettings}
          dataStateChange={dataStateChange}
          dataSourceChanged={dataSourceChanged}
        >
          <ColumnsDirective>
            <ColumnDirective
              field="EmployeeID"
              headerText="ID"
              isPrimaryKey={true}
              isIdentity={true}
              textAlign="Right"
              width="80"
              allowEditing={false}
            />
            <ColumnDirective
              field="FirstName"
              headerText="First Name"
              width="140"
              validationRules={{ required: true }}
            />
            <ColumnDirective
              field="LastName"
              headerText="Last Name"
              width="140"
              validationRules={{ required: true }}
            />
            <ColumnDirective
              field="Department"
              headerText="Department"
              width="160"
              editType="dropdownedit"
              edit={departmentParams}
            />
            <ColumnDirective
              field="Salary"
              headerText="Salary"
              width="130"
              textAlign="Right"
              format="C0"
              editType="numericedit"
            />
            <ColumnDirective
              field="IsActive"
              headerText="Active"
              width="100"
              textAlign="Center"
              displayAsCheckBox={true}
              editType="booleanedit"
            />
          </ColumnsDirective>

          <Inject services={[Page, Sort, Filter, Edit, Toolbar, Search, Resize]} />
        </GridComponent>
      </div>
    </div>
  );
}
