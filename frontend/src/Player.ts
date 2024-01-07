import Phaser from "phaser";
import { ActiveWeapon } from "./ActiveWeapon";
import type WorldScene from "./WorldScene";
import { socket } from "./Networking";
import { EntityDepthFunctions } from "./EntityDepths";

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
    shots: any;

    damage_dealt: {[key: number]: number} = {};

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "player", 7*3);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        (scene as WorldScene).PlayerGroup.add(this);

        this.setCollideWorldBounds(true);

        this.setSize(this.width * 0.7, this.height * 0.7);

        this.cursors = this._createControls();
        this.mouse = scene.input.mousePointer;

        this.speed = 100;
        this.setDepth(EntityDepthFunctions.PLAYER_DEPTH(this.y));

        // For now setting like this. This will be loaded from the server initially,
        // and can be later changed if the server decides to.
        this.weapon = new ActiveWeapon(this, {
            fireInterval: 100,
            projectiles: [
                {
                    max_duration: 250,
                    damage: 250,
                    speed: 180 / 2,
                    shot_angle: 0,
                },
            ],
        });
    }

    private _createControls(): WASDControls {
        return this.scene.input.keyboard.addKeys("W,A,S,D") as WASDControls;
    }

    public looking(): number {
        this.mouse.updateWorldPoint(this.scene.cameras.main);
        const vec = new Phaser.Math.Vector2(
            this.mouse.worldX - this.x,
            this.mouse.worldY - this.y
        );
        return vec.angle();
    }

    update() {
        // @ts-ignore
        const camera_rotation = -this.scene.cameras.main.rotation;
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
        vel.rotate(camera_rotation);
        this.setVelocity(vel.x, vel.y);

        // update depth
        this.setDepth(EntityDepthFunctions.PLAYER_DEPTH(this.y));

        this.setRotation(camera_rotation);

        // now send the player state over
        const state = {
            x: this.x,
            y: this.y,
            velocity: [vel.x, vel.y],
            is_shooting: this.weapon?.isShooting || false,
            looking: this.looking(),
            inventory: [0],
            damage_dealt: this.damage_dealt,
        };

        socket.emit("PLAYER_STATE", state);

        // once data is sent, we can reset the damage_dealt object.
        this.damage_dealt = {};
    }
}
