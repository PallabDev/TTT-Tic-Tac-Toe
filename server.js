const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const port = parseInt(process.env.PORT || "3001", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();


app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        transports: ["websocket", "polling"],
    });

    // Attach socket.io server to the global object so Next.js API routes can access it
    global.io = io;

    io.on("connection", (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        socket.on("join-room", (roomId) => {
            socket.join(`room-${roomId}`);
            console.log(`[Socket] Client ${socket.id} joined room-${roomId}`);
        });

        socket.on("leave-room", (roomId) => {
            socket.leave(`room-${roomId}`);
            console.log(`[Socket] Client ${socket.id} left room-${roomId}`);
        });

        socket.on("disconnect", () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(
            `> Server listening at http://localhost:${port} as ${dev ? "development" : "production"
            }`
        );
    });
});
