class Level_One extends Phaser.Scene{
    constructor(){
        super("level_one");
        this.my = {sprite: {}};
        this.my.sprite.bullets = [];
        this.my.sprite.enemies = [];
        this.my.sprite.enemyBullets = [];
        this.waveCounter = 0;
        this.playerScore = 0;
        this.maxhealth = 5;
        this.playerHealth = this.maxhealth;
        this.healthIcons = [];
        this.playerX = 500;
        this.playerY = 950;
        this.waitingForWave = false;
        this.enemyPositions = [
            [250, 20], [350, 20], [450, 20], [550, 20], [650, 20], [750, 20],
                        [350, 70], [450, 70], [550, 70], [650, 70],
                                    [450, 120], [550, 120],
                                          [500, 170]
        ]
    }
    //------------------------------------------------------ PRELOAD -----------------------------------------------------------------
    preload(){
        if (!this.textures.exists('player')){
            this.load.setPath("./assets/");
            this.load.image("player", "ship_0005.png");
            this.load.image("bullet", "tile_0000.png");
            this.load.image("enemyShip", "enemy_ship.png");
            this.load.image("enemyShip2", "enemy_ship2.png");
            this.load.image("laser", "laserGreen.png");
            this.load.image("enemyElite", "enemyElite.png");
            this.load.image("bomb", "bomb.png");
            this.load.audio("playerBullet", "SoundShootRegular.wav");
            this.load.audio("enemyBullet", "laserSmall_003.ogg");
            this.load.audio("playerEngine", "engineCircular_001.ogg");
            this.load.audio("enemyDestroyed", "SoundCoin.wav");
            this.load.audio("enemyMissile", "SoundMissile.wav");
            this.load.audio("playerDeath", "SoundDeath.wav");
        }
        
    }
    //------------------------------------------------------ CREATE -----------------------------------------------------------------
    create(){
        // only initialize game after textures have been loaded
        this.initializeGame();
    }
    //------------------------------------------------------ UPDATE -----------------------------------------------------------------
    update(){
        // Only run if scene is active
        if (!this.scene.isActive()) return;
    
        // Add safety checks for player
        if (!this.my.sprite.player?.active) return;

        let my = this.my;
        // movement left
        if(this.leftKey.isDown){
            this.my.sprite.player.x -= 10;
            if (this.my.sprite.player.x < 0){
                this.my.sprite.player.x = 0;
            }
        }
        // movement right
        if(this.rightKey.isDown){
            this.my.sprite.player.x += 10;
            if (this.my.sprite.player.x > 1000){
                this.my.sprite.player.x = 1000;
            }
        }
        // function that handles player bullets
        this.updateBullets();

        // function that handles enemy bullets (crazy right?) 
        this.updateEnemyBullets();

        // checks if enemy is in a postion to attack
        this.checkAttack();

        // if no enemies left -> spawn new wave of enemies
        if(my.sprite.enemies.length == 0 && !this.waitingForWave){
            this.waitingForWave = true;
                this.time.delayedCall(500, ()=>{
                this.spawnWave();
                console.log("update wave spawned"); // ------------------------------------------------------------------------------------------debugg
                this.waitingForWave = false;
                this.waveCounter++;
                if(this.waveCounter % 3 == 0){
                    this.spawnEliteWave();
                }
            });
        }
        console.log(this.my.sprite.enemies.length);
    }

    //------------------------------------------------------ SHUTDOWN -----------------------------------------------------------------
    shutdown() {
        // Clean up objects
        this.time.removeAllEvents();
        this.tweens.killAll();

        // stop engine background noise
        this.sounds.engine.stop();
        this.waitingForWave = false;
        
        // Clear all sprites safely
        const destroyAll = (arr) => {
            if (!arr) return;
            arr.forEach(obj => {
                if (obj?.destroy) obj.destroy();
            });
        };
        
        destroyAll(this.my.sprite.bullets);
        destroyAll(this.my.sprite.enemies);
        destroyAll(this.my.sprite.enemyBullets);
        
        if (this.my.sprite.player?.destroy) this.my.sprite.player.destroy();
        
        // Reset arrays
        this.my.sprite.bullets = [];
        this.my.sprite.enemies = [];
        this.my.sprite.enemyBullets = [];

        // reset player health
        this.maxhealth = 5;
        this.playerHealth = this.maxhealth;
        
        // Clear keyboard listeners
        this.input.keyboard.off('keydown-SPACE');
        console.log("shutdown was called!");
        console.log("enemies: " + this.my.sprite.enemies.length);
    }

    //------------------------------------------------------ FUNCTIONS -----------------------------------------------------------------

