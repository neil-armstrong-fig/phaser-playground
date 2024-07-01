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

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);

    this.background = this.add.image(512, 384, "background");
    this.fpsText = new FpsText(this)
    this.background.setAlpha(0.5);

    this.launchableObject = new LaunchableObject(this, this.cameras.main.width / 4, this.cameras.main.height / 2);
  
    this.collidableObject = new CollidableObject(this, 500, 300);
  }

  update() {
    this.fpsText.update();
  }
}
