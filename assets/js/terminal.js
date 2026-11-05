(() => {
  const api=window.NEXUSModules=window.NEXUSModules||{};
  api.terminal={
    render:()=>'<div class="eyebrow">NEXUS MODULE / 002</div><div class="module-title-row"><div><h1>NEXUS <span>Terminal.</span></h1><p class="subtitle">Command interface for your digital workspace.</p></div><span class="terminal-badge">● SESSION ACTIVE</span></div><section class="terminal-window"><div class="terminal-bar"><span>● ● ●　 nexus@operator — terminal</span><button id="termClearTop" class="text-button">CLEAR</button></div><div class="terminal-output" id="terminalOutput" role="log" aria-live="polite"><div class="term-line term-muted">NEXUS Terminal [Version 0.2.0]</div><div class="term-line">Interactive command environment initialized.</div><div class="term-line term-muted">Type help to see available commands.</div></div><form class="terminal-input-row" id="terminalForm"><label>nexus@operator <b>›</b></label><input id="terminalInput" autocomplete="off" spellcheck="false" placeholder="Enter a command..." aria-label="Terminal command"><button type="submit">RUN ↵</button></form></section><div class="terminal-hints"><span>QUICK COMMANDS</span><button data-term-command="help">help</button><button data-term-command="status">status</button><button data-term-command="modules">modules</button><button data-term-command="time">time</button></div>',
    mount(root){
      const out=root.querySelector('#terminalOutput'),input=root.querySelector('#terminalInput'),form=root.querySelector('#terminalForm'),history=[];let pos=0;
      const write=(s,c)=>{const d=document.createElement('div');d.className='term-line '+(c||'');d.textContent=s;out.append(d);out.scrollTop=out.scrollHeight;};
      const cmds={
        help:()=>{write('AVAILABLE COMMANDS','term-accent');[['help','Show command list'],['status','Show core status'],['time','Local date and time'],['clear','Clear output'],['modules','List modules'],['about','About NEXUS'],['echo <text>','Print text'],['calc <math>','Basic arithmetic']].forEach(x=>write('  '+x[0].padEnd(19)+x[1]));},
        status:()=>['NEXUS CORE ........ ONLINE','TERMINAL ........... ACTIVE','STORAGE ............ LOCAL BROWSER','FLOW STUDIO ........ READY','BACKEND ............ NOT CONNECTED'].forEach((x,i)=>write(x,i===0?'term-success':'')),
        time:()=>write(new Date().toLocaleString()),
        clear:()=>out.replaceChildren(),
        modules:()=>['Overview','Terminal','Flow Studio','Storage','Monitor (planned)','Network (planned)','Extensions (planned)'].forEach((x,i)=>write(String(i+1).padStart(2,'0')+'  '+x)),
        about:()=>{write('NEXUS — Digital Laboratory');write('Version 0.2.0 | Modular browser workspace');},
        echo:a=>write(a.join(' ')),
        calc:a=>{const e=a.join(' ');if(!e||!/^[\d\s()+\-*/%.]+$/.test(e)){write('Error: use numbers and basic operators only.','term-error');return;}try{const n=Function('"use strict";return ('+e+')')();if(typeof n!=='number'||!Number.isFinite(n))throw 0;write(String(n),'term-success');}catch{write('Error: invalid expression.','term-error');}}
      };
      const run=s=>{s=s.trim();if(!s)return;write('› '+s,'term-command');history.push(s);pos=history.length;const p=s.split(/\s+/),name=p.shift();if(cmds[name])cmds[name](p);else write('Command not found: '+name+'. Type help.','term-error');};
      form.addEventListener('submit',e=>{e.preventDefault();run(input.value);input.value='';});
      input.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();pos=Math.max(0,pos-1);input.value=history[pos]||'';}if(e.key==='ArrowDown'){e.preventDefault();pos=Math.min(history.length,pos+1);input.value=history[pos]||'';}});
      root.querySelector('#termClearTop').addEventListener('click',()=>out.replaceChildren());
      root.querySelectorAll('[data-term-command]').forEach(b=>b.addEventListener('click',()=>run(b.dataset.termCommand)));
      input.focus();
    }
  };
})();