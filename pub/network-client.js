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
	socket.on("system", msg=>{
		o(`<system> ${msg}`);
	});
	socket.on("actionSuccess", successMsg=>{
		o(`<actionSuccess> ${successMsg}`);
	});
	socket.on("playerUpdate", playerArray=>{
		o(`<playerUpdate> ${playerArray}`);
		canvasEngine.setPlayers(playerArray);
	});
    socket.on("resourceUpdate", (resources)=>{
    	o(`<resourcesUpdate> ${resources}`);
    });
    socket.on("tradeOffer", (offer)=>{
    	o(`<tradeOffer> ${offer}`);
    });
    socket.on("hacked", (hackerResults)=>{
    	o(`<hacked> ${hackerResults}`)
    });
    socket.on("buyPhase", (currentPlayer)=>{
    	o(`<buyPhase> ${currentPlayer}`);
    });
    socket.on("offerRescinded", ()=>{
    	o(`<offerRescinded>`);
    });
    socket.on("tradeRejected", (rejectingPlayer)=>{
    	o(`<tradeRejected> ${rejectingPlayer}`);
    });
    socket.on("tradeComplete", (acceptingPlayer)=>{
    	o(`<tradeComplete> ${acceptingPlayer}`);
    });
    socket.on("tradePhase", (currentPlayer)=>{
    	o(`<tradePhase> ${currentPlayer}`);
    });
    socket.on("gameTurn", (currentPlayer)=>{
    	o(`<gameTurn> ${currenPlayer}`);
    });
    socket.on("cardDraw", (card)=>{
    	o(`<cardDraw> ${card}`);
    });
    socket.on("setupBuild", (currentPlayer)=>{
    	o(`<setupBuild> ${currentPlayer}`);
    });
    socket.on("rollOffResult", (rollResult)=>{
    	o(`<rollOffResult> ${rollResult}`);
    });
    socket.on("rollOff", (currentPlayer)=>{
    	o(`<rollOff> ${currentPlayer}`);
    });
    socket.on("monopoly", ()=>{
    	o(`<monopoly>`);
    });
    socket.on("networkBuilding", ()=>{
    	o(`<networkBuilding>`);
    });
    socket.on("placeHacker", ()=>{
    	o(`<placeHacker>`);
    });
    socket.on("selectGoodQuarterResources", ()=>{
    	o(`<selectGoodQuarterResources>`);
    });

	
	
	this.broadcast = function(msg){
		socket.emit("msg", `<broadcast> ${msg}`);
		socket.emit("broadcast", msg);
	};
	this.joinGame = function(){
		socket.emit("msg", `<joinGame>`);
		socket.emit("joinGame");
	};
	this.startGame = function(options){
		socket.emit("msg", `<startGame> ${options}`);
		socket.emit("startGame", options);
	};
	this.buildNetwork = function(location){
		socket.emit("msg", `<buildNetwork> ${location}`);
		socket.emit("buildNetwork", location);
	};
	this.buildDatabase = function(location){
		socket.emit("msg", `<buildDatabase> ${location}`);
		socket.emit("buildDatabase", location);
	};
	this.buildServer = function(location){
		socket.emit("msg", `<buildServer> ${location}`);
		socket.emit("buildServer", location);
	};
	this.buyDevelopment = function(){
		socket.emit("msg", `<buyDevelopment>`);
		socket.emit("buyDevelopment");
	};
	this.endTurn = function(){
		socket.emit("msg", `<endTurn>`);
		socket.emit("endTurn");
	};
	this.rollDice = function(){
		socket.emit("msg", `<rollDice>`);
		socket.emit("rollDice");
	};
	this.playDevelopment = function(card){
		socket.emit("msg", `<playDevelopment> ${card}`);
		socket.emit("playDevelopment", card);
	};
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
	this.placeHacker = function(hackerAction){
		socket.emit("msg", `<placeHacker> ${hackerAction}`);
		socket.emit("placeHacker", hackerAction);
	};
	this.claimLongestPath = function(pathList){
		socket.emit("msg", `<claimLongestPath> ${pathList}`);
		socket.emit("claimLongestPath", pathList);
	};
	this.rollOff = function(){
		socket.emit("msg", `<rollOff>`);
		socket.emit("rollOff");
	};
	this.create = function(un,pw){
		socket.emit("createAccount", {username:un, password:pw});
	}
	this.login = function(un,pw){
		socket.emit("login", {username:un, password:pw});
	}


})();
