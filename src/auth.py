from abc import ABC, abstractstaticmethod
from typing import TypeAlias

session_token_t: TypeAlias = str

class ABCAuth(ABC):
    @abstractstaticmethod
    def verify(identity) -> session_token_t | None: ...

class Auth(ABCAuth):
    def verify(identity):
        """
        Test just return the socket id as token.
        """
        
        return identity





