interface IService<T extends Record<string, (...any) => any>> {
  name: string;
  fns: T;
}

export default IService;
