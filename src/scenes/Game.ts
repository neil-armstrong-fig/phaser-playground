import { Scene } from "phaser";
import FpsText from "../objects/fpsText";
import LaunchableObject from "../objects/LaunchableObject";
import CollidableObject from "../objects/CollidableObject";
import ScoreManager from "../objects/ScoreManager";

export class Game extends Scene {
	camera: Phaser.Cameras.Scene2D.Camera;
	background: Phaser.GameObjects.Image;
	fpsText: FpsText;
	launchableObject: LaunchableObject;
	collidableObject: CollidableObject;
	collidableObjects: Phaser.Physics.Arcade.Group;
	scoreManager: ScoreManager;

	constructor() {
		super("Game");
	}

	create() {
		this.camera = this.cameras.main;
		this.camera.setBackgroundColor(0x00ff00);
		this.background = this.add.image(512, 384, "background");
		this.background.setAlpha(0.5);

		this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
		this.fpsText = new FpsText(this);
		this.scoreManager = new ScoreManager(this);

		this.launchableObject = new LaunchableObject(
			this,
			this.cameras.main.width / 4,
			this.cameras.main.height / 2,
		);

		this.collidableObjects = this.physics.add.group();

		// Add multiple CollidableObjects to the group
		const positions = [
			{ x: 500, y: 300 },
			{ x: 700, y: 400 },
			{ x: 900, y: 500 },
		];

		for (const pos of positions) {
			const collidableObject = new CollidableObject(this, pos.x, pos.y);
			this.collidableObjects.add(collidableObject);
		}

		this.configureCollidableObjects();

		this.physics.add.collider(this.launchableObject, this.collidableObjects);
		this.physics.add.collider(this.collidableObjects, this.collidableObjects);

		// Debugging to figure out world bounds
		this.physics.world.createDebugGraphic();
	}

	configureCollidableObjects() {
		for (const collidableObject of this.collidableObjects.getChildren() as CollidableObject[]) {
			collidableObject.setGravity(0, 0);
			collidableObject.setBounce(0.8, 0.8);
			collidableObject.setDrag(50, 50);
			collidableObject.setImmovable(false);
			collidableObject.setCollideWorldBounds(true);
			collidableObject.setInteractive();
		}
	}

	update() {
		this.fpsText.update();
	}
}
