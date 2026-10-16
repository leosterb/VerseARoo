'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const root=__dirname;
const files={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/game.css':'game.css','/mascot.bundle.js':'mascot.bundle.js','/verses.json':'verses.json'};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
const port=Number(process.env.PORT)||8765;
const server=http.createServer((req,res)=>{
  const name=files[(req.url||'').split('?')[0]];
  if(!name){res.writeHead(404);return res.end('Not found')}
  fs.readFile(path.join(root,name),(err,data)=>{
    if(err){res.writeHead(500);return res.end('File unavailable')}
    res.writeHead(200,{'Content-Type':types[path.extname(name)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(data);
  });
});
server.listen(port,'127.0.0.1',()=>{
  const url=`http://127.0.0.1:${port}/`;
  console.log(`VerseARoo running at ${url}\nKeep this window open while playing. Press Ctrl+C to stop.`);
  if(process.env.VERSEAROO_NO_OPEN!=='1'&&process.platform==='win32')spawn('cmd.exe',['/c','start','',url],{detached:true,stdio:'ignore'}).unref();
});
server.on('error',err=>{console.error('Could not start VerseARoo:',err.message);process.exitCode=1});
