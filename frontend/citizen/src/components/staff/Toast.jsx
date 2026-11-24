export default function Toast({ msg }) {
  return (
    <div style={{
      position:'fixed', bottom:28, right:28,
      background:'#172238', color:'#fff',
      padding:'12px 20px', borderRadius:8,
      fontSize:13, fontWeight:600, zIndex:999,
      boxShadow:'0 4px 20px rgba(0,0,0,.2)',
      animation:'fadeIn .2s ease'
    }}>
      {msg}
    </div>
  )
}
