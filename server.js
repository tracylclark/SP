//server.js

(function(){
	var expressServer = require('express')();
	var http = require('http').createServer(expressServer);
	var io = require('socket.io')(http);
	var Network = require('./network.js');
	var GameEngine = require('./gameEngine.js');
	var network = new Network(io);
	var gameEngine = new GameEngine();
	var players = [];
	network.init(gameEngine, players);
	gameEngine.init(network, players);

	expressServer.get('/', (req, res)=> res.sendFile(__dirname + '/pub/index.html')); //updated from deprecated sendfile()
	expressServer.get(/^(.+)$/, function(req, res){ //define a path for any requests other than root domain
		console.log('static file request : ' + req.params);
		res.sendFile( __dirname + "/pub" + req.params[0]);
	});
	http.listen(8004, ()=> console.log('listening on *:8004') );
}());