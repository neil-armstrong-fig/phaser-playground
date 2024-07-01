import 'phaser';

export default class LaunchableObject extends Phaser.Physics.Arcade.Sprite {
  private isDragging = false;
  private dragStartPoint: Phaser.Math.Vector2;
  private dragEndPoint: Phaser.Math.Vector2;
  private dragLine: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'LaunchableObject');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setInteractive();
    this.setCollideWorldBounds(true);
    scene.input.setDraggable(this);

    this.dragLine = scene.add.graphics();
    this.dragLine.lineStyle(2, 0x00ff00, 1);

    scene.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (gameObject === this) {
        this.isDragging = true;
        this.dragStartPoint = new Phaser.Math.Vector2(this.x, this.y);
      }
    });

    scene.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (this.isDragging) {
        this.dragLine.clear();
        this.dragLine.lineStyle(2, 0x00ff00, 1);
        this.dragLine.beginPath();
        this.dragLine.moveTo(this.dragStartPoint.x, this.dragStartPoint.y);
        this.dragLine.lineTo(pointer.x, pointer.y);
        this.dragLine.strokePath();
      }
    });

    scene.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.dragLine.clear();
        this.dragEndPoint = new Phaser.Math.Vector2(pointer.x, pointer.y);

        // Calculate the launch direction and power
        const dragVector = this.dragEndPoint.clone().subtract(this.dragStartPoint);
        const power = dragVector.length() * 3; // Adjust the multiplier for desired launch power
        const direction = dragVector.normalize(); // Normalized direction vector

        // Launch the object
        const launchVelocity = direction.scale(power);
        this.setVelocity(launchVelocity.x, launchVelocity.y);
      }
    });
  }
}