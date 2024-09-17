export type ObjectToTuple<T> = {
  [K in keyof T]: T[K];
}[keyof T][];
