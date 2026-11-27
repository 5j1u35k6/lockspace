import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const fn=html.slice(html.indexOf('    async function handleAuthState('),html.indexOf('    onAuthStateChanged(auth, handleAuthState)'));
test('member read failure preserves the session and offers a retry',async()=>{
  const nodes={memberLoadStatus:{textContent:''},retryMemberButton:{hidden:true,classList:{add(){nodes.retryMemberButton.hidden=true;},remove(){nodes.retryMemberButton.hidden=false;}}}};
  let signouts=0;
  const ctx=vm.createContext({state:{member:{uid:'u'}},authRevision:0,bootPage:{},showOnly(){},document:{getElementById:id=>nodes[id]},db:{},doc(){},getDoc:async()=>{throw new Error('offline');},withTimeout:p=>p,auth:{},signOut:()=>{signouts++;}});
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
