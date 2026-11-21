(() => {
 const modules=window.NEXUSModules=window.NEXUSModules||{};
 const API='https://nexus-github-api.onrender.com';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=value=>{if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleString();};
 const ago=value=>{if(!value)return '—';const ms=Date.now()-new Date(value).getTime();if(!Number.isFinite(ms))return '—';const m=Math.max(0,Math.floor(ms/60000));return m<60?m+'m ago':m<1440?Math.floor(m/60)+'h ago':Math.floor(m/1440)+'d ago';};
 modules.github={
  render:()=>'<div class="eyebrow">NEXUS / GITHUB PLATFORM</div><div class="module-title-row"><div><h1>GitHub <span>Hub.</span></h1><p class="subtitle">Repositories, collaboration, automation and account management — powered by GitHub APIs.</p></div><div class="github-hub-actions"><span class="github-hub-status" id="ghStatus">CHECKING CONNECTION</span><button class="secondary-button" id="ghReconnect">RECONNECT</button></div></div><section class="gh-shell"><aside class="gh-sidebar"><div class="gh-account" id="ghAccount"><span class="gh-avatar">GH</span><span><b>GitHub account</b><small>Checking…</small></span></div><label class="gh-repo-label">ACTIVE REPOSITORY<select id="ghRepo"><option value="">Loading repositories…</option></select></label><div class="gh-repo-meta" id="ghRepoMeta"></div><nav class="gh-nav" id="ghNav"><button class="active" data-gh-tab="overview">◈ <span>Overview</span></button><button data-gh-tab="code">⌘ <span>Code</span></button><button data-gh-tab="branches">⑂ <span>Branches</span></button><button data-gh-tab="commits">◷ <span>Commits</span></button><button data-gh-tab="pulls">⇄ <span>Pull Requests</span></button><button data-gh-tab="issues">◎ <span>Issues</span></button><button data-gh-tab="releases">◉ <span>Releases</span></button><button data-gh-tab="actions">▶ <span>Actions</span></button><button data-gh-tab="projects">▦ <span>Projects</span></button><button data-gh-tab="discussions">▤ <span>Discussions</span></button><button data-gh-tab="packages">▣ <span>Packages</span></button><button data-gh-tab="people">♙ <span>People & access</span></button><button data-gh-tab="profile">◉ <span>Profile</span></button><button data-gh-tab="settings">⚙ <span>Settings</span></button></nav><div class="gh-sidebar-foot"><span class="gh-live-dot"></span> LIVE GITHUB API</div></aside><main class="gh-main"><div class="gh-toolbar"><div><small id="ghBreadcrumb">GITHUB / OVERVIEW</small><b id="ghHeading">Workspace overview</b></div><button class="secondary-button" id="ghRefresh">↻ REFRESH</button></div><div class="gh-content" id="ghContent"><div class="gh-loading">Connecting to GitHub…</div></div></main></section><div class="gh-toast" id="ghToast" role="status"></div>',
  mount(root){
   const $=s=>root.querySelector(s);
   const state={repo:localStorage.getItem('nexus.github.repository')||'',branch:'',tab:'overview',user:null,repoData:null};
   const toast=(msg,bad=false)=>{const el=$('#ghToast');el.textContent=msg;el.classList.toggle('error',bad);el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),3600);};
   const request=async(path,method='GET',payload)=>{let url=API+'/api/github/proxy';let options={credentials:'include',headers:{'Content-Type':'application/json'}};if(method==='GET'){url+='?path='+encodeURIComponent(path);}else{options.method='POST';options.body=JSON.stringify({path,method,payload});}const r=await fetch(url,options);const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error((d.error||'GitHub API error '+r.status)+' · endpoint: '+path+' · HTTP '+r.status);return d.data;};
   const graphql=async(query,variables={})=>{const r=await fetch(API+'/api/github/graphql',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error((d.error||'GitHub GraphQL error')+' · endpoint: GraphQL · HTTP '+r.status);return d.data;};
   const repoPath=()=>state.repo?'/repos/'+state.repo:'';
   const content=$('#ghContent');
   const heading=(title,sub,actions='')=>'<div class="gh-section-head"><div><h2>'+esc(title)+'</h2><p>'+esc(sub||'')+'</p></div><div class="gh-actions">'+actions+'</div></div>';
   const empty=(title,sub)=>'<div class="gh-empty"><b>'+esc(title)+'</b><span>'+esc(sub)+'</span></div>';
   const table=(headers,rows)=>'<div class="gh-table-wrap"><table class="gh-table"><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
   const row=(cells)=>'<tr>'+cells.map(c=>'<td>'+c+'</td>').join('')+'</tr>';
   const button=(action,label,cls='secondary-button')=>'<button class="'+cls+'" data-gh-action="'+esc(action)+'">'+esc(label)+'</button>';
   const requireRepo=()=>{if(!state.repo){content.innerHTML=empty('Select a repository','Choose a repository from the left panel to inspect repository features.');return false;}return true;};
   const apiList=async(path)=>{const d=await request(path);return Array.isArray(d)?d:(d.items||d.repositories||d.workflow_runs||d.packages||[]);};
   async function loadRepos(){
    const me=await request('/user');state.user=me;
    $('#ghAccount').innerHTML='<img class="gh-avatar" src="'+esc(me.avatar_url||'')+'" alt=""><span><b>'+esc(me.name||me.login)+'</b><small>@'+esc(me.login)+'</small></span>';
    $('#ghStatus').textContent='CONNECTED · @'+me.login;
    const repos=await apiList('/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member');
    const picker=$('#ghRepo');picker.innerHTML='<option value="">Select repository…</option>'+repos.map(r=>'<option value="'+esc(r.full_name)+'">'+(r.private?'🔒 ':'')+esc(r.full_name)+'</option>').join('');
    if(state.repo&&repos.some(r=>r.full_name===state.repo))picker.value=state.repo;else if(repos.length){state.repo=repos[0].full_name;picker.value=state.repo;localStorage.setItem('nexus.github.repository',state.repo);}
    await loadCurrentRepo();
   }
   async function loadCurrentRepo(){if(!state.repo){$('#ghRepoMeta').textContent='No repository selected';return;}state.repoData=await request(repoPath());state.branch=state.repoData.default_branch;$('#ghRepoMeta').innerHTML='<span>★ '+(state.repoData.stargazers_count||0)+'</span><span>⑂ '+(state.repoData.forks_count||0)+'</span><span>'+(state.repoData.private?'PRIVATE':'PUBLIC')+'</span>';await renderTab();}
   async function renderTab(){
    $('#ghBreadcrumb').textContent='GITHUB / '+state.tab.toUpperCase();$('#ghHeading').textContent=({overview:'Repository overview',code:'Code browser',branches:'Branches',commits:'Commit history',pulls:'Pull requests',issues:'Issues',releases:'Releases',actions:'Actions',projects:'Projects',discussions:'Discussions',packages:'Packages',people:'People & access',profile:'GitHub profile',settings:'Repository settings'})[state.tab];
    content.innerHTML='<div class="gh-loading">Loading '+esc(state.tab)+' from GitHub…</div>';
    try{
     if(state.tab==='profile'){const u=state.user||await request('/user');content.innerHTML=heading('GitHub profile','Your authenticated GitHub identity')+'<div class="gh-profile-card"><img src="'+esc(u.avatar_url)+'" alt=""><div><h2>'+esc(u.name||u.login)+'</h2><p>@'+esc(u.login)+'</p><p>'+esc(u.bio||'No bio set')+'</p><a href="'+esc(u.html_url)+'" target="_blank" rel="noopener">Open GitHub profile ↗</a></div></div>'+table(['Followers','Following','Public repositories','Location'],[row([u.followers||0,u.following||0,u.public_repos||0,esc(u.location||'—')])]);return;}
     if(!requireRepo())return;
     const p=repoPath();
     if(state.tab==='overview'){
      const results=await Promise.allSettled([apiList(p+'/commits?per_page=5'),apiList(p+'/pulls?state=open&per_page=5'),apiList(p+'/issues?state=open&per_page=5'),apiList(p+'/branches?per_page=100')]);const [commits,prs,issues,branches]=results.map(x=>x.status==='fulfilled'?x.value:[]);const failed=results.filter(x=>x.status==='rejected');
      const r=state.repoData;
      content.innerHTML=(failed.length?'<div class="gh-error"><b>Some GitHub sections could not be loaded</b><p>'+esc(failed[0].reason?.message||'GitHub API error')+'</p></div>':'')+'<div class="gh-repo-banner"><div><span class="gh-private">'+(r.private?'PRIVATE':'PUBLIC')+'</span><h2>◈ '+esc(r.full_name)+'</h2><p>'+esc(r.description||'No repository description')+'</p></div><a href="'+esc(r.html_url)+'" target="_blank" rel="noopener">OPEN ON GITHUB ↗</a></div><div class="gh-stat-grid">'+[['Stars',r.stargazers_count],['Forks',r.forks_count],['Open issues',r.open_issues_count],['Branches',branches.length]].map(x=>'<article><small>'+x[0]+'</small><b>'+x[1]+'</b></article>').join('')+'</div>'+heading('Recent commits','Latest changes on the default branch')+table(['Commit','Author','Updated'],commits.map(c=>row(['<a href="'+esc(c.html_url)+'" target="_blank">'+esc(c.commit.message.split('\\n')[0].slice(0,90))+'</a>','<span class="gh-muted">'+esc(c.commit.author?.name||c.author?.login||'Unknown')+'</span>','<time>'+ago(c.commit.author?.date)+'</time>'])).join(''))+heading('Open pull requests','Active code reviews')+table(['Pull request','Author','Updated'],prs.map(x=>row(['<a href="'+esc(x.html_url)+'" target="_blank">#'+x.number+' '+esc(x.title)+'</a>',esc(x.user?.login),ago(x.updated_at)])).join(''))+heading('Open issues','Current work items')+table(['Issue','Author','Updated'],issues.filter(x=>!x.pull_request).map(x=>row(['<a href="'+esc(x.html_url)+'" target="_blank">#'+x.number+' '+esc(x.title)+'</a>',esc(x.user?.login),ago(x.updated_at)])).join(''));return;
     }
     if(state.tab==='code'){
      const tree=await request(p+'/git/trees/'+encodeURIComponent(state.branch||state.repoData.default_branch)+'?recursive=1');const files=(tree.tree||[]).filter(x=>x.type==='blob');
      content.innerHTML=heading('Repository files',(tree.truncated?'Partial tree · ':'')+files.length+' files',button('upload','UPLOAD FILES')+button('newfile','ADD FILE','primary-button'))+table(['Path','Size','Last commit'],files.slice(0,500).map(f=>row(['<code>'+esc(f.path)+'</code>',f.size?Math.round(f.size/1024)+' KB':'—','<span class="gh-muted">Open commit history</span>'])).join(''));return;
     }
     if(state.tab==='branches'){
      const items=await apiList(p+'/branches?per_page=100');content.innerHTML=heading('Branches','Manage development lines',button('newbranch','CREATE BRANCH','primary-button'))+table(['Name','Protected','Latest commit'],items.map(b=>row(['<b>'+esc(b.name)+'</b>',b.protected?'Protected':'—','<code>'+esc(b.commit.sha.slice(0,9))+'</code>'])).join(''));return;
     }
     if(state.tab==='commits'){
      const items=await apiList(p+'/commits?per_page=100');content.innerHTML=heading('Commit history','Repository changes and authors')+table(['Message','Author','Date','SHA'],items.map(c=>row(['<b>'+esc(c.commit.message.split('\\n')[0])+'</b>',esc(c.commit.author?.name||c.author?.login||'Unknown'),date(c.commit.author?.date),'<code>'+esc(c.sha.slice(0,9))+'</code>'])).join(''));return;
     }
     if(state.tab==='pulls'){
      const items=await apiList(p+'/pulls?state=all&per_page=100');content.innerHTML=heading('Pull requests','Review, merge and track proposed changes',button('newpr','NEW PULL REQUEST','primary-button'))+table(['PR','State','Author','Updated'],items.map(x=>row(['<a href="'+esc(x.html_url)+'" target="_blank">#'+x.number+' '+esc(x.title)+'</a>',esc(x.merged_at?'MERGED':x.state.toUpperCase()),esc(x.user?.login),ago(x.updated_at)])).join(''));return;
     }
     if(state.tab==='issues'){
      const items=(await apiList(p+'/issues?state=all&per_page=100')).filter(x=>!x.pull_request);content.innerHTML=heading('Issues','Track bugs, tasks and ideas',button('newissue','NEW ISSUE','primary-button'))+table(['Issue','State','Author','Updated'],items.map(x=>row(['<a href="'+esc(x.html_url)+'" target="_blank">#'+x.number+' '+esc(x.title)+'</a>',esc(x.state.toUpperCase()),esc(x.user?.login),ago(x.updated_at)])).join(''));return;
     }
     if(state.tab==='releases'){
      const items=await apiList(p+'/releases?per_page=100');content.innerHTML=heading('Releases','Published versions and release assets',button('newrelease','DRAFT RELEASE','primary-button'))+table(['Release','Tag','Published','Assets'],items.map(x=>row(['<a href="'+esc(x.html_url)+'" target="_blank">'+esc(x.name||x.tag_name)+'</a>','<code>'+esc(x.tag_name)+'</code>',ago(x.published_at),x.assets?.length||0])).join(''));return;
     }
     if(state.tab==='actions'){
      const d=await request(p+'/actions/runs?per_page=100');const items=d.workflow_runs||[];content.innerHTML=heading('GitHub Actions','Workflow runs, status and automation',button('runworkflow','RUN WORKFLOW','primary-button'))+table(['Workflow','Status','Branch','Started','Run'],items.map(x=>row(['<b>'+esc(x.name)+'</b>', '<span class="gh-state '+esc(x.conclusion||x.status)+'">'+esc(x.conclusion||x.status)+'</span>',esc(x.head_branch),ago(x.created_at),'<a href="'+esc(x.html_url)+'" target="_blank">#'+x.run_number+' ↗</a>'])).join(''));return;
     }
     if(state.tab==='projects'){
      const d=await graphql('query($owner:String!,$name:String!){repository(owner:$owner,name:$name){projectsV2(first:50){nodes{id title number url closed}}}}',{owner:state.repo.split('/')[0],name:state.repo.split('/')[1]});const items=d.repository?.projectsV2?.nodes||[];content.innerHTML=heading('Projects','GitHub Projects v2 boards')+(items.length?table(['Project','Number','Status'],items.map(x=>row(['<a href="'+esc(x.url)+'" target="_blank">'+esc(x.title)+'</a>','#'+x.number,x.closed?'Closed':'Open'])).join('')):empty('No Projects v2 found','Projects may be disabled or your OAuth authorization may need the project scope.'));return;
     }
     if(state.tab==='discussions'){
      const d=await graphql('query($owner:String!,$name:String!){repository(owner:$owner,name:$name){discussions(first:50,orderBy:{field:UPDATED_AT,direction:DESC}){nodes{number title url createdAt updatedAt author{login} category{name}}}}}',{owner:state.repo.split('/')[0],name:state.repo.split('/')[1]});const items=d.repository?.discussions?.nodes||[];content.innerHTML=heading('Discussions','Community conversations')+(items.length?table(['Discussion','Category','Author','Updated'],items.map(x=>row(['<a href="'+esc(x.url)+'" target="_blank">#'+x.number+' '+esc(x.title)+'</a>',esc(x.category?.name),esc(x.author?.login),ago(x.updatedAt)])).join('')):empty('No discussions found','Enable Discussions on GitHub or check your authorization permissions.'));return;
     }
     if(state.tab==='packages'){
      const owner=state.repo.split('/')[0];const packagePath=owner.toLowerCase()===state.user?.login?.toLowerCase()?'/user/packages?package_type=container&per_page=100':'/orgs/'+encodeURIComponent(owner)+'/packages?package_type=container&per_page=100';const items=await apiList(packagePath).catch(()=>[]);content.innerHTML=heading('Packages','GitHub Packages registry')+(items.length?table(['Package','Type','Visibility','Updated'],items.map(x=>row([esc(x.name),esc(x.package_type),esc(x.visibility),ago(x.updated_at)])).join('')):empty('No container packages found','Package registries require read:packages or write:packages permission.'));return;
     }
     if(state.tab==='people'){
      const [collabs,contributors]=await Promise.all([apiList(p+'/collaborators?per_page=100').catch(()=>[]),apiList(p+'/contributors?per_page=100').catch(()=>[])]);content.innerHTML=heading('People & access','Collaborators and contributors',button('invite','ADD COLLABORATOR','primary-button'))+heading('Collaborators','People with repository access')+table(['Account','Permission'],collabs.map(x=>row(['<img class="gh-mini-avatar" src="'+esc(x.avatar_url)+'"> '+esc(x.login),esc(x.role_name||'collaborator')])).join(''))+heading('Contributors','People who have contributed code')+table(['Account','Contributions'],contributors.map(x=>row(['<img class="gh-mini-avatar" src="'+esc(x.avatar_url)+'"> '+esc(x.login),x.contributions])).join(''));return;
     }
     if(state.tab==='settings'){
      const r=state.repoData;content.innerHTML=heading('Repository settings','Core metadata and access configuration')+'<form class="gh-form" id="ghSettings"><label>Repository name<input name="name" value="'+esc(r.name)+'" required></label><label>Description<input name="description" value="'+esc(r.description||'')+'"></label><label>Homepage<input name="homepage" value="'+esc(r.homepage||'')+'"></label><label>Visibility<select name="private"><option value="false" '+(!r.private?'selected':'')+'>Public</option><option value="true" '+(r.private?'selected':'')+'>Private</option></select></label><label class="gh-check"><input type="checkbox" name="has_issues" '+(r.has_issues?'checked':'')+'> Issues enabled</label><label class="gh-check"><input type="checkbox" name="has_discussions" '+(r.has_discussions?'checked':'')+'> Discussions enabled</label><button class="primary-button">SAVE REPOSITORY SETTINGS</button></form><div class="gh-danger-zone"><b>Danger zone</b><p>Destructive repository actions remain on GitHub to avoid accidental deletion.</p><a href="'+esc(r.html_url+'/settings')+'" target="_blank" rel="noopener">OPEN ADVANCED SETTINGS ↗</a></div>';return;
     }
    }catch(error){content.innerHTML='<div class="gh-error"><b>GitHub API request failed</b><p>'+esc(error.message)+'</p><button class="secondary-button" data-gh-action="retry">TRY AGAIN</button></div>';}
   }
   async function action(name){
    try{
     const p=repoPath();
     if(name==='retry'){await renderTab();return;}
     if(name==='newissue'){const title=prompt('Issue title');if(!title)return;const body=prompt('Issue description (Markdown)','')||'';await request(p+'/issues','POST',{title,body});}
     else if(name==='newpr'){const head=prompt('Head branch name');if(!head)return;const base=prompt('Base branch name',state.repoData.default_branch)||state.repoData.default_branch;const title=prompt('Pull request title');if(!title)return;await request(p+'/pulls','POST',{title,head,base,body:prompt('Description','')||''});}
     else if(name==='newbranch'){const name=prompt('New branch name');if(!name)return;const ref=await request(p+'/git/ref/heads/'+encodeURIComponent(state.repoData.default_branch));await request(p+'/git/refs','POST',{ref:'refs/heads/'+name,sha:ref.object.sha});}
     else if(name==='newrelease'){const tag_name=prompt('Release tag (e.g. v1.0.0)');if(!tag_name)return;const title=prompt('Release title',tag_name)||tag_name;await request(p+'/releases','POST',{tag_name,name:title,body:prompt('Release notes (Markdown)','')||'',draft:false,prerelease:false});}
     else if(name==='invite'){const username=prompt('GitHub username to invite');if(!username)return;await request(p+'/collaborators/'+encodeURIComponent(username),'PUT',{});}
     else if(name==='runworkflow'){const workflows=await apiList(p+'/actions/workflows?per_page=100');if(!workflows.length){toast('No GitHub Actions workflows found.',true);return;}const names=workflows.map(w=>w.name+' ('+w.path+')').join('\\n');const chosen=prompt('Enter workflow file name:\\n'+names,workflows[0].path);if(!chosen)return;const ref=prompt('Branch or tag to run',state.repoData.default_branch)||state.repoData.default_branch;await request(p+'/actions/workflows/'+encodeURIComponent(chosen)+'/dispatches','POST',{ref});}
     else if(name==='upload'||name==='newfile'){toast('Use Code Editor Explorer to create or upload repository files.');window.NEXUSNavigate?.('editor');return;}
     toast('GitHub updated successfully.');await renderTab();
    }catch(e){toast(e.message,true);}
   }
   $('#ghNav').addEventListener('click',e=>{const b=e.target.closest('[data-gh-tab]');if(!b)return;state.tab=b.dataset.ghTab;$('#ghNav').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));renderTab();});
   content.addEventListener('click',e=>{const b=e.target.closest('[data-gh-action]');if(b)action(b.dataset.ghAction);});
   content.addEventListener('submit',async e=>{if(e.target.id!=='ghSettings')return;e.preventDefault();const f=new FormData(e.target);try{await request(repoPath(),'PATCH',{name:f.get('name'),description:f.get('description'),homepage:f.get('homepage'),private:f.get('private')==='true',has_issues:f.has('has_issues'),has_discussions:f.has('has_discussions')});toast('Repository settings saved.');state.repoData=await request(repoPath());renderTab();}catch(err){toast(err.message,true);}});
   $('#ghRepo').addEventListener('change',async e=>{state.repo=e.target.value;localStorage.setItem('nexus.github.repository',state.repo);await loadCurrentRepo().catch(err=>toast(err.message,true));});
   $('#ghRefresh').onclick=()=>state.tab==='profile'?request('/user').then(u=>{state.user=u;renderTab();}):renderTab();
   $('#ghReconnect').onclick=()=>location.href=API+'/auth/github';
   loadRepos().catch(error=>{content.innerHTML='<div class="gh-error"><b>GitHub connection required</b><p>'+esc(error.message)+'</p><button class="primary-button" id="ghConnectNow">CONNECT GITHUB</button></div>';$('#ghConnectNow')?.addEventListener('click',()=>location.href=API+'/auth/github');$('#ghStatus').textContent='NOT CONNECTED';});
  }
 };
})();