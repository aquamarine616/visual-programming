export type Transform<I, O> = (data: I) => O;

export type WhereStep<T> = (<K extends keyof T>(key: K, value: T[K]) => Transform<T[], T[]>) & {
  readonly __kind: "where";
};

export const where = ((key: any, value: any) => {
  return (data: any[]) => data.filter((item) => item[key] === value);
}) as WhereStep<any>;

export type SortStep<T> = (<K extends keyof T>(key: K) => Transform<T[], T[]>) & {
  readonly __kind: "sort";
};

export const sort = ((key: any) => {
  return (data: any[]) =>
    [...data].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
}) as SortStep<any>;

export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
};

export type GroupByStep<T> = (<K extends keyof T>(key: K) => Transform<T[], Group<T, K>[]>) & {
  readonly __kind: "groupBy";
};

export const groupBy = ((key: any) => {
  return (data: any[]) =>
    Object.values(
      data.reduce((acc, item) => {
        const bucketKey = String(item[key]);

        if (!acc[bucketKey]) {
          acc[bucketKey] = {
            key: item[key],
            items: [],
          };
        }

        acc[bucketKey].items.push(item);
        return acc;
      }, {} as Record<string, { key: any; items: any[] }>)
    );
}) as GroupByStep<any>;

export type HavingStep<T> = (<K extends keyof T>(
  predicate: (group: Group<T, K>) => boolean
) => Transform<Group<T, K>[], Group<T, K>[]>) & {
  readonly __kind: "having";
};

export const having = ((predicate: any) => {
  return (groups: any[]) => groups.filter(predicate);
}) as HavingStep<any>;

export type GroupSortStep<T> = (<K extends keyof T>(key: K) => Transform<Group<T, K>[], Group<T, K>[]>) & {
  readonly __kind: "sort";
  readonly __scope: "group";
};

export const sortGroups = ((key: any) => {
  return (groups: any[]) =>
    [...groups].sort((a, b) => {
      const av = a.key;
      const bv = b.key;
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
}) as GroupSortStep<any>;

// вспомогательные типы “списков шагов”
type WhereList<T> = readonly ReturnType<WhereStep<T>>[];
type SortList<T> = readonly ReturnType<SortStep<T>>[];

type HavingList<T, K extends keyof T> = readonly ReturnType<HavingStep<T>>[];
type GroupSortList<T, K extends keyof T> = readonly ReturnType<GroupSortStep<T>>[];

// вариант 1: без группировки: where* -> sort*
export function query<T>(
  ...steps: [...WhereList<T>, ...SortList<T>]
): Transform<T[], T[]>;

// вариант 2: с группировкой: where* -> groupBy -> having* -> sortGroups* 
export function query<T, K extends keyof T>(
  ...steps: [
    ...WhereList<T>,
    ReturnType<GroupByStep<T>>,
    ...HavingList<T, K>,
    ...GroupSortList<T, K>
  ]
): Transform<T[], Group<T, K>[]>;

export function query(...steps: Array<(data: any) => any>) {
  return (data: any) => steps.reduce((acc, step) => step(acc), data);
}