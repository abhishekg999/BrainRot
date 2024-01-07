import flask
from flask import Flask, request
from flask_socketio import SocketIO, emit

from auth import Auth
import network
import threading
import time
from enemy import Leuc, EnemyData

from worlds import World
from player import Archer, PlayerData
from events import EventSink, event

app = Flask(__name__)
socketio = SocketIO(app)

sessions: dict[str, tuple] = {}


@app.route("/")
def index():
    return flask.send_from_directory("../frontend", "index.html")


@app.route("/<path:name>")
def serve(name):
    """
    Host the frontend code. All files are located in the frontend directory in the root.
    Serve files from there, for developer server. Additionally.
    """
    return flask.send_from_directory("../frontend", name)


class ClientHandler(EventSink):
    """
    Ok so the idea is that this class will guarenteed have the emit context.
    Then we can setup events to communicate data, and that should be pog.
    """
    def __init__(self, room):
        super().__init__()
        self.room = room

        def event_enemy_died(data):
            id = data['id']
            emit("ENEMY_DIED", id)

        self.on("ENEMY_DIED", event_enemy_died)

    def handle(self):
        self.player = Archer(
            world, PlayerData()
        )  # session should identify a config to load the player from db
        sessions[self.room] = self.player
        socketio.emit(
            "PLAYER_WORLD_INIT", self.player.get_initialization_data(), to=self.room
        )
        while 1:
            # stop sending data if client no longer exists
            if self.room not in sessions:
                print("Client no longer connected, stop sending data.")
                self.player.destroy()
                emit(
                    "PLAYER_LEAVE",
                    {"id": self.room},
                    broadcast=True,
                    include_self=False,
                )
                return

            socketio.emit("WORLD_STATE", self.player.get_world_state(), to=self.room)
            
            # BUG: Enemy dying needs to be its own event that is emitted, so everyone can see when it happens.
            # TODO: Let client handler listen for it?
            self.player.world.update()
            # also broadcast this players state to all other players
            time.sleep(1 / 30)


@socketio.on("disconnect")
def disconnect():
    if request.sid in sessions:
        del sessions[request.sid]
        print(f"Session {request.sid} removed.")


@socketio.on("HELLO_SERVER")
def M_HELLO_SERVER(data: dict):
    identifier = data.get("identity")

    # session_token = Auth.verify(identifier)
    # for now...
    session_token = request.sid

    success = session_token is not None
    error = None if success else "Unable to identify user with provided credentials."

    response = network.R_HELLO_CLIENT(
        success,
        error,
        session_token,
        ["nexus"],
        # also will send client data
    )

    time.sleep(5)

    print(f"New client {session_token} connected.")
    socketio.emit("HELLO_CLIENT", response)

    # run handler in this same socket context
    ClientHandler(session_token).handle()


@socketio.on("PLAYER_STATE")
def M_PLAYER_STATE(data: dict):
    x = data["x"]
    y = data["y"]
    velocity = data["velocity"]
    is_shooting = data["is_shooting"]
    looking = data["looking"]
    inventory = data["inventory"]
    damage_dealt = data["damage_dealt"]

    x = int(x)
    y = int(y)

    session_token = request.sid
    player: Archer = sessions[session_token]

    old_x = player.x
    old_y = player.y
    old_is_shooting = player.is_shooting
    old_looking = player.looking

    player.update_pos(x, y)
    player.velocity = velocity
    player.is_shooting = is_shooting
    player.looking = looking
    player.inventory = inventory

    # deal damage to enemy
    for enemy_id in damage_dealt:
        if enemy_id in player.world.enemies:
            player.world.enemies[enemy_id].damage(damage_dealt[enemy_id])

    if (
        old_x != player.x
        or old_y != player.y
        or old_looking != player.looking
        or old_is_shooting != player.is_shooting
    ):
        emit(
            "PLAYER_STATE",
            {
                "id": request.sid,
                "x": player.x,
                "y": player.y,
                "looking": player.looking,
                "is_shooting": player.is_shooting,
            },
            broadcast=True,
            include_self=False,
        )


from events import event
from random import random
def game_loop(world):
    while 1:
        if random() < 0.5:
            event("MOVE_SOMEWHERE", {})
        time.sleep(0.05)

if __name__ == "__main__":
    world = World()
    enemy = Leuc(world, EnemyData(200, 200, 10000))

    socketio.start_background_task(game_loop, [world])
    socketio.run(app)
