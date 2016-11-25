//domEngine.js

var domEngine = new (function(){
	var dom = {};
	var get = (f)=>{return document.getElementById(f)};
	this.init = function(){
		dom = {
			overlay:get("overlay"),
			login:{
				container:get("loginContainer"),
				loginButton:get("loginButton"),
				createButton:get("loginCreateButton"),
				username:get("loginUsername"),
				password:get("loginPassword"),
				error:get("loginError")
			},
			chat:{
				container:get("chatContainer"),
				viewport:get("chatViewport"),
				button:get("chatButton"),
				input:get("chatInput")
			},
			resources:{
				container:get("resourcesContainer"),
				cpu:get("resourcesCPU"),
				bandwidth:("resourcesBandwidth"),
				power:("resourcesPower"),
				ram:get("resourcesRAM"),
				storage:get("resourcesStorage")
			}
		};

		dom.login.loginButton.onclick = ()=>{
			network.login(dom.login.username.value, dom.login.password.value);
		};
		dom.login.createButton.onclick = ()=>{
			network.create(dom.login.username.value, dom.login.password.value);
		};
		dom.chat.button.onlick = ()=>{
			network.broadcast(dom.chat.input.value); //clean on the server side
		}

	}
	this.hideLogin =function(){
		dom.login.container.style.display = "none";
		dom.resources.container.style.visibility = "visible";
		dom.chat.container.style.visibility = "visible";
	}
	this.loginError = function(msg){
		dom.login.error.innerHTML = msg;
		dom.login.error.style.visibility = "visible";
	}
	this.chatDisplay = function(msg){
		dom.chat.viewport.innerHTML +="<br>"+msg; //playerName :: msg
		dom.chat.viewport.scrollTop = dom.chat.viewport.scrollHeight; //always scroll to bottom of chat window
	}
	this.systemMessage = function(msg){
	  domEngine.chatDisplay("<div style='color:#323232;text-align:center;font-style:italic'>"+msg+"</div");
	}
	this.resourceUpdate = function(resources){
		dom.resources.cpu.innerHTML = resources.cpu;
		dom.resources.bandwidth.innerHTML = resources.bandwidth;
		dom.resources.power.innerHTML = resources.power;
		dom.resources.ram.innerHTML = resources.ram;
		dom.resources.storage.innerHTML = resources.storage;
	}
})();
