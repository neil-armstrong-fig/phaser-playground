import {Boot} from "./scenes/Boot.ts";
import {Game as MainGame} from "./scenes/Game.ts";
import {GameOver} from "./scenes/GameOver.ts";
import {MainMenu} from "./scenes/MainMenu.ts";
import {Preloader} from "./scenes/Preloader.ts";

import {Game, type Types} from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#028af8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
};

export default new Game(config);
