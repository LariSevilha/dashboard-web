declare module 'lodash' {
  const debounce: (func: (...args: any[]) => void, wait: number) => (...args: any[]) => void;
  export { debounce };
}