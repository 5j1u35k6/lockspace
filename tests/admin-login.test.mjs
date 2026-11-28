import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdminLogin} from '../admin-login.js';
function harness(extra={}){
 const log={signouts:0,dashboards:0,busy:false,error:'',status:'',retry:false};
 const auth={currentUser:{uid:'admin'}};
 const controller=createAdminLogin({auth,signIn:async()=>{},signOut:async()=>{log.signouts++;},checkAccess:async()=>true,
 showLogin(){},showDashboard:()=>log.dashboards++,showError:v=>log.error=v,setStatus:v=>log.status=v,setBusy:v=>log.busy=v,setRetry:v=>log.retry=v,deadline:p=>p,...extra});
 return {controller,auth,log};
}
test('temporary permission-read failure retains session and provides retry',async()=>{
 const h=harness({checkAccess:async()=>{throw Error('offline');}});await h.controller.verify(h.auth.currentUser);
 assert.equal(h.log.signouts,0);assert.equal(h.log.dashboards,0);assert.equal(h.log.retry,true);assert.equal(h.log.busy,false);
});
test('permission success opens dashboard; missing permission denies access',async()=>{
 const yes=harness();await yes.controller.verify(yes.auth.currentUser);assert.equal(yes.log.dashboards,1);
 const no=harness({checkAccess:async()=>false});await no.controller.verify(no.auth.currentUser);assert.equal(no.log.dashboards,0);assert.equal(no.log.signouts,1);
});
test('late permission response cannot open a logged-out dashboard',async()=>{
 let resolve;const h=harness({checkAccess:()=>new Promise(r=>resolve=r)});const pending=h.controller.verify(h.auth.currentUser);
 h.auth.currentUser=null;await h.controller.verify(null);resolve(true);await pending;assert.equal(h.log.dashboards,0);
});
test('timed-out sign-in retains in-flight lock, avoiding duplicate requests',async()=>{
 let resolve,calls=0;const h=harness({signIn:()=>{calls++;return new Promise(r=>resolve=r)},deadline:()=>Promise.reject(Error('connection-timeout'))});
 await h.controller.submit('a','b');await h.controller.submit('a','b');assert.equal(calls,1);assert.equal(h.log.busy,true);
 resolve();await Promise.resolve();await Promise.resolve();
});
