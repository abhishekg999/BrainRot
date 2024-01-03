import flask
from worlds import world
from flask import Flask
from flask_socketio import SocketIO

from auth import Auth
import network
import threading
import time

app = Flask(__name__)
socketio = SocketIO(app)

sessions = {}

@app.route('/<path:name>')
def index(name):
    print(1)
    return flask.send_from_directory(
        '../frontend',
        name
    )


def client_handler(session_token):
    while 1:
        socketio.emit('meow', 'meow')
        time.sleep(1)


@socketio.on('HELLO_SERVER')
def M_HELLO_SERVER(data: dict):
    identifier = data.get('identity')
    session_token = Auth.verify(identifier)

    success = session_token is not None
    error = None if success else "Unable to identify user with provided credentials."
    
    response = network.R_HELLO_CLIENT(
        success,
        error,
        session_token,
        ['nexus']
    )

    thread = threading.Thread(None, client_handler, args=[session_token])
    sessions[session_token] = thread
    thread.daemon = True
    thread.start()


    socketio.emit('HELLO_CLIENT', response)



if __name__ == "__main__":
    socketio.run(app)