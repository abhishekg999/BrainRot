import requests
import re
import os

def store(url, path):
    res = requests.get(url)
    with open(path, 'wb') as f:
        f.write(res.content)

def get_links(url):
    req = requests.get(url)
    links = re.findall(r"<a href=\"(.*?)\">", req.text)
    
    assert links[0] == "../"
    return links[1:]

REMOTE_BASE = "https://static.drips.pw/rotmg/production/current/"
LOCAL_BASE = "rotmg/"

get_links(REMOTE_BASE)

stack: list[str] = []
stack.append((REMOTE_BASE, LOCAL_BASE))

while stack:
    remote, local = stack.pop(-1)
    if not remote.endswith('/'):
        store(remote, local)
        continue
        
    os.mkdir(local)
    
    for link in get_links(remote):
        stack.append((remote+link, local+link))
    

    
