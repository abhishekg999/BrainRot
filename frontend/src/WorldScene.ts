import Phaser from "phaser";
import Player from "./Player";
import { getObjects } from "./Objects";
import { getGroundTypes } from "./GroundTypes";

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
    player: Player;
    groundTypes: {[key: number]: object} = {};
    offsetted: boolean;

    constructor() {
        super({ key: "WorldScene" });
        // You can initialize your world data here
        this.worldData = {
            width: 1000,
            height: 1000,
            map: [],
            loadVisibility: 20,
        };

        // testing - just load the map client side
        for (let y = 0; y < this.worldData.height; y++) {
            let row = [];
            for (let x = 0; x < this.worldData.width; x++) {
                row.push(random_choice([ 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 154, 155, 156, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 186, 187, 188, 189, 190, 191]));
            }
            this.worldData.map.push(row);
        }
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
            "lofiObj3",
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
            this.load.spritesheet(
                tileset,
                `rotmg/sheets/${tileset}.png`,
                {
                    frameWidth: 8,
                    frameHeight: 8,
                }
            );
        }

        getGroundTypes.then((data) => {
            for (let tile of data) {
                // @ts-ignore
                this.groundTypes[parseInt(tile.type)] = tile;
            }
        });

        this.load.spritesheet("player", "rotmg/sheets/playersSkins.png", {
            frameWidth: 8,
            frameHeight: 8,
        });
    }

    create() {
        this.player = new Player(this, 50, 50);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true;

        this.physics.world.setBounds(
            0,
            0,
            this.worldData.width * this.TILE_SIZE,
            this.worldData.height * this.TILE_SIZE
        );
        this.physics.world.setBoundsCollision(true, true, true, true);
        
        this.cameras.main.zoom = 4;

        const minus_key = this.input.keyboard.addKey('O');
        const plus_key = this.input.keyboard.addKey('P');

        minus_key.addListener('up', () => {
            this.cameras.main.zoom = Math.max(this.cameras.main.zoom-1, 1); 
        });

        plus_key.addListener('up', () => {
            this.cameras.main.zoom = Math.min(this.cameras.main.zoom+1, 10); 
        });

        this.offsetted = false;
        const offset_key = this.input.keyboard.addKey('X');
        offset_key.addListener('up', () => {
            if (this.offsetted) {
                this.cameras.main.setFollowOffset(0, 0);
                this.offsetted = false;
            } else {
                this.cameras.main.setFollowOffset(0, 25);
                this.offsetted = true;
            }
            
        });

    }

    private _get_texture_from_tile(tile: any) {
        return tile['Texture']['File']
    }

    private _get_texture_index_from_tile(tile: any) {
        return parseInt(tile['Texture']['Index']);
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
                'alienInvasionObjects8x8',
                0
            );
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

    private update_map(map: number[][]) {
        const playerTileX = Math.floor(this.player.x / this.TILE_SIZE);
        const playerTileY = Math.floor(this.player.y / this.TILE_SIZE);

        const radius = this.worldData.loadVisibility;

        for (let y = playerTileY - radius; y <= playerTileY + radius; y++) {
            for (let x = playerTileX - radius; x <= playerTileX + radius; x++) {
                // Check if the tile is within the bounds of the world
                if (
                    y >= 0 &&
                    y < this.worldData.height &&
                    x >= 0 &&
                    x < this.worldData.width
                ) {
                    const tileType = map[y][x];
                    this._load_player_tile([y, x], tileType);
                } // else do nothing
            }
        }
    }

    update(time: number, delta: number): void {
        // for (let pos in this.visibleTiles) {
        // 	this._unload_player_tile(pos)
        // }

        this.update_map(this.worldData.map);
        this.player.update();
    }
}
