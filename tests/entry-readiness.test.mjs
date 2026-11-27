import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=fs.readFileSync(new URL('../entry.js',import.meta.url),'utf8');
test('public content renders without SDK, while unbound submit actions remain disabled',()=>{
  assert.match(html,/<main id="authPage" class="auth-page">/);
  assert.match(html,/<main id="bootPage" class="boot-page hidden">/);
  assert.match(html,/type="submit" disabled data-startup-control>登入並繼續/);
});
test('slow startup shows recovery and eventual readiness clears the timer',()=>{
  let timeout,ready,cleared=false;
  const nodes=new Map();
  const element=()=>({textContent:'',classes:new Set(),addEventListener(){},get classList(){return {add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),toggle(){}};}});
  for(const id of ['startupStatus','retryStartup'])nodes.set(id,element());
  nodes.get('retryStartup').classes.add('hidden');
  const controls=[{disabled:true},{disabled:true}];
  vm.runInNewContext(script,{document:{body:element(),getElementById:id=>nodes.get(id),querySelectorAll:()=>controls},localStorage:{getItem:()=>null},window:{addEventListener:(name,cb)=>{ready=cb;}},setTimeout:cb=>{timeout=cb;return 1;},clearTimeout:()=>{cleared=true;},location:{reload(){}}});
  timeout();assert.equal(nodes.get('retryStartup').classes.has('hidden'),false);
  ready();assert.equal(cleared,true);assert.equal(nodes.get('startupStatus').classes.has('hidden'),true);assert.ok(controls.every(x=>!x.disabled));
});
test('daily task requests share an in-flight read and reuse same-day task',async()=>{
  const fn=html.slice(html.indexOf('    const pendingDailyTasks ='),html.indexOf('    async function createDailyTask'));
  let calls=0,resolve;
  const pending=new Promise(r=>{resolve=r;});
  const ctx=vm.createContext({state:{member:{uid:'u'},dailyTask:null},taipeiDate:()=> '2026-11-27',normalizeTask:x=>x,createDailyTask:()=>{calls++;return pending;},Map,Promise});
  vm.runInContext(fn+'\nthis.load=loadOrCreateDailyTask;',ctx);
  const a=ctx.load(),b=ctx.load();assert.equal(calls,1);resolve({ownerId:'u',taskDate:'2026-11-27'});ctx.state.dailyTask=await a;await b;await ctx.load();assert.equal(calls,1);
  ctx.state.member.uid='other';await ctx.load();assert.equal(calls,2);
});
