import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import type {ArchiveRecord} from '../engine';
import {recordSubjects} from '../archivePresentation';

export interface ArchiveSceneHandle {
 select:(id:string)=>void;rotate:(angle:number)=>void;pointer:(x:number,y:number)=>void;
 motion:(enabled:boolean)=>void;dispose:()=>void;
}

/** Original fictional archive instrument. No model weights, remote textures or AI output. */
export function createArchiveScene(host:HTMLElement,records:readonly ArchiveRecord[],selectedId:string,motionEnabled:boolean,onPick:(id:string)=>void,onUnavailable:()=>void):ArchiveSceneHandle|null {
 const canvas=document.createElement('canvas');
 const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
 if(!context)return null;
 const renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 canvas.setAttribute('aria-hidden','true');host.append(canvas);
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(35,1,.1,70);
 const rig=new THREE.Group();scene.add(rig);
 const rotor=new THREE.Group();rig.add(rotor);
 const geometries=new Set<THREE.BufferGeometry>();const materials=new Set<THREE.Material>();const textures=new Set<THREE.Texture>();
 const geo=<T extends THREE.BufferGeometry>(value:T)=>{geometries.add(value);return value;};
 const mat=<T extends THREE.Material>(value:T)=>{materials.add(value);return value;};
 const texture=(value:THREE.Texture)=>{textures.add(value);return value;};
 const mesh=(geometry:THREE.BufferGeometry,material:THREE.Material,parent:THREE.Object3D=rig)=>{const value=new THREE.Mesh(geometry,material);parent.add(value);return value;};
 const graphite=mat(new THREE.MeshStandardMaterial({color:0x233044,metalness:.65,roughness:.34}));
 const metal=mat(new THREE.MeshStandardMaterial({color:0xb3becf,metalness:.88,roughness:.28}));
 const edge=mat(new THREE.MeshStandardMaterial({color:0x425472,metalness:.75,roughness:.29}));
 const dark=mat(new THREE.MeshStandardMaterial({color:0x101723,metalness:.45,roughness:.6}));
 const signal=mat(new THREE.MeshStandardMaterial({color:0x9aafff,emissive:0x3b54cf,emissiveIntensity:1.3,roughness:.25,metalness:.2}));
 const warm=mat(new THREE.MeshStandardMaterial({color:0xe6a578,emissive:0x573321,emissiveIntensity:.25,roughness:.4}));
 const room=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);
 const environment=pmrem.fromScene(room,.06);scene.environment=environment.texture;
 room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xc3d5ff,0x141b2d,2.8));
 const key=new THREE.DirectionalLight(0xe9efff,4);key.position.set(-5,9,5);scene.add(key);
 const blue=new THREE.PointLight(0x4b72ff,35,13,2);blue.position.set(4,2,-4);scene.add(blue);
 const rim=new THREE.DirectionalLight(0xe6ab81,2.8);rim.position.set(-4,2,-6);scene.add(rim);

 // A substantial machined base, inlaid ring and exposed indexing hub.
 mesh(geo(new RoundedBoxGeometry(6.3,.55,4.8,3,.13)),graphite).position.y=-.71;
 mesh(geo(new RoundedBoxGeometry(6.08,.12,4.56,2,.1)),edge).position.y=-.39;
 const bed=mesh(geo(new THREE.CylinderGeometry(2.11,2.18,.12,64)),dark);bed.position.y=-.27;
 const rimRing=mesh(geo(new THREE.TorusGeometry(2.13,.035,8,64)),metal);rimRing.rotation.x=Math.PI/2;rimRing.position.y=-.18;
 const glowRing=mesh(geo(new THREE.TorusGeometry(2.21,.018,6,64)),signal);glowRing.rotation.x=Math.PI/2;glowRing.position.y=-.28;
 const hub=mesh(geo(new THREE.CylinderGeometry(.54,.68,.46,48)),metal,rotor);hub.position.y=.02;
 const hubCap=mesh(geo(new THREE.CylinderGeometry(.48,.48,.05,48)),graphite,rotor);hubCap.position.y=.275;
 const axle=mesh(geo(new THREE.CylinderGeometry(.075,.075,.6,16)),metal,rotor);axle.position.y=.4;
 const armGeometry=geo(new RoundedBoxGeometry(.095,.1,1.5,1,.035));
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4;const spoke=mesh(armGeometry,edge,rotor);spoke.position.set(Math.sin(a)*.95,-.04,Math.cos(a)*.95);spoke.rotation.y=a;
  const mark=mesh(geo(new THREE.BoxGeometry(.018,.014,.15)),i%2?metal:signal);mark.position.set(Math.sin(a)*2.34,-.31,Math.cos(a)*2.34);mark.rotation.y=a;
 }
 const screwGeo=geo(new THREE.CylinderGeometry(.065,.065,.025,12));
 for(const x of [-2.83,2.83])for(const z of [-2.03,2.03]){const screw=mesh(screwGeo,metal);screw.position.set(x,-.31,z);const slot=mesh(geo(new THREE.BoxGeometry(.075,.008,.009)),dark);slot.position.set(x,-.293,z);}
 for(let i=0;i<7;i++){const vent=mesh(geo(new RoundedBoxGeometry(.045,.08,.55,1,.015)),dark);vent.position.set(2.48+i*.065,-.29,.75);}

 const labelTexture=(record:ArchiveRecord,active:boolean)=>{
  const label=document.createElement('canvas');label.width=384;label.height=512;
  const c=label.getContext('2d')!;c.fillStyle=active?'#e9e8dd':'#263448';c.fillRect(0,0,384,512);
  c.fillStyle=active?'#1a2639':'#aebddb';c.font='22px sans-serif';c.fillText('ARCHIVE',34,52);
  c.fillStyle=active?'#26334c':'#e3e9f3';c.font='500 94px sans-serif';c.fillText(record.id,28,164);
  c.fillStyle=active?'#435b95':'#8498bb';c.fillRect(32,198,320,2);
  const words=(recordSubjects[record.id]?.kind??record.title).split(' ');c.font='26px sans-serif';let line='',y=256;
  for(const word of words){const next=line?`${line} ${word}`:word;if(c.measureText(next).width>305){c.fillText(line,32,y);line=word;y+=35;}else line=next;}c.fillText(line,32,y);
  c.font='20px monospace';c.fillText(record.date.slice(0,10),32,425);
  for(let i=0;i<28;i++){c.fillStyle=i%3?'#64799a':'#b1bcd0';c.fillRect(32+i*6,464,1+i%2,17);}
  const t=texture(new THREE.CanvasTexture(label));t.colorSpace=THREE.SRGBColorSpace;return t;
 };
 const carrierGeo=geo(new RoundedBoxGeometry(.98,1.62,.18,3,.065));
 const labelGeo=geo(new THREE.PlaneGeometry(.87,1.46));
 const carriers=records.map((record,i)=>{
  const holder=new THREE.Group();rotor.add(holder);const a=i*Math.PI*2/records.length;
  holder.position.set(Math.sin(a)*1.63,.73,Math.cos(a)*1.63);holder.rotation.y=a;
  const body=mesh(carrierGeo,graphite,holder);body.userData.recordId=record.id;
  const faceMaterial=mat(new THREE.MeshBasicMaterial({map:labelTexture(record,false)}));
  const activeLabel=labelTexture(record,true);
  const normalLabel=faceMaterial.map!;
  const face=mesh(labelGeo,faceMaterial,holder);face.position.z=.096;face.userData.recordId=record.id;
  const tab=mesh(geo(new RoundedBoxGeometry(.48,.15,.15,2,.025)),i%2?metal:edge,holder);tab.position.set(-.17,.86,0);
  const stripe=mesh(geo(new THREE.BoxGeometry(.08,1.24,.016)),signal,holder);stripe.position.set(.375,0,.108);stripe.visible=false;
  const brace=mesh(geo(new THREE.BoxGeometry(.08,.7,.12)),metal,holder);brace.position.set(0,-1.05,-.01);
  return {record,holder,faceMaterial,activeLabel,normalLabel,stripe,baseY:.73};
 });
 const screenCanvas=document.createElement('canvas');screenCanvas.width=768;screenCanvas.height=160;
 const screenTexture=texture(new THREE.CanvasTexture(screenCanvas));screenTexture.colorSpace=THREE.SRGBColorSpace;
 const screenMaterial=mat(new THREE.MeshBasicMaterial({map:screenTexture}));
 const screen=mesh(geo(new THREE.PlaneGeometry(2.64,.55)),screenMaterial);screen.position.set(-.95,-.7,2.416);
 const screenBorder=mesh(geo(new RoundedBoxGeometry(2.82,.7,.04,2,.06)),dark);screenBorder.position.set(-.95,-.7,2.39);
 const knobGeo=geo(new THREE.CylinderGeometry(.22,.22,.12,32));const knob=mesh(knobGeo,metal);knob.rotation.x=Math.PI/2;knob.position.set(1.48,-.69,2.42);
 const knobInset=mesh(geo(new THREE.CylinderGeometry(.15,.15,.125,24)),graphite);knobInset.rotation.x=Math.PI/2;knobInset.position.copy(knob.position);
 const indicator=mesh(geo(new THREE.BoxGeometry(.027,.12,.015)),warm);indicator.position.set(1.48,-.64,2.493);

 // A soft contact shadow, not an expensive postprocessing or transmission pass.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
 const shadowContext=shadowCanvas.getContext('2d')!;const gradient=shadowContext.createRadialGradient(64,64,4,64,64,62);gradient.addColorStop(0,'rgba(0,0,0,.8)');gradient.addColorStop(1,'rgba(0,0,0,0)');shadowContext.fillStyle=gradient;shadowContext.fillRect(0,0,128,128);
 const shadow=mesh(geo(new THREE.PlaneGeometry(10,8)),mat(new THREE.MeshBasicMaterial({map:texture(new THREE.CanvasTexture(shadowCanvas)),transparent:true,depthWrite:false})),scene);shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.08;

 let selected=selectedId,spin=0,targetSpin=0,viewRotation=0,pointerX=0,pointerY=0;
 let enabled=motionEnabled,visible=true,disposed=false,raf=0,last=0,frames=0,intro=enabled?0:1;
 const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
 const targetCamera=new THREE.Vector3();const lookTarget=new THREE.Vector3(0,.3,0);
 const pickables=carriers.flatMap(carrier=>carrier.holder.children.filter(child=>(child as THREE.Mesh).isMesh&&!!child.userData.recordId));
 const updateSelection=(id:string)=>{
  selected=id;host.dataset.selectedRecord=id;const index=Math.max(0,records.findIndex(r=>r.id===id));
  const desired=-index*Math.PI*2/records.length;
  targetSpin=spin+THREE.MathUtils.euclideanModulo(desired-spin+Math.PI,Math.PI*2)-Math.PI;
  for(const carrier of carriers){const active=carrier.record.id===id;carrier.faceMaterial.map=active?carrier.activeLabel:carrier.normalLabel;carrier.stripe.visible=active;}
  const record=records[index];const c=screenCanvas.getContext('2d')!;c.fillStyle='#0b152b';c.fillRect(0,0,768,160);c.fillStyle='#a6bdff';c.font='56px monospace';c.fillText(record?.id??'',26,79);c.font='24px monospace';c.fillStyle='#768dbf';c.fillText('FICTIONAL ARCHIVE',26,130);c.textAlign='right';c.fillText(record?.date.slice(0,10)??'',734,72);c.textAlign='left';screenTexture.needsUpdate=true;
 };
 const request=()=>{if(!disposed&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(render);};
 function render(time:number){
  raf=0;if(disposed||!visible||document.hidden)return;
  const dt=last?Math.min((time-last)/1000,.05):1/60;last=time;
  const alpha=enabled?1-Math.exp(-dt*13):1;
  intro=enabled?Math.min(1,intro+dt*1.1):1;
  const introEase=1-Math.pow(1-intro,3);
  spin+=(targetSpin-spin)*alpha;rotor.rotation.y=spin;
  rig.position.y=-.35*(1-introEase);rig.rotation.y+=(viewRotation+(enabled?pointerX*.24:0)-rig.rotation.y)*alpha;
  let moving=Math.abs(targetSpin-spin)>.0004||intro<1||Math.abs(viewRotation+(enabled?pointerX*.24:0)-rig.rotation.y)>.0004;
  for(const carrier of carriers){const target=carrier.baseY+(carrier.record.id===selected ? .63:0);carrier.holder.position.y+=(target-carrier.holder.position.y)*alpha;if(Math.abs(target-carrier.holder.position.y)>.0004)moving=true;}
  // Fixed, deliberately framed camera; hover only changes a bounded viewing angle.
  const distance=8.4;const angle=.23;
  targetCamera.set(Math.sin(angle)*distance,5.6+(enabled?pointerY*.35:0),Math.cos(angle)*distance);
  camera.position.lerp(targetCamera,alpha);if(camera.position.distanceToSquared(targetCamera)>.00001)moving=true;
  camera.lookAt(lookTarget);renderer.render(scene,camera);frames++;
  host.dataset.renderCount=String(frames);host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.triangles=String(renderer.info.render.triangles);
  if(moving)request();
 }
 const resize=()=>{const b=host.getBoundingClientRect();if(!b.width||!b.height)return;renderer.setSize(b.width,b.height,false);camera.aspect=b.width/b.height;camera.fov=b.width<500?44:35;camera.updateProjectionMatrix();request();};
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;if(visible){last=0;request();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'100px'});intersection.observe(host);
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=0;request();}};document.addEventListener('visibilitychange',visibility);
 const hit=(event:PointerEvent|MouseEvent)=>{const b=canvas.getBoundingClientRect();pointer.set((event.clientX-b.left)/b.width*2-1,-(event.clientY-b.top)/b.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(pickables,false)[0]?.object.userData.recordId as string|undefined;};
 const click=(event:MouseEvent)=>{const id=hit(event);if(id)onPick(id);};
 const hover=(event:PointerEvent)=>{if(event.pointerType==='mouse')canvas.style.cursor=hit(event)?'pointer':'default';};
 const contextLost=(event:Event)=>{event.preventDefault();cancelAnimationFrame(raf);raf=0;onUnavailable();};
 canvas.addEventListener('click',click);canvas.addEventListener('pointermove',hover);canvas.addEventListener('webglcontextlost',contextLost);
 host.dataset.motionPolicy=enabled?'responsive':'reduced';
 updateSelection(selectedId);spin=targetSpin;rotor.rotation.y=spin;camera.position.set(1.92,5.6,8.18);resize();
 return {
  select:id=>{updateSelection(id);request();},rotate:angle=>{viewRotation=angle;request();},pointer:(x,y)=>{if(enabled){pointerX=x;pointerY=y;request();}},
  motion:value=>{enabled=value;host.dataset.motionPolicy=value?'responsive':'reduced';pointerX=0;pointerY=0;if(!value)intro=1;request();},
  dispose:()=>{disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('click',click);canvas.removeEventListener('pointermove',hover);canvas.removeEventListener('webglcontextlost',contextLost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();delete host.dataset.renderCount;delete host.dataset.drawCalls;delete host.dataset.triangles;},
 };
}
