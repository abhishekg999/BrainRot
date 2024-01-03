from dataclasses import dataclass
from abc import ABC, abstractmethod
from functools import partial
import math
from random import random

from noise import noise
import numpy as np
import matplotlib.pyplot as plt

frequency = 0.005
threshold = 0.1

ocean_color = [17, 173, 193]
sand_color = [247, 182, 158]
grass_color = [91, 179, 97]
forest_color = [30, 136, 117]
rock_color = [96, 108, 129]
snow_color = [255, 255, 255]

def generate_height(x, y, width, height, frequency, threshold):
    h = noise(x * frequency, y * frequency)

    d = np.linalg.norm(np.array([x, y]) - np.array([width / 2, height / 2])) / (width / 2)
    d = 1 - d
    h *= d

    h = max(0, h - threshold)
    h /= (1 - threshold)

    return h

def generate_noise_texture(width, height, frequency, threshold):
    min_value, max_value = 1, 0
    noise_array = []

    for x in range(width):
        noise_array.append([])
        for y in range(height):
            height_value = generate_height(x, y, width, height, frequency, threshold)

            noise_array[x].append(height_value)

            if height_value < min_value:
                min_value = height_value
            elif height_value > max_value:
                max_value = height_value

    for x in range(width):
        for y in range(height):
            noise_array[x][y] = np.interp(noise_array[x][y], [min_value, max_value], [0, 1])

    return noise_array

def color_pixel(c, i):
    result = [c[0], c[1], c[2]]
    return result

def display_texture(width, height, noise_texture):
    texture = np.zeros((width, height, 3), dtype=np.uint8)

    for x in range(width):
        for y in range(height):
            height_value = noise_texture[x][y]

            if height_value < 0.1:
                texture[x][y] = color_pixel(ocean_color, 0)
            elif height_value < 0.2:
                texture[x][y] = color_pixel(sand_color, 0)
            elif height_value < 0.4:
                texture[x][y] = color_pixel(grass_color, 0)
            elif height_value < 0.7:
                texture[x][y] = color_pixel(forest_color, 0)
            elif height_value < 0.92:
                texture[x][y] = color_pixel(rock_color, 0)
            else:
                texture[x][y] = color_pixel(snow_color, 0)

    plt.imshow(texture)
    plt.show()




def coloured_square(color):
    """
    Returns a coloured square that you can print to a terminal.
    """
    red, green, blue = color
    return f"\033[48:2::{red}:{green}:{blue}m \033[49m"

def coloured_string(s, color):
    """
    Returns a coloured string that you can print to a terminal.
    """
    red, green, blue = color
    return f"\033[38:2::{red}:{green}:{blue}m{s}\033[39m"

@dataclass
class Tile:
    id: str
    name: str
    color: tuple[int, int, int]

    def __init__(self, id, name, color):
        self.id = id
        self.name = name
        self.color = color
        
        """
        damage
        on_step_on
        on_step_off
        """

    def __str__(self):
        return coloured_string(self.id, self.color)


water = Tile('W', 'Water', (17, 173, 193))
sand  = Tile('S', 'Sand', (247, 182, 158))
grass = Tile('G', 'Grass', (91, 179, 97))
forest = Tile('F', 'Forest', (30, 136, 117))
rock = Tile('R', 'Rock', (96, 108, 129))
snow = Tile('S', 'Snow', (255, 255, 255))

class TileGenerationRule(ABC):
    def __init__(self, world, tile):
        self.world = world
        self.tile = tile
    
    def _create_helpers(self, x, y):
        width, height = self.world.width, self.world.height
        center_x = width / 2
        center_y = height / 2

        CENTER_DISTANCE = math.dist((x, y), (center_x, center_y))
        STRAIGHT_BORDER_DISTANCE = min(x, y, width-x, width-y)

        return CENTER_DISTANCE, STRAIGHT_BORDER_DISTANCE
    
    def _get_world_neighbors(self, x, y):
        for dx in range(-1, 2):
            for dy in range(-1, 2):
                nx = x + dx
                ny = y + dy
                if not (nx % self.world.width == nx and (ny % self.world.height) == ny):
                    continue
                yield self.world.board[nx][ny]
    
    def get_world_neighbors(self, x, y):
        return [x for x in self._get_world_neighbors(x, y) if x != none]
        
    def get_probability(self, x, y): 
        return 1


class WaterGenerationRules(TileGenerationRule):
    def __init__(self, world, tile):
        super().__init__(world, tile)

    def get_probability(self, x, y):
        CENTER_DISTANCE, STRAIGHT_BORDER_DISTANCE = self._create_helpers(x, y)
        if STRAIGHT_BORDER_DISTANCE < 3:
            return 1
        
        x = self.get_world_neighbors(x, y)
        if x.count(water) > 3:
            return 0.7
        
        return 0.01

class GrassGenerationRules(TileGenerationRule):
    def __init__(self, world, tile):
        super().__init__(world, tile)

    def get_probability(self, x, y):
        return 0.2 + (random() / 2)
            
class SandGenerationRules(TileGenerationRule):
    def __init__(self, world, tile):
        super().__init__(world, tile)

    def get_probability(self, x, y):
        CENTER_DISTANCE, STRAIGHT_BORDER_DISTANCE = self._create_helpers(x, y)
        x = self.get_world_neighbors(x, y)
        if x.count(sand) > 0:
            return random() 
    
        if x.count(water) > 3:
            return 0.9
        
        return 0

        


def square_ring_iterator_iterator(size):
    def _ring_iterator(min_x, max_x, min_y, max_y):
        for i in range(min_x, max_x):
            yield (i, min_y)

        for i in range(min_x, max_x):
            yield (i, max_y - 1)

        for i in range(min_y, max_y):
            yield (min_x, i)

        for i in range(min_y, max_y):
            yield (max_x - 1, i)
    
    l, r = 0, size
    while l < r:
        yield partial(_ring_iterator, l, r, l, r)
        l += 1
        r -= 1


class WorldConfig:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        
        _tiles = [water, grass, sand]
        self.tiles = {t.id: t for t in _tiles}
        
        
class World:
    def __init__(self, config):
        self.width, self.height = config.width, config.height
        self.board = [[none for _ in range(self.width)] for _ in range(self.height)]
        noise_tex = generate_noise_texture(self.width, self.height, frequency, threshold)

        # display_texture(self.width, self.height, noise_tex)
        for x in range(self.width):
            for y in range(self.height):
                height_value = noise_tex[x][y]
                if height_value < 0.1:
                    self.board[x][y] = water
                elif height_value < 0.2:
                    self.board[x][y] = sand
                elif height_value < 0.4:
                    self.board[x][y] = grass
                elif height_value < 0.7:
                    self.board[x][y] = forest
                elif height_value < 0.92:
                    self.board[x][y] = rock
                else:
                    self.board[x][y] = snow

                    
        

    def __str__(self):
        return "\n".join("".join(str(x) for x in self.board[i]) for i in range(len(self.board)))
    
if __name__ == "__main__":
    w = World(WorldConfig(256, 256))
    print(w)
    # for _ in range(10):
    #     print(w)
    #     w._transform()