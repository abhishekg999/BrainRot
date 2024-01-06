import { io } from 'socket.io-client';

export const socket = io();

socket.on('HELLO_CLIENT', (d) => {
    console.log(`SERVER SAYS: ${JSON.stringify(d)}`)
    // Then allow client to select world, etc
})


/**
 * Call this from the WorldScene once its setup and ready to handle
 * websocket communication.
 */
export const readyForSocket = () => {
    // Login information to be validated
    socket.emit("HELLO_SERVER", {
        identity: true
    });
}



