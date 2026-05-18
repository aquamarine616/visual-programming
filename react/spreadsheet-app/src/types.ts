export type CellValue = string

export type Cells = { [key: string]: CellValue }

export type CellFormat = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  bgColor?: string
  textColor?: string
  align?: 'left' | 'center' | 'right'
  numberFormat?: 'number' | 'percent' | 'currency' | 'date'
}

export type CellFormats = { [key: string]: CellFormat }

export type Doc = {
  id: string
  userId: string
  name: string
  rows: number
  cols: number
  cells: Cells
  cellFormats: CellFormats
  colWidths: { [col: number]: number }
  rowHeights: { [row: number]: number }
  createdAt: number
  updatedAt: number
}

export type User = {
  id: string
  name: string
  email: string
  createdAt: number
}

export type Tokens = {
  accessToken: string
  refreshToken: string
}
