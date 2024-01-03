from abc import ABC
from typing import TypeAlias, TypedDict, NotRequired

from dataclasses import dataclass

class Props(TypedDict):
    walkable: bool
    speed_modifier: NotRequired[float]

@dataclass
class Tile:
    id: int
    name: str
    color: tuple[int, int, int] # color for testing
    props: Props

test_sprite = ('test', 0x0)

prop_walkable: Props = {
    'walkable': True,
    'speed_modifier': 1
}

prop_notwalkable: Props = {
    'walkable': False,
}

# load tiles from config, some needed manually ig
t_water  = Tile(0, 'Water', (17, 173, 193), prop_notwalkable)
t_sand   = Tile(1, 'Sand', (247, 182, 158), prop_walkable)
t_grass  = Tile(2, 'Grass', (91, 179, 97), prop_walkable)
t_forest = Tile(3, 'Forest', (30, 136, 117), prop_walkable)
t_rock   = Tile(4, 'Rock', (96, 108, 129), prop_walkable)
t_snow   = Tile(5, 'Snow', (255, 255, 255), prop_walkable)


_tiles = [
    t_water,
    t_sand,
    t_grass,
    t_forest,
    t_rock,
    t_snow
]

ALL_TILES = {tile.id : tile for tile in _tiles}
TILE_SIZE = 16

if __name__ == "__main__":
    print(ALL_TILES)
