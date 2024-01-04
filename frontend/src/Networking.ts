import { io } from 'socket.io-client';

export const socket = io();

// Login information to be validated
socket.emit("HELLO_SERVER", {
    identity: true
});

socket.on('HELLO_CLIENT', (d) => {
    console.log(`SERVER SAYS: ${JSON.stringify(d)}`)
    // Then allow client to select world, etc
})

