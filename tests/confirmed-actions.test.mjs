import test from 'node:test';
import assert from 'node:assert/strict';
import {createWriteTracker} from '../confirmed-actions.js';
test('slow writes remain pending, deduplicate and only confirm after acknowledgement', async()=>{
 let slow,resolve,writes=0;const states=[];
 const tracker=createWriteTracker({setTimer:fn=>(slow=fn,1),clearTimer(){},notify:(_,e)=>states.push(e.status)});
 const write=()=>{writes++;return new Promise(r=>resolve=r);};
 const first=tracker.run('report:u:p',write);assert.equal(tracker.get('report:u:p').status,'pending');
 await Promise.resolve();slow();assert.equal(tracker.get('report:u:p').status,'slow');
 assert.equal(tracker.run('report:u:p',write),first);assert.equal(writes,1);
 resolve();assert.equal((await first).ok,true);assert.deepEqual(states,['pending','slow','confirmed']);
 await tracker.run('report:u:p',write);assert.equal(writes,1);
});
test('failed writes can retry; cleared account state never receives old completion notifications',async()=>{
 let writes=0;const states=[];const tracker=createWriteTracker({notify:(_,e)=>states.push(e.status)});
 assert.equal((await tracker.run('key',()=>{writes++;throw Error('denied');})).ok,false);
 assert.equal((await tracker.run('key',()=>{writes++;return 'ok';})).ok,true);assert.equal(writes,2);
 let resolve;const pending=tracker.run('late',()=>new Promise(r=>resolve=r));await Promise.resolve();
 tracker.clear();const count=states.length;resolve();await pending;assert.equal(states.length,count);assert.equal(tracker.get('late'),undefined);
});
