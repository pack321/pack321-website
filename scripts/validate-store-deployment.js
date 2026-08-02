const fs=require('fs');
const path=require('path');

const repoRoot=path.resolve(__dirname,'..');
const storeRoot=path.join(repoRoot,'store');
const readJson=relative=>JSON.parse(fs.readFileSync(path.join(storeRoot,relative),'utf8'));
const campaigns=readJson('data/campaigns.json');
const products=readJson('data/products.json');
const scouts=readJson('data/scouts.json');
const media=readJson('assets/media/manifest.json');
const campaignTemplate=readJson('data/campaign-template.json');
const failures=[];

const codePattern=/^[A-Z0-9]{6}$/;
const activeScout=scouts.find(scout=>scout.fundraisingCode==='AB12CD');
const inactiveScout=scouts.find(scout=>scout.fundraisingCode==='ZZ99ZZ');
const isPublicActive=scout=>Boolean(scout&&scout.fundraisingEnabled&&scout.visibility==='public'&&scout.guardianApproved&&scout.status!=='expired');
if(!codePattern.test('AB12CD')||codePattern.test('bad code'))failures.push('fundraising code pattern validation failed');
if(!isPublicActive(activeScout))failures.push('AB12CD must resolve as the active public-safe test profile');
if(isPublicActive(inactiveScout))failures.push('ZZ99ZZ must remain unavailable');
if(isPublicActive(scouts.find(scout=>scout.fundraisingCode==='QQ88QQ')))failures.push('unknown fundraising code must remain unavailable');
const forbiddenScoutFields=['dateOfBirth','address','school','parentNames','familyNames','email','roster','scoutHQId','privateFundraisingTotals'];
scouts.forEach((scout,index)=>forbiddenScoutFields.forEach(field=>{if(field in scout)failures.push(`scouts[${index}] exposes private field ${field}`);}));
for(const scout of scouts.filter(isPublicActive)){
  const route=path.join(storeRoot,'scout',scout.fundraisingCode,'index.html');
  if(!fs.existsSync(route))failures.push(`clean Scout fundraising route is missing: ${scout.fundraisingCode}`);
}
const codeSearchSource=fs.readFileSync(path.join(storeRoot,'js','code-search.js'),'utf8');
for(const event of ['code_search_started','code_search_success','code_search_not_found','code_search_invalid','code_search_unavailable'])if(!codeSearchSource.includes(event))failures.push(`missing analytics event ${event}`);
if(/console\.(?:log|info|warn|error)\s*\(/.test(codeSearchSource))failures.push('fundraising code search must not log raw lookup input');

const valueAt=(object,key)=>key.split('.').reduce((value,part)=>value?.[part],object);
for(const campaign of campaigns){
  for(const key of campaignTemplate.required){
    if(valueAt(campaign,key)===undefined)failures.push(`${campaign.id}: missing campaign field ${key}`);
  }
}

const normalize=value=>String(value||'').trim().toLowerCase();
const aliases={'seasonal':'spring-2027','seasonal-preview':'spring-2027','merchandise':'pack-merchandise','merchandise-campaign':'pack-merchandise'};
const findCampaign=key=>{const wanted=aliases[normalize(key)]||normalize(key);return campaigns.find(campaign=>[campaign.id,campaign.slug,...(campaign.aliases||[])].some(value=>normalize(value)===wanted));};
for(const test of [
  ['wreaths-2026','wreaths-2026'],
  ['seasonal-preview','spring-2027'],
  ['popcorn-2026','popcorn-2026'],
  ['merchandise','pack-merchandise'],
  ['holiday-wreaths-2027','wreaths-2027']
]){
  const match=findCampaign(test[0]);
  if(match?.id!==test[1])failures.push(`campaign lookup ${test[0]} expected ${test[1]}, received ${match?.id||'not found'}`);
}

function exactCasePath(absolute){
  const relative=path.relative(storeRoot,absolute);
  let current=storeRoot;
  for(const segment of relative.split(path.sep)){
    const entries=fs.existsSync(current)?fs.readdirSync(current):[];
    if(!entries.includes(segment))return false;
    current=path.join(current,segment);
  }
  return true;
}

function validateAsset(url,source){
  if(typeof url!=='string'||!url.startsWith('/assets/')){failures.push(`${source}: asset path must start at deployed root: ${url}`);return;}
  if(/[\\]|[A-Za-z]:/.test(url)||url.includes('..')){failures.push(`${source}: unsafe asset path: ${url}`);return;}
  const decoded=decodeURIComponent(url.split(/[?#]/)[0]);
  const absolute=path.join(storeRoot,...decoded.split('/').filter(Boolean));
  if(!fs.existsSync(absolute))failures.push(`${source}: missing ${url}`);
  else if(!exactCasePath(absolute))failures.push(`${source}: case mismatch ${url}`);
  const basename=path.basename(decoded);
  if(/[ '\(\)]/.test(basename))failures.push(`${source}: deploy-sensitive filename ${basename}`);
}

function walkMedia(value,source='media'){
  if(Array.isArray(value)){value.forEach((item,index)=>walkMedia(item,`${source}[${index}]`));return;}
  if(!value||typeof value!=='object')return;
  for(const [key,item] of Object.entries(value)){
    if(['src','fallback','primary','hover'].includes(key)&&typeof item==='string')validateAsset(item,`${source}.${key}`);
    else if(key==='srcset'&&typeof item==='string')item.split(',').forEach((candidate,index)=>validateAsset(candidate.trim().split(/\s+/)[0],`${source}.srcset[${index}]`));
    else if(key==='gallery'&&Array.isArray(item))item.forEach((entry,index)=>typeof entry==='string'?validateAsset(entry,`${source}.gallery[${index}]`):walkMedia(entry,`${source}.gallery[${index}]`));
    else walkMedia(item,`${source}.${key}`);
  }
}
walkMedia(media);
campaigns.forEach((campaign,index)=>{validateAsset(campaign.image,`campaigns[${index}].image`);campaign.gallery.forEach((image,i)=>validateAsset(image,`campaigns[${index}].gallery[${i}]`));});
products.forEach((product,index)=>{validateAsset(product.image,`products[${index}].image`);product.images.forEach((image,i)=>validateAsset(image,`products[${index}].images[${i}]`));});
scouts.forEach((scout,index)=>{if(scout.approvedPhoto)validateAsset(scout.approvedPhoto,`scouts[${index}].approvedPhoto`);});

const textFiles=[];
const collect=directory=>fs.readdirSync(directory,{withFileTypes:true}).forEach(entry=>{const absolute=path.join(directory,entry.name);if(entry.isDirectory())collect(absolute);else if(/\.(html|css|js|json)$/i.test(entry.name))textFiles.push(absolute);});
collect(storeRoot);
for(const file of textFiles){const text=fs.readFileSync(file,'utf8');if(/\.\.\/assets|[A-Za-z]:\\/.test(text))failures.push(`${path.relative(storeRoot,file)}: escapes deployed store root or contains a filesystem path`);}

if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`Store deployment validation passed: ${campaigns.length} campaigns, ${products.length} products, ${textFiles.length} runtime files.`);
