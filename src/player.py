from abc import ABC, abstractmethod
from typing import TypeAlias, override
import random
from dataclasses import dataclass, field, asdict
from utils import IncrementingUniqueID

PLAYER_WIDTH = 32
PLAYER_HEIGHT = 64

WEAPON_INDEX = 0
ABILITY_INDEX = 1
ARMOR_INDEX = 2
RING_INDEX = 3

BASE_INVENTORY_SIZE = 8


@dataclass
class PlayerData:
    x: int = 0
    y: int = 0

    player_class: str = "Archer" # for now
    level: int = 1

    health: int = 100
    attack: int = 10
    dexterity: int = 10
    speed: int = 10
    defense: int = 10

    looking: int = 0
    is_shooting: bool = False
    inventory_size: int = BASE_INVENTORY_SIZE
    inventory: list[int] = field(default_factory=list)

   

class Player(ABC):
    """
    Static Class properties:

    max_health
    max_attack
    max_dexterity
    max_speed
    max_defense
    """
    def __init__(self, world, data):
        self.id = IncrementingUniqueID.generate()
        self.world = world
        self.world.add_player(self)

        self.width = PLAYER_WIDTH
        self.height = PLAYER_HEIGHT

        self.config = data

        self.x = self.config.x
        self.y = self.config.y
        self.looking = self.config.looking
        self.is_shooting = self.config.is_shooting

        # class specific method for custom initialization
        self.initialize_class(data)
        
        """
        Inventory
        [0-3] WEAPON | ABILITY | ARMOR | RING 
        [4-7] 
        [8-11]
        """
        # self._inventory = [None for _ in range(4 + self.inventory_size)]
        
    
    @abstractmethod
    def initialize_class(self, config) -> None: ...

    def get_initialization_data(self) -> dict:
        tile_data = self.world.get_tiles_to_load(self)

        data = {
            'x': self.x,
            'y': self.y,
            'tile_width': self.world.tile_width,
            'tile_height': self.world.tile_height,
            'map': tile_data,
        }
        return data
    
    def get_world_state(self) -> dict:
        tile_data = self.world.get_tiles_to_load(self)

        data = {
            'map': tile_data,
        }
        return data
    
    def update_pos(self, x: int, y: int):
        self.x = x
        self.y = y
    

    def destroy(self):
        self.world.remove_player(self)


class Archer(Player):
    def __init__(self, world, data):
        super().__init__(world, data)

    def initialize_class(self, data) -> None:
        self.max_health     = 700
        self.max_attack     = 60
        self.max_dexterity  = 60
        self.max_speed      = 60
        self.max_defense    = 25

        self.max_level      = 20
        


    
if __name__ == "__main__":
    print(asdict(PlayerData(1, 1)))