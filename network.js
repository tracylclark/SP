//network.js

module.exports = function(io){//, players){
	//handles all of the network traffic
	console.log("I'm a network");
	//to remove, just for testing purposes all map references
	var Map = new require('./map.js');
	var m = new Map({
		tileDistribution:"default", //other
		tokenDistribution:"default", //"random"
		vendorDistribution:"default", //"slightShift" //other
	});
	io.on("connect", socket=>{
		console.log("Client connected.");
		socket.on("msg", msg=>console.log(msg));
		socket.on("gimmeMap", ()=>{
			console.log("map request");
			socket.emit("gameMap", m.getSerializedMap());
		});
		socket.on("disconnect", socket=>{

		});
		socket.on("startGame", options=>{

		});
		socket.on("login", credentials=>{

		});
		socket.on("createAccount", credentials=>{

		});
		socket.on("buildRoad", edgeCoords=>{

		});
	});
    //this.init = function(options){

    //}
};