(() => {
 const api=window.NEXUSModules=window.NEXUSModules||{},KEY='nexus.flow.scratch.v2';
 const defs=[
  {id:'flag',cat:'events',label:'when 🚩 clicked',kind:'hat'},
  {id:'key',cat:'events',label:'when key pressed',kind:'hat',field:'key',value:'space'},
  {id:'move',cat:'motion',label:'move steps',kind:'stack',field:'steps',value:'10'},
  {id:'turn',cat:'motion',label:'turn degrees ↻',kind:'stack',field:'degrees',value:'15'},
  {id:'goto',cat:'motion',label:'go to x y',kind:'stack',fields:[['x','0'],['y','0']]},
  {id:'say',cat:'looks',label:'say',kind:'stack',field:'text',value:'Hello!'},
  {id:'think',cat:'looks',label:'think',kind:'stack',field:'text',value:'Hmm...'},
  {id:'show',cat:'looks',label:'show',kind:'stack'},
  {id:'hide',cat:'looks',label:'hide',kind:'stack'},
  {id:'wait',cat:'control',label:'wait seconds',kind:'stack',field:'seconds',value:'1'},
  {id:'repeat',cat:'control',label:'repeat times',kind:'stack',field:'times',value:'3'},
  {id:'forever',cat:'control',label:'repeat forever',kind:'stack'},
  {id:'if',cat:'control',label:'if variable > value',kind:'stack',fields:[['variable','score'],['value','0']]},
  {id:'set',cat:'variables',label:'set variable to',kind:'stack',fields:[['variable','score'],['value','0']]},
  {id:'change',cat:'variables',label:'change variable by',kind:'stack',fields:[['variable','score'],['value','1']]},
  {id:'print',cat:'looks',label:'show variable',kind:'stack',field:'variable',value:'score'}
 ];
 const categories=[['events','Events'],['motion','Motion'],['looks','Looks'],['control','Control'],['variables','Variables']];
 const fresh=()=>[{id:'b'+Date.now(),type:'flag',fields:{}},{id:'b'+(Date.now()+1),type:'move',fields:{steps:'50'}},{id:'b'+(Date.now()+2),type:'say',fields:{text:'Hello, NEXUS!'}}];
 const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY));return Array.isArray(x)?x:fresh();}catch{return fresh();}};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 api.flow={
 render:()=>'<div class="eyebrow">NEXUS MODULE / 006</div><div class="module-title-row"><div><h1>Flow <span>Studio.</span></h1><p class="subtitle">A visual programming studio inspired by Scratch. Build programs by snapping blocks together.</p></div><span class="flow-badge">● BLOCK EDITOR</span></div><div class="scratch-toolbar"><div class="scratch-project"><span class="scratch-project-icon">✳</span><input id="projectName" value="My first project" aria-label="Project name"></div><div class="scratch-actions"><button class="secondary-button" id="flowNew">NEW</button><button class="secondary-button" id="flowSave">SAVE</button><button class="secondary-button" id="flowReset">RESET</button><button class="run-button" id="flowRun">▶ RUN</button><button class="stop-button" id="flowStop">■ STOP</button></div></div><div class="scratch-workbench"><aside class="scratch-categories" id="scratchCategories"></aside><section class="scratch-palette"><div class="scratch-panel-title"><b id="paletteTitle">EVENTS</b><small>DRAG OR CLICK TO ADD</small></div><div id="scratchPalette" class="scratch-palette-list"></div></section><section class="scratch-code-panel"><div class="scratch-panel-title"><b>CODE</b><small id="blockCount">0 BLOCKS</small></div><div id="scratchWorkspace" class="scratch-workspace"><div class="scratch-start">PROGRAM START</div><div id="scratchStack"></div><div class="scratch-drop-hint">Drop blocks here or click a block in the palette</div></div></section><section class="scratch-stage-panel"><div class="scratch-panel-title"><b>STAGE</b><small>360 × 260</small></div><div class="scratch-stage" id="scratchStage"><div class="stage-grid"></div><div class="stage-sprite" id="stageSprite">🐱</div><div class="stage-bubble" id="stageBubble" hidden></div></div><div class="stage-controls"><button id="stageReset">↺ RESET SPRITE</button><span id="stagePosition">x: 0&nbsp; y: 0</span></div><div class="scratch-console"><div class="scratch-panel-title"><b>OUTPUT</b><button id="clearOutput">CLEAR</button></div><div id="scratchOutput" class="scratch-output">Ready. Press RUN to execute your program.</div></div></section></div><div class="scratch-footer"><span><i></i> LOCAL PROJECT</span><span>Blocks are saved in this browser</span></div>',
 mount(root){
  let blocks=load(),category='events',running=false,stopFlag=false,x=0,y=0,angle=0,visible=true,variables={score:0};
  const $=s=>root.querySelector(s),stack=$('#scratchStack'),palette=$('#scratchPalette'),output=$('#scratchOutput'),sprite=$('#stageSprite'),bubble=$('#stageBubble');
  const log=s=>{const d=document.createElement('div');d.textContent=s;output.append(d);output.scrollTop=output.scrollHeight;};
  const save=()=>{localStorage.setItem(KEY,JSON.stringify(blocks));$('#blockCount').textContent=blocks.length+' BLOCKS';};
  const def=id=>defs.find(d=>d.id===id);
  function fieldInput(d,key,val){const input=document.createElement('input');input.value=val??'';input.dataset.field=key;input.setAttribute('aria-label',key);input.addEventListener('change',()=>{const b=blocks.find(v=>v.id===input.closest('.scratch-block').dataset.id);if(b){b.fields[key]=input.value;save();}});return input;}
  function renderPalette(){ $('#paletteTitle').textContent=categories.find(c=>c[0]===category)[1].toUpperCase();palette.replaceChildren();defs.filter(d=>d.cat===category).forEach(d=>{const b=document.createElement('button');b.className='code-block '+d.cat;b.draggable=true;b.textContent=d.label;const addFields=()=>{const o={};if(d.field)o[d.field]=d.value;if(d.fields)d.fields.forEach(([k,v])=>o[k]=v);if(d.id==='key')o.key='space';return o;};b.addEventListener('click',()=>{blocks.push({id:'b'+Date.now()+Math.random().toString(16).slice(2),type:d.id,fields:addFields()});save();renderStack();});b.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',JSON.stringify({palette:d.id,fields:addFields()}));e.dataTransfer.effectAllowed='copy';});palette.append(b);});}
  function makeBlock(b,index){const d=def(b.type);if(!d)return document.createElement('div');const el=document.createElement('div');el.className='code-block '+d.cat+' scratch-block';el.dataset.id=b.id;el.draggable=true;const label=document.createElement('span');label.textContent=d.label;el.append(label);
   const keys=d.field?[d.field]:d.fields?d.fields.map(f=>f[0]):d.id==='key'?['key']:[];
   keys.forEach(k=>{let inp;if(k==='key'){inp=document.createElement('select');['space','up','down','left','right','a','b','enter'].forEach(v=>{const op=document.createElement('option');op.value=v;op.textContent=v;inp.append(op);});inp.value=b.fields[k]||'space';}else inp=fieldInput(d,k,b.fields[k]??(d.fields&&d.fields.find(f=>f[0]===k)?.[1])??d.value);inp.className='block-input';inp.addEventListener('change',()=>{b.fields[k]=inp.value;save();});el.append(inp);});
   const tools=document.createElement('button');tools.className='block-delete';tools.textContent='×';tools.title='Delete block';tools.onclick=e=>{e.stopPropagation();blocks.splice(index,1);save();renderStack();};el.append(tools);
   el.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',JSON.stringify({move:b.id}));e.dataTransfer.effectAllowed='move';});el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('block-over');});el.addEventListener('dragleave',()=>el.classList.remove('block-over'));el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('block-over');const data=JSON.parse(e.dataTransfer.getData('text/plain')||'{}');if(data.move){const from=blocks.findIndex(v=>v.id===data.move);if(from<0)return;const [item]=blocks.splice(from,1);let to=blocks.findIndex(v=>v.id===b.id);if(from<to)to--;blocks.splice(Math.max(0,to),0,item);}else if(data.palette){blocks.splice(index,0,{id:'b'+Date.now(),type:data.palette,fields:data.fields||{}});}save();renderStack();});return el;
  }
  function renderStack(){stack.replaceChildren();blocks.forEach((b,i)=>stack.append(makeBlock(b,i)));$('#blockCount').textContent=blocks.length+' BLOCKS';$('.scratch-drop-hint').hidden=blocks.length>0;}
  const workspace=$('#scratchWorkspace');workspace.addEventListener('dragover',e=>{e.preventDefault();workspace.classList.add('workspace-over');});workspace.addEventListener('dragleave',()=>workspace.classList.remove('workspace-over'));workspace.addEventListener('drop',e=>{e.preventDefault();workspace.classList.remove('workspace-over');const d=JSON.parse(e.dataTransfer.getData('text/plain')||'{}');if(d.palette)blocks.push({id:'b'+Date.now(),type:d.palette,fields:d.fields||{}});else if(d.move){const i=blocks.findIndex(b=>b.id===d.move);if(i>=0){const [b]=blocks.splice(i,1);blocks.push(b);}}save();renderStack();});
  categories.forEach(([id,name])=>{const b=document.createElement('button');b.className='category-button '+id;b.textContent=name;b.onclick=()=>{category=id;root.querySelectorAll('.category-button').forEach(v=>v.classList.toggle('active',v===b));renderPalette();};$('#scratchCategories').append(b);});
  function updateSprite(){sprite.style.left='calc(50% + '+x+'px)';sprite.style.top='calc(50% - '+y+'px)';sprite.style.transform='translate(-50%,-50%) rotate('+angle+'deg)';sprite.style.display=visible?'grid':'none';$('#stagePosition').textContent='x: '+Math.round(x)+'  y: '+Math.round(y);}
  function resetSprite(){x=0;y=0;angle=0;visible=true;variables={score:0};bubble.hidden=true;updateSprite();}
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function execute(list,depth=0){if(depth>5)throw Error('Maximum loop depth reached');for(const b of list){if(stopFlag)return;const f=b.fields||{};switch(b.type){
   case 'flag':log('🚩 Program started');break;
   case 'key':log('⌨ Waiting for key: '+(f.key||'space')+' (simulated start)');break;
   case 'move':{const n=Number(f.steps)||0;x+=Math.cos(angle*Math.PI/180)*n;y+=Math.sin(angle*Math.PI/180)*n;updateSprite();log('Move '+n+' steps');break;}
   case 'turn':angle+=(Number(f.degrees)||0);updateSprite();log('Turn '+(f.degrees||0)+'°');break;
   case 'goto':x=Number(f.x)||0;y=Number(f.y)||0;updateSprite();log('Go to x: '+x+', y: '+y);break;
   case 'say':case 'think':bubble.textContent=(b.type==='think'?'💭 ':'')+(f.text||'');bubble.hidden=false;log((b.type==='say'?'Say: ':'Think: ')+(f.text||''));await wait(900);break;
   case 'show':visible=true;updateSprite();log('Show sprite');break;case 'hide':visible=false;updateSprite();log('Hide sprite');break;
   case 'wait':{const ms=Math.max(0,Math.min(10000,(Number(f.seconds)||0)*1000));log('Wait '+(ms/1000)+'s');await wait(ms);break;}
   case 'repeat':{const n=Math.max(0,Math.min(50,Math.floor(Number(f.times)||0)));log('Repeat '+n+' times');for(let i=0;i<n&&!stopFlag;i++)await execute(list.slice(list.indexOf(b)+1),depth+1);return;}
   case 'forever':log('Repeat forever (press STOP to end)');for(let i=0;i<100&&!stopFlag;i++)await execute(list.slice(list.indexOf(b)+1),depth+1);return;
   case 'set':variables[f.variable||'score']=Number(f.value)||0;log('Set '+(f.variable||'score')+' = '+variables[f.variable||'score']);break;
   case 'change':{const k=f.variable||'score';variables[k]=(Number(variables[k])||0)+(Number(f.value)||0);log('Change '+k+' → '+variables[k]);break;}
   case 'print':log((f.variable||'score')+' = '+(variables[f.variable||'score']??0));break;
   case 'if':{const k=f.variable||'score';if((Number(variables[k])||0)>Number(f.value||0)){log('Condition true: '+k+' > '+f.value);}else log('Condition false: '+k+' > '+f.value);break;}
  }await wait(180);}}
  async function run(){if(running)return;running=true;stopFlag=false;output.replaceChildren();resetSprite();$('#flowRun').disabled=true;log('NEXUS runtime initialized');try{await execute(blocks);if(!stopFlag)log('✓ Program finished successfully');else log('■ Program stopped');}catch(e){log('ERROR: '+e.message);}finally{running=false;$('#flowRun').disabled=false;}}
  $('#flowRun').onclick=run;$('#flowStop').onclick=()=>{stopFlag=true;log('Stop requested...');};$('#flowSave').onclick=()=>{save();log('✓ Project saved in this browser');};$('#flowReset').onclick=()=>{if(confirm('Reset the workspace to the starter program?')){blocks=fresh();save();renderStack();output.textContent='Starter program restored.';}};$('#flowNew').onclick=()=>{if(confirm('Create a new empty project?')){blocks=[];save();renderStack();$('#projectName').value='Untitled project';output.textContent='New project created.';}};$('#stageReset').onclick=resetSprite;$('#clearOutput').onclick=()=>output.replaceChildren();$('#projectName').addEventListener('change',()=>localStorage.setItem(KEY+'.name',$('#projectName').value));$('#projectName').value=localStorage.getItem(KEY+'.name')||'My first project';
  category='events';root.querySelector('.category-button.events').classList.add('active');renderPalette();renderStack();updateSprite();save();
 }
 };
})();