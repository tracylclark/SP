//network.js
var mongoClient = require("mongodb").MongoClient;
var db = {};
var collection = {};
const playerColors = ["purple", "red", "green", "orange"];
mongoClient.connect("mongodb://localhost:27017/tprestag", function(err, database){
	if (err) throw err;
	db = database;
	collection = db.collection("users");
	console.log("We connected to Mongo");
});
var gameEngine = {};
var players = [];
var spectators = [];
function Spectator(socket, username){
	this.socket = socket;
	this.username = username || "New User"; //later with username using login validation
}
var Player = require("./player.js");

module.exports = function(io){
	//handles all of the network traffic
	this.init = function(gameEngineReference, playersReference){
		gameEngine = gameEngineReference;
		players = playersReference;
	};
	this.io = io;
	this.updateResources = function(){
		players.forEach(e=>e.socket.emit("resourceUpdate", e.resources));
	};
	this.diceRoll = function(roll){
		io.emit("diceRollResult", roll);
	}
	this.updatePlayers = function(){
		io.emit("playerUpdate", players.map((e,i)=>{
			return {
				username: e.username,
				color: e.color,
				order: i,
				whiteHats: e.whiteHats,
				mostSecure: e.mostSecure,
				largestNetwork: e.largestNetwork,
				VPs: e.getVPs()
			};
		}));
	};
	this.updateMap = function(){
		io.emit("mapUpdate", gameEngine.getMap());
	}
	io.on("connect", socket=>{
		console.log("Client connected.");
		socket.on("msg", msg=>console.log(msg)); //debug test
		socket.on("login", credentials=>{ 
			collection.find(credentials).toArray((err, docs)=>{
				if(err !== null){
					socket.emit("loginResult", false);//message user about login failure
				}
				else{
					socket.emit("loginResult", true);
					login(socket, credentials.username);       
				}
			});
		});
		socket.on("createAccount", credentials=>{
			try{
				collection.insertOne(credentials);
				socket.emit("createAccountResult", true);
				login(socket, credentials.username, io);
			} catch(e){
				socket.emit("createAccountResult", false);
			}
		});
	});
};

function login(s, name, io){//credentials have been vetted at this point
	spectators.push(new Spectator(s, name));
	function spectatorLeaves(){
		var indexOfUser = spectators.map(function(e) { return e.socket; }).indexOf(s);
		if (indexOfUser != -1){
			console.log( s.username + " left.");
			io.emit("system", s.username + " left.");
			spectators.splice(indexOfUser, 1); //index to remove at, how many elements to remove.
		}
	}
	s.on("disconnect", spectatorLeaves);
	s.on("broadcast", msg=>{
		io.emit("broadcast", s.username + ":: " +msg);
	});
	s.on("joinGame", ()=>{
		if(players.length >= 4){
			s.emit("system", "This game is full.");
			return;
		}
		if(gameEngine.gamePhase !== "pregame"){
			s.emit("system", "This game has started.");
			return;
		}
		var indexOfUser = spectators.map(function(e) { return e.socket; }).indexOf(s);
		console.log( spectators[indexOfUser].username + " is becoming a player." + indexOfUser);
		var p = new Player(spectators.splice(indexOfUser, 1)[0], playerColors[players.length]); //index to remove at, how many elements to remove.
		players.push(p);
		p.socket.removeListener("disconnect", spectatorLeaves);
		setupPlayerSocket(p, io);
		//set up player socket callbacks
	});
}

function setupPlayerSocket(player, io){
	player.socket.on("disconnect", ()=>{
		io.emit("system", "A player left, game over");
		var indexOfUser = players.map(function(e) { return e.socket; }).indexOf(player.socket);
		if(indexOfUser != -1){
			players.splice(indexOfUser, 1);
			throw "Player Quit!";
		}
	});
	player.socket.on("startGame", options=>{
		player.socket.emit("actionSuccess", gameEngine.startGame(options)); //engine either responds with affirmative or negative
	});
	player.socket.on("rollOff", ()=>{
		player.socket.emit("actionSuccess", gameEngine.rollOff(player));
	});
	player.socket.on("buildNetwork", location=>{
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, location, gameEngine.buildNetwork));
	});
	player.socket.on("buildServer", location=>{
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, location, gameEngine.buildServer));
	});
	player.socket.on("endTurn", ()=>{
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, undefined, gameEngine.endTurn));
	});

	player.socket.on("rollDice", ()=>{
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, undefined, gameEngine.rollDice)); //this generates resources (unless a 7)
	});
	player.socket.on("placeHacker", tile=>{
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, tile, gameEngine.placeHacker));
	});

	player.socket.on("offerTrade", offer=>{
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, offer, gameEngine.offerTrade));
	});
	player.socket.on("staticTrade", trade=>{ //trade object defines vendor or bank (based on vendors in player obj)
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, trade, gameEngine.staticTrade));
	});
	player.socket.on("tradeResponse", response=>{ //accept or reject, if everyone rejects trade is taken down
		player.socket.emit("actionSuccess", gameEngine.tradeResponse(player, response));
	});
	player.socket.on("endTrading", ()=>{ //accept or reject, if everyone rejects trade is taken down
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, undefined, gameEngine.endTrading));
	});

	player.socket.on("buildDatabase", location=>{
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, location, gameEngine.buildDatabase));
	});
	player.socket.on("buyDevelopment", ()=>{
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, undefined, gameEngine.buyDevelopment));
	});
	player.socket.on("playDevelopment", development=>{
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, development, gameEngine.playDevelopment));
	});

	player.socket.on("claimLongestPath", coords=>{ //check against stored longest path
		player.socket.emit("actionSuccess", gameEngine.currentPlayerOnly(player, coords, gameEngine.claimLongestPath));
	});

}
