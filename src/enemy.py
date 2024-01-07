from abc import ABC, abstractmethod
from typing import TypeAlias, override
from dataclasses import dataclass, field, asdict
from utils import IncrementingUniqueID
from events import EventSink

@dataclass
class EnemyData:
    x: int = 0
    y: int = 0

    max_health: int = 60000
    defense: int = 10

    velocity: tuple[int, int] = (0, 0)
   

class Enemy(EventSink, ABC):
    def __init__(self, world, data: EnemyData):
        super().__init__()
        self.id = IncrementingUniqueID.generate()
        self.world = world
        self.world.add_enemy(self)

        self.config = data

        self.x = self.config.x
        self.y = self.config.y

        self.max_health = self.config.max_health
        self.defense = self.config.defense

        self.velocity = self.config.velocity

        self.health = self.max_health

        self.alive = True
        self.initialize_enemy(self.config)

        
    @abstractmethod
    def initialize_enemy(self, config) -> None: ...

    def died(self):
        self.alive = False

    def damage(self, dmg: int):
        self.health -= dmg
        if self.health <= 0:
            self.died()

    def update_pos(self, x: int, y: int):
        self.x = x
        self.y = y

    def destroy(self):
        self.world.remove_enemy(self)


from random import randint
class Leuc(Enemy):
    def __init__(self, world, data: EnemyData):
        super().__init__(world, data)

    def initialize_enemy(self, config) -> None:
        def handler(data):
            self.x += randint(-2, 2)
            self.y += randint(-2, 2)
        self.on("MOVE_SOMEWHERE", handler)

    
