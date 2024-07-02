export default class ScoreManager {
	private scene: Phaser.Scene;
	private score: number;
	private scoreText: Phaser.GameObjects.Text;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.score = 0;
		this.createScoreText();
	}

	private createScoreText() {
		this.scoreText = this.scene.add
			.text(10, 10, `Score: ${this.score}`, {
				fontSize: "24px",
				color: "#ffffff",
			})
			.setOrigin(0, -2);
	}

	public increaseScore(points: number) {
		this.score += points;
	}

	public updateScoreText() {
		this.scoreText.setText(`Score: ${this.score}`);
	}

	public getScore(): number {
		return this.score;
	}
}
