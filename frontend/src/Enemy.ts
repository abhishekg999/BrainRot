import Phaser from "phaser";
import type WorldScene from "./WorldScene";
import type Projectile from "./Projectile";
import { EntityDepthFunctions } from "./EntityDepths";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    max_health: number;
    health: number;
    healthBar: Phaser.GameObjects.Graphics;
    id: number;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        id: number,
        sprite_key: string,
        sprite_index: integer
    ) {
        super(scene, x, y, sprite_key, sprite_index);
        this.id = id;
        
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
        this.healthBar.setDepth(99999);
        this.updateHealthBar();
    }

    public died() {
        this.healthBar.destroy();
        this.disableBody(true, true);
    }

    public setHealth(health: number) {
        this.health = health;
        // Update the health bar when hit
        this.updateHealthBar();
    }

    public dealDamage(damage: number) {
        this.setHealth(this.health - damage);
    }

    public handleHitByProjectile(projectile: Projectile) {
        this.dealDamage(projectile.damage);

        // TODO: probably want to give projectile a reference to weapon so it can access player from that
        const projectile_player = (projectile.scene as WorldScene).player;

        if (this.id in projectile_player.damage_dealt) {
            projectile_player.damage_dealt[this.id] += projectile.damage;
        } else {
            projectile_player.damage_dealt[this.id] = projectile.damage;
        }
        
    }

    private updateHealthBar() {
        const { x, y, health, max_health, width } = this;
        const barWidth = width * 1.2; // Adjust the width of the health bar
    
        // Clear previous health bar
        this.healthBar.clear();
    
        // Draw the background of the health bar
        this.healthBar.fillStyle(0x000000);
        this.healthBar.fillRect(x - barWidth / 2, y - 30, barWidth, 5);
    
        // Calculate the percentage of health remaining
        const healthPercentage = Math.max(0, health / max_health);
    
        // Determine the color based on health percentage
        const fillColor = (healthPercentage > 0.5) ? 0x00ff00 : 0xff0000;
    
        // Draw the actual health bar
        this.healthBar.fillStyle(fillColor);
        this.healthBar.fillRect(x - barWidth / 2, y - 30, barWidth * healthPercentage, 5);
    }

    update() {
        this.setDepth(EntityDepthFunctions.ENEMY_DEPTH(this.y));
        // @ts-ignore
        this.setRotation(-this.scene.cameras.main.rotation);
        this.updateHealthBar();
    }
}
