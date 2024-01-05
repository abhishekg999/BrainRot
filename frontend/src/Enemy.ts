import Phaser from 'phaser';
import type WorldScene from './WorldScene';
import type Projectile from './Projectile';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    max_health: number;
    health: number;
    healthBar: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, sprite_key: string, sprite_index: integer) {
        super(scene, x, y, sprite_key, sprite_index);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        (scene as WorldScene).EnemyGroup.add(this);

        this.setSize(this.width * 0.7, this.height * 0.7);

        this.setDepth(100);

        this.max_health = 60000;
        this.health = this.max_health;

        // Create the health bar
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();

        // Adjust the health bar position as needed
        this.healthBar.setDepth(101);
        this.healthBar.y = this.y - 20;
    }

    public handle_hit_by(projectile: Projectile) {
        this.health -= projectile.damage;

        // Update the health bar when hit
        this.updateHealthBar();

        if (this.health <= 0) {
            // Enemy defeated, handle accordingly
            this.healthBar.destroy();
            this.destroy();
        }
    }

    private updateHealthBar() {
        // Clear the previous health bar
        this.healthBar.clear();

        // Draw the background of the health bar
        this.healthBar.fillStyle(0xFF0000, 1);
        this.healthBar.fillRect(this.x - 30, this.healthBar.y, 60, 5);

        // Draw the current health
        this.healthBar.fillStyle(0x00FF00, 1);
        const healthWidth = (this.health / this.max_health) * 60;
        this.healthBar.fillRect(this.x - 30, this.healthBar.y, healthWidth, 5);
    }
}
