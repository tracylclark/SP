//network.js

module.exports = function(io, players){
	//handles all of the network traffic
	io.on("connect", function(socket) {
		socket.on("disconnect", function(socket){

		});
		socket.on("startGame", function(options){

		});
		socket.on("login", function(credentials){

		});
		socket.on("createAccount", function(credentials){

		});
		socket.on("buildRoad", function(edgeCoords){

		});
	});
    //this.init = function(options){

    //}

};