from abc import ABC
from typing import TypeAlias, TypedDict, NotRequired
import json
from pprint import pprint

TILE_SIZE = 8

with open('../rotmg/json/GroundTypes.json') as f:
    GroundTypes = json.load(f)['Ground']

for tile in GroundTypes:
    tile['type'] = int(tile['type'], 16)

SimpleTiles = [tile for tile in GroundTypes if "Texture" in tile][303:303+6]

if __name__ == "__main__":
    print(list({x['type'] for x in SimpleTiles}))