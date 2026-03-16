import { describe, it, expect } from "vitest";
import { query, where, sort, groupBy, having, sortGroups, type Group } from "../src/lab5";

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

describe("lab5: query runtime", () => {
  it("where* -> sort*", () => {
    const pipeline = query<User>(
      where("name", "John"),
      where("surname", "Doe"),
      sort("age")
    );

    expect(pipeline(users)).toEqual([
      { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
      { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
      { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
    ]);
  });

  it("where* -> groupBy -> having* -> sortGroups*", () => {
    const pipeline = query<User, "city">(
      where("surname", "Doe"),
      groupBy("city"),
      having((g: Group<User, "city">) => g.items.length > 1),
      sortGroups("city")
    );

    expect(pipeline(users)).toEqual([
      {
        key: "LA",
        items: [
          { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
          { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
        ],
      },
      {
        key: "NY",
        items: [
          { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
          { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
        ],
      },
    ]);
  });
});