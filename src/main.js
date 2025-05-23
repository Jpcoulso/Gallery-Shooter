// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Cubey
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"
document.fonts.ready.then(() =>{
    // game config
    let config = {
        parent: 'phaser-game',
        type: Phaser.CANVAS,
        render: {
            pixelArt: true  // prevent pixel art from getting blurred when scaled
        },
        width: 1000,
        height: 1000,
        scene: [Menu, Level_One, Game_Over],
        fps: { forceSetTimeOut: true, target: 30 }
    }

    const game = new Phaser.Game(config);
});
