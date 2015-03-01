
// Variables qui nous permettront de savoir quand le jeu démarre ou quand il y a un GAME OVER
var GAME_START = false;
var GAME_OVER = false;

// Taille du jeu
const width = 900;
const height = 636;

// Création du jeu phaser
var game = new Phaser.Game(width, height, Phaser.AUTO, 'bomberman');

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
		game.load.image('background', 'img/BomberMap.jpg');
		//Chargement du personnage
		game.load.spritesheet('bomber', 'img/player.png', 62, 64);
		//Chargement des bombes
		game.load.image('bomb', 'img/Bomb.png');
		//Chargement des explosions
		game.load.spritesheet('fire', 'img/fire.png', 65,65);
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

		// ---- BOMBER
    	this.bomberA = game.add.sprite(100,game.height/2, 'bomber');
    	this.bomberA.anchor.setTo(0.5, 0.5);
    	game.physics.arcade.enable(this.bomberA);
    	this.bomberA.body.collideWorldBounds = true;
		
		//  Les différentes images de la sprite associée aux directions gauche et droite
		this.bomberA.animations.add('down', [0, 1, 2, 3], 10, true);
		this.bomberA.animations.add('left', [4, 5, 6, 7], 10, true);
		this.bomberA.animations.add('right', [8, 9, 10, 11], 10, true);
		this.bomberA.animations.add('up', [12, 13, 14, 15], 10, true);

    	//  And some controls to play the game with
    	cursors = game.input.keyboard.createCursorKeys();
    	fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    	// ---- BOMB
    	bombAs = game.add.group();
    	bombAs.enableBody = true;
    	bombAs.physicsBodyType = Phaser.Physics.ARCADE;
    	bombAs.createMultiple(30, 'bomb');
    	bombAs.setAll('anchor.x', 0.5);
    	bombAs.setAll('anchor.y', 1);
		
		//explosions group
		explosions = game.add.group();
		explosions.physicBodyType=Phaser.Physics.ARCADE;
    	explosions.createMultiple(30, 'fire');
		explosions.setAll('anchor.x', 0.5);
    	explosions.setAll('anchor.y', 1);
		explosions.setAll('animations.add','explodes');
	},

	//Fonction exécutée en continu
	update: function() {
        //Vitesse nulle en attente de commande
        this.bomberA.body.velocity.setTo(0, 0);
        //Fleche gauche
        if (cursors.left.isDown)
        {
           	this.bomberA.body.velocity.x = -200;
			this.bomberA.animations.play('left');
        }
        //Fleche droite
	    else if (cursors.right.isDown)
    	{
            this.bomberA.body.velocity.x = 200;
			this.bomberA.animations.play('right');
        }
        //Fleche haute
        else if (cursors.up.isDown)
        {
           	this.bomberA.body.velocity.y = -200;
			this.bomberA.animations.play('up');
        }
        //Fleche bas
	    else if (cursors.down.isDown)
    	{
            this.bomberA.body.velocity.y = 200;
			this.bomberA.animations.play('down');
        }
		else
		{
			//  Pose de face
			this.bomberA.animations.stop();
			//Image 4 de la sprite
			this.bomberA.frame = 0;
		}
        //  bombing?
        if (fireButton.isDown)
        {
	        this.BombingA();
    	}
	},

    BombingA: function () {

    	//  To avoid them being allowed to fire too fast we set a time limit
   		if (game.time.now > fireRate)
    	{
        	//  Grab the first laser we can from the pool
        	bombA = bombAs.getFirstExists(false);

        	if (bombA)
        	{
            	//  And fire it
            	bombA.reset(this.bomberA.x, this.bomberA.y + 45);
            	fireRate = game.time.now + 1000;
				game.time.events.add(Phaser.Timer.SECOND * 4, this.Explodes, this, bombA);
        	}
    	}
	},
	Explodes: function (bomb) {
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x,bomb.y);
			explosion.animations.play('explodes',10,true);
			game.time.events.add(500, this.EndExplodes, this, explosion);
		}
		//detonation droite
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x - 55,bomb.y);
			explosion.animations.play('explodes',10,true);
			game.time.events.add(500, this.EndExplodes, this, explosion);
		}
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x - 110,bomb.y);
			explosion.animations.play('explodes',10,true);
			game.time.events.add(500, this.EndExplodes, this, explosion);
		}
		//detonation gauche
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x + 55,bomb.y);
			explosion.animations.play('explodes',10,true);
			game.time.events.add(500, this.EndExplodes, this, explosion);
		}
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x + 110,bomb.y);
			explosion.animations.play('explodes',10,true);
			game.time.events.add(500, this.EndExplodes, this, explosion);
		}
		//detonation haut
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x,bomb.y - 55);
			explosion.animations.play('explodes',10,true);
			game.time.events.add(500, this.EndExplodes, this, explosion);
		}
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x,bomb.y - 110);
			explosion.animations.play('explodes',10,true);
			game.time.events.add(500, this.EndExplodes, this, explosion);
		}		
		//detonation bas
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x,bomb.y + 55);
			explosion.animations.play('explodes',10,true);
			game.time.events.add(500, this.EndExplodes, this, explosion);
		}
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x,bomb.y + 110);
			explosion.animations.play('explodes',10,true);
			game.time.events.add(500, this.EndExplodes, this, explosion);
		}
		//on enlève la bombe
		bombAs.remove(bomb);
	},
	EndExplodes: function (explosion) {
		explosions.remove(explosion);
	},
};

// On ajoute les 2 fonctions "gameState.load" et "gameState.main" à notre objet Phaser
game.state.add('load', gameState.load);
game.state.add('main', gameState.main);
// Il ne reste plus qu'à lancer l'état "load"
game.state.start('load');