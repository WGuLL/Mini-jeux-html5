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
		//Chargement du personnage A
		game.load.spritesheet('bomberA', 'img/playerA.png', 62, 64);
		//Chargement du personnage B
		game.load.spritesheet('bomberB', 'img/playerB.png', 62, 64);
		//Chargement des bombes
		game.load.image('bomb', 'img/Bomb.png');
		//Chargement des explosions
		game.load.spritesheet('explodes', 'img/fire.png', 64,64);
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

		// ---- BOMBER A
    	this.bomberA = game.add.sprite(100,game.height/2, 'bomberA');
    	this.bomberA.anchor.setTo(0.5, 0.5);
    	game.physics.arcade.enable(this.bomberA);
    	this.bomberA.body.collideWorldBounds = true;
		//  Les différentes images de la sprite associée aux directions gauche et droite
		this.bomberA.animations.add('down', [0, 1, 2, 3], 10, true);
		this.bomberA.animations.add('left', [4, 5, 6, 7], 10, true);
		this.bomberA.animations.add('right', [8, 9, 10, 11], 10, true);
		this.bomberA.animations.add('up', [12, 13, 14, 15], 10, true);
		
		// ---- BOMBER B
    	this.bomberB = game.add.sprite(game.width - 100,game.height/2, 'bomberB');
    	this.bomberB.anchor.setTo(0.5, 0.5);
    	game.physics.arcade.enable(this.bomberB);
    	this.bomberB.body.collideWorldBounds = true;
		//  Les différentes images de la sprite associée aux directions gauche et droite
		this.bomberB.animations.add('down', [0, 1, 2, 3], 10, true);
		this.bomberB.animations.add('left', [4, 5, 6, 7], 10, true);
		this.bomberB.animations.add('right', [8, 9, 10, 11], 10, true);
		this.bomberB.animations.add('up', [12, 13, 14, 15], 10, true);
		

    	//  And some controls to play the game with
    	cursorsA = game.input.keyboard.createCursorKeys();
		cursorsB = {
			up: game.input.keyboard.addKey(Phaser.Keyboard.Z),
			down: game.input.keyboard.addKey(Phaser.Keyboard.S),
			left: game.input.keyboard.addKey(Phaser.Keyboard.Q),
			right: game.input.keyboard.addKey(Phaser.Keyboard.D),
		};
    	fireButtonA = game.input.keyboard.addKey(Phaser.Keyboard.M);
    	fireButtonB = game.input.keyboard.addKey(Phaser.Keyboard.A);

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
    	explosions.createMultiple(30, 'explodes');
		explosions.setAll('anchor.x', 0.5);
    	explosions.setAll('anchor.y', 1);
		explosions.forEach(function(item){
			 item.animations.add("kaboom");
		});
		//text
		this.ScoreA = 0;
		this.ScoreB = 0;
		this.ScoreText = "Score " + this.ScoreA+ " - " + this.ScoreB;
		this.style = { font: "35px Calibri", fill: "#ff2200", align: "left"};
		this.scoreText = game.add.text(game.world.centerX-100, 3, this.ScoreText, this.style);
	},

	//Fonction exécutée en continu
	update: function() {
	//BOMBER A
        //Vitesse nulle en attente de commande
        this.bomberA.body.velocity.setTo(0, 0);
        //Fleche gauche
        if (cursorsA.left.isDown)
        {
           	this.bomberA.body.velocity.x = -200;
			this.bomberA.animations.play('left');
        }
        //Fleche droite
	    else if (cursorsA.right.isDown)
    	{
            this.bomberA.body.velocity.x = 200;
			this.bomberA.animations.play('right');
        }
        //Fleche haute
        else if (cursorsA.up.isDown)
        {
           	this.bomberA.body.velocity.y = -200;
			this.bomberA.animations.play('up');
        }
        //Fleche bas
	    else if (cursorsA.down.isDown)
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
        if (fireButtonA.isDown)
        {
	        this.BombingA(this.bomberA);
    	}
	//BOMBER B
        //Vitesse nulle en attente de commande
        this.bomberB.body.velocity.setTo(0, 0);
        //Fleche gauche
        if (cursorsB.left.isDown)
        {
           	this.bomberB.body.velocity.x = -200;
			this.bomberB.animations.play('left');
        }
        //Fleche droite
	    else if (cursorsB.right.isDown)
    	{
            this.bomberB.body.velocity.x = 200;
			this.bomberB.animations.play('right');
        }
        //Fleche haute
        else if (cursorsB.up.isDown)
        {
           	this.bomberB.body.velocity.y = -200;
			this.bomberB.animations.play('up');
        }
        //Fleche bas
	    else if (cursorsB.down.isDown)
    	{
            this.bomberB.body.velocity.y = 200;
			this.bomberB.animations.play('down');
        }
		else
		{
			//  Pose de face
			this.bomberB.animations.stop();
			//Image 4 de la sprite
			this.bomberB.frame = 0;
		}
        //  bombing?
        if (fireButtonB.isDown)
        {
	        this.BombingA(this.bomberB);
    	}
	},

    BombingA: function (bomber) {
    	//  To avoid them being allowed to fire too fast we set a time limit
   		if (game.time.now > fireRate)
    	{
        	//  Grab the first laser we can from the pool
        	bombA = bombAs.getFirstExists(false);

        	if (bombA)
        	{
            	//  And fire it
            	bombA.reset(bomber.x, bomber.y + 45);
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
			explosion.animations.play('kaboom',10,false);
			game.time.events.add(500, this.EndExplodes, this, explosion);
			this.CheckForPlayerDeath(explosion);
		}
		//detonation droite
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x - 55,bomb.y);
			explosion.animations.play('kaboom',10,false);
			game.time.events.add(500, this.EndExplodes, this, explosion);
			this.CheckForPlayerDeath(explosion);
		}
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x - 110,bomb.y);
			explosion.animations.play('kaboom',10,false);
			game.time.events.add(500, this.EndExplodes, this, explosion);
			this.CheckForPlayerDeath(explosion);
		}
		//detonation gauche
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x + 55,bomb.y);
			explosion.animations.play('kaboom',10,false);
			game.time.events.add(500, this.EndExplodes, this, explosion);
			this.CheckForPlayerDeath(explosion);
		}
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x + 110,bomb.y);
			explosion.animations.play('kaboom',10,false);
			game.time.events.add(500, this.EndExplodes, this, explosion);
			this.CheckForPlayerDeath(explosion);
		}
		//detonation haut
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x,bomb.y - 55);
			explosion.animations.play('kaboom',10,false);
			game.time.events.add(500, this.EndExplodes, this, explosion);
			this.CheckForPlayerDeath(explosion);
		}
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x,bomb.y - 110);
			explosion.animations.play('kaboom',10,false);
			game.time.events.add(500, this.EndExplodes, this, explosion);
			this.CheckForPlayerDeath(explosion);
		}		
		//detonation bas
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x,bomb.y + 55);
			explosion.animations.play('kaboom',10,false);
			game.time.events.add(500, this.EndExplodes, this, explosion);
			this.CheckForPlayerDeath(explosion);
		}
		explosion = explosions.getFirstExists(false);
		if(explosion)
		{
			explosion.reset(bomb.x,bomb.y + 110);
			explosion.animations.play('kaboom',10,false);
			game.time.events.add(500, this.EndExplodes, this, explosion);
			this.CheckForPlayerDeath(explosion);
		}
		//on enlève la bombe
		bomb.kill();
	},
	EndExplodes: function (explosion) {
		explosion.kill();
	},
	CheckForPlayerDeath : function(explosion)
	{
		var kills = false;
		var explodePlacementX = Math.abs(explosion.x - this.bomberA.x);
		var explodePlacementY = Math.abs(explosion.y - this.bomberA.y);
		if(explodePlacementX<45 && explodePlacementY<45)
		{
			kills = true;
			++this.ScoreB;
			console.log("le joueur A a perdu"+ this.ScoreB);
		}
		var explodePlacementX = Math.abs(explosion.x - this.bomberB.x);
		var explodePlacementY = Math.abs(explosion.y - this.bomberB.y);
		if(explodePlacementX<45 && explodePlacementY<45)
		{
			kills = true;
			++this.ScoreA;
			console.log("le joueur B a perdu" + this.ScoreA);
		}
		if(kills)
		{
			this.bomberA.x = 100;
			this.bomberA.y = game.height/2;
			this.bomberB.x = game.width - 100;
			this.bomberB.y = game.height/2;
			this.ScoreText = "Score " + this.ScoreA+ " - " + this.ScoreB;
			this.scoreText.setText(this.ScoreText);
		}
	}
};

// On ajoute les 2 fonctions "gameState.load" et "gameState.main" à notre objet Phaser
game.state.add('load', gameState.load);
game.state.add('main', gameState.main);
// Il ne reste plus qu'à lancer l'état "load"
game.state.start('load');