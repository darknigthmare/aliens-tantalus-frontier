/** Local-only launcher. Stable port preserves this DLC's origin across updates. */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const allowed=/^\/(?:JOUER_ISOLATION\.html|src\/(?:index\.html|style\.css|[a-z-]+\.js|content\.json)|assets\/[a-zA-Z0-9_/-]+\.svg|docs\/(?:CODEX_ISOLATION|RAPPORT_VISUEL_ISOLATION|AUDIT_SPATIAL_ISOLATION)\.html)$/;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
export function createLocalServer(root=projectRoot){
 const realRootPromise=fs.realpath(root);
 return http.createServer(async(req,res)=>{
  const respond=(status,text)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(text);};
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');respond(405,'Méthode non autorisée');return;}
  if(!/^(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(req.headers.host||'')){respond(403,'Hôte non autorisé');return;}
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{respond(400,'Adresse invalide');return;}
  if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(pathname==='/')pathname='/JOUER_ISOLATION.html';
  if(!allowed.test(pathname)){respond(404,'Fichier non exposé par le lanceur');return;}
  try{
   const realRoot=await realRootPromise,target=await fs.realpath(path.join(realRoot,pathname.slice(1)));
   if(!target.startsWith(realRoot+path.sep)){respond(403,'Chemin refusé');return;}
   const bytes=await fs.readFile(target);
   res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"});
   res.end(req.method==='HEAD'?undefined:bytes);
  }catch{respond(404,'Introuvable');}
 });
}
function openBrowser(url){
 const [command,args]=process.platform==='win32'?['cmd.exe',['/c','start','',url]]:process.platform==='darwin'?['open',[url]]:['xdg-open',[url]];
 const child=spawn(command,args,{stdio:'ignore',detached:true});child.on('error',()=>console.log('Ouvrez cette adresse dans votre navigateur : '+url));child.unref();
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||8127);
 if(!Number.isInteger(port)||port<1024||port>65535){console.error('PORT doit être un entier compris entre 1024 et 65535.');process.exitCode=1;}
 else{
  const server=createLocalServer();server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Port '+port+' déjà utilisé. Fermez le lanceur précédent avant de démarrer cette version. Aucun changement automatique de port.':error.message);process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>{const url=`http://127.0.0.1:${port}/`;console.log('ALIEN: ISOLATION — UNE STATION, DES CHEMINS 0.8.0\n'+url+'\nCette fenêtre doit rester ouverte pendant le jeu. Ctrl+C pour arrêter.\nLa sauvegarde reste dans le navigateur, séparée de Tantalus.');if(process.argv.includes('--open'))openBrowser(url);});
  for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>server.close(()=>process.exit(0)));
 }
}
