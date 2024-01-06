from abc import ABC, abstractmethod
from typing import TypeAlias
from player import Player
from enemy import Enemy
from pprint import pprint

import random
from tiles import TILE_SIZE, SimpleTiles

WORLD_WIDTH = 128
WORLD_HEIGHT = 128

class ABCWorld(ABC):
    @abstractmethod
    def add_player(self, player: Player): ...

    @abstractmethod
    def remove_player(self, player: Player): ...

    @abstractmethod
    def add_enemy(self, enemy: Enemy): ...

    @abstractmethod
    def remove_enemy(self, enemy: Player): ...

class World(ABCWorld):
    tile_width: int
    tile_height: int
    width: int
    height: int
    world: list[list[int]]
    players: dict[int, Player]
    enemies: dict[int, Enemy]

    def __init__(self):
        self.tile_width = WORLD_WIDTH
        self.tile_height = WORLD_HEIGHT

        self.width = TILE_SIZE * WORLD_WIDTH
        self.height = TILE_SIZE * WORLD_HEIGHT

        self.world = [[random.choice(SimpleTiles)['type'] for _ in range(WORLD_WIDTH)] for _ in range(WORLD_HEIGHT)]
        self.players = {}
        self.enemies = {}

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

    def get_tiles_to_load(self, player: Player):
        loading_radius = 20
        return self._get_tiles_in_radius_around_position(player.x, player.y, loading_radius)


    def add_player(self, player: Player):
        self.players[player.id] = player

    def remove_player(self, player: Player):
        del self.players[player.id]
    
    def add_enemy(self, enemy: Enemy):
        self.enemies[enemy.id] = enemy

    def remove_enemy(self, enemy: Player):
        del self.enemies[enemy.id]

world = World()


