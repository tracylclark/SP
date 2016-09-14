//server.js

(function(){
	var players = [];

	var Player = require("./player.js"); 
	var map = new (require("./map.js"))();
	var expressServer = require('express')();
	var http = require('http').Server(expressServer);
	var io = require('socket.io')(http);
	var myNetwork = require('./network.js');
	var network = new myNetwork(io, players); 
	expressServer.get('/', (req, res)=> res.sendfile('pub\index.html') );

	map.init();
	network.init();
	http.listen(8084, ()=> console.log('listening on *:8084') );

}());
