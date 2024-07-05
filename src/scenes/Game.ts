import { Scene } from "phaser";
import FpsText from "../objects/fpsText";
import type LaunchableObject from "../objects/LaunchableObject";
import LaunchableObjectFactory from "../objects/LaunchableObjectFactory";
import CollidableObject from "../objects/CollidableObject";
import ScoreManager from "../objects/ScoreManager";

export class Game extends Scene {
	camera: Phaser.Cameras.Scene2D.Camera;
	background: Phaser.GameObjects.Image;
	fpsText: FpsText;
	launchableObjects: LaunchableObject[] = [];
	collidableObjects: Phaser.Physics.Arcade.Group;
	scoreManager: ScoreManager;
	private launchableObjectFactory: LaunchableObjectFactory;
	private maxLaunchableObjects = 2;
	private lastMovementTimes: Map<Phaser.GameObjects.GameObject, number>;
	private lastPositions: Map<Phaser.GameObjects.GameObject, { x: number; y: number }>;
	private readonly checkInterval: number = 2500; // 2.5 seconds in milliseconds
	finalScore: number;

	constructor() {
		super("Game");
		this.lastMovementTimes = new Map();
		this.lastPositions = new Map();
	}

	create(): void {
		this.initializeScene();
		this.initializeFactories();
		this.spawnInitialObjects();
		this.configureCollidableObjects();
		this.addCollisions();
		this.addTimers();
	}

	private initializeScene(): void {
		this.camera = this.cameras.main;
		this.camera.setBackgroundColor(0x00ff00);
		this.background = this.add.image(512, 384, "background").setAlpha(0.5);
		this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
		this.fpsText = new FpsText(this);
		this.scoreManager = new ScoreManager(this);
	}

	private initializeFactories(): void {
		this.launchableObjectFactory = new LaunchableObjectFactory(this);
	}

	private spawnInitialObjects(): void {
		this.spawnInitialLaunchableObjects();
		this.collidableObjects = this.physics.add.group();
		const positions = [
			{ x: 500, y: 200 },
			{ x: 700, y: 500 },
			{ x: 900, y: 600 },
		];
		for (const pos of positions) {
			this.addCollidableObject(pos.x, pos.y);
		}
	}

	private addCollidableObject(x: number, y: number): void {
		const collidableObject = new CollidableObject(this, x, y);
		this.collidableObjects.add(collidableObject);
		this.trackMovement(collidableObject);
	}

	private configureCollidableObjects(): void {
		for (const collidableObject of this.collidableObjects.getChildren() as CollidableObject[]) {
			collidableObject.setProperties();
		}
	}

	private addCollisions(): void {
		this.physics.add.collider(
			this.launchableObjects,
			this.collidableObjects,
			(launchableObject: LaunchableObject, collidableObject: CollidableObject) => {
				if (launchableObject.body.touching && collidableObject.body.touching) {
					this.handleCollision(launchableObject, collidableObject, 10);
					console.log("green on red hit!");
				}
			}
		);
		this.physics.add.collider(
			this.launchableObjects,
			this.launchableObjects,
			(launchableObject: LaunchableObject["body"]) => {
				if (launchableObject.body.touching && launchableObject.body.touching) {
					this.handleCollision(launchableObject, launchableObject, 15);
					console.log("green on green hit!");
				}
			}
		);
		this.physics.add.collider(
			this.collidableObjects,
			this.collidableObjects,
			(collidableObject: any) => {
				if (collidableObject.body.touching && collidableObject.body.touching) {
					this.handleCollision(collidableObject, collidableObject, 5);
					console.log("red on red hit!");
				}
			}
		);
	}

	private addTimers(): void {
		this.time.addEvent({
			delay: this.checkInterval,
			callback: this.checkMovement,
			callbackScope: this,
			loop: true,
		});

		this.time.addEvent({
			delay: 1000,
			callback: this.spawnNewLaunchableObjectIfNecessary,
			callbackScope: this,
			loop: true,
		});
	}

	private spawnInitialLaunchableObjects(): void {
		this.addLaunchableObject(this.cameras.main.width / 4, this.cameras.main.height / 2);
		this.addLaunchableObject(this.cameras.main.width / 2, this.cameras.main.height / 2);
	}

