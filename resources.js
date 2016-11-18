//resources.js
module.exports = function(){
	
	this.bandwidth = 0;
	this.storage = 0;
	this.cpu =  0;
	this.ram = 0;
	this.power = 0;
	this.add = function(res){
		this.bandwidth += res.bandwidth;
		this.storage += res.storage;
		this.cpu += res.cpu;
		this.ram += res.ram;
		this.power += res.power;
	}
	this.sub = function(res){
		this.bandwidth -= res.bandwidth;
		this.storage -= res.storage;
		this.cpu -= res.cpu;
		this.ram -= res.ram;
		this.power -= res.power;
	}
}