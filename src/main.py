import flask
from worlds import world
from flask import Flask, request
from flask_socketio import SocketIO

from auth import Auth
import network
import threading
import time

app = Flask(__name__)
socketio = SocketIO(app)

sessions: dict[str, threading.Thread] = {}
 
@app.route('/<path:name>')
def index(name):
    """
    Host the frontend code. All files are located in the frontend directory in the root.
    Serve files from there, for developer server. Additionally.
    """
    print(1)
    return flask.send_from_directory(
        '../frontend',
        name
    )

def client_handler(room: str):
    while 1:
        # stop sending data if client no longer exists
        if room not in sessions:
            print("Client no longer connected, stop sending data.")
            return

        socketio.emit('meow', 'meow', to=room)
        time.sleep(0.01)


@socketio.on('disconnect')
def disconnect():
    if request.sid in sessions:
        del sessions[request.sid]
        print(f"Session {request.sid} removed.")        

@socketio.on('HELLO_SERVER')
def M_HELLO_SERVER(data: dict):
    identifier = data.get('identity')

    # session_token = Auth.verify(identifier)
    # for now...
    session_token = request.sid
    
    success = session_token is not None
    error = None if success else "Unable to identify user with provided credentials."
    
    response = network.R_HELLO_CLIENT(
        success,
        error,
        session_token,
        ['nexus']
        # also will send client data
    )

    thread = threading.Thread(None, client_handler, args=[session_token])
    sessions[session_token] = thread
    thread.daemon = True
    thread.start()

    print(f"New client {session_token} connected.")

    socketio.emit('HELLO_CLIENT', response)


if __name__ == "__main__":
    socketio.run(app)