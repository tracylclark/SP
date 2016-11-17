//gameEngine.js
var Map = new require('./map.js');
var map = {};
var network = {};
var players = [];

module.exports = function(){
	this.init = function(networkReference, playersReference){
    network = networkReference; //create a reference to the network module for communication purposes
    players = playersReference;
  }
	this.startGame = function(gameOptions){
    map = new Map(gameOptions);
  } 
};