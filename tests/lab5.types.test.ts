import { describe, it, expectTypeOf } from "vitest";
import { query, where, sort, groupBy, having, sortGroups, type Group } from "../src/lab5";

type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};

describe("lab5: type-level строгий порядок операторов", () => {
  it("разрешает where* -> sort*", () => {
    const pipeline = query<User>(where("name", "John"), sort("age"));
    expectTypeOf(pipeline).toEqualTypeOf<(data: User[]) => User[]>();
  });

  it("разрешает where* -> groupBy -> having* -> sortGroups*", () => {
    const pipeline = query<User, "city">(
      where("surname", "Doe"),
      groupBy("city"),
      having((g: Group<User, "city">) => g.items.length > 0),
      sortGroups("city")
    );

    expectTypeOf(pipeline).toEqualTypeOf<(data: User[]) => Group<User, "city">[]>();
  });

  it("запрещает sort перед where", () => {
    // @ts-expect-error sort не может идти перед where
    query<User>(sort("age"), where("name", "John"));
  });

  it("запрещает having до groupBy", () => {
    // @ts-expect-error having не может идти до groupBy
    query<User>(
      where("name", "John"),
      having((g: any) => true)
    );
  });

  it("запрещает where после groupBy", () => {
    // @ts-expect-error после groupBy нельзя добавлять where
    query<User, "city">(
      groupBy("city"),
      where("name", "John")
    );
  });

  it("запрещает sort (по элементам) после groupBy (нужно sortGroups)", () => {
    // @ts-expect-error после groupBy сортировка должна быть sortGroups, а не sort
    query<User, "city">(
      where("surname", "Doe"),
      groupBy("city"),
      sort("age")
    );
  });
});