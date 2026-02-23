import { describe, it, expect } from "vitest";
import {
  createUser,
  createBook,
  calculateArea,
  getStatusColor,
  capitalizeFirst,
  trimAndMaybeUppercase,
  getFirstElement,
  findById,
  type Book,
  type User,
} from "../src/solution";

describe("createUser", () => {
  it("по умолчанию ставит isActive=true", () => {
    const u = createUser({ id: 1, name: "Alexander" });
    expect(u).toEqual({ id: 1, name: "Alexander", isActive: true });
  });

  it("принимает email и isActive=false", () => {
    const u = createUser({
      id: 2,
      name: "Maria",
      email: "Maria23@mail.com",
      isActive: false,
    });
    expect(u).toEqual({
      id: 2,
      name: "Maria",
      email: "Maria23@mail.com",
      isActive: false,
    });
  });
});

describe("createBook", () => {
  it("возвращает копию объекта книги (не тот же объект)", () => {
    const book: Book = {
      title: "Евгений Онегин",
      author: "А. С. Пушкин",
      year: 1831,
      genre: "fiction",
    };
    const created = createBook(book);

    expect(created).toEqual(book);
    expect(created).not.toBe(book);
  });

  it("работает без year", () => {
    const book: Book = {
      title: "Letters to Brother Theo",
      author: "Vincent van Gogh",
      genre: "non-fiction",
    };
    const created = createBook(book);

    expect(created).toEqual(book);
    expect(created.year).toBeUndefined();
  });
});

describe("calculateArea", () => {
  it("считает площадь круга", () => {
    const r = 10;
    const area = calculateArea("circle", { radius: r });
    expect(area).toBeCloseTo(Math.PI * r * r);
  });

  it("считает площадь квадрата", () => {
    const s = 5;
    const area = calculateArea("square", { side: s });
    expect(area).toBe(s * s);
  });

  it("кидает ошибку, если для circle не передан radius", () => {
    expect(() => calculateArea("circle", {} as any)).toThrow(
      "Для окружности необходимо указать радиус"
    );
  });

  it("кидает ошибку, если для square не передан side", () => {
    expect(() => calculateArea("square", {} as any)).toThrow(
      "Для квадрата должна быть указана сторона"
    );
  });
});

describe("getStatusColor", () => {
  it("возвращает правильные цвета", () => {
    expect(getStatusColor("active")).toBe("green");
    expect(getStatusColor("inactive")).toBe("gray");
    expect(getStatusColor("new")).toBe("blue");
  });
});

describe("StringFormatter implementations", () => {
  it("capitalizeFirst делает первую букву заглавной", () => {
    expect(capitalizeFirst("hello")).toBe("Hello");
  });

  it("capitalizeFirst с uppercase=true делает всё в верхний регистр", () => {
    expect(capitalizeFirst("hello", true)).toBe("HELLO");
  });

  it("capitalizeFirst корректно обрабатывает пустую строку", () => {
    expect(capitalizeFirst("")).toBe("");
  });

  it("trimAndMaybeUppercase обрезает пробелы", () => {
    expect(trimAndMaybeUppercase("   hi there   ")).toBe("hi there");
  });

  it("trimAndMaybeUppercase с uppercase=true делает верхний регистр", () => {
    expect(trimAndMaybeUppercase("   hi there   ", true)).toBe("HI THERE");
  });
});

describe("getFirstElement", () => {
  it("возвращает первый элемент массива", () => {
    expect(getFirstElement([10, 20, 30])).toBe(10);
    expect(getFirstElement(["a", "b", "c"])).toBe("a");
  });

  it("возвращает undefined для пустого массива", () => {
    expect(getFirstElement<number>([])).toBeUndefined();
  });
});

describe("findById", () => {
  it("находит элемент по id", () => {
    const users: User[] = [
      createUser({ id: 1, name: "Alexander" }),
      createUser({ id: 2, name: "Maria", isActive: false }),
    ];

    const found = findById(users, 2);
    expect(found?.id).toBe(2);
    expect(found?.name).toBe("Maria");
  });

  it("возвращает undefined, если не найдено", () => {
    const users: User[] = [createUser({ id: 1, name: "Alexander" })];
    expect(findById(users, 999)).toBeUndefined();
  });
});