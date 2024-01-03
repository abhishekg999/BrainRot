from abc import ABC, abstractmethod
from dataclasses import dataclass

"""
id: int = Numerical that matches Object.json `type`, and to be used for network comm
name: str = string identifier that matches Object.json `id` 
"""

class ClientObject(ABC):
    id: int
    name: str
    def __init__(self, id, name):
        self.id = id
        self.name = name

class Projectile(ClientObject):
    def __init__(self, id, name):
        super().__init__(id, name)

class Character(ClientObject):
    def __init__(self, id, name):
        super().__init__(id, name)

