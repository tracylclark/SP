//map.js

module.exports = function(){
		const defaultTileLabels = ["storage","RAM","CPU","bandwidth","storage","RAM","RAM","power","bandwidth","CPU","power","power","bandwidth","RAM","CPU","power","storage","CPU","DarkNet"];
		this.init = function(options){
			var mapType = options.mapType;
			var gameMap = new GameMap(mapType);
		}
		function GameMap(mapType){
			this.vertices = new Array(11).fill(0).map((e)=>new Array(6).fill(0)); //create the vertices and fill with 0's
			this.vertices.forEach((e,i,a)=>a[i]=e.map((e,j)=>new Vertex({x:i,y:j}))); //this fills with base vertices, which holds references to Tiles/Edges
			this.tiles = initializeTiles(mapType);
          	this.edges = [];
            //use adjacency object to link tiles, vertices, and edges
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
		function Edge(left,right){
			this.left = left;
			this.right = right;
			this.road = null; //when a player places a road, it is created and contained in the edge object
		}
		function Tile(id, type){
			this.id = id;
			this.number = null;
			this.resource = type;
			this.robber = type==="DarkNet";
		}
		function initializeTiles(mapType){
			var tileTypeBuffer = defaultTileLabels; 
			if(mapType != "default"){
				var shuffledTileLabels = [], i; 
				//randomize tiles if not a default (beginner) map, use a Knuth Shuffle (one of the variants)
				while (tileTypeBuffer.length){
					i = Math.floor(Math.random() * tileTypeBuffer.length);
					shuffledTileLabels.push(tileTypeBuffer.splice(i, 1)[0]);
				}
				tileTypeBuffer = shuffledTileLabels;
			}
			return tileTypeBuffer.map((e,i)=> new Tile(i,e));
		}
};