    initializeGame(){
        let my = this.my;

        this.waitingForWave = false;
        this.playerScore = 0;

        // create sounds
        this.sounds = {
            shoot: this.sound.add("playerBullet"),
            laser: this.sound.add("enemyBullet"),
            engine: this.sound.add("playerEngine"),
            missile: this.sound.add("enemyMissile"),
            enemyDeath: this.sound.add("enemyDestroyed"),
            playerDeath: this.sound.add("playerDeath")

        }
        this.sounds.engine.play({
            loop: true,
            volume: 0.1
        });
        // create player
        my.sprite.player = this.add.sprite(this.playerX, this.playerY, "player");
        my.sprite.player.setScale(2);
        // spawn wave of enemies
        this.spawnWave(); 
        console.log("initgame wave spawned"); //--------------------------------------------------------------------------------------------------debugg
        this.waveCounter++; // track how many waves have happened
        // keyboard input
        this.leftKey =  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey =  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.spaceKey =  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // listener for spacebar input to shoot
        this.input.keyboard.on('keydown-SPACE', () => {
            my.sprite.bullets.push(this.add.sprite(my.sprite.player.x, my.sprite.player.y, "bullet"));
            this.sounds.shoot.play();
        });
        // score text creation
        this.scoreText = this.add.text(850, 20, 'Score: 0',{
            fontFamily: 'Ariel',
            fontSize: '32px',
            fill: '#ffffff'
        });
        for (let i = 0; i < this.maxhealth; i++){
            let icon = this.add.image(20 + i *40, 30, "player");
            this.healthIcons.push(icon);
        }
        document.getElementById('description').innerHTML = '<h2>Arrow keys: move left/right <br> Space: shoot</h2>';
    }

    enemyAttack(enemy){
        if (!enemy || !enemy.active) return; // Safety check

        let attackPoints = [
            [enemy.x, enemy.y],
            [enemy.x+150, enemy.y+200],
            [enemy.x-200, enemy.y+400],
            [enemy.x+150, enemy.y+800],
            [enemy.x-50, enemy.y+1000] 
        ];

        let attackCurve = new Phaser.Curves.Spline(attackPoints);
        enemy.path = attackCurve;
        enemy.pathIndex = 0;
        enemy.startFollow({
            path: attackCurve,
            duration: 1500,
            rotateToPath: false,
            onComplete: ()=>{
                const index = this.my.sprite.enemies.indexOf(enemy);
                if (index > -1) {
                    this.my.sprite.enemies.splice(index, 1);
                }
                enemy.destroy();
            }
        })
    }
    checkAttack(){
        let my = this.my;
        // if enemy is roughly in line with player have enemy shoot
        let now = this.time.now;
        for (let enemy of this.my.sprite.enemies){
            if(Math.abs(enemy.x - this.my.sprite.player.x) < 10){
                if(!enemy.shootTimer || now - enemy.shootTimer > 1000){
                    this.enemyShoot(enemy);
                    enemy.shootTimer = now;
                }
            }
        }
    }

    enemyShoot(enemy){
        let enemyBullet = this.add.sprite(enemy.x, enemy.y, "laser").setFlipY(true).setScale(0.75);
        this.my.sprite.enemyBullets.push(enemyBullet)
        this.sounds.laser.play();
    }

    spawnWave(){
        let my = this.my;
        let delayCount = 300;
        let enemyIndex = 0;
        for(let [x, y] of this.enemyPositions){
            // boolean variable used to decide if enemies spawn left or right side of screen
            let fromLeft = Math.random() < 0.5;

            let startX = fromLeft? -100 : 1100; // offscreen either on the left of right side
            let startY = y;

            let controlX1 = fromLeft? x - 200 : x + 200;
            let controlY1 = startY + 200;

            let controlX2 = fromLeft? x - 100 : x + 100;
            let controlY2 = startY + 100;

            let path = new Phaser.Curves.Path(startX, startY);
            path.cubicBezierTo(controlX1, controlY1, controlX2, controlY2, 500, 170);
            /*
            if (!this.graphics) {
                this.graphics = this.add.graphics(); // only create once
                this.graphics.lineStyle(1, 0x00ff00, 0.4);
            }
            path.draw(this.graphics);
            */
            let enemy = this.add.follower(path, startX, startY, "enemyShip").setScale(0.5).setFlipY(true);
            enemy.shootTimer = 0;
            enemy.startFollow({
                duration: 2000,
                delay: enemyIndex * delayCount,
                rotateToPath: false,
                onComplete: () =>{
                    let delay = Phaser.Math.Between(2000, 8000);
                    this.time.delayedCall(delay, ()=>{
                        this.enemyAttack(enemy);
                    });
                    
                }
            });

            my.sprite.enemies.push(enemy);
            enemyIndex++;
        }
    }

