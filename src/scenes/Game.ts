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
  collidableObject: CollidableObject;
  collidableObjects: Phaser.Physics.Arcade.Group;

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);
    this.background = this.add.image(512, 384, "background");
    this.background.setAlpha(0.5);

    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
    this.fpsText = new FpsText(this)

    this.launchableObject = new LaunchableObject(this, this.cameras.main.width / 4, this.cameras.main.height / 2);
    this.collidableObject = new CollidableObject(this, 500, 300);
    this.collidableObject = new CollidableObject(this, 700, 300);
    this.collidableObject = new CollidableObject(this, 900, 300);


  this.physics.add.collider(
    this.launchableObject,
    this.collidableObject,
  );

 // I don't know why this looks weird, but it does
  this.physics.add.collider(
    this.collidableObject, 
    this.collidableObject
  );

  // Debugging to figure out world bounds
  this.physics.world.createDebugGraphic();
  }

  update() {
    this.fpsText.update();
  }
}