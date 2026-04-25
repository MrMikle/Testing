export type SortInfo = {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
};

export type PageableInfo = {
    pageNumber: number;
    pageSize: number;
    sort: SortInfo;
    offset: number;
    paged: boolean;
    unpaged: boolean;
};

export type Page<T> = {
    content: T[];
    pageable: PageableInfo;
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: SortInfo;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
};
