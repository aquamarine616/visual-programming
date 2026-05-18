import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <h2>404 — страница не найдена</h2>
      <p>Запрошенная страница не существует.</p>
      <Link to="/dashboard">На главную</Link>
    </div>
  )
}
