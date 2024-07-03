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

	private lastMovementTimes: Map<Phaser.GameObjects.GameObject, number>;
	private lastPositions: Map<
		Phaser.GameObjects.GameObject,
		{ x: number; y: number }
	>;
	private readonly checkInterval: number = 2500; // 2.5 seconds in milliseconds
	finalScore: number;

	constructor() {
		super("Game");
		this.lastMovementTimes = new Map();
		this.lastPositions = new Map();
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
		this.lastMovementTimes.set(this.launchableObject, this.time.now);
		this.lastPositions.set(this.launchableObject, {
			x: this.launchableObject.x,
			y: this.launchableObject.y,
		});

		this.collidableObjects = this.physics.add.group();

		const positions = [
			{ x: 500, y: 300 },
			{ x: 700, y: 400 },
			{ x: 900, y: 500 },
		];

		for (const pos of positions) {
			const collidableObject = new CollidableObject(this, pos.x, pos.y);
			this.collidableObjects.add(collidableObject);
			this.lastMovementTimes.set(collidableObject, this.time.now);
			this.lastPositions.set(collidableObject, {
				x: collidableObject.x,
				y: collidableObject.y,
			});
		}

		this.configureCollidableObjects();

		this.physics.add.collider(
			this.launchableObject,
			this.collidableObjects,
			(launchableObject, collidableObjects) => {
				if (launchableObject.body.touching && collidableObjects.body.touching) {
					console.log("green on red hit!");
					this.scoreManager.increaseScore(10);
				}
			},
		);

		this.physics.add.collider(
			this.collidableObjects,
			this.collidableObjects,
			(collidableObject) => {
				if (collidableObject.body.touching && collidableObject.body.touching) {
					console.log("red on red hit!");
					this.scoreManager.increaseScore(5);
				}
			},
		);

		this.physics.world.createDebugGraphic();

		this.time.addEvent({
			delay: this.checkInterval,
			callback: this.checkMovement,
			callbackScope: this,
			loop: true,
		});
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
		this.scoreManager.updateScoreText();
		this.updateMovementTimes();
	}

	private updateMovementTimes() {
		const children = this.collidableObjects.getChildren();

		for (let i = 0; i < children.length; i++) {
			const obj = children[i] as Phaser.Physics.Arcade.Sprite;
			const lastPos = this.lastPositions.get(obj) || { x: obj.x, y: obj.y };
			if (obj.x !== lastPos.x || obj.y !== lastPos.y) {
				this.lastMovementTimes.set(obj, this.time.now);
				this.lastPositions.set(obj, { x: obj.x, y: obj.y });
			}
		}

		const launchableLastPos = this.lastPositions.get(this.launchableObject) || {
			x: this.launchableObject.x,
			y: this.launchableObject.y,
		};

		if (
			this.launchableObject.x !== launchableLastPos.x ||
			this.launchableObject.y !== launchableLastPos.y
		) {
			this.lastMovementTimes.set(this.launchableObject, this.time.now);
			this.lastPositions.set(this.launchableObject, {
				x: this.launchableObject.x,
				y: this.launchableObject.y,
			});
		}
	}

	private checkMovement() {
		const currentTime = this.time.now;
		let movementDetected = false;

		for (const [, lastMoveTime] of this.lastMovementTimes) {
			if (currentTime - lastMoveTime <= this.checkInterval) {
				movementDetected = true;
				break; // No need to continue if movement is detected
			}
		}

		if (!movementDetected) {
			console.log("No movement detected in the last 2.5 seconds.");
			this.scene.stop('Game')	
			this.scene.start("GameOver", {finalScore: this.scoreManager.getScore()});
		}

		const lastLaunchableMoveTime = this.lastMovementTimes.get(
			this.launchableObject,
		);
		if (
			lastLaunchableMoveTime &&
			currentTime - lastLaunchableMoveTime > this.checkInterval
		) {
			console.log(
				"Launchable object has not been moved:",
				this.launchableObject,
			);
		} else {
			console.log(
				"The launchable object has been moved in the last 2.5 seconds.",
			);
		}
	}
}
