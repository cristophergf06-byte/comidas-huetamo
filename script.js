// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyABJrHksJy0IxPdm2AQyqZswCX6px5oUzs",
  authDomain: "comidas-huetamo-50bf2.firebaseapp.com",
  projectId: "comidas-huetamo-50bf2",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let locales = [];
let localEditando = null;

/* ===== LOADER PRO ===== */
function mostrarLoader(mensaje="Cargando..."){
let l = document.getElementById("loader");
if(l){
l.innerText = mensaje;
l.style.display="flex";
}
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
mostrarLoader("📡 Cargando negocios...");

let snapshot = await db.collection("locales").get();

locales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

ocultarLoader();
}

/* ================= REGISTRO ================= */
if(document.getElementById("formRegistro")){
document.getElementById("formRegistro").onsubmit = async function(e){
e.preventDefault();

mostrarLoader("⏳ Registrando negocio...");

let file = document.getElementById("regImagen").files[0];

let nuevo = {
nombre: document.getElementById("regNegocio").value,
desc: document.getElementById("regVenta").value,
cat: document.getElementById("regTiempo").value,
img: "",
telefono: document.getElementById("regTelefono").value,
ubicacion: lat && lng ? lat + "," + lng : document.getElementById("regUbicacion").value,
horario: document.getElementById("regHorario").value,
aprobado: false
};

if(file){
let reader = new FileReader();
reader.onload = async function(){
nuevo.img = reader.result;

await db.collection("locales").add(nuevo);

ocultarLoader();
alert("✅ Negocio registrado correctamente");
location.href="buscador.html";
};
reader.readAsDataURL(file);
}else{
await db.collection("locales").add(nuevo);

ocultarLoader();
alert("✅ Negocio registrado correctamente");
location.href="buscador.html";
}
};
}

/* ================= BUSCAR ================= */
function buscarLocal(){
mostrarLoader("🔍 Buscando negocios...");

let texto = document.getElementById("inputBusqueda").value.toLowerCase();

let resultados = locales.filter(l =>
l.nombre.toLowerCase().includes(texto)
&& l.aprobado
);

setTimeout(()=>{
mostrarResultados(resultados);
ocultarLoader();
}, 500);
}

/* ================= ABIERTO ================= */
function estaAbierto(horario){
if(!horario) return false;

let partes = horario.split("-");
if(partes.length !== 2) return false;

let ahora = new Date();
let horaActual = ahora.getHours();

let inicio = parseInt(partes[0]);
let fin = parseInt(partes[1]);

return horaActual >= inicio && horaActual < fin;
}

/* ================= FILTRO ================= */
function verCategoria(cat){

mostrarLoader("🍽 Filtrando negocios...");

let filtrados = locales.filter(l => {

if(!l.aprobado) return false;
if(!l.horario) return false;

let partes = l.horario.split("-");
if(partes.length !== 2) return false;

let inicio = parseInt(partes[0]);
let fin = parseInt(partes[1]);

if(cat === "mañana") return inicio < 12;
if(cat === "tarde") return inicio < 18 && fin > 12;
if(cat === "noche") return fin >= 18;
if(cat === "todos") return true;

return false;

});

setTimeout(()=>{
mostrarResultados(filtrados);
ocultarLoader();
}, 400);

}

/* ================= RESULTADOS ================= */
function mostrarResultados(lista){

let cont = document.getElementById("resultados-busqueda");
if(!cont) return;

cont.innerHTML="";

lista = lista.filter(l => l.aprobado);

if(lista.length === 0){
cont.innerHTML = "<p>No se encontraron negocios</p>";
return;
}

lista.forEach(l=>{

let link = "https://www.google.com/maps?q=" + encodeURIComponent(l.ubicacion || "");

cont.innerHTML += `
<div onclick='verDetalle(${JSON.stringify(l)})'>
<img src="${l.img || ''}" class="card-img">
<div class="card-body">
<h3>${l.nombre}</h3>

<p style="font-weight:bold; color:${estaAbierto(l.horario) ? 'green' : 'red'}">
${estaAbierto(l.horario) ? '🟢 Abierto ahora' : '🔴 Cerrado'}
</p>

<p>${l.desc || ''}</p>

<div class="card-btns">
<a href="${link}" target="_blank" class="btn-ubi">📍</a>
<a href="tel:${l.telefono}" class="btn-call">📞</a>
</div>
</div>
</div>
`;
});
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
<p>${l.desc || ''}</p>

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

/* ================= EDITAR (🔥 NUEVO) ================= */
function editar(index){

localEditando = locales[index];

document.getElementById("modalEdit").style.display = "flex";

document.getElementById("editNombre").value = localEditando.nombre;
document.getElementById("editDesc").value = localEditando.desc;
document.getElementById("editTelefono").value = localEditando.telefono;
document.getElementById("editUbicacion").value = localEditando.ubicacion;
document.getElementById("editHorario").value = localEditando.horario;
}

async function guardarEdicion(){

if(!localEditando) return;

mostrarLoader("💾 Guardando cambios...");

let actualizado = {
nombre: document.getElementById("editNombre").value,
desc: document.getElementById("editDesc").value,
telefono: document.getElementById("editTelefono").value,
ubicacion: document.getElementById("editUbicacion").value,
horario: document.getElementById("editHorario").value
};

await db.collection("locales").doc(localEditando.id).update(actualizado);

ocultarLoader();
cerrarModal();
location.reload();
}

function cerrarModal(){
document.getElementById("modalEdit").style.display = "none";
}

/* ================= ACCIONES ================= */
async function aprobar(id){
mostrarLoader("✔ Aprobando negocio...");
await db.collection("locales").doc(id).update({ aprobado: true });
location.reload();
}

async function eliminar(id){
mostrarLoader("🗑 Eliminando negocio...");
await db.collection("locales").doc(id).delete();
location.reload();
}

/* ================= LOAD ================= */
window.onload = async ()=>{

await cargarLocalesFirebase();

if(document.getElementById("resultados-busqueda")){
mostrarResultados(locales);
}

if(document.getElementById("admin-lista")){
mostrarAdmin();
}

};
