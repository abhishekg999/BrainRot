from abc import ABC, abstractmethod
from typing import TypeAlias
from player import Player
from enemy import Enemy
from pprint import pprint

from events import event

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

def points_in_circle(arr, x, y, radius):
    result = []
    rows, cols = len(arr), len(arr[0])

    # Define the bounding box for the circle
    min_row = max(0, int(x - radius))
    max_row = min(rows, int(x + radius) + 1)
    min_col = max(0, int(y - radius))
    max_col = min(cols, int(y + radius) + 1)

    # Check each point in the bounding box
    for row in range(min_row, max_row):
        for col in range(min_col, max_col):
            # Check if the point is within the circle
            if (row - x)**2 + (col - y)**2 <= radius**2:
                result.append(arr[row][col])

    return result

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
        rows, cols = len(self.world), len(self.world[0])

        # Define the bounding box for the circle in tile coordinates
        min_row = max(0, tile_y - radius)
        max_row = min(rows, tile_y + radius + 1)
        min_col = max(0, tile_x - radius)
        max_col = min(cols, tile_x + radius + 1)

        # Check each tile in the bounding box
        for y in range(int(min_row), int(max_row)):
            for x in range(int(min_col), int(max_col)):
                # Check if the tile is within the circle in pixel coordinates
                if (_x - x * TILE_SIZE)**2 + (_y - y * TILE_SIZE)**2 <= radius**2 * TILE_SIZE**2:
                    # Serialize in the same format as a JavaScript object
                    tiles[f"{y},{x}"] = self.world[y][x]

        return tiles

    def get_tiles_to_load(self, player: Player):
        loading_radius = 10
        return self._get_tiles_in_radius_around_position(player.x, player.y, loading_radius)
    
    def get_enemy_data(self):
        data = {}
        for enemy_id in self.enemies:
            enemy = self.enemies[enemy_id]
            data[enemy_id] = {
                'x': enemy.x,
                'y': enemy.y,
                'alive': enemy.alive,
                'max_health': enemy.max_health,
                'health': enemy.health,
                'defense': enemy.defense                
            }
        return data
    
    def update(self):
        ids_to_remove = []
        for enemy_id in self.enemies:
            if not self.enemies[enemy_id].alive:
                ids_to_remove.append(enemy_id)
        
        for id in ids_to_remove:
            del self.enemies[id]
            event("ENEMY_DIED", {'id': id})
        

    def add_player(self, player: Player):
        self.players[player.id] = player

    def remove_player(self, player: Player):
        del self.players[player.id]
    
    def add_enemy(self, enemy: Enemy):
        self.enemies[enemy.id] = enemy

    def remove_enemy(self, enemy: Player):
        del self.enemies[enemy.id]

