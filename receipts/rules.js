(function(root){
  function financialYear(date){
    const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date||'');
    if(!match)throw Error('Enter a purchase date.');
    const y=+match[1],m=+match[2],d=+match[3];
    const check=new Date(Date.UTC(y,m-1,d));
    if(y<2000||y>2100||check.getUTCFullYear()!==y||check.getUTCMonth()!==m-1||check.getUTCDate()!==d)throw Error('Enter a valid purchase date.');
    const start=m>=8?y:y-1;
    return start+'–'+(start+1);
  }
  function eventName(value){
    const words=String(value||'').trim().match(/[A-Za-z0-9]+/g)||[];
    const name=words.map(x=>x[0].toUpperCase()+x.slice(1)).join('');
    if(!name||name.length>64)throw Error('Enter an event name of up to 64 letters and numbers.');
    return name;
  }
  function amount(value){
    if(!/^\d{1,6}(\.\d{1,2})?$/.test(String(value)))throw Error('Enter an amount greater than $0 with up to two decimal places.');
    const parts=String(value).split('.');
    const cents=Number(parts[0])*100+Number((parts[1]||'').padEnd(2,'0'));
    if(cents<1)throw Error('Enter an amount greater than $0.');
    return Math.floor(cents/100)+'.'+String(cents%100).padStart(2,'0');
  }
  function subject(event,value){return 'Receipt-'+eventName(event)+'-$'+amount(value);}
  const api={financialYear,eventName,amount,subject};
  if(typeof module!=='undefined')module.exports=api;
  root.ReceiptRules=api;
})(typeof globalThis==='undefined'?this:globalThis);
