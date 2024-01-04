import json
from random import choice
from auth import Auth
from worlds import World

def R_HELLO_CLIENT(
        success: bool, 
        error: str | None,
        session: str,
        world_ids: list[str] 
    ):
    resp = {
        "success": success
    }
    if success:
        resp['session'] = session
        resp['world_ids'] = world_ids
    else: 
        resp['error'] = error

    return resp

def R_WORLD_STATE():
    pass
