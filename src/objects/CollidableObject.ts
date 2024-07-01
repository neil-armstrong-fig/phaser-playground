import 'phaser';

export default class CollidableObject extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'CollidableObject');
    scene.add.existing(this);

    scene.physics.add.existing(this);

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      const body = this.body;

      body.setGravity(0, 0); // Disable gravity for this object
      body.setBounce(0.8, 0.8); // Enable bouncing
      body.setDrag(50,50)
      body.setImmovable(false); 
    }

    this.setInteractive();
    this.setCollideWorldBounds(true);
  }
}
