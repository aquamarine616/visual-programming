# Табличный процессор

Учебный проект на React + TypeScript + Redux Toolkit + React Router.

## Запуск

```
npm install
npm run dev      # запуск в браузере на http://localhost:5173
npm run build    # сборка
npm test         # тесты (vitest)
```

## Маршруты

- `/` — редирект на `/dashboard`
- `/login` — вход (публичный)
- `/register` — регистрация (публичный)
- `/dashboard` — список своих документов (приватный)
- `/documents/:documentId` — редактор таблицы (приватный)
- `/profile` — профиль пользователя (приватный)
- остальное — страница 404

## Аутентификация

Mock-аутентификация в localStorage (без реального бэкенда):
- Регистрация: имя, email, пароль (≥ 8 символов)
- Вход: email и пароль
- Access Token — в памяти (15 минут)
- Refresh Token — в localStorage (7 дней)
- Автообновление Access Token при 401
- При попытке открыть документ другого пользователя — редирект на `/dashboard`

## Структура

```
src/
  store/
    index.ts                — configureStore, AppDispatch
    rootReducer.ts          — combineReducers, RootState
    hooks.ts                — useAppSelector, useAppDispatch
    authSlice.ts            — текущий пользователь, токены
    spreadsheetSlice.ts     — ячейки, форматы, выделение, Undo/Redo, clipboard
    documentsSlice.ts       — список документов, активный, thunks
    uiSlice.ts              — модалки, статус сохранения
    autosaveMiddleware.ts   — автосейв с дебаунсом 500мс
  api.ts                    — заглушка сервера (localStorage)
  auth.ts                   — login/register/refresh/updateProfile
  utils/
    formulas.ts             — SUM, AVERAGE, +, *
    csv.ts                  — экспорт/импорт CSV и JSON
    cellRef.ts              — A1, B2, ...
    numberFormat.ts         — форматирование числа, %, валюты, даты
    validation.ts           — валидация форм
  routes/
    AppLayout.tsx           — общий layout с шапкой
    ProtectedRoute.tsx      — приватный маршрут
    Breadcrumbs.tsx         — хлебные крошки
  pages/
    LoginPage.tsx
    RegisterPage.tsx
    DashboardPage.tsx
    SpreadsheetPage.tsx     — редактор + хоткеи + useBlocker
    ProfilePage.tsx
    NotFoundPage.tsx
  components/
    CreateDocModal.tsx      — модалка создания
    Sheet.tsx               — таблица с виртуализацией
    FormulaBar.tsx          — панель формул
    FormatToolbar.tsx       — кнопки форматирования
    ContextMenu.tsx         — контекстное меню
  __tests__/                — тесты на vitest + jsdom
```

## Горячие клавиши

- `Ctrl+S` — сохранить
- `Ctrl+Z` / `Ctrl+Y` — отменить / повторить
- `Ctrl+B` / `Ctrl+I` / `Ctrl+U` — жирный / курсив / подчёркнутый
- `Ctrl+C` / `Ctrl+X` / `Ctrl+V` — копировать / вырезать / вставить (с форматом)
- `Delete` / `Backspace` — очистить выделение
- `Ctrl+A` — выделить всё
- `Стрелки` — перемещение
- `Tab` / `Shift+Tab` — переход по столбцам
- `Enter` — следующая строка / войти в редактирование
- `Escape` — отмена редактирования
- Любая печатная клавиша — начать редактирование с этого символа
