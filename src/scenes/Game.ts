import {Scene} from "phaser";
import FpsText from '../objects/fpsText';
import LaunchableObject from "../objects/LaunchableObject";
import CollidableObject from "../objects/CollidableObject";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  fpsText: FpsText;
  launchableObject: LaunchableObject;
  collidableObjects: Phaser.Physics.Arcade.Group;


  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);

    this.background = this.add.image(512, 384, "background");
    this.background.setAlpha(0.5);

    this.fpsText = new FpsText(this)
    this.launchableObject = new LaunchableObject(this, this.cameras.main.width / 4, this.cameras.main.height / 2);
  
    this.collidableObjects = this.physics.add.group({
      classType: CollidableObject,
      runChildUpdate: true,
    });

    // Add collidable objects to the group
    this.collidableObjects.add(new CollidableObject(this, 500, 300));
    this.collidableObjects.add(new CollidableObject(this, 700, 400));
    this.collidableObjects.add(new CollidableObject(this, 900, 500));

  this.physics.add.collider(
    this.launchableObject,
    this.collidableObjects,
  );

  this.physics.add.collider(
    this.collidableObjects,
    this.collidableObjects
  ); // I don't know why this looks weird, but it does
}

  update() {
    this.fpsText.update();
  }
}
