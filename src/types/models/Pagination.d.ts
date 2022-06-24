interface Pagination<T extends Array<unknown>> {
  total: number;
  totalCount: number;
  list: T;
}

export default Pagination;
