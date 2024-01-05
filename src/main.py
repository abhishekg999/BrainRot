import flask
from worlds import world
from flask import Flask, request
from flask_socketio import SocketIO, emit

from auth import Auth
import network
import threading
import time

from worlds import world
from player import Archer

app = Flask(__name__)
socketio = SocketIO(app)

sessions: dict[str, tuple] = {}

@app.route('/')
def index():
    return flask.send_from_directory(
        '../frontend',
        'index.html'
    )

@app.route('/<path:name>')
def serve(name):
    """
    Host the frontend code. All files are located in the frontend directory in the root.
    Serve files from there, for developer server. Additionally.
    """
    return flask.send_from_directory(
        '../frontend',
        name
    )

def client_handler(room: str):
    """
    This function is run in a thread, and handles sending the client initialization data
    as well as an accurate state of the world.
    """
    player = Archer(world) # session should identify a config to load the player from db
    sessions[room] = (player)

    socketio.emit('PLAYER_WORLD_INIT', player.get_initialization_data(), to=room)

    while 1:
        # stop sending data if client no longer exists
        if room not in sessions:
            print("Client no longer connected, stop sending data.")
            player.destroy()
            return

        socketio.emit('WORLD_STATE', player.get_world_state(), to=room) 

        # also broadcast this players state to all other players
     
        
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
        ['nexus'],
        # also will send client data
    )

    thread = threading.Thread(None, client_handler, args=[session_token])
    sessions[session_token] = ()
    thread.daemon = True
    thread.start()

    print(f"New client {session_token} connected.")
    socketio.emit('HELLO_CLIENT', response)


@socketio.on('PLAYER_STATE')
def M_PLAYER_STATE(data: dict):
    x = data['x']
    y = data['y']
    velocity = data['velocity']
    is_shooting = data['is_shooting']
    looking = data['looking']
    inventory = data['inventory']
    shots = data['shots']

    x = int(x)
    y = int(y)

    session_token = request.sid
    player: Archer = sessions[session_token]
    player.update_pos(x, y)

    player.velocity = velocity
    player.is_shooting = is_shooting
    player.looking = looking 
    player.inventory = inventory
    player.shots = shots

    emit('PLAYER_STATE', {
        'id': request.sid,
        'x': player.x,
        'y': player.y,
        'looking': player.looking,
        'is_shooting': player.is_shooting
    }, broadcast=True, include_self=False)


if __name__ == "__main__":
    socketio.run(app)
