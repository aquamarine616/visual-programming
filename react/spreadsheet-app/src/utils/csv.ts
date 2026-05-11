import { cellKey } from './cellRef'

export function exportToCSV(cells: any, rows: number, cols: number) {
  let text = ''
  for (let r = 0; r < rows; r++) {
    let rowArr = []
    for (let c = 0; c < cols; c++) {
      let val = cells[cellKey(r, c)]
      if (!val) val = ''
      
      if (val.includes(',') || val.includes('"')) {
        val = '"' + val.replace(/"/g, '""') + '"'
      }
      rowArr.push(val)
    }
    text += rowArr.join(',') + '\n'
  }
  return text
}

export function exportToJSON(cells: any, rows: number, cols: number) {
  let arr = []
  for (let r = 0; r < rows; r++) {
    let rowArr = []
    for (let c = 0; c < cols; c++) {
      let val = cells[cellKey(r, c)]
      if (!val) val = ''
      rowArr.push(val)
    }
    arr.push(rowArr)
  }
  return JSON.stringify(arr, null, 2)
}

export function importFromCSV(text: string) {
  let lines = text.split('\n')
  let cells: any = {}
  let maxCols = 0
  let rowCount = 0

  for (let r = 0; r < lines.length; r++) {
    let line = lines[r].trim()
    if (line.length === 0) continue
    
    let data = line.split(',')
    
    if (data.length > maxCols) {
      maxCols = data.length
    }
    
    for (let c = 0; c < data.length; c++) {
      let val = data[c]
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1)
      }
      if (val !== '') {
        cells[cellKey(rowCount, c)] = val
      }
    }
    rowCount++
  }
  
  return { cells: cells, rows: rowCount, cols: maxCols }
}

export function downloadFile(filename: string, content: string, type: string) {
  let blob = new Blob([content], { type: type })
  let url = URL.createObjectURL(blob)
  let link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}