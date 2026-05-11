export default function ContextMenu(props: any) {
  function handleClose(e: any) {
    e.preventDefault()
    props.onClose()
  }

  return (
    <>
      <div 
        className="context-overlay" 
        onClick={props.onClose} 
        onContextMenu={handleClose} 
      />
      <div className="context-menu" style={{ left: props.x, top: props.y }}>
        {props.items.map((item: any, i: number) => (
          <div
            key={i}
            className="context-item"
            onClick={() => { 
              item.onClick()
              props.onClose() 
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </>
  )
}