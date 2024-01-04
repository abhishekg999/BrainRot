from abc import ABC, abstractmethod
from dataclasses import dataclass
import json

"""
id: int = Numerical that matches Object.json `type`, and to be used for network comm
name: str = string identifier that matches Object.json `id` 
"""

with open('../rotmg/json/Objects.json') as f:
    Objects = json.load(f)['Object']

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


if __name__ == "__main__":
    s : list[set] = []
    for obj in Objects:
        if "Class" in obj:
            if obj['Class'] == 'Character':
                s.append(set(obj.keys()))
    
    print(s[0].intersection(*s))