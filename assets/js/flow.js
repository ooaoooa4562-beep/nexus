(() => {
 const api=window.NEXUSModules=window.NEXUSModules||{},KEY='nexus.flow.graph.v1';
  const defs=[
{id:'flag',cat:'events',label:'when green flag clicked',fields:[]},{id:'key',cat:'events',label:'when key pressed',fields:[['key','space']]},{id:'whenClicked',cat:'events',label:'when stage clicked',fields:[]},{id:'whenMessage',cat:'events',label:'when I receive message',fields:[['message','start']]},{id:'broadcast',cat:'events',label:'broadcast message',fields:[['message','start']]},
{id:'move',cat:'motion',label:'move steps',fields:[['steps','10']]},{id:'turn',cat:'motion',label:'turn degrees',fields:[['degrees','15']]},{id:'goto',cat:'motion',label:'go to x / y',fields:[['x','0'],['y','0']]},{id:'glide',cat:'motion',label:'glide to x / y',fields:[['x','120'],['y','60'],['duration','1']]},
{id:'say',cat:'text',label:'say text',fields:[['text','Hello!']]},{id:'think',cat:'text',label:'think text',fields:[['text','Hmm...']]},{id:'clearBubble',cat:'text',label:'clear speech bubble',fields:[]},{id:'log',cat:'text',label:'write to output',fields:[['text','NEXUS ready']]},{id:'join',cat:'text',label:'join text',kind:'reporter',fields:[]},{id:'length',cat:'text',label:'text length',kind:'reporter',fields:[]},{id:'contains',cat:'text',label:'text contains',kind:'reporter',fields:[]},
{id:'set',cat:'variables',label:'set variable to',fields:[['variable','score'],['value','0']]},{id:'change',cat:'variables',label:'change variable by',fields:[['variable','score'],['value','1']]},{id:'print',cat:'variables',label:'print variable',fields:[['variable','score']]},{id:'getVar',cat:'variables',label:'variable value',kind:'reporter',fields:[['variable','score']]},
{id:'if',cat:'logic',label:'if condition',fields:[['variable','score'],['operator','>'],['value','0']]},{id:'ifElse',cat:'logic',label:'if / else',fields:[['variable','score'],['operator','>'],['value','0']]},{id:'and',cat:'logic',label:'AND',kind:'reporter',fields:[]},{id:'or',cat:'logic',label:'OR',kind:'reporter',fields:[]},{id:'not',cat:'logic',label:'NOT',kind:'reporter',fields:[]},{id:'compare',cat:'logic',label:'compare values',kind:'reporter',fields:[['operator','>']]},{id:'boolean',cat:'logic',label:'boolean value',kind:'reporter',fields:[['value','true']]},
{id:'repeat',cat:'control',label:'repeat',fields:[['times','3']]},{id:'while',cat:'control',label:'while condition',fields:[['variable','score'],['operator','>'],['value','0']]},{id:'forever',cat:'control',label:'forever',fields:[]},{id:'repeatUntil',cat:'control',label:'repeat until',fields:[['variable','score'],['operator','>='],['value','10']]},{id:'wait',cat:'control',label:'wait seconds',fields:[['seconds','1']]},{id:'stopAll',cat:'control',label:'stop all scripts',fields:[]},
{id:'number',cat:'math',label:'number value',kind:'reporter',fields:[['value','5']]},{id:'random',cat:'math',label:'random number',kind:'reporter',fields:[['min','1'],['max','10']]},{id:'round',cat:'math',label:'round number',kind:'reporter',fields:[]},{id:'absolute',cat:'math',label:'absolute value',kind:'reporter',fields:[]},{id:'modulo',cat:'math',label:'remainder',kind:'reporter',fields:[]},{id:'add',cat:'math',label:'add numbers',fields:[['a','2'],['b','3'],['variable','result']]},{id:'subtract',cat:'math',label:'subtract numbers',fields:[['a','5'],['b','2'],['variable','result']]},{id:'multiply',cat:'math',label:'multiply numbers',fields:[['a','3'],['b','4'],['variable','result']]},{id:'divide',cat:'math',label:'divide numbers',fields:[['a','8'],['b','2'],['variable','result']]},{id:'mathAdd',cat:'math',label:'( ) + ( )',kind:'reporter',fields:[]},{id:'mathSubtract',cat:'math',label:'( ) − ( )',kind:'reporter',fields:[]},{id:'mathMultiply',cat:'math',label:'( ) × ( )',kind:'reporter',fields:[]},{id:'mathDivide',cat:'math',label:'( ) ÷ ( )',kind:'reporter',fields:[]},
{id:'listLength',cat:'lists',label:'list length',kind:'reporter',fields:[['items','apple, banana, orange']]},{id:'listItem',cat:'lists',label:'item at position',kind:'reporter',fields:[['items','apple, banana, orange'],['index','1']]},{id:'listContains',cat:'lists',label:'list contains item',kind:'reporter',fields:[['items','apple, banana, orange'],['item','apple']]},
{id:'show',cat:'looks',label:'show character',fields:[]},{id:'hide',cat:'looks',label:'hide character',fields:[]},{id:'scaleTo',cat:'looks',label:'set size percent',fields:[['scale','100'],['duration','0.3']]},{id:'fadeTo',cat:'looks',label:'set opacity percent',fields:[['opacity','100'],['duration','0.3']]},
{id:'rotateTo',cat:'animation',label:'animate rotation to',fields:[['degrees','360'],['duration','1']]},{id:'bounce',cat:'animation',label:'bounce',fields:[['height','35'],['duration','0.6']]},{id:'pulse',cat:'animation',label:'pulse size',fields:[['scale','125'],['duration','0.4']]},{id:'shake',cat:'animation',label:'shake character',fields:[['strength','12'],['duration','0.45']]},{id:'spin',cat:'animation',label:'spin turns',fields:[['turns','2'],['duration','0.8']]},{id:'jump',cat:'animation',label:'jump',fields:[['height','55'],['duration','0.55']]},
{id:'colorTo',cat:'effects',label:'set color hue',fields:[['hue','210'],['duration','0.5']]},{id:'flash',cat:'effects',label:'flash effect',fields:[['times','3'],['duration','0.18']]},{id:'trail',cat:'effects',label:'toggle glow',fields:[['enabled','true']]},
{id:'timer',cat:'sensing',label:'timer seconds',kind:'reporter',fields:[]},{id:'resetTimer',cat:'sensing',label:'reset timer',fields:[]},{id:'playTone',cat:'audio',label:'play tone',fields:[['frequency','440'],['duration','0.5'],['volume','0.2']]},{id:'stopTone',cat:'audio',label:'stop audio',fields:[]},{id:'httpGet',cat:'network',label:'HTTPS GET request',fields:[['url','https://api.github.com'],['variable','response']]},{id:'procedureDef',cat:'functions',label:'define custom function',fields:[]}
  ];
 const typeAliases={"startOnLoad":"flag","whenClicked":"flag","whenSpace":"key","whenEnter":"key","moveBack":"move","moveFast":"move","turnLeft":"turn","turnRight":"turn","goCenter":"goto","setX":"goto","setY":"goto","glideCenter":"glide","rotateLeft":"rotateTo","rotateRight":"rotateTo","grow":"scaleTo","shrink":"scaleTo","setSize":"scaleTo","showMessage":"say","thinkMessage":"think","clearMessage":"clearBubble","fadeIn":"fadeTo","fadeOut":"fadeTo","zoomIn":"scaleTo","zoomOut":"scaleTo","wobble":"shake","quickSpin":"spin","slowSpin":"spin","glowOn":"trail","glowOff":"trail","flashTwice":"flash","hueShift":"colorTo","waitShort":"wait","repeatTen":"repeat","loopForever":"forever","stopScripts":"stopAll","setScore":"set","addScore":"change","subtractScore":"change","showScore":"print","writeOutput":"log","resetClock":"resetTimer","stopClock":"resetTimer","whenKey1":"key","whenKey2":"key","whenKey3":"key","whenKey4":"key","whenKey5":"key","whenKey6":"key","whenKey7":"key","whenKey8":"key","whenKey9":"key","whenKey10":"key","moveSteps1":"move","moveSteps2":"move","moveSteps3":"move","moveSteps4":"move","moveSteps5":"move","moveSteps6":"move","moveSteps7":"move","moveSteps8":"move","moveSteps9":"move","moveSteps10":"move","turnAngle1":"turn","turnAngle2":"turn","turnAngle3":"turn","turnAngle4":"turn","turnAngle5":"turn","turnAngle6":"turn","turnAngle7":"turn","turnAngle8":"turn","turnAngle9":"turn","turnAngle10":"turn","goPoint1":"goto","goPoint2":"goto","goPoint3":"goto","goPoint4":"goto","goPoint5":"goto","goPoint6":"goto","goPoint7":"goto","goPoint8":"goto","goPoint9":"goto","goPoint10":"goto","sayText1":"say","sayText2":"say","sayText3":"say","sayText4":"say","sayText5":"say","sayText6":"say","sayText7":"say","sayText8":"say","sayText9":"say","sayText10":"say","setSize1":"scaleTo","setSize2":"scaleTo","setSize3":"scaleTo","setSize4":"scaleTo","setSize5":"scaleTo","setSize6":"scaleTo","setSize7":"scaleTo","setSize8":"scaleTo","setSize9":"scaleTo","setSize10":"scaleTo","animateRotate1":"rotateTo","animateRotate2":"rotateTo","animateRotate3":"rotateTo","animateRotate4":"rotateTo","animateRotate5":"rotateTo","animateRotate6":"rotateTo","animateRotate7":"rotateTo","animateRotate8":"rotateTo","animateRotate9":"rotateTo","animateRotate10":"rotateTo","flashCount1":"flash","flashCount2":"flash","flashCount3":"flash","flashCount4":"flash","flashCount5":"flash","flashCount6":"flash","flashCount7":"flash","flashCount8":"flash","flashCount9":"flash","flashCount10":"flash","waitSeconds1":"wait","waitSeconds2":"wait","waitSeconds3":"wait","waitSeconds4":"wait","waitSeconds5":"wait","waitSeconds6":"wait","waitSeconds7":"wait","waitSeconds8":"wait","waitSeconds9":"wait","waitSeconds10":"wait","changeValue1":"change","changeValue2":"change","changeValue3":"change","changeValue4":"change","changeValue5":"change","changeValue6":"change","changeValue7":"change","changeValue8":"change","changeValue9":"change","changeValue10":"change"};
 // Reclassify the existing, executable blocks into the new learning-oriented library.
 const categoryMoves={logic:['if','ifElse','repeatUntil','compare','boolean','and','or','not'],math:['random','round','absolute','modulo','number','add','subtract','multiply','divide','mathAdd','mathSubtract','mathMultiply','mathDivide'],text:['text','join','length','contains','say','think','clearBubble','log'],functions:['procedureDef'],events:['flag','key','startOnLoad','whenClicked','whenSpace','whenEnter'],lists:['listLength','listItem','listContains'],audio:['playTone','stopTone'],network:['httpGet']};
 defs.forEach(d=>{for(const [cat,ids] of Object.entries(categoryMoves)){if(ids.includes(d.id)){d.cat=cat;break;}}});
 const cats=[['all','All blocks'],['events','Events'],['logic','Logic'],['math','Math'],['text','Text'],['lists','Lists'],['variables','Variables'],['functions','Functions'],['audio','Audio'],['network','Network'],['motion','Motion'],['looks','Looks'],['animation','Animation'],['effects','Effects'],['control','Control'],['sensing','Sensing'],['data','Data'],['operators','Other operators'],['myBlocks','My Blocks'],['favorites','★ Favorites']];
 const containerTypes=new Set(['repeat','while','forever','if','ifElse','repeatUntil','repeatTen','loopForever','procedureDef']);
 const eventTypes=new Set(['flag','key','whenMessage','procedureDef',...Object.keys(typeAliases).filter(id=>typeAliases[id]==='flag'||typeAliases[id]==='key')]);
 const reporterTypes=new Set(defs.filter(d=>d.kind==='reporter').map(d=>d.id));
 const expressionInputs={repeat:['times'],while:['condition'],if:['condition'],ifElse:['condition'],repeatUntil:['condition'],say:['text'],think:['text'],set:['value'],change:['value'],add:['a','b'],subtract:['a','b'],multiply:['a','b'],divide:['a','b'],mathAdd:['a','b'],mathSubtract:['a','b'],mathMultiply:['a','b'],mathDivide:['a','b'],compare:['a','b'],and:['left','right'],or:['left','right'],not:['value'],join:['left','right'],length:['value'],contains:['text','search'],round:['value'],absolute:['value'],modulo:['a','b'],listLength:['items'],listItem:['items'],listContains:['items']};
 const isReporter=type=>reporterTypes.has(type);
 const uid=()=> 'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
 const def=t=>defs.find(d=>d.id===t)||defs.find(d=>d.id===typeAliases[t]);
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
 function validateProcedureName(value){
  const name=String(value??'').trim();
  if(!/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(name))throw Error('Invalid custom block name "'+name+'". Use 1–32 letters, numbers or underscores; the first character must be a letter or underscore.');
  return name;
 }
 function normalizeProcedures(raw){
  if(!Array.isArray(raw))return [];
  const result=[],ids=new Set(),names=new Set();
  for(const item of raw){
   if(result.length>=50)break;
   if(!item||typeof item!=='object')continue;
   const id=String(item.id||'').trim();
   if(!/^p[a-z0-9]{6,40}$/i.test(id)||ids.has(id))continue;
   let name;try{name=validateProcedureName(item.name);}catch{continue;}
   const key=name.toLowerCase();if(names.has(key))continue;
   ids.add(id);names.add(key);result.push({id,name});
  }
  return result;
 }
 function normalize(data){
  if(Array.isArray(data)){
   const nodes=data.map((b,i)=>normalizeBlock(b,70+i*215,70));
   return {nodes,links:nodes.slice(1).map((n,i)=>({from:nodes[i].id,to:n.id})),procedures:[]};
  }
  if(data&&Array.isArray(data.nodes)){
   return {nodes:data.nodes.map((n,i)=>normalizeBlock(n,60+(i%3)*215,60+Math.floor(i/3)*170)),links:Array.isArray(data.links)?data.links.filter(l=>l&&l.from&&l.to).map(l=>({from:String(l.from),to:String(l.to)})):[],procedures:normalizeProcedures(data.procedures)};
  }
  return {...starter(),procedures:[]};
 }

 function normalizeVariableEntry(raw){
  if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&Object.prototype.hasOwnProperty.call(raw,'type')&&Object.prototype.hasOwnProperty.call(raw,'value')){
   const type=raw.type,value=raw.value;
   const constant=raw.constant===true;
   if(type==='number'&&typeof value==='number'&&Number.isFinite(value))return {type,value,constant};
   if(type==='text'&&typeof value==='string')return {type,value,constant};
   if(type==='boolean'&&typeof value==='boolean')return {type,value,constant};
   return null;
  }
  if(typeof raw==='number'&&Number.isFinite(raw))return {type:'number',value:raw};
  if(typeof raw==='string')return {type:'text',value:raw};
  if(typeof raw==='boolean')return {type:'boolean',value:raw};
  return null;
 }
 function readVariableRecord(variables,name){
  const raw=variables&&typeof variables==='object'&&Object.prototype.hasOwnProperty.call(variables,name)?variables[name]:0;
  return normalizeVariableEntry(raw)||{type:'number',value:0};
 }
 function assignVariableValue(variables,name,value){
  const type=typeof value==='number'&&Number.isFinite(value)?'number':typeof value==='string'?'text':typeof value==='boolean'?'boolean':null;
  if(!type)throw Error('Variables can only store finite numbers, text or booleans.');
  const exists=Object.prototype.hasOwnProperty.call(variables,name),current=exists?readVariableRecord(variables,name):null;
  if(current?.constant)throw Error('Cannot change constant "'+name+'". Constants are read-only after creation.');
  if(current&&current.type!==type)throw Error('Type mismatch for variable "'+name+'": expected '+current.type+', received '+type+'.');
  if(!current&&Object.keys(variables).length>=100)throw Error('A project can contain at most 100 variables.');
  variables[name]={type,value};
  return variables[name];
 }
 function convertVariableValue(value,fromType,toType){
  if(!['number','text','boolean'].includes(fromType)||!['number','text','boolean'].includes(toType))throw Error('Unknown variable type.');
  if(fromType===toType)return value;
  if(toType==='text')return String(value);
  if(toType==='number'){
   if(fromType==='boolean')return value?1:0;
   const raw=String(value).trim(),number=Number(raw);
   if(!raw||!Number.isFinite(number))throw Error('Text must contain a finite number before it can become Number.');
   return number;
  }
  if(toType==='boolean'){
   if(fromType==='number'&&(value===0||value===1))return value===1;
   if(fromType==='text'){
    const raw=value.trim().toLowerCase();
    if(raw==='true'||raw==='false')return raw==='true';
   }
   throw Error('Boolean conversion accepts only 0 or 1, or the text true or false.');
  }
  throw Error('Unsupported variable type conversion.');
 }
 function changeVariableType(variables,name,targetType){
  const variableName=String(name||'').trim();
  if(!/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(variableName))throw Error('Invalid variable name "'+variableName+'".');
  if(!['number','text','boolean'].includes(targetType))throw Error('Unknown variable type "'+targetType+'".');
  if(!Object.prototype.hasOwnProperty.call(variables,variableName))throw Error('Variable "'+variableName+'" does not exist.');
  const current=readVariableRecord(variables,variableName);
  if(current.constant)throw Error('Cannot change the type of constant "'+variableName+'".');
  const converted=convertVariableValue(current.value,current.type,targetType);
  variables[variableName]={type:targetType,value:converted,constant:current.constant===true};
  return variables[variableName];
 }
 function variableFieldMode(blockType){
  const type=typeAliases[blockType]||blockType;
  return ['change','add','subtract','multiply','divide','if','ifElse','while','repeatUntil'].includes(type)?'number':'any';
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
   if(token.type==='variable'){cursor++;const entry=readVariableRecord(variables,token.value);if(entry.type!=='number')throw Error('Variable "'+token.value+'" is '+entry.type+', not numeric.');return entry.value;}
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
  const leftType=typeof left,rightType=typeof right;
  if(leftType!==rightType)throw Error('Cannot compare different value types ('+leftType+' and '+rightType+').');
  const equal=leftType==='string'?left.toLocaleLowerCase()===right.toLocaleLowerCase():left===right;
  switch(operator){
   case '=':case '==':return equal;
   case '!=':return !equal;
   case '>':case '<':case '>=':case '<=':
    if(leftType!=='number'&&leftType!=='string')throw Error('Relational comparison requires two numbers or two text values.');
    return operator==='>'?left>right:operator==='<'?left<right:operator==='>='?left>=right:left<=right;
   default:throw Error('Unknown comparison operator "'+operator+'".');
  }
 }
 function normalizeKeyName(value){
  const raw=String(value??'');
  if(raw===' ')return 'space';
  const key=raw.trim().toLowerCase();
  const aliases={spacebar:'space','space bar':'space',arrowup:'up','up arrow':'up',arrowdown:'down','down arrow':'down',arrowleft:'left','left arrow':'left',arrowright:'right','right arrow':'right',esc:'escape',return:'enter','any key':'any'};
  return aliases[key]||key;
 }
 function keyMatches(configured,pressed){
  const wanted=normalizeKeyName(configured||'space'),actual=normalizeKeyName(pressed);
  return wanted==='any'||wanted==='*'||wanted===actual;
 }
 function evaluateReporter(node,variables={},depth=0){
  if(!node||depth>40)throw Error('Reporter expression depth limit reached.');
  const fields=node.fields||{},inputs=node.inputs||{};
  const read=(key,fallback='0')=>inputs[key]?evaluateReporter(inputs[key],variables,depth+1):parseExpression(fields[key]??fallback,variables,key);
  const readText=(key,fallback='')=>inputs[key]?String(evaluateReporter(inputs[key],variables,depth+1)):String(fields[key]??fallback);
  const numeric=(value,label)=>{if(typeof value!=='number'||!Number.isFinite(value))throw Error(label+' reporter must return a finite number.');return value;};
  const boolean=(value,label)=>{if(typeof value!=='boolean')throw Error(label+' reporter must return a Boolean value.');return value;};
  const finite=(value,label)=>{if(!Number.isFinite(value))throw Error(label+' produced a non-finite number.');return value;};
  switch(typeAliases[node.type]||node.type){
   case 'number':return parseExpression(fields.value??'0',variables,'number');
   case 'random':{const min=parseExpression(fields.min??'1',variables,'random minimum'),max=parseExpression(fields.max??'10',variables,'random maximum');if(max<min)throw Error('Random maximum must be greater than or equal to minimum.');return Math.floor(Math.random()*(max-min+1))+min;}
   case 'round':return Math.round(numeric(read('value','0'),'Round'));
   case 'absolute':return Math.abs(numeric(read('value','0'),'Absolute value'));
   case 'modulo':{const a=numeric(read('a','0'),'Left operand'),b=numeric(read('b','0'),'Right operand');if(b===0)throw Error('Division by zero.');return a%b;}
   case 'timer':return Math.max(0,(Date.now()-(window.__nexusFlowTimer||Date.now()))/1000);
   case 'getVar':{
    const name=String(fields.variable||'score').trim();
    if(!/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(name))throw Error('Invalid variable name "'+name+'".');
    return readVariableRecord(variables,name).value;
   }
   case 'boolean':return String(fields.value??'true')==='true';
   case 'mathAdd':return finite(numeric(read('a','0'),'Left')+numeric(read('b','0'),'Right'),'Addition');
   case 'mathSubtract':return finite(numeric(read('a','0'),'Left')-numeric(read('b','0'),'Right'),'Subtraction');
   case 'mathMultiply':return finite(numeric(read('a','0'),'Left')*numeric(read('b','0'),'Right'),'Multiplication');
   case 'mathDivide':{
    const left=numeric(read('a','0'),'Left'),right=numeric(read('b','0'),'Right');
    if(right===0)throw Error('Division by zero.');
    return finite(left/right,'Division');
   }
   case 'compare':return compareValues(read('a','0'),fields.operator||'>',read('b','0'));
   case 'text':return String(fields.value??'');
   case 'join':return readText('left')+readText('right');
   case 'length':return Array.from(readText('value')).length;
   case 'contains':return readText('text').toLocaleLowerCase().includes(readText('search').toLocaleLowerCase());
   case 'listLength':return readText('items').split(',').map(v=>v.trim()).filter(Boolean).length;
   case 'listItem':{const values=readText('items').split(',').map(v=>v.trim()).filter(Boolean),index=Math.floor(numeric(read('index','1'),'List index'));if(index<1||index>values.length)throw Error('List index is outside the available items.');return values[index-1];}
   case 'listContains':return readText('items').split(',').map(v=>v.trim().toLocaleLowerCase()).includes(readText('item').trim().toLocaleLowerCase());
   case 'and':{const left=boolean(read('left','0'),'Left operand'),right=boolean(read('right','0'),'Right operand');return left&&right;}
   case 'or':{const left=boolean(read('left','0'),'Left operand'),right=boolean(read('right','0'),'Right operand');return left||right;}
   case 'not':return !boolean(read('value','0'),'NOT operand');
   default:throw Error('Unsupported reporter block "'+node.type+'".');
  }
 }
 const defaultVariables=()=>Object.assign(Object.create(null),{score:{type:'number',value:0}});
 function normalizeVariables(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return defaultVariables();
  const result=Object.create(null);
  Object.entries(raw).forEach(([name,value])=>{
   if(!/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(name))return;
   const entry=normalizeVariableEntry(value);if(entry&&Object.keys(result).length<100)result[name]=entry;
  });
  if(!Object.prototype.hasOwnProperty.call(result,'score')&&Object.keys(result).length<100)result.score={type:'number',value:0};
  return result;
 }
 const load=()=>{
  try{
   const current=localStorage.getItem(KEY);
   if(current){const parsed=JSON.parse(current);return {...normalize(parsed),variables:normalizeVariables(parsed.variables),character:typeof parsed.character==='string'?parsed.character:'🐱'};}
   const old=localStorage.getItem('nexus.flow.scratch.v2');
   if(old){const parsed=JSON.parse(old);return {...normalize(parsed),variables:normalizeVariables(parsed.variables),character:typeof parsed.character==='string'?parsed.character:'🐱'};}
   return {...starter(),procedures:[],variables:defaultVariables()};
  }catch{return {...starter(),procedures:[],variables:defaultVariables()};}
 };
 api.flow={
  normalizeKey:normalizeKeyName,
  keyMatches,
  evaluateExpression:(expression,variables={})=>parseExpression(expression,variables),
  evaluateReporter:(reporter,variables={})=>evaluateReporter(reporter,variables),
  normalizeVariables,
  assignVariable:(variables,name,value)=>assignVariableValue(variables,name,value),
  convertVariableValue,
  changeVariableType,
  variableFieldMode,
  normalizeProcedures,
  validateProcedureName,
  render:()=>'<div class="flow2-shell"><header class="flow2-topbar"><div class="flow2-brand"><span class="flow2-mark">✳</span><div><b>FLOW STUDIO</b><small>VISUAL WORKSPACE / 2.0</small></div></div><div class="flow2-project"><input id="projectName" value="My first project" aria-label="Project name"><span class="flow2-save-state" id="flowSaveState">LOCAL PROJECT</span></div><div class="flow2-actions"><button class="flow2-action" id="flowUndo" title="Undo" disabled>↶</button><button class="flow2-action" id="flowRedo" title="Redo" disabled>↷</button><button class="flow2-action" id="flowSave" title="Save">▣ <span>Save</span></button><button class="flow2-action flow2-run" id="flowRun">▶ <span>Run</span></button><button class="flow2-action flow2-stop" id="flowStop" disabled>■ <span>Stop</span></button><button id="flowNew" hidden></button></div></header><div class="flow2-workbench"><aside class="graph-library flow2-library"><div class="flow2-panel-head"><div><b>BLOCK LIBRARY</b><small>DRAG BLOCKS TO THE WORKSPACE</small></div><span class="flow2-panel-icon">▦</span></div><label class="flow-block-search"><span>⌕</span><input id="blockSearch" type="search" placeholder="Search blocks…" aria-label="Search blocks"></label><div class="graph-categories" id="scratchCategories"></div><div class="graph-palette" id="scratchPalette"></div></aside><main class="graph-editor flow2-editor"><div class="flow2-canvas-toolbar"><div><b>WORKSPACE</b><span id="blockCount">0 BLOCKS</span></div><div class="flow2-canvas-actions"><button type="button" id="flowZoomOut" title="Zoom out">−</button><span id="flowZoomLabel">100%</span><button type="button" id="flowZoomIn" title="Zoom in">+</button><button type="button" id="flowCenterView" title="Center workspace">◎</button><button type="button" id="deleteLinks">Clear wires</button><button type="button" id="wireMode">⌁ Wire off</button></div></div><div class="graph-canvas flow2-canvas" id="graphCanvas"><svg class="graph-wires" id="graphWires"></svg><div id="graphNodes"></div><div class="graph-empty" id="graphEmpty">Drag blocks here from the library</div></div><div class="graph-status" id="graphStatus">Drag blocks onto the workspace. Select a block to inspect its properties.</div></main><aside class="graph-side flow2-inspector"><section class="flow2-inspector-section"><div class="flow2-panel-head"><div><b>INSPECTOR</b><small>SELECTED BLOCK OR CHARACTER</small></div><span class="flow2-panel-icon">⚙</span></div><div id="flowInspector" class="flow2-inspector-content"><div class="flow2-inspector-empty">Select a block on the workspace or choose a character below.</div></div></section><section class="flow2-inspector-section flow2-character-section"><div class="scratch-panel-title"><b>CHARACTER</b><small>STAGE PREVIEW</small></div><div class="stage-character-picker"><label for="stageCharacter">SPRITE</label><select id="stageCharacter" aria-label="Choose stage character"><option value="🐱">🐱 Cat</option><option value="🐶">🐶 Dog</option><option value="🐰">🐰 Rabbit</option><option value="🦊">🦊 Fox</option><option value="🐻">🐻 Bear</option><option value="🐼">🐼 Panda</option><option value="🐸">🐸 Frog</option><option value="🐵">🐵 Monkey</option><option value="🐧">🐧 Penguin</option><option value="🦉">🦉 Owl</option><option value="🦁">🦁 Lion</option><option value="🐯">🐯 Tiger</option><option value="🐮">🐮 Cow</option><option value="🐷">🐷 Pig</option><option value="🐨">🐨 Koala</option><option value="🐹">🐹 Hamster</option><option value="🐺">🐺 Wolf</option><option value="🦄">🦄 Unicorn</option><option value="🐲">🐲 Dragon</option><option value="🐙">🐙 Octopus</option><option value="🦖">🦖 Dinosaur</option><option value="🐢">🐢 Turtle</option><option value="🐬">🐬 Dolphin</option><option value="🦋">🦋 Butterfly</option><option value="🐝">🐝 Bee</option><option value="🤖">🤖 Robot</option><option value="👾">👾 Alien</option><option value="👻">👻 Ghost</option><option value="🥷">🥷 Ninja</option><option value="🚀">🚀 Rocket</option></select></div><div class="scratch-stage" id="scratchStage"><div class="stage-grid"></div><div class="stage-sprite" id="stageSprite">🐱</div><div class="stage-bubble" id="stageBubble" hidden></div></div><div class="stage-controls"><button id="stageReset">↺ RESET</button><span id="stagePosition">x: 0 y: 0</span></div></section><section class="flow2-inspector-section flow2-output-section"><div class="scratch-console"><div class="scratch-panel-title"><b>OUTPUT</b><button id="clearOutput">CLEAR</button></div><div id="scratchOutput" class="scratch-output">Ready. Press RUN to execute the script.</div><div class="flow-variable-manager"><div class="flow-variable-tools"><input id="newVariableName" placeholder="new variable" maxlength="32" aria-label="New variable name"><select id="newVariableType" aria-label="Variable type"><option value="number">Number</option><option value="text">Text</option><option value="boolean">Boolean</option></select><button id="addVariable" type="button">+ ADD</button></div><div id="flowVariableList" class="flow-variable-list"></div><datalist id="flowVariableOptions"></datalist></div><div class="flow-procedure-manager"><div class="flow-procedure-tools"><input id="newProcedureName" placeholder="custom block name" maxlength="32" aria-label="New custom block name"><button id="addProcedure" type="button">+ CREATE</button></div><div id="flowProcedureList" class="flow-procedure-list"></div></div><div id="variableReadout" class="variable-readout">Variables: score = 0</div></div></section></aside></div><footer class="scratch-footer flow2-footer"><span><i></i> LOCAL PROJECT · AUTOSAVE READY</span><span>Hybrid block editor · Manual connections</span></footer></div>',
  mount(root){
   let data=load(),nodes=data.nodes,links=data.links,procedures=data.procedures||[],character=typeof data.character==='string'?data.character:'🐱',category='all',wireMode=false,pending=null,running=false,stopFlag=false,runAbort=null,x=0,y=0,angle=0,visible=true,vars=data.variables||defaultVariables(),runtimeSteps=0,runtimeFailure=null,activeKeyTasks=new Set(),keyHandler=null;
   const MAX_STEPS=100000,MAX_DEPTH=40;
   const $=s=>root.querySelector(s),canvas=$('#graphCanvas'),nodeLayer=$('#graphNodes'),wireSvg=$('#graphWires'),palette=$('#scratchPalette'),out=$('#scratchOutput'),sprite=$('#stageSprite'),bubble=$('#stageBubble');
   const characterSelect=$('#stageCharacter');
   let selectedBlockId=null,workspaceZoom=1,history=[],historyIndex=-1,restoringHistory=false;
   const snapshot=()=>JSON.stringify({nodes,links,procedures,variables:vars,character});
   const updateHistoryButtons=()=>{const u=$('#flowUndo'),r=$('#flowRedo');if(u)u.disabled=historyIndex<=0;if(r)r.disabled=historyIndex<0||historyIndex>=history.length-1;};
   if(root._flowLifecycleObserver)root._flowLifecycleObserver.disconnect();
   const lifecycleObserver=typeof MutationObserver==='function'?new MutationObserver(()=>{
    if(running&&(root.hidden||!$('#flowRun'))){stopFlag=true;if(runAbort)runAbort.abort();}
   }):null;
   if(lifecycleObserver){root._flowLifecycleObserver=lifecycleObserver;lifecycleObserver.observe(root,{attributes:true,attributeFilter:['hidden'],childList:true});}

   const log=s=>{const d=document.createElement('div');d.textContent=String(s);out.append(d);out.scrollTop=out.scrollHeight;};
   const setStatus=s=>{const el=$('#graphStatus');if(el)el.textContent=s;};
   const countBlock=n=>1+countBlocks(n.children||[])+countBlocks(n.elseChildren||[])+Object.values(n.inputs||{}).filter(Boolean).reduce((sum,child)=>sum+countBlock(child),0);
   const countBlocks=list=>list.reduce((sum,n)=>sum+countBlock(n),0);
   const save=()=>{
    try{
     const current=snapshot();
     if(!restoringHistory&&history[historyIndex]!==current){history=history.slice(0,historyIndex+1);history.push(current);if(history.length>100)history.shift();historyIndex=history.length-1;}
     localStorage.setItem(KEY,JSON.stringify({version:6,nodes,links,procedures,variables:vars,character}));
     const count=$('#blockCount');if(count)count.textContent=countBlocks(nodes)+' BLOCKS · '+links.length+' WIRES';
     const state=$('#flowSaveState');if(state)state.textContent='✓ SAVED LOCALLY';
     updateHistoryButtons();
    }catch(e){log('Save error: '+e.message);}
   };
   function applyHistory(index){if(index<0||index>=history.length)return;restoringHistory=true;const data=JSON.parse(history[index]);nodes=data.nodes||[];links=data.links||[];procedures=data.procedures||[];vars=data.variables||defaultVariables();character=data.character||'🐱';historyIndex=index;selectedBlockId=null;updateVars();render();renderPalette();updateSprite();saveWithoutHistory();restoringHistory=false;updateHistoryButtons();}
   function saveWithoutHistory(){localStorage.setItem(KEY,JSON.stringify({version:6,nodes,links,procedures,variables:vars,character}));const state=$('#flowSaveState');if(state)state.textContent='✓ SAVED LOCALLY';}
   function renderVariableManager(){
    const list=$('#flowVariableList'),options=$('#flowVariableOptions');
    if(!list||!options)return;
    list.replaceChildren();options.replaceChildren();
    Object.entries(vars).sort(([a],[b])=>a.localeCompare(b)).forEach(([name,value])=>{
     const option=document.createElement('option');option.value=name;options.append(option);
     const row=document.createElement('div');row.className='flow-variable-row';
     const label=document.createElement('span');label.textContent=name;
     const typeSelect=document.createElement('select');typeSelect.className='flow-variable-type';typeSelect.setAttribute('aria-label','Change '+name+' type');
     [['number','Number'],['text','Text'],['boolean','Boolean']].forEach(([type,labelText])=>{const choice=document.createElement('option');choice.value=type;choice.textContent=labelText;typeSelect.append(choice);});
     typeSelect.value=value.type;
     typeSelect.addEventListener('change',()=>{
      if(running){typeSelect.value=value.type;return;}
      try{
       const changed=changeVariableType(vars,name,typeSelect.value);
       save();updateVars();log('Variable type changed: '+name+' → '+changed.type.toUpperCase());
      }catch(error){
       typeSelect.value=value.type;setStatus('Type change rejected: '+error.message);log('Variable type change rejected: '+error.message);
      }
     });
     const current=document.createElement('small');current.textContent=String(value.value);
     const constant=document.createElement('button');constant.type='button';constant.className='flow-variable-constant'+(value.constant?' active':'');constant.textContent=value.constant?'CONST':'VAR';constant.title=value.constant?'Make variable mutable':'Make variable constant';constant.disabled=running;constant.addEventListener('click',()=>{if(running)return;vars[name]={...value,constant:!value.constant};updateVars();save();log(name+(vars[name].constant?' is now constant.':' is now mutable.'));});
     const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.title='Delete variable '+name;
     remove.addEventListener('click',()=>{if(running)return;delete vars[name];updateVars();save();log('Variable deleted: '+name);});
     row.append(label,typeSelect,current,constant,remove);list.append(row);
    });
   }
   const updateVars=()=>{
    $('#variableReadout').textContent='Variables: '+Object.entries(vars).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+' ('+v.type+') = '+String(v.value)).join(' · ');
    renderVariableManager();refreshVariableFields();
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
   function populateVariableSelect(field,block,key,defaultValue){
    const current=String(block.fields[key]??defaultValue??'score'),mode=variableFieldMode(block.type);
    field.replaceChildren();
    let found=false;
    Object.entries(vars).sort(([a],[b])=>a.localeCompare(b)).forEach(([name,entry])=>{
     if(mode==='number'&&entry.type!=='number')return;
     const option=document.createElement('option');option.value=name;option.textContent=name+' · '+entry.type.toUpperCase();
     field.append(option);if(name===current)found=true;
    });
    if(!found){
     const existing=Object.prototype.hasOwnProperty.call(vars,current)?readVariableRecord(vars,current):null;
     const option=document.createElement('option');option.value=current;
     option.textContent=existing?current+' · '+existing.type.toUpperCase()+' (incompatible)':current+' · new variable';
     option.disabled=!!(existing&&mode==='number'&&existing.type!=='number');
     field.append(option);
    }
    field.value=current;
   }
   function refreshVariableFields(){
    root.querySelectorAll('select[data-variable-field="true"]').forEach(field=>{
     const block=findBlock(field.dataset.blockId);
     if(block)populateVariableSelect(field,block,field.dataset.field,field.value);
    });
   }
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
     const target=findBlock(id);
     if(target?.type==='procedureDef'){setStatus('Delete custom block definitions from the MY BLOCKS manager.');return;}
     const wasTop=!!findTop(id);
    if(!takeBlock(id))return;
    if(wasTop)links=links.filter(l=>l.from!==id&&l.to!==id);
    if(pending===id)pending=null;
    save();render();
   }
   function countProcedureCalls(procedureId){
     let count=0;
     const visit=block=>{
      if(!block)return;
      if(block.type==='callProcedure'&&String(block.fields?.procedureId||'')===procedureId)count++;
      (block.children||[]).forEach(visit);(block.elseChildren||[]).forEach(visit);
      Object.values(block.inputs||{}).forEach(visit);
     };
     nodes.forEach(visit);return count;
    }
    function renderProcedureManager(){
     const list=$('#flowProcedureList');if(!list)return;list.replaceChildren();
     if(!procedures.length){const empty=document.createElement('small');empty.className='flow-procedure-empty';empty.textContent='No custom blocks yet.';list.append(empty);return;}
     procedures.forEach(procedure=>{
      const row=document.createElement('div');row.className='flow-procedure-row';
      const name=document.createElement('b');name.textContent=procedure.name;
      const usage=countProcedureCalls(procedure.id);
      const meta=document.createElement('small');meta.textContent=usage?('USED '+usage+'×'):'READY';
      const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.title=usage?'Remove all calls before deleting this custom block':'Delete custom block';remove.disabled=usage>0||running;
      remove.addEventListener('click',()=>{
       if(usage>0||running)return;
       const definition=nodes.find(block=>block.type==='procedureDef'&&String(block.fields?.procedureId||'')===procedure.id);
       if(definition){takeBlock(definition.id);links=links.filter(link=>link.from!==definition.id&&link.to!==definition.id);}
       procedures=procedures.filter(item=>item.id!==procedure.id);
       save();render();renderPalette();renderProcedureManager();log('Custom block deleted: '+procedure.name);
      });
      row.append(name,meta,remove);list.append(row);
     });
    }
    function createProcedureCall(procedureId,x=80,y=70){
     return {id:uid(),type:'callProcedure',fields:{procedureId},inputs:{},x,y,children:[],elseChildren:[]};
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
   function readAssignedValue(block,key,name,fallback='0'){
    if(block.inputs&&block.inputs[key])return evaluateReporter(block.inputs[key],vars);
    const current=Object.prototype.hasOwnProperty.call(vars,name)?readVariableRecord(vars,name):null;
    const raw=String(block.fields?.[key]??fallback);
    if(current?.type==='text')return raw;
    if(current?.type==='boolean'){
     const normalized=raw.trim().toLowerCase();
     if(normalized!=='true'&&normalized!=='false')throw Error('Boolean value for "'+name+'" must be true or false.');
     return normalized==='true';
    }
    return parseExpression(raw,vars,key);
   }
   function readNumericVariable(name){
    const entry=readVariableRecord(vars,name);
    if(entry.type!=='number')throw Error('Variable "'+name+'" is '+entry.type+', not numeric.');
    return entry.value;
   }
   function readValue(block,key,fallback=''){
    return block.inputs&&block.inputs[key]?evaluateReporter(block.inputs[key],vars):String(block.fields?.[key]??fallback);
   }
   function compare(left,operator,right){return compareValues(left,operator,right);}
   function conditionFor(n){
    if(n.inputs&&n.inputs.condition){
     const condition=evaluateReporter(n.inputs.condition,vars);
     if(typeof condition!=='boolean')throw Error('IF condition reporter must return a Boolean value.');
     return condition;
    }
    const f=n.fields||{},name=validVariableName(f.variable||'score');
    return compare(readVariableRecord(vars,name).value,f.operator||'>',readExpression(n,'value','0','condition value'));
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
   const FAVORITES_KEY=KEY+'.favorites';
   let favorites=[];try{favorites=JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]');if(!Array.isArray(favorites))favorites=[];}catch{favorites=[];}
   const blockDescriptions={
    flag:'Starts a script when the project is run.',key:'Starts a script when the selected keyboard key is pressed.',
    move:'Moves the character in the direction it is facing.',turn:'Rotates the character by the chosen angle.',goto:'Moves the character to the specified coordinates.',
    repeat:'Runs the blocks inside its DO slot a fixed number of times.',while:'Repeats its DO slot while the condition remains true.',forever:'Repeats the nested blocks until the user presses STOP.',
    if:'Runs nested blocks only when the condition is true.',ifElse:'Runs the DO or ELSE branch depending on the condition.',
    repeatUntil:'Repeats nested blocks until the condition becomes true.',procedureDef:'Defines a reusable custom function; place statements inside DO.',
    random:'Returns a random integer between the minimum and maximum.',getVar:'Returns the current value of a variable.',
    compare:'Compares two values and returns true or false.',and:'Returns true only when both inputs are true.',or:'Returns true when at least one input is true.',not:'Inverts a Boolean value.',
    join:'Combines two text values.',length:'Returns the number of characters in a text value.',contains:'Checks whether text contains another text value.',
    timer:'Returns seconds elapsed since the script started.',wait:'Pauses the script for the specified number of seconds.',broadcast:'Sends a named message to every matching receiver script.',whenMessage:'Starts this script whenever a matching broadcast message is received.'
   };
   const describeBlock=d=>blockDescriptions[d.id]||((d.kind==='reporter'?'Returns a value: ':'Runs an action: ')+d.label+'.');
   const toggleFavorite=(id)=>{favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];try{localStorage.setItem(FAVORITES_KEY,JSON.stringify(favorites));}catch{}renderPalette();};
   function renderPalette(){
     palette.replaceChildren();
     const query=(root.querySelector('#blockSearch')?.value||'').trim().toLowerCase();
     const duplicateLabels=new Set(['when space is pressed','when enter is pressed']);
     const candidates=defs.filter(d=>d.id!=='procedureDef');
     const filtered=candidates.filter(d=>(category==='favorites'?favorites.includes(d.id):(query||category==='all'?true:d.cat===category))&&(!query||d.label.toLowerCase().includes(query)||d.id.toLowerCase().includes(query)||describeBlock(d).toLowerCase().includes(query)));
     filtered.forEach(d=>{
      const el=document.createElement('div');el.className='flow-library-item';
      const add=document.createElement('button');add.className='code-block '+d.cat+' graph-library-block';add.draggable=true;add.textContent=d.label;add.title=describeBlock(d);
      add.addEventListener('dragstart',e=>{e.dataTransfer.setData('application/x-nexus-type',d.id);e.dataTransfer.setData('text/plain',d.id);e.dataTransfer.effectAllowed='copy';});
      add.addEventListener('click',()=>{
       if(isReporter(d.id)){$('#graphStatus').textContent='Reporter blocks belong inside a matching expression slot. Drag this block into a slot.';return;}
       const n=make(d.id,60+Math.random()*120,70+Math.random()*100);nodes.push(n);save();render();
      });
      const star=document.createElement('button');star.type='button';star.className='flow-favorite '+(favorites.includes(d.id)?'active':'');star.textContent=favorites.includes(d.id)?'★':'☆';star.title=favorites.includes(d.id)?'Remove from favorites':'Add to favorites';star.setAttribute('aria-label',star.title);star.addEventListener('click',e=>{e.stopPropagation();toggleFavorite(d.id);});
      el.append(add,star);palette.append(el);
     });
     if(!filtered.length){const empty=document.createElement('div');empty.className='flow-palette-empty';empty.textContent=category==='favorites'?'No favorite blocks yet. Press ☆ beside a block to save it.':'No blocks match this search. Try All blocks or clear the search.';palette.append(empty);}
     if(category==='myBlocks'||category==='functions'){
      const matches=procedures.filter(procedure=>!query||('call '+procedure.name).toLowerCase().includes(query));
      matches.forEach(procedure=>{
       const el=document.createElement('button');el.className='code-block myBlocks graph-library-block';el.draggable=true;el.textContent='call '+procedure.name;
       el.addEventListener('dragstart',e=>{
        e.dataTransfer.setData('application/x-nexus-type','callProcedure');e.dataTransfer.setData('application/x-nexus-procedure-id',procedure.id);
        e.dataTransfer.setData('text/plain','call '+procedure.name);e.dataTransfer.effectAllowed='copy';
       });
       el.addEventListener('click',()=>{nodes.push(createProcedureCall(procedure.id,60+Math.random()*120,70+Math.random()*100));save();render();});
       palette.append(el);
      });
      if(!matches.length){const empty=document.createElement('div');empty.className='flow-palette-empty';empty.textContent=procedures.length?'No custom blocks match this search.':'Create a custom block in the stage panel first.';palette.append(empty);}
     }
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
    if(node.type==='procedureDef'){setStatus('Custom block definitions are standalone containers and cannot be wired.');return;}
    if(!wireMode){$('#graphStatus').textContent='Turn WIRE mode on to connect top-level blocks.';return;}
    if(side==='out'){
     pending=node.id;$('#graphStatus').textContent='Output selected. Click another top-level block input.';renderPorts();return;
    }
    if(eventTypes.has(node.type)){$('#graphStatus').textContent='Event blocks must stay at the start of a top-level script.';return;}
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
      if(!moving||isReporter(moving.type)||eventTypes.has(moving.type)||containsBlock(moving,ownerId)){log('Event hats must remain at the top level; only statement blocks can be placed in control slots.');return;}
      const wasTop=!!findTop(movingId),block=takeBlock(movingId);
      if(!block)return;
      if(wasTop)links=links.filter(l=>l.from!==movingId&&l.to!==movingId);
      if(pending===movingId)pending=null;
      target.push(block);
     }else{
      const type=e.dataTransfer.getData('application/x-nexus-type')||e.dataTransfer.getData('text/plain');
      if(!def(type))return;
      if(isReporter(type)){$('#graphStatus').textContent='Reporter blocks must be dropped into an expression slot.';return;}
      if(eventTypes.has(type)){$('#graphStatus').textContent='Event blocks must start a top-level script.';return;}
      if(type==='callProcedure'){
        const procedureId=e.dataTransfer.getData('application/x-nexus-procedure-id');
        if(!procedures.some(procedure=>procedure.id===procedureId)){setStatus('This custom block no longer exists.');return;}
        target.push(createProcedureCall(procedureId,20,20));
       }else target.push(make(type,20,20));
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
     const hint=document.createElement('span');hint.className='flow-reporter-hint';hint.textContent='Drop a value / reporter here';slot.append(hint);
    }
    addExpressionDropHandlers(slot,owner.id,key);wrap.append(slot);return wrap;
   }
   function renderBlock(n,nested=false){
    const procedure=procedures.find(item=>item.id===String(n.fields?.procedureId||''));
     const d=def(n.type)||(n.type==='callProcedure'?{id:'callProcedure',cat:'myBlocks',label:'call custom block',fields:[]}:null);if(!d)return null;
    const card=document.createElement('div');
    card.className='graph-node '+d.cat+(nested?' nested-node':'')+(isReporter(n.type)?' reporter-node':'')+(containerTypes.has(n.type)?' graph-container':'');
    card.dataset.id=n.id;
    if(!nested){card.style.left=n.x+'px';card.style.top=n.y+'px';if(selectedBlockId===n.id)card.classList.add('flow-selected');}
    card.addEventListener('click',e=>{if(e.target.closest('button,input,select'))return;selectedBlockId=n.id;render();renderInspector();});
    if(!nested){
     const top=document.createElement('button');top.className='graph-port input-port';top.dataset.node=n.id;top.dataset.side='in';top.title='Input connector';top.addEventListener('click',()=>connectPort(n,'in'));card.append(top);
    }
    const title=document.createElement('div');title.className='graph-node-title';title.textContent=n.type==='procedureDef'?'define '+(procedure?.name||'missing custom block'):n.type==='callProcedure'?'call '+(procedure?.name||'missing custom block'):d.label;title.title=describeBlock(d)+' Drag this block into a control slot or expression slot.';title.draggable=true;
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
     }else if(key==='variable'){
      field=document.createElement('select');field.dataset.variableField='true';field.dataset.blockId=n.id;
      populateVariableSelect(field,n,key,defaultValue);
     }else{
      field=document.createElement('input');field.type='text';field.spellcheck=false;
     }
     field.className='graph-field';if(key!=='variable')field.value=n.fields[key]??defaultValue;field.setAttribute('aria-label',key);field.title=key;field.dataset.field=key;
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
       n.x=ox+(ev.clientX-sx)/workspaceZoom;n.y=oy+(ev.clientY-sy)/workspaceZoom;try{const p=JSON.parse(localStorage.getItem('nexus.settings.v1')||'{}').extras||{};if(p.flowSnapGrid){n.x=Math.round(n.x/20)*20;n.y=Math.round(n.y/20)*20;}}catch{}
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
     nodeLayer.style.width=Math.min(6000,Math.max(canvas.clientWidth||900,2400,...nodes.map(n=>(Number(n.x)||0)+520)))+'px';
     nodeLayer.style.height=Math.min(3600,Math.max(canvas.clientHeight||650,1600,...nodes.map(n=>(Number(n.y)||0)+360)))+'px';
     nodeLayer.replaceChildren();
     nodes.forEach(n=>{const card=renderBlock(n,false);if(card)nodeLayer.append(card);});
     $('#graphEmpty').hidden=nodes.length>0;
     $('#blockCount').textContent=countBlocks(nodes)+' BLOCKS · '+links.length+' WIRES';
     renderPorts();renderProcedureManager();
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(drawWires);else drawWires();
    renderInspector();
   }
   function renderInspector(){
    const panel=$('#flowInspector');if(!panel)return;panel.replaceChildren();
    const block=selectedBlockId?findBlock(selectedBlockId):null;
    if(!block){const empty=document.createElement('div');empty.className='flow2-inspector-empty';empty.textContent='Select a block on the workspace or choose a character below.';panel.append(empty);return;}
    const d=def(block.type)||{label:block.type,fields:[]};const heading=document.createElement('b');heading.textContent=d.label;heading.style.cssText='display:block;font-size:11px;margin-bottom:10px;color:#e7eaf4';panel.append(heading);
    (d.fields||[]).forEach(([key,fallback])=>{const label=document.createElement('label');label.style.cssText='display:grid;gap:5px;margin:8px 0;color:#98a5bb;font:9px var(--mono)';label.textContent=key.toUpperCase();let input=document.createElement('input');input.type='text';input.value=block.fields?.[key]??fallback;input.style.cssText='width:100%;padding:7px 8px;border:1px solid #3a455b;border-radius:5px;background:#222938;color:#e5eaf4';input.addEventListener('change',()=>{block.fields[key]=input.value;save();render();});label.append(input);panel.append(label);});
    const hint=document.createElement('small');hint.textContent='Block ID: '+block.id;hint.style.cssText='display:block;margin-top:12px;color:#77849a;font:8px var(--mono)';panel.append(hint);
   }
   function dropOnCanvas(e){
    e.preventDefault();
    const blockId=e.dataTransfer.getData('application/x-nexus-block');
    const rect=canvas.getBoundingClientRect();
    let px=Math.max(8,(e.clientX-rect.left+canvas.scrollLeft-105)/workspaceZoom),py=Math.max(8,(e.clientY-rect.top+canvas.scrollTop-25)/workspaceZoom);
    try{const p=JSON.parse(localStorage.getItem('nexus.settings.v1')||'{}').extras||{};if(p.flowSnapGrid){px=Math.round(px/20)*20;py=Math.round(py/20)*20;}}catch{}
    if(blockId){
     const block=findBlock(blockId);if(!block)return;
     if(isReporter(block.type)){$('#graphStatus').textContent='Reporter blocks must stay inside expression slots.';return;}
     const moving=takeBlock(blockId);if(!moving)return;
     moving.x=px;moving.y=py;nodes.push(moving);
    }else{
     const type=e.dataTransfer.getData('application/x-nexus-type')||e.dataTransfer.getData('text/plain');
      if(type==='callProcedure'){
       const procedureId=e.dataTransfer.getData('application/x-nexus-procedure-id');
       if(!procedures.some(procedure=>procedure.id===procedureId))return;
       nodes.push(createProcedureCall(procedureId,px,py));
      }else{
       if(!def(type))return;
       if(isReporter(type)){$('#graphStatus').textContent='Reporter blocks must be placed in an expression slot.';return;}
       nodes.push(make(type,px,py));
      }
    }
    save();render();$('#graphStatus').textContent='Block placed on workspace.';
   }
   canvas.addEventListener('dragover',e=>{e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='copy';});
   canvas.addEventListener('drop',dropOnCanvas);
   const setZoom=value=>{workspaceZoom=Math.max(.35,Math.min(2,Math.round(value*100)/100));nodeLayer.style.zoom=String(workspaceZoom);$('#flowZoomLabel').textContent=Math.round(workspaceZoom*100)+'%';};
   $('#flowZoomIn').addEventListener('click',()=>setZoom(workspaceZoom+.1));
   $('#flowZoomOut').addEventListener('click',()=>setZoom(workspaceZoom-.1));
   $('#flowCenterView').addEventListener('click',()=>{canvas.scrollTo({left:0,top:0,behavior:'smooth'});setZoom(1);});
   canvas.addEventListener('pointerdown',e=>{if(e.target!==canvas&&e.target.id!=='graphEmpty')return;const sx=e.clientX,sy=e.clientY,left=canvas.scrollLeft,top=canvas.scrollTop;const move=ev=>{canvas.scrollLeft=left-(ev.clientX-sx);canvas.scrollTop=top-(ev.clientY-sy);};const up=()=>{canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);};canvas.setPointerCapture(e.pointerId);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);});
   cats.forEach(([id,name])=>{
    const b=document.createElement('button');b.className='category-button '+id;b.textContent=name;b.title=name+' category';
    b.addEventListener('click',()=>{
     category=id;root.querySelectorAll('.category-button').forEach(v=>v.classList.toggle('active',v===b));renderPalette();
    });
    $('#scratchCategories').append(b);
   });
   let spriteScale=1,spriteOpacity=1;
   function updateSprite(){
    sprite.textContent=character;
    sprite.style.left='calc(50% + '+x+'px)';sprite.style.top='calc(50% - '+y+'px)';
    sprite.style.transform='translate(-50%,-50%) rotate('+angle+'deg) scale('+spriteScale+')';
    sprite.style.opacity=String(spriteOpacity);
    sprite.style.display=visible?'grid':'none';
    $('#stagePosition').textContent='x: '+Math.round(x)+' y: '+Math.round(y);
   }
   function gsapPromise(factory){
    return new Promise(resolve=>{
     let animation=null,settled=false;
     const finish=()=>{
      if(settled)return;settled=true;
      if(runAbort)runAbort.signal.removeEventListener('abort',abort);
      resolve();
     };
     const abort=()=>{if(animation&&typeof animation.kill==='function')animation.kill();finish();};
     animation=factory(finish);
     if(runAbort&&!settled){
      runAbort.signal.addEventListener('abort',abort,{once:true});
      if(runAbort.signal.aborted)abort();
     }
    });
   }
   function animateSprite(target,duration){
    const seconds=Math.max(0.05,Math.min(30,Number(duration)||1));
    if(window.gsap){
     const state={x,y,angle,scale:spriteScale,opacity:spriteOpacity};
     return gsapPromise(finish=>window.gsap.to(state,{...target,duration:seconds,ease:'power2.inOut',onUpdate:()=>{
      x=state.x;y=state.y;angle=state.angle;spriteScale=state.scale;spriteOpacity=state.opacity;updateSprite();
     },onComplete:finish}));
    }
    if(target.x!==undefined)x=target.x;if(target.y!==undefined)y=target.y;
    if(target.angle!==undefined)angle=target.angle;if(target.scale!==undefined)spriteScale=target.scale;
    if(target.opacity!==undefined)spriteOpacity=target.opacity;updateSprite();
    return wait(seconds*1000);
   }
   function resetSprite(){
    x=0;y=0;angle=0;spriteScale=1;spriteOpacity=1;visible=true;if(window.gsap)window.gsap.killTweensOf(sprite);bubble.hidden=true;updateSprite();updateVars();
   }
   async function runBlock(n,depth=0){
    if(stopFlag)return;
    if(depth>MAX_DEPTH)throw Error('Nested block depth limit reached.');
    tick();
    const f=n.fields||{},name=validVariableName(f.variable||'score');
    switch(typeAliases[n.type]||n.type){
     case 'flag':log('🚩 Start');break;
     case 'key':log('⌨ Key handler: '+normalizeKeyName(f.key||'space'));break;
      case 'procedureDef':throw Error('Custom block definitions cannot run directly. Use a call block.');
      case 'callProcedure':{
       const procedureId=String(f.procedureId||''),procedure=procedures.find(item=>item.id===procedureId);
       const definition=nodes.find(block=>block.type==='procedureDef'&&String(block.fields?.procedureId||'')===procedureId);
       if(!procedure||!definition)throw Error('Custom block "'+(procedure?.name||procedureId||'unknown')+'" has no definition.');
       if(depth>=MAX_DEPTH)throw Error('Custom block call depth limit reached.');
       log('↳ '+procedure.name+'()');await executeSequence(definition.children||[],depth+1);break;
      }
      case 'move':{const steps=readNumber(f.steps,'steps');x+=Math.cos(angle*Math.PI/180)*steps;y+=Math.sin(angle*Math.PI/180)*steps;updateSprite();break;}
     case 'turn':angle+=readNumber(f.degrees,'degrees');updateSprite();break;
     case 'goto':x=readNumber(f.x,'x');y=readNumber(f.y,'y');updateSprite();break;
     case 'glide':await animateSprite({x:readNumber(f.x,'x'),y:readNumber(f.y,'y')},f.duration);break;
     case 'rotateTo':await animateSprite({angle:readNumber(f.degrees,'degrees')},f.duration);break;
     case 'scaleTo':await animateSprite({scale:Math.max(0.05,Math.min(5,readNumber(f.scale,'scale')/100))},f.duration);break;
     case 'fadeTo':await animateSprite({opacity:Math.max(0,Math.min(100,readNumber(f.opacity,'opacity')))/100},f.duration);break;
     case 'bounce':{const h=Math.max(0,Math.min(180,readNumber(f.height,'height'))),d=Math.max(0.1,Math.min(5,Number(f.duration)||0.6)),origin=y;if(window.gsap){await gsapPromise(finish=>window.gsap.timeline({onComplete:finish}).to(sprite,{y:'-='+h,duration:d/2,ease:'power2.out'}).to(sprite,{y:'+='+h,duration:d/2,ease:'bounce.out'}));}else{await animateSprite({y:origin+h},d/2);if(!stopFlag)await animateSprite({y:origin},d/2);}break;}
     case 'pulse':{const original=spriteScale,target=Math.max(0.05,Math.min(5,readNumber(f.scale,'scale')/100)),duration=Number(f.duration)||0.4;await animateSprite({scale:target},duration);if(!stopFlag)await animateSprite({scale:original},duration);break;}
     case 'shake':{const strength=Math.max(1,Math.min(40,readNumber(f.strength,'strength'))),duration=Math.max(.1,Math.min(3,Number(f.duration)||.45));if(window.gsap)await gsapPromise(finish=>window.gsap.to(sprite,{x:'+='+strength,repeat:5,yoyo:true,duration:duration/6,ease:'sine.inOut',onComplete:finish}));else await wait(duration*1000);break;}
     case 'spin':await animateSprite({angle:angle+readNumber(f.turns,'turns')*360},f.duration);break;
     case 'jump':{const h=Math.max(0,Math.min(220,readNumber(f.height,'height'))),d=Math.max(.1,Math.min(5,Number(f.duration)||.55));if(window.gsap)await gsapPromise(finish=>window.gsap.timeline({onComplete:finish}).to(sprite,{y:'-='+h,duration:d*.45,ease:'power2.out'}).to(sprite,{y:'+='+h,duration:d*.55,ease:'bounce.out'}));else await wait(d*1000);break;}
     case 'colorTo':{const hue=((readNumber(f.hue,'hue')%360)+360)%360;const duration=Math.max(.05,Math.min(5,Number(f.duration)||.5));if(window.gsap)await gsapPromise(finish=>window.gsap.to(sprite,{filter:'hue-rotate('+hue+'deg)',duration,ease:'power1.inOut',onComplete:finish}));else sprite.style.filter='hue-rotate('+hue+'deg)';break;}
     case 'flash':{const times=Math.max(1,Math.min(10,Math.floor(readNumber(f.times,'times')))),duration=Math.max(.05,Math.min(1,Number(f.duration)||.18));if(window.gsap)await gsapPromise(finish=>window.gsap.to(sprite,{opacity:.12,repeat:times*2-1,yoyo:true,duration,ease:'none',onComplete:finish}));else for(let i=0;i<times*2&&!stopFlag;i++){sprite.style.opacity=i%2?'1':'.12';await wait(duration*1000);}spriteOpacity=1;updateSprite();break;}
     case 'trail':{const enabled=String(f.enabled)!=='false';sprite.style.filter=enabled?'drop-shadow(0 0 8px currentColor)':'';log('Glow effect '+(enabled?'enabled':'disabled'));break;}
     case 'resetTimer':window.__nexusFlowTimer=Date.now();log('Timer reset');break;
     case 'playTone':{const frequency=Math.max(20,Math.min(20000,readNumber(f.frequency,'frequency'))),duration=Math.max(.05,Math.min(10,readNumber(f.duration,'duration'))),volume=Math.max(0,Math.min(1,readNumber(f.volume,'volume')));const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw Error('Web Audio is not supported in this browser.');window.__nexusFlowAudioContext=window.__nexusFlowAudioContext||new AudioCtx();const ctx=window.__nexusFlowAudioContext;if(ctx.state==='suspended')await ctx.resume();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=frequency;gain.gain.value=volume;osc.connect(gain);gain.connect(ctx.destination);window.__nexusFlowOscillator=osc;osc.start();await new Promise(resolve=>{const timer=setTimeout(resolve,duration*1000);if(runAbort)runAbort.signal.addEventListener('abort',()=>{clearTimeout(timer);resolve();},{once:true});});try{osc.stop();}catch{}if(window.__nexusFlowOscillator===osc)window.__nexusFlowOscillator=null;break;}
     case 'stopTone':if(window.__nexusFlowOscillator){try{window.__nexusFlowOscillator.stop();}catch{}window.__nexusFlowOscillator=null;}log('Audio stopped');break;
     case 'httpGet':{const url=String(f.url||'').trim();if(!/^https:\/\//i.test(url))throw Error('Network block only allows HTTPS URLs.');const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);if(runAbort)runAbort.signal.addEventListener('abort',()=>controller.abort(),{once:true});try{const response=await fetch(url,{method:'GET',headers:{Accept:'application/json, text/plain;q=0.9, */*;q=0.1'},signal:controller.signal,credentials:'omit',redirect:'follow'});if(!response.ok)throw Error('HTTP '+response.status+' '+response.statusText);const body=await response.text();if(body.length>100000)throw Error('Network response exceeds the 100 KB limit.');const target=validVariableName(f.variable||'response');ensureVariableCapacity(target);if(!Object.prototype.hasOwnProperty.call(vars,target))vars[target]={type:'text',value:''};if(vars[target].type!=='text')throw Error('Response variable must have Text type.');assignVariableValue(vars,target,body);updateVars();save();log('HTTPS GET completed: '+response.status+' ('+body.length+' chars)');}finally{clearTimeout(timeout);}break;}
     case 'log':log(String(readValue(n,'text',f.text||'')));break;
     case 'clearBubble':bubble.hidden=true;break;
     case 'say':case 'think':{
      const message=String(readValue(n,'text',f.text||''));
      bubble.textContent=(n.type==='think'?'💭 ':'')+message;bubble.hidden=false;log(message);break;
     }
     case 'show':visible=true;updateSprite();break;
     case 'hide':visible=false;updateSprite();break;
     case 'wait':{const seconds=readNumber(f.seconds,'seconds');if(seconds<0||seconds>60)throw Error('Wait must be between 0 and 60 seconds.');await wait(seconds*1000);break;}
     case 'set':{
      ensureVariableCapacity(name);
      const value=readAssignedValue(n,'value',name,'0');
      assignVariableValue(vars,name,value);updateVars();save();log(name+' = '+String(value));break;
     }
     case 'change':{
      ensureVariableCapacity(name);
      const next=readNumericVariable(name)+readExpression(n,'value','1','change amount');
      if(!Number.isFinite(next))throw Error('Variable "'+name+'" change produced a non-finite number.');
      assignVariableValue(vars,name,next);updateVars();save();log(name+' → '+next);break;
     }
     case 'print':{
      const entry=readVariableRecord(vars,name);log(name+' = '+String(entry.value)+' ('+entry.type+')');break;
     }
     case 'add':case 'subtract':case 'multiply':case 'divide':{
      const a=readExpression(n,'a','0','first operand'),b=readExpression(n,'b','0','second operand');
      if(n.type==='divide'&&b===0)throw Error('Division by zero.');
      const result=n.type==='add'?a+b:n.type==='subtract'?a-b:n.type==='multiply'?a*b:a/b;
      if(!Number.isFinite(result))throw Error('Arithmetic result is not finite.');
      const target=validVariableName(f.variable||'result');ensureVariableCapacity(target);assignVariableValue(vars,target,result);updateVars();save();
      const symbol={add:'+',subtract:'−',multiply:'×',divide:'÷'}[n.type];log(target+' = '+a+' '+symbol+' '+b+' = '+result);break;
     }
     case 'while':{let guard=0;while(conditionFor(n)&&!stopFlag){if(++guard>MAX_STEPS)throw Error('WHILE safety limit reached. Check that the condition can become false.');tick();await executeSequence(n.children||[],depth+1);if(!(n.children||[]).length)await wait(50);}break;}
     case 'if':if(conditionFor(n))await executeSequence(n.children||[],depth+1);break;
     case 'ifElse':await executeSequence(conditionFor(n)?(n.children||[]):(n.elseChildren||[]),depth+1);break;
     case 'repeatUntil':{let guard=0;while(!conditionFor(n)&&!stopFlag){if(++guard>MAX_STEPS)throw Error('Repeat-until safety limit reached.');tick();if((n.children||[]).length)await executeSequence(n.children,depth+1);else await wait(100);}break;}
     case 'broadcast':{const message=String(readValue(n,'message',f.message||'')).trim();if(!message)throw Error('Broadcast message cannot be empty.');const receivers=nodes.filter(block=>block.type==='whenMessage'&&String(block.fields?.message||'').trim().toLowerCase()===message.toLowerCase());log('📨 Broadcast: '+message+' ('+receivers.length+' receiver'+(receivers.length===1?'':'s')+')');if(receivers.length){if(depth>=MAX_DEPTH)throw Error('Message recursion depth limit reached.');await Promise.all(receivers.map(receiver=>executeLinked(receiver.id,depth+1)));}break;}
     case 'whenMessage':break;
     case 'stopAll':requestStop('Stop all scripts requested.');break;
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
   function handleKeyDown(event){
    if(!running||stopFlag||root.hidden||!$('#flowRun'))return;
    const target=event.target;
    if(target&&target.closest&&target.closest('input,textarea,select,[contenteditable="true"],[contenteditable=""]'))return;
    const pressed=normalizeKeyName(event.key);
    if(!pressed||event.repeat)return;
    const matches=nodes.filter(n=>(typeAliases[n.type]||n.type)==='key'&&keyMatches(n.fields?.key||'space',pressed));
    if(!matches.length)return;
    if(['space','up','down','left','right'].includes(pressed))event.preventDefault();
    log('⌨ Key pressed: '+pressed);
    matches.forEach(block=>{
     if(activeKeyTasks.size>=8){log('Key event concurrency limit reached (8 scripts).');return;}
     let task;
     task=executeLinked(block.id).catch(error=>{
      if(!stopFlag){runtimeFailure=error;stopFlag=true;if(runAbort)runAbort.abort();}
     }).finally(()=>activeKeyTasks.delete(task));
     activeKeyTasks.add(task);
    });
   }
   function requestStop(message='Stop requested'){
    if(!running)return;
    stopFlag=true;if(runAbort)runAbort.abort();if(window.__nexusFlowOscillator){try{window.__nexusFlowOscillator.stop();}catch{}window.__nexusFlowOscillator=null;}log(message);setStatus('Stopping runtime…');
   }
   async function run(){
    if(running)return;
    running=true;stopFlag=false;runtimeSteps=0;runtimeFailure=null;activeKeyTasks.clear();window.__nexusFlowTimer=Date.now();runAbort=new AbortController();
    out.replaceChildren();resetSprite();$('#flowRun').disabled=true;$('#flowStop').disabled=false;
    setStatus('Runtime is executing.');
    log('NEXUS block runtime started');
    const starts=nodes.filter(n=>(typeAliases[n.type]||n.type)==='flag'),keyScripts=nodes.filter(n=>(typeAliases[n.type]||n.type)==='key'),messageScripts=nodes.filter(n=>n.type==='whenMessage');
    try{
     if(keyScripts.length){keyHandler=handleKeyDown;document.addEventListener('keydown',keyHandler);}
     if(!starts.length&&!keyScripts.length&&!messageScripts.length)log('No start block found. Add a start, key, or message event block.');
     if(!starts.length&&(keyScripts.length||messageScripts.length))log('No green-flag script found. Waiting for keyboard or broadcast events.');
     for(const n of starts){if(!stopFlag)await executeLinked(n.id);}
     if(runtimeFailure)throw runtimeFailure;
     if((keyScripts.length||messageScripts.length)&&!stopFlag){
      const names=keyScripts.length?[...new Set(keyScripts.map(n=>normalizeKeyName(n.fields?.key||'space')))].join(', '):'';
      log((names?'⌨ Listening for keys: '+names+'. ':'')+(messageScripts.length?'📨 Listening for broadcast messages. ':'')+'Press STOP to finish.');
      setStatus('Listening for keyboard and broadcast events. Press STOP to finish.');
      await new Promise(resolve=>{
       if(stopFlag){resolve();return;}
       runAbort.signal.addEventListener('abort',resolve,{once:true});
      });
     }
     if(runtimeFailure)throw runtimeFailure;
     log(stopFlag?'■ Stopped':'✓ Execution finished');
     setStatus(stopFlag?'Execution stopped.':'Execution finished successfully.');
    }catch(error){
     stopFlag=true;if(runAbort)runAbort.abort();
     log('RUNTIME ERROR: '+(error?.message||String(error)));
     setStatus('Runtime error: '+(error?.message||String(error)));
    }finally{
     if(keyHandler){document.removeEventListener('keydown',keyHandler);keyHandler=null;}
     if(activeKeyTasks.size)await Promise.allSettled(Array.from(activeKeyTasks));
     running=false;runAbort=null;const runButton=$('#flowRun'),stopButton=$('#flowStop');if(runButton)runButton.disabled=false;if(stopButton)stopButton.disabled=true;if((root.hidden||!runButton)&&lifecycleObserver){lifecycleObserver.disconnect();if(root._flowLifecycleObserver===lifecycleObserver)delete root._flowLifecycleObserver;}
    }
   }
   $('#wireMode').addEventListener('click',()=>{
    wireMode=!wireMode;pending=null;$('#wireMode').textContent=wireMode?'⌁ WIRE: ON':'⌁ WIRE: OFF';
    $('#wireMode').classList.toggle('wire-active',wireMode);
    $('#graphStatus').textContent=wireMode?'Click an output, then another top-level input.':'Wire mode off.';
    renderPorts();
   });
   $('#deleteLinks').addEventListener('click',()=>{links=[];pending=null;save();render();$('#graphStatus').textContent='All top-level wires removed.';});
   $('#flowUndo').addEventListener('click',()=>applyHistory(historyIndex-1));
   $('#flowRedo').addEventListener('click',()=>applyHistory(historyIndex+1));
   $('#flowRun').addEventListener('click',run);
   $('#flowStop').addEventListener('click',requestStop);
   $('#flowSave').addEventListener('click',()=>{save();log('✓ Project saved locally');});
   $('#flowNew').addEventListener('click',()=>{
    if(confirm('Create a new empty project?')){nodes=[];links=[];procedures=[];vars=defaultVariables();pending=null;updateVars();save();render();renderPalette();renderProcedureManager();out.textContent='New project created.';}
   });
   $('#stageReset').addEventListener('click',resetSprite);
   $('#addProcedure').addEventListener('click',()=>{
    if(running)return;
    try{
     const name=validateProcedureName($('#newProcedureName').value);
     if(procedures.length>=50)throw Error('A project can contain at most 50 custom blocks.');
     if(procedures.some(procedure=>procedure.name.toLowerCase()===name.toLowerCase()))throw Error('A custom block named "'+name+'" already exists.');
     const procedure={id:'p'+uid().slice(1),name};procedures.push(procedure);
     const definition=make('procedureDef',80+(procedures.length%3)*230,80+Math.floor((procedures.length-1)/3)*190);
     definition.fields.procedureId=procedure.id;nodes.push(definition);
     $('#newProcedureName').value='';save();render();renderPalette();renderProcedureManager();
     setStatus('Created "'+name+'". Add statements to its DO slot, then call it from MY BLOCKS.');
     log('Custom block created: '+name);
    }catch(error){setStatus('Custom block error: '+error.message);}
   });
   $('#newProcedureName').addEventListener('keydown',event=>{if(event.key==='Enter')$('#addProcedure').click();});
   $('#addVariable').addEventListener('click',()=>{
    try{
     const name=validVariableName($('#newVariableName').value);
     if(Object.prototype.hasOwnProperty.call(vars,name))throw Error('Variable "'+name+'" already exists.');
     if(Object.keys(vars).length>=100)throw Error('A project can contain at most 100 variables.');
     const type=$('#newVariableType').value;
     const initial=type==='text'?'':type==='boolean'?false:0;
     vars[name]={type,value:initial};$('#newVariableName').value='';updateVars();save();log('Variable created: '+name+' ('+type+').');
    }catch(error){$('#graphStatus').textContent='Variable error: '+error.message;}
   });
   $('#newVariableName').addEventListener('keydown',event=>{if(event.key==='Enter')$('#addVariable').click();});
   $('#clearOutput').addEventListener('click',()=>out.replaceChildren());
   $('#projectName').value=localStorage.getItem(KEY+'.name')||'My first project';
   $('#projectName').addEventListener('change',()=>localStorage.setItem(KEY+'.name',$('#projectName').value));
   root.querySelector('.category-button.all')?.classList.add('active');$('#blockSearch').addEventListener('input',renderPalette);
   characterSelect.value=characterSelect.querySelector('option[value="'+CSS.escape(character)+'"]')?character:'🐱';character=characterSelect.value;characterSelect.addEventListener('change',()=>{if(running){characterSelect.value=character;return;}character=characterSelect.value;updateSprite();save();log('Character changed: '+characterSelect.options[characterSelect.selectedIndex].text);});renderPalette();render();renderProcedureManager();updateSprite();updateVars();save();
  }
 };
})();
