import Phaser from 'phaser';
import Player from './Player';

const random_choice = (l: any[]) => {
	return l[Math.floor(Math.random() * l.length)]
}


export default class WorldScene extends Phaser.Scene {
  private worldData: { width: number; height: number; map: number[][]; loadVisibility: number };
  private readonly TILE_SIZE = 8;
  private visibleTiles: {[key: number]: number;} = {};
  player: Player;

  constructor() {
    super({ key: 'WorldScene' });
    // You can initialize your world data here
    this.worldData = {
      width: 100,
      height: 100,
      map: [],
			loadVisibility: 20
    };

    for (let y = 0; y < this.worldData.height; y++) {
        let row = []
        for (let x = 0; x < this.worldData.width; x++) {
            row.push(random_choice([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
        }
        this.worldData.map.push(row);
    }
  }

  preload() {
    this.load.spritesheet('lostHallsObjects8x8', 'rotmg/sheets/lostHallsObjects8x8.png', {
        frameWidth: 8,
        frameHeight: 8,
      });

    this.load.spritesheet('player', 'rotmg/sheets/playersSkins.png', {
        frameWidth: 8,
        frameHeight: 8
    });
  }

  create() {
    this.player = new Player(this, 50, 50);
    this.cameras.main.startFollow(this.player)
    this.cameras.main.roundPixels = true;

    this.physics.world.setBounds(0, 0, this.worldData.width*this.TILE_SIZE, this.worldData.height*this.TILE_SIZE)
    this.physics.world.setBoundsCollision(true, true, true, true);
  
    this.cameras.main.zoom = 4;
	}

	private _load_player_tile(pos: [number, number], index: number) : void {
		const [y, x] = pos;

		// @ts-ignore
		if ([y,x] in this.visibleTiles) {
			// @ts-ignore
			this.visibleTiles[[y,x]].setTexture('lostHallsObjects8x8', index);
		} else {
			// @ts-ignore
			this.visibleTiles[[y,x]] = this.add.sprite(x * this.TILE_SIZE, y * this.TILE_SIZE, 'lostHallsObjects8x8', 3);
		}
	}

	private _unload_player_tile(pos: [number, number] | string) : void {
		// @ts-ignore
		if (pos in this.visibleTiles) {
			// @ts-ignore
			this.visibleTiles[pos].setTexture('lostHallsObjects8x8', 20);
		} else {
			; // tile is not loaded anyways, noneed to do, no need to do anything
		}
	}

  private update_map(map: number[][]) {
    const playerTileX = Math.floor(this.player.x / this.TILE_SIZE);
    const playerTileY = Math.floor(this.player.y / this.TILE_SIZE);

    const radius = this.worldData.loadVisibility;

    for (let y = playerTileY - radius; y <= playerTileY + radius; y++) {
			for (let x = playerTileX - radius; x <= playerTileX + radius; x++) {
			// Check if the tile is within the bounds of the world
			if (y >= 0 && y < this.worldData.height && x >= 0 && x < this.worldData.width) {
					const tileIndex = map[y][x];
					this._load_player_tile([y, x], tileIndex);
				} // else do nothing
    	}
		}
  }


  update(time: number, delta: number) : void {
  
		// for (let pos in this.visibleTiles) {
		// 	this._unload_player_tile(pos)
		// }

    this.update_map(this.worldData.map);  
    this.player.update();
  }
}
