from abc import ABC, abstractmethod
from typing import TypeAlias
from player import Player
from pprint import pprint
import json

import random

from tiles import TILE_SIZE, SimpleTiles

WORLD_WIDTH = 128
WORLD_HEIGHT = 128

class ABCWorld(ABC):
    @abstractmethod
    def add_player(self, player: Player): ...

class World(ABCWorld):
    tile_width: int
    tile_height: int
    width: int
    height: int
    world: list[list[int]]
    players: dict[int, Player]

    def __init__(self):
        self.tile_width = WORLD_WIDTH
        self.tile_height = WORLD_HEIGHT

        self.width = TILE_SIZE * WORLD_WIDTH
        self.height = TILE_SIZE * WORLD_HEIGHT

        self.world = [[random.choice(SimpleTiles)['type'] for _ in range(WORLD_WIDTH)] for _ in range(WORLD_HEIGHT)]
        self.players = {}
        self.objects = {}

    
    def _get_tiles_in_radius_around_position(self, _x, _y, radius):
        tile_x = _x // TILE_SIZE
        tile_y = _y // TILE_SIZE

        tiles = {}
        for y in range(max(0, tile_y - radius), min(self.tile_height, tile_y + radius)):
            for x in range(max(0, tile_x - radius), min(self.tile_width, tile_x + radius)):
                # serialized in same format as js object
                tiles[f"{y},{x}"] = self.world[y][x]
    
                
        return tiles            

    def add_player(self, player: Player):
        self.players[player.id] = player
        # then maybe configure some observers idk yet

    def remove_player(self, player: Player):
        del self.players[player.id]

world = World()


