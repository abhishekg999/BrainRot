import Phaser from 'phaser'

import WorldScene from './WorldScene';
import { socket } from './Networking'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1024,
	height: 576,
	physics: {
		default: "arcade",
		arcade: {
			debug: true,
		},
	},
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	scene: [WorldScene],
	backgroundColor: '#000000',
	pixelArt: true,
};


const game = new Phaser.Game(config);
const sock = socket;
