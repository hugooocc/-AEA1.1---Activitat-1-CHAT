// Abre la conexión con el servidor desde el que se ha cargado la página
const socket = io();

const MAX_NOMBRE = 20;

// Elementos de la pantalla de entrada
const pantallaEntrada = document.getElementById("pantalla-entrada");
const formNombre = document.getElementById("form-nombre");
const inputNombre = document.getElementById("input-nombre");
const errorNombre = document.getElementById("error-nombre");

// Elementos de la pantalla del chat
const pantallaChat = document.getElementById("pantalla-chat");
const nombreUsuario = document.getElementById("nombre-usuario");
const formMensaje = document.getElementById("form-mensaje");
const inputMensaje = document.getElementById("input-mensaje");
const listaMensajes = document.getElementById("mensajes");
const errorMensaje = document.getElementById("error-mensaje");

// Nombre con el que participa esta pestaña. null = todavía no ha entrado
let nombre = null;

socket.on("connect", () => {
    console.log("Conectado al servidor con id:", socket.id);
});

// Entrada al chat: validamos el nombre y cambiamos de pantalla
formNombre.addEventListener("submit", (event) => {
    event.preventDefault();

    const valor = inputNombre.value.trim();

    if (valor === "") {
        errorNombre.textContent = "El nombre no puede estar vacío.";
        return;
    }
    if (valor.length > MAX_NOMBRE) {
        errorNombre.textContent = `El nombre no puede tener más de ${MAX_NOMBRE} caracteres.`;
        return;
    }

    nombre = valor;
    nombreUsuario.textContent = nombre;

    pantallaEntrada.hidden = true;
    pantallaChat.hidden = false;
    inputMensaje.focus();
});

// ① Al enviar el formulario (botón o Enter), mandamos nombre y texto al servidor
formMensaje.addEventListener("submit", (event) => {
    event.preventDefault(); // evita que el formulario recargue la página

    if (nombre === null) return; // sin nombre no se puede enviar

    const texto = inputMensaje.value.trim();
    if (texto === "") return;

    socket.emit("chat:send", { nombre, texto });

    errorMensaje.textContent = "";
    inputMensaje.value = "";
    inputMensaje.focus();
});

// Convierte la fecha ISO que envía el servidor en "HH:MM" con la hora local
function formatearHora(iso) {
    return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

// ④ Cuando el servidor reenvía un mensaje, lo pintamos en la lista
socket.on("chat:message", (mensaje) => {
    const li = document.createElement("li");
    li.className = "mensaje";

    const autor = document.createElement("strong");
    autor.className = "autor";
    autor.textContent = mensaje.nombre;

    const hora = document.createElement("time");
    hora.className = "hora";
    hora.dateTime = mensaje.hora;
    hora.textContent = formatearHora(mensaje.hora);

    const texto = document.createElement("p");
    texto.className = "texto";
    texto.textContent = mensaje.texto; // textContent: nunca se interpreta como HTML

    li.append(autor, hora, texto);
    listaMensajes.appendChild(li);

    // Baja el scroll hasta el último mensaje
    listaMensajes.scrollTop = listaMensajes.scrollHeight;
});

// El servidor ha rechazado un mensaje nuestro
socket.on("chat:error", (error) => {
    errorMensaje.textContent = error;
});
