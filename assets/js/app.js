(() => {
 const currentScript=document.currentScript;
 const scriptBase=currentScript&&currentScript.src?currentScript.src:new URL('assets/js/app.js',document.baseURI).href;
 const moduleFiles={terminal:'terminal.js',storage:'storage.js',flow:'flow.js',monitor:'monitor.js',network:'network.js',extensions:'extensions.js'};
 function ensureModule(name,file){
  window.NEXUSModules=window.NEXUSModules||{};
  if(window.NEXUSModules[name])return Promise.resolve();
  return new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src=new URL(file,scriptBase).href;
   script.onload=()=>window.NEXUSModules&&window.NEXUSModules[name]?resolve():reject(new Error(name+' loaded but did not register'));
   script.onerror=()=>reject(new Error('Could not load '+file));
   document.head.appendChild(script);
  });
 }
 Promise.all(Object.entries(moduleFiles).map(([name,file])=>ensureModule(name,file)))
 .then(startApp)
 .catch(error=>{console.error('[NEXUS] Module startup failed:',error);startApp(error);});
 function startApp(loadError){
  const $=s=>document.querySelector(s),clock=$('#clock'),dateLabel=$('#dateLabel'),breadcrumb=$('#breadcrumb'),sidebar=$('#sidebar'),overview=$('#overview'),modulePage=$('#modulePage');
  const info={flow:['Flow Studio','⌘','Design visual processes.'],storage:['Storage','▤','Manage local records.'],network:['Network','⌁','Explore connectivity.'],monitor:['Monitor','◷','Review system events.'],terminal:['Terminal','›_','Command interface.'],extensions:['Extensions','⊞','Manage extensions.']};
  function updateTime(){const n=new Date();if(clock)clock.textContent=n.toLocaleTimeString([],{hour12:false});if(dateLabel)dateLabel.textContent=n.toLocaleDateString([],{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).toUpperCase();}
  function navigate(page){
   const home=page==='overview'||!info[page];
   overview.hidden=!home;modulePage.hidden=home;
   if(!home){
    breadcrumb.textContent=info[page][0];
    if(page!=='extensions'&&window.NEXUSExtensionEnabled&&!window.NEXUSExtensionEnabled(page)){modulePage.innerHTML='<div class="eyebrow">MODULE DISABLED</div><h1>'+info[page][0]+'</h1><p class="subtitle">This module is disabled in the Extension Manager.</p><button class="primary-button" id="openExtensions">OPEN EXTENSION MANAGER</button>';modulePage.querySelector('#openExtensions').onclick=()=>navigate('extensions');document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.page===page));sidebar.classList.remove('open');return;}
    const mod=window.NEXUSModules&&window.NEXUSModules[page];
    if(mod){modulePage.innerHTML=mod.render();try{mod.mount(modulePage);}catch(error){console.error('[NEXUS] '+page+' mount failed:',error);modulePage.innerHTML='<div class="eyebrow">MODULE ERROR</div><h1>'+info[page][0]+'</h1><p class="subtitle">The module loaded, but could not start.</p><pre class="module-error"></pre>';modulePage.querySelector('.module-error').textContent=String(error);}}
    else{modulePage.innerHTML='<div class="eyebrow">MODULE UNAVAILABLE</div><h1>'+info[page][0]+'</h1><p class="subtitle">NEXUS could not load this module.</p><p class="module-error"></p>';modulePage.querySelector('.module-error').textContent=loadError?String(loadError):'Module registration is missing. Check the browser console and network requests.';}
   }else breadcrumb.textContent='Overview';
   document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.page===(home?'overview':page)));
   sidebar.classList.remove('open');
   const target=home?'#overview':'#'+page;if(location.hash!==target)history.replaceState(null,'',target);
  }
  document.querySelectorAll('[data-page]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();navigate(a.dataset.page);}));
  window.addEventListener('hashchange',()=>{const page=location.hash.slice(1);navigate(info[page]?page:'overview');});
  window.NEXUSNavigate=navigate;
  $('#mobileMenu').addEventListener('click',()=>sidebar.classList.toggle('open'));
  $('#themeButton').addEventListener('click',()=>{document.body.classList.toggle('light-mode');const light=document.body.classList.contains('light-mode');$('#themeButton').textContent=light?'☀':'◐';addEvent('Visual mode changed',light?'Light appearance enabled':'Dark appearance enabled','info');});
  function addEvent(title,detail,type){const list=$('#eventList');if(!list)return;const d=document.createElement('div');d.className='event-item';d.innerHTML='<span class="event-icon '+type+'">↗</span><span><b></b><small></small></span><time>JUST NOW</time>';d.querySelector('b').textContent=title;d.querySelector('small').textContent=detail;list.prepend(d);while(list.children.length>5)list.lastElementChild.remove();}
  $('#clearLog').addEventListener('click',()=>{$('#eventList').replaceChildren();addEvent('Activity log cleared','No previous events are displayed','info');});
  updateTime();setInterval(updateTime,1000);
  const first=location.hash.slice(1);navigate(info[first]?first:'overview');
 }
})();