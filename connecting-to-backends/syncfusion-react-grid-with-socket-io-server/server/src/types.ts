export interface Employee {
  EmployeeID: string;        // e.g. "EMP-1001"
  EmployeeName: string;      // e.g. "Oscar King"
  Email: string;             // e.g. "oscar.king@example.com"
  Contact: string;           // e.g. "(711) 555-4444"
  Department: string;        // e.g. "Sales Representative"
  Salary: number;            // e.g. 100693
  JoinedDate: string;        // ISO string e.g. "2026-03-12T06:35:47.969Z"
  Location: string;          // e.g. "Albuquerque"
}

// Shape of a where-group / predicate object sent by the UrlAdaptor in the POST body
export interface WhereDescriptor {
  isComplex?: boolean;
  condition?: 'and' | 'or';
  predicates?: WhereDescriptor[];
  field?: string;
  operator?: string;
  value?: string | number | boolean | null;
  ignoreCase?: boolean;
  ignoreAccent?: boolean;
}

// Search descriptor — toolbar Search box sends one entry per search action
export interface SearchDescriptor {
  fields: string[];
  operator: string;
  key: string;
  ignoreCase: boolean;
  ignoreAccent: boolean;
}

export interface SortDescriptor {
  name: string;
  direction: 'ascending' | 'descending';
}

export interface ReadParams {
  requiresCounts?: boolean;
  skip?: string | number;
  take?: string | number;
  sorted?: string | SortDescriptor[];
  where?: string | WhereDescriptor[];
  search?: string | SearchDescriptor[];
  [key: string]: unknown;
}

export interface CrudBody {
  action: 'insert' | 'update' | 'remove' | 'batch';
  value?: Employee;
  key?: number;
  added?: Employee[];
  changed?: Employee[];
  deleted?: Employee[];
}

// Shape of the server's acknowledgment response to a crudAction event
export interface CrudAckResponse {
  result?: Employee;
  added?: Employee[];
  changed?: Employee[];
  deleted?: Employee[];
  count: number;
}
