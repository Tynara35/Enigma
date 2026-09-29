import * as T from './vendor/three.module.js';

const smooth = (v) => { const t = T.MathUtils.clamp(v,0,1); return t*t*(3-2*t); };

export async function createChestScene(host, prize, onComplete) {
  const renderer = new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.25;
  host.append(renderer.domElement);
  const scene=new T.Scene();
  scene.background=new T.Color('#101713');
  scene.fog=new T.Fog('#101713',12,24);
  const camera=new T.PerspectiveCamera(38,1,.1,40);
  const textures=[],materials=[],geometries=[];
  const material=p=>{const m=new T.MeshStandardMaterial(p);materials.push(m);return m;};
  const woodTexture=await new T.TextureLoader().loadAsync('./assets/wood.png').catch(()=>null);
  if(woodTexture){woodTexture.colorSpace=T.SRGBColorSpace;woodTexture.anisotropy=4;textures.push(woodTexture);}
  const wood=material({color:0xc59b75,map:woodTexture,bumpMap:woodTexture,bumpScale:.027,roughness:.78});
  const inner=material({color:0x382619,map:woodTexture,roughness:.95});
  const brass=material({color:0x947042,metalness:.78,roughness:.38});
  const darkBrass=material({color:0x4b3926,metalness:.7,roughness:.56});
  const iron=material({color:0x28251e,metalness:.74,roughness:.46});
  function mesh(geo,mat,parent=scene){geometries.push(geo);const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,x,y,z,mat,parent){const m=mesh(new T.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m;}
  const environment=new T.Scene();environment.background=new T.Color('#5b5548');
  for(const [x,y,z,color] of [[-4,6,2,0xffdeac],[5,3,-3,0xa0c5d1],[0,7,-2,0xffffff]]){
    const lightMat=new T.MeshBasicMaterial({color});materials.push(lightMat);
    box(3,3,.2,x,y,z,lightMat,environment);
  }
  const pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(environment,.02);
  scene.environment=env.texture;scene.environmentIntensity=.65;pmrem.dispose();
  scene.add(new T.HemisphereLight(0xc2d6cd,0x21170f,1.4));
  const key=new T.DirectionalLight(0xffd7a3,4.2);key.position.set(-3,6,5);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.normalBias=.025;scene.add(key);
  const rim=new T.DirectionalLight(0x98c9de,2.5);rim.position.set(3,4,-4);scene.add(rim);
  const ground=box(100,.18,100,0,-.2,0,material({color:0x121713,roughness:.94}));ground.castShadow=false;
  const chest=new T.Group();scene.add(chest);
  // A hollow body, individual planks and metal fasteners cast real shadows.
  box(3.4,.18,1.85,0,.1,0,inner,chest);
  for(let i=0;i<5;i++)for(const z of [-.86,.86])box(3.4,.237,.13,0,.28+i*.241,z,wood,chest);
  for(const x of [-1.64,1.64])box(.13,1.21,1.64,x,.75,0,wood,chest);
  for(const y of [.19,1.38]){
    for(const z of [-.94,.94])box(3.48,.09,.065,0,y,z,brass,chest);
    for(const x of [-1.73,1.73])box(.06,.09,1.9,x,y,0,brass,chest);
  }
  for(const x of [-1.25,1.25])for(const z of [-.95,.95]){
    box(.16,1.18,.07,x,.77,z,brass,chest);
    for(const y of [.27,.51,.76,1.01,1.27]){
      const stud=mesh(new T.SphereGeometry(.043,10,8),darkBrass,chest);stud.position.set(x,y,z+Math.sign(z)*.039);stud.scale.z=.4;
    }
  }
  for(const x of [-1.53,1.53])for(const z of [-.7,.7])box(.3,.22,.3,x,.01,z,darkBrass,chest);
  for(const x of [-1.77,1.77]){
    box(.07,.25,.55,x,.83,0,darkBrass,chest);
    const handle=mesh(new T.TorusGeometry(.2,.035,8,24),iron,chest);handle.rotation.y=Math.PI/2;handle.position.set(x,.67,0);
  }
  box(.32,.4,.095,0,1.07,.985,darkBrass,chest);
  const lock=mesh(new T.CylinderGeometry(.135,.135,.08,24),brass,chest);lock.rotation.x=Math.PI/2;lock.position.set(0,1.07,1.052);
  box(.027,.09,.012,0,1.065,1.1,iron,chest);
  const hinge=new T.Group();hinge.position.set(0,1.43,-.9);chest.add(hinge);
  // Barrel lid: curved planks, curved straps and side caps share a rear hinge.
  function arch(x0,x1,t0,t1,r=.94){const v=[],uv=[],indices=[],n=28;for(let i=0;i<=n;i++){const a=t0+(t1-t0)*i/n;for(const x of [x0,x1]){v.push(x,.5*Math.sin(a),.9+r*Math.cos(a));uv.push((x+1.75)/3.5,i/n);}}for(let i=0;i<n;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;}
  wood.side=T.DoubleSide;brass.side=T.DoubleSide;
  for(let i=0;i<12;i++)mesh(arch(-1.74,1.74,i*Math.PI/12+.006,(i+1)*Math.PI/12-.006),wood,hinge);
  for(const x of [-1.25,1.25]){
    mesh(arch(x-.09,x+.09,0,Math.PI,.956),brass,hinge);
    for(let i=1;i<8;i++){const t=i*Math.PI/8;const s=mesh(new T.SphereGeometry(.035,8,6),darkBrass,hinge);s.position.set(x,.51*Math.sin(t),.9+.962*Math.cos(t));}
  }
  for(const x of [-1.75,1.75]){
    const shape=new T.Shape();shape.moveTo(-.94,0);for(let i=0;i<=32;i++){const t=Math.PI-i*Math.PI/32;shape.lineTo(.94*Math.cos(t),.5*Math.sin(t));}shape.closePath();
    const cap=mesh(new T.ShapeGeometry(shape),wood,hinge);cap.rotation.y=Math.PI/2;cap.position.set(x,0,.9);
    mesh(arch(x-.035,x+.035,0,Math.PI,.962),brass,hinge);
  }
  for(const z of [-.045,1.845])box(3.54,.075,.07,0,0,z,brass,hinge);
  box(3.35,.07,1.78,0,-.055,.9,inner,hinge);
  const clasp=box(.15,.32,.06,0,-.13,1.86,brass,hinge);
  const interiorLight=new T.PointLight(0xffbd58,0,6,2);interiorLight.position.set(0,1.15,.1);chest.add(interiorLight);
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const gc=glowCanvas.getContext('2d');const grad=gc.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(255,220,150,.7)');grad.addColorStop(.3,'rgba(255,181,65,.2)');grad.addColorStop(1,'rgba(255,155,40,0)');gc.fillStyle=grad;gc.fillRect(0,0,128,128);const glowTex=new T.CanvasTexture(glowCanvas);textures.push(glowTex);
  const glowMat=new T.SpriteMaterial({map:glowTex,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});materials.push(glowMat);const glow=new T.Sprite(glowMat);glow.position.set(0,1.55,0);glow.scale.set(3,2.3,1);chest.add(glow);
  const reward=new T.Group();reward.position.set(0,.6,0);chest.add(reward);
  const parchmentCanvas=document.createElement('canvas');parchmentCanvas.width=2048;parchmentCanvas.height=1280;
  const ctx=parchmentCanvas.getContext('2d');ctx.fillStyle='#f5e5bc';ctx.fillRect(0,0,2048,1280);ctx.strokeStyle='#977640';ctx.lineWidth=6;ctx.strokeRect(55,55,1938,1170);ctx.textAlign='center';ctx.fillStyle='#725226';ctx.font='bold 54px Georgia';ctx.fillText('SEU TESOURO',1024,160);
  // Re-wrap at each font size. Split oversized words too, without squeezing glyphs.
  function wrap(text,size){ctx.font=`bold ${size}px Georgia`;const result=[];let line='';for(const word of text.split(/\s+/)){if(ctx.measureText(word).width>1740){if(line){result.push(line);line='';}for(const char of Array.from(word)){if(ctx.measureText(line+char).width>1740){result.push(line);line='';}line+=char;}}else if(ctx.measureText(line+(line?' ':'')+word).width>1740){result.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)result.push(line);return result;}
  let font=190,lines=wrap(String(prize),font);
  while(lines.length*font*1.2>820&&font>48){font-=4;lines=wrap(String(prize),font);}
  ctx.font=`bold ${font}px Georgia`;ctx.fillStyle='#24170e';ctx.textBaseline='middle';
  const lineHeight=font*1.2,firstY=710-(lines.length-1)*lineHeight/2;
  lines.forEach((line,i)=>ctx.fillText(line,1024,firstY+i*lineHeight));
  const parchmentTexture=new T.CanvasTexture(parchmentCanvas);parchmentTexture.colorSpace=T.SRGBColorSpace;textures.push(parchmentTexture);
  parchmentTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  box(2.5,1.6,.04,0,0,0,material({color:0xe7d2a1,roughness:.95}),reward);
  // An unlit ink face preserves contrast even under the golden interior light.
  const ink=new T.MeshBasicMaterial({map:parchmentTexture,toneMapped:false});materials.push(ink);
  const paperFace=mesh(new T.PlaneGeometry(2.5,1.6),ink,reward);paperFace.position.z=.025;paperFace.castShadow=false;paperFace.receiveShadow=false;
  for(const y of [-.81,.81]){const roll=mesh(new T.CylinderGeometry(.055,.055,2.62,16),material({color:0xcab182,roughness:.9}),reward);roll.rotation.z=Math.PI/2;roll.position.y=y;}
  reward.visible=false;
  let disposed=false,complete=false,forced=false,frame=0,start=performance.now();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(complete)renderer.render(scene,camera);}
  const observer=new ResizeObserver(size);observer.observe(host);size();
  function render(now){if(disposed)return;const t=forced||reduced?7:(now-start)/1000;const move=smooth(t/1.8),open=smooth((t-1.5)/2.3),rise=smooth((t-3.8)/1.5);
    camera.position.set(2.8-.35*move,2.9,6.1-.55*move);camera.lookAt(0,1.35,0);chest.position.z=.22*move;chest.rotation.y=-.08+.08*move;
    hinge.rotation.x=-1.85*open;clasp.rotation.x=-.45*smooth((t-1)/.6);
    interiorLight.intensity=9*open;glowMat.opacity=.48*open;
    reward.visible=rise>0;reward.position.y=.6+1.3*rise;reward.position.z=.05+1.25*rise;reward.quaternion.copy(camera.quaternion);
    renderer.render(scene,camera);
    if(t>=5.6&&!complete){complete=true;onComplete();}
    if(!complete)frame=requestAnimationFrame(render);
  }
  frame=requestAnimationFrame(render);
  function finish(){forced=true;cancelAnimationFrame(frame);render(performance.now());}
  function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();renderer.dispose();renderer.domElement.remove();}
  return {finish,dispose};
}


