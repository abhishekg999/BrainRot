import Phaser from 'phaser';
import ActiveWeapon from './Weapon';
import { CollisionCategory } from './CollisionCategories';
import type WorldScene from './WorldScene';

type WASDControls = {
  W: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
  cursors: WASDControls;
  speed: number;
  mouse: Phaser.Input.Pointer;
  weapon: ActiveWeapon;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    (scene as WorldScene).PlayerGroup.add(this);

    this.setSize(this.width * 0.7, this.height * 0.7);

    this.cursors = this._createControls();
    this.mouse = scene.input.mousePointer;

    // setInterval(() => {
    //   this.mouse.updateWorldPoint(scene.cameras.main);
    //   const vec = new Phaser.Math.Vector2(this.mouse.worldX - this.x, this.mouse.worldY - this.y);
    //   vec.normalize();
    //   console.log(Phaser.Math.RadToDeg(vec.angle()));

    // }, 500);

    this.speed = 100;
    this.setDepth(100);

    // For now setting like this. This will be loaded from the server initially,
    // and can be later changed if the server decides to.
    this.weapon = new ActiveWeapon(this, {
      fireInterval: 100,
      projectiles: [
        {
          max_duration: 2000,
          damage: 200,
          speed: 60,
          shot_angle: 0
        },
        {
          max_duration: 2000,
          damage: 100,
          speed: 60,
          shot_angle: -0.4
        },
        {
          max_duration: 2000,
          damage: 100,
          speed: 60,
          shot_angle: 0.4
        },
      ]
    });
  }

  private _createControls() : WASDControls {
    return (this.scene.input.keyboard.addKeys('W,A,S,D') as WASDControls);
  }

  public looking(): number {
    this.mouse.updateWorldPoint(this.scene.cameras.main);
    const vec = new Phaser.Math.Vector2(this.mouse.worldX - this.x, this.mouse.worldY - this.y);
    return vec.angle();
  }

  update() {
    // Handle player movement
    let vel = Phaser.Math.Vector2.ZERO.clone();

    if (this.cursors.A?.isDown) {
      vel.x = -1;
    } else if (this.cursors.D?.isDown) {
      vel.x = 1;
    }

    if (this.cursors.W?.isDown) {
      vel.y = -1;
    } else if (this.cursors.S?.isDown) {
      vel.y = 1;
    }
    vel.normalize();
    vel.scale(this.speed);
    this.setVelocity(vel.x, vel.y);
  }
}
