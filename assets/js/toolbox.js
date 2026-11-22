(() => {
 const api=window.NEXUSModules=window.NEXUSModules||{};
 const names=['JSON formatter','JSON minifier','JSON to CSV','CSV to JSON','Base64 encode','Base64 decode','URL encode','URL decode','HTML escape','HTML unescape','Text statistics','Case converter','Duplicate remover','Line sorter','Whitespace cleaner','UUID generator','Password generator','Slug generator','SHA-256 hash','Timestamp converter','HEX color inspector','Regex tester','Query parser','HTML tag stripper','Lorem generator','Number base converter','Percentage calculator','Unit converter','Average calculator','Random integer','Fibonacci sequence','Prime checker','Roman numeral','Date difference','Cron field reader','Data URL inspector','SVG cleaner','XML indenter','ENV template','Git ignore template','Import extractor','Code line counter','Regex escape','Text reverse','Character frequency','Word frequency','Initials generator','Markdown heading map','Email validator','IPv4 validator'];
 const descriptions=['Pretty-print JSON','Compact JSON','Convert JSON array to CSV','Convert CSV to JSON','Encode UTF-8 as Base64','Decode Base64','Percent-encode text','Decode URL text','Escape HTML','Decode HTML entities','Count text metrics','Convert letter cases','Remove repeated lines','Sort lines','Normalize whitespace','Create UUID','Create random password','Create URL slug','Calculate SHA-256','Convert timestamp to date','Inspect a HEX color','Find regex matches','Parse query parameters','Strip HTML tags','Generate placeholder text','Convert number bases','Calculate percentage','Convert common units','Mean and median','Generate integer','Build Fibonacci values','Test primality','Integer to Roman numerals','Days between dates','Read cron fields','Inspect data URL','Clean SVG markup','Indent XML','Create ENV keys','Create .gitignore','Extract imports','Count lines','Escape regex','Reverse text','Count characters','Count words','Generate initials','List Markdown headings','Validate email syntax','Validate IPv4 syntax'];
 const moreNames=["JSON key paths","JSON schema guess","CSV delimiter detector","Markdown to HTML","HTML minifier","CSS minifier","JS whitespace cleaner","CSS gradient builder","CSS shadow builder","CSS clamp builder","HTML table to Markdown","Markdown table to CSV","HEX to RGB","RGB to HEX","Contrast ratio","Color palette","Accessible text color","PX to REM","REM to PX","Aspect ratio","Byte size formatter","Binary to decimal","Decimal to binary","Hex to decimal","Decimal to hex","Current Unix time","Date to ISO","Add days to date","Date to Unix time","Query string builder","JWT payload decoder","JWT expiry checker","HTTP status lookup","MIME type lookup","File extension lookup","Extract file extension","Normalize file path","Regex replace","Line diff","Prefix every line","Suffix every line","Indent text","Unindent text","Sort JSON keys","HTML attribute extractor","CSS variable extractor","Markdown link extractor","Email list cleaner","Phone digit cleaner","Text to QR payload"];
 const moreDescriptions=["List every JSON key path","Infer a basic JSON schema","Detect the CSV separator","Convert Markdown headings and emphasis to HTML","Remove safe HTML whitespace","Compact CSS whitespace","Remove JS comments and repeated whitespace","Generate a CSS linear gradient","Generate a layered CSS shadow","Create responsive clamp() CSS","Convert HTML table rows to Markdown","Convert Markdown table to CSV","Convert HEX to RGB values","Convert RGB channels to HEX","Calculate WCAG contrast ratio","Generate a harmonious palette","Choose black or white text for contrast","Convert pixels to rem","Convert rem to pixels","Calculate proportional dimensions","Format bytes as readable units","Convert binary to decimal","Convert decimal to binary","Convert hexadecimal to decimal","Convert decimal to hexadecimal","Get current Unix timestamp","Normalize a date to ISO 8601","Add days to a date","Convert date to Unix seconds","Build URL query parameters","Decode JWT header and payload locally","Check JWT exp claim","Look up common HTTP status codes","Find common MIME types","Guess MIME from extension","Extract a filename extension","Normalize slashes and dot segments","Replace regex matches","Show added and removed lines","Prefix each line","Append text to every line","Indent each line","Remove one indent level","Sort JSON object keys recursively","Extract HTML attributes","List CSS custom properties","Extract Markdown links","Clean and deduplicate email list","Keep only phone digits and plus signs","Prepare text payload for QR generation"];
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

 case 50:return [...(function walk(v,p=''){return Object.entries(v).flatMap(([k,x])=>{const q=p?p+'.'+k:k;return x&&typeof x==='object'?[q,...walk(x,q)]:[q];});})(JSON.parse(a))].join('\n');
 case 51:{const v=JSON.parse(a),infer=x=>Array.isArray(x)?{type:'array',items:x.length?infer(x[0]):{type:'unknown'}}:x===null?{type:'null'}:typeof x==='object'?{type:'object',properties:Object.fromEntries(Object.entries(x).map(([k,y])=>[k,infer(y)]))}:{type:typeof x};return JSON.stringify(infer(v),null,2);}
 case 52:{const s=a.split(/\r?\n/)[0],c=[',',';','\\t','|'].map(x=>[x,s.split(x==='\\t'?'\t':x).length-1]).sort((x,y)=>y[1]-x[1])[0];return c[1]>0?(c[0]==='\\t'?'TAB':c[0])+' delimiter':'Could not detect delimiter';}
 case 53:return a.replace(/^###### (.*)$/gm,'<h6>$1</h6>').replace(/^##### (.*)$/gm,'<h5>$1</h5>').replace(/^#### (.*)$/gm,'<h4>$1</h4>').replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\[(.*?)\]\((.*?)\)/g,'<a href="$2">$1</a>').replace(/\n/g,'<br>');
 case 54:return a.replace(/>\s+</g,'><').replace(/\s{2,}/g,' ').trim();
 case 55:return a.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,])\s*/g,'$1').trim();
 case 56:return a.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([=+{}();,:])\s*/g,'$1').trim();
 case 57:return 'background: linear-gradient(135deg, '+(a||'#60a5fa')+', '+(b||'#a78bfa')+');';
 case 58:return 'box-shadow: '+(a||'0 12px 32px rgba(0,0,0,.22)')+';';
 case 59:{const [min,max]=nums.length>=2?nums:[14,32];return 'font-size: clamp('+min+'px, '+(min/16).toFixed(2)+'rem + 1vw, '+max+'px);';}
 case 60:{const rows=[...a.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(x=>[...x[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map(y=>y[1].replace(/<[^>]+>/g,'').trim()));return rows.map((r,i)=>'| '+r.join(' | ')+' |'+(i===0?'\n| '+r.map(()=> '---').join(' | ')+' |':'')).join('\n');}
 case 61:{const rows=lines.filter(x=>x.includes('|')).map(x=>x.split('|').map(y=>y.trim()).filter((y,i,arr)=>!(i===0&&y==='')&&!(i===arr.length-1&&y===''))).filter(x=>!x.every(y=>/^:?-{3,}:?$/.test(y)));return rows.map(r=>r.map(x=>'"'+x.replace(/"/g,'""')+'"').join(',')).join('\n');}
 case 62:{const m=a.trim().replace(/^#/,'').match(/^[0-9a-f]{6}$/i);if(!m)throw Error('Enter six-digit HEX');const n=parseInt(m[0],16);return 'rgb('+(n>>16)+', '+((n>>8)&255)+', '+(n&255)+')';}
 case 63:{const [r,g,bl]=nums;if([r,g,bl].some(x=>x<0||x>255))throw Error('RGB channels must be 0–255');return '#'+[r,g,bl].map(x=>Math.round(x).toString(16).padStart(2,'0')).join('').toUpperCase();}
 case 64:{const h=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;};const rgb=x=>{const m=x.trim().replace('#','');if(!/^[0-9a-f]{6}$/i.test(m))throw Error('Use two HEX colors separated by comma');return [0,2,4].map(i=>h(parseInt(m.slice(i,i+2),16)));};const [x,y]=a.split(',');const lum=v=>.2126*v[0]+.7152*v[1]+.0722*v[2];const l=[lum(rgb(x)),lum(rgb(y))].sort((x,y)=>y-x);return 'Contrast ratio: '+((l[0]+.05)/(l[1]+.05)).toFixed(2)+':1\nAA normal text: '+(((l[0]+.05)/(l[1]+.05))>=4.5?'PASS':'FAIL')+'\nAA large text: '+(((l[0]+.05)/(l[1]+.05))>=3?'PASS':'FAIL');}
 case 65:{const base=(a.trim()||'#65a9ff').replace(/^#/,'');if(!/^[0-9a-f]{6}$/i.test(base))throw Error('Enter a six-digit HEX color');const channels=[0,2,4].map(i=>parseInt(base.slice(i,i+2),16));const fmt=v=>'#'+v.map(x=>Math.max(0,Math.min(255,x)).toString(16).padStart(2,'0')).join('').toUpperCase();return [fmt(channels),fmt(channels.map(x=>x+35)),fmt(channels.map(x=>x-35))].join('\n');}
 case 66:{const m=a.trim().match(/^#?([0-9a-f]{6})$/i);if(!m)throw Error('Enter HEX color');const n=parseInt(m[1],16),l=[n>>16,(n>>8)&255,n&255].map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*l[0]+.7152*l[1]+.0722*l[2]>.179?'#000000':'#FFFFFF';}
 case 67:return (Number(a)/16).toFixed(4).replace(/0+$/,'').replace(/\.$/,'')+'rem';
 case 68:return (Number(a)*16).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+'px';
 case 69:{const [w,h]=nums;if(!w||!h)throw Error('Enter width and height');const gcd=(x,y)=>y?gcd(y,x%y):x;return (w/gcd(w,h))+':'+(h/gcd(w,h))+'\nRatio '+(w/h).toFixed(4);}
 case 70:{const n=Number(a);if(!Number.isFinite(n)||n<0)throw Error('Enter a non-negative byte count');return n<1024?n+' B':n<1048576?(n/1024).toFixed(2)+' KB':n<1073741824?(n/1048576).toFixed(2)+' MB':(n/1073741824).toFixed(2)+' GB';}
 case 71:return String(parseInt(a.trim(),2));case 72:return Number(a).toString(2);case 73:return String(parseInt(a.trim().replace(/^0x/i,''),16));case 74:return Number(a).toString(16).toUpperCase();
 case 75:return String(Math.floor(Date.now()/1000));case 76:{const d=new Date(a);if(isNaN(d))throw Error('Invalid date');return d.toISOString();}
 case 77:{const d=new Date(a);if(isNaN(d))throw Error('Invalid date');d.setDate(d.getDate()+Number(b||0));return d.toISOString();}
 case 78:{const d=new Date(a);if(isNaN(d))throw Error('Invalid date');return String(Math.floor(d.getTime()/1000));}
 case 79:{const u=new URL(a.startsWith('http')?a:'https://example.com');const pairs=b.split(/\r?\n/).map(x=>x.split('='));pairs.forEach(([k,v])=>{if(k)u.searchParams.set(k,v||'');});return u.search;}
 case 80:{const p=a.trim().split('.');if(p.length!==3)throw Error('JWT must contain three segments');const decode=s=>JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/')))));return JSON.stringify({header:decode(p[0]),payload:decode(p[1])},null,2)+'\n\nSignature is not verified.';}
 case 81:{const p=a.trim().split('.')[1];if(!p)throw Error('JWT payload is missing');const x=JSON.parse(decodeURIComponent(escape(atob(p.replace(/-/g,'+').replace(/_/g,'/')))));return x.exp?'Expires: '+new Date(x.exp*1000).toISOString()+'\n'+(x.exp*1000>Date.now()?'NOT EXPIRED':'EXPIRED'):'No exp claim';}
 case 82:{const codes={'200':'OK','201':'Created','204':'No Content','301':'Moved Permanently','302':'Found','304':'Not Modified','400':'Bad Request','401':'Unauthorized','403':'Forbidden','404':'Not Found','405':'Method Not Allowed','409':'Conflict','422':'Unprocessable Content','429':'Too Many Requests','500':'Internal Server Error','502':'Bad Gateway','503':'Service Unavailable'};return codes[a.trim()]||'No quick reference for this status';}
 case 83:{const types={json:'application/json',html:'text/html',css:'text/css',js:'text/javascript',mjs:'text/javascript',ts:'text/typescript',txt:'text/plain',md:'text/markdown',csv:'text/csv',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',pdf:'application/pdf',wasm:'application/wasm',xml:'application/xml',zip:'application/zip'};return types[a.trim().replace(/^\./,'').toLowerCase()]||'application/octet-stream';}
 case 84:return 'extension: '+a.trim().replace(/^\./,'').toLowerCase()+'\nMIME: '+({'json':'application/json','html':'text/html','css':'text/css','js':'text/javascript','png':'image/png','jpg':'image/jpeg','svg':'image/svg+xml','pdf':'application/pdf','txt':'text/plain'}[a.trim().split('.').pop().toLowerCase()]||'unknown');
 case 85:return (a.split(/[\\/]/).pop().match(/\.([^.]+)$/)||[])[1]||'No extension';
 case 86:{const parts=a.replace(/\\/g,'/').split('/');const out=[];parts.forEach(x=>{if(!x||x==='.')return;if(x==='..')out.pop();else out.push(x);});return (a.startsWith('/')?'/':'')+out.join('/');}
 case 87:{const [pattern,repl]=b.split(/\n/,2);return a.replace(new RegExp(pattern||'', 'gm'),repl??'');}
 case 88:{const old=new Set(a.split(/\r?\n/)),now=new Set(b.split(/\r?\n/));return [...b.split(/\r?\n/).filter(x=>!old.has(x)).map(x=>'+ '+x),...a.split(/\r?\n/).filter(x=>!now.has(x)).map(x=>'- '+x)].join('\n')||'No line changes';}
 case 89:return lines.map(x=>(b||'> ')+x).join('\n');case 90:return lines.map(x=>x+(b||'')).join('\n');
 case 91:return lines.map(x=>(b||'    ')+x).join('\n');case 92:return lines.map(x=>x.replace(/^(?:\t| {1,4})/,'')).join('\n');
 case 93:{const sort=x=>Array.isArray(x)?x.map(sort):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])])):x;return JSON.stringify(sort(JSON.parse(a)),null,2);}
 case 94:return [...new Set([...a.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(x=>x[1]+'="'+x[2]+'"'))].join('\n');
 case 95:return [...new Set(a.match(/--[\w-]+\s*:/g)||[])].map(x=>x.replace(/\s*:/,'')).join('\n');
 case 96:return [...a.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(x=>x[1]+' → '+x[2]).join('\n');
 case 97:return [...new Set(a.split(/[\s,;]+/).filter(x=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.toLowerCase())).map(x=>x.toLowerCase()))].join('\n');
 case 98:return a.replace(/[^+\d]/g,'');
 case 99:return [...a].map((ch,i)=>i+': '+ch+' → U+'+ch.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')).join('\n');

 default:throw Error('Unknown instrument');
 }}
 api.toolbox={
 render:()=>'<div class="toolbox-shell"><header class="toolbox-hero"><div><div class="eyebrow">NEXUS UTILITY ARRAY / 100</div><h1>Utility <span>Foundry</span></h1><p>Small instruments for everyday development work. Search, select, transform and copy.</p></div><div class="toolbox-count"><b>100</b><small>TOOLS ONLINE</small></div></header><div class="toolbox-layout"><aside class="toolbox-index panel"><input id="toolSearch" placeholder="Filter instruments…"><div id="toolList" class="tool-list"></div></aside><section class="toolbox-work panel"><div class="tool-selected"><div><small>SELECTED INSTRUMENT</small><h2 id="toolTitle">Choose a tool</h2><p id="toolDescription">Select an instrument from the index.</p></div><span id="toolIndex">— / 100</span></div><div class="tool-inputs"><textarea id="toolInput" placeholder="Input data…" spellcheck="false"></textarea><textarea id="toolExtra" placeholder="Optional second input / parameters…" spellcheck="false"></textarea></div><div class="tool-controls"><button id="toolRun" class="primary-button">RUN TRANSFORM</button><button id="toolCopy" class="secondary-button">COPY RESULT</button><button id="toolClear" class="secondary-button">RESET</button></div><pre id="toolOutput">Your result will appear here.</pre></section></div></div>',
 mount(root){
  const $=s=>root.querySelector(s);let active=-1,result='';
  const draw=()=>{const q=$('#toolSearch').value.toLowerCase();$('#toolList').replaceChildren();[...names,...moreNames].forEach((name,i)=>{const desc=i<names.length?descriptions[i]:moreDescriptions[i-names.length];if(!name.toLowerCase().includes(q)&&!desc.toLowerCase().includes(q))return;const b=document.createElement('button');b.className='tool-index-item'+(i===active?' active':'');b.innerHTML='<span>'+String(i+1).padStart(2,'0')+'</span><b>'+esc(name)+'</b><small>'+esc(desc)+'</small>';b.onclick=()=>{active=i;$('#toolTitle').textContent=name;$('#toolDescription').textContent=desc;$('#toolIndex').textContent=String(i+1).padStart(2,'0')+' / 100';draw();};$('#toolList').append(b);});};
  $('#toolSearch').oninput=draw;$('#toolRun').onclick=async()=>{if(active<0)return;try{result=await run(active,$('#toolInput').value,$('#toolExtra').value);$('#toolOutput').textContent=result;}catch(e){$('#toolOutput').textContent='Error: '+e.message;}};
  $('#toolCopy').onclick=()=>{if(result)navigator.clipboard?.writeText(String(result));};$('#toolClear').onclick=()=>{$('#toolInput').value='';$('#toolExtra').value='';$('#toolOutput').textContent='Your result will appear here.';result='';};draw();
 }
 };
})();