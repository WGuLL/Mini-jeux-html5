
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

    	// ---- ENEMIES
    	aliens = game.add.group();
    	aliens.enableBody = true;
    	aliens.physicsBodyType = Phaser.Physics.ARCADE;

    	this.createAliens();
	},



	//Fonction exécutée en continu
	update: function() {
		//Défilement du background
	    game.background.tilePosition.x -= 10;

        //Vitesse nulle en attente de commande
        this.ship.body.velocity.setTo(0, 0);
        //Fleche gauche
        if (cursors.left.isDown)
        {
           	this.ship.body.velocity.x = -200;
        }
        //Fleche droite
	    else if (cursors.right.isDown)
    	{
            this.ship.body.velocity.x = 200;
        }
        else
        {
       		this.ship.body.velocity.x = -80;
        }
        //Fleche haute
        if (cursors.up.isDown)
        {
           	this.ship.body.velocity.y = -200;
        }
        //Fleche bas
	    else if (cursors.down.isDown)
    	{
            this.ship.body.velocity.y = 200;
        }

        //  Firing?
        if (fireButton.isDown)
        {
	        this.fireLaser();
    	}
	},

	//Fonction créant les aliens
	createAliens: function () {
	    for (var x = 0; x < 10; x++)
        {
	        var alien = aliens.create(x * 100, 100, 'invader');
    	    alien.anchor.setTo(0.5, 0.5);
           	alien.body.moves = false;
    	   	alien.scale.setTo(0.5,0.5);
        }

    	aliens.x = 100;
    	aliens.y = 50;
	},

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
            	laser.body.velocity.x = 400;
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