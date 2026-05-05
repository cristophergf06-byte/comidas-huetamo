// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyABJrHksJy0IxPdm2AQyqZswCX6px5oUzs",
  authDomain: "comidas-huetamo-50bf2.firebaseapp.com",
  projectId: "comidas-huetamo-50bf2",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let locales = [];

/* ===== LOADER ===== */
function mostrarLoader(){
let l = document.getElementById("loader");
if(l) l.style.display="flex";
}

function ocultarLoader(){
let l = document.getElementById("loader");
if(l) l.style.display="none";
}

/* ================= LOGIN ================= */
function loginAdmin(){
let pass = document.getElementById("adminPass").value;

if(pass === "Tecnologico2026"){
localStorage.setItem("admin","true");
location.href="admin.html";
}else{
alert("❌ Contraseña incorrecta");
}
}

/* ================= MAPA ================= */
let lat = null;
let lng = null;

if(document.getElementById("map")){
let map = L.map('map').setView([18.62, -100.90], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let marker;

map.on('click', function(e){
lat = e.latlng.lat;
lng = e.latlng.lng;

if(marker){ map.removeLayer(marker); }

marker = L.marker([lat, lng]).addTo(map);

document.getElementById("coords").innerText =
"Ubicación: " + lat.toFixed(5) + ", " + lng.toFixed(5);
});
}

/* ================= FIREBASE LOAD ================= */
async function cargarLocalesFirebase(){
mostrarLoader();

let snapshot = await db.collection("locales").get();

locales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

ocultarLoader();
}

/* ================= REGISTRO ================= */
if(document.getElementById("formRegistro")){
document.getElementById("formRegistro").onsubmit = async function(e){
e.preventDefault();

mostrarLoader();

let file = document.getElementById("regImagen").files[0];

if(file){

let reader = new FileReader();

reader.onload = async function(){

let nuevo = {
nombre: regNegocio.value,
desc: regVenta.value,
cat: regTiempo.value,
img: reader.result,
telefono: regTelefono.value,
ubicacion: lat && lng ? lat + "," + lng : regUbicacion.value,
horario: regHorario.value,
aprobado: false
};

await db.collection("locales").add(nuevo);

ocultarLoader();
alert("✅ Guardado correctamente");
location.href="buscador.html";
};

reader.readAsDataURL(file);

}else{

let nuevo = {
nombre: regNegocio.value,
desc: regVenta.value,
cat: regTiempo.value,
img: "",
telefono: regTelefono.value,
ubicacion: lat && lng ? lat + "," + lng : regUbicacion.value,
horario: regHorario.value,
aprobado: false
};

await db.collection("locales").add(nuevo);

ocultarLoader();
alert("✅ Guardado correctamente");
location.href="buscador.html";
}
};
}

/* ================= BUSCAR ================= */
function buscarLocal(){
let texto = inputBusqueda.value.toLowerCase();

let resultados = locales.filter(l =>
l.nombre.toLowerCase().includes(texto)
);

mostrarResultados(resultados);
}

/* ================= RESULTADOS ================= */
function mostrarResultados(lista){

let cont = document.getElementById("resultados-busqueda");
if(!cont) return;

cont.innerHTML="";

lista.filter(l=>l.aprobado).forEach(l=>{

let link = "https://www.google.com/maps?q=" + encodeURIComponent(l.ubicacion || "");

cont.innerHTML += `
<div onclick='verDetalle(${JSON.stringify(l)})'>
<img src="${l.img || ''}" class="card-img">
<div class="card-body">
<h3>${l.nombre}</h3>
<p>${l.desc}</p>

<div class="card-btns">
<a href="${link}" target="_blank" class="btn-ubi">📍</a>
<a href="tel:${l.telefono}" class="btn-call">📞</a>
</div>
</div>
</div>
`;
});
}

/* ================= DETALLE PRO ================= */
function verDetalle(local){

let modal = document.createElement("div");
modal.className="modal";
modal.style.display="flex";

modal.innerHTML = `
<div class="modal-content">
<h2>${local.nombre}</h2>
<img src="${local.img}" style="width:100%;border-radius:15px;">
<p>${local.desc}</p>
<p><b>Tel:</b> ${local.telefono}</p>
<p><b>Ubicación:</b> ${local.ubicacion}</p>
<p><b>Horario:</b> ${local.horario}</p>
<button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
</div>
`;

document.body.appendChild(modal);
}

/* ================= ADMIN ================= */
function mostrarAdmin(){

let cont = document.getElementById("admin-lista");
if(!cont) return;

cont.innerHTML="";

locales.forEach((l,i)=>{

cont.innerHTML += `
<div class="admin-card">
<img src="${l.img || ''}" class="admin-img">

<div class="admin-body">
<h3>${l.nombre}</h3>
<p>${l.desc}</p>

<div class="admin-btns">
<button onclick="aprobar('${l.id}')">✔</button>
<button onclick="editar(${i})">✏️</button>
<button onclick="eliminar('${l.id}')">🗑</button>
</div>
</div>
</div>
`;
});
}

/* ================= BUSCAR ADMIN ================= */
function buscarAdmin(){
let texto = adminSearch.value.toLowerCase();

let filtrados = locales.filter(l =>
l.nombre.toLowerCase().includes(texto)
);

let cont = document.getElementById("admin-lista");
cont.innerHTML="";

filtrados.forEach(l=>{
cont.innerHTML += `<div class="admin-card">${l.nombre}</div>`;
});
}

/* ================= ACCIONES ================= */
async function aprobar(id){
mostrarLoader();
await db.collection("locales").doc(id).update({ aprobado: true });
location.reload();
}

async function eliminar(id){
mostrarLoader();
await db.collection("locales").doc(id).delete();
location.reload();
}

/* ================= LOAD ================= */
window.onload = async ()=>{

await cargarLocalesFirebase();

if(window.location.pathname.includes("buscador.html")){
mostrarResultados(locales);
}

if(document.getElementById("admin-lista")){
mostrarAdmin();
}

};
