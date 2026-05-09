// ===== ESTADO =====
let usuario = JSON.parse(localStorage.getItem("mathwar_user")) || null;
let oro = 500, nivel = 1, guerreros = 0;
let edificios = []; // {tipo,x,y,nivel,el}
let seleccionado = null;
let ejercicioActual = null;
let enBatalla = false;

const IMG = {
  mina: "imagenes/mina.png",
  canon: "imagenes/canon.png",
  cuartel: "imagenes/cuartel.png",
  guerrero: "imagenes/guerrero.png",
};

// ===== STATS =====
const STATS_BASE = {
  mina:    { vida: 200, dano: 0  },
  canon:   { vida: 150, dano: 40 },
  cuartel: { vida: 300, dano: 0  },
};
function statsDe(obj){
  const b = STATS_BASE[obj.tipo] || {vida:100, dano:0};
  return { vida: b.vida * obj.nivel, dano: b.dano * obj.nivel };
}

// ===== NAVEGACIÓN =====
function mostrar(id){
  document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");
  ocultarStats();
  if(id === "ataque") generarAldeaEnemiga();
}

window.addEventListener("load", () => {
  if (usuario) {
    cargarDatos();
    mostrar("menu");
    setInterval(generarOroMinas, 5000);
  } else {
    mostrar("inicio");
  }
});

// ===== LOGIN =====
function entrar(){
  const mail = document.getElementById("loginGmail").value.trim();
  if(!mail){ alert("Escribe tu correo"); return; }
  usuario = { nombre: mail };
  localStorage.setItem("mathwar_user", JSON.stringify(usuario));
  cargarDatos();
  mostrar("menu");
  setInterval(generarOroMinas, 5000);
}
function logout(){
  guardar();
  localStorage.removeItem("mathwar_user");
  location.reload();
}
function cargarDatos(){
  const data = JSON.parse(localStorage.getItem("mathwar_"+usuario.nombre)) || {oro:500,nivel:1,guerreros:0,edificios:[]};
  oro = data.oro; nivel = data.nivel; guerreros = data.guerreros;
  edificios = [];
  document.getElementById("base").innerHTML = "";
  data.edificios.forEach(e => crearEdificio(e.tipo, e.x, e.y, e.nivel, false));
  actualizarUI();
}

// ===== UI =====
function actualizarUI(){
  ["oro","oro2"].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=oro; });
  ["nivel","nivel2"].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=nivel; });
  ["cantidadGuerreros","cantidadGuerreros2","ataqueGuerreros"].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=guerreros; });
}

// ===== EDIFICIOS =====
function crearMina(){ addEdificio("mina"); }
function crearCanon(){ addEdificio("canon"); }
function crearCuartel(){ addEdificio("cuartel"); }

function addEdificio(tipo){
  const costos = {mina:120, canon:160, cuartel:180};
  if(tipo==="mina" && edificios.some(e=>e.tipo==="mina")){ alert("Solo puedes tener 1 mina"); return; }
  if(oro < costos[tipo]){ alert("Oro insuficiente ("+costos[tipo]+")"); return; }
  oro -= costos[tipo];
  const base = document.getElementById("base");
  const w = base.clientWidth-80, h = base.clientHeight-80;
  crearEdificio(tipo, Math.random()*w, Math.random()*h, 1, true);
  actualizarUI(); guardar();
}

function crearEdificio(tipo, x, y, nv, esNuevo){
  const base = document.getElementById("base");
  const el = document.createElement("div");
  el.className = "edificio";
  el.style.left = x+"px"; el.style.top = y+"px";
  el.innerHTML = `<img src="${IMG[tipo]}" alt="${tipo}"><div class="nv">Nv ${nv}</div>`;
  const obj = {tipo, x, y, nivel:nv, el};
  el.addEventListener("click", ev => {
    ev.stopPropagation();
    seleccionar(obj);
    mostrarStats(obj);
  });
  hacerMovible(el, obj);
  base.appendChild(el);
  edificios.push(obj);
  if(esNuevo) guardar();
}

