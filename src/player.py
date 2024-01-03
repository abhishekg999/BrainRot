from abc import ABC, abstractmethod
from typing import TypeAlias, override
import random

from utils import IncrementingUniqueID

PLAYER_WIDTH = 32
PLAYER_HEIGHT = 64

WEAPON_INDEX = 0
ABILITY_INDEX = 1
ARMOR_INDEX = 2
RING_INDEX = 3

BASE_INVENTORY_SIZE = 8

class Player(ABC):
    """
    Static Class properties:

    max_health
    max_attack
    max_dexterity
    max_speed
    max_defense
    """
    def __init__(self, world):
        self.id = IncrementingUniqueID.generate()
        self.world = world

        self.width = PLAYER_WIDTH
        self.height = PLAYER_HEIGHT

        # class specific method for custom initialization
        self.initialize_class()
        
        self.x = 0
        self.y = 0

        self.health     = 100
        self.attack     = 10
        self.dexterity  = 10
        self.speed      = 10
        self.defense    = 0

        self.level      = 1

        self.is_shooting = False
        self.inventory_size = 8

        """
        Inventory
        [0-3] WEAPON | ABILITY | ARMOR | RING 
        [4-7] 
        [8-11]
        """
        self._inventory = [None for _ in range(4 + self.inventory_size)]
        
    
    @abstractmethod
    def initialize_class(self) -> None: ...
    
class Archer(Player):
    def __init__(self, world):
        super().__init__(world)

    def initialize_class(self) -> None:
        self.max_health     = 700
        self.max_attack     = 60
        self.max_dexterity  = 60
        self.max_speed      = 60
        self.max_defense    = 25

        self.max_level      = 20
        


    
