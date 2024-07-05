import "phaser";
import LaunchableObject from "./LaunchableObject"; // Ensure the correct path is used

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
