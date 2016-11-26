//map.js
/*
	var Map = new require('./map.js');
	var m = new Map({
		tileDistribution:"default", //other
		tokenDistribution:"default", //"random"
		vendorDistribution:"default", //"slightShift" //other
	});
*/


var Resources = require("./resources.js");

module.exports = function(options){
	const gameMapConstants = require('./constants.js'); //load the constants
	var vertices;
	var tiles;
	initializeVertices(options.vendorDistribution);
	initializeTiles(options.tileDistribution, options.tokenDistribution);
	var edges;
	initializeEdges();
	gameMapConstants.vertexTileAdjacencies.forEach(e=>vertices[e.x][e.y].tiles = e.tiles); //links vertices & tiles  
	/* public properties */
	this.getSerializedMap = function(){
		return {
			vertices: vertices,
			tiles: tiles,
			edges: edges
		};
	};
	this.initialServerAvailable = function(vertex){
		if(vertices[vertex.x][vertex.y].accessible == false){
			return false;
		}
		if(vertices[vertex.x][vertex.y].edges.find(e=>vertices[edges[e].u.x][edges[e].u.y].owner !== null || vertices[edges[e].v.x][edges[e].v.y].owner !== null)){
			return false;
		}
		return true;
	};
	this.initialNetworkAvailable = function(player, edge){
		var e = findEdge(edge);
		if (!e || e.owner !== null){
			return false;
		} 
		//must be attached to player.lastBuiltServer
		if((e.u.x === player.lastBuiltServer.x && e.u.y === player.lastBuiltServer.y)
			|| (e.v.x === player.lastBuiltServer.x && e.v.y === player.lastBuiltServer.y)){
			return true;
		}
		return false;
	};
	this.serverAvailable = function(player, vertex){
		if(!this.initialServerAvailable(vertex)){
			return false;
		}
		if(!vertices[vertex.x][vertex.y].edges.find(e=>edges[e].owner === player.username)){
			return false;
		}
		return true;		
	}
	this.networkAvailable = function(player, edge){
		var e = findEdge(edge);
		if (!e || e.owner != null){
			return false;
		} 
		//check u
		if(vertices[e.u.x][e.u.y].owner === player.username || (vertices[e.u.x][e.u.y].owner === null&&vertices[e.u.x][e.u.y].edges.find(e=>edges[e].owner === player.username))){
				return true;
		}
		//check v
		if(vertices[e.v.x][e.v.y].owner === player.username || (vertices[e.v.x][e.v.y].owner === null&&vertices[e.v.x][e.v.y].edges.find(e=>edges[e].owner === player.username))){
				return true;
		}
		return false;
	};
	this.databaseAvailable = function(player, vertex){
		return vertices[vertex.x][vertex.y].server && !vertices[vertex.x][vertex.y].database && vertices[vertex.x][vertex.y].owner === player.username;
	};
	this.buildServer = function(player, vertex){
		vertices[vertex.x][vertex.y].owner = player.username;
		vertices[vertex.x][vertex.y].server = true;
		player.infrastructure.servers.push(vertices[vertex.x][vertex.y]);
		if(vertices[vertex.x][vertex.y].vendor)player.vendors.push(vertices[vertex.x][vertex.y].vendor);
		player.vp += 1;
	};
	this.buildNetwork = function(player, edge){
		var e = findEdge(edge);
		e.owner = player.username;
		player.infrastructure.networks.push(e);
	}
	this.buildDatabase = function(player, vertex){
		vertices[vertex.x][vertex.y].database = true;
		player.infrastructure.databases.push(vertices[vertex.x][vertex.y]);
		player.vp +=1;
	}
	this.getResource = function(tileId, roll){
		var retVal = new Resources();
		var tile = tiles[tileId];
		if(tile.token && tile.token.number === roll && !tile.hacker){
			retVal[tile.resource] = 1;
		}
		return retVal;
	};
	this.hasTile = function(targetPlayer, targetTile){
		console.log("in hasTile");
		console.log(targetPlayer);
		console.log(targetTile);
		console.log(targetPlayer.infrastructure.servers.find(e=>e.tiles.find(t=>t.id===targetTile)));
		return targetPlayer.infrastructure.servers.find(e=>e.tiles.find(t=>t.id===targetTile)) != undefined;
	}
	this.placeHacker = function(tileId){
		if(!tiles[tileId] || tiles[tileId].hacker){
			console.log("place hacker invalid");
			return false;
		}
		tiles.find(e=>e.hacker).hacker = false;
		tiles[tileId].hacker = true;
		return true;
	};
	function findEdge(edge){ //takes {xy}{xy} vertex coord pair to find a reference to a specific edge piece
		return edges.find(e=>{
			return (e.u.x === edge.u.x && e.u.y === edge.u.y && e.v.x === edge.v.x && e.v.y === edge.v.y)
				|| (e.u.x === edge.v.x && e.u.y === edge.v.y && e.v.x === edge.u.x && e.v.y === edge.u.y);
		});
	}
	function Vertex(coords){
		var invalidCoords = [
			{x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:9, y:0}, {x:10, y:0}, {x:10, y:1},
			{x:0, y:4}, {x:0, y:5}, {x:1, y:5}, {x:9, y:5}, {x:10, y:4}, {x:10, y:5}
		];
		this.coords = coords || {x:0,y:0};
		this.accessible = true; 
		if(invalidCoords.find((e)=>this.coords.x == e.x && this.coords.y == e.y)){
			this.accessible = false; //invalid coords are not accessible
		}
		this.tiles = []; //array of 18 tiles
		this.edges = [];
		this.owner = null;
		this.vendor = null;
		this.server = false;
		this.database = false;
	}
	function Edge(u, v){
		this.u = u;
		this.v = v;
		this.owner = null; //when a player places a road, it is created and contained in the edge object
	}
	function Tile(id, type){
		this.id = id;
		this.token = null;
		this.resource = type;
		this.hacker = type==="DarkNet"; 
	}
	/*initializers*/	
	function initializeEdges(){
		edges = gameMapConstants.defaultEdgeCoords.map(e=>new Edge(e.v,e.u));
		edges.forEach((e,i)=>{ 
			vertices[e.u.x][e.u.y].edges.push(i); 
			vertices[e.v.x][e.v.y].edges.push(i);
		}); //links vertices & edges
	}
	function initializeVertices(vendorDistribution){
		vertices = new Array(11).fill(0).map((e)=>new Array(6).fill(0)); //create the vertices and fill with 0's
		vertices.forEach((e,i,a)=>a[i]=e.map((e,j)=>new Vertex({x:i,y:j}))); //this fills with base vertices, which holds references to Tiles/Edges  
		initializeVendors(vendorDistribution);
	}
	function initializeTiles(tileDistribution, tokenDistribution){
		var tileTypeBuffer = gameMapConstants.defaultTileLabels.slice(); //make a copy of the defaultTileLabels using slice 
		if(tileDistribution != "default"){
			var shuffledTileLabels = []; 
			while (tileTypeBuffer.length){ //randomize tiles if not a default (beginner) map, use a Knuth Shuffle (one of the variants)
				var i = Math.floor(Math.random() * tileTypeBuffer.length);
				shuffledTileLabels.push(tileTypeBuffer.splice(i, 1)[0]);
			}
			tileTypeBuffer = shuffledTileLabels;
		}
		tiles = tileTypeBuffer.map((e,i)=> new Tile(i,e));
		var tokenSet = [];
		if (tokenDistribution == "default"){ //start at bottom left, assign counter-clockwise spiral 
			tokenSet = gameMapConstants.tokenLocationMap['08']; //starting on hex 8 and working through our array
		}
		else if (tokenDistribution == "random"){ //start at any corner, assign counter-clockwise spiral
			var keys = ["00","02","04","06","08","10"]; //randomly choose starting position from tokenLocationMap
			tokenSet = gameMapConstants.tokenLocationMap[keys[Math.floor(Math.random()*6)]]; 
		}
		//tiles.forEach((e,i)=>e.token = gameMapConstants.defaultTokenObjects[tokenSet[i]]); //now distribute tokens
		var i = 0;
		var j = 0;
		while(i<19){
			if(!tiles[i].hacker){
				tiles[i].token = gameMapConstants.defaultTokenObjects[tokenSet[j]]; 
				j++;
			} 
			i++;
		}
	}
	function initializeVendors(vendorDistribution){
		var vendors = gameMapConstants.defaultVendorLabels.slice();//make a copy of the vendors list, if random will randomize this
		var order = [];
		if (vendorDistribution == "default"){
			order = gameMapConstants.frameSets[0].slice(); //make a copy of the frameSet we want
		}
		else if(vendorDistribution == "slightShift"){ //don't really like this name, think on it, this is when the frame shifts but still using default vendor list
			let i = Math.floor(Math.random() * gameMapConstants.frameSets.length); //get a  random number between 0 and 6
			order = gameMapConstants.frameSets[i].slice();
		}
		else{ //completely random, picks a random frame and then takes the default list and randomly assigns labels to the vendors 	
			var randomizedVendors = []; //randomly slice a label out build a new randomized array, make label equal to this before moving on
			while (vendors.length){
				let i = Math.floor(Math.random() * vendors.length);
				randomizedVendors.push(vendors.splice(i, 1)[0]);
			}
			vendors = randomizedVendors;
			let i = Math.floor(Math.random() * gameMapConstants.frameSets.length); //get a  random number between 0 and 6
			order = gameMapConstants.frameSets[i].slice(); //assign the randomly picked frameSet to our order
		}
			//apply the label to the current vendor vertices we are looking at
			order.map((e,i)=> [{coords:e[0], type:vendors[i]}, {coords:e[1], type:vendors[i]}]).reduce((a,b)=>a.concat(b)).forEach(e=>{
			vertices[e.coords.x][e.coords.y].vendor = e.type; //find the vertex described by e.coords & give it the vendor described by e.type
		});
	}
};