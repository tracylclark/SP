//player.js

module.exports = function(player, color){
	this.socket = player.socket;
	this.username = player.username;
	this.color = color;
	this.resources = new require("/.resources.js")();
	this.victoryPoints = [];
	this.developments = [];
	this.infrastructure = {
		servers: [],
		databases: [],
		networks: []
	};
	this.vendors = [];
	this.whiteHats = 0;
};