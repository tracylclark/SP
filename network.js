//network.js
var mongoClient = require("mongodb").MongoClient;
var db = {};
var collection = {};
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
	this.userName = "New User"; //later with username using login validation
}
function userQuery(db, un, callback) {
  collection.find({username: un}).toArray(function(err, docs) {
  	if (err != null) {
  		console.log("Error on attempting to find: " + err);
    	callback("error"); //error on trying to query the db
  	}
  	else callback(docs); //the docs object is null if the name doesn't exist
  });
}
function createUser(db, un, pw, callback){ //don't have to check for unique username here, handled in userQuery
  collection.insertOne({username : un, password: pw}, function(err, result){
  	if (err!=null) callback("error");
    else callback(result);
  });
}
module.exports = function(io){
	//handles all of the network traffic
  this.init = function(gameEngineReference, playersReference){
		gameEngine = gameEngineReference;
    players = playersReference;
  }
	io.on("connect", socket=>{
		console.log("Client connected.");
		socket.on("msg", msg=>console.log(msg)); //debug test
		
		function login(s, name){//credentials have been vetted at this point
      spectators.push(new Spectator(s, name));
      s.on("disconnect", ()=>{});
      s.on("joinGame", ()=>{});
      s.on("broadcast", msg=>{});
    }
		socket.on("login", credentials=>{ 
    	collection.find(credentials).toArray((err, docs)=>{
      	if(err !== null){
      		socket.emit("loginResult", false);//message user about login failure
        }
        else{
      		login(socket, credentials.userName);       
        }
		});
		socket.on("createAccount", credentials=>{
      collection.insert(credentials).toArray((err,docs)=>{
      	if(err){ //db is set up to only allow unique usernames, an error will occur if a duplicate is chosen
      		socket.emit("createAccountResult", false);//message user about account creation failure 
        }
        else{
     			login(socket, credentials.userName);
        }
      });
		});
    
		socket.on("buildRoad", edgeCoords=>{});   
		socket.on("startGame", options=>{});
	});
};
