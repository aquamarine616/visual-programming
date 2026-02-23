export interface User {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
}

export function createUser(params: {
  id: number;
  name: string;
  email?: string;
  isActive?: boolean;
}): User {
  const { id, name, email, isActive = true } = params;

  return {
    id,
    name,
    email,
    isActive,
  };
}

export type Genre = "fiction" | "non-fiction";

export interface Book {
  title: string;
  author: string;
  year?: number;
  genre: Genre;
}

export function createBook(book: Book): Book {
  return { ...book };
}

export function calculateArea(shape: "circle", params: { radius: number }): number;
export function calculateArea(shape: "square", params: { side: number }): number;

export function calculateArea(
  shape: "circle" | "square",
  params: { radius?: number; side?: number }
): number {
  if (shape === "circle") {
    if (typeof params.radius !== "number") {
      throw new Error("Для окружности необходимо указать радиус");
    }
    return Math.PI * params.radius * params.radius;
  }

  if (typeof params.side !== "number") {
    throw new Error("Для квадрата должна быть указана сторона");
  }
  return params.side * params.side;
}

export type Status = "active" | "inactive" | "new";

export function getStatusColor(status: Status): string {
  switch (status) {
    case "active":
      return "green";
    case "inactive":
      return "gray";
    case "new":
      return "blue";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export type StringFormatter = (value: string, uppercase?: boolean) => string;

export const capitalizeFirst: StringFormatter = (value, uppercase = false) => {
  if (value.length === 0) return value;
  const result = value[0].toUpperCase() + value.slice(1);
  return uppercase ? result.toUpperCase() : result;
};

export const trimAndMaybeUppercase: StringFormatter = (value, uppercase = false) => {
  const trimmed = value.trim();
  return uppercase ? trimmed.toUpperCase() : trimmed;
};

export function getFirstElement<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[0] : undefined;
}

export interface HasId {
  id: number;
}

export function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}