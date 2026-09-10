/**
 * Utility functions for formatting data
 * TypeScript version with proper type annotations
 */
/**
 * Format number as currency (USD)
 */
export declare const formatCurrency: (value: number) => string;
/**
 * Format number with thousand separators
 */
export declare const formatNumber: (value: number) => string;
/**
 * Format date to readable format
 */
export declare const formatDate: (dateString: string | Date) => string;
/**
 * Get category color/badge style
 */
export declare const getCategoryColor: (category: string) => string;
/**
 * Get status color
 */
export declare const getStatusColor: (status: string) => string;
/**
 * Calculate progress percentage for stock
 */
export declare const calculateStockPercentage: (stock: number, maxStock?: number) => number;
/**
 * Truncate text to specified length
 */
export declare const truncateText: (text: string, maxLength?: number) => string;
/**
 * Sort descriptor interface
 */
interface SortDescriptor {
    field: string;
    direction: 'asc' | 'desc';
}
/**
 * Parse sorting information from DataGrid state
 */
export declare const parseSortingState: (sortDescriptor: SortDescriptor[] | undefined) => SortDescriptor[];
/**
 * Filter descriptor interface
 */
interface FilterDescriptor {
    field?: string;
    operator?: string;
    value?: unknown;
    filters?: FilterDescriptor[];
    logic?: 'and' | 'or';
}
/**
 * Parse filtering information from DataGrid state
 */
export declare const parseFilteringState: (filterDescriptor: FilterDescriptor | undefined) => FilterDescriptor[];
export {};
