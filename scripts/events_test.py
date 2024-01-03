from __future__ import annotations
from events import EventSink, event, async_event
import threading
from threading import Thread
import time

import collections.abc
import typing

from flask import Flask
from flask_socketio import SocketIO

import redis

T = typing.TypeVar("T")
U = typing.TypeVar("U")
R = typing.TypeVar("R")

PRINT_LOCK = threading.Lock()

_print = print
def print(*args, **kwargs):
    with PRINT_LOCK:
        _print(*args, **kwargs)

    


class BinOp(typing.Generic[T, U, R]):
    __slots__ = ("callback", "parent", "value")

    def __init__(
        self,
        callback: collections.abc.Callable[[T, U], R] | None = None,
        parent: BinOp[T, U, R] | None = None,
        value: T | None = None,
    ) -> None:
        self.callback = callback
        self.parent = parent
        self.value = value

    def __rmatmul__(self, other: U) -> BinOp[T, U, R]:
        return BinOp(None, self, other)

    def __matmul__(self, other: U) -> R:
        return self.parent.callback(self.value, other)

@BinOp
def also(a, b):
    pass

class A(EventSink):
    def __init__(self):
        super().__init__()
        self.on("bark", lambda d: time.sleep(1) @also@ print("A SAID: ", 'meow'))

class B(EventSink):
    def __init__(self):
        super().__init__()
        self.on("bark", lambda d: time.sleep(1) @also@ print("B SAID: ", d['data']))


a = A()
b = B()


event('bark', {'data': 'hi'})
async_event('bark', {'data': 'test2'})