import { io } from 'socket.io-client';

export const socket = io();

socket.emit("HELLO_SERVER", {
    identity: socket.id,
});

socket.on('HELLO_CLIENT', (d) => {
    console.log(`SERVER SAYS: ${JSON.stringify(d)}`)
})