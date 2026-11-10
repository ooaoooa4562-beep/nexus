(() => {
  const KEY='nexus.settings.v1';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}').extras||{};}catch{return{};}};
  let prefs=read(), timers=new Map(), observer;
  const enabled=k=>prefs[k]===true;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const style=document.createElement('style');
  style.id='nexus-preference-runtime';
  style.textContent=`
    body.nexus-high-contrast{--line:#8292ad!important;--muted:#c5d1e5!important;--subtle:#aebbd2!important}
    body.nexus-large-text{font-size:17px}body.nexus-large-text .subtitle,body.nexus-large-text .setting-row span{font-size:1.08em}
    body.nexus-focus-ring :focus-visible{outline:3px solid var(--accent)!important;outline-offset:3px!important}
    body.nexus-underline-links a{text-decoration:underline!important}
    body.nexus-performance-mode *{scroll-behavior:auto!important;transition-duration:.08s!important;animation-duration:.08s!important}
    body.nexus-compact-toolbar .ide-editor-toolbar,body.nexus-compact-toolbar .n3d-toptools{min-height:25px;height:25px}
    .nexus-pref-hidden{display:none!important}.nexus-pref-sticky{position:sticky;top:0;z-index:4}
    .nexus-pref-minimap{position:absolute;right:3px;top:5px;width:70px;height:120px;opacity:.55;pointer-events:none;overflow:hidden;border-left:1px solid var(--line);font:3px/4px monospace;white-space:pre-wrap;color:var(--accent);z-index:5}
    .nexus-pref-axis{position:absolute;left:10px;bottom:10px;z-index:5;padding:5px 8px;background:#101827bb;border:1px solid #64748b;border-radius:4px;color:#dbeafe;font:10px monospace}
    .nexus-pref-stats{position:absolute;left:10px;top:10px;z-index:5;padding:5px 8px;background:#101827bb;color:#dbeafe;font:10px monospace}
    .nexus-pref-warning{padding:7px 10px;margin:6px 0;border:1px solid #d69a42;border-radius:5px;color:#e8c27d;font-size:11px}
    .nexus-pref-timestamp{color:var(--subtle);font:9px monospace;margin-right:8px}
    .nexus-pref-hint{font:10px monospace;color:var(--muted);padding:5px 8px;border-top:1px solid var(--line)}
    .nexus-pref-outline{outline:2px solid var(--accent)!important;outline-offset:2px}
    .nexus-pref-wire-label{font:9px monospace;color:var(--muted)}
    .nexus-pref-muted-motion *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
    .nexus-pref-dyslexia{font-family:Arial,sans-serif!important;letter-spacing:.025em!important;line-height:1.65!important}
    .nexus-pref-token{filter:blur(5px);transition:filter .15s}.nexus-pref-token:hover{filter:none}
  `;
  document.head.append(style);
  const setTimer=(id,fn,ms)=>{clearInterval(timers.get(id));if(enabled(id))timers.set(id,setInterval(fn,ms));else timers.delete(id);};
  const notify=(text)=>{let n=$('.nexus-pref-warning');if(!n){n=document.createElement('div');n.className='nexus-pref-warning';($('.workspace-content')||document.body).prepend(n);}n.textContent=text;};
  const editor=()=>{try{return window.ace&&document.getElementById('codeEditor')?ace.edit('codeEditor'):null;}catch{return null;}};
  const applyEditor=()=>{
    const ed=editor();if(!ed)return;
    ed.renderer.setShowGutter(enabled('editorLineNumbers'));
    ed.session.setUseWrapMode(enabled('editorWordWrap'));
    ed.setOption('displayIndentGuides',enabled('editorIndentGuides'));
    ed.setOption('highlightActiveLine',enabled('editorBracketPairs'));
    ed.setOption('showInvisibles',enabled('editorInlineHints'));
    ed.setOption('scrollPastEnd',enabled('editorStickyScroll') ? 0.5 : 0);
    ed.setOption('enableBasicAutocompletion',enabled('editorInlineHints'));
    ed.setOption('enableLiveAutocompletion',enabled('editorInlineHints'));
    let mini=$('.nexus-pref-minimap',document.getElementById('codeEditor')?.parentElement||document);
    if(enabled('editorMinimap')&&!mini){mini=document.createElement('pre');mini.className='nexus-pref-minimap';(document.getElementById('codeEditor')?.parentElement||document.body).append(mini);}
    if(mini){mini.hidden=!enabled('editorMinimap');if(!mini.hidden)mini.textContent=(ed.getValue()||'').split('\\n').slice(0,80).map(x=>x.slice(0,40)).join('\\n');}
  };
  const applyTerminal=()=>{
    const out=$('#terminalOutput'),input=$('#terminalInput');
    if(out){out.classList.toggle('nexus-pref-muted-motion',!enabled('terminalCursorBlink'));let hint=$('.nexus-pref-hint',out.parentElement);if(enabled('terminalCommandHints')&&!hint){hint=document.createElement('div');hint.className='nexus-pref-hint';hint.textContent='↑ / ↓ command history · type help for commands';out.after(hint);}if(hint)hint.hidden=!enabled('terminalCommandHints');}
    if(input){input.autocomplete=enabled('terminalAutoComplete')?'on':'off';input.spellcheck=enabled('terminalSyntax');}
    const clear=$('#termClearTop');if(clear&&!clear.dataset.prefBound){clear.dataset.prefBound='1';clear.addEventListener('click',e=>{if(!enabled('terminalConfirmClear'))return;if(!confirm('Clear terminal output?'))e.stopImmediatePropagation();},true);}
    if(out&&!out.dataset.prefCopy){out.dataset.prefCopy='1';out.addEventListener('mouseup',()=>{if(enabled('terminalCopyOnSelect')){const s=getSelection()?.toString();if(s)navigator.clipboard?.writeText(s).catch(()=>{});}});}
    if(enabled('terminalTimestamps')&&out&&!out.dataset.prefTime){out.dataset.prefTime='1';const mo=new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1&&n.classList.contains('term-line')&&!n.querySelector('.nexus-pref-timestamp')){const t=document.createElement('span');t.className='nexus-pref-timestamp';t.textContent=new Date().toLocaleTimeString();n.prepend(t);}})));mo.observe(out,{childList:true});}
  };
  const applyFlow=()=>{
    const stage=$('#flowStage')||$('.flow-stage')||$('.flow-canvas');
    if(stage){stage.classList.toggle('nexus-pref-grid',enabled('flowSnapGrid'));stage.style.backgroundSize=enabled('flowSnapGrid')?'20px 20px':'';stage.style.backgroundImage=enabled('flowSnapGrid')?'radial-gradient(#60708a55 1px,transparent 1px)':'';}
    const canvas=$('#flowCanvas')||stage;
    if(canvas){canvas.classList.toggle('nexus-pref-muted-motion',!enabled('flowAnimations'));$$('.flow-block,.block',canvas).forEach(b=>b.style.boxShadow=enabled('flowBlockShadows')?'0 5px 14px #0004':'none');}
    const output=$('#flowOutput')||$('#flowConsole');
    if(output&&!enabled('flowKeepOutput')){const lines=output.children;if(lines.length>100)while(output.children.length>100)output.firstElementChild.remove();}
    const search=$('#blockSearch');if(search)search.placeholder=enabled('flowMinimap')?'Search blocks · minimap enabled':'Search blocks…';
    if(!enabled('flowWireLabels'))$$('.flow-wire-label').forEach(x=>x.hidden=true);
  };
  const apply3D=()=>{
    const vp=$('#n3dViewport');if(!vp)return;
    const grid=$('#n3dGrid');if(grid&&grid.dataset.prefApplied!=='1'){grid.dataset.prefApplied='1';}
    const canvas=$('canvas',vp);if(canvas)canvas.style.imageRendering=enabled('threeAntialias')?'auto':'pixelated';
    const axis=$('.nexus-pref-axis',vp);if(enabled('threeAxisLabels')&&!axis){const a=document.createElement('div');a.className='nexus-pref-axis';a.textContent='X  RED  ·  Y  GREEN  ·  Z  BLUE';vp.append(a);}else if(axis)axis.hidden=!enabled('threeAxisLabels');
    let stats=$('.nexus-pref-stats',vp);if(enabled('threeShowStats')&&!stats){stats=document.createElement('div');stats.className='nexus-pref-stats';vp.append(stats);}if(stats){stats.hidden=!enabled('threeShowStats');stats.textContent='VIEWPORT · '+(canvas?'WEBGL':'STARTING')+' · '+($('#n3dObjectCount')?.textContent||'0 OBJECTS');}
    if(!enabled('threeShadows'))vp.classList.add('nexus-no-shadows');else vp.classList.remove('nexus-no-shadows');
    if(enabled('threeSelectionOutline'))$('#n3dSelected')?.classList.add('nexus-pref-outline');else $('#n3dSelected')?.classList.remove('nexus-pref-outline');
  };
  const applyStorage=()=>{
    const list=$('#storageList');if(!list)return;
    const rows=$$(':scope > *',list);
    if(enabled('storageSortFolders'))rows.sort((a,b)=>{const af=/folder/i.test(a.className+' '+a.textContent.slice(0,20)),bf=/folder/i.test(b.className+' '+b.textContent.slice(0,20));return Number(bf)-Number(af);}).forEach(x=>list.append(x));
    if(!enabled('storageFilePreviews'))$$('.storage-preview,.storage-record-preview',list).forEach(x=>x.hidden=true);
    const file=$('#storageFile');if(file)file.disabled=!enabled('storageSafeMode')?false:false;
    const importButton=$('#storageImport');if(importButton){importButton.disabled=!enabled('storageSafeMode');importButton.title=enabled('storageSafeMode')?'Import disabled by Storage Safe Mode':'Import JSON';}
    const removeButtons=$$('button',list).filter(b=>/delete|remove/i.test(b.textContent));removeButtons.forEach(b=>{if(!b.dataset.prefConfirm){b.dataset.prefConfirm='1';b.addEventListener('click',e=>{if(enabled('storageConfirmDelete')&&!confirm('Delete this storage record?')){e.preventDefault();e.stopImmediatePropagation();}},true);}});
  };
  const applyWorkspace=()=>{
    document.body.classList.toggle('nexus-compact-toolbar',enabled('workspaceCompactToolbar'));
    document.body.classList.toggle('nexus-focus-ring',enabled('accessibilityFocusRing'));
    document.body.classList.toggle('nexus-underline-links',enabled('accessibilityUnderlineLinks'));
    document.body.classList.toggle('nexus-dyslexia',enabled('accessibilityDyslexiaFont'));
    document.body.classList.toggle('nexus-performance-mode',enabled('advancedPerformanceMode'));
    if(enabled('accessibilityDyslexiaFont'))document.body.classList.add('nexus-pref-dyslexia');else document.body.classList.remove('nexus-pref-dyslexia');
    $('[data-nexus-original-title]').forEach(x=>{if(enabled('accessibilityTooltips')){x.title=x.dataset.nexusOriginalTitle;delete x.dataset.nexusOriginalTitle;}else{x.removeAttribute('title');}});if(!enabled('accessibilityTooltips'))$('[title]').forEach(x=>{x.dataset.nexusOriginalTitle=x.title;x.removeAttribute('title');});
    if(enabled('accessibilityKeyboardHints'))$$('.ide-shortcuts').forEach(x=>x.hidden=false);
    if(!enabled('accessibilityKeyboardHints'))$$('.ide-shortcuts').forEach(x=>x.hidden=true);
    if(enabled('accessibilityScreenReader'))$$('button:not([aria-label])').forEach(b=>{if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',b.textContent.trim().slice(0,80)||'Workspace action');});
    if(enabled('privacyMaskEmails'))$$('input[type=email]').forEach(x=>x.classList.add('nexus-pref-token'));else $$('input[type=email]').forEach(x=>x.classList.remove('nexus-pref-token'));
    if(enabled('securityWarnSecrets')){const ed=editor();if(ed&&!ed.__nexusSecretScan){ed.__nexusSecretScan=true;ed.session.on('change',()=>{if(/(gh[pousr]_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----|api[_-]?key\\s*[:=]\\s*['\"][^'\"]{12,})/i.test(ed.getValue()))notify('Security warning: the editor may contain a secret or API key. Do not commit credentials.');});}}
    if(enabled('securitySafeLinks'))$$('a[href^="http"]:not([rel~="noopener"])').forEach(a=>{a.rel='noopener noreferrer';a.target='_blank';});
    if(enabled('privacyLocalOnly')){document.body.dataset.localOnly='true';$$('#profileConnect,#profileGoogle,#emailLogin,#emailRegister').forEach(b=>b.disabled=true);}else{delete document.body.dataset.localOnly;$$('#profileConnect,#profileGoogle,#emailLogin,#emailRegister').forEach(b=>b.disabled=false);}
    const status=$('.network-badge');if(status)status.hidden=!enabled('networkStatusBadge');
  };
  const applyConfirmations=()=>{
    const pairs=[['securityConfirmOverwrite',/overwrite|replace/i,'Overwrite existing content?'],['githubConfirmPush',/save|push|commit/i,'Confirm sending these changes to GitHub?'],['githubConfirmDelete',/delete/i,'Delete this GitHub item?'],['workspaceConfirmClose',/close/i,'Close this workspace item?'],['privacyConfirmExternal',/external|open link/i,'Open this external destination?']];
    pairs.forEach(([key,re,message])=>$$('button').filter(b=>re.test(b.textContent)&&!b.dataset['pref_'+key]).forEach(b=>{b.dataset['pref_'+key]='1';b.addEventListener('click',e=>{if(enabled(key)&&!confirm(message)){e.preventDefault();e.stopImmediatePropagation();}},true);}));
  };
  const applyTimers=()=>{
    setTimer('editorAutoSave',()=>{const ed=editor();if(ed&&$('.ide-save-button')&&!$('.ide-save-button').disabled)$('.ide-save-button').click();},15000);
    setTimer('flowAutoSave',()=>$('#flowSave')?.click(),15000);
    setTimer('threeAutoSave',()=>$('#n3dSave')?.click(),20000);
    setTimer('githubAutoRefresh',()=>$('#ideRefresh')?.click(),60000);
    setTimer('workspaceAutoUpdate',()=>window.dispatchEvent(new CustomEvent('nexus:check-updates')),300000);
    setTimer('storageAutoBackup',()=>{try{const backup={createdAt:new Date().toISOString(),records:localStorage.getItem('nexus.storage.v1')};localStorage.setItem('nexus.storage.backup.latest',JSON.stringify(backup));}catch{}},60000);
  };
  const apply=()=>{
    prefs=read();
    document.body.classList.toggle('nexus-no-flash',enabled('accessibilityNoFlashing'));
    document.body.classList.toggle('nexus-high-contrast',enabled('accessibilityHighContrast'));
    document.body.classList.toggle('nexus-large-text',enabled('accessibilityLargeText'));
    document.body.classList.toggle('nexus-pref-muted-motion',enabled('accessibilityReduceMotion'));
    applyWorkspace();applyEditor();applyTerminal();applyFlow();apply3D();applyStorage();applyConfirmations();applyTimers();
    document.body.dataset.experimental=enabled('advancedBetaFeatures')?'on':'off';
    document.body.dataset.debug=enabled('advancedDebugOverlay')?'on':'off';
    document.body.dataset.verbose=enabled('advancedVerboseLogs')?'on':'off';
    if(enabled('advancedDevConsole')){let c=$('#nexusDevConsole');if(!c){c=document.createElement('pre');c.id='nexusDevConsole';c.style.cssText='position:fixed;right:8px;bottom:8px;z-index:99999;max-width:40vw;max-height:25vh;overflow:auto;background:#080d18eF;color:#9fe6b0;padding:8px;font:10px monospace;pointer-events:none';document.body.append(c);}c.textContent='NEXUS DEV CONSOLE\\n'+new Date().toLocaleTimeString()+' · '+performance.now().toFixed(0)+' ms';}else $('#nexusDevConsole')?.remove();
  };
  window.addEventListener('nexus:preferences',e=>{prefs=e.detail||read();apply();});
  window.addEventListener('nexus:theme',apply);
  window.addEventListener('nexus:motion-refresh',apply);
  observer=new MutationObserver(()=>{if(!document.body)return;applyEditor();applyTerminal();applyFlow();apply3D();applyStorage();applyConfirmations();});
  observer.observe(document.body,{childList:true,subtree:true});
  apply();
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&enabled('privacyClearOnExit')){sessionStorage.removeItem('nexus.temp.cache');}});
  document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key.toLowerCase()==='s'&&enabled('editorAutoSave')){const b=$('.ide-save-button');if(b&&!b.disabled){e.preventDefault();b.click();}}});
  document.addEventListener('input',e=>{if(e.target?.id==='terminalInput'&&enabled('securityWarnSecrets')&&/(gh[pousr]_[A-Za-z0-9_]{20,}|api[_-]?key\\s*[:=])/i.test(e.target.value))notify('Security warning: avoid entering access tokens or API keys in the terminal.');});
})();