import { describe, it, expect, vi, beforeEach } from "vitest";

// заглушки для fs/promises
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { readFile, writeFile } from "node:fs/promises";
import { csvToJSON, formatCSVFileToJSONFile } from "../src/solution";

const readFileMock = vi.mocked(readFile);
const writeFileMock = vi.mocked(writeFile);

describe("lab3: csvToJSON", () => {
  it("парсит корректные строки CSV в массив объектов", () => {
    const res = csvToJSON(["p1;p2;p3;p4", "1;A;b;c", "2;B;v;d"], ";");
    expect(res).toEqual([
      { p1: 1, p2: "A", p3: "b", p4: "c" },
      { p1: 2, p2: "B", p3: "v", p4: "d" },
    ]);
  });

  it("кидает ошибку при пустом input", () => {
    expect(() => csvToJSON([], ";")).toThrow();
  });

  it("кидает ошибку при пустом delimiter", () => {
    expect(() => csvToJSON(["a;b", "1;2"], "")).toThrow();
  });

  it("кидает ошибку при неправильном числе колонок в строке", () => {
    expect(() => csvToJSON(["a;b", "1"], ";")).toThrow();
  });
});

describe("lab3: formatCSVFileToJSONFile", () => {
  beforeEach(() => {
    readFileMock.mockReset();
    writeFileMock.mockReset();
  });

  it("читает CSV, конвертирует через csvToJSON и пишет JSON", async () => {
    readFileMock.mockResolvedValue("p1;p2\n1;A\n2;B\n");

    await formatCSVFileToJSONFile("in.csv", "out.json", ";");

    expect(readFileMock).toHaveBeenCalledWith("in.csv", "utf-8");
    expect(writeFileMock).toHaveBeenCalledWith(
      "out.json",
      JSON.stringify([{ p1: 1, p2: "A" }, { p1: 2, p2: "B" }], null, 2),
      "utf-8"
    );
  });

  it("если readFile падает — пробрасывает ошибку и не пишет файл", async () => {
    readFileMock.mockRejectedValueOnce(new Error("read failed"));

    await expect(
      formatCSVFileToJSONFile("in.csv", "out.json", ";")
    ).rejects.toThrow("read failed");

    expect(writeFileMock).not.toHaveBeenCalled();
  });
});