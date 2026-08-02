const http=require('http');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'../store');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp'};
http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);let file=path.join(root,...pathname.split('/').filter(Boolean));if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){response.statusCode=404;response.end('Not found');return;}response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response);}).listen(Number(process.env.PACK321_STORE_PORT)||8765,'127.0.0.1');
