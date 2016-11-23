//canvasEngine.js
var canvasEngine = new (function(){
	const sqrt3 = Math.sqrt(3); //cached
	const size = 80; //width of a hexagon(scales everything)

	var camera = {
		x: 50,
		y: 50,
		zoom: 1
	};
	var ctx = {};
	var canvas = {};
	var map = {
		vertices:[],
		edges:[],
		tiles:[]
	};
	var playerColors = {
		"purple":"#660066", 
		"red": "#990000", 
		"green": "#008141", 
		"orange": "#ff3300"
	}
	var resourceStyle = {
		"cpu": {img:"url(./cpu.png)", color:"#ffe6f9"},
		"ram": {img:"url(./ram.png)", color:"#ffd9b3"},
		"power": {img:"url(./power.png)", color:"#99b3ff"},
		"storage": {img:"url(./storage.png)", color:"#b3ffb3"},
		"bandwidth": {img:"url(./bandwidth.png)", color:"#ffff99"},
		"DarkNet": {img:"url(./darknet.png)", color:"#aaaaaa"},
	}
	var players = [];
	function Vertex(vertex){
		this.tiles = vertex.tiles;
		this.coords = vertex.coords;
		this.draw = function(ctx){
			if(!vertex.accessible){return;}
			var vertexSize = size*0.05;
			var coords = translateVertexCoords(vertex.coords);
			var structure = '';
			if(vertex.owner != null){
				vertexSize = size*0.1;
				structure = 'S';
				if(vertex.database){
					structure+=' D';
				}
				var playerColor = players.find(e=>e.username === vertex.owner).color;
				ctx.fillStyle = playerColors[playerColor];
			}
			else{
				ctx.fillStyle = "#a1a1a1";
			}
			ctx.lineWidth = size/25;
			ctx.strokeStyle = "#000000";
			ctx.beginPath();
			ctx.arc(coords.x,coords.y,size*.1,0,2*Math.PI);
			ctx.stroke();
			ctx.fill();
			ctx.fillStyle = "#000000";
			ctx.font=size*.1+"px Arial";
			ctx.fillText(structure, coords-(size*.1), coords-(size*.05));
		};
	}
	function Edge(edge){
		this.draw = function(ctx){
			var coordsV = translateVertexCoords(edge.v);
			var coordsU = translateVertexCoords(edge.u);
			ctx.lineWidth = size/25;
			ctx.strokeStyle = "#000000";
			if(edge.owner){
				ctx.lineWidth = size/20;	
				var playerColor = players.find(e=>e.username === edge.owner).color;
				ctx.strokeStyle = playerColors[playerColor];
			}
			ctx.beginPath();
			ctx.moveTo(coordsV.x, coordsV.y);
			ctx.lineTo(coordsU.x, coordsU.y);
			ctx.stroke();
		};
	}
	function Tile(tile){
		//find all vertices that touch this tile.
		//map to an array of just the coords of these vertices (the corners)
		//sort the corners by y value (top before bottom)
		//take each half, and sort the top by x value, the bottom by the inverse
		//concat the top and bottom back together.
		//this results in a list of corners in clockwise order starting with the top left
		var corners = map.vertices.filter(e=>e.tiles.find(t=>t===tile.id) !== undefined).map(e=>e.coords).sort((a,b)=>a.y - b.y);//sorts top half and bottom half
		corners = corners.slice(0,3).sort((a,b)=>a.x-b.x).concat(corners.slice(3,6).sort((a,b)=>b.x-a.x));
		this.draw = function(ctx){
			ctx.strokeStyle = "#a1a1a1";
			ctx.fillStyle = resourceStyle[tile.resource].color;
			ctx.beginPath();
			corners.forEach(e=>{
				var coords = translateVertexCoords(e);
				ctx.lineTo(coords.x,coords.y);
			})
			ctx.stroke();
			ctx.fill();
			if(!tile.resource==="DarkNet"){
				ctx.fillStyle = "#000000";
				ctx.font = size*.3 + "px arial";
				ctx.fillText(tile.token.number, corners[0].x+((corners[2].x-corners[0].x)/2)-size*.15, corners[0].y);
			}
			if(tile.hacker){
				ctx.strokeStyle = "#000000";
				ctx.fillStyle = "#ffffff";
				ctx.font = size*.2 + "px arial";
				ctx.fillText("H", corners[0].x+((corners[2].x-corners[0].x)/2)-size*.15, corners[0].y-size*.1);
				ctx.StrokeText("H", corners[0].x+((corners[2].x-corners[0].x)/2)-size*.15, corners[0].y-size*.1);
			}
		};
		//assuming you have a hex image (transparent corners, hex top is on first row of the image, hex left is in first column)
		//you can find the top left corner postition by the converted x-coord of the first corner, and the converted y-coord of the second corner.
	}
	this.setMap = function(m){
		map.vertices = m.vertices.map(arr=>arr.map(e=>new Vertex(e))).reduce((a,b)=>a.concat(b));
		map.edges = m.edges.map(e=>new Edge(e))
		map.tiles = m.tiles.map(e=>new Tile(e))
	}
	this.setPlayers = function(p){
		players = p.map();
	}
	this.init = function(){
		canvas = document.getElementById("c");
		ctx = canvas.getContext( "2d" );
		canvasEngine.resize();
		window.onresize = canvasEngine.resize;
		render();
	};
	this.resize = function(){
		canvas.style.width = canvas.width = window.innerWidth;
		canvas.style.height = canvas.height = window.innerHeight;
	};
	function render(){
		ctx.save();
		ctx.clearRect(0,0,canvas.width, canvas.height);
		ctx.scale(camera.zoom,camera.zoom);
		ctx.translate(camera.x,camera.y);
		map.tiles.forEach(e=>e.draw(ctx));
		map.edges.forEach(e=>e.draw(ctx));
		map.vertices.forEach(e=>e.draw(ctx));
		ctx.restore();
		requestAnimationFrame(render);
	}
	function translateVertexCoords(coords){
		var offset = size*2 / sqrt3;
		var cartesianCoords = {
			x: coords.x * size,
			y: coords.y * offset *1.5
		}
		if(coords.y % 2 === 0 && coords.x % 2 === 0){
			cartesianCoords.y += offset/2;
		}
		if(coords.y % 2 === 1 && coords.x % 2 === 1){
			cartesianCoords.y += offset/2;
		}
		return cartesianCoords;
	}

})();
