type Item = {
  label: string
  onClick: () => void
}

type Props = {
  x: number
  y: number
  items: Item[]
  onClose: () => void
}

export default function ContextMenu({ x, y, items, onClose }: Props) {
  return (
    <>
      <div className="context-overlay" onClick={onClose} onContextMenu={e => { e.preventDefault(); onClose() }} />
      <div className="context-menu" style={{ left: x, top: y }}>
        {items.map((item, i) => (
          <div
            key={i}
            className="context-item"
            onClick={() => { item.onClick(); onClose() }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </>
  )
}
