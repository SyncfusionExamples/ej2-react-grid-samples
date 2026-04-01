import { DataManager, Query, Predicate } from '@syncfusion/ej2-data';
import { Server, Socket } from 'socket.io';
import http from 'http';
import rawData from './data.json';
import type { Employee, WhereDescriptor, SearchDescriptor, SortDescriptor, ReadParams, CrudBody } from './types';

// ─── In-memory data store ─────────────────────────────────────────────────────
let employees: Employee[] = [...(rawData as Employee[])];
let nextEmployeeID = Math.max(...employees.map(e => +e.EmployeeID.split('-')[1]), 1000) + 1;

// ─── Standalone HTTP server (no Express) + Socket.IO ─────────────────────────
const server = http.createServer();

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Recursively builds a Syncfusion Predicate tree from a UrlAdaptor WhereDescriptor (handles nested AND/OR groups)
function buildFilterPredicate(desc: WhereDescriptor): Predicate {
  if (desc.isComplex && desc.predicates?.length) {
    const [first, ...rest] = desc.predicates.map(buildFilterPredicate);
    return rest.reduce(
      (acc, p) => (desc.condition === 'or' ? Predicate.or(acc, p) : Predicate.and(acc, p)),
      first
    );
  }
  return new Predicate(desc.field ?? '', desc.operator ?? 'equal', desc.value as string | number | boolean, desc.ignoreCase !== false);
}

// Builds an OR predicate across all search fields for the toolbar search key
function applySearch(query: Query, search: SearchDescriptor[]): Query {
  if (!search.length) return query;
  const { fields, operator, key, ignoreCase } = search[0];
  const [first, ...rest] = fields.map(f => new Predicate(f, operator, key, ignoreCase));
  return query.where(rest.reduce((acc, p) => Predicate.or(acc, p), first));
}

// ANDs each column/Excel filter group predicate onto the query
function applyFilter(query: Query, where: WhereDescriptor[]): Query {
  return where.reduce((q, group) => q.where(buildFilterPredicate(group)), query);
}

// Chains sortBy for each descriptor to support multi-column sorting
function applySort(query: Query, sorted: SortDescriptor[]): Query {
  return sorted.reduce((q, s) => q.sortBy(s.name, s.direction), query);
}

// Clones the base query and applies skip/take for paging
function applyPage(query: Query, skip: number, take: number): Query {
  return query.clone().skip(skip).take(take);
}

// Orchestrates search → filter → sort → count → page; returns { result, count } or plain array based on requiresCounts
function processData(data: Employee[], params: ReadParams): { result: Employee[]; count: number } | Employee[] {
  const dm = new DataManager(data as object[]);
  let q = new Query();

  // Search
  if (params.search) {
    const s: SearchDescriptor[] = typeof params.search === 'string' ? JSON.parse(params.search) : params.search;
    if (s.length) q = applySearch(q, s);
  }

  // Filter
  if (params.where) {
    const w: WhereDescriptor[] = typeof params.where === 'string' ? JSON.parse(params.where) : params.where;
    if (w.length) q = applyFilter(q, w);
  }

  // Sort
  if (params.sorted) {
    const s: SortDescriptor[] = typeof params.sorted === 'string' ? JSON.parse(params.sorted) : params.sorted;
    if (s.length) q = applySort(q, s);
  }

  // Count
  const count = (dm.executeLocal(q) as Employee[]).length;

  // Page
  const skip = parseInt(String(params.skip ?? 0), 10) || 0;
  const take = parseInt(String(params.take ?? 10), 10) || 10;
  const result = dm.executeLocal(applyPage(q, skip, take)) as Employee[];

  return params.requiresCounts ? { result, count } : result;
}

// ─── Socket.IO — all data operations ─────────────────────────────────────────
io.on('connection', (socket: Socket) => {
  const clientCount = io.engine.clientsCount;
  console.log(`[Socket.IO] Client connected:    ${socket.id}  (total: ${clientCount})`);
  io.emit('clientCount', clientCount);

  // ── READ ────────────────────────────────────────────────────────────────────
  // Client emits 'readData' with grid state params; server replies via ack callback
  socket.on('readData', (params: ReadParams, ack: (data: unknown) => void) => {
    const result = processData(employees, { ...params, requiresCounts: true });
    ack(result);
  });

  // ── CRUD ────────────────────────────────────────────────────────────────────
  // Client emits 'crudAction' with action + payload; server mutates store and
  // broadcasts specific changes to OTHER connected clients (not the sender)
  socket.on('crudAction', (body: CrudBody & { currentPage: number }, ack: (data: unknown) => void) => {
    const { action, value, key, added, changed, deleted, currentPage } = body;

    // INSERT
    if (action === 'insert' && value) {
      const newRecord = { ...value, EmployeeID: `EMP-${nextEmployeeID++}` };
      employees.push(newRecord);
      // Broadcast only the added record to other clients
      socket.broadcast.emit('dataChanged', { added: newRecord, count: employees.length });
      ack({ result: newRecord, added, changed, deleted, count: employees.length });
      return;
    }

    // UPDATE
    if (action === 'update' && value) {
      const idx = employees.findIndex(e => e.EmployeeID === value.EmployeeID);
      if (idx !== -1) {
        employees[idx] = { ...employees[idx], ...value };
        // Broadcast only the edited record to other clients
        socket.broadcast.emit('dataChanged', { edited: employees[idx], count: employees.length });
      }
      ack({ result: value, added, changed, deleted, count: employees.length });
      return;
    }

    // DELETE
    if (action === 'remove') {
      const removeId = key !== undefined ? key : value?.EmployeeID;
      employees = employees.filter(e => e.EmployeeID !== removeId);
      // Broadcast only the deleted ID to other clients
      socket.broadcast.emit('dataChanged', { deleted: { deletedRecordsPage: currentPage }, count: employees.length });
      ack({ result: value, added, changed, deleted, count: employees.length });
      return;
    }

    ack({ result: value, added, changed, deleted, count: employees.length });
  });

  socket.on('disconnect', () => {
    const remaining = io.engine.clientsCount;
    console.log(`[Socket.IO] Client disconnected: ${socket.id}  (total: ${remaining})`);
    io.emit('clientCount', remaining);
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.IO ready for real-time connections`);
});
