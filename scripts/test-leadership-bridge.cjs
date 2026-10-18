const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../functions/api/public/leadership/[[path]].js'),'utf8');
const context=vm.createContext({Request,Response,URL,AbortSignal});
vm.runInContext(source.replace('export async function','async function')+';globalThis.handler=onRequest;',context);
test('bridge exposes only GET publication and published-photo paths without caller credentials',async()=>{
 const calls=[];
 const env={LEADERSHIP_PUBLICATION:{async fetch(request){calls.push(request);return Response.json({revision:8,leaders:[{name:'Lion leader',photoUrl:'https://preview-hq.pack321wi.org/api/leadership/photos/4cf7b736-c422-4608-99a4-9c62bee3e551'}]});}}};
 const request=new Request('https://pack321wi.org/api/public/leadership',{headers:{cookie:'PRIVATE',Authorization:'PRIVATE'}});
 const response=await context.handler({request,env,params:{}});
 assert.equal(response.headers.get('Cache-Control'),'no-store');
 assert.equal((await response.json()).leaders[0].photoUrl,'/api/public/leadership/photos/4cf7b736-c422-4608-99a4-9c62bee3e551');
 assert.equal(calls[0].headers.get('cookie'),null);assert.equal(calls[0].headers.get('authorization'),null);
 for(const path of [['..','leadership'],['photos','bad'],['import']])assert.equal((await context.handler({request,env,params:{path}})).status,404);
 assert.equal((await context.handler({request:new Request(request.url,{method:'POST'}),env,params:{}})).status,405);
 assert.equal(calls.length,1);
});
test('denied private photos and login HTML fail closed',async()=>{
 const request=new Request('https://pack321wi.org/api/public/leadership');
 const env={LEADERSHIP_PUBLICATION:{fetch:async()=>new Response(null,{status:401})}};
 assert.equal((await context.handler({request,env,params:{path:['photos','4cf7b736-c422-4608-99a4-9c62bee3e551']}})).status,401);
 env.LEADERSHIP_PUBLICATION.fetch=async()=>new Response('sign in',{headers:{'Content-Type':'text/html'}});
 assert.equal((await context.handler({request,env,params:{}})).status,503);
});
