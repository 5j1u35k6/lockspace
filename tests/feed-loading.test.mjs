import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const fn=html.slice(html.indexOf('    async function loadSubmissions('),html.indexOf('    async function loadFeedbackNotifications'));
function setup() {
  let resolveReviews, rejectReviews;
  const reviews=new Promise((resolve,reject)=>{resolveReviews=resolve;rejectReviews=reject;});
  let calls=0;
  const renders=[];
  const ctx=vm.createContext({
    state:{member:{uid:'viewer'},posts:[],reviews:[]},feedLoading:false,feedHasMore:false,feedCursor:null,feedLoadedAt:0,feedHasSnapshot:false,writeReturnCache(){},
    feedLoadRevision:0,reviewWriteEpoch:0,acknowledgedReviews:new Map(),reviewReady:new Set(),FEED_PAGE_SIZE:5,feedStatusKind:'',
    document:{getElementById:()=>({setAttribute(){},disabled:false})},db:{},
    collection:()=>({}),query:()=>({}),orderBy:()=>({}),limit:()=>({}),startAfter:()=>({}),where:()=>({}),
    withTimeout:p=>p,renderFeedStatus(){},renderFeed:()=>renders.push({posts:ctx.state.posts.length,ready:ctx.reviewReady.has('post')}),
    getDocs:()=>++calls===1?Promise.resolve({docs:[{id:'post',data:()=>({ownerId:'author'})}]}):reviews,
    console:{warn(){}},Date,Map,Set,
  });
  vm.runInContext(fn+'\nthis.load = loadSubmissions;',ctx);
  return {ctx,renders,resolveReviews,rejectReviews,calls:()=>calls};
}
test('photos render before slow review query; controls become ready afterwards',async()=>{
  const h=setup();const pending=h.ctx.load();await new Promise(r=>setImmediate(r));
  assert.deepEqual(h.renders,[{posts:1,ready:false}]);
  h.resolveReviews({docs:[]});await pending;
  assert.deepEqual(h.renders.at(-1),{posts:1,ready:true});assert.ok(h.ctx.feedLoadedAt>0);
});
test('review failure keeps photos but never enables unverified voting controls',async()=>{
  const h=setup();const pending=h.ctx.load();await new Promise(r=>setImmediate(r));h.rejectReviews(new Error('offline'));
  assert.equal(await pending,false);assert.equal(h.ctx.state.posts.length,1);assert.equal(h.ctx.reviewReady.size,0);assert.equal(h.ctx.feedLoading,false);assert.equal(h.ctx.feedStatusKind,'failed');
});
test('logout during review read cannot restore private feed state',async()=>{
  const h=setup();const pending=h.ctx.load();await new Promise(r=>setImmediate(r));
  h.ctx.state.member=null;h.ctx.state.posts=[];h.ctx.feedLoadRevision++;
  h.resolveReviews({docs:[]});assert.equal(await pending,false);assert.equal(h.ctx.state.posts.length,0);assert.equal(h.ctx.reviewReady.size,0);
});
test('duplicate refresh shares the current request without another database read',async()=>{
  const h=setup();const pending=h.ctx.load();await new Promise(r=>setImmediate(r));assert.equal(await h.ctx.load(),false);assert.equal(h.calls(),2);h.resolveReviews({docs:[]});await pending;
});

test('returning feed refresh keeps cached content without a blocking loading banner',async()=>{
  const h=setup();h.ctx.feedHasSnapshot=true;
  h.ctx.state.posts=[{id:'cached',ownerId:'author'}];
  const pending=h.ctx.load();assert.equal(h.ctx.feedStatusKind,'');
  assert.equal(h.ctx.state.posts[0].id,'cached');
  await new Promise(r=>setImmediate(r));h.resolveReviews({docs:[]});await pending;
});
