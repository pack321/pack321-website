const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'store');
const target=path.join(root,'.tmp','commerce-test-storefront');
fs.rmSync(target,{recursive:true,force:true});
fs.mkdirSync(target,{recursive:true});
fs.cpSync(source,target,{recursive:true});
fs.writeFileSync(path.join(target,'js','api-config.js'),"window.PACK321_API_BASE='https://pack321-storefront-api-test.wicubscoutpack321.workers.dev';\n",'utf8');
const textFiles=[];
const collect=directory=>fs.readdirSync(directory,{withFileTypes:true}).forEach(entry=>{const absolute=path.join(directory,entry.name);if(entry.isDirectory())collect(absolute);else if(/\.(?:html|js)$/i.test(entry.name))textFiles.push(absolute);});
collect(target);
for(const file of textFiles){
  const original=fs.readFileSync(file,'utf8');
  const staged=original
    .replaceAll('Support experience preview — products and checkout are not yet live.','Support experience preview — checkout is available in Stripe test mode.')
    .replaceAll('Preview mode: checkout payment remains disabled.','Test mode: checkout uses Stripe Sandbox and cannot create a live charge.');
  if(staged!==original)fs.writeFileSync(file,staged,'utf8');
}
console.log(JSON.stringify({ok:true,target,apiBase:'https://pack321-storefront-api-test.wicubscoutpack321.workers.dev',productionPreviewConfigUnchanged:fs.readFileSync(path.join(source,'js','api-config.js'),'utf8').includes("||''")},null,2));
