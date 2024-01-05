import Phaser from "phaser";
import Player from "./Player";
import { getObjects } from "./Objects";
import { getGroundTypes } from "./GroundTypes";
import Enemy from "./Enemy";
import type Projectile from "./Projectile";
import { readyForSocket, socket } from "./Networking";

const random_choice = (l: any[]) => {
    return l[Math.floor(Math.random() * l.length)];
};

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
    groundTypes: { [key: number]: object } = {};
    offsetted: boolean;

    PlayerGroup: Phaser.Physics.Arcade.Group;
    PlayerProjectileGroup: Phaser.Physics.Arcade.Group;
    EnemyGroup: Phaser.Physics.Arcade.Group;
    EnemyProjectileGroup: Phaser.Physics.Arcade.Group;
    enemy: Enemy;
    rotate_left: Phaser.Input.Keyboard.Key;
    rotate_right: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: "WorldScene" });

        // this.worldData = {
        //     width: 1000,
        //     height: 1000,
        //     map: [],
        //     loadVisibility: 20,
        // };

        // // testing - just load the map client side
        // for (let y = 0; y < this.worldData.height; y++) {
        //     let row = [];
        //     for (let x = 0; x < this.worldData.width; x++) {
        //         row.push(
        //             random_choice([
        //                 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 141,
        //                 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152,
        //                 154, 155, 156, 158, 159, 160, 161, 162, 163, 164, 165,
        //                 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176,
        //                 177, 178, 179, 180, 181, 182, 183, 186, 187, 188, 189,
        //                 190, 191,
        //             ])
        //         );
        //     }
        //     this.worldData.map.push(row);
        // }
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
        this.load.spritesheet("player", "rotmg/sheets/playersSkins.png", {
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
            const map: {[key: string]: number} = data.map;
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

            
            // maybe socket.off here? but not necessary
        });

        socket.on("WORLD_STATE", (data) => {
            const map: {[key: string]: number} = data.map;
            for (let key in map) {
                this.load_player_tile(key, map[key]);
            }
        });

        this.rotate_left = this.input.keyboard.addKey("Q");
        this.rotate_right = this.input.keyboard.addKey("E");
        
        // initialize collision groups
        this.PlayerGroup = this.physics.add.group();
        this.PlayerProjectileGroup = this.physics.add.group();
        this.EnemyGroup = this.physics.add.group();
        this.EnemyProjectileGroup = this.physics.add.group();

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
            this.cameras.main.rotation = 0;
        })

        this.enemy = new Enemy(this, 100, 50, "archbishopChars16x16", 7);

        // add collisions between player projectile and enemy
        
        this.physics.add.overlap(
            this.PlayerProjectileGroup,
            this.EnemyGroup,
            // @ts-ignore
            (p: Projectile, e: Enemy) => { 
                p.handleHit(e);
                e.handleHitByProjectile(p);
            }
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
                "alienInvasionObjects8x8",
                0
            ); // just a black tile
        }
    }

    private load_player_tile(pos: [number, number] | string, tileType: number) : void {
        if (typeof pos === "string") {
            // @ts-ignore
            const _pos: [number, number] = pos.split(',').map((x) => parseInt(x))
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
        // for (let pos in this.visibleTiles) {
        // 	this._unload_player_tile(pos)
        // }

        if (this.rotate_left.isDown) {
            this.cameras.main.rotation += 0.02;
        }

        if (this.rotate_right.isDown) {
            this.cameras.main.rotation -= 0.02;
        }

        
        this.player?.update();
        this.enemy?.update();
    }
}
