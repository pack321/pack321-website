// Pack-owned Drive and email service. See docs/receipts/SETUP.md.
// Keep the Pack's credentials out of source and out of the browser.
const ROOT_FOLDER_ID = '1zYcK335PXOdCA0F4Ve30RUv2W_SO76Z4';
const RECEIPT_EMAIL = 'receipts@pack321wi.org';

function isReady() {
  return PropertiesService.getScriptProperties().getProperty('RECEIPTS_ENABLED') === 'true';
}
function folder_(parent, name) {
  const matches = parent.getFoldersByName(name);
  if (matches.hasNext()) return matches.next();
  return parent.createFolder(name);
}
function text_(value, max, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\r\n\x00]/.test(value)) throw Error('Check ' + label + '.');
  return value.trim();
}
function validate_(data) {
  if (!data || !/^[a-f0-9-]{36}$/i.test(data.requestId || '')) throw Error('Invalid submission reference.');
  const clean = {
    requestId: data.requestId,
    name: text_(data.name,100,'your name'),
    email: text_(data.email,254,'your email'),
    vendor: text_(data.vendor,150,'store or vendor'),
    event: ReceiptRules.eventName(data.event),
    date: data.date,
    amount: ReceiptRules.amount(data.amount),
    year: ReceiptRules.financialYear(data.date),
    notes: typeof data.notes === 'string' ? data.notes.trim() : ''
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email) || clean.notes.length>2000) throw Error('Check your email or notes.');
  if (!Array.isArray(data.files) || data.files.length<1 || data.files.length>5) throw Error('Attach 1–5 receipt files.');
  let size = 0;
  clean.files = data.files.map(function(file) {
    const extensions = {'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png'};
    if (!file || !extensions[file.type] || typeof file.data!=='string' || file.data.length>14*1024*1024) throw Error('Use PDF, JPG, or PNG files.');
    const bytes = Utilities.base64Decode(file.data);
    size += bytes.length;
    if (!bytes.length || size>10*1024*1024) throw Error('Receipt files must total no more than 10 MB.');
    const b = bytes.map(function(x){return x & 255;});
    const valid = file.type==='application/pdf' ? b.slice(0,5).join(',')==='37,80,68,70,45' :
      file.type==='image/jpeg' ? b[0]===255 && b[1]===216 && b[2]===255 : b.slice(0,8).join(',')==='137,80,78,71,13,10,26,10';
    if(!valid) throw Error('A receipt file does not match its PDF or image format.');
    return {bytes:bytes,type:file.type,extension:extensions[file.type]};
  });
  return clean;
}
function submitReceipt(data) {
  if(!isReady()) throw Error('Receipt submissions are not active yet.');
  const clean=validate_(data);
  // Serializes folder lookup/create and duplicate submissions.
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(30000)) throw Error('The receipt service is busy. Please retry.');
  try {
    const yearFolder=folder_(DriveApp.getFolderById(ROOT_FOLDER_ID),clean.year);
    const eventFolder=folder_(yearFolder,clean.event);
    const recordName=clean.requestId+'.json';
    const records=eventFolder.getFilesByName(recordName);
    if(records.hasNext()) {
      const existing=JSON.parse(records.next().getBlob().getDataAsString());
      if(existing.state==='complete') return {reference:existing.reference,subject:existing.subject,emailSent:existing.emailSent};
      throw Error('This submission may already be saved. Give the Treasurer reference '+clean.requestId+' before submitting again.');
    }
    const subject=ReceiptRules.subject(clean.event,clean.amount);
    const record={reference:clean.requestId,subject:subject,name:clean.name,email:clean.email,vendor:clean.vendor,date:clean.date,amount:clean.amount,financialYear:clean.year,event:clean.event,notes:clean.notes,createdAt:new Date().toISOString(),state:'saving',emailSent:false,files:[]};
    // Durable marker before uploads prevents duplicate retries after a partial failure.
    const marker=eventFolder.createFile(recordName,JSON.stringify(record,null,2),MimeType.PLAIN_TEXT);
    const attachments=[];
    clean.files.forEach(function(file,index) {
      const name=clean.date+'_'+subject+'_'+clean.requestId+'_'+(index+1)+'.'+file.extension;
      const blob=Utilities.newBlob(file.bytes,file.type,name);
      const saved=eventFolder.createFile(blob);
      record.files.push({id:saved.getId(),name:name,url:saved.getUrl()});
      attachments.push(blob);
      marker.setContent(JSON.stringify(record,null,2));
    });
    record.state='saved';
    marker.setContent(JSON.stringify(record,null,2));
    const body=['Pack 321 receipt submission','Reference: '+record.reference,'Submitted by: '+record.name+' <'+record.email+'>','Vendor: '+record.vendor,'Purchase date: '+record.date,'Amount: $'+record.amount,'Pack year: '+record.financialYear,'Event: '+record.event,'Notes: '+record.notes,'','Saved receipt files:',record.files.map(function(f){return f.name+'\n'+f.url}).join('\n\n'),'','Reimbursement approval is handled separately.'].join('\n');
    // Do not automatically replay an email after uncertain delivery.
    record.emailStatus='attempting';marker.setContent(JSON.stringify(record,null,2));
    try {
      MailApp.sendEmail({to:RECEIPT_EMAIL,subject:subject,body:body,replyTo:record.email,attachments:attachments,name:'Pack 321 Receipts'});
      record.emailSent=true;record.emailStatus='sent';
    } catch(error) { record.emailStatus='needs-review'; }
    record.state='complete';
    marker.setContent(JSON.stringify(record,null,2));
    return {reference:record.reference,subject:record.subject,emailSent:record.emailSent};
  } finally {lock.releaseLock();}
}

// Only signed requests from the Pack Cloudflare Pages endpoint may submit.
function doPost(e) {
  const output = function(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); };
  try {
    if (!isReady() || !e || !e.postData || e.postData.contents.length>15*1024*1024) return output({ok:false});
    const envelope=JSON.parse(e.postData.contents);
    const secret=PropertiesService.getScriptProperties().getProperty('RECEIPTS_SIGNING_SECRET');
    if (!secret || secret.length<32 || typeof envelope.body!=='string' || !/^\d{13}$/.test(envelope.timestamp) || Math.abs(Date.now()-Number(envelope.timestamp))>300000 || !/^[a-f0-9]{64}$/.test(envelope.signature || '')) return output({ok:false});
    const expected=Utilities.computeHmacSha256Signature(envelope.timestamp+'.'+envelope.body,secret,Utilities.Charset.UTF_8).map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('');
    let mismatch=0;
    for(let i=0;i<64;i++) mismatch |= expected.charCodeAt(i)^envelope.signature.charCodeAt(i);
    if(mismatch) return output({ok:false});
    const result=submitReceipt(JSON.parse(envelope.body));
    return output({ok:true,reference:result.reference,subject:result.subject,emailSent:result.emailSent});
  } catch(error) { return output({ok:false}); }
}
