class Menu extends Phaser.Scene{
    constructor(){
        super("menu");
    }
    preload(){

    }
    create(){
        //fully load font from html link before displaying
        document.fonts.ready.then(() => {
            this.titleText = this.add.text(40, 80, 'Invasion: 1932', {
                fontFamily: '"Press Start 2P"',
                fontSize: '64px',
                fill: '#00ff00'
            });
            

            this.playText = this.add.text(40, 300, 'Play', {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                fill: '#00ff00'
            });
        });
        
        this.spaceKey =  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        document.getElementById('description').innerHTML = '<h2>Press space to play</h2>';

    }
    update(){
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.launch('level_one');
            this.scene.stop('menu');
        }
    }
}