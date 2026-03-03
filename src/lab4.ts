export type Transform<T> = (data: T[]) => T[];

export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;

export type Sort<T> = <K extends keyof T>(key: K) => Transform<T>;

export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
};

export type GroupBy<T> = <K extends keyof T>(key: K) => (data: T[]) => Group<T, K>[];

export type GroupTransform<T, K extends keyof T> = (
  groups: Group<T, K>[]
) => Group<T, K>[];

export type Having<T> = <K extends keyof T>(
  predicate: (group: Group<T, K>) => boolean
) => GroupTransform<T, K>;

type AnyStep = (data: unknown[]) => unknown[];

// вариант 1: только обычные Transform<T> (where, sort, ...)
export function query<T>(...steps: Transform<T>[]): Transform<T>;

// вариант 2: обычные шаги + groupBy + шаги по группам (having, ...)
export function query<T, K extends keyof T>(
  ...steps: [
    ...Transform<T>[],
    (data: T[]) => Group<T, K>[],
    ...GroupTransform<T, K>[]
  ]
): (data: T[]) => Group<T, K>[];

// реализация
export function query(...steps: AnyStep[]) {
  return (data: unknown[]) => steps.reduce((acc, step) => step(acc), data);
}