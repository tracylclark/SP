//server.js

(function(){
	var expressServer = require('express')();
	var http = require('http').createServer(expressServer);
	var io = require('socket.io')(http);
	var myNetwork = require('./network.js');
	var network = new myNetwork(io);
	expressServer.get('/', (req, res)=> res.sendFile(__dirname + '/pub/index.html')); //updated from deprecated sendfile()
	expressServer.get(/^(.+)$/, function(req, res){ //define a path for any requests other than root domain
        console.log('static file request : ' + req.params);
        res.sendFile( __dirname + "/pub" + req.params[0]);
    });
	http.listen(8004, ()=> console.log('listening on *:8004') );
}());