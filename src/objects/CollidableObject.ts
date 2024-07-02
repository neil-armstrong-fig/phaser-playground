import "phaser";

export default class CollidableObject extends Phaser.Physics.Arcade.Sprite {
	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, "CollidableObject");
		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.setGravity(0, 0);
		this.setBounce(0.8, 0.8);
		this.setDrag(50, 50);
		this.setImmovable(false);
		this.setCollideWorldBounds(true);
		this.setInteractive();
	}
}
