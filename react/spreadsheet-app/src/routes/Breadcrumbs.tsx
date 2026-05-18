import { Link } from 'react-router-dom'

type Props = {
  items: Array<{ label: string; to?: string }>
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav className="breadcrumbs">
      {items.map((item, i) => (
        <span key={i}>
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
          {i < items.length - 1 && <span className="crumb-sep"> → </span>}
        </span>
      ))}
    </nav>
  )
}
