# Syncfusion React Grid with Socket.IO (Custom Binding) — Real-Time CRUD

A complete example demonstrating how to connect **Syncfusion React Grid** with **Socket.IO** for **real-time bidirectional data synchronization**. Supports server-driven paging, sorting, filtering, searching, and full CRUD with instant updates across all connected clients.

## Key Features

- **Custom Binding Pattern**: Manual control of Socket.IO events using `dataStateChange` & `dataSourceChanged`
- **Real-Time Synchronization**: Server broadcasts changes to all connected clients instantly
- **Socket.IO Event Model**: Bidirectional communication with acknowledgment callbacks
- **Advanced Grid Behavior**: Excel-style filtering, multi-column sorting, paging, searching
- **Full CRUD**: Insert, update, delete with instant broadcasting to all clients
- **Live Connection Status**: Real-time client count and connection indicators
- **In-Memory Data Store**: Fast server-side operations with Syncfusion DataManager

## Prerequisites

- **Node.js** LTS (20+) with npm/yarn/pnpm
- **React** 18+
- **Vite** 7.3.1+
- **TypeScript** 5.x+
- **Socket.IO** 4.x+
- **@syncfusion/ej2-react-grids** Latest
- **@syncfusion/ej2-data** Latest

---

## Quick Start

### 1) Clone the repository
```bash
git clone <your-repo-url>
cd <your-project>/SocketIO_Grid
```

---

## 2) Backend (Node.js + Socket.IO + TypeScript)

Navigate to server folder and install packages:

```bash
cd server
npm install
```

**Start the Socket.IO server:**

```bash
npm start
```

Server listens on **http://localhost:5000** with Socket.IO ready for real-time connections.

---

## 3) Frontend (React + Syncfusion Grid + Custom Binding)

Navigate to client folder and install packages:

```bash
cd ../client
npm install
```

**Start the React application:**

```bash
npm run dev
```

Navigate to `http://localhost:5173`.

### Grid architecture:

- **Reads**: `dataStateChange → socket.emit('readData')` → Server processes with DataManager → Returns `{ result, count }`
- **CRUD**: `dataSourceChanged → socket.emit('crudAction')` → Server mutates data → Broadcasts `dataChanged` to ALL clients
- **Real-Time Sync**: Server broadcasts trigger automatic `grid.refresh()` on all connected clients

The client uses Socket.IO emit with acknowledgment callbacks to send Grid state and receive processed data including:

- `skip`, `take` (paging)
- `sorted` (multi-column sorting)
- `where` (filter predicates with AND/OR logic)
- `search` (toolbar search across multiple fields)

---

## Project Layout

| File/Folder | Purpose |
|-------------|---------|
| `server/src/server.ts` | Socket.IO server with connection handling & event listeners |
| `server/src/types.ts` | TypeScript interfaces for type safety |
| `server/src/data.json` | Sample employee data (in-memory store) |
| `client/src/App.tsx` | React component with Socket.IO integration & Grid |
| `client/src/App.css` | Component styles with real-time indicators |
| `client/src/index.css` | Syncfusion Material 3 theme imports |
| `client/src/main.tsx` | React app entry point |

---

## Common Tasks

### Add
1. Toolbar → **Add**
2. Fill employee details → **Save**  
   Grid triggers `dataSourceChanged → socket.emit('crudAction', { action: 'insert' })`  
   Server broadcasts `dataChanged` → All clients refresh instantly

### Edit
1. Select row → **Edit**
2. Modify fields → **Update**  
   Grid triggers `socket.emit('crudAction', { action: 'update' })`  
   Server broadcasts → All clients see changes

### Delete
1. Select row → **Delete**
2. Confirm  
   Grid triggers `socket.emit('crudAction', { action: 'remove' })`  
   Server broadcasts → All clients refresh

### Filtering / Searching / Sorting
- Excel filter menu with complex predicates (AND/OR logic)
- Search bar queries multiple fields with OR logic
- Multi-column sorting with direction indicators
- All operations processed server-side using Syncfusion DataManager

---

## Real-Time Sync Demonstration

**Open `http://localhost:5173` in two browser tabs side-by-side:**

1. In **Tab 1**: Add a new employee record
2. In **Tab 2**: Watch the grid refresh automatically with the new record
3. Notice the **⚡ Clients synced** indicator appears on both tabs
4. **👥 User count** updates when tabs connect/disconnect

**Key Socket.IO Events:**

- `connect` → Client establishes WebSocket connection
- `readData` → Client requests data with grid state
- `crudAction` → Client performs insert/update/delete
- `dataChanged` → Server broadcasts to all clients (triggers refresh)
- `clientCount` → Server sends updated connection count
- `disconnect` → Client closes connection

---

## Troubleshooting

**Socket.IO connection issues**
- Ensure server is running on `http://localhost:5000`
- Check browser console for connection errors
- Verify CORS is properly configured in server

**Grid not refreshing on other tabs**
- Confirm `dataChanged` event listener is registered
- Check that server is broadcasting after CRUD operations
- Verify `gridRef.current?.refresh()` is called in the event handler

**Initial data not loading**
- Ensure `dataStateChange` is called in socket `connect` handler
- Check that socket connection is established before loading data
- Verify `dataStateChange` dependency in `useEffect` includes callback

**Excel filter not working**
- Ensure filter requests check for `filterchoicerequest`, `filterSearchBegin`, `stringfilterrequest`
- These requests should call `dataSource(result)` callback instead of setting `grid.dataSource`
- Server must return plain array for filter choices, not `{ result, count }` format

**Timeout errors**
- Default timeout is 10 seconds in `socketEmit` helper
- Increase timeout for slower networks
- Check server is responding with acknowledgment callback

---

## Architecture Overview

**Why Socket.IO?**

Socket.IO provides **persistent bidirectional communication** between server and clients:
- **Traditional REST**: Client polls server repeatedly or manually refreshes
- **Socket.IO**: Server pushes updates instantly to all connected clients

**Data Flow:**

1. **User Action** (add/edit/delete in Tab 1)
2. **Client Emits** → `socket.emit('crudAction', data, ack)`
3. **Server Processes** → Mutates in-memory data
4. **Server Broadcasts** → `io.emit('dataChanged')` to **ALL** clients
5. **All Clients Receive** → Execute `gridRef.current?.refresh()`
6. **Tab 2 Updates** → Sees changes instantly without user action

**Benefits:**
- **Zero polling**: No repeated HTTP requests
- **Instant updates**: Sub-second latency across clients
- **Scalable**: WebSocket connections are lightweight
- **Collaborative**: Multiple users see same data in real-time
