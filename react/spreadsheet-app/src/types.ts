export type CellValue = string

export type Cells = { [key: string]: CellValue }

export type Doc = {
  id: string
  name: string
  rows: number
  cols: number
  cells: Cells
  colWidths: { [col: number]: number }
  rowHeights: { [row: number]: number }
  createdAt: number
  updatedAt: number
}