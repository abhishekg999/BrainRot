import Phaser from "phaser";
import type WorldScene from "./WorldScene";
import type Projectile from "./Projectile";
import { EntityDepthFunctions } from "./EntityDepths";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    max_health: number;
    health: number;
    healthBar: Phaser.GameObjects.Graphics;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        sprite_key: string,
        sprite_index: integer
    ) {
        super(scene, x, y, sprite_key, sprite_index);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        (scene as WorldScene).EnemyGroup.add(this);

        this.setSize(this.width * 0.7, this.height * 0.7);

        this.setDepth(EntityDepthFunctions.ENEMY_DEPTH(this.y));

        // set origin to be near the feet, centered on x
        this.setOrigin(0.5, 1);

        this.max_health = 60000;
        this.health = this.max_health;

        // Create the health bar
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();

        // Adjust the health bar position as needed
        this.healthBar.setDepth(101);
        this.healthBar.y = this.y - 20;
    }

    public dealDamage(damage: number) {
        this.health -= damage;

        // Update the health bar when hit
        this.updateHealthBar();

        if (this.health <= 0) {
            // Enemy defeated, handle accordingly
            this.healthBar.destroy();
            this.disableBody(true, true);
        }
    }

    public handleHitByProjectile(projectile: Projectile) {
        this.dealDamage(projectile.damage);
    }

    private updateHealthBar() {
        // Clear the previous health bar
        this.healthBar.clear();

        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(this.x - 30, this.healthBar.y, 60, 5);

        this.healthBar.fillStyle(0x00ff00, 1);
        const healthWidth = (this.health / this.max_health) * 60;
        this.healthBar.fillRect(this.x - 30, this.healthBar.y, healthWidth, 5);
    }

    update() {
        this.setDepth(EntityDepthFunctions.ENEMY_DEPTH(this.y));
        // @ts-ignore
        this.setRotation(-this.scene.cameras.main.rotation);
    }
}
