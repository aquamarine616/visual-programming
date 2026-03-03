import { describe, it, expect } from "vitest";
import type {
  Where,
  Sort,
  Group,
  GroupBy,
  Having,
} from "../src/lab4";
import { query } from "../src/lab4";

type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};

const users: User[] = [
  { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
  { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
  { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
  { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
];

// === реализации ===

const where: Where<User> =
  (key, value) =>
  (data) =>
    data.filter((item) => item[key] === value);

const sort: Sort<User> =
  (key) =>
  (data) =>
    [...data].sort((a, b) => {
      const av = a[key];
      const bv = b[key];

      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });

const groupBy: GroupBy<User> =
  (key) =>
  (data) =>
    Object.values(
      data.reduce((acc, item) => {
        const bucketKey = String(item[key]);

        if (!acc[bucketKey]) {
          acc[bucketKey] = {
            key: item[key],
            items: [],
          } as Group<User, typeof key>;
        }

        acc[bucketKey].items.push(item);
        return acc;
      }, {} as Record<string, Group<User, typeof key>>)
    );

const having: Having<User> =
  (predicate) =>
  (groups) =>
    groups.filter(predicate);

// === тесты ===

describe("lab4: query (фильтрация и сортировка)", () => {
  it("where + where + sort", () => {
    const search = query<User>(
      where("name", "John"),
      where("surname", "Doe"),
      sort("age")
    );

    const result = search(users);

    expect(result).toEqual([
      { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
      { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
      { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
    ]);
  });
});

describe("lab4: query (группировка и фильтр по группам)", () => {
  it("groupBy + having возвращает только группы, прошедшие predicate", () => {
    const groupAndFilter = query<User>(
      groupBy("city"),
      having((group) => group.items.length > 1)
    );

    const grouped = groupAndFilter(users);

    expect(grouped).toEqual([
      {
        key: "NY",
        items: [
          { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
          { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
        ],
      },
      {
        key: "LA",
        items: [
          { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
          { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
        ],
      },
    ]);
  });
});

describe("lab4: query (комбинированный конвейер)", () => {
  it("where + groupBy + having", () => {
    const pipeline = query<User>(
      where("surname", "Doe"),
      groupBy("city"),
      having((group) => group.items.some((u) => u.age > 34))
    );

    const res = pipeline(users);

    expect(res).toEqual([
      {
        key: "LA",
        items: [
          { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
          { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
        ],
      },
    ]);
  });
});