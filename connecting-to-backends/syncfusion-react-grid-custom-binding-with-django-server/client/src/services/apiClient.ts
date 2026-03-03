// api/services/apiClient.ts
import { DataUtil } from '@syncfusion/ej2-data';
import type { DataStateChangeEventArgs } from '@syncfusion/ej2-react-grids';

const API_BASE_URL = 'http://localhost:8000/api';

const request = async <T = unknown>(path: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
};

// Keep ":" unencoded in the final query string (DevTools readability)
const keepColonsReadable = (qs: string): string => qs.replace(/%3A/gi, ':');

// Flatten nested predicates
const flatten = (items: Predicate[] = []): Predicate[] =>
  items.flatMap((p) => (p.predicates?.length ? flatten(p.predicates) : [p]));

// DRF operator suffix map (non-date multi-select fields still use these)
const OP_SUFFIX: Record<string, string> = {
  contains: '__icontains',
  startswith: '__istartswith',
  endswith: '__iendswith',
  greaterthan: '__gt',
  greaterthanorequal: '__gte',
  lessthan: '__lt',
  lessthanorequal: '__lte',
};

// Your three date columns are always treated as multi-select
const dateFields = new Set(['borrowed_date', 'expected_return_date', 'actual_return_date']);

// Normalize any date-like into YYYY-MM-DD (UTC), safe against TZ offsets
const toDay = (v: unknown): string | null => {
  if (v == null) return null;
  const d = typeof v === 'string' || v instanceof Date ? new Date(v as any) : null;
  return d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : null;
};

const buildFilterParams = (predicates: Predicate[] | undefined, params: URLSearchParams) => {
  if (!predicates?.length) return;

  // Collectors
  const equalsByField = new Map<string, string[]>();         // non-date equals -> later field / field__in
  const daySetByDateField = new Map<string, Set<string>>();  // date fields -> set of YYYY-MM-DD

  const addDay = (field: string, v: unknown) => {
    const day = toDay(v);
    if (!day) return;
    const set = daySetByDateField.get(field) ?? new Set<string>();
    set.add(day);
    daySetByDateField.set(field, set);
  };

  for (const p of flatten(predicates)) {
    const field = p.field;
    if (!field || p.value === undefined || p.value === null) continue;

    const op = String(p.operator || 'equal').toLowerCase();

    // Handling for date fields
    if (dateFields.has(field)) {
      if (Array.isArray(p.value)) {
        for (const v of p.value) addDay(field, v);
      } else if (op === 'equal' || op === 'lessthan') {
        addDay(field, p.value);
      }
      // Skip emitting any other operators for these fields.
      continue;
    }

    // Non-date fields
    if (Array.isArray(p.value)) {
      if (op === 'equal') {
        const list = equalsByField.get(field) ?? [];
        list.push(...p.value.map(String));
        equalsByField.set(field, list);
      } else {
        params.set(`${field}__in`, p.value.map(String).join(','));
      }
      continue;
    }

    if (op === 'equal') {
      const list = equalsByField.get(field) ?? [];
      list.push(String(p.value));
      equalsByField.set(field, list);
      continue;
    }

    const suffix = OP_SUFFIX[op];
    if (suffix) params.set(`${field}${suffix}`, String(p.value));
  }

  // Emit equals as field or field__in for non-date fields
  for (const [field, values] of equalsByField.entries()) {
    params.set(values.length === 1 ? field : `${field}__in`, values.join(','));
  }

  // Emit <date_field>__in for date multi-select
  for (const [field, set] of daySetByDateField.entries()) {
    if (set.size) params.set(`${field}__in`, [...set].join(','));
  }
};

// Builds DRF query params from Syncfusion Grid state.
export const buildQueryParams = (state: DataStateChangeEventArgs): URLSearchParams => {
  const params = new URLSearchParams();
  const take = state.take ?? 10;
  const skip = state.skip ?? 0;
  const page = Math.floor(skip / take) + 1;

  params.set('page', String(page));
  params.set('page_size', String(take));

  const sorted = (state.sorted || []) as SortDescriptor[];
  if (sorted.length) {
    params.set(
      'ordering',
      sorted.map((s) => (s.direction === 'descending' ? `-${s.name}` : s.name)).join(',')
    );
  }

  const search = (state.search || []) as SearchDescriptor[];
  if (search.length) params.set('search', search.map((s) => s.key).join(' '));

  buildFilterParams(state.where as Predicate[] | undefined, params);

  return params;
};

/** Fetch lending records using DRF pagination format. **/
export const fetchLendings = async (state: DataStateChangeEventArgs) => {
  const query = keepColonsReadable(buildQueryParams(state).toString());
  const res = await request<{ result?: LendingRecord[]; count: number }>(`/lendings/?${query}`);

  return {
    result: (DataUtil as any).parse.parseJson(res.result) ?? [],
    count: res.count ?? 0,
  };
};

/** CRUD **/
export const createLending = (payload: LendingRecord) =>
  request<LendingRecord>('/lendings/', { method: 'POST', body: JSON.stringify(payload) });

export const updateLending = (payload: LendingRecord) =>
  request<LendingRecord>(`/lendings/${payload.record_id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteLending = (recordId: number) =>
  request<void>(`/lendings/${recordId}/`, { method: 'DELETE' });

/** Types */
export interface LendingRecord {
  record_id: number;
  isbn_number: string;
  book_title: string;
  author_name: string;
  genre: string;
  borrower_name: string;
  borrower_email: string;
  borrowed_date: string;
  expected_return_date: string;
  actual_return_date?: string | null;
  lending_status: string;
}

interface SortDescriptor {
  name: string;
  direction: 'ascending' | 'descending';
}

interface SearchDescriptor {
  key: string;
}

interface Predicate {
  field?: string;
  operator?: string;
  value?: unknown;
  predicates?: Predicate[];
  condition?: 'and' | 'or';
}