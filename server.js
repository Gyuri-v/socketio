import http from 'http';
import { Server } from "socket.io";
import express from "express";


import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.resolve();

const app = express();
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

app.use("/", (req, res) => {
  res.sendFile(__dirname + '/index.html')
});
app.get("/", (req, res) => {
  res.send('fdfsdf')
});


/*  */
wsServer.on('connection', (socket) => {
  console.log("Client connected");
  
  socket.on("input_message", (msg) => {
    console.log("Received message from client:", msg);
    wsServer.emit('display_message', msg);
  });

  socket.on('message', (msg) => {
    console.log('유저 : ' + msg);
  })
})

const handleListen = () => console.log(`Listening on http://localhost:3001`);
httpServer.listen(3001, handleListen);

