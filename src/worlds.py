from abc import ABC
from typing import TypeAlias
from player import Player

import random

from tiles import TILE_SIZE, ALL_TILES

WORLD_WIDTH = 128
WORLD_HEIGHT = 128

class World:
    tile_width: int
    tile_height: int
    width: int
    height: int
    world: list[list[int]]
    players: list[Player]

    def __init__(self):
        self.tile_width = WORLD_WIDTH
        self.tile_height = WORLD_HEIGHT

        self.width = TILE_SIZE * WORLD_WIDTH
        self.height = TILE_SIZE * WORLD_HEIGHT

        self.world = [[random.choice(list(ALL_TILES.keys())) for _ in range(WORLD_WIDTH)] for _ in range(WORLD_HEIGHT)]
        self.players = []
        self.objects = []
    
    def add_player(self, player: Player):
        self.players.append(player)
        # then maybe configure some observers idk yet

world = World()

