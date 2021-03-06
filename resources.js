//resources.js

module.exports = function(b, s, c, r, p){
	this.bandwidth = b||0;
	this.storage = s||0;
	this.cpu = c||0;
	this.ram = r||0;
	this.power = p||0;

	this.add = function(res){
		this.bandwidth += (res.bandwidth||0)>>0;
		this.storage += (res.storage||0)>>0;
		this.cpu += (res.cpu||0)>>0;
		this.ram += (res.ram||0)>>0;
		this.power += (res.power||0)>>0;
	};
	this.sub = function(res){
		this.bandwidth -= (res.bandwidth||0)>>0;
		this.storage -= (res.storage||0)>>0;
		this.cpu -= (res.cpu||0)>>0;
		this.ram -= (res.ram||0)>>0;
		this.power -= (res.power||0)>>0;
	};
}