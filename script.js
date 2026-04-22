// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyABJrHksJy0IxPdm2AQyqZswCX6px5oUzs",
  authDomain: "comidas-huetamo-50bf2.firebaseapp.com",
  projectId: "comidas-huetamo-50bf2",
  storageBucket: "comidas-huetamo-50bf2.firebasestorage.app",
  messagingSenderId: "313677526895",
  appId: "1:313677526895:web:0b9557c19cb4c219679a9a"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let locales = [];


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

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker;

map.on('click', function(e){
lat = e.latlng.lat;
lng = e.latlng.lng;

if(marker){
map.removeLayer(marker);
}

marker = L.marker([lat, lng]).addTo(map);

document.getElementById("coords").innerText =
"Ubicación: " + lat.toFixed(5) + ", " + lng.toFixed(5);
});
}


/* ================= FIREBASE LOAD ================= */
async function cargarLocalesFirebase(){
let snapshot = await db.collection("locales").get();

locales = snapshot.docs.map(doc => {
return { id: doc.id, ...doc.data() };
});
}


/* ================= REGISTRO ================= */
if(document.getElementById("formRegistro")){

document.getElementById("formRegistro").onsubmit = async function(e){
e.preventDefault();

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

try{
await db.collection("locales").add(nuevo);

alert("✅ Guardado correctamente");
location.href="buscador.html";

}catch(error){
console.error(error);
alert("❌ Error al guardar");
}

};
}


/* ================= BUSCAR ================= */
function buscarLocal(){
let texto = document.getElementById("inputBusqueda").value.toLowerCase();

let resultados = locales.filter(l =>
l.nombre.toLowerCase().includes(texto) ||
(l.desc && l.desc.toLowerCase().includes(texto))
);

mostrarResultados(resultados);
}


/* ================= CATEGORIA ================= */
function verCategoria(cat){
let filtrados = locales.filter(l =>
(cat === "todos" || l.cat === cat)
);

mostrarResultados(filtrados);
}


/* ================= RESULTADOS GENERALES ================= */
function mostrarResultados(lista){

let viejo = document.getElementById("resultados-busqueda");
if(viejo) viejo.remove();

let cont = document.createElement("div");
cont.id = "resultados-busqueda";

lista
.filter(l => l.aprobado)
.forEach(l=>{

let linkMapa = l.ubicacion && l.ubicacion.startsWith("http")
? l.ubicacion
: "https://www.google.com/maps?q=" + encodeURIComponent(l.ubicacion || "");

cont.innerHTML += `
<div>
<img src="${l.img || 'img/default.jpg'}" class="card-img">
<div class="card-body">
<h3>${l.nombre}</h3>
<p>${l.desc}</p>

<div class="card-btns">
<a href="${linkMapa}" target="_blank" class="btn-ubi">📍 Ubicación</a>
<a href="tel:${l.telefono || ''}" class="btn-call">📞 Llamar</a>
</div>

<p class="horario">⏰ ${l.horario || "No disponible"}</p>
</div>
</div>
`;
});

document.body.appendChild(cont);
}


/* ================= RESULTADOS PAGE ================= */
async function cargarResultadosPagina(){

let cont = document.getElementById("contenedor-cards");
if(!cont) return;

cont.innerHTML = "";

locales
.filter(l => l.aprobado)
.forEach(l=>{

let linkMapa = "https://www.google.com/maps?q=" + encodeURIComponent(l.ubicacion || "");

cont.innerHTML += `
<div>
<img src="${l.img || 'img/default.jpg'}" class="card-img">
<div class="card-body">
<h3>${l.nombre}</h3>
<p>${l.desc}</p>

<div class="card-btns">
<a href="${linkMapa}" target="_blank" class="btn-ubi">📍 Ubicación</a>
<a href="tel:${l.telefono || ''}" class="btn-call">📞 Llamar</a>
</div>

<p class="horario">⏰ ${l.horario || "No disponible"}</p>
</div>
</div>
`;
});
}


/* ================= ADMIN ================= */
async function mostrarAdmin(){

let cont = document.getElementById("admin-lista");
if(!cont) return;

cont.innerHTML = "";

locales.forEach((l,i)=>{

cont.innerHTML += `
<div class="admin-card">
<img src="${l.img || 'img/default.jpg'}" class="admin-img">

<div class="admin-body">
<h3>${l.nombre}</h3>
<p>${l.desc}</p>

<p class="estado ${l.aprobado ? 'aprobado' : 'pendiente'}">
${l.aprobado ? "✔ Aprobado" : "⏳ Pendiente"}
</p>

<div class="admin-btns">
<button class="btn-aprobar" onclick="aprobar('${l.id}')">Aprobar</button>
<button onclick="editar(${i})">✏️ Editar</button>
<button class="btn-eliminar" onclick="eliminar('${l.id}')">Eliminar</button>
</div>
</div>
</div>
`;
});
}


/* ================= ADMIN ACCIONES ================= */
async function aprobar(id){
await db.collection("locales").doc(id).update({ aprobado: true });
location.reload();
}

async function eliminar(id){
await db.collection("locales").doc(id).delete();
location.reload();
}


/* ================= EDITAR ================= */
let editIndex = null;

function editar(i){
editIndex = i;
let l = locales[i];

editNombre.value = l.nombre;
editDesc.value = l.desc;
editTelefono.value = l.telefono || "";
editUbicacion.value = l.ubicacion || "";
editHorario.value = l.horario || "";

document.getElementById("modalEdit").style.display = "flex";
}

function guardarEdicion(){

let l = locales[editIndex];

let file = editImagen.files[0];
let reader = new FileReader();

reader.onload = async function(){

let actualizado = {
...l,
nombre: editNombre.value,
desc: editDesc.value,
telefono: editTelefono.value,
ubicacion: editUbicacion.value,
horario: editHorario.value,
img: file ? reader.result : l.img
};

await db.collection("locales").doc(l.id).update(actualizado);

location.reload();
};

if(file){
reader.readAsDataURL(file);
}else{
reader.onload();
}
}

function cerrarModal(){
document.getElementById("modalEdit").style.display = "none";
}


/* ================= LOAD GENERAL ================= */
window.onload = async ()=>{

await cargarLocalesFirebase();

if(document.getElementById("resultados-busqueda")){
mostrarResultados(locales);
}

if(document.getElementById("admin-lista")){
mostrarAdmin();
}

if(document.getElementById("contenedor-cards")){
cargarResultadosPagina();
}

};