    updateBullets(){
        if (!this.scene.isActive()) return;
        let my = this.my;
        // iterate over bullet array in reverse moving them up the screen
        for(let i = this.my.sprite.bullets.length-1; i >=0; i--){
            let bullet = my.sprite.bullets[i]; 
            bullet.y -= 20;

            // delete bullets that go off screen
            if(bullet.y < 0){
                bullet.destroy();
                // remove bullet from array and continue to stop checking that bullet
                my.sprite.bullets.splice(i, 1);
                continue;
            }
        

            // check if bullet collides with enemy
            let hit = false;
            for(let j = my.sprite.enemies.length-1; j >=0; j--){
                let enemy = my.sprite.enemies[j];
                if(Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), enemy.getBounds())){
                    bullet.destroy();
                    enemy.destroy();
                    my.sprite.bullets.splice(i, 1);
                    my.sprite.enemies.splice(j, 1);
                    this.sounds.enemyDeath.play() // play chime to signal enemy destroyed
                    if (enemy.isEliteRight){
                        this.playerScore += 10;
                        if(my.sprite.enemyEliteRight.missileTimer){
                            my.sprite.enemyEliteRight.missileTimer.remove(false);
                        }
                    }else if (enemy.isEliteLeft) {
                        this.playerScore += 10;
                        if(my.sprite.enemyEliteLeft.missileTimer){
                            my.sprite.enemyEliteLeft.missileTimer.remove(false);
                        }
                    }
                    else{
                        this.playerScore += 1;
                    }
                    this.scoreText.setText('Score: ' + this.playerScore);
                    hit = true;
                    break; // stop checking enemy that was just destroyed
                }
            }
            if (hit == true){
                continue; // stop checking bullet that just destroyed enemy
            }
        }
    }

    updateEnemyBullets(){
        let my = this.my;
         // move enemy bullets down the screen
         for(let i = this.my.sprite.enemyBullets.length-1; i >=0; i--){
            let bullet = my.sprite.enemyBullets[i]; 
            bullet.y += 20;

            // delete bullets that go off screen
            if(bullet.y > 1000){
                bullet.destroy();
                my.sprite.enemyBullets.splice(i, 1);
            }
            // check for collision with player
            if(Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), my.sprite.player.getBounds())){
                bullet.destroy();
                my.sprite.enemyBullets.splice(i, 1);
                this.playerHealth -= 1;
                this.sounds.playerDeath.play();
                if (this.healthIcons.length > 0){
                    let lostIcon = this.healthIcons.pop();
                    lostIcon.destroy();
                }
                if (this.playerHealth <= 0){
                    this.shutdown();
                    this.scene.start("game_over");
                }

            }
        }
    }
    spawnEliteWave(){
        let my = this.my;
        let rightPoints = [
            [1050, 50],
            [200, 200],
            [900, 300],
            [-50, 500]
        ]
        let leftPoints =[
            [-50, 50],
            [800, 200],
            [100, 300],
            [1050, 500]
        ]
        let rightCurve = new Phaser.Curves.Spline(rightPoints);
        let leftCurve = new Phaser.Curves.Spline(leftPoints);

        my.sprite.enemyEliteRight = this.add.follower(rightCurve, 1100, 200, "enemyElite").setScale(0.5).setFlipY(true);
        my.sprite.enemyEliteLeft = this.add.follower(leftCurve, -100, 200, "enemyElite").setScale(0.5).setFlipY(true);
        // used to differentiate enemies for scoring purposes
        my.sprite.enemyEliteRight.isEliteRight = true;
        my.sprite.enemyEliteLeft.isEliteLeft = true;

        // push into enemies array to handle collison
        my.sprite.enemies.push(my.sprite.enemyEliteRight);
        my.sprite.enemies.push(my.sprite.enemyEliteLeft);

        my.sprite.enemyEliteRight.missileTimer = this.time.addEvent({
            delay: 1200,
            callback: ()=>{
                this.shootMissile(my.sprite.enemyEliteRight);
            },
            loop: true
        });
        my.sprite.enemyEliteLeft.missileTimer = this.time.addEvent({
            delay: 3000,
            callback: ()=>{
                this.shootMissile(my.sprite.enemyEliteLeft);
            },
            loop: true
        })

        my.sprite.enemyEliteRight.startFollow({
            duration: 3000,
            rotateToPath: false,
            onComplete: ()=>{
                if (my.sprite.enemyEliteRight.missileTimer){
                    my.sprite.enemyEliteRight.missileTimer.remove(false);
                }
            const index = my.sprite.enemies.indexOf(my.sprite.enemyEliteRight);
            if (index > -1) {
                my.sprite.enemies.splice(index, 1);
            }
                my.sprite.enemyEliteRight.destroy();
                my.sprite.enemyEliteRight = null;
            }
        });
        my.sprite.enemyEliteLeft.startFollow({
            duration: 3000,
            rotateToPath: false,
            onComplete: ()=>{
                if(my.sprite.enemyEliteLeft.missileTimer){
                    my.sprite.enemyEliteLeft.missileTimer.remove(false);
                }
                const index = my.sprite.enemies.indexOf(my.sprite.enemyEliteLeft);
                if (index > -1) {
                    my.sprite.enemies.splice(index, 1);
                }
                my.sprite.enemyEliteLeft.destroy();
                my.sprite.enemyEliteLeft = null;
            }
        });
    }
    shootMissile(enemy){
        //create missile and add it to enemyBullets so it has collision
        let missile = this.add.sprite(enemy.x, enemy.y, "bomb").setScale(2).setFlipY(true);
        this.my.sprite.enemyBullets.push(missile);
        this.sounds.missile.play();

        // sends the missile towards the player
        this.tweens.add({
            targets: missile,
            x: this.my.sprite.player.x,
            y: this.my.sprite.player.y,
            rotateToPath: true,
            duration: 700,
            onComplete: ()=>{
                missile.destroy();
            }
        });
    }
}
