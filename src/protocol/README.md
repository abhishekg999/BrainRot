# Websocket Communication Protocols

### Message: HELLO_SERVER
```
data identifiers
```

### Response: HELLO_CLIENT
```
bool: success
string?: error

string: session
string[]: world_ids
```

### MESSAGE: HELLO_WORLD
```
string: session
string: world_id
bool: need_shadow_map
```

### RESPONSE: HELLO_WORLD_RESPONSE
```
string: world_id
string: world_name
bool: success 
string?: error
int: world_width
int: world_height

int[][]: shadow_map

object {
    player_id: !player_data
}: player_info
```

### RESPONSE: WORLD_STATE
```
string: world_id

object {
    player_id: !player_data
}: player_info

object {
    object_id: !object_data
}: world_info
```

### MESSAGE: PLAYER_STATE
```
string: world_id

object {
    x: int
    y: int

    bool: is_shooting
    player_inventory: inventory
    object {
        object_id: string => damage: int
    }: shots
}: state
```

> For now its the clients responsibility to calculate and track all damage done to objects, and send this to the server. However the final value replied by server is authoritative.

### MESSAGE: SEND_WORLD_CHAT
```
string: session
string: message 
```

### RESPONSE: RECIEVE_WORLD_CHAT
```
string: from (=player_id)
string: message
```



