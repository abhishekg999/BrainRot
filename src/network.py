import json
from random import choice
from auth import Auth

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

def M_HELLO_SERVER(data: dict):
    identifier = data.get('identity')
    session_token = Auth.verify(identifier)

    success = session_token is not None
    error = None if success else "Unable to identify user with provided credentials."
    
    response = R_HELLO_CLIENT(
        success,
        error,
        session_token,
        ['nexus']
    )
    return response

