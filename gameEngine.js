//gameEngine.js
var Map = new require('./map.js');
var gameConstants = require('./gameConstants.js');
var map = {};
var network = {};
var players = [];
var developmentDeck = gameConstants.developmentCardLabels.slice();
var currentTurn = new Turn(null);
var currentSetup = new Setup(null);
var rejectList = [];
/*
	pregame
		connect new clients
		clients join game
		startGame(options)=>
	setup
		rolloff
		place servers
		place networks
		get first resources =>
	game
		currentTurn cycle roll=>trade=>buy
		On victory =>
	postgame
		winner

*/

function validResource(q){
	return q === "ram" || q === "cpu" || q === "bandwidth" || q === "power" || q === "storage";
}
function Turn(player){
	this.player = player;
	this.currentOffer = null;
	this.phase = "roll";
	this.cardPlayed = null;
	this.placeHacker = false;
	this.freeNetworks = 0; //this is used to allocate free networks if a buildNetworks development card is played
}
function Setup(player){
	this.player = player;
	this.phase = "build";
	this.freeNetworks = 0; //everybody gets to place 1 network and 1 server, then gets a second network and server in reverse order of rolloff
	this.freeServers = 0;
	this.round = 0; //when everybody is at round 2 we have completed the setup phase
}
function Roll(){
	this.roll1 = (Math.random()*6)+1, 
	this.roll2 = (Math.random()*6)+1, 
	this.total = this.roll1 + this.roll2;
};

function initializeDevelopmentDeck(){
	//shuffle developmentDeck
	var shuffledDevelopmentDeck = []; 
	while (develomentDeck.length){ 
		var i = Math.floor(Math.random() * developmentDeck.length);
		shuffledDevelopmentDeck.push(developmentDeck.splice(i, 1)[0]);
	}
	developmentDeck = shuffledDevelopmentDeck.map(e=>{
		return {
			name:e,
			new: true,
			play:function(){
				currentTurn.cardPlayed = e;
				cardFunctionMap[e]();
				var cardIndex = currentTurn.player.developmentCards.indexOf(this);
				currentTurn.player.developmentCards.slice(cardIndex, 1);//remove from player deck
			}
		}
	}); 
	var cardFunctionMap = {
		'goodQuarter': function(){
			currentTurn.player.socket.emit("SelectGoodQuarterResources");
		},
		'whiteHat': function(){
			currentTurn.player.whiteHats++;
			currentTurn.placeHacker = true;
			currentTurn.player.emit("placeHacker");
		},
		'networkBuilding': function(){
			currentTurn.player.socket.emit("networkBuilding");
			currentTurn.freeNetworks = 2;
		},
		'monopoly': function(){
			currentTurn.player.socket.emit("monopoly"); //choose a resource to monopolize
		},
		'VPSupport': function(){}
	};
}

