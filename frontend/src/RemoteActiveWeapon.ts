import type WorldScene from "./WorldScene";
import type RemotePlayer from "./RemotePlayer";
import RemoteProjectile from "./RemoteProjectile";

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
                new RemoteProjectile(
                    world,
                    this.player.x,
                    this.player.y,
                    "projectile",
                    {
                        ...projectile,
                        player_looking: this.player.looking(),
                    }
                );
            }
        }, this.fireInterval);
    }

    public stopShooting() {
        if (!this.isShooting) return;
        this.isShooting = false;
        clearInterval(this.shotInterval);
    }

    update() {}
}
