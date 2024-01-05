import Phaser from 'phaser';
import type WorldScene from './WorldScene';
import { CollisionCategory } from './CollisionCategories';
import type Enemy from './Enemy';

/**
 * Represents a projectile that has been fired by a weapon. The projectile will behave as
 * described by the projectileConfig. 
 */
export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    private speed: number;
    private shot_angle: number; // radians
    private max_duration: number;
    damage: number;

    constructor(scene: Phaser.Scene, x: number, y: number, sprite_key: string, projectileConfig: any) {
        super(scene, x, y, 'lostHallsObjects8x8', 16 * 10 + 3);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        (scene as WorldScene).PlayerProjectileGroup.add(this);
        // this.setCollisionCategory(CollisionCategory.PLAYER_PROJECTILE)
        // this.setCollidesWith(CollisionCategory.ENEMY);

        const { max_duration, damage, speed, shot_angle } = projectileConfig;
        
        this.speed = speed;
        this.shot_angle = shot_angle; // relative to player looking for now
        this.max_duration = max_duration;
        this.damage = damage;
     
        this.setDepth(101);

        // destroy the object no matter what after it expires?
        setTimeout(() => this.destroy(), this.max_duration);
        // this.scene.physics.add.collider(this, (this.scene as WorldScene).player, () => {
        //     console.log('hit');
        //     this.destroy();
        // });

        const vector = Phaser.Math.Vector2.ONE.clone();
    
        const actual_angle = Phaser.Math.Angle.WrapDegrees(this.shot_angle + (this.scene as WorldScene).player.looking());
        vector.setAngle(actual_angle);
        vector.scale(this.speed);

        // change the sprite angle, this is currently wrong tho
        this.setAngle(Phaser.Math.RadToDeg(actual_angle) + 45);


        this.setVelocity(vector.x, vector.y);
    }

    public handle_hit(enemy: Enemy) {
        this.destroy();
    }
} 