//player.js
var Resources = require("./resources.js");

module.exports = function(player, color){
	console.log(player.username + "is a new player!" + player.socket); //debug message
	this.socket = player.socket;
	this.username = player.username;
	this.color = color;
	this.resources = new Resources();
	this.victoryPoints = 0;
	this.developmentCards = [];
	this.infrastructure = {
		servers: [],
		databases: [],
		networks: []
	};
	this.vendors = [];
	this.largestNetwork = false;
	this.mostSecure = false;
	this.whiteHats = 0;
	this.rollOff = null;
	this.playedVPCards = 0;
	this.getVPs = function(){
		return  this.infrastructure.servers.length +
				this.infrastructure.databases.length +
				(this.largestNetwork?2:0) +
				(this.mostSecure?2:0)+
				this.playedVPCards;
	}.bind(this);
	this.steal = function(){
		var res = [
			Array(this.resources.bandwidth).fill("bandwidth"),
			Array(this.resources.storage).fill("storage"),
			Array(this.resources.cpu).fill("cpu"),
			Array(this.resources.ram).fill("ram"),
			Array(this.resources.power).fill("power")
		].reduce((a,b)=>a.concat(b));
		//pick resource at random
		var result = res[Math.floor(Math.random()*res.length)];
		this.resources[result]--;
		var retVal = new Resources();
		retVal[result] = 1;
		return retVal;
	};
	this.monopolize = function(resource){
		var loss = new Resources();
		loss[resource] = this.resources[resource];
		this.resources[resource] = 0;
		return loss;
	}
	this.generateResources = function(roll, gameMap){
		var total = new Resources();
		this.infrastructure.servers.forEach(s=>{
			s.tiles.forEach(tileId=>{
				total.add(gameMap.getResource(tileId, roll));
			});
		});
		this.infrastructure.databases.forEach(d=>{
			d.tiles.forEach(tileId=>{
				total.add(gameMap.getResource(tileId, roll));
			});
		});
		this.resources.add(total);
	}.bind(this);
	this.hasResources = function(resources){
		return 	this.resources.cpu >= (resources.cpu||0) &&
				this.resources.bandwidth >= (resources.bandwidth||0) &&
				this.resources.storage >= (resources.storage||0) &&
				this.resources.power >= (resources.power||0) &&
				this.resources.ram >= (resources.ram||0); 
	}.bind(this);
};