export interface ExpenseRecord {
  expenseId: string;
  employeeName: string;
  employeeEmail: string;
  employeeAvatarUrl?: string;
  department: string;
  category: string;
  description?: string;
  amount: number;
  taxPct: number;
  totalAmount: number;
  expenseDate: string;
  paymentMethod: string;
  currency: string;
  reimbursementStatus: 'Submitted' | 'Under Review' | 'Approved' | 'Paid' | 'Rejected';
  isPolicyCompliant: boolean;
  tags: string[];
}


export interface ExpenseArgs<K extends keyof ExpenseRecord = 'expenseId'> {
  key: ExpenseRecord[K];
  keyColumn?: K;
  value: Partial<Omit<ExpenseRecord, 'expenseId'>>;
}

// Leaf predicate
export interface FilterPredicate {
  field: string;
  operator: string;
  value: any;
  ignoreCase?: boolean;
  ignoreAccent?: boolean; 
}

// Block (composite) predicate
export interface FilterBlock {
  condition?: 'and' | 'or';
  field: string;
  value: string;
  ignoreAccent?: boolean;
  operator: string;
  ignoreCase?: boolean; 
  isComplex?: boolean;  
  predicates: (FilterPredicate | FilterBlock)[];
}

export interface AvatarEntry {
  FileName: string;
  Base64Data: string;
};

export interface ExpenseInput {
  expenseId: string;     
  employeeName: string;
  employeeEmail: string;
  employeeAvatarUrl: string;
  department: string;
  category: string;
  description: string;
  receiptUrl: string;
  amount: number;
  taxPct: number;
  totalAmount: number;
  expenseDate: string;
  paymentMethod: string;
  currency: string;
  reimbursementStatus: string;
  isPolicyCompliant: boolean;
  tags: string[];
}

export interface SortParam {
  name: string;
  direction: 'asc' | 'desc' | string; 
}

export interface DataManagerInput {
  skip: number
  take: number
  group: string[]
  sorted?: string | SortParam[];  
  search?: string ; 
  where: string      
  requiresCounts: boolean
  aggregates: string[]
  params: string
}

export interface GetExpensesArgs {
  datamanager: DataManagerInput;
}
