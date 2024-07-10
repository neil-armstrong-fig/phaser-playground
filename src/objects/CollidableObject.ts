import "phaser";

export default class CollidableObject extends Phaser.GameObjects.Sprite {
	declare body: Phaser.Physics.Arcade.Body;

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, "CollidableObject");
		scene.add.existing(this);
		scene.physics.add.existing(this);
	}

	public setProperties(): void {
		this.body.setGravity(0, 0);
		this.body.setBounce(0.8, 0.8);
		this.body.setDrag(50, 50);
		this.body.setAngularDrag(180);
		this.body.setImmovable(false);
		this.body.setCollideWorldBounds(true);

		this.setInteractive();
	}
}
