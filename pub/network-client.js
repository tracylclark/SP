//network-client.js

var network = new (function(){

    var socket = io();
	socket.emit("msg", "Hello world");
	socket.on("gameMap", e=>{
		canvasEngine.setMap(JSON.parse(e));
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
    this.create = (un,pw)=>socket.emit("createAccount", {username:un, password:pw});
    this.login = (un,pw)=>socket.emit("login", {username:un, password:pw});


})();
