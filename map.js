//map.js

module.exports = function(){
		//at some point, pull all consts out and create a constants module 			
		//const gameMapConstants = require('./gameData/tileLabels.JSON') -- possible option
		const defaultTileLabels = ["storage","RAM","CPU","bandwidth","storage","RAM","RAM","power","bandwidth","CPU","power","power","bandwidth","RAM","CPU","power","storage","CPU","DarkNet"];
		const defaultTokenObjects = [
			{number: 5, color: "black", letter: 'A'}, 
			{number: 2, color: "black", letter: 'B'}, 
			{number: 6, color: "red", letter: 'C'},  
			{number: 3, color: "black", letter: 'D'},
			{number: 8, color: "red" , letter: 'E'},
			{number: 10, color: "black", letter: 'F'}, 
			{number: 9, color: "black", letter: 'G'}, 
			{number: 12, color: "black", letter: 'H'}, 
			{number: 11, color: "black", letter: 'I'}, 
			{number: 4, color: "black", letter: 'J'}, 
			{number: 8, color: "red", letter: 'K'}, 
			{number: 10, color: "black", letter: 'L'},
			{number: 9, color: "black", letter: 'M'}, 
			{number: 4, color: "black", letter: 'N'}, 
			{number: 5, color: "black", letter: 'O'},
			{number: 6, color: "red", letter: 'P'},   
			{number: 3, color: "black", letter: 'Q'}, 
			{number: 11, color: "black", letter: 'R'}, 
		];
		const tokenLocationMap = {
			'00': [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 12, 17, 16, 15, 14, 13, 18],
			'02': [2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 13, 12, 17, 16, 15, 14, 18],
			'04': [4, 3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 14, 13, 12, 17, 16, 15, 18],
			'06': [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7, 15, 14, 13, 12, 17, 16, 18], 
			'08': [8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 16, 15, 14, 13, 12, 17, 18],
			'10': [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 17, 16, 15, 14, 19, 12, 18],
		}
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
  */	function initializeEdges(mapType){
			var edges = [ //holds vertice coords
				new Edge({x:07,y:05},{x:08,y:05}), new Edge({x:07,y:05},{x:06,y:05}),
				new Edge({x:05,y:05},{x:06,y:05}), new Edge({x:05,y:05},{x:04,y:05}),
				new Edge({x:03,y:05},{x:04,y:05}), new Edge({x:03,y:05},{x:02,y:05}),
				new Edge({x:08,y:04},{x:08,y:05}), new Edge({x:06,y:04},{x:06,y:05}),
				new Edge({x:04,y:04},{x:04,y:05}), new Edge({x:02,y:04},{x:02,y:05}),
				new Edge({x:08,y:04},{x:09,y:04}), new Edge({x:08,y:04},{x:07,y:04}),
				new Edge({x:06,y:04},{x:07,y:04}), new Edge({x:06,y:04},{x:05,y:04}),
				new Edge({x:04,y:04},{x:05,y:04}), new Edge({x:04,y:04},{x:03,y:04}),
				new Edge({x:02,y:04},{x:03,y:04}), new Edge({x:02,y:04},{x:01,y:04}),
				new Edge({x:09,y:03},{x:09,y:04}), new Edge({x:07,y:03},{x:07,y:04}),
				new Edge({x:05,y:03},{x:05,y:04}), new Edge({x:03,y:03},{x:03,y:04}),
				new Edge({x:01,y:03},{x:01,y:04}), new Edge({x:09,y:03},{x:10,y:03}),
				new Edge({x:09,y:03},{x:08,y:03}), new Edge({x:07,y:03},{x:08,y:03}),
				new Edge({x:07,y:03},{x:06,y:03}), new Edge({x:05,y:03},{x:06,y:03}),
				new Edge({x:05,y:03},{x:04,y:03}), new Edge({x:03,y:03},{x:04,y:03}),
				new Edge({x:03,y:03},{x:02,y:03}), new Edge({x:01,y:03},{x:02,y:03}),
				new Edge({x:01,y:03},{x:00,y:03}), new Edge({x:10,y:02},{x:10,y:03}),
				new Edge({x:08,y:02},{x:08,y:03}), new Edge({x:06,y:02},{x:06,y:03}),
				new Edge({x:04,y:02},{x:04,y:03}), new Edge({x:02,y:02},{x:02,y:03}),
				new Edge({x:00,y:02},{x:00,y:03}), new Edge({x:09,y:02},{x:10,y:02}),
				new Edge({x:09,y:02},{x:08,y:02}), new Edge({x:07,y:02},{x:08,y:02}),
				new Edge({x:07,y:02},{x:06,y:02}), new Edge({x:05,y:02},{x:06,y:02}),
				new Edge({x:05,y:02},{x:04,y:02}), new Edge({x:03,y:02},{x:04,y:02}),
				new Edge({x:03,y:02},{x:02,y:02}), new Edge({x:01,y:02},{x:02,y:02}),
				new Edge({x:01,y:02},{x:00,y:02}), new Edge({x:09,y:01},{x:09,y:02}),
				new Edge({x:07,y:01},{x:07,y:02}), new Edge({x:05,y:01},{x:05,y:02}),
				new Edge({x:03,y:01},{x:03,y:02}), new Edge({x:01,y:01},{x:01,y:02}),
				new Edge({x:08,y:01},{x:09,y:01}), new Edge({x:08,y:01},{x:07,y:01}),
				new Edge({x:06,y:01},{x:07,y:01}), new Edge({x:06,y:01},{x:05,y:01}),
				new Edge({x:04,y:01},{x:05,y:01}), new Edge({x:04,y:01},{x:03,y:01}),
				new Edge({x:02,y:01},{x:03,y:01}), new Edge({x:02,y:01},{x:01,y:01}),
				new Edge({x:08,y:01},{x:08,y:00}), new Edge({x:06,y:00},{x:06,y:01}),
				new Edge({x:04,y:00},{x:04,y:01}), new Edge({x:02,y:00},{x:02,y:01}),
				new Edge({x:07,y:00},{x:08,y:00}), new Edge({x:02,y:00},{x:03,y:00}),
				new Edge({x:03,y:00},{x:04,y:00}), new Edge({x:04,y:00},{x:05,y:00}),
				new Edge({x:05,y:00},{x:06,y:00}), new Edge({x:06,y:00},{x:07,y:00})
			];
  			return edges;
		}
		function initializeVertices(mapType){
			var vertices = new Array(11).fill(0).map((e)=>new Array(6).fill(0)); //create the vertices and fill with 0's
			vertices.forEach((e,i,a)=>a[i]=e.map((e,j)=>new Vertex({x:i,y:j}))); //this fills with base vertices, which holds references to Tiles/Edges  
			return vertices;
		}
		function initalizeEdges(mapType){
			//initialize edges 
		}
		function initializeTiles(mapType, tokenDistributionType){
			var tileTypeBuffer = defaultTileLabels.slice(); //make a copy of the defaultTileLabels using slice 
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
				tokenDistribution = tokenLocationMap['08'];
			}
			else if (tokenDistributionType == "variable"){
				//start at any corner, assign counter-clockwise spiral
				//for this option, another property will be passed, designating the start tile
				//another option, randomly pick from the tokenLocationMap -- prefer this
			}
			else{
				//true random, can't have 2 red tokens on adjacent tiles\
				//create a token distribution that's random
			}
			//now distribute tokens
			tiles.forEach((e,i)=>e.token = defaultTokenObjects[tokenDistribution[i]]);
			return tiles;
		}
};