// Bundled with Three.js for static hosting: npm run not required for visitors.
// The SVG mascot remains visible if WebGL is unavailable.
import { Scene, OrthographicCamera, WebGLRenderer, Group, SphereGeometry, Mesh, MeshStandardMaterial, MeshBasicMaterial, AmbientLight, DirectionalLight, TubeGeometry, CatmullRomCurve3, Vector3, MathUtils } from 'three';

const stage=document.querySelector('.illustration');
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
  if(!stage) throw new Error('Missing stage');
  renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.setClearColor(0x000000,0);
  const scene=new Scene();
  const camera=new OrthographicCamera(-2.7,2.7,2.7,-2.7,.1,100);
  camera.position.set(0,.1,9);camera.lookAt(0,0,0);
  scene.add(new AmbientLight(0xffffff,2.15));
  const key=new DirectionalLight(0xffe1b5,3.2);key.position.set(-3,5,8);scene.add(key);
  const rim=new DirectionalLight(0xdad5ff,2);rim.position.set(3,2,-4);scene.add(rim);
  const roo=new Group();scene.add(roo);
  const fur=new MeshStandardMaterial({color:0xcb875d,roughness:.77});
  const lightFur=new MeshStandardMaterial({color:0xf8d4a4,roughness:.85});
  const earPink=new MeshStandardMaterial({color:0xe4a58d,roughness:.86});
  const dark=new MeshStandardMaterial({color:0x322439,roughness:.66});
  const white=new MeshStandardMaterial({color:0xffffff,roughness:.3});
  const pouchLine=new MeshStandardMaterial({color:0xa56556,roughness:.9});
  const globe=new SphereGeometry(1,24,18);
  function oval(group,x,y,z,sx,sy,sz,mat,rotation=0){const part=new Mesh(globe,mat);part.position.set(x,y,z);part.scale.set(sx,sy,sz);part.rotation.z=rotation;group.add(part);return part}
  function curve(points,radius,mat){const geometry=new TubeGeometry(new CatmullRomCurve3(points.map(p=>new Vector3(...p))),24,radius,7,false);const part=new Mesh(geometry,mat);roo.add(part);return part}
  // Tail sits behind the body; the camera sees a warm, toy-like kangaroo.
  curve([[.45,-.92,-.28],[1,-1.1,-.34],[1.65,-.97,-.38],[1.95,-.47,-.43],[1.88,.05,-.44]],.20,fur);
  oval(roo,0,-.65,0,.78,1.06,.52,fur);
  oval(roo,0,-.69,.45,.53,.65,.12,lightFur);
  curve([[-.49,-.45,.39],[-.3,-.69,.57],[0,-.8,.6],[.3,-.69,.57],[.48,-.45,.39]],.035,pouchLine);
  oval(roo,-.56,-1.34,.24,.30,.30,.36,fur,-.28);oval(roo,.56,-1.34,.24,.30,.30,.36,fur,.28);
  oval(roo,-.54,-1.67,.49,.38,.16,.43,lightFur);oval(roo,.54,-1.67,.49,.38,.16,.43,lightFur);
  oval(roo,-.74,-.48,.26,.19,.51,.24,fur,-.46);oval(roo,.74,-.48,.26,.19,.51,.24,fur,.46);
  oval(roo,-.87,-.86,.46,.19,.2,.17,lightFur);oval(roo,.87,-.86,.46,.19,.2,.17,lightFur);
  const head=new Group();head.position.set(0,.85,0);roo.add(head);
  oval(head,-.37,.84,0,.21,.65,.20,fur,-.16);oval(head,.37,.84,0,.21,.65,.20,fur,.16);
  oval(head,-.37,.87,.17,.11,.48,.06,earPink,-.16);oval(head,.37,.87,.17,.11,.48,.06,earPink,.16);
  oval(head,0,.05,0,.70,.65,.59,fur);
  oval(head,0,-.29,.41,.55,.29,.34,lightFur);
  oval(head,-.30,.13,.53,.093,.13,.063,dark);oval(head,.30,.13,.53,.093,.13,.063,dark);
  oval(head,-.33,.19,.59,.027,.032,.012,white);oval(head,.27,.19,.59,.027,.032,.012,white);
  oval(head,0,-.20,.70,.17,.12,.105,dark);
  curve([[-.19,.49,.96],[0,.43,1.04],[.19,.49,.96]],.021,dark);
  const halo=new Group();scene.add(halo);
  const glintMat=new MeshBasicMaterial({color:0xffe5a1});
  for(let i=0;i<14;i++){
    const m=new Mesh(new SphereGeometry(i%3===0?.045:.027,8,6),glintMat);
    m.position.set(Math.sin(i*2.4)* (1.35+(i%3)*.2),Math.cos(i*1.7)*1.6, -.4);
    halo.add(m);
  }
  const observer=new ResizeObserver(()=>{const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h,false);const span=2.7;camera.left=-span*w/h;camera.right=span*w/h;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();renderer.render(scene,camera)});
  stage.append(renderer.domElement);stage.classList.add('has-3d');observer.observe(stage);
  let reaction='idle',until=0,then=0;
  document.addEventListener('versearoo:action',e=>{reaction=e.detail?.kind||'idle';until=performance.now()+ (reaction==='win'?1900:650)});
  function frame(ms){
    if(document.hidden)return;
    const active=ms<until;
    const t=ms*.001;
    if(!motion.matches){
      roo.position.y=active&&reaction==='win'?Math.abs(Math.sin(t*10))*.32:Math.sin(t*2.3)*.055;
      roo.rotation.z=active&&reaction==='lost'?-.13:active&&reaction==='wrong'?Math.sin(t*28)*.09:Math.sin(t*1.35)*.025;
      roo.rotation.y=Math.sin(t*.7)*.13;
      head.rotation.z=active&&reaction==='right'?Math.sin(t*13)*.14:Math.sin(t*1.3)*.035;
      halo.rotation.z=t*.085;
      halo.scale.setScalar(active&&reaction==='win'?1.10:1);
    }else{roo.position.y=0;roo.rotation.set(0,0,0);head.rotation.z=0;halo.rotation.z=0}
    if(ms>then){renderer.render(scene,camera);then=ms+(motion.matches?100:16)}
  }
  renderer.setAnimationLoop(frame);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderer.render(scene,camera)});
  renderer.domElement.addEventListener('webglcontextlost',()=>stage.classList.remove('has-3d'));
} catch(error){renderer?.dispose();console.warn('3D mascot unavailable; using SVG fallback.',error)}
