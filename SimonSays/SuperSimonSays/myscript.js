	//reference sur les regles du jeu
	var reglesTitre;
	var reglesText;
	
	//boutton commencer la partie
	var button;
	
	//reference sur le jeu
	var simon;
	
	//reference sur le menu du jeu
	var menu;
	
	//sequence aléatoire que le joueur doit reproduire
	var sequence;
	
	//position du joueur dans la sequence
	var indexSequenceJoueur = 0;
	
	//liste des couleurs
	var listCouleurs;
	
	//vie du joueur
	var healthPoints = 3;
	
	//temps entre chaque boutton de la fonction sohwSequence
	var showTime = 300;
	
	//reference sur les bouttons de couleur
	var rouge;
	var bleu;
	var vert;
	var jaune;
	
	//etat d'activation des bouttons
	var rougeIsActive=false;
	var bleuIsActive=false;
	var vertIsActive=false;
	var jauneIsActive=false;
	
	
	//booleen pour savoir si le joueur peut jouer
	var playerInputEnabled = false;
	
	//mode
	var indexMode;
	
	//audio
	var colorButtonSounds = [];
	var mistakeSound;
	
	//temporisation global pour savoir si le joueur joue dans les temps
	var globalTimer;
	
	//au chargement du document
    $(document).ready(function() {
	
	//on recupère les references
	reglesTitre = $('#titreRegles');
	reglesText = $('#textRegles');
      button = $('#buttonCommencer');
	  simon= $("#simon");
	  menu = $("#menu");
	  rouge = $("#buttonRed");
	  vert = $("#buttonGreen");
	  bleu = $("#buttonBlue");
	  jaune = $("#buttonYellow");
	  
	  //definition des fonctions de souris
      button.click(clickcommencerPartie);
	  rouge.mousedown(clickRouge);
	  bleu.mousedown(clickBleu);
	  vert.mousedown(clickVert);
	  jaune.mousedown(clickJaune);
	  rouge.mouseup(upRouge);
	  bleu.mouseup(upBleu);
	  vert.mouseup(upVert);
	  jaune.mouseup(upJaune);
	  
	  //on a également besoin de gérer l'évenement mouseout pour mettre à jour le css d'un boutton lorsque
	  //la souris quitte ce dernier en étant cliquée.
	  rouge.mouseout(outRouge);
	  bleu.mouseout(outBleu);
	  vert.mouseout(outVert);
	  jaune.mouseout(outJaune);
	  
	  //on créé la liste des couleurs de bouttons
	  listCouleurs = ["bleu","rouge","jaune","vert"];
	  
	  //on intialise la sequence
	  sequence = [];
	  
	  //initialisation de l'audio
	  colorButtonSounds = [new Audio("Tonalite1.wav"),new Audio("Tonalite2.wav"),new Audio("Tonalite3.wav"),new Audio("Tonalite4.wav")];
	  mistakeSound = new Audio("error.wav");
    });
	
	//commencer la partie
	function clickcommencerPartie()
	{
		if($("#mode1").is(":checked"))
		{
			mode = 1;
		}
		else
		{
			mode = 2;
		}
		menu.css("display","none");
		simon.css("visibility","visible");
		reglesTitre.css("display","none");
		reglesText.css("display","none");
		addElementInSequence();
		showSequence();
		//on initialise les vies
		healthPoints = 3;
		$("#vies").html("vies : " + healthPoints);
	}
	
	//creation de la sequence
	function addElementInSequence()
	{
		var currentColorIndex = Math.floor((Math.random() * 4));
		var currentColor = listCouleurs[currentColorIndex];
		sequence.push(currentColor);
		if(mode == 2) 
		{
			currentColorIndex = Math.floor((Math.random() * 4));
			var secondColor = listCouleurs[currentColorIndex];
			sequence.push(secondColor);
		}
	}
	
	//on montre la sequence à l'utilisateur
	function showSequence()
	{
		playerInputEnabled = false;
		for(var i=0;i<sequence.length;i++)
		{
			var couleur = sequence[i];
			doSetTimeout(couleur,i);
		}
	}
	
	//fonction complémentaire à showSequence pour forcer le script à faire une copie de la variable couleur pour chaque timeout
	function doSetTimeout(couleur,i) {
		window.setTimeout(function() {
					playColorAudio(couleur);
					ActivateButton(couleur);
				},
				showTime+showTime*i*2);
		if(i+1 >= sequence.length)
		{
			window.setTimeout(function() {
					ActivateButton(couleur);
					// les fonctions anonymes ne peuvent pas accèder aux variables globales
					//on utilise donc un setter
					setPlayerInput(true);
					//on set la temporisation globale du jeu
					setGlobalTimeout();
				},
				showTime*2+showTime*i*2);
		}
		else
		{
			window.setTimeout(function() {
					ActivateButton(couleur);
				},
				showTime*2+showTime*i*2);
		}
	}
	
	//setter player Input
	function setPlayerInput(val)
	{
		playerInputEnabled = val;
	}
	
	//set global timeout
	function setGlobalTimeout()
	{
	//on lance le timer, si le joueur ne joue pas dans le temps imparti, on fait un checkbutton avec "" en argument
		globalTimer = window.setTimeout(function() {checkButton("");}, 5000);
	}
	
	//On montre un boutton de la sequence au joueur
	function ActivateButton(couleur)
	{
		switch (couleur){
			case "rouge":
				rouge.toggleClass('buttonRedActive');
				rouge.toggleClass('buttonRedInactive');
				break;
			case "bleu":
				bleu.toggleClass('buttonBlueActive');
				bleu.toggleClass('buttonBlueInactive');
				break;
			case "jaune":
				jaune.toggleClass('buttonYellowActive');
				jaune.toggleClass('buttonYellowInactive');
				break;
			case "vert":
				vert.toggleClass('buttonGreenActive');
				vert.toggleClass('buttonGreenInactive');
				break;
		}
	}
	
	//on vérifie les entrées de la part du joueur
	function checkButton(couleur)
	{
		//on arrete la temporisation globale
		window.clearTimeout(globalTimer);
		//si le joueur a appuyé sur le bon boutton
		if(sequence[indexSequenceJoueur] == couleur)
		{
		//on active l'audio corespondant au boutton
			playColorAudio(couleur);
			//on passe au boutton suivant
			++indexSequenceJoueur;
			//si le joueur a entré la sequence en entier
			if(indexSequenceJoueur >= sequence.length)
			{
				//on bloque les inputs
				playerInputEnabled = false;
				//on continue la partie
				indexSequenceJoueur = 0;
				//on calcule à quelle vitesse la sequence va etre moontrée à l'utilisateur
				showTime = Math.floor((Math.random() * 150)+150);
				addElementInSequence();
				window.setTimeout("showSequence()",1000);
			}
			else
			{
				//on laisse à nouveau du temps au joueur pour entrer la suite de la sequence
				setGlobalTimeout();
			}
		}
		else
		{//sinon
		//feedback audio de l'erreur
		
			//on bloque les inputs
			playerInputEnabled = false;
			mistakeSound.play();
			//on diminue les vies
			--healthPoints;
			$("#vies").html("vies : " + healthPoints);
			//la sequence redémarre à 0
			indexSequenceJoueur = 0;
			if(healthPoints == 0)
			{//le joueur a perdu : on termine la partie
				alert("Perdu !\n" + "Vous avez atteint une sequence de : " + sequence.length + "notes");
				menu.css("display","inline")
				simon.css("visibility","hidden");
				reglesTitre.css("display","inline");
				reglesText.css("display","inline");
				sequence.length = 0;
				healthPoints = 3;
			}
			else
			{
			//on remontre la sequence au joueur au bout d'une seconde
				window.setTimeout("showSequence()",1000);
			}
		}
	}
	
	//activation de l'audio
	function playColorAudio(couleur)
	{
		switch (couleur){
			case "rouge":
				colorButtonSounds[0].play();
				break;
			case "bleu":
				colorButtonSounds[1].play();
				break;
			case "jaune":
				colorButtonSounds[2].play();
				break;
			case "vert":
				colorButtonSounds[3].play();
				break;
		}
	}
	
	//click couleurs
	function clickRouge()
	{
		if(playerInputEnabled){
		//feedback visuel du click
			rouge.toggleClass('buttonRedActive');
			rouge.toggleClass('buttonRedInactive');
			rougeIsActive = true;
		}
	}
	function clickBleu()
	{
		if(playerInputEnabled){
		//feedback visuel du click
			bleu.toggleClass('buttonBlueActive');
			bleu.toggleClass('buttonBlueInactive');
			bleuIsActive = true;
		}
	}
	function clickVert()
	{
		if(playerInputEnabled){
		//feedback visuel du click
			vert.toggleClass('buttonGreenActive');
			vert.toggleClass('buttonGreenInactive');
			vertIsActive = true;
		}
	}
	function clickJaune()
	{
		if(playerInputEnabled){
		//feedback visuel du click
			jaune.toggleClass('buttonYellowActive');
			jaune.toggleClass('buttonYellowInactive');
			jauneIsActive = true;
		}
	}
	function upRouge()
	{
		if(playerInputEnabled && rougeIsActive){
		//feedback visuel du relachement
			rouge.toggleClass('buttonRedActive');
			rouge.toggleClass('buttonRedInactive');
			//on regarde si le joueur a appuyé sur le bon boutton
			checkButton("rouge");
			rougeIsActive = false;
		}
	}
	function upBleu()
	{
		if(playerInputEnabled && bleuIsActive){
		//feedback visuel du relachement
			bleu.toggleClass('buttonBlueActive');
			bleu.toggleClass('buttonBlueInactive');
			//on regarde si le joueur a appuyé sur le bon boutton
			checkButton("bleu");
			bleuIsActive = false;
		}
	}
	function upVert()
	{
		if(playerInputEnabled && vertIsActive){
		//feedback visuel du relachement
			vert.toggleClass('buttonGreenActive');
			vert.toggleClass('buttonGreenInactive');
			//on regarde si le joueur a appuyé sur le bon boutton
			checkButton("vert");
			vertIsActive = false;
		}
	}
	function upJaune()
	{
		if(playerInputEnabled && jauneIsActive){
		//feedback visuel du relachement
			jaune.toggleClass('buttonYellowActive');
			jaune.toggleClass('buttonYellowInactive');
			//on regarde si le joueur a appuyé sur le bon boutton
			checkButton("jaune");
			jauneIsActive = false;
		}
	}
	function outRouge()
	{
		if(playerInputEnabled && rougeIsActive){
		//feedback visuel du relachement
			rouge.toggleClass('buttonRedActive');
			rouge.toggleClass('buttonRedInactive');
			rougeIsActive = false;
		}
	}
	function outBleu()
	{
		if(playerInputEnabled && bleuIsActive){
		//feedback visuel du relachement
			bleu.toggleClass('buttonBlueActive');
			bleu.toggleClass('buttonBlueInactive');
			bleuIsActive = false;
		}
	}
	function outVert()
	{
		if(playerInputEnabled && vertIsActive){
		//feedback visuel du relachement
			vert.toggleClass('buttonGreenActive');
			vert.toggleClass('buttonGreenInactive');
			vertIsActive = false;
		}
	}
	function outJaune()
	{
		if(playerInputEnabled && jauneIsActive){
		//feedback visuel du relachement
			jaune.toggleClass('buttonYellowActive');
			jaune.toggleClass('buttonYellowInactive');
			jauneIsActive = false;
		}
	}