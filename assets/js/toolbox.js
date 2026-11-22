(() => {
 const api=window.NEXUSModules=window.NEXUSModules||{};
 const names=['JSON formatter','JSON minifier','JSON to CSV','CSV to JSON','Base64 encode','Base64 decode','URL encode','URL decode','HTML escape','HTML unescape','Text statistics','Case converter','Duplicate remover','Line sorter','Whitespace cleaner','UUID generator','Password generator','Slug generator','SHA-256 hash','Timestamp converter','HEX color inspector','Regex tester','Query parser','HTML tag stripper','Lorem generator','Number base converter','Percentage calculator','Unit converter','Average calculator','Random integer','Fibonacci sequence','Prime checker','Roman numeral','Date difference','Cron field reader','Data URL inspector','SVG cleaner','XML indenter','ENV template','Git ignore template','Import extractor','Code line counter','Regex escape','Text reverse','Character frequency','Word frequency','Initials generator','Markdown heading map','Email validator','IPv4 validator'];
 const descriptions=['Pretty-print JSON','Compact JSON','Convert JSON array to CSV','Convert CSV to JSON','Encode UTF-8 as Base64','Decode Base64','Percent-encode text','Decode URL text','Escape HTML','Decode HTML entities','Count text metrics','Convert letter cases','Remove repeated lines','Sort lines','Normalize whitespace','Create UUID','Create random password','Create URL slug','Calculate SHA-256','Convert timestamp to date','Inspect a HEX color','Find regex matches','Parse query parameters','Strip HTML tags','Generate placeholder text','Convert number bases','Calculate percentage','Convert common units','Mean and median','Generate integer','Build Fibonacci values','Test primality','Integer to Roman numerals','Days between dates','Read cron fields','Inspect data URL','Clean SVG markup','Indent XML','Create ENV keys','Create .gitignore','Extract imports','Count lines','Escape regex','Reverse text','Count characters','Count words','Generate initials','List Markdown headings','Validate email syntax','Validate IPv4 syntax'];
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function run(i,a,b){
 const lines=a.split(/\r?\n/),nums=a.split(/[ ,\n]+/).map(Number).filter(Number.isFinite);
 switch(i){
 case 0:return JSON.stringify(JSON.parse(a),null,2);case 1:return JSON.stringify(JSON.parse(a));
 case 2:{const v=JSON.parse(a),k=[...new Set(v.flatMap(x=>Object.keys(x)))];return [k.join(','),...v.map(o=>k.map(x=>JSON.stringify(o[x]??'')).join(','))].join('\n');}
 case 3:{const [h,...r]=lines,k=h.split(',');return JSON.stringify(r.map(x=>Object.fromEntries(x.split(',').map((v,j)=>[k[j],v]))),null,2);}
 case 4:return btoa(unescape(encodeURIComponent(a)));case 5:return decodeURIComponent(escape(atob(a.trim())));
 case 6:return encodeURIComponent(a);case 7:return decodeURIComponent(a);
 case 8:return a.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 case 9:{const t=document.createElement('textarea');t.innerHTML=a;return t.value;}
 case 10:return 'Characters: '+a.length+'\nWords: '+(a.trim()?a.trim().split(/\s+/).length:0)+'\nLines: '+(a?lines.length:0)+'\nBytes: '+new TextEncoder().encode(a).length;
 case 11:return 'UPPER: '+a.toUpperCase()+'\nLOWER: '+a.toLowerCase()+'\nTITLE: '+a.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
 case 12:return [...new Set(lines)].join('\n');case 13:return lines.sort((x,y)=>x.localeCompare(y)).join('\n');case 14:return a.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
 case 15:return crypto.randomUUID();case 16:{const c='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-';return Array.from({length:24},()=>c[Math.floor(Math.random()*c.length)]).join('');}
 case 17:return a.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 case 18:return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(a)))].map(x=>x.toString(16).padStart(2,'0')).join('');
 case 19:{const d=new Date(Number.isFinite(Number(a))?(Number(a)<1e12?Number(a)*1000:Number(a)):a);return isNaN(d)?'Invalid date':d.toISOString()+'\n'+d.toLocaleString();}
 case 20:{const m=a.match(/^#?([0-9a-f]{6})$/i);if(!m)throw Error('Enter #RRGGBB');const n=parseInt(m[1],16);return 'RGB '+(n>>16)+', '+((n>>8)&255)+', '+(n&255);}
 case 21:return [...a.matchAll(new RegExp(b||'','gm'))].map(m=>m[0]+' @ '+m.index).join('\n')||'No matches';
 case 22:return JSON.stringify(Object.fromEntries(new URLSearchParams(a.replace(/^\?/,' '))),null,2);
 case 23:return a.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();case 24:return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(Math.max(1,Math.min(50,Number(a)||3))).trim();
 case 25:{const n=parseInt(a,10);return 'Binary '+n.toString(2)+'\nHex '+n.toString(16)+'\nOctal '+n.toString(8);}
 case 26:{const [x,y]=nums;return (x/y*100).toFixed(2)+'%';}case 27:{const n=Number(a);return n+' km = '+n*1000+' m\n'+n+' kg = '+n*1000+' g\n'+n+' mi = '+n*1.609344+' km';}
 case 28:{const n=nums.sort((x,y)=>x-y);if(!n.length)throw Error('Enter numbers');return 'Mean '+n.reduce((x,y)=>x+y,0)/n.length+'\nMedian '+n[Math.floor(n.length/2)]+'\nMin '+n[0]+'\nMax '+n.at(-1);}
 case 29:{const [x,y]=nums;return String(Math.floor(Math.random()*(y-x+1))+x);}
 case 30:{let x=0,y=1;return Array.from({length:Math.max(1,Math.min(100,Number(a)||10))},()=>{const v=x;[x,y]=[y,x+y];return v;}).join(', ');}
 case 31:{const n=Number(a);return String(Number.isInteger(n)&&n>1&&!Array.from({length:Math.max(0,Math.floor(Math.sqrt(n))-1)},(_,j)=>j+2).some(x=>n%x===0));}
 case 32:{let n=Number(a),o='';for(const [v,s] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=v){o+=s;n-=v;}return o||'Enter positive integer';}
 case 33:return String(Math.abs(new Date(a)-new Date(b))/86400000)+' days';
 case 34:return ['Minute','Hour','Day','Month','Weekday'].map((x,j)=>x+': '+(a.split(' ')[j]||'?')).join('\n');
 case 35:return (a.match(/^data:([^;,]+)/)||[])[1]||'Not a data URL';
 case 36:return a.replace(/<!--[\s\S]*?-->/g,'').replace(/>\s+</g,'><').trim();
 case 37:return a.replace(/></g,'>\n<').split('\n').map((x,j)=>'  '.repeat(Math.max(0,j-(x.startsWith('</')?1:0)))+x).join('\n');
 case 38:return a.split(/[ ,\n]+/).filter(Boolean).map(x=>x.toUpperCase().replace(/[^A-Z0-9_]/g,'_')+'=').join('\n');
 case 39:return 'node_modules/\ndist/\nbuild/\n.env\n__pycache__/\n*.py[cod]\n.venv/\n.DS_Store\n.vscode/\n.idea/';
 case 40:return (a.match(/^\s*(?:import\s+[^\n]+|from\s+[^\n]+\s+import\s+[^\n]+)/gm)||[]).join('\n')||'No imports';
 case 41:return 'Total '+lines.length+'\nNon-empty '+lines.filter(x=>x.trim()).length+'\nBlank '+lines.filter(x=>!x.trim()).length;
 case 42:return a.split('').map(c=>'.*+?^$()[]{}|\\'.includes(c)?'\\'+c:c).join('');
 case 43:return [...a].reverse().join('');
 case 44:return JSON.stringify([...a].reduce((o,c)=>(o[c]=(o[c]||0)+1,o),{}),null,2);
 case 45:return JSON.stringify(a.toLowerCase().split(/\W+/).filter(Boolean).reduce((o,w)=>(o[w]=(o[w]||0)+1,o),{}),null,2);
 case 46:return a.trim().split(/\s+/).map(x=>x[0].toUpperCase()).join('');
 case 47:return (a.match(/^#{1,6} .+$/gm)||[]).join('\n')||'No headings';
 case 48:return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.trim())?'Valid email syntax':'Invalid email syntax';
 case 49:{const p=a.trim().split('.').map(Number);return String(p.length===4&&p.every(x=>Number.isInteger(x)&&x>=0&&x<=255));}
 default:throw Error('Unknown instrument');
 }}
 api.toolbox={
 render:()=>'<div class="toolbox-shell"><header class="toolbox-hero"><div><div class="eyebrow">NEXUS UTILITY ARRAY / 050</div><h1>Utility <span>Foundry</span></h1><p>Small instruments for everyday development work. Search, select, transform and copy.</p></div><div class="toolbox-count"><b>50</b><small>TOOLS ONLINE</small></div></header><div class="toolbox-layout"><aside class="toolbox-index panel"><input id="toolSearch" placeholder="Filter instruments…"><div id="toolList" class="tool-list"></div></aside><section class="toolbox-work panel"><div class="tool-selected"><div><small>SELECTED INSTRUMENT</small><h2 id="toolTitle">Choose a tool</h2><p id="toolDescription">Select an instrument from the index.</p></div><span id="toolIndex">— / 50</span></div><div class="tool-inputs"><textarea id="toolInput" placeholder="Input data…" spellcheck="false"></textarea><textarea id="toolExtra" placeholder="Optional second input / parameters…" spellcheck="false"></textarea></div><div class="tool-controls"><button id="toolRun" class="primary-button">RUN TRANSFORM</button><button id="toolCopy" class="secondary-button">COPY RESULT</button><button id="toolClear" class="secondary-button">RESET</button></div><pre id="toolOutput">Your result will appear here.</pre></section></div></div>',
 mount(root){
  const $=s=>root.querySelector(s);let active=-1,result='';
  const draw=()=>{const q=$('#toolSearch').value.toLowerCase();$('#toolList').replaceChildren();names.forEach((name,i)=>{if(!name.toLowerCase().includes(q)&&!descriptions[i].toLowerCase().includes(q))return;const b=document.createElement('button');b.className='tool-index-item'+(i===active?' active':'');b.innerHTML='<span>'+String(i+1).padStart(2,'0')+'</span><b>'+esc(name)+'</b><small>'+esc(descriptions[i])+'</small>';b.onclick=()=>{active=i;$('#toolTitle').textContent=name;$('#toolDescription').textContent=descriptions[i];$('#toolIndex').textContent=String(i+1).padStart(2,'0')+' / 50';draw();};$('#toolList').append(b);});};
  $('#toolSearch').oninput=draw;$('#toolRun').onclick=async()=>{if(active<0)return;try{result=await run(active,$('#toolInput').value,$('#toolExtra').value);$('#toolOutput').textContent=result;}catch(e){$('#toolOutput').textContent='Error: '+e.message;}};
  $('#toolCopy').onclick=()=>{if(result)navigator.clipboard?.writeText(String(result));};$('#toolClear').onclick=()=>{$('#toolInput').value='';$('#toolExtra').value='';$('#toolOutput').textContent='Your result will appear here.';result='';};draw();
 }
 };
})();