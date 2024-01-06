from abc import ABC, abstractmethod
from typing import TypeAlias, override
from dataclasses import dataclass, field, asdict
from utils import IncrementingUniqueID

@dataclass
class EnemyData:
    x: int = 0
    y: int = 0

    health: int = 100
    defense: int = 10

    velocity: tuple[int, int] = (0, 0)
   

class Enemy(ABC):
    def __init__(self, world, data: EnemyData):
        self.id = IncrementingUniqueID.generate()
        self.world = world
        self.world.add_player(self)

        self.config = data

        self.x = self.config.x
        self.y = self.config.y

        self.health = self.config.health
        self.defense = self.config.defense

        self.velocity = self.config.velocity

        self.initialize_enemy()
        
    
    @abstractmethod
    def initialize_enemy(self, config) -> None: ...

    def died(self):
        self.world.remove_enemy(self)

    def damage(self, dmg: int):
        self.health -= dmg
        if self.health <= 0:
            self.died()

    def update_pos(self, x: int, y: int):
        self.x = x
        self.y = y

    def destroy(self):
        self.world.remove_enemy(self)


