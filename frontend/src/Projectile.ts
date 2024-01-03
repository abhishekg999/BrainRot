import Phaser from 'phaser';
import type WorldScene from './WorldScene';
import { CollisionCategory } from '../CollisionCategories';

/**
 * Represents a projectile that has been fired by a weapon. The projectile will behave as
 * described by the projectileConfig. 
 */
export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    private speed: number;
    private shot_angle: number;
    private max_duration: number;
    private damage: number;

    constructor(scene: Phaser.Scene, x: number, y: number, sprite_key: string, projectileConfig: any) {
        super(scene, x, y, 'lostHallsObjects8x8', 16 * 7 + 11);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollisionCategory(CollisionCategory.PLAYER_PROJECTILE)
        
        this.setDebug(false, false, 1);

        const { max_duration, damage, speed, shot_angle } = projectileConfig;
        
        this.speed = speed;
        this.shot_angle = shot_angle; // relative to player looking for now
        this.max_duration = max_duration;
        this.damage = damage;
     
        this.setDepth(100);

        // change the sprite angle, this is currently wrong tho
        this.setAngle(this.shot_angle)

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

        this.setVelocity(vector.x, vector.y);

    }


}