import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const fn=html.slice(html.indexOf('    async function handleAuthState('),html.indexOf('    onAuthStateChanged(auth, handleAuthState)'));
test('member read failure preserves the session and offers a retry',async()=>{
  const nodes={memberLoadStatus:{textContent:''},retryMemberButton:{hidden:true,classList:{add(){nodes.retryMemberButton.hidden=true;},remove(){nodes.retryMemberButton.hidden=false;}}}};
  let signouts=0;
  const ctx=vm.createContext({state:{member:{uid:'u'}},authRevision:0,readReturnCache:()=>null,bootPage:{},showOnly(){},document:{getElementById:id=>nodes[id]},db:{},doc(){},getDoc:async()=>{throw new Error('offline');},withTimeout:p=>p,auth:{},signOut:()=>{signouts++;}});
  vm.runInContext(fn+'\nthis.handle=handleAuthState;',ctx);
  await ctx.handle({uid:'u'});
  assert.equal(signouts,0);assert.equal(nodes.retryMemberButton.hidden,false);assert.match(nodes.memberLoadStatus.textContent,/登入仍保留/);
});
test('bundled SDK exports every API used by the static frontend',async()=>{
  const sdk=await import('../vendor/firebase-12.3.0.min.js');
  const imports=[...html.matchAll(/import \{([^}]+)\} from "\.\/vendor\/firebase-12.3.0.min.js"/g)].flatMap(x=>x[1].split(',').map(v=>v.trim()));
  assert.ok(imports.length>20);
  for(const api of imports)assert.ok(api in sdk,api);
});
test('restored page appears before member read, remains inert until validation',async()=>{
 let resolveRead;const pending=new Promise(r=>resolveRead=r);const shown=[];
 const nodes=new Proxy({}, {get:(o,k)=>o[k] ||= {textContent:'',classList:{add(){},remove(){}}}});
 const dashboard={inert:false},boot={};let renders=0,cleared=false;
 const ctx=vm.createContext({state:{},authRevision:0,readReturnCache:()=>({member:{uid:'u',profile:{displayName:'Cached'}},posts:[{id:'p'}]}),
 clearReturnCache:()=>cleared=true,reviewReady:new Set(),feedHasSnapshot:false,feedLoadedAt:0,dashboardPage:dashboard,bootPage:boot,
 showOnly:p=>shown.push(p),renderFeed:()=>renders++,document:{getElementById:id=>nodes[id]},db:{},doc(){},getDoc:()=>pending,withTimeout:p=>p,
 auth:{},signOut:async()=>{},});
 vm.runInContext(fn+'\nthis.handle=handleAuthState;',ctx);
 const result=ctx.handle({uid:'u'});
 assert.equal(shown[0],dashboard);assert.equal(dashboard.inert,true);assert.equal(renders,1);
 resolveRead({exists:()=>true,data:()=>({deleted:true})});await result;assert.equal(cleared,true);
});
