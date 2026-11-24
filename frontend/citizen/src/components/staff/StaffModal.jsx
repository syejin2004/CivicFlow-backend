// 직원용 범용 모달 컴포넌트
export default function StaffModal({ title, onClose, children, footer }) {
  const handleOverlay = (e) => { if (e.target===e.currentTarget) onClose() }
  return (
    <div
      style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,.4)',
        zIndex:300, display:'flex', alignItems:'center', justifyContent:'center'
      }}
      onClick={handleOverlay}
    >
      <div className="sf-modal" style={{width:'auto',minWidth:360}}>
        <div className="sf-modal-head">
          <span>{title}</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="sf-modal-body">{children}</div>
        {footer && <div className="sf-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
