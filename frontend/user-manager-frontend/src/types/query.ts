export const QueryOperator = {
    EQUAL: "EQUAL",
    NOT_EQUAL: "NOT_EQUAL",
    GREATER_THAN: "GREATER_THAN",
    LESS_THAN: "LESS_THAN",
    GREATER_OR_EQUAL: "GREATER_OR_EQUAL",
    LESS_OR_EQUAL: "LESS_OR_EQUAL",
    CONTAINS: "CONTAINS",
    STARTS_WITH: "STARTS_WITH",
    ENDS_WITH: "ENDS_WITH",
    IN_SET: "IN_SET",
    NOT_IN_SET: "NOT_IN_SET",
    IS_NULL: "IS_NULL",
    IS_NOT_NULL: "IS_NOT_NULL",
    BETWEEN: "BETWEEN",
} as const;

export type QueryOperator = (typeof QueryOperator)[keyof typeof QueryOperator];

export interface FilterCondition {
    operator: QueryOperator;
    value: unknown;
}

export interface Search {
    and?: Record<string, FilterCondition>;
    or?: Record<string, FilterCondition>;
}

export interface OrderInfo {
    order: "ASC" | "DESC" | string;
    isJson?: boolean;
    sqlQuery?: string;
}

export interface Pagination {
    length: number;
    page: number;
}

export interface JoinCondition {
    field: string;
    alias?: string;
}

export interface QueryFilter {
    pagination?: Pagination;
    filters?: Record<string, unknown>;
    search?: Search;
    orderBy?: Record<string, OrderInfo>;
    with?: string[];
    select?: string[];
    join?: JoinCondition[];
}

export interface SearchResponse<T> {
    items: T[];
    total: number;
}
