// protections.ts
// Light-weight watermark + basic front-end deterrents

export function initProtections(label = 'CSK - Civil Services Kendra'){
  try{
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><text x='50%' y='50%' fill='rgba(0,0,0,0.06)' font-family='Arial' font-size='28' text-anchor='middle' transform='rotate(-25 300 200)'>${escapeXml(label)}</text></svg>`;
    const encoded = encodeURIComponent(svg);

    let el = document.getElementById('csk-watermark');
    if(!el){
      el = document.createElement('div');
      el.id = 'csk-watermark';
      el.className = 'watermark-overlay';
      document.body.appendChild(el);
    }
    (el as HTMLElement).style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encoded}")`;
    (el as HTMLElement).style.backgroundSize = '500px 300px';

    // disable right-click
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    // disable some hotkeys
    window.addEventListener('keydown', (e) => {
      if(e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') || (e.ctrlKey && e.key.toLowerCase() === 's') || (e.ctrlKey && e.key.toLowerCase() === 'p') || (e.ctrlKey && e.key.toLowerCase() === 'u')){
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }catch(err){
    console.warn('initProtections failed', err);
  }
}

function escapeXml(unsafe: string){
  return unsafe.replace(/[<>&"']/g, (c)=>{
    switch(c){
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return c;
    }
  });
}
