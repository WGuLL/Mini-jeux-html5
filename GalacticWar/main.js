
// Variables qui nous permettront de savoir quand le jeu démarre ou quand il y a un GAME OVER
var GAME_START = false;
var GAME_OVER = false;

// Taille du jeu
const width = 1280;
const height = 720;

// Création du jeu phaser
var game = new Phaser.Game(width, height, Phaser.AUTO, 'timberman');

// On rend le background transparent
game.transparent = true;

// On déclare un objet gameState qui contiendra les états "load" et "main"
var gameState = {};
gameState.load = function() { };
gameState.main = function() { };

//Variable de jeu
var fireRate = 0;
var firingTimer =0;
var livingEnemies = [];

// Va contenir le code qui chargera les ressources ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤ - LOAD
gameState.load.prototype = {
	preload: function() {
	// Chargement des ressources
		// Chargement de l'image du background
		game.load.image('background', 'img/background.png');
		//Chargement du vaisseau
		game.load.image('ship', 'img/Spaceship.png');
		//Chargement des aliens
		game.load.image('invader', 'img/invader.png');
		//Chargement du tir
		game.load.image('laser', 'img/laser.png');
		game.load.image('enemylaser', 'img/enemyLaser.png');
        //Chargement de l'explosion
        game.load.spritesheet('kaboom', 'img/explosion.png', 256, 256);
	},

	create: function() {
		//On passe à l'état main
		game.state.start('main');
	}
};

