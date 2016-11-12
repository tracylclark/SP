//map.js

module.exports = function(){
		const gameMapConstants = require('./constants.js');
		/**
		* public properties
		**/
		this.init = function(options){
			var mapType = options.mapType;
			var gameMap = new GameMap(mapType);
		}
		/*
		 Constructors
		*/
		function GameMap(mapType){
			this.vertices = initializeVertices(mapType);
			this.tiles = initializeTiles(mapType);
			this.edges = initializeEdges(mapType);
			//use adjacency object to link tiles, vertices, and edges
			//tester, next five lines remove
			var MapPrinter = require('./notes/print/MapPrinter.js');
			var p = new MapPrinter();
			p.printVertices(this.vertices); //take 2d array of vertex objects
			p.printTiles(this.tiles); // takes array of tile objects
			p.printEdges(this.edges); // takes array of edge objects
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
			this.vendor = null;
		}
		function Edge(u, v){
			this.u = u;
			this.v = v;
			this.road = null; //when a player places a road, it is created and contained in the edge object
		}
		function Tile(id, type){
			this.id = id;
			this.token = null;
			this.resource = type;
			this.robber = type==="DarkNet"; 
		}
  /*
  *	initializers
  */	
		function initializeEdges(mapType){
			return gameMapConstants.defaultEdgeCoords.map(e=>new Edge(e.v,e.u));
		}
		function initializeVertices(mapType){
			var vertices = new Array(11).fill(0).map((e)=>new Array(6).fill(0)); //create the vertices and fill with 0's
			vertices.forEach((e,i,a)=>a[i]=e.map((e,j)=>new Vertex({x:i,y:j}))); //this fills with base vertices, which holds references to Tiles/Edges  
			//implement vendors here
			return vertices;
		}
		function initializeTiles(mapType, tokenDistributionType){
			var tileTypeBuffer = gameMapConstants.defaultTileLabels.slice(); //make a copy of the defaultTileLabels using slice 
			if(mapType != "default"){
				var shuffledTileLabels = []; 
				//randomize tiles if not a default (beginner) map, use a Knuth Shuffle (one of the variants)
				while (tileTypeBuffer.length){
					var i = Math.floor(Math.random() * tileTypeBuffer.length);
					shuffledTileLabels.push(tileTypeBuffer.splice(i, 1)[0]);
				}
				tileTypeBuffer = shuffledTileLabels;
			}
			var tiles = tileTypeBuffer.map((e,i)=> new Tile(i,e));
			var tokenDistribution = [];
			if (tokenDistributionType == "default"){
				//start at bottom left, assign counter-clockwise spiral 
				//starting on hex 8 and working through our array
				tokenDistribution = gameMapConstants.tokenLocationMap['08'];
			}
			else if (tokenDistributionType == "variable"){
				//start at any corner, assign counter-clockwise spiral
				//for this option, another property will be passed, designating the start tile
				//another option, randomly pick from the tokenLocationMap -- prefer this
			}
			else{
				//true random, can't have 2 red tokens on adjacent tiles
				//create a token distribution that's random
			}
			//now distribute tokens
			tiles.forEach((e,i)=>e.token = gameMapConstants.defaultTokenObjects[tokenDistribution[i]]);
			return tiles;
		}
		function initializeFrame(mapType){
			var vendors = gameMapConstants.defaultVendorLabels.slice();//make a copy of the vendors list, if random will randomize this
			var order = [];
			if (mapType == "default"){
				order = gameMapConstants.frameSets[0].slice(); //make a copy of the frameSet we want
			}
			else if(mapType == "slightShift"){ //don't really like this name, think on it, this is when the frame shifts but still using default vendor list
				var i = Math.floor(Math.random() * gameMapConstants.frameSets.length); //get a  random number between 0 and 6
				order = gameMapConstants.frameSets[i].slice();
			}
			else{ //completely random, picks a random frame and then takes the default list and randomly assigns labels to the vendors 	
				//randomly slice a label out build a new randomized array, make label equal to this before moving on
				var randomizedVendors = [];
				while (vendors.length){
					var i = Math.floor(Math.random() * vendors.length);
					randomizedVendors.push(vendors.splice(i, 1)[0]);
				}
				vendors = randomizedVendors;
				var i = Math.floor(Math.random() * frameSets.length); //get a  random number between 0 and 6
				order = frameSets[i].slice(); //assign the randomly picked frameSet to our order
			}
			//apply the label to the current vendor vertices we are looking at
		}
		function initializeVendors(frameList, vendorList){ 
			//store as a property of a vertice
			//vertices.forEach((e,i,a)=>a[i]=e.map((e,j)=>new Vertex({x:i,y:j})));
			//for each pair of vertices in the assignment, grab one resource off the vendors list and apply it to both vertices
			//frameList.forEach((e,i,a)=>a[i]
		}
};