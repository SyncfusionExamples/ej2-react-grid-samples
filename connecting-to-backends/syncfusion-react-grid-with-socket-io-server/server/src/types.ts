export interface Employee {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  Department: string;
  Salary: number;
  IsActive: boolean;
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
