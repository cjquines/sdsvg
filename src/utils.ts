export type Enumify<T extends object> = T[keyof T];

export type Simplify<T> = { [K in keyof T]: T[K] } & {};
