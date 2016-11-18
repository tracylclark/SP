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
function Spectator(socket){
	this.socket = socket;
	this.username = "New User"; //later with username using login validation
}
var Player = require("./player.js");

module.exports = function(io){
	//handles all of the network traffic
	this.init = function(gameEngineReference, playersReference){
		gameEngine = gameEngineReference;
		players = playersReference;
	};
	io.on("connect", socket=>{
		console.log("Client connected.");
		socket.on("msg", msg=>console.log(msg)); //debug test
		socket.on("login", credentials=>{ 
			collection.find(credentials).toArray((err, docs)=>{
				if(err !== null){
					socket.emit("loginResult", false);//message user about login failure
				}
				else{
					login(socket, credentials.username);       
				}
			});
		});
		socket.on("createAccount", credentials=>{
			collection.insert(credentials).toArray((err,docs)=>{
				if(err){ //db is set up to only allow unique usernames, an error will occur if a duplicate is chosen
					socket.emit("createAccountResult", false);//message user about account creation failure 
				}
				else{
					login(socket, credentials.username, io);
				}
			});
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
		if(gameEngine.status !== "joining"){
			s.emit("system", "This game has started.");
			return;
		}
		var indexOfUser = spectators.map(function(e) { return e.socket; }).indexOf(s);
		console.log( s.username + " is becoming a player.");
		var p = new Player(spectators.splice(indexOfUser, 1), playerColors[players.length]); //index to remove at, how many elements to remove.
		players.push(p);
		p.socket.removeListener("disconnect", spectatorLeaves);
		setupPlayerSocket(p, io);
		//set up player socket callbacks
	});
}

function setupPlayerSocket(player, io){
	function playerLeaves(){
		io.emit("system", "A player left, game over");
		var indexOfUser = players.map(function(e) { return e.socket; }).indexOf(player.socket);
		if(indexOfUser != -1){
			players.splice(indexOfUser, 1);
			throw "Player Quit!";
		}
	}
	player.socket.on("disconnect", playerLeaves);
	player.socket.on("startGame", options=>{
		player.socket.emit("system", gameEngine.startGame(options)); //engine either responds with affirmative or negative
	});
	player.socket.on("buildNetwork", location=>{
		player.socket.emit("system", gameEngine.buildNetwork(player, location));
	});
	player.socket.on("buildDatabase", location=>{
		player.socket.emit("system", gameEngine.buildDatabase(player, location));
	});
	player.socket.on("buildServer", location=>{
		player.socket.emit("system", gameEngine.buildServer(player, location));
	});
	player.socket.on("buyDevelopment", ()=>{
		player.socket.emit("system", gameEngine.buyDevelopment(player));
	});
	player.socket.on("endTurn", ()=>{
		player.socket.emit("system", gameEngine.endTurn(player));
	});
	player.socket.on("rollDice", ()=>{
		player.socket.emit("system", gameEngine.rollDice(player)); //this generates resources (unless a 7)
	});
	player.socket.on("playDevelopment", development=>{
		player.socket.emit("system", gameEngine.playDevelopment(player, development));
	});
	player.socket.on("offerTrade", offer=>{
		player.socket.emit("system", gameEngine.offerTrade(player, offer));
	});
	player.socket.on("staticTrade", trade=>{ //trade object defines vendor or bank (based on vendors in player obj)
		player.socket.emit("system", gameEngine.staticTrade(player, trade));
	});
	player.socket.on("tradeResponse", response=>{ //accept or reject, if everyone rejects trade is taken down
		player.socket.emit("system", gameEngine.tradeResponse(player, response));
	});
	player.socket.on("placeHacker", tile=>{
		player.socket.emit("system", gameEngine.placeHacker(player, tile));
	});
	player.socket.on("claimLongestPath", coords=>{ //check against stored longest path
		player.socket.emit("system", gameEngine.claimLongestPath(player, coords));
	});
}
