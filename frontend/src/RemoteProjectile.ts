import Phaser from 'phaser';
import type WorldScene from './WorldScene';
import type Enemy from './Enemy';

/**
 * Represents a RemoteProjectile that has been fired by a RemoteWeapon. The projectile will behave as
 * described by the projectileConfig. 
 */
export default class RemoteProjectile extends Phaser.Physics.Arcade.Sprite {
    private speed: number;
    private shot_angle: number; 
    private max_duration: number;
    damage: number;

    constructor(scene: Phaser.Scene, x: number, y: number, sprite_key: string, projectileConfig: any) {
        super(scene, x, y, 'lofiProjs', 0x2e);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        (scene as WorldScene).RemotePlayerProjectileGroup.add(this);
        const { max_duration, damage, speed, player_looking, shot_angle } = projectileConfig;
        
        this.speed = speed;
        this.shot_angle = shot_angle; 
        this.max_duration = max_duration;
        this.damage = damage;
     
        this.setDepth(101);

        // set projectile origin to be the bottom left of the sprite
        this.setOrigin(0, 0.5);

        // destroy the object no matter what after it expires?
        setTimeout(() => this.destroy(), this.max_duration);

        const vector = Phaser.Math.Vector2.ONE.clone();
        const actual_angle = Phaser.Math.Angle.WrapDegrees(this.shot_angle + player_looking);
        vector.setAngle(actual_angle);
        vector.scale(this.speed);

        // change the sprite angle, this is currently wrong tho
        this.setAngle(Phaser.Math.RadToDeg(actual_angle));


        this.setVelocity(vector.x, vector.y);
    }

    public handleHit(enemy: Enemy) {
        this.destroy();
    }
} 