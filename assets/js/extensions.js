(() => {
 const api=window.NEXUSModules=window.NEXUSModules||{},KEY='nexus.extensions.disabled.v1';
 const catalog=[
 {id:'terminal',name:'Terminal',version:'0.6',description:'Command interface and GitHub repository tools.',icon:'›_',group:'SYSTEM TOOLS'},
 {id:'storage',name:'Storage',version:'0.5',description:'Local records with JSON import and export.',icon:'▤',group:'WORKSPACE'},
 {id:'flow',name:'Flow Studio',version:'0.5',description:'Visual node editor for reusable workflows.',icon:'⌘',group:'WORKSPACE'},
 {id:'monitor',name:'Monitor',version:'0.1',description:'Browser session diagnostics and event stream.',icon:'◷',group:'SYSTEM TOOLS'},
 {id:'network',name:'Network',version:'0.1',description:'Connectivity checks for the NEXUS API.',icon:'⌁',group:'SYSTEM TOOLS'},
 {id:'extensions',name:'Extensions',version:'0.1',description:'Manage built-in NEXUS modules.',icon:'⊞',group:'SYSTEM TOOLS',locked:true}
 ];
 const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[];}catch{return[];}};
 const write=a=>localStorage.setItem(KEY,JSON.stringify(a));
 window.NEXUSExtensionEnabled=id=>!read().includes(id);
 api.extensions={
 render:()=>'<div class="eyebrow">NEXUS MODULE / 007</div><div class="module-title-row"><div><h1>Extension <span>Manager.</span></h1><p class="subtitle">Enable or disable built-in NEXUS modules in this browser workspace.</p></div><span class="extensions-badge">LOCAL REGISTRY</span></div><div class="extension-summary"><div><small>AVAILABLE</small><b id="extAvailable">06</b></div><div><small>ENABLED</small><b id="extEnabled">06</b></div><div><small>DISABLED</small><b id="extDisabled">00</b></div></div><section class="panel extensions-panel"><div class="panel-heading"><div><div class="eyebrow">INSTALLED MODULES</div><h2>Extension library</h2></div><button class="text-button" id="extReset">RESET DEFAULTS</button></div><div class="extension-list" id="extList"></div></section><p class="monitor-note">This registry manages built-in NEXUS modules locally. Third-party JavaScript extensions are not enabled yet.</p>',
 mount(root){
  const list=root.querySelector('#extList');
  const draw=()=>{const disabled=read();root.querySelector('#extAvailable').textContent=String(catalog.length).padStart(2,'0');root.querySelector('#extEnabled').textContent=String(catalog.length-disabled.length).padStart(2,'0');root.querySelector('#extDisabled').textContent=String(disabled.length).padStart(2,'0');list.replaceChildren();catalog.forEach(item=>{const row=document.createElement('article'),icon=document.createElement('span'),info=document.createElement('div'),title=document.createElement('b'),meta=document.createElement('small'),desc=document.createElement('p'),control=document.createElement('div'),state=document.createElement('small'),button=document.createElement('button'),enabled=!disabled.includes(item.id);row.className='extension-row';icon.className='extension-icon';icon.textContent=item.icon;info.className='extension-info';title.textContent=item.name;meta.textContent=item.group+' · VERSION '+item.version;desc.textContent=item.description;info.append(title,meta,desc);control.className='extension-control';state.textContent=item.locked?'CORE':enabled?'ENABLED':'DISABLED';state.className=enabled?'good':'bad';button.className=enabled?'secondary-button':'primary-button';button.textContent=item.locked?'PROTECTED':enabled?'DISABLE':'ENABLE';button.disabled=!!item.locked;button.onclick=()=>{const next=read();write(next.includes(item.id)?next.filter(x=>x!==item.id):[...next,item.id]);draw();};control.append(state,button);row.append(icon,info,control);list.append(row);});};
  root.querySelector('#extReset').onclick=()=>{if(confirm('Enable all built-in modules?')){write([]);draw();}};draw();
 }
 };
})();