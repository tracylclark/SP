//gameEngine.js
var Map = new require('./map.js');
var gameConstants = require('./gameConstants.js');
var Resources = require('./resources.js');
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
	this.roll1 = Math.floor((Math.random()*6)+1), 
	this.roll2 = Math.floor((Math.random()*6)+1), 
	this.total = Math.floor(this.roll1 + this.roll2);
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
				if(cardFunctionMap[e]()){
					var cardIndex = currentTurn.player.developmentCards.indexOf(this);
					network.io.emit("playedDevelopment", {player: currentTurn.player, card:e});
					currentTurn.player.developmentCards.splice(cardIndex, 1);//remove from player deck
					return true;			
				}
				return false;
			}
		}
	}); 
	var cardFunctionMap = {
		'goodQuarter': function(){
			currentTurn.player.socket.emit("SelectGoodQuarterResources");
			return true;
		},
		'whiteHat': function(){
			currentTurn.player.whiteHats++;
			currentTurn.placeHacker = true;
			currentTurn.player.emit("placeHacker");
			return true;
		},
		'networkBuilding': function(){
			currentTurn.player.socket.emit("networkBuilding");
			currentTurn.freeNetworks = 2;
			return true;
		},
		'monopoly': function(){
			currentTurn.player.socket.emit("monopoly"); //choose a resource to monopolize
			return true;
		},
		'VPSupport': function(){
			return false;
		}
	};
	developmentDeck.forEach(e=>console.log(e.name));
}

