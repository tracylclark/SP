//domEngine.js

var domEngine = new (function(){
	var dom = {};
	var get = (f)=>{return document.getElementById(f)};
	this.init = function(){
		dom = {
			canvas: get("c"),
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
				bandwidth:get("resourcesBandwidth"),
				power:get("resourcesPower"),
				ram:get("resourcesRAM"),
				storage:get("resourcesStorage")
			},
			developments:{
				container:get("developmentCardContainer")
			},
			playerData:{
				container:get("playerDataContainer"),
				players:[
					{
						row:get("player1"),
						username:get("username1"),
						whiteHats:get("whiteHats1"),
						mostSecure:get("mostSecure1"),
						largestNetwork:get("largestNetwork1"),
						vp:get("vp1")
					},
					{
						row:get("player2"),
						username:get("username2"),
						whiteHats:get("whiteHats2"),
						mostSecure:get("mostSecure2"),
						largestNetwork:get("largestNetwork2"),
						vp:get("vp2")
					},
					{
						row:get("player3"),
						username:get("username3"),
						whiteHats:get("whiteHats3"),
						mostSecure:get("mostSecure3"),
						largestNetwork:get("largestNetwork3"),
						vp:get("vp3")
					},
					{
						row:get("player4"),
						username:get("username4"),
						whiteHats:get("whiteHats4"),
						mostSecure:get("mostSecure4"),
						largestNetwork:get("largestNetwork4"),
						vp:get("vp4")
					}
				]
			},
			popup:{
				container:get("popupContainer"),
				singleAction:{
					container:get("popupSingleAction"),
					button:get("popupSingleActionButton")
				},
				startGame:{
					container:get("popupStartGame"),
					button:get("startGame"),
					token: get("startGameTokenOption"),
					tile: get("startGameTileOption"),
					vendor: get("startGameVendorOption")
				},
				trade:{
					container: get("popupTrade"),
					static:{
						have: get("staticHave"),
						for: get("staticFor"),
						vendor31: get("vendor3:1"),
						bank: get("bank"),
						vendor21: get("vendor2:1"),
						button: get("offerTradeButton")
					},
					offer:{
						have: {
							cpu: get("haveCPU"),
							bandwidth: get("haveBandwidth"),
							storage: get("haveStorage"),
							power: get("havePower"),
							ram: get("haveRAM")
						},
						for: {
							cpu: get("forCPU"),
							bandwidth: get("forBandwidth"),
							storage: get("forStorage"),
							power: get("forPower"),
							ram: get("forRAM")
						},
						button: get("offerTradeButton")
					},
					endTrade: get("endTradeButton")
				},
				tradeOffer:{
					container: get("tradeOfferContainer"),
					from: get("fromDisplay"),
					have: get("haveDisplay"),
					for: get("forDisplay"),
					accept: get("acceptButton"),
					reject: get("rejectButton")
				}
			}
		};
		dom.login.loginButton.onclick = ()=>{
			network.login(dom.login.username.value, dom.login.password.value);
		};
		dom.login.createButton.onclick = ()=>{
			network.create(dom.login.username.value, dom.login.password.value);
		};
		dom.chat.button.onclick = ()=>{
			network.broadcast(dom.chat.input.value); //clean on the server side
		}
	}
	this.hideLogin =function(){
		dom.login.container.style.display = "none";
		dom.resources.container.style.visibility = "hidden";
		dom.chat.container.style.visibility = "visible";
		domEngine.showJoinGame();
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
	  domEngine.chatDisplay("<div style='color:#323232;text-align:center;font-style:italic'>"+msg+"</div>");
	}
	this.resourceUpdate = function(resources){
		dom.resources.cpu.innerHTML = resources.cpu;
		dom.resources.bandwidth.innerHTML = resources.bandwidth;
		dom.resources.power.innerHTML = resources.power;
		dom.resources.ram.innerHTML = resources.ram;
		dom.resources.storage.innerHTML = resources.storage;
	}
	this.popup = function(item){
		Object.keys(dom.popup).forEach(e=>{
			if(e==="container")return;
			dom.popup[e].container.style.visibility = "hidden";
		});
		dom.popup.container.style.visibility = "visible";
		dom.popup[item].container.style.visibility = "visible";
	}
	this.hidePopup = function(){
		dom.popup.container.style.visibility = "hidden";
	}
	this.showJoinGame = function(){ //logged in
		dom.popup.singleAction.button.value="Join Game";
		dom.popup.singleAction.button.onclick = ()=>network.joinGame();
		domEngine.popup("singleAction");
	}
	this.showStartGame = function(){ //joined the game
		dom.playerData.container.style.visibility = "visible";
		dom.resources.container.style.visibility = "visible";
		dom.resources.container.style.visibility = "visible";
		dom.popup.startGame.button.onclick = ()=>{
			network.startGame({
				tileDistribution:dom.popup.startGame.tile.value, //other
				tokenDistribution:dom.popup.startGame.token.value, //"random"
				vendorDistribution:dom.popup.startGame.vendor.value, //"slightShift" //other
			});
		};
		domEngine.popup("startGame");
	}
	this.showRollOff = function(){
		dom.popup.singleAction.button.value="Roll Off";
		dom.popup.singleAction.button.onclick = ()=>network.rollOff();
		domEngine.popup("singleAction");
	}
	this.showRollDice = function(){
		dom.popup.singleAction.button.value="Roll Dice";
		dom.popup.singleAction.button.onclick = ()=>network.rollDice();
		domEngine.popup("singleAction");
	}
	this.setPlayers = function(players){
		players.sort((a,b)=>a.order < b.order).forEach((e,i)=>{
			dom.playerData.players[i].username.innerHTML = e.username;
			dom.playerData.players[i].whiteHats.innerHTML = e.whiteHats;
			dom.playerData.players[i].mostSecure.innerHTML = e.mostSecure;
			dom.playerData.players[i].largestNetwork.innerHTML = e.largestNetwork;
			dom.playerData.players[i].vp.innerHTML = e.vp;
			dom.playerData.players[i].row.display = "table-row";
		});
	};
	this.showBuildServer = function(){
		dom.popup.singleAction.button.value="Build Server";
		canvasEngine.select = "vertex";
		dom.popup.singleAction.button.onclick = ()=>network.buildServer(canvasEngine.getSelectedVertex().coords);
		domEngine.popup("singleAction");
	}
	this.showBuildNetwork = function(){
		dom.popup.singleAction.button.value="Build Network";
		canvasEngine.select = "edge";
		dom.popup.singleAction.button.onclick = ()=>network.buildNetwork(canvasEngine.getSelectedEdge().coords);
		domEngine.popup("singleAction");
	}
	this.showBuildDatabase = function(){
		dom.popup.singleAction.button.value="Build Database";
		canvasEngine.select = "vertex";
		dom.popup.singleAction.button.onclick = ()=>network.buildDatabase(canvasEngine.getSelectedVertex().coords);
		domEngine.popup("singleAction");
	}
	this.showEndTurn = function(){
		dom.popup.singleAction.button.value = "End Turn";
		canvasEngine.select = "none";
		dom.popup.singleAction.button.onclick = ()=>network.endTurn();
		domEngine.popup("singleAction");
	}
	this.showTrade = function(){
		canvasEngine.select = "none";
		domEngine.popup("trade");
		dom.popup.trade.static.button.onclick = ()=>{
			var h = dom.popup.trade.static.have.value;
			var f = dom.popup.trade.static.for.value;
			var value =4;
			if(dom.popup.trade.static.vendor21.checked) value = 2;
			else if (dom.popup.trade.static.vendor31.checked) value = 3;
			var have = {}
			have[h]=value;
			network.staticTrade({have:have, for:f});
		}
		dom.popup.trade.offer.button.onclick = ()=>{
			var tradeObj = {
				have:{
					cpu : dom.popup.trade.offer.have.cpu.value,
					ram : dom.popup.trade.offer.have.ram.value,
					storage : dom.popup.trade.offer.have.storage.value,
					power : dom.popup.trade.offer.have.power.value,
					bandwidth : dom.popup.trade.offer.have.bandwidth.value
				},
				for:{
					cpu : dom.popup.trade.offer.for.cpu.value,
					ram : dom.popup.trade.offer.for.ram.value,
					storage : dom.popup.trade.offer.for.storage.value,
					power : dom.popup.trade.offer.for.power.value,
					bandwidth : dom.popup.trade.offer.for.bandwidth.value
				}
			};
			network.offerTrade(tradeObj);
		}
		dom.popup.trade.endTrade.onclick = ()=>network.endTrading();
	}
	this.showTradeOfferMenu = offer=>{
		domEngine.popup("tradeOffer");
		dom.popup.tradeOffer.from.innerHTML = offer.from+ " is offering the following trade...";
		var f = "For ::";
		var h = "Have ::";
		for(key in offer.for){
			if(offer.for[key]>0) f+= "  "+key+"-"+offer.for[key];
		}
		for(key in offer.have){
			if(offer.have[key]>0) h+= "  "+key+"-"+offer.have[key];
		}
		dom.popup.tradeOffer.for.innerHTML = f;
		dom.popup.tradeOffer.have.innerHTML = h;
		dom.popup.tradeOffer.reject.onclick = ()=>network.tradeResponse(false);
		dom.popup.tradeOffer.accept.onclick = ()=>network.tradeResponse(true);
	}

})();
