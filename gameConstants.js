//gameConstants.js

var Resources = require("./resources.js"); //b, s, c, r, p

module.exports ={
	costs:{//b, s, c, r, p
		server: new Resources(1,0,1,1,1),
		database: new Resources(0,3,0,2,0),
		network: new Resources(1,0,1,0,0),
		development: new Resources(0,1,0,1,1)
	},
	developmentCardLabels : ["goodQuarter", "goodQuarter", "monopoly", "monopoly", 
		"networkBuilding", "networkBuilding", "whiteHat", "whiteHat", "whiteHat", 
		"whiteHat", "whiteHat", "whiteHat", "whiteHat", "whiteHat", "whiteHat", 
		"whiteHat", "whiteHat", "whiteHat", "whiteHat", "whiteHat", "VPSupport", 
		"VPSupport","VPSupport","VPSupport","VPSupport"]	
}