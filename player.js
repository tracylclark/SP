//player.js
var Resources = require("./resources.js");

module.exports = function(player, color){
	this.socket = player.socket;
	this.username = player.username;
	this.color = color;
	this.resources = new Resources();
	this.victoryPoints = [];
	this.developments = [];
	this.infrastructure = {
		servers: [],
		databases: [],
		networks: []
	};
	this.vendors = [];
	this.largestNetwork = false;
	this.mostSecure = false;
	this.whiteHats = 0;
	this.getVPs = function(){
		return  infrastructure.servers.length +
				infrastructure.databases.length +
				(this.largestNetwork?2:0) +
				(this.mostSecure?2:0);
	}
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
	this.generateResources = function(roll){
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
	}
};
