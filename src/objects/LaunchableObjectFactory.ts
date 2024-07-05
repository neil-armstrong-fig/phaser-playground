import "phaser";
import LaunchableObject from "./LaunchableObject";

export default class LaunchableObjectFactory {
	private scene: Phaser.Scene;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
	}

	create(x: number, y: number): LaunchableObject {
		const launchableObject = new LaunchableObject(this.scene, x, y);
		return launchableObject;
	}
}
