(() => {
  if (window.NEXUSDialogs) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let active = null;
  const close = value => { if (!active) return; const {wrap,resolve,keydown} = active; document.removeEventListener('keydown',keydown,true); wrap.classList.remove('is-open'); setTimeout(()=>wrap.remove(),160); active=null; resolve(value); };
  const open = ({kind='info',title='NEXUS',message='',value='',placeholder='',confirmText='Continue',cancelText='Cancel',danger=false}) => new Promise(resolve => {
    if(active) close(null);
    const wrap=document.createElement('div'); wrap.className='nx-dialog-backdrop';
    const isInput=kind==='prompt';
    wrap.innerHTML='<section class="nx-dialog" role="dialog" aria-modal="true" aria-labelledby="nxDialogTitle"><div class="nx-dialog-top"><span class="nx-dialog-mark">N<span>.</span></span><span class="nx-dialog-kicker">NEXUS WORKSPACE</span><button class="nx-dialog-x" type="button" aria-label="Close">×</button></div><div class="nx-dialog-icon">'+(danger?'!':isInput?'✎':kind==='confirm'?'?':'i')+'</div><h2 id="nxDialogTitle">'+esc(title)+'</h2><p class="nx-dialog-message">'+esc(message)+'</p>'+(isInput?'<input class="nx-dialog-input" type="text" autocomplete="off" spellcheck="false" placeholder="'+esc(placeholder)+'" value="'+esc(value)+'">':'')+'<div class="nx-dialog-actions">'+(kind==='confirm'||isInput?'<button class="nx-dialog-cancel" type="button">'+esc(cancelText)+'</button>':'')+'<button class="nx-dialog-submit '+(danger?'is-danger':'')+'" type="button">'+esc(confirmText)+'</button></div></section>';
    document.body.append(wrap); const input=wrap.querySelector('.nx-dialog-input'),submit=wrap.querySelector('.nx-dialog-submit'),cancel=wrap.querySelector('.nx-dialog-cancel');
    active={wrap,resolve,keydown:null};
    submit.onclick=()=>close(isInput?(input.value):true); if(cancel)cancel.onclick=()=>close(isInput?null:false);wrap.querySelector('.nx-dialog-x').onclick=()=>close(isInput?null:false);
    wrap.addEventListener('mousedown',e=>{if(e.target===wrap)close(isInput?null:false);});
    active.keydown=e=>{if(e.key==='Escape'){e.preventDefault();close(isInput?null:false);}else if(e.key==='Enter'&&isInput){e.preventDefault();close(input.value);}};document.addEventListener('keydown',active.keydown,true);
    requestAnimationFrame(()=>{wrap.classList.add('is-open');(input||submit).focus();if(input)input.select();});
  });
  const api={
    prompt:(message,defaultValue='',options={})=>open({kind:'prompt',title:options.title||'Enter a value',message,value:defaultValue,placeholder:options.placeholder||'',confirmText:options.confirmText||'Continue',cancelText:options.cancelText||'Cancel'}),
    confirm:(message,options={})=>open({kind:'confirm',title:options.title||'Confirm action',message,confirmText:options.confirmText||'Confirm',cancelText:options.cancelText||'Cancel',danger:!!options.danger}),
    alert:(message,options={})=>open({kind:'alert',title:options.title||'Notice',message,confirmText:options.confirmText||'Got it'}),
    guard:(event,message,options={})=>{const el=event.currentTarget;if(el.dataset.nxDialogReplay==='1'){delete el.dataset.nxDialogReplay;return true;}event.preventDefault();event.stopImmediatePropagation();api.confirm(message,options).then(ok=>{if(ok){el.dataset.nxDialogReplay='1';el.click();}});return false;}
  };
  window.NEXUSDialogs=api;
})();