module.exports = function(){
	this.gamePhase = "pregame";
	var self = this;
	this.init = function(networkReference, playersReference){
		network = networkReference; //create a reference to the network module for communication purposes
		players = playersReference;
	};
	this.startGame = function(gameOptions){
		if(players.length === 1){
			return false;
		}
		map = new Map(gameOptions);
		self.gamePhase = "setup";
		network.io.emit("rollOff");
		network.updateMap();
		initializeDevelopmentDeck();
		return true;
	};
	this.getMap = function(){
		return map.getSerializedMap();
	};
	this.rollOff = function(player){
		if(player.rollOff !== null || self.gamePhase !== "setup"){
			return false;
		}
		player.rollOff = new Roll();
		network.io.emit("rollOffResult", {player:player.username, rollOff:player.rollOff});
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
			network.io.emit("setupBuildServer", currentSetup.player.username);
		}
		return true;
	};
	this.currentPlayerOnly = function(player, payload, callback){
		if(currentTurn.player === player || currentSetup.player === player){
			return callback(player, payload);
		}
		return false;
	};
	this.buildServer = function(player, location){
		if(location == null || location.x == null || location.y == null) return false;
		if(self.gamePhase === "setup" && currentSetup.freeServers > 0 && map.initialServerAvailable(location)){
			currentSetup.freeServers = 0;
			player.lastBuiltServer = location;
			map.buildServer(player, location);
			network.updateMap();
			network.io.emit("setupBuildNetwork", currentSetup.player.username);
			return true;
		}
		if(currentTurn.phase === "buy" && map.serverAvailable(location) && player.hasResources(gameConstants.costs.server)){
			map.buildServer(player, location);
			player.resources.sub(gameConstants.costs.server);
			network.updateMap();
			network.updateResources();
			return true;
		}
		return false;
	};
	this.buildNetwork = function(player, location){
		if(location == null || location.u == null || location.v == null || location.u.x == null || location.u.y == null || location.v.x == null || location.v.y == null) return false;
		if(self.gamePhase === "setup" && currentSetup.freeNetworks > 0 && currentSetup.freeServers === 0 && map.initialNetworkAvailable(player, location)){
			currentSetup.freeNetworks = 0;
			map.buildNetwork(player, location);
			network.updateMap();
			player.socket.emit("setupBuildComplete"); 
			return true;
		}
		if(self.gamePhase === "game" && currentTurn.freeNetworks > 0 && map.networkAvailable(player, location)){
			currentTurn.freeNetworks--;
			map.buildNetwork(player, location);
			network.updateMap();
			return true;
		}
		if(self.gamePhase === "game" && currentTurn.phase === "buy" && map.networkAvailable(player, location) && player.hasResources(gameConstants.costs.network)){
			map.buildNetwork(player, location);
			player.resources.sub(gameConstants.costs.network);
			network.updateMap();
			network.updateResources();
			return true;
		}
		return false;
	};
	this.buildDatabase = function(player, location){
		if(location == null || location.x == null || location.y == null) return false;
		if(self.gamePhase === "game" && currentTurn.phase === "buy" && map.databaseAvailable(player, location) && player.hasResources(gameConstants.costs.database)){
			map.buildDatabase(player, location);
			player.resources.sub(gameConstants.costs.database);
			network.updateMap();
			network.updateResources();
			return true;
		}
		return false;
	};

	this.buyDevelopment = function(player){
		if(self.gamePhase === "game" && currentTurn.phase === "buy" && player.hasResources(gameConstants.costs.development) && developmentDeck.length > 0){
			player.resources.sub(gameConstants.costs.development);
			network.updateResources();
			var card = developmentDeck.splice(Math.floor(Math.random()*developmentDeck.length), 1);//random card
			player.developmentCards.push(card[0]);
			player.socket.emit("cardDraw", card.name); //draws a random card and adds to players development deck (returns the card)
			return true;
		}
		return false;
	};
	this.endTurn = function(player){
		var indexOfUser = players.indexOf(player);
		if(self.gamePhase === "setup" && currentSetup.freeNetworks === 0 && currentSetup.freeServers === 0){
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
							e.generateResources(i, map);
						}
					});
					self.gamePhase = "game";
					currentSetup = new Setup(null);
					currentTurn = new Turn(players[0]);
					network.updateResources();
					//start the first game turn
					network.io.emit("gameTurn", currentTurn.player.username);
					return true;
				}
				else{
					currentSetup = new Setup(players[indexOfUser-1]);
					currentSetup.round = 2;
				}
			}
			currentSetup.freeServers = 1;
			currentSetup.freeNetworks = 1;
			network.io.emit("setupBuildServer", currentSetup.player.username);
			return true;
		}
		if(currentTurn.phase !== "roll"){
			if(indexOfUser === players.length-1){
				currentTurn = new Turn(players[0]);
			}
			else{
				currentTurn = new Turn(players[indexOfUser+1]);
			}
			network.io.emit("gameTurn", currentTurn.player.username);
			return true;
		}
		return false;
	};
	this.rollDice = function(player){
		if(self.gamePhase === "game" && currentTurn.phase==="roll"){
			currentTurn.player.developmentCards.forEach(c=>c.new = false);
			var roll = new Roll();
			roll.player = player.username;
			network.diceRoll(roll); //send the roll to the network to be emitted 
			if(roll.total!=7){
				players.forEach(e=>e.generateResources(roll.total, map)); 
				network.updateResources();
				currentTurn.phase = "trade";
				network.io.emit("tradePhase", player.username);
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
		if(self.gamePhase === "game" && currentTurn.playedDevelopment || currentTurn.phase == "roll"){
			return false;
		}
		var card = player.development.find(e=>e.name===development && e.new);
		if(typeof card !== "undefined"){ 
			//TODO:remove from dev cards
			return card.play(player); //may return false if not allowed to play (VP)
		}
		return false;
	};
	this.offerTrade = function(player, offer){ 
		if(self.gamePhase === "game" && currentTurn.phase === "trade" && player.hasResources(offer.have)){ //have x for y {have:{power:3}, for:{ram:2}}
			if(Object.keys(offer.for).find(e=>!validResource(e))){
				return false;
			}
			//player.socket.broadcast.emit("tradeOffer", offer);
			network.io.emit("tradeOffer", offer);
			currentTurn.currentOffer = offer;
			rejectList = [];
			return true;
		}
		return false;
	};
	this.staticTrade = function(player, offer){//have x for y  {have:{power:3}, for:"ram"}
		if (self.gamePhase !== "game" || currentTurn.phase !== "trade" 
			|| !player.hasResources(offer.have) || !validResource(offer.for) 
			|| Object.keys(offer.have).length > 1){
			return false;
		}
		if(offer.have[Object.keys(offer.have)[0]] === 4 
		||(offer.have[Object.keys(offer.have)[0]] === 3 && player.vendors.find(e=>e ==="threeToOne") !== undefined)
		||(offer.have[Object.keys(offer.have)[0]] === 2 && player.vendors.find(e=>e ===Object.keys(offer.have)[0]) !== undefined)){
			var tradeOut = new Resources();
			tradeOut[offer.for] += 1;
			player.resources.add(tradeOut);
			player.resources.sub(offer.have);
			network.updateResources();
			return true;
		}
		return false;
	};
	this.tradeResponse = function(player, response){
		if(self.gamePhase !== "game" || currentTurn.phase !== "trade" || currentTurn.currentOffer === null || player === currentTurn.player) {
			return false;
		}
		if(response && player.hasResources(currentTurn.currentOffer.for)){
			//accept
			player.resources.add(currentTurn.currentOffer.have);
			player.resources.sub(currentTurn.currentOffer.for);
			currentTurn.player.resources.add(currentTurn.currentOffer.for);
			currentTurn.player.resources.sub(currentTurn.currentOffer.have);
			currentOffer = null;
			network.updateResources();
			network.io.emit("tradeComplete", {acceptingPlayer: player.username, currentPlayer: currentTurn.player.username});
			return true;
		}
		else {
			//reject
			network.io.emit("tradeRejected", player.username);
			rejectList.push(player.username);
			if(rejectList.length === players.length-1){
				//rescind offer
				currentOffer = null;
				network.io.emit("offerRescinded", currentTurn.player.username);
				rejectList = [];
			}
			return true;
		}
	};
	this.endTrading = function(){
		if(currentTurn.phase === "trade"){
			currentTurn.phase = "buy";
			currentOffer = null;
			rejectList = [];
			network.io.emit("buyPhase", currentTurn.player.username);
			return true;
		}
		return false;
	}
	this.placeHacker = function(player, hackerAction){ //{tile:id, target:id}
		if(self.gamePhase === "game" && currentTurn.placeHacker){ //set when a 7 is rolled (rollDice) or a whitehat is played (development card action)
			if(!map.placeHacker(hackerAction.tile)){ //returns false if not a tile or not a change
				return false;
			}
			var target = players.find(e=>e.username === hackerAction.target);
			if(target === undefined && !map.hasTile(target)){
				return false;
			} 
			player.resources.add(target.steal());
			network.io.emit("hacked", {hacker:player.username, target:hackerAction.target});
			network.updateResources();
			network.updateMap();

			if(currentTurn.phase === "roll"){
				currentTurn.phase = "trade";
			}
			network.io.emit("tradePhase", player.username);

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
		network.updateResources();
		//find out how many of the chosen resource all players but current have
		//set other players resource to zero
		//add total to currentPlayers resource
		//announce to other players
	}
};