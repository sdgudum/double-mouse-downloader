interface Pagination<T extends Array<unknown>> {
  currentPage: number;
  totalPage: number;
  totalCount: number;
  pageData: T;
}

export default Pagination;
