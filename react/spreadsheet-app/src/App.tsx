import { useAppSelector } from './store/hooks'
import Dashboard from './components/Dashboard'
import Editor from './components/Editor'

export default function App() {
  const activeId = useAppSelector((s: { documents: { activeId: any } }) => s.documents.activeId)
  return activeId ? <Editor /> : <Dashboard />
}