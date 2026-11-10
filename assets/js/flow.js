(() => {
 const api=window.NEXUSModules=window.NEXUSModules||{},KEY='nexus.flow.graph.v1';
 const defs=[
  {id:'flag',cat:'events',label:'when 🚩 clicked',fields:[]},
  {id:'key',cat:'events',label:'when key pressed',fields:[['key','space']]},
  {id:'move',cat:'motion',label:'move steps',fields:[['steps','10']]},
  {id:'turn',cat:'motion',label:'turn degrees ↻',fields:[['degrees','15']]},
  {id:'goto',cat:'motion',label:'go to x / y',fields:[['x','0'],['y','0']]},
  {id:'glide',cat:'animation',label:'glide to x / y',fields:[['x','120'],['y','60'],['duration','1']]},
  {id:'rotateTo',cat:'animation',label:'animate rotation to',fields:[['degrees','360'],['duration','1']]},
  {id:'scaleTo',cat:'animation',label:'animate size to %',fields:[['scale','150'],['duration','0.5']]},
  {id:'fadeTo',cat:'animation',label:'fade opacity to %',fields:[['opacity','50'],['duration','0.5']]},
  {id:'bounce',cat:'animation',label:'bounce',fields:[['height','35'],['duration','0.6']]},
  {id:'pulse',cat:'animation',label:'pulse size',fields:[['scale','125'],['duration','0.4']]},
  {id:'shake',cat:'animation',label:'shake sprite',fields:[['strength','12'],['duration','0.45']]},
  {id:'spin',cat:'animation',label:'spin turns',fields:[['turns','2'],['duration','0.8']]},
  {id:'jump',cat:'animation',label:'jump',fields:[['height','55'],['duration','0.55']]},
  {id:'colorTo',cat:'effects',label:'set color hue',fields:[['hue','210'],['duration','0.5']]},
  {id:'flash',cat:'effects',label:'flash effect',fields:[['times','3'],['duration','0.18']]},
  {id:'trail',cat:'effects',label:'toggle glow effect',fields:[['enabled','true']]},
  {id:'random',cat:'operators',label:'random number reporter',kind:'reporter',fields:[['min','1'],['max','10']]},
  {id:'round',cat:'operators',label:'round number',kind:'reporter',fields:[]},
  {id:'absolute',cat:'operators',label:'absolute value',kind:'reporter',fields:[]},
  {id:'modulo',cat:'operators',label:'remainder ( ) % ( )',kind:'reporter',fields:[]},
  {id:'timer',cat:'sensing',label:'timer seconds reporter',kind:'reporter',fields:[]},
  {id:'resetTimer',cat:'sensing',label:'reset timer',fields:[]},
  {id:'log',cat:'data',label:'log message',fields:[['text','NEXUS ready']]},
  {id:'clearBubble',cat:'looks',label:'clear speech bubble',fields:[]},
  {id:'say',cat:'looks',label:'say',fields:[['text','Hello!']]},
  {id:'think',cat:'looks',label:'think',fields:[['text','Hmm...']]},
  {id:'show',cat:'looks',label:'show',fields:[]},
  {id:'hide',cat:'looks',label:'hide',fields:[]},
  {id:'wait',cat:'control',label:'wait seconds',fields:[['seconds','1']]},
  {id:'repeat',cat:'control',label:'repeat',fields:[['times','3']]},
  {id:'forever',cat:'control',label:'forever',fields:[]},
  {id:'repeatUntil',cat:'control',label:'repeat until condition',fields:[['variable','score'],['operator','>='],['value','10']]},
  {id:'stopAll',cat:'control',label:'stop all scripts',fields:[]},
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
  {id:'not',cat:'operators',label:'NOT',kind:'reporter',fields:[]},
  {id:'text',cat:'operators',label:'text reporter',kind:'reporter',fields:[['value','Hello']]},
  {id:'join',cat:'operators',label:'( ) join ( )',kind:'reporter',fields:[]},
  {id:'length',cat:'operators',label:'length of ( )',kind:'reporter',fields:[]},
  {id:'contains',cat:'operators',label:'( ) contains ( )',kind:'reporter',fields:[]},
  {id:"startOnLoad",cat:"events",label:"when project starts",fields:[]},
  {id:"whenClicked",cat:"events",label:"when stage is clicked",fields:[]},
  {id:"whenSpace",cat:"events",label:"when SPACE is pressed",fields:[["key","space"]]},
  {id:"whenEnter",cat:"events",label:"when ENTER is pressed",fields:[["key","enter"]]},
  {id:"moveBack",cat:"motion",label:"move backward",fields:[["steps","-10"]]},
  {id:"moveFast",cat:"motion",label:"move quickly",fields:[["steps","25"]]},
  {id:"turnLeft",cat:"motion",label:"turn left",fields:[["degrees","-15"]]},
  {id:"turnRight",cat:"motion",label:"turn right",fields:[["degrees","15"]]},
  {id:"goCenter",cat:"motion",label:"go to center",fields:[["x","0"],["y","0"]]},
  {id:"setX",cat:"motion",label:"set horizontal position",fields:[["x","0"],["y","0"]]},
  {id:"setY",cat:"motion",label:"set vertical position",fields:[["x","0"],["y","0"]]},
  {id:"glideCenter",cat:"animation",label:"glide to center",fields:[["x","0"],["y","0"],["duration","1"]]},
  {id:"rotateLeft",cat:"animation",label:"rotate left smoothly",fields:[["degrees","-360"],["duration","1"]]},
  {id:"rotateRight",cat:"animation",label:"rotate right smoothly",fields:[["degrees","360"],["duration","1"]]},
  {id:"grow",cat:"looks",label:"grow sprite",fields:[["scale","150"],["duration","0.5"]]},
  {id:"shrink",cat:"looks",label:"shrink sprite",fields:[["scale","50"],["duration","0.5"]]},
  {id:"setSize",cat:"looks",label:"set sprite size",fields:[["scale","100"],["duration","0.2"]]},
  {id:"showMessage",cat:"looks",label:"show message bubble",fields:[["text","Hello!"]]},
  {id:"thinkMessage",cat:"looks",label:"show thought bubble",fields:[["text","Hmm..."]]},
  {id:"clearMessage",cat:"looks",label:"clear message",fields:[]},
  {id:"fadeIn",cat:"animation",label:"fade in",fields:[["opacity","100"],["duration","0.5"]]},
  {id:"fadeOut",cat:"animation",label:"fade out",fields:[["opacity","0"],["duration","0.5"]]},
  {id:"zoomIn",cat:"animation",label:"zoom in",fields:[["scale","200"],["duration","0.5"]]},
  {id:"zoomOut",cat:"animation",label:"zoom out",fields:[["scale","50"],["duration","0.5"]]},
  {id:"wobble",cat:"animation",label:"wobble animation",fields:[["strength","12"],["duration","0.45"]]},
  {id:"quickSpin",cat:"animation",label:"quick spin",fields:[["turns","3"],["duration","0.4"]]},
  {id:"slowSpin",cat:"animation",label:"slow spin",fields:[["turns","1"],["duration","2"]]},
  {id:"glowOn",cat:"effects",label:"enable glow",fields:[["enabled","true"]]},
  {id:"glowOff",cat:"effects",label:"disable glow",fields:[["enabled","false"]]},
  {id:"flashTwice",cat:"effects",label:"flash twice",fields:[["times","2"],["duration","0.18"]]},
  {id:"hueShift",cat:"effects",label:"shift hue",fields:[["hue","210"],["duration","0.5"]]},
  {id:"waitShort",cat:"control",label:"wait briefly",fields:[["seconds","0.2"]]},
  {id:"repeatTen",cat:"control",label:"repeat 10 times",fields:[["times","10"]]},
  {id:"loopForever",cat:"control",label:"loop forever",fields:[]},
  {id:"stopScripts",cat:"control",label:"stop all scripts now",fields:[]},
  {id:"setScore",cat:"variables",label:"set score",fields:[["variable","score"],["value","0"]]},
  {id:"addScore",cat:"variables",label:"increase score",fields:[["variable","score"],["value","1"]]},
  {id:"subtractScore",cat:"variables",label:"decrease score",fields:[["variable","score"],["value","-1"]]},
  {id:"showScore",cat:"variables",label:"display score",fields:[["variable","score"]]},
  {id:"writeOutput",cat:"data",label:"write to output",fields:[["text","NEXUS ready"]]},
  {id:"resetClock",cat:"sensing",label:"reset stopwatch",fields:[]},
  {id:"stopClock",cat:"sensing",label:"stop stopwatch",fields:[]},
  {id:"whenKey1",cat:"events",label:"when any is pressed",fields:[["key","any"]]},
  {id:"whenKey2",cat:"events",label:"when W is pressed",fields:[["key","w"]]},
  {id:"whenKey3",cat:"events",label:"when A is pressed",fields:[["key","a"]]},
  {id:"whenKey4",cat:"events",label:"when S is pressed",fields:[["key","s"]]},
  {id:"whenKey5",cat:"events",label:"when D is pressed",fields:[["key","d"]]},
  {id:"whenKey6",cat:"events",label:"when ENTER is pressed",fields:[["key","enter"]]},
  {id:"whenKey7",cat:"events",label:"when ESCAPE is pressed",fields:[["key","escape"]]},
  {id:"whenKey8",cat:"events",label:"when UP arrow is pressed",fields:[["key","up"]]},
  {id:"whenKey9",cat:"events",label:"when DOWN arrow is pressed",fields:[["key","down"]]},
  {id:"whenKey10",cat:"events",label:"when SPACE is pressed",fields:[["key","space"]]},
  {id:"moveSteps1",cat:"motion",label:"move 5 steps",fields:[["steps","5"]]},
  {id:"moveSteps2",cat:"motion",label:"move 15 steps",fields:[["steps","15"]]},
  {id:"moveSteps3",cat:"motion",label:"move 20 steps",fields:[["steps","20"]]},
  {id:"moveSteps4",cat:"motion",label:"move 30 steps",fields:[["steps","30"]]},
  {id:"moveSteps5",cat:"motion",label:"move 40 steps",fields:[["steps","40"]]},
  {id:"moveSteps6",cat:"motion",label:"move 60 steps",fields:[["steps","60"]]},
  {id:"moveSteps7",cat:"motion",label:"move 75 steps",fields:[["steps","75"]]},
  {id:"moveSteps8",cat:"motion",label:"move 100 steps",fields:[["steps","100"]]},
  {id:"moveSteps9",cat:"motion",label:"move -5 steps",fields:[["steps","-5"]]},
  {id:"moveSteps10",cat:"motion",label:"move -50 steps",fields:[["steps","-50"]]},
  {id:"turnAngle1",cat:"motion",label:"turn 30 degrees",fields:[["degrees","30"]]},
  {id:"turnAngle2",cat:"motion",label:"turn 60 degrees",fields:[["degrees","60"]]},
  {id:"turnAngle3",cat:"motion",label:"turn 90 degrees",fields:[["degrees","90"]]},
  {id:"turnAngle4",cat:"motion",label:"turn 120 degrees",fields:[["degrees","120"]]},
  {id:"turnAngle5",cat:"motion",label:"turn 180 degrees",fields:[["degrees","180"]]},
  {id:"turnAngle6",cat:"motion",label:"turn 270 degrees",fields:[["degrees","270"]]},
  {id:"turnAngle7",cat:"motion",label:"turn -30 degrees",fields:[["degrees","-30"]]},
  {id:"turnAngle8",cat:"motion",label:"turn -60 degrees",fields:[["degrees","-60"]]},
  {id:"turnAngle9",cat:"motion",label:"turn -120 degrees",fields:[["degrees","-120"]]},
  {id:"turnAngle10",cat:"motion",label:"turn -180 degrees",fields:[["degrees","-180"]]},
  {id:"goPoint1",cat:"motion",label:"go to x -100 y 0",fields:[["x","-100"],["y","0"]]},
  {id:"goPoint2",cat:"motion",label:"go to x 100 y 0",fields:[["x","100"],["y","0"]]},
  {id:"goPoint3",cat:"motion",label:"go to x 0 y 100",fields:[["x","0"],["y","100"]]},
  {id:"goPoint4",cat:"motion",label:"go to x 0 y -100",fields:[["x","0"],["y","-100"]]},
  {id:"goPoint5",cat:"motion",label:"go to x 50 y 50",fields:[["x","50"],["y","50"]]},
  {id:"goPoint6",cat:"motion",label:"go to x -50 y 50",fields:[["x","-50"],["y","50"]]},
  {id:"goPoint7",cat:"motion",label:"go to x 50 y -50",fields:[["x","50"],["y","-50"]]},
  {id:"goPoint8",cat:"motion",label:"go to x -50 y -50",fields:[["x","-50"],["y","-50"]]},
  {id:"goPoint9",cat:"motion",label:"go to x 0 y 0",fields:[["x","0"],["y","0"]]},
  {id:"goPoint10",cat:"motion",label:"go to x 150 y 100",fields:[["x","150"],["y","100"]]},
  {id:"sayText1",cat:"looks",label:"say Welcome!",fields:[["text","Welcome!"]]},
  {id:"sayText2",cat:"looks",label:"say Hello world",fields:[["text","Hello world"]]},
  {id:"sayText3",cat:"looks",label:"say NEXUS online",fields:[["text","NEXUS online"]]},
  {id:"sayText4",cat:"looks",label:"say Let's go!",fields:[["text","Let's go!"]]},
  {id:"sayText5",cat:"looks",label:"say Great job!",fields:[["text","Great job!"]]},
  {id:"sayText6",cat:"looks",label:"say Ready?",fields:[["text","Ready?"]]},
  {id:"sayText7",cat:"looks",label:"say Start!",fields:[["text","Start!"]]},
  {id:"sayText8",cat:"looks",label:"say Mission complete",fields:[["text","Mission complete"]]},
  {id:"sayText9",cat:"looks",label:"say Try again",fields:[["text","Try again"]]},
  {id:"sayText10",cat:"looks",label:"say Goodbye",fields:[["text","Goodbye"]]},
  {id:"setSize1",cat:"looks",label:"set size to 25%",fields:[["scale","25"],["duration","0.3"]]},
  {id:"setSize2",cat:"looks",label:"set size to 50%",fields:[["scale","50"],["duration","0.3"]]},
  {id:"setSize3",cat:"looks",label:"set size to 75%",fields:[["scale","75"],["duration","0.3"]]},
  {id:"setSize4",cat:"looks",label:"set size to 90%",fields:[["scale","90"],["duration","0.3"]]},
  {id:"setSize5",cat:"looks",label:"set size to 110%",fields:[["scale","110"],["duration","0.3"]]},
  {id:"setSize6",cat:"looks",label:"set size to 125%",fields:[["scale","125"],["duration","0.3"]]},
  {id:"setSize7",cat:"looks",label:"set size to 150%",fields:[["scale","150"],["duration","0.3"]]},
  {id:"setSize8",cat:"looks",label:"set size to 175%",fields:[["scale","175"],["duration","0.3"]]},
  {id:"setSize9",cat:"looks",label:"set size to 200%",fields:[["scale","200"],["duration","0.3"]]},
  {id:"setSize10",cat:"looks",label:"set size to 250%",fields:[["scale","250"],["duration","0.3"]]},
  {id:"animateRotate1",cat:"animation",label:"animate rotation to 45°",fields:[["degrees","45"],["duration","0.5"]]},
  {id:"animateRotate2",cat:"animation",label:"animate rotation to 90°",fields:[["degrees","90"],["duration","0.5"]]},
  {id:"animateRotate3",cat:"animation",label:"animate rotation to 135°",fields:[["degrees","135"],["duration","0.5"]]},
  {id:"animateRotate4",cat:"animation",label:"animate rotation to 180°",fields:[["degrees","180"],["duration","0.5"]]},
  {id:"animateRotate5",cat:"animation",label:"animate rotation to 225°",fields:[["degrees","225"],["duration","0.5"]]},
  {id:"animateRotate6",cat:"animation",label:"animate rotation to 270°",fields:[["degrees","270"],["duration","0.5"]]},
  {id:"animateRotate7",cat:"animation",label:"animate rotation to 315°",fields:[["degrees","315"],["duration","0.5"]]},
  {id:"animateRotate8",cat:"animation",label:"animate rotation to 360°",fields:[["degrees","360"],["duration","0.5"]]},
  {id:"animateRotate9",cat:"animation",label:"animate rotation to -90°",fields:[["degrees","-90"],["duration","0.5"]]},
  {id:"animateRotate10",cat:"animation",label:"animate rotation to -180°",fields:[["degrees","-180"],["duration","0.5"]]},
  {id:"flashCount1",cat:"effects",label:"flash 1 times",fields:[["times","1"],["duration","0.15"]]},
  {id:"flashCount2",cat:"effects",label:"flash 2 times",fields:[["times","2"],["duration","0.15"]]},
  {id:"flashCount3",cat:"effects",label:"flash 3 times",fields:[["times","3"],["duration","0.15"]]},
  {id:"flashCount4",cat:"effects",label:"flash 4 times",fields:[["times","4"],["duration","0.15"]]},
  {id:"flashCount5",cat:"effects",label:"flash 5 times",fields:[["times","5"],["duration","0.15"]]},
  {id:"flashCount6",cat:"effects",label:"flash 6 times",fields:[["times","6"],["duration","0.15"]]},
  {id:"flashCount7",cat:"effects",label:"flash 7 times",fields:[["times","7"],["duration","0.15"]]},
  {id:"flashCount8",cat:"effects",label:"flash 8 times",fields:[["times","8"],["duration","0.15"]]},
  {id:"flashCount9",cat:"effects",label:"flash 9 times",fields:[["times","9"],["duration","0.15"]]},
  {id:"flashCount10",cat:"effects",label:"flash 10 times",fields:[["times","10"],["duration","0.15"]]},
  {id:"waitSeconds1",cat:"control",label:"wait 0.1 seconds",fields:[["seconds","0.1"]]},
  {id:"waitSeconds2",cat:"control",label:"wait 0.25 seconds",fields:[["seconds","0.25"]]},
  {id:"waitSeconds3",cat:"control",label:"wait 0.5 seconds",fields:[["seconds","0.5"]]},
  {id:"waitSeconds4",cat:"control",label:"wait 1 seconds",fields:[["seconds","1"]]},
  {id:"waitSeconds5",cat:"control",label:"wait 1.5 seconds",fields:[["seconds","1.5"]]},
  {id:"waitSeconds6",cat:"control",label:"wait 2 seconds",fields:[["seconds","2"]]},
  {id:"waitSeconds7",cat:"control",label:"wait 3 seconds",fields:[["seconds","3"]]},
  {id:"waitSeconds8",cat:"control",label:"wait 4 seconds",fields:[["seconds","4"]]},
  {id:"waitSeconds9",cat:"control",label:"wait 5 seconds",fields:[["seconds","5"]]},
  {id:"waitSeconds10",cat:"control",label:"wait 10 seconds",fields:[["seconds","10"]]},
  {id:"changeValue1",cat:"variables",label:"change score by 1",fields:[["variable","score"],["value","1"]]},
  {id:"changeValue2",cat:"variables",label:"change score by 2",fields:[["variable","score"],["value","2"]]},
  {id:"changeValue3",cat:"variables",label:"change score by 5",fields:[["variable","score"],["value","5"]]},
  {id:"changeValue4",cat:"variables",label:"change score by 10",fields:[["variable","score"],["value","10"]]},
  {id:"changeValue5",cat:"variables",label:"change score by -1",fields:[["variable","score"],["value","-1"]]},
  {id:"changeValue6",cat:"variables",label:"change score by -2",fields:[["variable","score"],["value","-2"]]},
  {id:"changeValue7",cat:"variables",label:"change score by -5",fields:[["variable","score"],["value","-5"]]},
  {id:"changeValue8",cat:"variables",label:"change lives by 1",fields:[["variable","lives"],["value","1"]]},
  {id:"changeValue9",cat:"variables",label:"change lives by -1",fields:[["variable","lives"],["value","-1"]]},
  {id:"changeValue10",cat:"variables",label:"change coins by 10",fields:[["variable","coins"],["value","10"]]},

 ];
 const typeAliases={"startOnLoad":"flag","whenClicked":"flag","whenSpace":"key","whenEnter":"key","moveBack":"move","moveFast":"move","turnLeft":"turn","turnRight":"turn","goCenter":"goto","setX":"goto","setY":"goto","glideCenter":"glide","rotateLeft":"rotateTo","rotateRight":"rotateTo","grow":"scaleTo","shrink":"scaleTo","setSize":"scaleTo","showMessage":"say","thinkMessage":"think","clearMessage":"clearBubble","fadeIn":"fadeTo","fadeOut":"fadeTo","zoomIn":"scaleTo","zoomOut":"scaleTo","wobble":"shake","quickSpin":"spin","slowSpin":"spin","glowOn":"trail","glowOff":"trail","flashTwice":"flash","hueShift":"colorTo","waitShort":"wait","repeatTen":"repeat","loopForever":"forever","stopScripts":"stopAll","setScore":"set","addScore":"change","subtractScore":"change","showScore":"print","writeOutput":"log","resetClock":"resetTimer","stopClock":"resetTimer","whenKey1":"key","whenKey2":"key","whenKey3":"key","whenKey4":"key","whenKey5":"key","whenKey6":"key","whenKey7":"key","whenKey8":"key","whenKey9":"key","whenKey10":"key","moveSteps1":"move","moveSteps2":"move","moveSteps3":"move","moveSteps4":"move","moveSteps5":"move","moveSteps6":"move","moveSteps7":"move","moveSteps8":"move","moveSteps9":"move","moveSteps10":"move","turnAngle1":"turn","turnAngle2":"turn","turnAngle3":"turn","turnAngle4":"turn","turnAngle5":"turn","turnAngle6":"turn","turnAngle7":"turn","turnAngle8":"turn","turnAngle9":"turn","turnAngle10":"turn","goPoint1":"goto","goPoint2":"goto","goPoint3":"goto","goPoint4":"goto","goPoint5":"goto","goPoint6":"goto","goPoint7":"goto","goPoint8":"goto","goPoint9":"goto","goPoint10":"goto","sayText1":"say","sayText2":"say","sayText3":"say","sayText4":"say","sayText5":"say","sayText6":"say","sayText7":"say","sayText8":"say","sayText9":"say","sayText10":"say","setSize1":"scaleTo","setSize2":"scaleTo","setSize3":"scaleTo","setSize4":"scaleTo","setSize5":"scaleTo","setSize6":"scaleTo","setSize7":"scaleTo","setSize8":"scaleTo","setSize9":"scaleTo","setSize10":"scaleTo","animateRotate1":"rotateTo","animateRotate2":"rotateTo","animateRotate3":"rotateTo","animateRotate4":"rotateTo","animateRotate5":"rotateTo","animateRotate6":"rotateTo","animateRotate7":"rotateTo","animateRotate8":"rotateTo","animateRotate9":"rotateTo","animateRotate10":"rotateTo","flashCount1":"flash","flashCount2":"flash","flashCount3":"flash","flashCount4":"flash","flashCount5":"flash","flashCount6":"flash","flashCount7":"flash","flashCount8":"flash","flashCount9":"flash","flashCount10":"flash","waitSeconds1":"wait","waitSeconds2":"wait","waitSeconds3":"wait","waitSeconds4":"wait","waitSeconds5":"wait","waitSeconds6":"wait","waitSeconds7":"wait","waitSeconds8":"wait","waitSeconds9":"wait","waitSeconds10":"wait","changeValue1":"change","changeValue2":"change","changeValue3":"change","changeValue4":"change","changeValue5":"change","changeValue6":"change","changeValue7":"change","changeValue8":"change","changeValue9":"change","changeValue10":"change"};
 const cats=[['events','Events'],['motion','Motion'],['looks','Looks'],['animation','Animation'],['effects','Effects'],['control','Control'],['variables','Variables'],['operators','Operators'],['sensing','Sensing'],['data','Data']];
 const containerTypes=new Set(['repeat','forever','if','ifElse','repeatUntil','repeatTen','loopForever']);
 const eventTypes=new Set(['flag','key',...Object.keys(typeAliases).filter(id=>typeAliases[id]==='flag'||typeAliases[id]==='key')]);
 const reporterTypes=new Set(defs.filter(d=>d.kind==='reporter').map(d=>d.id));
 const expressionInputs={repeat:['times'],if:['condition'],ifElse:['condition'],repeatUntil:['condition'],say:['text'],think:['text'],set:['value'],change:['value'],add:['a','b'],subtract:['a','b'],multiply:['a','b'],divide:['a','b'],mathAdd:['a','b'],mathSubtract:['a','b'],mathMultiply:['a','b'],mathDivide:['a','b'],compare:['a','b'],and:['left','right'],or:['left','right'],not:['value'],join:['left','right'],length:['value'],contains:['text','search'],round:['value'],absolute:['value'],modulo:['a','b']};
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

 function normalizeVariableEntry(raw){
  if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&Object.prototype.hasOwnProperty.call(raw,'type')&&Object.prototype.hasOwnProperty.call(raw,'value')){
   const type=raw.type,value=raw.value;
   if(type==='number'&&typeof value==='number'&&Number.isFinite(value))return {type,value};
   if(type==='text'&&typeof value==='string')return {type,value};
   if(type==='boolean'&&typeof value==='boolean')return {type,value};
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
  const converted=convertVariableValue(current.value,current.type,targetType);
  variables[variableName]={type:targetType,value:converted};
  return variables[variableName];
 }
 function variableFieldMode(blockType){
  const type=typeAliases[blockType]||blockType;
  return ['change','add','subtract','multiply','divide','if','ifElse','repeatUntil'].includes(type)?'number':'any';
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
   return {...starter(),variables:defaultVariables()};
  }catch{return {...starter(),variables:defaultVariables()};}
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
  render:()=>'<div class="eyebrow">NEXUS MODULE / 006</div><div class="module-title-row"><div><h1>Flow <span>Studio.</span></h1><p class="subtitle">Build programs with nested control blocks, variables and a live stage.</p></div><span class="flow-badge">● BLOCK EDITOR</span></div><div class="scratch-toolbar graph-toolbar"><div class="scratch-project"><span class="scratch-project-icon">✳</span><input id="projectName" value="My first project" aria-label="Project name"></div><div class="graph-tools"><button class="secondary-button" id="wireMode">⌁ WIRE: OFF</button><button class="secondary-button" id="deleteLinks">CLEAR WIRES</button><button class="secondary-button" id="flowNew">NEW</button><button class="secondary-button" id="flowSave">SAVE</button><button class="run-button" id="flowRun">▶ RUN</button><button class="stop-button" id="flowStop" disabled>■ STOP</button></div></div><div class="graph-workbench"><aside class="graph-library"><div class="graph-library-head"><b>BLOCK LIBRARY</b><small>SEARCH, FILTER AND DRAG BLOCKS INTO THE WORKSPACE</small></div><label class="flow-block-search"><span>⌕</span><input id="blockSearch" type="search" placeholder="Find a block…" aria-label="Search blocks"></label><div class="graph-categories" id="scratchCategories"></div><div class="graph-palette" id="scratchPalette"></div></aside><section class="graph-editor"><div class="graph-editor-head"><b>WORKSPACE</b><span id="blockCount">0 BLOCKS</span><span class="graph-help">Drag blocks · drop into orange control slots · WIRE links top-level scripts</span></div><div class="graph-canvas" id="graphCanvas"><svg class="graph-wires" id="graphWires"></svg><div id="graphNodes"></div><div class="graph-empty" id="graphEmpty">Drag blocks here from the library</div></div><div class="graph-status" id="graphStatus">Drop blocks into a control slot to build a nested body.</div></section><aside class="graph-side"><div class="stage-character-picker"><label for="stageCharacter">CHARACTER</label><select id="stageCharacter" aria-label="Choose stage character"><option value="🐱">🐱 Cat</option><option value="🐶">🐶 Dog</option><option value="🐰">🐰 Rabbit</option><option value="🦊">🦊 Fox</option><option value="🐻">🐻 Bear</option><option value="🐼">🐼 Panda</option><option value="🐸">🐸 Frog</option><option value="🐵">🐵 Monkey</option><option value="🐧">🐧 Penguin</option><option value="🦉">🦉 Owl</option><option value="🦁">🦁 Lion</option><option value="🐯">🐯 Tiger</option><option value="🐮">🐮 Cow</option><option value="🐷">🐷 Pig</option><option value="🐨">🐨 Koala</option><option value="🐹">🐹 Hamster</option><option value="🐺">🐺 Wolf</option><option value="🦄">🦄 Unicorn</option><option value="🐲">🐲 Dragon</option><option value="🐙">🐙 Octopus</option><option value="🦖">🦖 Dinosaur</option><option value="🐢">🐢 Turtle</option><option value="🐬">🐬 Dolphin</option><option value="🦋">🦋 Butterfly</option><option value="🐝">🐝 Bee</option><option value="🤖">🤖 Robot</option><option value="👾">👾 Alien</option><option value="👻">👻 Ghost</option><option value="🥷">🥷 Ninja</option><option value="🚀">🚀 Rocket</option></select></div><div class="scratch-panel-title"><b>STAGE</b><small>360 × 260</small></div><div class="scratch-stage" id="scratchStage"><div class="stage-grid"></div><div class="stage-sprite" id="stageSprite">🐱</div><div class="stage-bubble" id="stageBubble" hidden></div></div><div class="stage-controls"><button id="stageReset">↺ RESET SPRITE</button><span id="stagePosition">x: 0 y: 0</span></div><div class="scratch-console"><div class="scratch-panel-title"><b>OUTPUT</b><button id="clearOutput">CLEAR</button></div><div id="scratchOutput" class="scratch-output">Ready. Press RUN to execute the script.</div><div class="flow-variable-manager"><div class="flow-variable-tools"><input id="newVariableName" placeholder="new variable" maxlength="32" aria-label="New variable name"><select id="newVariableType" aria-label="New variable type" title="Variable type"><option value="number">Number</option><option value="text">Text</option><option value="boolean">Boolean</option></select><button id="addVariable" type="button">+ ADD</button></div><div id="flowVariableList" class="flow-variable-list"></div><datalist id="flowVariableOptions"></datalist></div><div id="variableReadout" class="variable-readout">Variables: score = 0</div></div></aside></div><div class="scratch-footer"><span><i></i> LOCAL PROJECT</span><span>Nested blocks · Variables · Runtime stop control</span></div>',
  mount(root){
   let data=load(),nodes=data.nodes,links=data.links,character=typeof data.character==='string'?data.character:'🐱',category='events',wireMode=false,pending=null,running=false,stopFlag=false,runAbort=null,x=0,y=0,angle=0,visible=true,vars=data.variables||defaultVariables(),runtimeSteps=0,runtimeFailure=null,activeKeyTasks=new Set(),keyHandler=null;
   const MAX_STEPS=100000,MAX_DEPTH=40;
   const $=s=>root.querySelector(s),canvas=$('#graphCanvas'),nodeLayer=$('#graphNodes'),wireSvg=$('#graphWires'),palette=$('#scratchPalette'),out=$('#scratchOutput'),sprite=$('#stageSprite'),bubble=$('#stageBubble');
   const characterSelect=$('#stageCharacter');
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
     localStorage.setItem(KEY,JSON.stringify({version:5,nodes,links,variables:vars,character}));
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
     const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.title='Delete variable '+name;
     remove.addEventListener('click',()=>{if(running)return;delete vars[name];updateVars();save();log('Variable deleted: '+name);});
     row.append(label,typeSelect,current,remove);list.append(row);
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
   function renderPalette(){
    palette.replaceChildren();
    const query=(root.querySelector('#blockSearch')?.value||'').trim().toLowerCase();
    defs.filter(d=>d.cat===category&&(!query||d.label.toLowerCase().includes(query)||d.id.toLowerCase().includes(query))).forEach(d=>{
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
     case 'if':if(conditionFor(n))await executeSequence(n.children||[],depth+1);break;
     case 'ifElse':await executeSequence(conditionFor(n)?(n.children||[]):(n.elseChildren||[]),depth+1);break;
     case 'repeatUntil':{let guard=0;while(!conditionFor(n)&&!stopFlag){if(++guard>MAX_STEPS)throw Error('Repeat-until safety limit reached.');tick();if((n.children||[]).length)await executeSequence(n.children,depth+1);else await wait(100);}break;}
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
    stopFlag=true;if(runAbort)runAbort.abort();log(message);setStatus('Stopping runtime…');
   }
   async function run(){
    if(running)return;
    running=true;stopFlag=false;runtimeSteps=0;runtimeFailure=null;activeKeyTasks.clear();window.__nexusFlowTimer=Date.now();runAbort=new AbortController();
    out.replaceChildren();resetSprite();$('#flowRun').disabled=true;$('#flowStop').disabled=false;
    setStatus('Runtime is executing.');
    log('NEXUS block runtime started');
    const starts=nodes.filter(n=>(typeAliases[n.type]||n.type)==='flag'),keyScripts=nodes.filter(n=>(typeAliases[n.type]||n.type)==='key');
    try{
     if(keyScripts.length){keyHandler=handleKeyDown;document.addEventListener('keydown',keyHandler);}
     if(!starts.length&&!keyScripts.length)log('No start block found. Add “when clicked” or “when key pressed”.');
     if(!starts.length&&keyScripts.length)log('No green-flag script found. Waiting for keyboard events.');
     for(const n of starts){if(!stopFlag)await executeLinked(n.id);}
     if(runtimeFailure)throw runtimeFailure;
     if(keyScripts.length&&!stopFlag){
      const names=[...new Set(keyScripts.map(n=>normalizeKeyName(n.fields?.key||'space')))].join(', ');
      log('⌨ Listening for keys: '+names+'. Press STOP to finish.');
      setStatus('Listening for keyboard events. Press STOP to finish.');
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
   $('#flowRun').addEventListener('click',run);
   $('#flowStop').addEventListener('click',requestStop);
   $('#flowSave').addEventListener('click',()=>{save();log('✓ Project saved locally');});
   $('#flowNew').addEventListener('click',()=>{
    if(confirm('Create a new empty project?')){nodes=[];links=[];vars=defaultVariables();pending=null;updateVars();save();render();out.textContent='New project created.';}
   });
   $('#stageReset').addEventListener('click',resetSprite);
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
   category='events';root.querySelector('.category-button.events').classList.add('active');$('#blockSearch').addEventListener('input',renderPalette);
   characterSelect.value=characterSelect.querySelector('option[value="'+CSS.escape(character)+'"]')?character:'🐱';character=characterSelect.value;characterSelect.addEventListener('change',()=>{if(running){characterSelect.value=character;return;}character=characterSelect.value;updateSprite();save();log('Character changed: '+characterSelect.options[characterSelect.selectedIndex].text);});renderPalette();render();updateSprite();updateVars();save();
  }
 };
})();