	private addLaunchableObject(x: number, y: number): void {
		const launchableObject = this.launchableObjectFactory.create(x, y);
		this.launchableObjects.push(launchableObject);
		this.trackMovement(launchableObject);
	}

	private trackMovement(obj: Phaser.GameObjects.GameObject): void {
		this.lastMovementTimes.set(obj, this.time.now);
		this.lastPositions.set(obj, { x: obj.x, y: obj.y });
	}

	private spawnNewLaunchableObjectIfNecessary(): void {
		if (this.shouldSpawnNewLaunchableObject()) {
			this.addLaunchableObject(this.cameras.main.width / 4, this.cameras.main.height / 2);
		}
	}

	private shouldSpawnNewLaunchableObject(): boolean {
		const firstLaunchableObject = this.launchableObjects[0];
		return firstLaunchableObject.hasInteracted && this.launchableObjects.length < this.maxLaunchableObjects;
	}

	private handleCollision(
		object1: typeof Phaser.Physics.Arcade,
		object2: Phaser.Physics.Arcade.Sprite,
		score: number
	): void {
		if (object1.body.touching && object2.body.touching) {
			this.handleCollisionEffects(object1, object2, score);
		}
	}

	private handleCollisionEffects(object1: Phaser.Physics.Arcade.Sprite, object2: Phaser.Physics.Arcade.Sprite, score: number): void {
		this.applyAngularVelocity(object1, object2);
		this.scoreManager.increaseScore(score);
	}

	private applyAngularVelocity(object1: Phaser.GameObjects.Sprite["Body"] , object2: Phaser.GameObjects.Sprite): void {
		const impactPoint = new Phaser.Math.Vector2(
			object1.body.x + object1.body.halfWidth,
			object1.body.y + object1.body.halfHeight
		);

		const secondaryCenter = new Phaser.Math.Vector2(
			object2.body.x + object2.body.halfWidth,
			object2.body.y + object2.body.halfHeight
		);

		const impactVector = impactPoint.subtract(secondaryCenter);
		const forceMagnitude = object1.body.velocity.length();
		const torque = impactVector.length() * forceMagnitude;
		const angularVelocity = torque * 0.01;

		object2.body.setAngularVelocity(angularVelocity);
	}

	private updateMovementTimes(): void {
		const children = this.collidableObjects.getChildren();
		for (const obj of children as Phaser.GameObjects.Sprite[]) {
			this.updateObjectMovementTime(obj);
		}

		for (const launchableObject of this.launchableObjects) {
			this.updateObjectMovementTime(launchableObject);
		}
	}

	private updateObjectMovementTime(obj: Phaser.GameObjects.Sprite): void {
		const lastPos = this.lastPositions.get(obj) || { x: obj.x, y: obj.y };
		if (obj.x !== lastPos.x || obj.y !== lastPos.y) {
			this.trackMovement(obj);
		}
	}

	private checkMovement(): void {
		const currentTime = this.time.now;

		if (!this.isMovementDetected(currentTime)) {
			this.endGame();
		}

		this.logLaunchableObjectMovement(currentTime);
	}

	private isMovementDetected(currentTime: number): boolean {
		for (const [, lastMoveTime] of this.lastMovementTimes) {
			if (currentTime - lastMoveTime <= this.checkInterval) {
				return true;
			}
		}
		return false;
	}

	private endGame(): void {
		console.log("No movement detected in the last 2.5 seconds.");
		this.scene.stop("Game");
		this.scene.start("GameOver", {
			finalScore: this.scoreManager.getScore(),
		});
	}

	private logLaunchableObjectMovement(currentTime: number): void {
		for (const launchableObject of this.launchableObjects) {
			const lastLaunchableMoveTime = this.lastMovementTimes.get(launchableObject);
			if (lastLaunchableMoveTime && currentTime - lastLaunchableMoveTime > this.checkInterval) {
				console.log("Launchable object has not been moved:", launchableObject);
			} else {
				console.log("The launchable object has been moved in the last 2.5 seconds.");
			}
		}
	}

	update(): void {
		this.fpsText.update();
		this.scoreManager.updateScoreText();
		this.updateMovementTimes();
	}
}
