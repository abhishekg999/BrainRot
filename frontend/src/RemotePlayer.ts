/**
 * Remote player class represents another player playing in this world.
 * Should follow a similar interface, but the "input" will be coming from ws.
 */

import Phaser from "phaser";
import {RemoteActiveWeapon} from "./Weapon";
import { EntityDepthFunctions } from "./EntityDepths";

export default class RemotePlayer extends Phaser.Physics.Arcade.Sprite {
    weapon: RemoteActiveWeapon;
    shots: any;
    looking_angle: number;
    id: string;

    constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
        super(scene, x, y, "player");

        this.id = id;
        scene.add.existing(this);

        this.setDepth(EntityDepthFunctions.PLAYER_DEPTH(this.y));
        this.looking_angle = 0;

        // For now setting like this. This will be loaded from the server initially,
        // and can be later changed if the server decides to.
        this.weapon = new RemoteActiveWeapon(this, {
            fireInterval: 100,
            projectiles: [
              {
                max_duration: 250,
                damage: 250,
                speed: 180 / 2,
                shot_angle: 0
              },
            ]
          });
    }

    public looking(): number {
        return this.looking_angle;
    }

    update() {
        // @ts-ignore
        const camera_rotation = -this.scene.cameras.main.rotation;
        // update depth
        this.setDepth(EntityDepthFunctions.PLAYER_DEPTH(this.y));
        this.setRotation(camera_rotation);
    }
}
