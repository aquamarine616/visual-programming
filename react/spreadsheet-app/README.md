# Табличный процессор
 
Учебный проект на React + TypeScript + Redux Toolkit.
 
## Запуск
npm install
npm run dev


## Структура
src/ store/ index.ts — configureStore, AppDispatch rootReducer.ts — combineReducers, RootState hooks.ts — useAppSelector, useAppDispatch spreadsheetSlice.ts — ячейки, выделение, Undo/Redo documentsSlice.ts — список документов, активный, thunks uiSlice.ts — модалки, статус сохранения autosaveMiddleware.ts — middleware с дебаунсом 500мс api.ts — заглушка сервера (localStorage) utils/formulas.ts — SUM, AVERAGE, +, * utils/csv.ts — экспорт/импорт CSV и JSON utils/cellRef.ts — A1, B2, ... components/ Dashboard.tsx — список документов CreateDocModal.tsx — модалка создания Editor.tsx — редактор с автосохранением Sheet.tsx — таблица с виртуализацией FormulaBar.tsx — панель формул ContextMenu.tsx — контекстное меню tests/ — тесты на vitest + jsdom


## Горячие клавиши
- `Ctrl+S` — сохранить
- `Ctrl+Z` — отменить последнее изменение ячейки
- `Ctrl+Y` — повторить отменённое