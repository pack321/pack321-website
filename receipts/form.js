/* Receipt data is posted only to the Pack's own server endpoint. */
(() => {
  const $ = id => document.getElementById(id);
  const rules = ReceiptRules;
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const requestId = Array.from(bytes, x => x.toString(16).padStart(2, '0')).join('').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
  let ready = false, token = '', widget;
  const eventValue = () => $('event').value === 'Other' ? $('other').value : $('event').value;
  function update() {
    const other = $('event').value === 'Other';
    $('otherWrap').classList.toggle('hidden', !other); $('other').required = other;
    try { $('subject').textContent = rules.subject(eventValue(), $('amount').value); }
    catch { $('subject').textContent = 'Receipt-EventName-$0.00'; }
    try { $('year').textContent = rules.financialYear($('date').value); }
    catch { $('year').textContent = 'Financial year'; }
    try { $('eventFolder').textContent = rules.eventName(eventValue()); }
    catch { $('eventFolder').textContent = 'Event name'; }
  }
  ['event', 'other', 'date', 'amount'].forEach(id => $(id).addEventListener('input', update));
  fetch('/api/receipts', {cache:'no-store'}).then(async response => {
    if (!response.ok) return;
    const config = await response.json();
    if (!config.enabled || !config.siteKey) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.onload = () => { widget = turnstile.render('#verification', {
      sitekey: config.siteKey, action: 'receipt',
      callback: value => { token = value; ready = true; $('submit').disabled = false; $('submit').textContent = 'Submit receipt'; },
      'expired-callback': () => { token = ''; $('submit').disabled = true; },
      'error-callback': () => { token = ''; $('submit').disabled = true; $('error').textContent = 'Verification is unavailable. Please try again later.'; }
    }); $('status').textContent = 'Complete verification to submit your receipt.'; };
    script.onerror = () => { $('status').textContent = 'Verification is unavailable. No receipt has been submitted.'; };
    document.head.appendChild(script);
  }).catch(() => { $('status').textContent = 'Receipt submissions are currently unavailable. Nothing has been sent.'; });
  function encode(file) { return new Promise((resolve,reject) => {
    const reader = new FileReader(); reader.onerror = () => reject(Error('Could not read ' + file.name));
    reader.onload = () => resolve({name:file.name,type:file.type,data:String(reader.result).split(',')[1]}); reader.readAsDataURL(file);
  }); }
  $('receiptForm').addEventListener('submit', async e => {
    e.preventDefault(); if (!ready || !token) return;
    $('error').textContent = '';
    try {
      rules.subject(eventValue(), $('amount').value); rules.financialYear($('date').value);
      const files = Array.from($('files').files);
      if (!files.length || files.length > 5 || files.some(f => !['application/pdf','image/jpeg','image/png'].includes(f.type)) || files.reduce((n,f) => n + f.size, 0) > 10 * 1024 * 1024) throw Error('Choose up to 5 PDF, JPG, or PNG files, no more than 10 MB total.');
      $('submit').disabled = true; $('submit').textContent = 'Saving receipt…';
      const data = {requestId,name:$('name').value,email:$('email').value,event:eventValue(),date:$('date').value,amount:$('amount').value,vendor:$('vendor').value,notes:$('notes').value,files:await Promise.all(files.map(encode))};
      const response = await fetch('/api/receipts', {method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify({data,token})});
      const result = await response.json();
      if (!response.ok || !result.ok) throw Error(result.error || 'Unable to confirm receipt submission.');
      $('result').classList.remove('hidden');
      $('result').textContent = 'Receipt saved. Reference: ' + result.reference + '\n' + result.subject + '\n' + (result.emailSent ? 'Receipt email sent.' : 'Receipt email needs Treasurer follow-up; your files are saved.');
      $('submit').textContent = 'Receipt submitted';
      Array.from($('receiptForm').elements).forEach(el => el.disabled = true);
    } catch (err) {
      $('error').textContent = err.message + '\nReference: ' + requestId + '. If a receipt may already have been saved, keep this reference and contact Pack leadership.';
      $('submit').textContent = 'Submit receipt'; token = ''; $('submit').disabled = true;
      if (widget !== undefined) turnstile.reset(widget);
    }
  });
})();
