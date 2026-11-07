(() => {
 const api=window.NEXUSModules=window.NEXUSModules||{},KEY='nexus.flow.graph.v1';
 const defs=[
  {id:'flag',cat:'events',label:'when 🚩 clicked',fields:[]},
  {id:'key',cat:'events',label:'when key pressed',fields:[['key','space']]},
  {id:'move',cat:'motion',label:'move steps',fields:[['steps','10']]},
  {id:'turn',cat:'motion',label:'turn degrees ↻',fields:[['degrees','15']]},
  {id:'goto',cat:'motion',label:'go to x / y',fields:[['x','0'],['y','0']]},
  {id:'say',cat:'looks',label:'say',fields:[['text','Hello!']]},
  {id:'think',cat:'looks',label:'think',fields:[['text','Hmm...']]},
  {id:'show',cat:'looks',label:'show',fields:[]},
  {id:'hide',cat:'looks',label:'hide',fields:[]},
  {id:'wait',cat:'control',label:'wait seconds',fields:[['seconds','1']]},
  {id:'repeat',cat:'control',label:'repeat',fields:[['times','3']]},
  {id:'forever',cat:'control',label:'forever',fields:[]},
  {id:'if',cat:'control',label:'if condition',fields:[['variable','score'],['operator','>'],['value','0']]},
  {id:'ifElse',cat:'control',label:'if / else',fields:[['variable','score'],['operator','>'],['value','0']]},
  {id:'set',cat:'variables',label:'set variable to',fields:[['variable','score'],['value','0']]},
  {id:'change',cat:'variables',label:'change variable by',fields:[['variable','score'],['value','1']]},
  {id:'print',cat:'variables',label:'print variable',fields:[['variable','score']]},
  {id:'add',cat:'operators',label:'add numbers',fields:[['a','2'],['b','3'],['variable','result']]},
  {id:'subtract',cat:'operators',label:'subtract numbers',fields:[['a','5'],['b','2'],['variable','result']]},
  {id:'multiply',cat:'operators',label:'multiply numbers',fields:[['a','3'],['b','4'],['variable','result']]},
  {id:'divide',cat:'operators',label:'divide numbers',fields:[['a','8'],['b','2'],['variable','result']]},
  {id:'number',cat:'operators',label:'number reporter',kind:'reporter',fields:[['value','5']]},
  {id:'getVar',cat:'variables',label:'variable reporter',kind:'reporter',fields:[['variable','score']]},
  {id:'mathAdd',cat:'operators',label:'( ) + ( )',kind:'reporter',fields:[]},
  {id:'mathSubtract',cat:'operators',label:'( ) − ( )',kind:'reporter',fields:[]},
  {id:'mathMultiply',cat:'operators',label:'( ) × ( )',kind:'reporter',fields:[]},
  {id:'mathDivide',cat:'operators',label:'( ) ÷ ( )',kind:'reporter',fields:[]},
  {id:'compare',cat:'operators',label:'compare ( ) with ( )',kind:'reporter',fields:[['operator','>']]},
  {id:'boolean',cat:'operators',label:'boolean',kind:'reporter',fields:[['value','true']]},
  {id:'and',cat:'operators',label:'AND',kind:'reporter',fields:[]},
  {id:'or',cat:'operators',label:'OR',kind:'reporter',fields:[]},
  {id:'not',cat:'operators',label:'NOT',kind:'reporter',fields:[]}
 ];
 const cats=[['events','Events'],['motion','Motion'],['looks','Looks'],['control','Control'],['variables','Variables'],['operators','Operators']];
 const containerTypes=new Set(['repeat','forever','if','ifElse']);
 const reporterTypes=new Set(defs.filter(d=>d.kind==='reporter').map(d=>d.id));
 const expressionInputs={repeat:['times'],if:['condition'],ifElse:['condition'],set:['value'],change:['value'],add:['a','b'],subtract:['a','b'],multiply:['a','b'],divide:['a','b'],mathAdd:['a','b'],mathSubtract:['a','b'],mathMultiply:['a','b'],mathDivide:['a','b'],compare:['a','b'],and:['left','right'],or:['left','right'],not:['value']};
 const isReporter=type=>reporterTypes.has(type);
 const uid=()=> 'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
 const def=t=>defs.find(d=>d.id===t);
 const make=(type,x=80,y=70)=>{
  const d=def(type),fields={},inputs={};
  (d?.fields||[]).forEach(([k,v])=>fields[k]=v);
  (expressionInputs[type]||[]).forEach(key=>inputs[key]=null);
  return {id:uid(),type,fields,inputs,x,y,children:[],elseChildren:[]};
 };
 const starter=()=>{
  const a=make('flag',80,80),b=make('move',80,245),c=make('say',80,410);
  return {nodes:[a,b,c],links:[{from:a.id,to:b.id},{from:b.id,to:c.id}]};
 };
 function normalizeBlock(raw,x=60,y=60){
  const n=raw||{},legacyControl=(n._legacyControl===true)||((n.type==='repeat'||n.type==='if')&&!Array.isArray(n.children));
  const inputs={};
  (expressionInputs[n.type]||[]).forEach(key=>{const value=n.inputs&&n.inputs[key];inputs[key]=value&&typeof value==='object'?normalizeBlock(value,20,20):null;});
  const block={...n,id:n.id||uid(),type:n.type,fields:n.fields&&typeof n.fields==='object'?{...n.fields}:{},inputs,x:Number.isFinite(Number(n.x))?Number(n.x):x,y:Number.isFinite(Number(n.y))?Number(n.y):y,children:Array.isArray(n.children)?n.children.map((c,i)=>normalizeBlock(c,20,20+i*80)):[],elseChildren:Array.isArray(n.elseChildren)?n.elseChildren.map((c,i)=>normalizeBlock(c,20,20+i*80)):[]};
  if(legacyControl)block._legacyControl=true;else delete block._legacyControl;
  return block;
 }
 function normalize(data){
  if(Array.isArray(data)){
   const nodes=data.map((b,i)=>normalizeBlock(b,70+i*215,70));
   return {nodes,links:nodes.slice(1).map((n,i)=>({from:nodes[i].id,to:n.id}))};
  }
  if(data&&Array.isArray(data.nodes)){
   return {nodes:data.nodes.map((n,i)=>normalizeBlock(n,60+(i%3)*215,60+Math.floor(i/3)*170)),links:Array.isArray(data.links)?data.links.filter(l=>l&&l.from&&l.to).map(l=>({from:String(l.from),to:String(l.to)})):[]};
  }
  return starter();
 }

 function parseExpression(source,variables={},label='expression'){
  const input=String(source??'').trim();
  if(!input)throw Error(label+' is empty.');
  const tokens=[];let index=0;
  while(index<input.length){
   const rest=input.slice(index),space=/^\s+/.exec(rest);
   if(space){index+=space[0].length;continue;}
   const number=/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i.exec(rest);
   if(number){tokens.push({type:'number',value:Number(number[0])});index+=number[0].length;continue;}
   const variable=/^\$([A-Za-z_][A-Za-z0-9_]{0,31})/.exec(rest);
   if(variable){tokens.push({type:'variable',value:variable[1]});index+=variable[0].length;continue;}
   const symbol=rest[0];
   if('+-*/%()'.includes(symbol)){tokens.push({type:'symbol',value:symbol});index++;continue;}
   throw Error('Unexpected token "'+symbol+'" in '+label+'.');
  }
  let cursor=0;const peek=()=>tokens[cursor];
  function primary(){
   const token=peek();if(!token)throw Error('Incomplete '+label+'.');
   if(token.type==='number'){cursor++;return token.value;}
   if(token.type==='variable'){cursor++;const value=Number(variables[token.value]??0);if(!Number.isFinite(value))throw Error('Variable "'+token.value+'" is not numeric.');return value;}
   if(token.value==='('){cursor++;const value=additive();if(peek()?.value!==')')throw Error('Missing closing parenthesis in '+label+'.');cursor++;return value;}
   throw Error('Expected a number or variable in '+label+'.');
  }
  function unary(){if(peek()?.value==='+'){cursor++;return unary();}if(peek()?.value==='-'){cursor++;return -unary();}return primary();}
  function multiplicative(){
   let value=unary();
   while(['*','/','%'].includes(peek()?.value)){
    const operator=tokens[cursor++].value,right=unary();
    if((operator==='/'||operator==='%')&&right===0)throw Error('Division by zero in '+label+'.');
    value=operator==='*'?value*right:operator==='/'?value/right:value%right;
    if(!Number.isFinite(value))throw Error(label+' produced a non-finite number.');
   }
   return value;
  }
  function additive(){
   let value=multiplicative();
   while(peek()?.value==='+'||peek()?.value==='-'){
    const operator=tokens[cursor++].value,right=multiplicative();
    value=operator==='+'?value+right:value-right;
    if(!Number.isFinite(value))throw Error(label+' produced a non-finite number.');
   }
   return value;
  }
  const result=additive();
  if(cursor!==tokens.length)throw Error('Unexpected token "'+tokens[cursor].value+'" in '+label+'.');
  if(!Number.isFinite(result))throw Error(label+' must produce a finite number.');
  return result;
 }
 function compareValues(left,operator,right){
  switch(operator){case '>':return left>right;case '<':return left<right;case '>=':return left>=right;case '<=':return left<=right;case '=':case '==':return left===right;case '!=':return left!==right;default:throw Error('Unknown comparison operator "'+operator+'".');}
 }
 function evaluateReporter(node,variables={},depth=0){
  if(!node||depth>40)throw Error('Reporter expression depth limit reached.');
  const fields=node.fields||{},inputs=node.inputs||{};
  const read=(key,fallback='0')=>inputs[key]?evaluateReporter(inputs[key],variables,depth+1):parseExpression(fields[key]??fallback,variables,key);
  const numeric=(value,label)=>{if(typeof value!=='number'||!Number.isFinite(value))throw Error(label+' reporter must return a finite number.');return value;};
  switch(node.type){
   case 'number':return parseExpression(fields.value??'0',variables,'number');
   case 'getVar':{
    const name=String(fields.variable||'score').trim();
    if(!/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(name))throw Error('Invalid variable name "'+name+'".');
    const value=Number(variables[name]??0);if(!Number.isFinite(value))throw Error('Variable "'+name+'" is not numeric.');return value;
   }
   case 'boolean':return String(fields.value??'true')==='true';
   case 'mathAdd':return numeric(read('a','0'),'Left')+numeric(read('b','0'),'Right');
   case 'mathSubtract':return numeric(read('a','0'),'Left')-numeric(read('b','0'),'Right');
   case 'mathMultiply':return numeric(read('a','0'),'Left')*numeric(read('b','0'),'Right');
   case 'mathDivide':{
    const left=numeric(read('a','0'),'Left'),right=numeric(read('b','0'),'Right');
    if(right===0)throw Error('Division by zero.');return left/right;
   }
   case 'compare':return compareValues(numeric(read('a','0'),'Left'),fields.operator||'>',numeric(read('b','0'),'Right'));
   case 'and':return Boolean(read('left','0'))&&Boolean(read('right','0'));
   case 'or':return Boolean(read('left','0'))||Boolean(read('right','0'));
   case 'not':return !Boolean(read('value','0'));
   default:throw Error('Unsupported reporter block "'+node.type+'".');
  }
 }
 function normalizeVariables(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return {score:0};
  const result={};Object.entries(raw).forEach(([name,value])=>{if(/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(name)&&typeof value==='number'&&Number.isFinite(value))result[name]=value;});
  return result;
 }
 const load=()=>{
  try{
   const current=localStorage.getItem(KEY);
   if(current){const parsed=JSON.parse(current);return {...normalize(parsed),variables:normalizeVariables(parsed.variables)};}
   const old=localStorage.getItem('nexus.flow.scratch.v2');
   if(old){const parsed=JSON.parse(old);return {...normalize(parsed),variables:normalizeVariables(parsed.variables)};}
   return {...starter(),variables:{score:0}};
  }catch{return {...starter(),variables:{score:0}};}
 };
 api.flow={
  evaluateExpression:(expression,variables={})=>parseExpression(expression,variables),
  evaluateReporter:(reporter,variables={})=>evaluateReporter(reporter,variables),
  render:()=>'<div class="eyebrow">NEXUS MODULE / 006</div><div class="module-title-row"><div><h1>Flow <span>Studio.</span></h1><p class="subtitle">Build programs with nested control blocks, variables and a live stage.</p></div><span class="flow-badge">● BLOCK EDITOR</span></div><div class="scratch-toolbar graph-toolbar"><div class="scratch-project"><span class="scratch-project-icon">✳</span><input id="projectName" value="My first project" aria-label="Project name"></div><div class="graph-tools"><button class="secondary-button" id="wireMode">⌁ WIRE: OFF</button><button class="secondary-button" id="deleteLinks">CLEAR WIRES</button><button class="secondary-button" id="flowNew">NEW</button><button class="secondary-button" id="flowSave">SAVE</button><button class="run-button" id="flowRun">▶ RUN</button><button class="stop-button" id="flowStop" disabled>■ STOP</button></div></div><div class="graph-workbench"><aside class="graph-library"><div class="graph-library-head"><b>BLOCK LIBRARY</b><small>DRAG BLOCKS TO CANVAS OR INTO SLOTS</small></div><div class="graph-categories" id="scratchCategories"></div><div class="graph-palette" id="scratchPalette"></div></aside><section class="graph-editor"><div class="graph-editor-head"><b>WORKSPACE</b><span id="blockCount">0 BLOCKS</span><span class="graph-help">Drag blocks · drop into orange control slots · WIRE links top-level scripts</span></div><div class="graph-canvas" id="graphCanvas"><svg class="graph-wires" id="graphWires"></svg><div id="graphNodes"></div><div class="graph-empty" id="graphEmpty">Drag blocks here from the library</div></div><div class="graph-status" id="graphStatus">Drop blocks into a control slot to build a nested body.</div></section><aside class="graph-side"><div class="scratch-panel-title"><b>STAGE</b><small>360 × 260</small></div><div class="scratch-stage" id="scratchStage"><div class="stage-grid"></div><div class="stage-sprite" id="stageSprite">🐱</div><div class="stage-bubble" id="stageBubble" hidden></div></div><div class="stage-controls"><button id="stageReset">↺ RESET SPRITE</button><span id="stagePosition">x: 0 y: 0</span></div><div class="scratch-console"><div class="scratch-panel-title"><b>OUTPUT</b><button id="clearOutput">CLEAR</button></div><div id="scratchOutput" class="scratch-output">Ready. Press RUN to execute the script.</div><div class="flow-variable-manager"><div class="flow-variable-tools"><input id="newVariableName" placeholder="new variable" maxlength="32" aria-label="New variable name"><button id="addVariable" type="button">+ ADD</button></div><div id="flowVariableList" class="flow-variable-list"></div><datalist id="flowVariableOptions"></datalist></div><div id="variableReadout" class="variable-readout">Variables: score = 0</div></div></aside></div><div class="scratch-footer"><span><i></i> LOCAL PROJECT</span><span>Nested blocks · Variables · Runtime stop control</span></div>',
  mount(root){
   let data=load(),nodes=data.nodes,links=data.links,category='events',wireMode=false,pending=null,running=false,stopFlag=false,runAbort=null,x=0,y=0,angle=0,visible=true,vars=data.variables||{score:0},runtimeSteps=0;
   const MAX_STEPS=100000,MAX_DEPTH=40;
   const $=s=>root.querySelector(s),canvas=$('#graphCanvas'),nodeLayer=$('#graphNodes'),wireSvg=$('#graphWires'),palette=$('#scratchPalette'),out=$('#scratchOutput'),sprite=$('#stageSprite'),bubble=$('#stageBubble');
   const log=s=>{const d=document.createElement('div');d.textContent=String(s);out.append(d);out.scrollTop=out.scrollHeight;};
   const countBlock=n=>1+countBlocks(n.children||[])+countBlocks(n.elseChildren||[])+Object.values(n.inputs||{}).filter(Boolean).reduce((sum,child)=>sum+countBlock(child),0);
   const countBlocks=list=>list.reduce((sum,n)=>sum+countBlock(n),0);
   const save=()=>{
    try{
     localStorage.setItem(KEY,JSON.stringify({version:3,nodes,links,variables:vars}));
     $('#blockCount').textContent=countBlocks(nodes)+' BLOCKS · '+links.length+' WIRES';
    }catch(e){log('Save error: '+e.message);}
   };
   function renderVariableManager(){
    const list=$('#flowVariableList'),options=$('#flowVariableOptions');
    if(!list||!options)return;
    list.replaceChildren();options.replaceChildren();
    Object.entries(vars).sort(([a],[b])=>a.localeCompare(b)).forEach(([name,value])=>{
     const option=document.createElement('option');option.value=name;options.append(option);
     const row=document.createElement('div');row.className='flow-variable-row';
     const label=document.createElement('span');label.textContent=name;
     const current=document.createElement('small');current.textContent=String(value);
     const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.title='Delete variable '+name;
     remove.addEventListener('click',()=>{if(running)return;delete vars[name];updateVars();save();log('Variable deleted: '+name);});
     row.append(label,current,remove);list.append(row);
    });
   }
   const updateVars=()=>{
    $('#variableReadout').textContent='Variables: '+Object.entries(vars).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+' = '+v).join(' · ');
    renderVariableManager();
   };
   const findBlock=(id,list=nodes)=>{
    for(const n of list){
     if(n.id===id)return n;
     const a=findBlock(id,n.children||[]);if(a)return a;
     const b=findBlock(id,n.elseChildren||[]);if(b)return b;
     for(const child of Object.values(n.inputs||{})){if(child){if(child.id===id)return child;const nested=findBlock(id,[child]);if(nested)return nested;}}
    }
    return null;
   };
   const findTop=id=>nodes.find(n=>n.id===id);
   const outgoing=id=>links.find(l=>l.from===id);
   const incoming=id=>links.some(l=>l.to===id);
   const linked=(a,b)=>links.some(l=>l.from===a&&l.to===b);
   function containsBlock(block,id){
    if(!block)return false;
    return block.id===id||(block.children||[]).some(c=>containsBlock(c,id))||(block.elseChildren||[]).some(c=>containsBlock(c,id))||Object.values(block.inputs||{}).some(c=>containsBlock(c,id));
   }
   function takeInside(node,id){
    const a=takeBlock(id,node.children||[]);if(a)return a;
    const b=takeBlock(id,node.elseChildren||[]);if(b)return b;
    for(const key of Object.keys(node.inputs||{})){
     const child=node.inputs[key];if(!child)continue;
     if(child.id===id){node.inputs[key]=null;return child;}
     const found=takeInside(child,id);if(found)return found;
    }
    return null;
   }
   function takeBlock(id,list=nodes){
    for(let i=0;i<list.length;i++)if(list[i].id===id)return list.splice(i,1)[0];
    for(const node of list){const found=takeInside(node,id);if(found)return found;}
    return null;
   }
   function removeBlock(id){
    const wasTop=!!findTop(id);
    if(!takeBlock(id))return;
    if(wasTop)links=links.filter(l=>l.from!==id&&l.to!==id);
    if(pending===id)pending=null;
    save();render();
   }
   function slotFor(ownerId,branch){
    const owner=findBlock(ownerId);
    if(!owner||!containerTypes.has(owner.type))return null;
    return branch==='else'?owner.elseChildren:owner.children;
   }
   function validVariableName(value){
    const name=String(value||'').trim();
    if(!/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(name))throw Error('Invalid variable name "'+name+'". Use letters, numbers and underscore.');
    return name;
   }
   function readNumber(value,label){
    const text=String(value??'').trim(),number=Number(text);
    if(!text||!Number.isFinite(number))throw Error('"'+label+'" must be a valid number.');
    return number;
   }
   function ensureVariableCapacity(name){if(!Object.prototype.hasOwnProperty.call(vars,name)&&Object.keys(vars).length>=100)throw Error('A project can contain at most 100 variables.');}
   function readExpression(block,key,fallback,label){
    const value=block.inputs&&block.inputs[key]?evaluateReporter(block.inputs[key],vars):parseExpression(block.fields?.[key]??fallback,vars,label);
    if(typeof value!=='number'||!Number.isFinite(value))throw Error('"'+label+'" must produce a number.');
    return value;
   }
   function compare(left,operator,right){return compareValues(left,operator,right);}
   function conditionFor(n){
    if(n.inputs&&n.inputs.condition)return Boolean(evaluateReporter(n.inputs.condition,vars));
    const f=n.fields||{},name=validVariableName(f.variable||'score');
    return compare(Number(vars[name]??0),f.operator||'>',readExpression(n,'value','0','condition value'));
   }
   function tick(){
    runtimeSteps++;
    if(runtimeSteps>MAX_STEPS)throw Error('Execution limit reached (100,000 blocks). Stop the script or simplify the loop.');
   }
   function wait(ms){
    return new Promise(resolve=>{
     if(stopFlag)return resolve();
     let settled=false,timer;
     const done=()=>{
      if(settled)return;
      settled=true;clearTimeout(timer);
      if(runAbort)runAbort.signal.removeEventListener('abort',done);
      resolve();
     };
     timer=setTimeout(done,Math.max(0,ms));
     if(runAbort)runAbort.signal.addEventListener('abort',done,{once:true});
    });
   }
   function renderPalette(){
    palette.replaceChildren();
    defs.filter(d=>d.cat===category).forEach(d=>{
     const el=document.createElement('button');
     el.className='code-block '+d.cat+' graph-library-block';el.draggable=true;el.textContent=d.label;
     el.addEventListener('dragstart',e=>{
      e.dataTransfer.setData('application/x-nexus-type',d.id);
      e.dataTransfer.setData('text/plain',d.id);
      e.dataTransfer.effectAllowed='copy';
     });
     el.addEventListener('click',()=>{
      if(isReporter(d.id)){$('#graphStatus').textContent='Reporter blocks belong inside an expression slot. Drag this block into a slot.';return;}
      const n=make(d.id,60+Math.random()*120,70+Math.random()*100);
      nodes.push(n);save();render();
     });
     palette.append(el);
    });
   }
   function portPosition(card,side){
    const port=card?.querySelector(side==='out'?'.output-port':'.input-port');
    if(!port)return null;
    const r=port.getBoundingClientRect(),c=canvas.getBoundingClientRect();
    return {x:r.left-c.left+canvas.scrollLeft+r.width/2,y:r.top-c.top+canvas.scrollTop+r.height/2};
   }
   function drawWires(){
    wireSvg.replaceChildren();
    wireSvg.setAttribute('width',Math.max(canvas.scrollWidth,nodeLayer.scrollWidth,900));
    wireSvg.setAttribute('height',Math.max(canvas.scrollHeight,nodeLayer.scrollHeight,650));
    const cards=Array.from(nodeLayer.querySelectorAll('.graph-node[data-id]'));
    for(const l of links){
     const cardA=cards.find(el=>el.dataset.id===l.from),cardB=cards.find(el=>el.dataset.id===l.to);
     const p=portPosition(cardA,'out'),q=portPosition(cardB,'in');
     if(!p||!q)continue;
     const curve=Math.max(45,Math.abs(q.y-p.y)*.45),path=document.createElementNS('http://www.w3.org/2000/svg','path');
     path.setAttribute('d','M '+p.x+' '+p.y+' C '+p.x+' '+(p.y+curve)+', '+q.x+' '+(q.y-curve)+', '+q.x+' '+q.y);
     path.setAttribute('class','graph-wire-path');wireSvg.append(path);
    }
   }
   function renderPorts(){
    root.querySelectorAll('.graph-port').forEach(p=>{
     p.classList.toggle('selected',!!(pending&&p.dataset.side==='out'&&pending===p.dataset.node));
     p.classList.toggle('wire-ready',wireMode);
    });
   }
   function connectPort(node,side){
    if(!wireMode){$('#graphStatus').textContent='Turn WIRE mode on to connect top-level blocks.';return;}
    if(side==='out'){
     pending=node.id;$('#graphStatus').textContent='Output selected. Click another top-level block input.';renderPorts();return;
    }
    if(!pending){$('#graphStatus').textContent='First select an output connector.';return;}
    if(!findTop(pending)){pending=null;$('#graphStatus').textContent='The selected block is no longer on the top-level workspace.';renderPorts();return;}
    if(pending===node.id){$('#graphStatus').textContent='Choose a different block.';return;}
    if(outgoing(pending))links=links.filter(l=>l.from!==pending);
    if(incoming(node.id))links=links.filter(l=>l.to!==node.id);
    if(!linked(pending,node.id))links.push({from:pending,to:node.id});
    pending=null;$('#graphStatus').textContent='Top-level wire connected.';save();render();
   }
   function addDropHandlers(slot,ownerId,branch){
    slot.addEventListener('dragover',e=>{e.preventDefault();e.stopPropagation();slot.classList.add('zone-over');if(e.dataTransfer)e.dataTransfer.dropEffect='move';});
    slot.addEventListener('dragleave',e=>{if(!slot.contains(e.relatedTarget))slot.classList.remove('zone-over');});
    slot.addEventListener('drop',e=>{
     e.preventDefault();e.stopPropagation();slot.classList.remove('zone-over');
     const target=slotFor(ownerId,branch);if(!target)return;
     const movingId=e.dataTransfer.getData('application/x-nexus-block');
     if(movingId){
      const moving=findBlock(movingId);
      if(!moving||isReporter(moving.type)||containsBlock(moving,ownerId)){log('Only statement blocks can be placed in control slots.');return;}
      const wasTop=!!findTop(movingId),block=takeBlock(movingId);
      if(!block)return;
      if(wasTop)links=links.filter(l=>l.from!==movingId&&l.to!==movingId);
      if(pending===movingId)pending=null;
      target.push(block);
     }else{
      const type=e.dataTransfer.getData('application/x-nexus-type')||e.dataTransfer.getData('text/plain');
      if(!def(type))return;
      if(isReporter(type)){$('#graphStatus').textContent='Reporter blocks must be dropped into an expression slot.';return;}
      target.push(make(type,20,20));
     }
     save();render();$('#graphStatus').textContent=branch==='else'?'Block added to ELSE body.':'Block added to nested body.';
    });
   }
      function addExpressionDropHandlers(slot,ownerId,key){
    slot.addEventListener('dragover',e=>{e.preventDefault();e.stopPropagation();slot.classList.add('zone-over');if(e.dataTransfer)e.dataTransfer.dropEffect='move';});
    slot.addEventListener('dragleave',e=>{if(!slot.contains(e.relatedTarget))slot.classList.remove('zone-over');});
    slot.addEventListener('drop',e=>{
     e.preventDefault();e.stopPropagation();slot.classList.remove('zone-over');
     const owner=findBlock(ownerId);if(!owner)return;
     const movingId=e.dataTransfer.getData('application/x-nexus-block');let reporter=null;
     if(movingId){
      reporter=findBlock(movingId);
      if(!reporter||!isReporter(reporter.type)){log('Only reporter blocks can be placed in an expression slot.');return;}
      if(containsBlock(reporter,ownerId)){log('A reporter cannot contain its own parent.');return;}
      if(owner.inputs?.[key]?.id===movingId)return;
      if(owner.inputs?.[key]){$('#graphStatus').textContent='This expression slot is occupied. Clear it before replacing the reporter.';return;}
      reporter=takeBlock(movingId);
     }else{
      const type=e.dataTransfer.getData('application/x-nexus-type')||e.dataTransfer.getData('text/plain');
      if(!isReporter(type)){$('#graphStatus').textContent='Drop a reporter block into this slot.';return;}
      if(owner.inputs?.[key]){$('#graphStatus').textContent='This expression slot is occupied. Clear it before replacing the reporter.';return;}
      reporter=make(type,20,20);
     }
     if(!reporter)return;
     owner.inputs=owner.inputs||{};owner.inputs[key]=reporter;
     save();render();$('#graphStatus').textContent='Reporter connected to '+key+'.';
    });
   }
   function renderExpressionSlot(owner,key){
    const wrap=document.createElement('div');wrap.className='flow-expression-slot';
    const label=document.createElement('span');label.className='flow-expression-label';label.textContent=key==='condition'?'condition reporter (overrides comparison fields)':key+' reporter (overrides text input)';wrap.append(label);
    const slot=document.createElement('div');slot.className='flow-reporter-drop';slot.dataset.owner=owner.id;slot.dataset.input=key;
    const reporter=owner.inputs&&owner.inputs[key];
    if(reporter){
     const rendered=renderBlock(reporter,true);if(rendered)slot.append(rendered);
     const clear=document.createElement('button');clear.type='button';clear.className='flow-clear-reporter';clear.textContent='CLEAR';clear.addEventListener('click',()=>{owner.inputs[key]=null;save();render();});slot.append(clear);
    }else{
     const hint=document.createElement('span');hint.className='flow-reporter-hint';hint.textContent='Drop a reporter here';slot.append(hint);
    }
    addExpressionDropHandlers(slot,owner.id,key);wrap.append(slot);return wrap;
   }
   function renderBlock(n,nested=false){
    const d=def(n.type);if(!d)return null;
    const card=document.createElement('div');
    card.className='graph-node '+d.cat+(nested?' nested-node':'')+(isReporter(n.type)?' reporter-node':'')+(containerTypes.has(n.type)?' graph-container':'');
    card.dataset.id=n.id;
    if(!nested){card.style.left=n.x+'px';card.style.top=n.y+'px';}
    if(!nested){
     const top=document.createElement('button');top.className='graph-port input-port';top.dataset.node=n.id;top.dataset.side='in';top.title='Input connector';top.addEventListener('click',()=>connectPort(n,'in'));card.append(top);
    }
    const title=document.createElement('div');title.className='graph-node-title';title.textContent=d.label;title.title='Drag this block into a control slot';title.draggable=true;
    title.addEventListener('dragstart',e=>{
     e.dataTransfer.setData('application/x-nexus-block',n.id);
     e.dataTransfer.effectAllowed='move';
    });
    card.append(title);
    d.fields.forEach(([key,defaultValue])=>{
     const row=document.createElement('label');row.className='graph-field-row';
     const caption=document.createElement('span');caption.textContent=key;row.append(caption);
     let field;
     if(key==='operator'){
      field=document.createElement('select');
      ['>','<','>=','<=','=','!='].forEach(op=>{const option=document.createElement('option');option.value=op;option.textContent=op;field.append(option);});
     }else if(n.type==='boolean'&&key==='value'){
      field=document.createElement('select');
      ['true','false'].forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;field.append(option);});
     }else{
      field=document.createElement('input');field.type='text';field.spellcheck=false;
      if(key==='variable')field.setAttribute('list','flowVariableOptions');
     }
     field.className='graph-field';field.value=n.fields[key]??defaultValue;field.setAttribute('aria-label',key);field.title=key;field.dataset.field=key;
     field.addEventListener('change',()=>{n.fields[key]=field.value;save();});
     row.append(field);card.append(row);
    });
    (expressionInputs[n.type]||[]).forEach(key=>card.append(renderExpressionSlot(n,key)));
    const controls=document.createElement('div');controls.className='graph-node-controls';
    const remove=document.createElement('button');remove.textContent='×';remove.title='Delete block';remove.setAttribute('aria-label','Delete block');remove.addEventListener('click',()=>removeBlock(n.id));controls.append(remove);card.append(controls);
    if(containerTypes.has(n.type)){
     const body=document.createElement('div');body.className='flow-container-body';
     const makeBranch=(branch,label,children)=>{
      const caption=document.createElement('div');caption.className=branch==='else'?'flow-branch-label flow-else-label':'flow-branch-label';caption.textContent=label;body.append(caption);
      const slot=document.createElement('div');slot.className='flow-drop-slot';slot.dataset.owner=n.id;slot.dataset.branch=branch;
      if(!children.length){const hint=document.createElement('span');hint.className='flow-drop-hint';hint.textContent='Drop blocks here';slot.append(hint);}
      else children.forEach(child=>{const rendered=renderBlock(child,true);if(rendered)slot.append(rendered);});
      addDropHandlers(slot,n.id,branch);body.append(slot);
     };
     makeBranch('body','DO',n.children||[]);
     if(n.type==='ifElse')makeBranch('else','ELSE',n.elseChildren||[]);
     card.append(body);
    }
    if(!nested){
     const bottom=document.createElement('button');bottom.className='graph-port output-port';bottom.dataset.node=n.id;bottom.dataset.side='out';bottom.title='Output connector';bottom.addEventListener('click',()=>connectPort(n,'out'));card.append(bottom);
     card.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,input,select,.graph-node-title,.nested-node,.flow-container-body,.flow-drop-slot'))return;
      const sx=e.clientX,sy=e.clientY,ox=n.x,oy=n.y;
      card.setPointerCapture(e.pointerId);
      const move=ev=>{
       n.x=Math.max(0,ox+ev.clientX-sx);n.y=Math.max(0,oy+ev.clientY-sy);
       card.style.left=n.x+'px';card.style.top=n.y+'px';drawWires();
      };
      const up=()=>{card.removeEventListener('pointermove',move);card.removeEventListener('pointerup',up);card.removeEventListener('pointercancel',up);save();};
      card.addEventListener('pointermove',move);card.addEventListener('pointerup',up);card.addEventListener('pointercancel',up);
     });
    }else{
     card.addEventListener('pointerdown',e=>e.stopPropagation());
    }
    return card;
   }
   function render(){
    nodeLayer.replaceChildren();
    nodes.forEach(n=>{const card=renderBlock(n,false);if(card)nodeLayer.append(card);});
    $('#graphEmpty').hidden=nodes.length>0;
    $('#blockCount').textContent=countBlocks(nodes)+' BLOCKS · '+links.length+' WIRES';
    renderPorts();
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(drawWires);else drawWires();
   }
   function dropOnCanvas(e){
    e.preventDefault();
    const blockId=e.dataTransfer.getData('application/x-nexus-block');
    const rect=canvas.getBoundingClientRect();
    const px=Math.max(8,e.clientX-rect.left+canvas.scrollLeft-105),py=Math.max(8,e.clientY-rect.top+canvas.scrollTop-25);
    if(blockId){
     const block=findBlock(blockId);if(!block)return;
     if(isReporter(block.type)){$('#graphStatus').textContent='Reporter blocks must stay inside expression slots.';return;}
     const moving=takeBlock(blockId);if(!moving)return;
     moving.x=px;moving.y=py;nodes.push(moving);
    }else{
     const type=e.dataTransfer.getData('application/x-nexus-type')||e.dataTransfer.getData('text/plain');
     if(!def(type))return;
     if(isReporter(type)){$('#graphStatus').textContent='Reporter blocks must be placed in an expression slot.';return;}
     nodes.push(make(type,px,py));
    }
    save();render();$('#graphStatus').textContent='Block placed on workspace.';
   }
   canvas.addEventListener('dragover',e=>{e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='copy';});
   canvas.addEventListener('drop',dropOnCanvas);
   cats.forEach(([id,name])=>{
    const b=document.createElement('button');b.className='category-button '+id;b.textContent=name;
    b.addEventListener('click',()=>{
     category=id;root.querySelectorAll('.category-button').forEach(v=>v.classList.toggle('active',v===b));renderPalette();
    });
    $('#scratchCategories').append(b);
   });
   function updateSprite(){
    sprite.style.left='calc(50% + '+x+'px)';sprite.style.top='calc(50% - '+y+'px)';
    sprite.style.transform='translate(-50%,-50%) rotate('+angle+'deg)';
    sprite.style.display=visible?'grid':'none';
    $('#stagePosition').textContent='x: '+Math.round(x)+' y: '+Math.round(y);
   }
   function resetSprite(){
    x=0;y=0;angle=0;visible=true;bubble.hidden=true;updateSprite();updateVars();
   }
   async function runBlock(n,depth=0){
    if(stopFlag)return;
    if(depth>MAX_DEPTH)throw Error('Nested block depth limit reached.');
    tick();
    const f=n.fields||{},name=validVariableName(f.variable||'score');
    switch(n.type){
     case 'flag':log('🚩 Start');break;
     case 'key':log('Key event: '+(f.key||'space')+' (manual start)');break;
     case 'move':{const steps=readNumber(f.steps,'steps');x+=Math.cos(angle*Math.PI/180)*steps;y+=Math.sin(angle*Math.PI/180)*steps;updateSprite();break;}
     case 'turn':angle+=readNumber(f.degrees,'degrees');updateSprite();break;
     case 'goto':x=readNumber(f.x,'x');y=readNumber(f.y,'y');updateSprite();break;
     case 'say':case 'think':bubble.textContent=(n.type==='think'?'💭 ':'')+(f.text||'');bubble.hidden=false;log(f.text||'');break;
     case 'show':visible=true;updateSprite();break;
     case 'hide':visible=false;updateSprite();break;
     case 'wait':{const seconds=readNumber(f.seconds,'seconds');if(seconds<0||seconds>60)throw Error('Wait must be between 0 and 60 seconds.');await wait(seconds*1000);break;}
     case 'set':ensureVariableCapacity(name);vars[name]=readExpression(n,'value','0','value');updateVars();save();log(name+' = '+vars[name]);break;
     case 'change':ensureVariableCapacity(name);vars[name]=Number(vars[name]??0)+readExpression(n,'value','1','change amount');updateVars();save();log(name+' → '+vars[name]);break;
     case 'print':log(name+' = '+(vars[name]??0));break;
     case 'add':case 'subtract':case 'multiply':case 'divide':{
      const a=readExpression(n,'a','0','first operand'),b=readExpression(n,'b','0','second operand');
      if(n.type==='divide'&&b===0)throw Error('Division by zero.');
      const result=n.type==='add'?a+b:n.type==='subtract'?a-b:n.type==='multiply'?a*b:a/b;
      const target=validVariableName(f.variable||'result');ensureVariableCapacity(target);vars[target]=result;updateVars();save();
      const symbol={add:'+',subtract:'−',multiply:'×',divide:'÷'}[n.type];log(target+' = '+a+' '+symbol+' '+b+' = '+result);break;
     }
     case 'if':if(conditionFor(n))await executeSequence(n.children||[],depth+1);break;
     case 'ifElse':await executeSequence(conditionFor(n)?(n.children||[]):(n.elseChildren||[]),depth+1);break;
     case 'repeat':{
      const times=readExpression(n,'times','3','repeat count');
      if(times<0||times>1000)throw Error('Repeat count must be between 0 and 1000.');
      for(let i=0;i<Math.floor(times)&&!stopFlag;i++)await executeSequence(n.children||[],depth+1);
      break;
     }
     case 'forever':
      if(!(n.children||[]).length){log('Forever is running with an empty body. Press STOP to finish.');while(!stopFlag)await wait(100);}
      else while(!stopFlag)await executeSequence(n.children,depth+1);
      break;
     default:throw Error('Unsupported block type "'+n.type+'".');
    }
    if(!stopFlag)await wait(70);
   }
   async function executeSequence(sequence,depth=0){
    if(depth>MAX_DEPTH)throw Error('Nested block depth limit reached.');
    for(const block of sequence){if(stopFlag)break;await runBlock(block,depth);}
   }
   async function executeLinked(start,depth=0){
    if(depth>MAX_DEPTH)throw Error('Linked script depth limit reached.');
    let current=start,chainSteps=0;
    while(current&&!stopFlag){
     if(++chainSteps>1000)throw Error('Too many linked blocks or a wire cycle was detected.');
     const n=findTop(current);if(!n)break;
     if(n._legacyControl&&n.type==='repeat'){
      tick();
      const times=readExpression(n,'times','0','repeat count');
      if(times<0||times>1000)throw Error('Repeat count must be between 0 and 1000.');
      const next=outgoing(n.id);
      if(next)for(let i=0;i<Math.floor(times)&&!stopFlag;i++)await executeLinked(next.to,depth+1);
      return;
     }
     if(n._legacyControl&&n.type==='if'){
      tick();
      if(!conditionFor(n))return;
     }else await runBlock(n,depth);
     current=outgoing(n.id)?.to||null;
    }
   }
   async function run(){
    if(running)return;
    running=true;stopFlag=false;runtimeSteps=0;runAbort=new AbortController();
    out.replaceChildren();resetSprite();$('#flowRun').disabled=true;$('#flowStop').disabled=false;
    $('#graphStatus').textContent='Runtime is executing.';
    log('NEXUS block runtime started');
    try{
     const starts=nodes.filter(n=>n.type==='flag'||n.type==='key');
     if(!starts.length)log('No start block found. Add “when clicked” first.');
     for(const n of starts){if(!stopFlag)await executeLinked(n.id);}
     log(stopFlag?'■ Stopped':'✓ Execution finished');
     $('#graphStatus').textContent=stopFlag?'Execution stopped.':'Execution finished successfully.';
    }catch(e){
     log('RUNTIME ERROR: '+(e?.message||String(e)));
     $('#graphStatus').textContent='Runtime error: '+(e?.message||String(e));
    }finally{
     running=false;runAbort=null;$('#flowRun').disabled=false;$('#flowStop').disabled=true;
    }
   }
   $('#wireMode').addEventListener('click',()=>{
    wireMode=!wireMode;pending=null;$('#wireMode').textContent=wireMode?'⌁ WIRE: ON':'⌁ WIRE: OFF';
    $('#wireMode').classList.toggle('wire-active',wireMode);
    $('#graphStatus').textContent=wireMode?'Click an output, then another top-level input.':'Wire mode off.';
    renderPorts();
   });
   $('#deleteLinks').addEventListener('click',()=>{links=[];pending=null;save();render();$('#graphStatus').textContent='All top-level wires removed.';});
   $('#flowRun').addEventListener('click',run);
   $('#flowStop').addEventListener('click',()=>{
    if(!running)return;
    stopFlag=true;if(runAbort)runAbort.abort();log('Stop requested');$('#graphStatus').textContent='Stopping runtime…';
   });
   $('#flowSave').addEventListener('click',()=>{save();log('✓ Project saved locally');});
   $('#flowNew').addEventListener('click',()=>{
    if(confirm('Create a new empty project?')){nodes=[];links=[];vars={score:0};pending=null;updateVars();save();render();out.textContent='New project created.';}
   });
   $('#stageReset').addEventListener('click',resetSprite);
   $('#addVariable').addEventListener('click',()=>{
    try{
     const name=validVariableName($('#newVariableName').value);
     if(Object.prototype.hasOwnProperty.call(vars,name))throw Error('Variable "'+name+'" already exists.');
     if(Object.keys(vars).length>=100)throw Error('A project can contain at most 100 variables.');
     vars[name]=0;$('#newVariableName').value='';updateVars();save();log('Variable created: '+name);
    }catch(error){$('#graphStatus').textContent='Variable error: '+error.message;}
   });
   $('#newVariableName').addEventListener('keydown',event=>{if(event.key==='Enter')$('#addVariable').click();});
   $('#clearOutput').addEventListener('click',()=>out.replaceChildren());
   $('#projectName').value=localStorage.getItem(KEY+'.name')||'My first project';
   $('#projectName').addEventListener('change',()=>localStorage.setItem(KEY+'.name',$('#projectName').value));
   category='events';root.querySelector('.category-button.events').classList.add('active');
   renderPalette();render();updateSprite();updateVars();save();
  }
 };
})();