function seleccionar(obj){
  document.querySelectorAll(".edificio").forEach(e => e.style.outline="");
  obj.el.style.outline = "3px solid yellow";
  seleccionado = obj;
}

// ===== PANEL DE STATS =====
function obtenerPanelStats(){
  let p = document.getElementById("statsPanel");
  if(!p){
    p = document.createElement("div");
    p.id = "statsPanel";
    p.style.cssText = `
      position:fixed; top:50px; left:10px; z-index:80;
      background:rgba(0,0,0,.78); color:#fff;
      padding:10px 14px; border:2px solid #daa520; border-radius:10px;
      font-family:'Comic Sans MS',sans-serif; font-size:14px;
      min-width:140px; box-shadow:0 6px 18px #000a;
    `;
    p.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px">
        <strong id="statsTitulo">Edificio</strong>
        <span id="statsCerrar" style="cursor:pointer;color:#daa520;font-weight:bold">✕</span>
      </div>
      <div id="statsBody"></div>
    `;
    document.body.appendChild(p);
    p.querySelector("#statsCerrar").addEventListener("click", ocultarStats);
  }
  return p;
}
function mostrarStats(obj){
  const s = statsDe(obj);
  const p = obtenerPanelStats();
  const nombres = {mina:"⛏️ Mina", canon:"💥 Cañón", cuartel:"🏰 Cuartel"};
  p.querySelector("#statsTitulo").textContent = (nombres[obj.tipo] || obj.tipo) + " (Nv " + obj.nivel + ")";
  let html = `<div>❤️ Vida: <b>${s.vida}</b></div>`;
  if(obj.tipo === "canon"){
    html += `<div>⚔️ Daño: <b>${s.dano}</b></div>`;
  }
  p.querySelector("#statsBody").innerHTML = html;
  p.style.display = "block";
}
function ocultarStats(){
  const p = document.getElementById("statsPanel");
  if(p) p.style.display = "none";
}

function mejorar(){
  if(!seleccionado){ alert("Selecciona un edificio"); return; }
  const costo = seleccionado.nivel * 140;
  if(oro < costo){ alert("Necesitas "+costo+" oro"); return; }
  oro -= costo;
  seleccionado.nivel++;
  seleccionado.el.querySelector(".nv").textContent = "Nv "+seleccionado.nivel;
  actualizarUI(); guardar();
  const p = document.getElementById("statsPanel");
  if(p && p.style.display !== "none") mostrarStats(seleccionado);
}

function hacerMovible(el, obj){
  let drag=false, ox=0, oy=0;
  const start = e => { drag=true; const t = e.touches ? e.touches[0] : e; ox = t.clientX - el.offsetLeft; oy = t.clientY - el.offsetTop; };
  const move = e => { if(!drag) return; const t = e.touches ? e.touches[0] : e; el.style.left = (t.clientX-ox)+"px"; el.style.top = (t.clientY-oy)+"px"; obj.x = el.offsetLeft; obj.y = el.offsetTop; };
  const end = () => { if(drag){ drag=false; guardar(); } };
  el.addEventListener("mousedown", start);
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", end);
  el.addEventListener("touchstart", start, {passive:true});
  document.addEventListener("touchmove", move, {passive:true});
  document.addEventListener("touchend", end);
}

function generarOroMinas(){
  const minas = edificios.filter(e=>e.tipo==="mina");
  if(!minas.length) return;
  minas.forEach(m => oro += 5*m.nivel);
  actualizarUI(); guardar();
}

// ===== GUERREROS =====
function crearGuerrero(){
  if(!edificios.some(e=>e.tipo==="cuartel")){ alert("Necesitas un cuartel"); return; }
  if(guerreros>=10){ alert("Máximo 10 guerreros"); return; }
  if(oro<80){ alert("Necesitas 80 oro"); return; }
  oro-=80; guerreros++; actualizarUI(); guardar();
}

// ===== ALDEA ENEMIGA (aleatoria cada vez) =====
let enemigos = []; // {tipo, nivel, vida, vidaMax, dano, el}

function generarAldeaEnemiga(){
  if(enBatalla) return;
  const mapa = document.getElementById("mapaEnemigo");
  if(!mapa) return;
  mapa.innerHTML = "";
  enemigos = [];

  // dificultad base sobre el nivel del jugador
  const dif = Math.max(1, nivel);
  // composición aleatoria
  const numCanones  = rnd(1, 2 + Math.floor(dif/2));
  const numCuarteles = rnd(1, 2);
  const numMinas    = rnd(0, 2);

  const w = mapa.clientWidth  - 80;
  const h = mapa.clientHeight - 80;

  const agregar = (tipo, n) => {
    for(let i=0;i<n;i++){
      const nv = rnd(1, dif+1);
      const x = Math.random()*w;
      const y = Math.random()*h;
      const s = { vida: STATS_BASE[tipo].vida*nv, dano: STATS_BASE[tipo].dano*nv };
      const el = document.createElement("div");
      el.className = "edificio";
      el.style.left = x+"px"; el.style.top = y+"px";
      el.innerHTML = `
        <img src="${IMG[tipo]}" alt="${tipo}">
        <div class="nv">Nv ${nv}</div>
        <div class="barra-vida" style="height:5px;background:#400;border-radius:3px;margin-top:2px;overflow:hidden">
          <div class="barra-vida-rellena" style="height:100%;width:100%;background:#3c3"></div>
        </div>
      `;
      mapa.appendChild(el);
      enemigos.push({ tipo, nivel:nv, vida:s.vida, vidaMax:s.vida, dano:s.dano, el });
    }
  };
  agregar("canon", numCanones);
  agregar("cuartel", numCuarteles);
  agregar("mina", numMinas);

  const info = document.getElementById("enemigosCount");
  if(info) info.textContent = enemigos.length;
}

// ===== ATAQUE =====
function iniciarAtaque(){
  if(enBatalla) return;
  if(guerreros<=0){ alert("No tienes guerreros"); return; }
  if(!enemigos.length) generarAldeaEnemiga();
  enBatalla = true;

  const mapa = document.getElementById("mapaEnemigo");
  // Crear sprites de guerreros visibles en el mapa
  const tropas = []; // {vida, dano, el}
  const vidaGuerrero = 100;
  const danoGuerrero = 25;

  for(let i=0;i<guerreros;i++){
    const el = document.createElement("div");
    el.className = "guerrero-sprite";
    el.style.cssText = `
      position:absolute; width:42px; height:42px;
      left:${10 + i*46}px; bottom:8px;
      transition: left .4s linear, top .4s linear, opacity .4s;
      z-index:5;
    `;
    el.innerHTML = `<img src="${IMG.guerrero}" style="width:100%;filter:drop-shadow(2px 3px 3px #000a)">`;
    mapa.appendChild(el);
    tropas.push({ vida: vidaGuerrero, vidaMax: vidaGuerrero, dano: danoGuerrero, el });
  }

  // Loop de batalla por turnos rápidos
  const tick = setInterval(() => {
    const vivos = tropas.filter(t=>t.vida>0);
    const enemVivos = enemigos.filter(e=>e.vida>0);

    if(!vivos.length || !enemVivos.length){
      clearInterval(tick);
      finalizarBatalla(vivos.length>0);
      return;
    }

    // Cada guerrero ataca al enemigo más cercano y se mueve hacia él
    vivos.forEach(t => {
      const obj = enemVivos[Math.floor(Math.random()*enemVivos.length)];
      const tx = obj.el.offsetLeft + 20;
      const ty = obj.el.offsetTop + 20;
      t.el.style.left = (tx-20)+"px";
      t.el.style.top  = (ty-20)+"px";
      t.el.style.bottom = "auto";

      obj.vida -= t.dano;
      const pct = Math.max(0, obj.vida)/obj.vidaMax*100;
      const barra = obj.el.querySelector(".barra-vida-rellena");
      if(barra) barra.style.width = pct+"%";
      if(obj.vida<=0){
        obj.el.style.transition = "opacity .4s, transform .4s";
        obj.el.style.opacity = "0";
        obj.el.style.transform = "scale(.6) rotate(15deg)";
      }
    });

    // Los cañones enemigos vivos disparan a guerreros aleatorios
    enemigos.filter(e=>e.tipo==="canon" && e.vida>0).forEach(c => {
      const objetivo = vivos[Math.floor(Math.random()*vivos.length)];
      if(!objetivo) return;
      objetivo.vida -= c.dano;
      if(objetivo.vida<=0){
        objetivo.el.style.opacity = "0";
        objetivo.el.style.transform = "scale(.5) rotate(-20deg)";
      } else {
        // pequeño flash rojo
        objetivo.el.style.filter = "brightness(2) sepia(1) hue-rotate(-50deg)";
        setTimeout(()=> objetivo.el.style.filter="", 200);
      }
    });

    // Actualizar contador en pantalla
    const restantes = tropas.filter(t=>t.vida>0).length;
    guerreros = restantes;
    actualizarUI();
    const info = document.getElementById("enemigosCount");
    if(info) info.textContent = enemigos.filter(e=>e.vida>0).length;
  }, 800);

  function finalizarBatalla(victoria){
    enBatalla = false;
    setTimeout(() => {
      // limpiar sprites de tropas
      tropas.forEach(t => t.el.remove());
      if(victoria){
        const recompensa = 200 + enemigos.length*50;
        oro += recompensa;
        actualizarUI(); guardar();
        alert("🏆 ¡VICTORIA! Destruiste la aldea enemiga.\n+"+recompensa+" oro de recompensa.");
        generarAldeaEnemiga();
      } else {
        guardar();
        alert("💀 DERROTA. Todos tus guerreros cayeron en batalla.");
      }
    }, 600);
  }
}

// ===== MISIONES =====
function abrirEjercicio(tipo){
  let a,b,resp;
  if(tipo==="sumas"){ a=rnd(10,60); b=rnd(10,60); resp=a+b; }
  else if(tipo==="restas"){ a=rnd(20,99); b=rnd(1,a); resp=a-b; }
  else if(tipo==="mult"){ a=rnd(2,12); b=rnd(2,12); resp=a*b; }
  else { b=rnd(2,10); resp=rnd(2,10); a=b*resp; }
  const ops={sumas:"+",restas:"-",mult:"×",div:"÷"};
  const recompensa={sumas:60,restas:70,mult:90,div:110}[tipo];
  ejercicioActual={resp, recompensa};
  document.getElementById("tituloEjercicio").textContent="Ejercicio";
  document.getElementById("preguntaEjercicio").textContent=`${a} ${ops[tipo]} ${b} = ?`;
  document.getElementById("respuestaEjercicio").value="";
  mostrar("ejercicios");
}
function rnd(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function verificarEjercicio(){
  const r=parseInt(document.getElementById("respuestaEjercicio").value);
  if(r===ejercicioActual.resp){ oro+=ejercicioActual.recompensa; alert("¡Correcto! +"+ejercicioActual.recompensa+" oro"); }
  else alert("Incorrecto. Era "+ejercicioActual.resp);
  actualizarUI(); guardar(); mostrar("misiones");
}

// ===== GUARDAR =====
function guardar(){
  if(!usuario) return;
  localStorage.setItem("mathwar_"+usuario.nombre, JSON.stringify({
    oro, nivel, guerreros,
    edificios: edificios.map(e=>({tipo:e.tipo,x:e.x,y:e.y,nivel:e.nivel}))
  }));
}
