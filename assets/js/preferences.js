(() => {
  const KEY='nexus.settings.v1';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}').extras||{};}catch{return{};}};
  let prefs=read(), timers=new Map(), observer;
  const enabled=k=>prefs[k]===true;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const style=document.createElement('style');
  style.id='nexus-preference-runtime';
  style.textContent=`
    .nexus-terminal-no-caret{caret-color:transparent!important}\n    body.nexus-high-contrast{--line:#8292ad!important;--muted:#c5d1e5!important;--subtle:#aebbd2!important}
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
    if(!ed.__nexusPasteFormat){ed.__nexusPasteFormat=true;ed.container.addEventListener('paste',e=>{if(!enabled('editorFormatOnPaste'))return;const value=e.clipboardData?.getData('text/plain');if(value==null)return;e.preventDefault();ed.insert(value.split('\\n').map(line=>line.replace(/[ \\t]+$/,'')).join('\\n'));},true);}
    let mini=$('.nexus-pref-minimap',document.getElementById('codeEditor')?.parentElement||document);
    if(enabled('editorMinimap')&&!mini){mini=document.createElement('pre');mini.className='nexus-pref-minimap';(document.getElementById('codeEditor')?.parentElement||document.body).append(mini);}
    if(mini){mini.hidden=!enabled('editorMinimap');if(!mini.hidden)mini.textContent=(ed.getValue()||'').split('\\n').slice(0,80).map(x=>x.slice(0,40)).join('\\n');}
  };
  const beep=()=>{try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=660;gain.gain.value=.035;osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.055);osc.onended=()=>ctx.close();}catch{}};
  const applyTerminal=()=>{
    const out=$('#terminalOutput'),input=$('#terminalInput'),form=$('#terminalForm');
    if(out){input?.classList.toggle('nexus-terminal-no-caret',!enabled('terminalCursorBlink'));let hint=$('.nexus-pref-hint',out.parentElement);if(enabled('terminalCommandHints')&&!hint){hint=document.createElement('div');hint.className='nexus-pref-hint';hint.textContent='↑ / ↓ command history · type help for commands';out.after(hint);}if(hint)hint.hidden=!enabled('terminalCommandHints');}
    if(input){input.autocomplete=enabled('terminalAutoComplete')?'on':'off';input.spellcheck=enabled('terminalSyntax');}
    const clear=$('#termClearTop');if(clear&&!clear.dataset.prefBound){clear.dataset.prefBound='1';clear.addEventListener('click',e=>{if(!enabled('terminalConfirmClear'))return;if(!NEXUSDialogs.guard(e,'Clear terminal output?',{title:'Clear terminal',danger:true,confirmText:'Clear'}))return;},true);}
    if(form&&!form.dataset.prefSound){form.dataset.prefSound='1';form.addEventListener('submit',()=>{if(enabled('terminalSound'))beep();});}
    if(input&&!input.dataset.prefHistory){input.dataset.prefHistory='1';input.addEventListener('keydown',e=>{if(!enabled('terminalHistory')&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.stopImmediatePropagation();e.preventDefault();}},true);}
    if(out&&!out.dataset.prefCopy){out.dataset.prefCopy='1';out.addEventListener('mouseup',()=>{if(enabled('terminalCopyOnSelect')){const s=getSelection()?.toString();if(s)navigator.clipboard?.writeText(s).catch(()=>{});}});}
    if(enabled('terminalTimestamps')&&out&&!out.dataset.prefTime){out.dataset.prefTime='1';const mo=new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1&&n.classList.contains('term-line')&&!n.querySelector('.nexus-pref-timestamp')){const t=document.createElement('span');t.className='nexus-pref-timestamp';t.textContent=new Date().toLocaleTimeString();n.prepend(t);}})));mo.observe(out,{childList:true});}
  };
  const applyFlow=()=>{
    const stage=$('#graphCanvas')||$('#flowStage')||$('.flow-stage')||$('.flow-canvas');
    if(stage){stage.classList.toggle('nexus-pref-grid',enabled('flowSnapGrid'));stage.style.backgroundSize=enabled('flowSnapGrid')?'20px 20px':'';stage.style.backgroundImage=enabled('flowSnapGrid')?'radial-gradient(#60708a55 1px,transparent 1px)':'';}
    const canvas=$('#flowCanvas')||stage;
    if(canvas){canvas.classList.toggle('nexus-pref-muted-motion',!enabled('flowAnimations'));$$('.flow-block,.block',canvas).forEach(b=>b.style.boxShadow=enabled('flowBlockShadows')?'0 5px 14px #0004':'none');}
    const output=$('#flowOutput')||$('#flowConsole');
    if(output&&!enabled('flowKeepOutput')){const lines=output.children;if(lines.length>100)while(output.children.length>100)output.firstElementChild.remove();}
    const search=$('#blockSearch');if(search)search.placeholder=enabled('flowMinimap')?'Search blocks · minimap enabled':'Search blocks…';
    if(stage&&enabled('flowAutoLayout')){const cards=$('.graph-node[data-id]',stage);if(cards.length&&!stage.dataset.autoLayoutDone){cards.forEach((card,i)=>{card.style.left=(50+(i%3)*260)+'px';card.style.top=(50+Math.floor(i/3)*150)+'px';});stage.dataset.autoLayoutDone='1';}}
    if(stage&&!enabled('flowAutoLayout'))delete stage.dataset.autoLayoutDone;
    if(stage){let mini=$('.nexus-flow-minimap',stage.parentElement||document);if(enabled('flowMinimap')&&!mini){mini=document.createElement('div');mini.className='nexus-flow-minimap';mini.style.cssText='position:absolute;right:12px;bottom:12px;width:125px;height:85px;background:#0b1220dd;border:1px solid #52617b;border-radius:6px;z-index:8;pointer-events:none;overflow:hidden';(stage.parentElement||stage).append(mini);}if(mini){mini.hidden=!enabled('flowMinimap');if(!mini.hidden){let data=null;try{data=JSON.parse(localStorage.getItem('nexus.flow.graph.v1')||'null');}catch{}mini.replaceChildren();(data?.nodes||[]).forEach(n=>{const dot=document.createElement('i');dot.style.cssText='position:absolute;width:5px;height:4px;border-radius:2px;background:#8eaaff;left:'+Math.min(95,Math.max(0,(n.x||0)/12))+'%;top:'+Math.min(90,Math.max(0,(n.y||0)/8))+'%';mini.append(dot);});}}}
    const wireSvg=$('#graphWires');if(wireSvg){$('.nexus-wire-label',wireSvg).forEach(x=>x.remove());if(enabled('flowWireLabels'))$('path.graph-wire-path',wireSvg).forEach((path,i)=>{const b=path.getBBox(),t=document.createElementNS('http://www.w3.org/2000/svg','text');t.classList.add('nexus-wire-label');t.setAttribute('x',String(b.x+b.width/2));t.setAttribute('y',String(b.y+b.height/2));t.setAttribute('fill','#b8c8e8');t.setAttribute('font-size','9');t.textContent='WIRE '+(i+1);wireSvg.append(t);});}
    
  };
  const apply3D=()=>{
    const vp=$('#n3dViewport');if(!vp)return;
    const grid=$('#n3dGrid');if(grid){grid.classList.toggle('active',enabled('threeGrid'));}
    const canvas=$('canvas',vp);if(canvas)canvas.style.imageRendering=enabled('threeAntialias')?'auto':'pixelated';
    const axis=$('.nexus-pref-axis',vp);if(enabled('threeAxisLabels')&&!axis){const a=document.createElement('div');a.className='nexus-pref-axis';a.textContent='X  RED  ·  Y  GREEN  ·  Z  BLUE';vp.append(a);}else if(axis)axis.hidden=!enabled('threeAxisLabels');
    let stats=$('.nexus-pref-stats',vp);if(enabled('threeShowStats')&&!stats){stats=document.createElement('div');stats.className='nexus-pref-stats';vp.append(stats);}if(stats){stats.hidden=!enabled('threeShowStats');stats.textContent='VIEWPORT · '+(canvas?'WEBGL':'STARTING')+' · '+($('#n3dObjectCount')?.textContent||'0 OBJECTS');}
    if(!enabled('threeShadows'))vp.classList.add('nexus-no-shadows');else vp.classList.remove('nexus-no-shadows');
    if(enabled('threeSelectionOutline'))$('#n3dSelected')?.classList.add('nexus-pref-outline');else $('#n3dSelected')?.classList.remove('nexus-pref-outline');
  };
  const applyStorage=()=>{
    const list=$('#storageList');if(!list)return;
    const rows=$$(':scope > *',list);
    if(enabled('storageRecentFiles'))rows.sort((a,b)=>String(b.querySelector('.storage-record-info span')?.textContent||'').localeCompare(String(a.querySelector('.storage-record-info span')?.textContent||'')));
    if(enabled('storageSortFolders'))rows.sort((a,b)=>{const af=/folder/i.test(a.className+' '+a.textContent.slice(0,20)),bf=/folder/i.test(b.className+' '+b.textContent.slice(0,20));return Number(bf)-Number(af);}).forEach(x=>list.append(x));
    $('.storage-record-info small').forEach(x=>x.hidden=!enabled('storageFilePreviews'));
    if(enabled('storageQuickActions'))$('.storage-record').forEach(row=>{if(row.querySelector('.nexus-copy-record'))return;const b=document.createElement('button');b.className='nexus-copy-record';b.type='button';b.textContent='COPY';b.onclick=()=>{const title=row.querySelector('b')?.textContent||'',value=row.querySelector('.storage-record-info small')?.textContent||'';navigator.clipboard?.writeText(title+'\\n'+value).then(()=>notify('Record copied to clipboard.')).catch(()=>notify('Clipboard access was blocked.'));};row.querySelector('.record-actions')?.prepend(b);});else $('.nexus-copy-record',list).forEach(x=>x.remove());
    const file=$('#storageFile');if(file)file.disabled=false;
    const importButton=$('#storageImport');if(importButton){importButton.disabled=false;importButton.title=enabled('storageSafeMode')?'Safe mode: imports require confirmation':'Import JSON';if(!importButton.dataset.prefSafe){importButton.dataset.prefSafe='1';importButton.addEventListener('click',e=>{if(enabled('storageSafeMode')&&!NEXUSDialogs.guard(e,'Safe Mode is enabled. Import data only if you trust this JSON file. Continue?',{title:'Import data',confirmText:'Import anyway'})){e.preventDefault();e.stopImmediatePropagation();}},true);}}
    const removeButtons=$$('button',list).filter(b=>/delete|remove/i.test(b.textContent));removeButtons.forEach(b=>{if(!b.dataset.prefConfirm){b.dataset.prefConfirm='1';b.addEventListener('click',e=>{if(enabled('storageConfirmDelete')&&!NEXUSDialogs.guard(e,'Delete this storage record?',{title:'Delete record',danger:true,confirmText:'Delete'})){e.preventDefault();e.stopImmediatePropagation();}},true);}});
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
    if(enabled('securityHideTokens'))$('input[type=password],input[data-secret]').forEach(x=>x.classList.add('nexus-pref-token'));else $('input[type=password],input[data-secret]').forEach(x=>x.classList.remove('nexus-pref-token'));
    if(enabled('privacyConfirmExternal'))$('a[href^="http"]:not([data-pref-external])').forEach(a=>{a.dataset.prefExternal='1';a.addEventListener('click',e=>{if(!NEXUSDialogs.guard(e,'Open external website: '+a.hostname+'?',{title:'External link',confirmText:'Open link'})){e.preventDefault();e.stopImmediatePropagation();}},true);});
    if(enabled('securitySafeLinks'))$$('a[href^="http"]:not([rel~="noopener"])').forEach(a=>{a.rel='noopener noreferrer';a.target='_blank';});
    if(enabled('privacyLocalOnly')){document.body.dataset.localOnly='true';$$('#profileConnect,#profileGoogle,#emailLogin,#emailRegister').forEach(b=>b.disabled=true);}else{delete document.body.dataset.localOnly;$$('#profileConnect,#profileGoogle,#emailLogin,#emailRegister').forEach(b=>b.disabled=false);}
    const status=$('.network-badge');if(status)status.hidden=!enabled('networkStatusBadge');
    const branch=$('#ideRepoLabel');if(branch)branch.dataset.showBranches=enabled('githubShowBranches')?'1':'0';
    if(enabled('workspaceRememberScroll')){const key='nexus.scroll.'+(location.hash||'#overview');const old=sessionStorage.getItem(key);if(old!==null&&document.activeElement===document.body)window.scrollTo(0,Number(old)||0);if(!window.__nexusScrollSave){window.__nexusScrollSave=true;window.addEventListener('scroll',()=>sessionStorage.setItem('nexus.scroll.'+(location.hash||'#overview'),String(window.scrollY)),{passive:true});}}
    if(enabled('advancedHardwareAcceleration'))document.body.dataset.gpuPreference='enabled';else delete document.body.dataset.gpuPreference;
    document.body.dataset.experimentalBlocks=enabled('advancedExperimentalBlocks')?'enabled':'disabled';document.body.dataset.experimental3d=enabled('advancedExperimental3D')?'enabled':'disabled';document.body.dataset.localTelemetry=enabled('advancedTelemetryLocal')?'enabled':'disabled';document.body.dataset.featureFlags=enabled('advancedFeatureFlags')?'enabled':'disabled';
  };
  const applyConfirmations=()=>{
    const pairs=[['securityConfirmOverwrite',/overwrite|replace/i,'Overwrite existing content?'],['githubConfirmPush',/save|push|commit/i,'Confirm sending these changes to GitHub?'],['githubConfirmDelete',/delete/i,'Delete this GitHub item?'],['workspaceConfirmClose',/close/i,'Close this workspace item?'],['privacyConfirmExternal',/external|open link/i,'Open this external destination?']];
    pairs.forEach(([key,re,message])=>$$('button').filter(b=>re.test(b.textContent)&&!b.dataset['pref_'+key]).forEach(b=>{b.dataset['pref_'+key]='1';b.addEventListener('click',e=>{if(enabled(key)&&!NEXUSDialogs.guard(e,message,{title:'Confirm action'})){e.preventDefault();e.stopImmediatePropagation();}},true);}));
  };
  const applyTimers=()=>{
    setTimer('editorAutoSave',()=>{const ed=editor();if(ed&&$('.ide-save-button')&&!$('.ide-save-button').disabled)$('.ide-save-button').click();},15000);
    setTimer('flowAutoSave',()=>$('#flowSave')?.click(),15000);
    setTimer('threeAutoSave',()=>$('#n3dSave')?.click(),20000);
    setTimer('githubAutoRefresh',()=>$('#ideRefresh')?.click(),60000);
    setTimer('workspaceAutoUpdate',()=>{if(enabled('workspaceNotifications'))notify('NEXUS workspace is up to date.');window.dispatchEvent(new CustomEvent('nexus:check-updates'));},300000);
    setTimer('storageAutoBackup',()=>{try{const backup={createdAt:new Date().toISOString(),records:localStorage.getItem('nexus.storage.v1')};localStorage.setItem('nexus.storage.backup.latest',JSON.stringify(backup));if(enabled('storageKeepVersions')){const history=JSON.parse(localStorage.getItem('nexus.storage.backups.v1')||'[]');history.push(backup);localStorage.setItem('nexus.storage.backups.v1',JSON.stringify(history.slice(-10)));}}catch{}},60000);
  };
  let idleTimer,lockTimer;
  const resetSecurityTimers=()=>{clearTimeout(idleTimer);clearTimeout(lockTimer);if(enabled('securitySessionTimeout'))idleTimer=setTimeout(()=>notify('Session has been idle for 15 minutes. Please review your workspace.'),15*60*1000);if(enabled('securityLockProfile'))lockTimer=setTimeout(()=>{let lock=$('#nexus-profile-lock');if(!lock){lock=document.createElement('div');lock.id='nexus-profile-lock';lock.style.cssText='position:fixed;inset:0;z-index:100000;background:#080d18ee;display:grid;place-items:center;color:white;font:14px sans-serif';lock.innerHTML='<div style="padding:28px;background:#172238;border:1px solid #506080;border-radius:12px;text-align:center"><h2>NEXUS LOCKED</h2><p>Workspace paused after inactivity.</p><button id="nexus-unlock" type="button">UNLOCK WORKSPACE</button></div>';document.body.append(lock);lock.querySelector('#nexus-unlock').onclick=()=>{lock.remove();resetSecurityTimers();};}} ,20*60*1000);};
  ['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,resetSecurityTimers,{passive:true}));
  const apply=()=>{
    prefs=read();
    document.body.classList.toggle('nexus-no-flash',enabled('accessibilityNoFlashing'));
    document.body.classList.toggle('nexus-high-contrast',enabled('accessibilityHighContrast'));
    document.body.classList.toggle('nexus-large-text',enabled('accessibilityLargeText'));
    document.body.classList.toggle('nexus-pref-muted-motion',enabled('accessibilityReduceMotion'));
    applyWorkspace();applyEditor();applyTerminal();applyFlow();apply3D();applyStorage();applyConfirmations();applyTimers();resetSecurityTimers();
    document.body.dataset.experimental=enabled('advancedBetaFeatures')?'on':'off';
    document.body.dataset.debug=enabled('advancedDebugOverlay')?'on':'off';
    document.body.dataset.verbose=enabled('advancedVerboseLogs')?'on':'off';
    if(enabled('advancedDevConsole')){let c=$('#nexusDevConsole');if(!c){c=document.createElement('pre');c.id='nexusDevConsole';c.style.cssText='position:fixed;right:8px;bottom:8px;z-index:99999;max-width:40vw;max-height:25vh;overflow:auto;background:#080d18eF;color:#9fe6b0;padding:8px;font:10px monospace;pointer-events:none';document.body.append(c);}c.textContent='NEXUS DEV CONSOLE\\n'+new Date().toLocaleTimeString()+' · '+performance.now().toFixed(0)+' ms';}else $('#nexusDevConsole')?.remove();
  };
  window.addEventListener('nexus:preferences',e=>{prefs=e.detail||read();apply();});
  window.addEventListener('nexus:theme',apply);
  window.addEventListener('nexus:motion-refresh',apply);
  observer=new MutationObserver(records=>{if(!document.body)return;const relevant=records.some(r=>{if(r.target.closest?.('.nexus-flow-minimap,.nexus-pref-axis,.nexus-pref-stats,.nexus-pref-minimap,.nexus-pref-warning,.nexus-copy-record,#graphWires,#storageList'))return false;return [...r.addedNodes].some(n=>n.nodeType===1&&!(n.classList&&[...n.classList].some(k=>k.startsWith('nexus-pref-'))));});if(relevant){applyWorkspace();applyEditor();applyTerminal();applyFlow();apply3D();applyStorage();applyConfirmations();}});
  observer.observe(document.body,{childList:true,subtree:true});
  apply();
  window.addEventListener('pagehide',()=>{if(enabled('privacyClearOnExit')){sessionStorage.removeItem('nexus.temp.cache');sessionStorage.removeItem('nexus.editor.tabs.v1');}});
  document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key.toLowerCase()==='s'&&enabled('editorAutoSave')){const b=$('.ide-save-button');if(b&&!b.disabled){e.preventDefault();b.click();}}});
  document.addEventListener('input',e=>{if(e.target?.id==='terminalInput'&&enabled('securityWarnSecrets')&&/(gh[pousr]_[A-Za-z0-9_]{20,}|api[_-]?key\\s*[:=])/i.test(e.target.value))notify('Security warning: avoid entering access tokens or API keys in the terminal.');});
})();