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
	collidableObject: CollidableObject;
	collidableObjects: Phaser.Physics.Arcade.Group;
	scoreManager: ScoreManager;
	private launchableObjectFactory: LaunchableObjectFactory;
	private maxLaunchableObjects = 1;
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
		this.camera = this.cameras.main;
		this.camera.setBackgroundColor(0x00ff00);
		this.background = this.add.image(512, 384, "background");
		this.background.setAlpha(0.5);

		this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
		this.fpsText = new FpsText(this);
		this.scoreManager = new ScoreManager(this);

		this.launchableObjectFactory = new LaunchableObjectFactory(this);
		this.spawnInitialLaunchableObjects();

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
			this.launchableObjects,
			this.collidableObjects,
			(launchableObject: Phaser.Physics.Arcade.Sprite, collidableObjects: Phaser.Physics.Arcade.Sprite) => {
				if (launchableObject.body.touching && collidableObjects.body.touching) {
					this.handleCollision(launchableObject, collidableObjects);
					console.log("green on red hit!");
					this.scoreManager.increaseScore(10);
				}
			}
		);

		this.physics.add.collider(
			this.collidableObjects,
			this.collidableObjects,
			(collidableObject: Phaser.Physics.Arcade.Sprite) => {
				if (collidableObject.body.touching && collidableObject.body.touching) {
					this.handleCollision(collidableObject, collidableObject);
					console.log("red on red hit!");
					this.scoreManager.increaseScore(5);
				}
			}
		);

		this.physics.world.createDebugGraphic();

		this.time.addEvent({
			delay: this.checkInterval,
			callback: this.checkMovement,
			callbackScope: this,
			loop: true,
		});

		//this.time.addEvent({
		//	delay: 1000,
		//	callback: this.spawnNewLaunchableObjectIfNecessary,
		//	callbackScope: this,
		//	loop: true,
		//});
	}

	private spawnInitialLaunchableObjects(): void {
		const launchableObject1 = this.launchableObjectFactory.create(
			this.cameras.main.width / 4,
			this.cameras.main.height / 2
		);
		this.launchableObjects.push(launchableObject1);
		this.lastMovementTimes.set(launchableObject1, this.time.now);
		this.lastPositions.set(launchableObject1, {
			x: launchableObject1.x,
			y: launchableObject1.y,
		});

		const launchableObject2 = this.launchableObjectFactory.create(
			this.cameras.main.width / 2,
			this.cameras.main.height / 2
		);
		this.launchableObjects.push(launchableObject2);
		this.lastMovementTimes.set(launchableObject2, this.time.now);
		this.lastPositions.set(launchableObject2, {
			x: launchableObject2.x,
			y: launchableObject2.y,
		});
	}

	private spawnNewLaunchableObjectIfNecessary(): void {
		const firstLaunchableObject = this.launchableObjects[0];

		if (firstLaunchableObject.hasInteracted && this.launchableObjects.length < this.maxLaunchableObjects) {
			const newLaunchableObject = this.launchableObjectFactory.create(
				this.cameras.main.width / 4,
				this.cameras.main.height / 2
			);
			this.launchableObjects.push(newLaunchableObject);
			this.lastMovementTimes.set(newLaunchableObject, this.time.now);
			this.lastPositions.set(newLaunchableObject, {
				x: newLaunchableObject.x,
				y: newLaunchableObject.y,
			});
		}
	}

	configureCollidableObjects(): void {
		for (const collidableObject of this.collidableObjects.getChildren() as CollidableObject[]) {
			collidableObject.setGravity(0, 0);
			collidableObject.setBounce(0.8, 0.8);
			collidableObject.setDrag(50, 50);
			collidableObject.setAngularDrag(180); 
			collidableObject.setImmovable(false);
			collidableObject.setCollideWorldBounds(true);
			collidableObject.setInteractive();
		}
	}

	update(): void {
		this.fpsText.update();
		this.scoreManager.updateScoreText();
		this.updateMovementTimes();
	}

	private handleCollision(object1: Phaser.Physics.Arcade.Sprite, object2: Phaser.Physics.Arcade.Sprite): void {
		// Identify the types of the objects involved in the collision
		const isObject1Launchable = this.launchableObjects.includes(object1 as LaunchableObject);
		const isObject2Launchable = this.launchableObjects.includes(object2 as LaunchableObject);
	
		const isObject1Collidable = this.collidableObjects.contains(object1);
		const isObject2Collidable = this.collidableObjects.contains(object2);
	
		// Ensure at least one of the objects is launchable or both are collidable
		if ((isObject1Launchable || isObject2Launchable) || (isObject1Collidable && isObject2Collidable)) {
			const primaryObject = isObject1Launchable ? object1 : object2;
			const secondaryObject = isObject1Launchable ? object2 : object1;
	
			// Calculate the impact point relative to the secondary object's center
			const impactPoint = new Phaser.Math.Vector2(
				primaryObject.body.x + primaryObject.body.halfWidth,
				primaryObject.body.y + primaryObject.body.halfHeight
			);
	
			const secondaryCenter = new Phaser.Math.Vector2(
				secondaryObject.body.x + secondaryObject.body.halfWidth,
				secondaryObject.body.y + secondaryObject.body.halfHeight
			);
	
			const impactVector = impactPoint.subtract(secondaryCenter);
			const forceMagnitude = primaryObject.body.velocity.length();
			const torque = impactVector.length() * forceMagnitude;
	
			// Adjust the multiplier for desired angular velocity
			const angularVelocity = torque * 0.01;
	
			// Apply angular velocity to the secondary object
			secondaryObject.setAngularVelocity(angularVelocity);
	
			// Update the score based on the types of objects involved
			if (isObject1Launchable || isObject2Launchable) {
				console.log("green on red hit!");
				this.scoreManager.increaseScore(10);
			} else if (isObject1Launchable && isObject2Launchable) {
				console.log("green on green hit!");
				this.scoreManager.increaseScore(15);

			} else {
				console.log("red on red hit!");
				this.scoreManager.increaseScore(5);
			}
		}
	}

	private updateMovementTimes(): void {
		const children = this.collidableObjects.getChildren();

		for (let i = 0; i < children.length; i++) {
			const obj = children[i] as Phaser.Physics.Arcade.Sprite;
			const lastPos = this.lastPositions.get(obj) || { x: obj.x, y: obj.y };
			if (obj.x !== lastPos.x || obj.y !== lastPos.y) {
				this.lastMovementTimes.set(obj, this.time.now);
				this.lastPositions.set(obj, { x: obj.x, y: obj.y });
			}
		}

		for (const launchableObject of this.launchableObjects) {
			const launchableLastPos = this.lastPositions.get(launchableObject) || {
				x: launchableObject.x,
				y: launchableObject.y,
			};

			if (
				launchableObject.x !== launchableLastPos.x ||
				launchableObject.y !== launchableLastPos.y
			) {
				this.lastMovementTimes.set(launchableObject, this.time.now);
				this.lastPositions.set(launchableObject, {
					x: launchableObject.x,
					y: launchableObject.y,
				});
			}
		}
	}

	private checkMovement(): void {
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
			this.scene.stop("Game");
			this.scene.start("GameOver", {
				finalScore: this.scoreManager.getScore(),
			});
		}

		for (const launchableObject of this.launchableObjects) {
			const lastLaunchableMoveTime = this.lastMovementTimes.get(launchableObject);
			if (
				lastLaunchableMoveTime &&
				currentTime - lastLaunchableMoveTime > this.checkInterval
			) {
				console.log("Launchable object has not been moved. Spawning new launchable object")
				this.spawnNewLaunchableObjectIfNecessary();
			} else {
				console.log("The launchable object has been moved in the last 2.5 seconds.");
			}
		}
	}
}
