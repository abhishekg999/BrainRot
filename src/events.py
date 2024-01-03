from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Callable, DefaultDict
from collections import defaultdict
import concurrent.futures

class EventRouter: 
    """
    Wrapper for the router for events. Purely static methods in this class.
    """
    routes : DefaultDict[str, list[EventSink]] = defaultdict(list)

    @staticmethod
    def register_route(client: EventSink, event: str):
        EventRouter.routes[event].append(client)
         

    @staticmethod
    def route(event: str, data: dict):
        for client in EventRouter.routes[event]:
            client._handle_event(event, data)

    @staticmethod
    def async_route(event: str, data: dict):
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(client._handle_event, event, data) for client in EventRouter.routes[event]]
            concurrent.futures.wait(futures)
     
    
class EventSink:
    def __init__(self):
        self.event_handlers = {}

    def on(self, event: str, handler: Callable[[dict], None]):       
        self.event_handlers[event] = handler
        EventRouter.register_route(self, event)
    
    def _handle_event(self, event: str, data: dict):
        assert event in self.event_handlers
        self.event_handlers[event](data)


def async_event(event: str, data: dict):
    """
    Uses a ThreadPool to pass the event to all listeners. Ensure the handlers
    are thread safe.
    """
    EventRouter.async_route(event, data)

def event(event: str, data: dict):
    """
    Synchronously notifies any clients listening for this data and passes the data to it.
    Note that if any client blocks, the rest of the listeners waiting for the event 
    will only get the event once it finishes.
    """
    EventRouter.route(event, data)