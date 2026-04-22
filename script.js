let locales = JSON.parse(localStorage.getItem('locales')) || [];

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

/* ================= REGISTRO ================= */
if(document.getElementById("formRegistro")){
document.getElementById("formRegistro").onsubmit = function(e){
e.preventDefault();

let file = regImagen.files[0];
let reader = new FileReader();

reader.onload = function(){

let nuevo = {
nombre: regNegocio.value,
desc: regVenta.value,
cat: regTiempo.value,
img: reader.result || "",
telefono: regTelefono.value,
ubicacion: lat && lng ? lat + "," + lng : regUbicacion.value,
horario: regHorario.value,
aprobado: false
};

locales.push(nuevo);
localStorage.setItem("locales", JSON.stringify(locales));

alert("⏳ Enviado para aprobación");
location.href="buscador.html";
};

if(file){
reader.readAsDataURL(file);
}else{
reader.onload();
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

/* ================= RESULTADOS ================= */
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

/* ================= ADMIN ================= */
function mostrarAdmin(){

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
<button class="btn-aprobar" onclick="aprobar(${i})">Aprobar</button>
<button onclick="editar(${i})">✏️ Editar</button>
<button class="btn-eliminar" onclick="eliminar(${i})">Eliminar</button>
</div>
</div>
</div>
`;
});
}

if(document.getElementById("admin-lista")){
mostrarAdmin();
}

/* ================= FUNCIONES ADMIN ================= */
function aprobar(i){
locales[i].aprobado = true;
localStorage.setItem("locales", JSON.stringify(locales));
location.reload();
}

function eliminar(i){
locales.splice(i,1);
localStorage.setItem("locales", JSON.stringify(locales));
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

reader.onload = function(){

locales[editIndex] = {
...l,
nombre: editNombre.value,
desc: editDesc.value,
telefono: editTelefono.value,
ubicacion: editUbicacion.value,
horario: editHorario.value,
img: file ? reader.result : l.img
};

localStorage.setItem("locales", JSON.stringify(locales));
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

/* ================= REGISTRO PUBLICO ================= */
function verificarAcceso(){
location.href="registro.html";
}
