import { Scene } from "phaser";
import Player from "./Player";
import Projectile from "./Projectile";
import type WorldScene from "./WorldScene";
import type RemotePlayer from "./RemotePlayer";

// TODO: https://steamcommunity.com/app/200210/discussions/0/613937306597197136?l=turkish
export class ActiveWeapon {
	isShooting: boolean = false;
	autoShootOn: boolean = false;
	fireInterval: number;
	projectilesDefinitions: any[];
	projectiles: any[];
	shotInterval: Timer;
	player: Player;

	constructor(player: Player, weaponDefinition: any) {
		this.player = player;
		
		const { projectiles, fireInterval } = weaponDefinition;

		this.projectilesDefinitions = projectiles;
		this.fireInterval = fireInterval;

		this.projectiles = [];
        

        // @ts-ignore
        this.player.scene.input.on('pointerdown', (e) => {
            if (e.button == 0 && !this.autoShootOn) {
                this.startShooting();
            }
        });

        // @ts-ignore
        this.player.scene.input.on('pointerup', (e) => {
            if (e.button == 0 && !this.autoShootOn) {
                this.stopShooting();
            }
        });

		const autoshoot_key = player.scene.input.keyboard.addKey('I');
		autoshoot_key.on('up', () => {
			this.autoShootOn = !this.autoShootOn;

			if (this.autoShootOn) {
				this.startShooting();
			} else {
				this.stopShooting();
			}
			
		})
	}

	public startShooting() {
		if (this.isShooting) return;

		const world = this.player.scene as WorldScene;
		this.isShooting = true;

		this.shotInterval = setInterval(() => {
			for (let projectile of this.projectilesDefinitions) {
				new Projectile(world, this.player.x, this.player.y, 'projectile', 
                {
                    ...projectile,
                    player_looking: this.player.looking()
                });
			}
		}, this.fireInterval);	
	}

	public stopShooting() {
		if (!this.isShooting) return;

		this.isShooting = false;
		clearInterval(this.shotInterval);
	}
	
	update() {
	}
}



export class RemoteActiveWeapon {
	isShooting: boolean = false;
	fireInterval: number;
	projectilesDefinitions: any[];
	projectiles: any[];
	shotInterval: Timer;
	player: RemotePlayer;

	constructor(player: RemotePlayer, weaponDefinition: any) {
		this.player = player;
		
		const { projectiles, fireInterval } = weaponDefinition;

		this.projectilesDefinitions = projectiles;
		this.fireInterval = fireInterval;

		this.projectiles = [];
	}

	public startShooting() {
		if (this.isShooting) return;

		const world = this.player.scene as WorldScene;
		this.isShooting = true;

		this.shotInterval = setInterval(() => {
			for (let projectile of this.projectilesDefinitions) {
				new Projectile(world, this.player.x, this.player.y, 'projectile', 
                {
                    ...projectile,
                    player_looking: this.player.looking()
                });
			}
		}, this.fireInterval);	
	}

	public stopShooting() {
		if (!this.isShooting) return;

		this.isShooting = false;
		clearInterval(this.shotInterval);
	}
	
	update() {
	}
}