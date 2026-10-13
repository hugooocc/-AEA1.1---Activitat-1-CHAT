const path = require("node:path");
const http = require("node:http");
const express = require("express");
const { Server } = require("socket.io");

const PORT = 3000;
const MAX_NOMBRE = 20;
const MAX_TEXTO = 500;

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// Sirve los archivos del frontend (index.html, client.js, style.css)
app.use(express.static(path.join(__dirname, "public")));

// Comprueba los datos que envía el cliente.
// Devuelve un texto con el motivo del error, o null si todo es correcto.
function validarMensaje(datos) {
    if (typeof datos !== "object" || datos === null) {
        return "Los datos deben ser un objeto";
    }
    if (typeof datos.nombre !== "string" || typeof datos.texto !== "string") {
        return "El nombre y el texto deben ser cadenas de texto";
    }

    const nombre = datos.nombre.trim();
    const texto = datos.texto.trim();

    if (nombre === "" || texto === "") {
        return "El nombre y el texto no pueden estar vacíos";
    }
    if (nombre.length > MAX_NOMBRE) {
        return `El nombre no puede superar ${MAX_NOMBRE} caracteres`;
    }
    if (texto.length > MAX_TEXTO) {
        return `El mensaje no puede superar ${MAX_TEXTO} caracteres`;
    }
    return null;
}

// Se ejecuta cada vez que un navegador abre una conexión con Socket.IO
io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // ② Llega un mensaje de ESTE cliente
    socket.on("chat:send", (datos) => {
        const error = validarMensaje(datos);
        if (error) {
            console.warn(`Mensaje rechazado de ${socket.id}: ${error}`);
            socket.emit("chat:error", error); // solo a quien lo ha enviado
            return;
        }

        // ③ Datos válidos: los reenviamos a TODOS los clientes, incluido el emisor
        io.emit("chat:message", {
            nombre: datos.nombre.trim(),
            texto: datos.texto.trim(),
            hora: new Date().toISOString(), // la hora la genera el servidor
        });
    });

    socket.on("disconnect", (reason) => {
        console.log("Cliente desconectado:", socket.id, "-", reason);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
