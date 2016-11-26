//network-client.js

var network = new (function(){

	var socket = io();
	socket.emit("msg", "Hello world");
	socket.on("mapUpdate", e=>{
		canvasEngine.setMap(e);//(JSON.parse(e));
	});
	setTimeout(()=>socket.emit("gimme the map"), 1000);

	socket.on("loginResult", function(res){
		if(res){
			domEngine.hideLogin();
		}
		else{
			domEngine.loginError("Failed to login, ensure your username and password are correct.");
		}
	});
	socket.on("createAccountResult", function(res){
		if(res){
			domEngine.hideLogin();
		}
		else{
			domEngine.loginError("Failed to create account, try a different username.");
		}
	});
	socket.on("broadcast", function(msg){
		domEngine.chatDisplay(msg);
	});
	socket.on("system", msg=>{
		domEngine.systemMessage(msg);
	});
	socket.on("actionSuccess", successMsg=>{
		o(`<actionSuccess> ${successMsg}`);
		if(DEBUG)domEngine.systemMessage("actionSuccess:"+successMsg);
		if(!successMsg){
				domEngine.systemMessage("action failed!");
		}
	});
	socket.on("joinedGame", ()=>{
		domEngine.showStartGame();
		domEngine.systemMessage("Welcome to the Game");
	})
	socket.on("playerUpdate", playerArray=>{
		o(`<playerUpdate> ${playerArray}`);
		canvasEngine.setPlayers(playerArray);
		domEngine.setPlayers(playerArray);
	});
	socket.on("rollOffResult", (rollResult)=>{
			domEngine.systemMessage(rollResult.player + " rolled off: (" + rollResult.rollOff.roll1 + "," + rollResult.rollOff.roll2 + ") : " + rollResult.rollOff.total);
	});
	socket.on("rollOff", ()=>{
		domEngine.showRollOff();
		domEngine.systemMessage("It is time to roll off to determine player order.");
	});
	socket.on("setupBuildServer", (currentPlayer)=>{
		domEngine.systemMessage(currentPlayer + " must set up a server.");
		domEngine.hidePopup();
		if(currentPlayer === name){
			domEngine.showBuildServer();
		}
	});
	socket.on("setupBuildNetwork", (currentPlayer)=>{
		domEngine.systemMessage(currentPlayer + " must set up a network.");
		domEngine.hidePopup();
		if(currentPlayer === name){
			domEngine.showBuildNetwork();
		}
	});
	socket.on("resourceUpdate", (resources)=>{
	o(`<resourceUpdate> ${resources}`);
	domEngine.resourceUpdate(resources);
	});
	socket.on("gameTurn", (currentPlayer)=>{
		domEngine.systemMessage(currentPlayer + " has begun a new turn.");
		if(currentPlayer === name){
		domEngine.showRollDice();
	}
	});
	socket.on("tradePhase", (currentPlayer)=>{
		domEngine.systemMessage(currentPlayer + " has entered the trade phase of their turn.");
		if (currentPlayer == name) domEngine.showTrade();
	});
	socket.on("tradeOffer", (offer)=>{
		o(`<tradeOffer> ${offer}`);
		domEngine.systemMessage("The current player has made a trade offer.");
		domEngine.systemMessage(offer.have);
		domEngine.systemMessage(offer.for);
		if(offer.from != name) domEngine.showTradeOfferMenu(offer);
	});
	socket.on("hacked", (hackerResults)=>{
		o(`<hacked> ${hackerResults}`)
		domEngine.systemMessage(hackerResults.hacker + " has targeted " + hackerResults.target + " with a cyberattack.");
	});
	socket.on("offerRescinded", ()=>{
		o(`<offerRescinded>`);
		domEngine.systemMessage("The current offer has been rescinded.");
	});
	socket.on("tradeRejected", (rejectingPlayer)=>{
		o(`<tradeRejected> ${rejectingPlayer}`);
		domEngine.systemMessage(rejectingPlayer + " has rejected the trade offer.");
	});
	socket.on("tradeComplete", (acceptingPlayer)=>{
		o(`<tradeComplete> ${acceptingPlayer}`);
		domEngine.systemMessage(acceptingPlayer + " has accepted the trade offer!");
	});
	socket.on("buyPhase", (currentPlayer)=>{
	domEngine.systemMessage(currentPlayer + " has entered the buy phase of their turn.");
	});
	socket.on("cardDraw", (card)=>{
		domEngine.systemMessage("You gained a new development: " + card);
	});
	socket.on("monopoly", ()=>{
		domEngine.systemMessage("You have played a monopoly card. Please select a resource type.");
	});
	socket.on("networkBuilding", ()=>{
		domEngine.systemMessage("You have played a Network Building card. Place two network connections for free!");
	});
	socket.on("placeHacker", ()=>{
		domEngine.systemMessage("You may now place a hacker and select a target");
	});
	socket.on("selectGoodQuarterResources", ()=>{
		domEngine.systemMessage("You have had a good quarter. Select two free resources.");
	});
	socket.on("setupBuildComplete", ()=>{
		domEngine.showEndTurn();
	});
	socket.on("diceRollResult", rollResult=>{
		domEngine.showDiceRoll(rollResult);
		domEngine.systemMessage(rollResult.player + " rolled: (" + rollResult.roll1 + "," + rollResult.roll2 + ") : " + rollResult.total);
	});

	//spectators
	this.create = function(un,pw){
		socket.emit("createAccount", {username:un, password:pw});
	}
	this.login = function(un,pw){
		name = un;
		socket.emit("login", {username:un, password:pw});
	}
	this.broadcast = function(msg){
		socket.emit("msg", `<broadcast> ${msg}`);
		socket.emit("broadcast", msg);
	};
	this.joinGame = function(){
		socket.emit("msg", `<joinGame>`);
		socket.emit("joinGame");
	};

	//players and setup
	this.startGame = function(options){
		socket.emit("msg", `<startGame> ${options}`);
		socket.emit("startGame", options);
	};
	this.rollOff = function(){
		socket.emit("msg", `<rollOff>`);
		socket.emit("rollOff");
	};
	this.endTurn = function(){
		socket.emit("msg", `<endTurn>`);
		socket.emit("endTurn");
	};

	//Game Turn
	this.rollDice = function(){
		socket.emit("msg", `<rollDice>`);
		socket.emit("rollDice");
	};
	this.placeHacker = function(hackerAction){
		socket.emit("msg", `<placeHacker> ${hackerAction}`);
		socket.emit("placeHacker", hackerAction);
	};
	this.playDevelopment = function(card){
		socket.emit("msg", `<playDevelopment> ${card}`);
		socket.emit("playDevelopment", card);
	};

	//trades
	this.offerTrade = function(offer){
		socket.emit("msg", `<offerTrade> ${offer}`);
		socket.emit("offerTrade", offer);
	};
	this.staticTrade = function(trade){
		socket.emit("msg", `<staticTrade> ${trade}`);
		socket.emit("staticTrade", trade);
	};
	this.tradeResponse = function(response){
		socket.emit("msg", `<tradeResponse> ${response}`);
		socket.emit("tradeResponse", response);
	};
	this.endTrading = function(){
		socket.emit("endTrading");
	};

	//purchases
	this.buildNetwork = function(location){
		socket.emit("msg", `<buildNetwork> ${location}`);
		socket.emit("buildNetwork", location);
	};
	this.buildServer = function(location){
		socket.emit("msg", `<buildServer> ${location}`);
		socket.emit("buildServer", location);
	};
	this.buyDevelopment = function(){
		socket.emit("msg", `<buyDevelopment>`);
		socket.emit("buyDevelopment");
	};
	this.buildDatabase = function(location){
		socket.emit("msg", `<buildDatabase> ${location}`);
		socket.emit("buildDatabase", location);
	};

	//special
	this.claimLongestPath = function(pathList){
		socket.emit("msg", `<claimLongestPath> ${pathList}`);
		socket.emit("claimLongestPath", pathList);
	};
	
})();