module.exports = function(){
	this.gamePhase = "pregame";
	this.init = function(networkReference, playersReference){
		network = networkReference; //create a reference to the network module for communication purposes
		players = playersReference;
	};
	this.startGame = function(gameOptions){
		if(players.length === 1){
			return false;
		}
		map = new Map(gameOptions);
		this.gamePhase = "setup";
		io.emit("rollOff");
		return true;
	};
	this.rollOff = function(player){
		if(player.rollOff !== null || this.gamePhase !== "setup"){
			return false;
		}
		player.rollOff = new Roll();
		io.emit("rollOffResult", {player:player.username, rollOff:player.rollOff});
		if(!players.find(e=>e.rollOff === null)){
			players.sort((a,b)=>{
				if(a.rollOff.total > b.rollOff.total) return -1;
				else if(a.rollOff.total < b.rollOff.total) return 1;
				return (Math.random()>0.5)? 1 : -1;
			});
			network.updatePlayers();
			currentSetup = new Setup(players[0]);
			currentSetup.freeNetworks = 1;
			currentSetup.freeServers = 1;
			currentSetup.round = 1;
			io.emit("setupBuild", currentSetup.player.username);
		}
	};
  	this.currentPlayerOnly = function(player, payload, callback){
		if(currentTurn.player === player || currentSetup.player === player){
			return callback(player, payload);
		}
		return false;
	};
	this.buildServer = function(player, location){
		if(this.gamePhase = "setup" && currentSetup.freeServers > 0 && gameMap.initialServerAvailable(location)){
			currentSetup.freeServers = 0;
			player.lastBuiltServer = location;
			gameMap.buildServer(player, location);
		}
		if(currentTurn.phase === "buy" && gameMap.serverAvailable(location) && player.hasResources(costs.server)){
			gameMap.buildServer(player, location);
			player.resources.sub(costs.server);
			return true;
		}
		return false;
	};
	this.buildNetwork = function(player, location){
		if(this.gamePhase === "setup" && currentSetup.freeNetworks > 0 && currentSetup.freeServers === 0 && gameMap.initialNetworkAvailable(player, location)){
			currentSetup.freeNetworks = 0;
			gameMap.buildNetwork(player, location);
			return true;
		}
		if(this.gamePhase === "game" && currentTurn.freeNetworks > 0 && gameMap.networkAvailable(player, location)){
			currentTurn.freeNetworks--;
			gameMap.buildNetwork(player, location);
			return true;
		}
		if(this.gamePhase === "game" && currentTurn.phase === "buy" && gameMap.networkAvailable(player, location) && player.hasResources(costs.network)){
			gameMap.buildNetwork(player, location);
			player.resources.sub(costs.network);
			return true;
		}
		return false;
	};
	this.buildDatabase = function(player, location){
		if(this.gamePhase === "game" && currentTurn.phase === "buy" && gameMap.databaseAvailable(player, location) && player.hasResources(costs.database)){
			gameMap.buildDatabase(player, location);
			player.resources.sub(costs.database);
			return true;
		}
		return false;
	};

	this.buyDevelopment = function(player){
		if(this.gamePhase === "game" && currentTurn.phase === "buy" && player.hasResources(costs.development) && developmentDeck.length > 0){
			player.resources.sub(costs.development);
			var card = developmentDeck.slice(Math.floor(Math.random()*developmentDeck.length), 1);//random card
			player.developmentCards.push(card);
			player.socket.emit("cardDraw", card.name); //draws a random card and adds to players development deck (returns the card)
			return true;
		}
		return false;
	};
	this.endTurn = function(player){
		var indexOfUser = players.indexOf(player);
		if(this.gamePhase === "setup" && currentSetup.freeNetworks === 0 && currentSetup.freeServers === 0){
			if(currentSetup.round === 1){
				if(indexOfUser === players.length-1){
					currentSetup = new Setup(player);
					currentSetup.round = 2;
				}
				else{
					currentSetup = new Setup(players[indexOfUser+1]);
					currentSetup.round = 1;
				}
			}
			else{
				if(indexOfUser === 0){
					players.forEach(e=>{
						for(var i=2; i<13; i++){
							e.generateResources(i);
						}
					});
					this.gamePhase = "game";
					currentSetup = new Setup(null);
					currentTurn = new Turn(players[0]);
					network.updateResources();
					//start the first game turn
					io.emit("gameTurn", currentTurn.player.username);
					return true;
				}
				else{
					currentSetup = new Setup(players[indexOfUser-1]);
					currentSetup.round = 2;
				}
			}
			currentSetup.buildServer = 1;
			currentSetup.buildNetwork = 1;
			io.emit("setupBuild", currentSetup.player.username);
			return true;
		}
		if(currentTurn.phase !== "roll"){
			if(indexOfUser === players.length-1){
				currentTurn = new Turn(players[0]);
			}
			else{
				currentTurn = new Turn(players[indexOfUser+1]);
			}
			return true;
		}
		return false;
	};
	this.rollDice = function(player){
		if(this.gamePhase === "game" && currentTurn.phase==="roll"){
			currentTurn.player.developmentCards.forEach(c=>c.new = false);
			var roll = new Roll();
			network.diceRoll(roll); //send the roll to the network to be emitted 
			if(roll.total!=7){
				players.forEach(e=>e.generateResources(roll.total)); 
				network.updateResources();
				currentTurn.phase = "trade";
				io.emit("tradePhase", player.username);
			}
			else{
				currentTurn.placeHacker = true;
				currentTurn.player.socket.emit("placeHacker");
			}
			return true; //for display purposes, need the result of both rolls, total is for resource generation purposes
		}
		return false;
	};
	this.playDevelopment = function(player, development){
		if(this.gamePhase === "game" && currentTurn.playedDevelopment || currentTurn.phase == "roll"){
			return false;
		}
		var card = player.development.find(e=>e.name==development && e.new);
		if(typeof card !== "undefined"){ 
			//TODO:remove from dev cards
			return card.play(player); //may return false if not allowed to play (VP)
		}
		return false;
	};
	this.offerTrade = function(player, offer){ 
		if(this.gamePhase === "game" && currentTurn.phase === "trade" && player.hasResources(offer.have)){ //have x for y {have:{power:3}, for:{ram:2}}
			if(Object.keys(offer.for).find(e=>!validResource(e))){
				return false;
			}
			player.socket.broadcast("tradeOffer", offer);
			currentTurn.currentOffer = offer;
			return true;
		}
		return false;
	};
	this.staticTrade = function(player, offer){//have x for y  {have:{power:3}, for:"ram"}
		if (this.gamePhase !== "game" || currentTurn.phase !== "trade" 
			|| !player.hasResources(offer.have) || !validResource(offer.for) 
			|| Object.keys(offer.have).length > 1){
			return false;
		}
		if(offer.have.length === 4 
		||(offer.have.length === 3 && player.vendors.find(e=>e ==="threeToOne") !== undefined)
		||(offer.have.length === 2 && player.vendors.find(e=>e ===Object.keys(offer.have)[0]) !== undefined)){
			var tradeOut = new Resources();
			tradeOut[offer.for] += 1;
			player.resources.add(tradeOut);
			player.resources.sub(offer.have);
			return true;
		}
		return false;
	};
	this.tradeResponse = function(player, response){
		if(this.gamePhase !== "game" || currentTurn.phase !== "trade" || currentTurn.currentOffer === null || player === currentTurn.player) {
			return false;
		}
		if(response){
			//accept
			player.resources.add(currentTurn.currentOffer.have);
			player.resources.sub(currentTurn.currentOffer.for);
			currentTurn.player.resources.add(currentTurn.currentOffer.for);
			currentTurn.player.resources.sub(currentTurn.currentOffer.have);
			currentOffer = null;
			network.updateResources();
			io.emit("tradeComplete", player.username);
			return true;
		}
		else {
			//reject
			io.emit("tradeRejected", player.username);
			rejectList.push(player.username);
			if(rejectList.length === players.length-1){
				//rescind offer
				currentOffer = null;
				io.emit("offerRescinded");
				rejectList = [];
			}
			return true;
		}
	};
	this.endTrading = function(){
		if(currentTurn.phase === "trade"){
			currentTurn.phase = "buy";
			io.emit("tradingEnded");
			return true;
		}
		return false;
	}
	this.placeHacker = function(player, hackerAction){ //{tile:id, target:id}
		if(this.gamePhase === "game" && currentTurn.placeHacker){ //set when a 7 is rolled (rollDice) or a whitehat is played (development card action)
			if(!gameMap.placeHacker(hackerAction.tile)){ //returns false if not a tile or not a change
				return false;
			}
			var target = players.find(e=>e.username === hackerAction.target);
			if(target === undefined && !gameMap.hasTile(target)){
				return false;
			} 
			player.resources.add(target.steal());
			io.emit("hacked", {hacker:player.username, target:hackerAction.target});
			network.updateResources();

			if(currentTurn.phase === "roll"){
				currentTurn.phase = "trade";
			}
			io.emit("tradePhase", player.username);

			return true;
		}
		return false;
	};
	this.claimLongestPath = function(player, coords){
		var tmpPathLength = 0; //tmp var to store the path length being traced
		//coords.forEach((e, i)=>) //for each coord pair find in edges, make sure they are all touching, make sure player is owner
		//if all this AND longer than current longest path, store coords for longest path and player as longest path
		//remove VP from last longest path holder, set VP for current longest path holder
		//return true; 
		//else return false
	};
	function mostSecure(players){		
		//every time a whiteHat dev card is played, check for mostSecure
		//if new player has it, remove mostSecure player from before, subtract the VP and add to new mostSecure player
		//must have at least 3 whiteHats to receive in first place
		//if same player as last time, don't announce, just update (send announcement to players)

	}
	function monopolize(player, resourceChosen){
		var total = new Resources();
		players.filter(e=>e!==player).forEach(e=>total.add(e.monopolize(resourceChosen))); //remove resources from otherPlayers
		player.resources.add(total); //add the created resource obj to the current players resources
		//io.emit("system", )
		//find out how many of the chosen resource all players but current have
		//set other players resource to zero
		//add total to currentPlayers resource
		//announce to other players
	}
};