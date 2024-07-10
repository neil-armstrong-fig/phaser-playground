import { Scene } from "phaser";

export class GameOver extends Scene {
	camera: Phaser.Cameras.Scene2D.Camera;
	background: Phaser.GameObjects.Image;
	gameover_text: Phaser.GameObjects.Text;
	finalScore_text: Phaser.GameObjects.Text;
	finalScore: number;

	constructor() {
		super("GameOver");
	}

	// biome-ignore lint/suspicious/noExplicitAny: honestly, i couldn't get this to reference the FinalScore type for ScoreManager to save my life.
	init(data: any) {
		this.finalScore = data.finalScore;
	}

	create() {
		this.camera = this.cameras.main;
		this.camera.setBackgroundColor(0xff0000);

		this.background = this.add.image(512, 384, "background");
		this.background.setAlpha(0.5);

		this.gameover_text = this.add.text(512, 384, "Game Over", {
			fontFamily: "Arial Black",
			fontSize: 64,
			color: "#ffffff",
			stroke: "#000000",
			strokeThickness: 8,
			align: "center",
		});
		this.gameover_text.setOrigin(0.5);

		this.finalScore_text = this.add.text(
			512,
			384,
			`Final Score: ${this.finalScore}`,
			{
				fontFamily: "Arial Black",
				fontSize: 64,
				color: "#ffffff",
				stroke: "#000000",
				strokeThickness: 8,
				align: "center",
			},
		);
		this.finalScore_text.setOrigin(0.5, -1.5);

		this.input.once("pointerdown", () => {
			this.scene.start("MainMenu");
		});
	}
}
