import json
import sys
from pprint import pprint

file = sys.argv[1]

with open(file) as f:
    data = json.load(f)


Object = data['Object']
for obj in Object:
    if g := obj.get('Class'):
        print(g)