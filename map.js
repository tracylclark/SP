//map.js

module.exports = function(){
		const this.defaultTiles = ["storage","RAM","CPU","bandwidth","storage","RAM","RAM","power","bandwidth","CPU","power","power","bandwidth","RAM","CPU","power","storage","CPU","DarkNet"];
		this.init = function(options){
			var mapType = options.mapType;
			var gameMap = new GameMap(mapType);
			initializeTileTypes(mapType);

		}
		function GameMap(mapType){
			this.vertices = new Array(11).fill(new Array(6).fill(0)); //create the vertices and fill with 0's
			this.vertices.forEach((e,i)=>e.map((e,j)=>new Vertex({x:i,y:j}))); //this fills with base vertices, which holds references to Tiles/Edges
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
			this.tiles = ; //array of 18 tiles
			this.edges = ;
		}
		function Edge(left,right){
			this.left = left;
			this.right = right;
			this.road = null; //when a player places a road, it is created and contained in the edge object
		}
		function Tile(id){
			this.id = id;
			this.number = null;
			this.resource = null;
			this.robber = false;
		}
		function initializeTiles(mapType, tileObjects){
			var this.tiles = defaultTiles; 
			if(mapType != "default"){
				//randomize tiles if not a default (beginner) map, use a Knuth Shuffle (one of the variants)
			}
			for(var i=0; i<19; i++){
				//populate the tiles 
				if(tiles[i]=="DarkNet"){
					tileObjects[i].robber = true;
				}
				tileObjects[i].resource = tiles[i];
			}
		}
};