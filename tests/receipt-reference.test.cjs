const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const rules=require('../receipts/rules.js');
function service(){
  const values=new Map([['RECEIPTS_ENABLED','true']]);
  const sent=[];let locked=false;
  const iterator=items=>{let index=0;return {hasNext:()=>index<items.length,next:()=>items[index++]};};
  function folder(){
    const folders=new Map(),files=[];
    return {folders,files,getFoldersByName:name=>iterator(folders.has(name)?[folders.get(name)]:[]),createFolder:name=>{const f=folder();folders.set(name,f);return f;},getFilesByName:name=>iterator(files.filter(f=>f.name===name)),createFile:(name,content)=>{
      if(typeof name==='object'){content=name;name=name.name;}
      let data=typeof content==='string'?content:'';
      const file={name,getId:()=>name,getUrl:()=> 'https://example.test/'+name,getBlob:()=>({getDataAsString:()=>data}),setContent:value=>{data=value;}};files.push(file);return file;
    }};
  }
  const root=folder();
  const context=vm.createContext({ReceiptRules:rules,PropertiesService:{getScriptProperties:()=>({getProperty:key=>values.get(key)??null,setProperty:(key,value)=>{assert.ok(locked,'Sequence updates require the script lock');values.set(key,value);}})},LockService:{getScriptLock:()=>({tryLock:()=>{assert.equal(locked,false);locked=true;return true;},releaseLock:()=>{locked=false;}})},DriveApp:{getFolderById:()=>root},MimeType:{PLAIN_TEXT:'text/plain'},Utilities:{base64Decode:data=>Array.from(Buffer.from(data,'base64')),newBlob:(bytes,type,name)=>({bytes,type,name})},MailApp:{sendEmail:mail=>sent.push(mail)}});
  vm.runInContext(fs.readFileSync(require.resolve('../docs/receipts/Code.gs'),'utf8'),context);
  const data=(id,date='2026-10-29')=>({requestId:id,name:'Test User',email:'test@example.com',vendor:'Test',event:'Camping',date,amount:'0.01',notes:'Synthetic test',files:[{name:'test.pdf',type:'application/pdf',data:Buffer.from('%PDF-test').toString('base64')}]});
  return {context,root,sent,values,data};
}
test('short references increment across events, reset by financial year, and reuse the same reference on retry',()=>{
  const s=service(),id='11111111-1111-1111-1111-111111111111';
  const first=s.context.submitReceipt(s.data(id));
  assert.equal(first.reference,'R-2627-0001');assert.equal(first.requestId,id);
  const next=s.data('22222222-2222-2222-2222-222222222222');next.event='Pack Meeting';
  assert.equal(s.context.submitReceipt(next).reference,'R-2627-0002');
  assert.equal(s.context.submitReceipt(s.data(id)).reference,first.reference);
  assert.equal(s.sent.length,2);assert.match(s.sent[0].body,/Reference: R-2627-0001/);
  assert.equal(s.sent[0].to,'wicubscoutpack321@gmail.com');
  assert.equal(s.context.submitReceipt(s.data('33333333-3333-3333-3333-333333333333','2027-08-01')).reference,'R-2728-0001');
  assert.equal(s.context.submitReceipt(s.data('44444444-4444-4444-4444-444444444444','2027-07-31')).reference,'R-2627-0003');
  const files=s.root.folders.get('2026–2027').folders.get('Camping').files;
  assert.ok(files.some(f=>f.name.includes('_R-2627-0001_1.pdf')));
});
test('a damaged counter is rejected rather than silently restarted',()=>{
  const s=service();s.values.set('RECEIPT_SEQUENCE_2026–2027','invalid');
  assert.throws(()=>s.context.submitReceipt(s.data('55555555-5555-5555-5555-555555555555')),/counter needs/);
  assert.equal(s.sent.length,0);
});
