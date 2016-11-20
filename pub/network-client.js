//network-client.js

var network = new (function(){

    var socket = io();
	socket.emit("msg", "Hello world");
	socket.on("gameMap", e=>{
		canvasEngine.setMap(JSON.parse(e));
	});
	setTimeout(()=>socket.emit("gimme the map"), 1000);

    socket.on("loginResult", function(res){});
    socket.on("createAccountResult", function(res){});
    this.create = (un,pw)=>{
        console.log("create?");
        socket.emit("createAccount", {username:un, password:pw})};
    this.login = (un,pw)=>socket.emit("login", {username:un, password:pw});


})();
