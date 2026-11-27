import test from 'node:test';
import assert from 'node:assert/strict';
import {readReturnCache,writeReturnCache,clearReturnCache} from '../return-cache.js';
let value=null;
globalThis.localStorage={getItem:()=>value,setItem:(_,v)=>value=v,removeItem:()=>value=null};
const member={uid:'one',account:'name',profile:{displayName:'Member',birthday:'private'},verification:{proofReady:true}};
test('cache survives a new page read but omits private member fields and limits records',()=>{
 writeReturnCache(member,Array.from({length:8},(_,id)=>({id})));
 const restored=readReturnCache('one');assert.equal(restored.posts.length,5);
 assert.deepEqual(restored.member.profile,{displayName:'Member'});
 assert.equal(restored.member.verification,undefined);
});
test('account switching and logout remove previous content',()=>{
 writeReturnCache(member,[]);assert.equal(readReturnCache('two'),null);assert.equal(value,null);
 writeReturnCache(member,[]);clearReturnCache();assert.equal(readReturnCache('one'),null);
});
test('expired, corrupt and oversized snapshots fail closed',()=>{
 writeReturnCache(member,[]);const cached=JSON.parse(value);cached.savedAt-=21600001;value=JSON.stringify(cached);
 assert.equal(readReturnCache('one'),null);value='{bad';assert.equal(readReturnCache('one'),null);
 writeReturnCache(member,[{imageDataUrl:'a'.repeat(2000001)}]);assert.equal(value,null);
});
test('unavailable storage does not interrupt login',()=>{
 const original=globalThis.localStorage;
 globalThis.localStorage={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};
 assert.doesNotThrow(()=>writeReturnCache(member,[]));assert.equal(readReturnCache('one'),null);
 globalThis.localStorage=original;
});
