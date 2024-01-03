import type Player from "./Player";
import Projectile from "./Projectile";
import type WorldScene from "./WorldScene";


export default class ActiveWeapon {
	isShooting: boolean = false;
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
		
		const shoot_key = this.player.scene.input.keyboard.addKey("SPACE");
		shoot_key.addListener('down', () => {
			this.startShooting();
		});

		shoot_key.addListener('up', () => {
			this.stopShooting();
		});
	}

	public startShooting() {
		if (this.isShooting) return;

		const world = this.player.scene as WorldScene;
		this.isShooting = true;

		this.shotInterval = setInterval(() => {
			for (let projectile of this.projectilesDefinitions) {
				new Projectile(world, this.player.x, this.player.y, 'projectile', projectile);
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