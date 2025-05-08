class Game_Over extends Phaser.Scene{
    constructor(){
        super("game_over");
    }
    preload(){

    }
    create(){
        //fully load font from html link before displaying
        document.fonts.ready.then(() => {
            this.titleText = this.add.text(40, 80, 'Game Over', {
                fontFamily: '"Press Start 2P"',
                fontSize: '64px',
                fill: '#00ff00'
            });
            

            this.playAgainText = this.add.text(40, 300, 'Play Again?', {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                fill: '#00ff00'
            }).setInteractive();

            this.playAgainText.on('pointerdown', () => {
                this.scene.stop("level_one"); // Stop game
                this.scene.start("level_one");
            });

            this.mainMenuText = this.add.text(40, 500, 'Main Menu', {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                fill: '#00ff00'
            }).setInteractive();

            this.mainMenuText.on('pointerdown', () => {
                this.scene.stop("level_one"); // Stop game
                this.scene.start("menu"); // Go to main menu
            });

        });

        document.getElementById('description').innerHTML = '<h2>Click to select</h2>';

    }
    update(){

    }
}