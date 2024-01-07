import Phaser from "phaser";
import Player from "./Player";
import { getGroundTypes } from "./GroundTypes";
import Enemy from "./Enemy";
import type Projectile from "./Projectile";
import { readyForSocket, socket } from "./Networking";
import RemotePlayer from "./RemotePlayer";
import type RemoteProjectile from "./RemoteProjectile";

export default class WorldScene extends Phaser.Scene {
    private worldData: {
        width: number;
        height: number;
        map: number[][];
        loadVisibility: number;
    };
    private readonly TILE_SIZE = 8;
    private visibleTiles: { [key: number]: number } = {};
    player: Player | undefined;
    remotePlayers: { [key: string]: RemotePlayer } = {};
    groundTypes: { [key: number]: object } = {};
    offsetted: boolean;

    PlayerGroup: Phaser.Physics.Arcade.Group;
    PlayerProjectileGroup: Phaser.Physics.Arcade.Group;
    RemotePlayerProjectileGroup: Phaser.Physics.Arcade.Group;
    EnemyGroup: Phaser.Physics.Arcade.Group;
    EnemyProjectileGroup: Phaser.Physics.Arcade.Group;

    enemies: {[key: number]: Enemy} = {}

    rotate_left: Phaser.Input.Keyboard.Key;
    rotate_right: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: "WorldScene" });
    }

    preload() {
        const groundTileSets = [
            "SakuraEnvironment8x8",
            "alienInvasionObjects8x8",
            "ancientRuinsObjects8x8",
            "archbishopObjects8x8",
            "autumnNexusObjects8x8",
            "crystalCaveObjects8x8",
            "cursedLibraryObjects8x8",
            "d3LofiObjEmbed",
            "epicHiveObjects8x8",
            "fungalCavernObjects8x8",
            "innerWorkingsObjects8x8",
            "lairOfDraconisObjects8x8",
            "lofiEnvironment",
            "lofiEnvironment2",
            "lofiEnvironment3",
            "lofiObj2",
            "lofiObj3",
            "lofiObj4",
            "lofiProjs",
            "lostHallsObjects8x8",
            "magicWoodsObjects8x8",
            "mountainTempleObjects8x8",
            "oryxHordeObjects8x8",
            "oryxSanctuaryObjects8x8",
            "parasiteDenObjects8x8",
            "santaWorkshopObjects8x8",
            "secludedThicketObjects8x8",
            "stPatricksObjects8x8",
            "summerNexusObjects8x8",
            "theMachineObjects8x8",
            "xmasNexusObjects8x8",
        ];
        for (let tileset of groundTileSets) {
            this.load.spritesheet(tileset, `rotmg/sheets/${tileset}.png`, {
                frameWidth: 8,
                frameHeight: 8,
            });
        }
        getGroundTypes.then((data) => {
            for (let tile of data) {
                // @ts-ignore
                this.groundTypes[parseInt(tile.type)] = tile;
            }
        });
        // Player sprites
        this.load.spritesheet("player", "rotmg/sheets/players.png", {
            frameWidth: 8,
            frameHeight: 8,
        });
        // Enemy sprites
        this.load.spritesheet(
            "archbishopChars16x16",
            "rotmg/sheets/archbishopChars16x16.png",
            {
                frameWidth: 16,
                frameHeight: 16,
            }
        );
    }

    create() {
        // setup listeners
        socket.on("PLAYER_WORLD_INIT", (data) => {
            const map: { [key: string]: number } = data.map;
            for (let key in map) {
                this.load_player_tile(key, map[key]);
            }

            const x = data.x;
            const y = data.y;

            // initialize world bounds
            this.physics.world.setBounds(
                32,
                32,
                (data.tile_width - 10) * this.TILE_SIZE,
                (data.tile_height - 10) * this.TILE_SIZE
            );
            this.physics.world.setBoundsCollision(true, true, true, true);

            // now initialize player
            this.player = new Player(this, x, y);
            this.cameras.main.startFollow(this.player);
        });

        socket.on("WORLD_STATE", (data) => {
            const map: { [key: string]: number } = data.map;
            for (let key in map) {
                this.load_player_tile(key, map[key]);
            }

            const enemies: {[key: number]: any} = data.enemies;
            for (let enemy_id in enemies) {
                const enemy = enemies[enemy_id];
                if (enemy_id in this.enemies) {
                    this.enemies[enemy_id].setHealth(enemy.health);
                    this.enemies[enemy_id].x = enemy.x;
                    this.enemies[enemy_id].y = enemy.y;

                    if (!enemy.alive) {
                        this.enemies[enemy_id].died()
                        this.enemies[enemy_id].destroy()
                        delete this.enemies[enemy_id];
                    };
                } else {
                    // @ts-ignore
                    this.enemies[enemy_id] = new Enemy(this, enemy.x, enemy.y, enemy_id, "archbishopChars16x16", 7);
                }
            }
        });

        socket.on("PLAYER_STATE", (data) => {
            const { id, x, y, looking, is_shooting } = data;
            if (id in this.remotePlayers) {
                this.remotePlayers[id].x = x;
                this.remotePlayers[id].y = y;
            } else {
                this.remotePlayers[id] = new RemotePlayer(this, x, y, id);
            }

            this.remotePlayers[id].looking_angle = looking;
            if (is_shooting) {
                this.remotePlayers[id].weapon.startShooting();
            } else {
                this.remotePlayers[id].weapon.stopShooting();
            }

            this.remotePlayers[id].update();
        });

        socket.on("PLAYER_LEAVE", (data) => {
            const { id } = data;
            this.remotePlayers[id]?.destroy();
            delete this.remotePlayers[id];
        });

        this.rotate_left = this.input.keyboard.addKey("Q");
        this.rotate_right = this.input.keyboard.addKey("E");

        // initialize collision groups
        this.PlayerGroup = this.physics.add.group();
        this.PlayerProjectileGroup = this.physics.add.group();
        this.EnemyGroup = this.physics.add.group();
        this.EnemyProjectileGroup = this.physics.add.group();
        this.RemotePlayerProjectileGroup = this.physics.add.group();

        this.cameras.main.zoom = 4;

        const minus_key = this.input.keyboard.addKey("O");
        const plus_key = this.input.keyboard.addKey("P");

        minus_key.addListener("up", () => {
            this.cameras.main.zoom = Math.max(this.cameras.main.zoom - 1, 1);
        });

        plus_key.addListener("up", () => {
            this.cameras.main.zoom = Math.min(this.cameras.main.zoom + 1, 10);
        });

        this.offsetted = false;
        const offset_key = this.input.keyboard.addKey("X");

        offset_key.addListener("up", () => {
            if (this.offsetted) {
                this.cameras.main.setFollowOffset(0, 0);
                this.offsetted = false;
            } else {
                this.cameras.main.setFollowOffset(0, 25);
                this.offsetted = true;
            }
        });

        const reset_rotate_key = this.input.keyboard.addKey("Z");
        reset_rotate_key.addListener("up", () => {
            // @ts-ignore
            this.cameras.main.rotation = 0;
        });

        // add collisions between player projectile and enemy

        this.physics.add.overlap(this.PlayerProjectileGroup, this.EnemyGroup, ((
            p: Projectile,
            e: Enemy
        ) => {
            e.handleHitByProjectile(p);
            p.handleHit(e);
        }) as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback);

        this.physics.add.overlap(
            this.RemotePlayerProjectileGroup,
            this.EnemyGroup,
            ((p: RemoteProjectile, e: Enemy) => {
                p.handleHit(e);
                // dont do anything for enemy
            }) as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback
        );

        // WORLD IS NOW READY
        readyForSocket();
    }

    private _get_texture_from_tile(tile: any) {
        return tile["Texture"]["File"];
    }

    private _get_texture_index_from_tile(tile: any) {
        return parseInt(tile["Texture"]["Index"]);
    }

    private _load_player_tile(pos: [number, number], tileType: number): void {
        const [y, x] = pos;

        const tile = this.groundTypes[tileType];
        const tileTexture = this._get_texture_from_tile(tile);
        const tileIndex = this._get_texture_index_from_tile(tile);

        // @ts-ignore
        if ([y, x] in this.visibleTiles) {
            // @ts-ignore
            this.visibleTiles[[y, x]].setTexture(tileTexture, tileIndex);
        } else {
            // @ts-ignore
            this.visibleTiles[[y, x]] = this.add.sprite(
                x * this.TILE_SIZE,
                y * this.TILE_SIZE,
                "alienInvasionObjects8x8", // just a black tile
                0
            ); 
        }
    }

    private load_player_tile(
        pos: [number, number] | string,
        tileType: number
    ): void {
        if (typeof pos === "string") {
            // @ts-ignore
            const _pos: [number, number] = pos
                .split(",")
                .map((x) => parseInt(x));
            this._load_player_tile(_pos, tileType);
        } else {
            this._load_player_tile(pos, tileType);
        }
    }

    private _unload_player_tile(pos: [number, number] | string): void {
        // @ts-ignore
        if (pos in this.visibleTiles) {
            // @ts-ignore
            this.visibleTiles[pos].setTexture("alienInvasionObjects8x8", 0);
        } else {
            // tile is not loaded anyways, noneed to do, no need to do anything
        }
    }

    update(time: number, delta: number): void {
        //for (let pos in this.visibleTiles) {
        //  	this._unload_player_tile(pos)
        //}

        if (this.rotate_left.isDown) {
            // @ts-ignore
            this.cameras.main.rotation += 0.02;
        }

        if (this.rotate_right.isDown) {
            // @ts-ignore
            this.cameras.main.rotation -= 0.02;
        }

        this.player?.update();

        // Moving this to only update once recieved new remote data from server.
        // for (const key in this.remotePlayers) {
        //     this.remotePlayers[key].update();
        // }

        // Call update method here
        for (let enemy_id in this.enemies) {
            this.enemies[enemy_id].update()
        }
    }
}