// Va contenir le coeur du jeu ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤ - GAME
gameState.main.prototype = {

	create: function() {
		// Redimensionne le jeu se redimensionne selon la taille de l'écran (Pour les PC)
		//PROBLEME AVEC LA DERNIERE VERSION DE PHASER.MIN.JS
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setShowAll();
		window.addEventListener('resize', function () {
			game.scale.refresh();
		});
		game.scale.refresh();

		// Physique du jeu
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// Initialisation et intégration des ressources dans le Canvas
		// Création de l'arrière-plan dans le Canvas
		game.background = game.add.tileSprite(0, 0, game.width, game.height, 'background');

		// ---- SHIP
    	this.ship = game.add.sprite(100,game.height/2, 'ship');
    	this.ship.anchor.setTo(0.5, 0.5);
    	game.physics.arcade.enable(this.ship);
    	this.ship.body.collideWorldBounds = true;

        // ---- CONTROLS
    	//  And some controls to play the game with
    	cursors = game.input.keyboard.createCursorKeys();
    	fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    	// ---- LASERS
    	lasers = game.add.group();
    	lasers.enableBody = true;
    	lasers.physicsBodyType = Phaser.Physics.ARCADE;
    	lasers.createMultiple(30, 'laser');
    	lasers.setAll('anchor.x', 0.5);
    	lasers.setAll('anchor.y', 1);
    	lasers.setAll('outOfBoundsKill', true);
    	lasers.setAll('checkWorldBounds', true);

    	// ---- ENEMY LASERS
    	enemyLasers = game.add.group();
    	enemyLasers.enableBody = true;
    	enemyLasers.physicsBodyType = Phaser.Physics.ARCADE;
    	enemyLasers.createMultiple(30, 'enemylaser');
    	enemyLasers.setAll('anchor.x', 0.5);
    	enemyLasers.setAll('anchor.y', 1);
    	enemyLasers.setAll('outOfBoundsKill', true);
    	enemyLasers.setAll('checkWorldBounds', true);

        //  ---- EXPLOSIONS
        explosions = game.add.group();
        explosions.createMultiple(30, 'kaboom');
        explosions.forEach(this.setupInvader, this);

    	// ---- ENEMIES
    	aliens = game.add.group();
    	aliens.enableBody = true;
    	aliens.physicsBodyType = Phaser.Physics.ARCADE;
    	this.createAliens();

        // ---- LIVES
        lives = game.add.group();
        game.add.text(game.world.width - 250, 15, 'Lives :', { font: '34px Arial', fill: '#fff' });

        for (var i = 0; i < 3; i++) 
        {
            var ship = lives.create(game.world.width - 120 + (45 * i), 30, 'ship');
            ship.anchor.setTo(0.5, 0.5);
            ship.scale.setTo(0.5,0.5);
            ship.angle = 270;
            ship.alpha = 1;
        }
	},



	//Fonction exécutée en continu
	update: function() {
		//Défilement du background
	    game.background.tilePosition.x -= 10;

        //Vitesse nulle en attente de commande
        this.ship.body.velocity.setTo(0, 0);

        // ---- COMMANDES
        //Fleche gauche
        if (cursors.left.isDown)
           	this.ship.body.velocity.x = -200;
        //Fleche droite
	    else if (cursors.right.isDown)
            this.ship.body.velocity.x = 200;
        else
       		this.ship.body.velocity.x = -80;
        //Fleche haute
        if (cursors.up.isDown)
           	this.ship.body.velocity.y = -200;
        //Fleche bas
	    else if (cursors.down.isDown)
            this.ship.body.velocity.y = 200;
        //  Ship Firing?
        if (fireButton.isDown)
	        this.fireLaser();
        // Aliens firing !
        if (game.time.now > firingTimer)
            this.enemyFires();


        // ---- COLLISIONS
        //Lorsque qu'un tir touche un alien
        game.physics.arcade.overlap(lasers, aliens, this.killAlien, null, this);
        //Lorsque le vaisseau du joueur rentre dans un alien
        game.physics.arcade.overlap(this.ship, aliens, this.kamikaze, null, this);
        //Lorsqu'un alien touche le joueur
        game.physics.arcade.overlap(enemyLasers, this.ship, this.enemyHitsPlayer, null, this);
	},

	//Fonction créant les aliens
	createAliens: function () {
	    for (var y = 0; y < 7; y++)
        {
	        var alien = aliens.create(500,y * 100, 'invader');
    	    alien.anchor.setTo(0.5, 0.5);
           	alien.body.moves = false;
    	   	alien.scale.setTo(0.5,0.5);
            //Rotation des aliens en continu
            game.add.tween(alien).to( { angle: 360 }, 2500, Phaser.Easing.Linear.None, true, 0, 1000, false);
        }

    	aliens.x = 100;
    	aliens.y = 50;
	},

    //Associe une explosion à chaque alien
    setupInvader: function (invader) {

        invader.anchor.x = 0.5;
        invader.anchor.y = 0.5;
        invader.animations.add('kaboom');

    },

    //Fonction tuant les aliens
    killAlien: function (laser, alien) {
        //Erase alien and bullet
        alien.kill();
        laser.kill();

        //  And create an explosion
        var explosion = explosions.getFirstExists(false);
        explosion.scale.setTo(0.5, 0.5);
        explosion.reset(alien.body.x + 30, alien.body.y + 30);
        explosion.play('kaboom', 100, false, true);
    },

    //Fonction tuant les aliens et le joueur
    kamikaze: function (ship, alien) {
        alien.kill();
        ship.kill();
    },


    enemyFires: function () {
        //  Grab the first bullet we can from the pool
        enemyLaser = enemyLasers.getFirstExists(false);

        //On récupère le nombre d'ennemis vivants
        livingEnemies.length=0;
        aliens.forEachAlive(function(alien){
            // put every living enemy in an array
            livingEnemies.push(alien);
        }); 

        if (enemyLaser && livingEnemies.length > 0)
        {
        
            var random=game.rnd.integerInRange(0,livingEnemies.length-1);

            // randomly select one of them
            var shooter=livingEnemies[random];
            // And fire the bullet from this enemy
            enemyLaser.reset(shooter.body.x + 30, shooter.body.y + 30);

            game.physics.arcade.moveToObject(enemyLaser,this.ship,120);
            firingTimer = game.time.now + 1000;
        }
    },

    //Fonction de tir
    fireLaser: function () {

    	//  To avoid them being allowed to fire too fast we set a time limit
   		if (game.time.now > fireRate)
    	{
        	//  Grab the first laser we can from the pool
        	laser = lasers.getFirstExists(false);

        	if (laser)
        	{
            	//  And fire it
            	laser.reset(this.ship.x +50, this.ship.y + 30);
            	laser.body.velocity.x = 600;
            	fireRate = game.time.now + 400;
        	}
    	}
	},
};

// On ajoute les 2 fonctions "gameState.load" et "gameState.main" à notre objet Phaser
game.state.add('load', gameState.load);
game.state.add('main', gameState.main);
// Il ne reste plus qu'à lancer l'état "load"
game.state.start('load');