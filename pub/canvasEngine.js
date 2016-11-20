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
	function Vertex(vertex){
		this.tiles = vertex.tiles;
		this.coords = vertex.coords;
		this.draw = function(ctx){
			if(!vertex.accessible){return;}
			var coords = translateVertexCoords(vertex.coords);
			ctx.fillStyle = "#a1a1a1";
			ctx.lineWidth = size/25;
			ctx.strokeStyle = "#000000";
			ctx.beginPath();
			ctx.arc(coords.x,coords.y,size*.1,0,2*Math.PI);
			ctx.stroke();
			ctx.fill();
		};
	}
	function Edge(edge){
		this.draw = function(ctx){
			var coordsV = translateVertexCoords(edge.v);
			var coordsU = translateVertexCoords(edge.u);
			ctx.lineWidth = size/25;
			ctx.strokeStyle = "#000000";
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
		o(corners);
		this.draw = function(ctx){
			ctx.strokeStyle = "#a1a1a1";
			ctx.fillStyle = "#008141";
			ctx.beginPath();
			corners.forEach(e=>{
				var coords = translateVertexCoords(e);
				ctx.lineTo(coords.x,coords.y);
			})
			ctx.stroke();
			ctx.fill();
		};
		//assuming you have a hex image (transparent corners, hex top is on first row of the image, hex left is in first column)
		//you can find the top left corner postition by the converted x-coord of the first corner, and the converted y-coord of the second corner.
	}
	this.setMap = function(m){
		map.vertices = m.vertices.map(arr=>arr.map(e=>new Vertex(e))).reduce((a,b)=>a.concat(b));
		map.edges = m.edges.map(e=>new Edge(e))
		map.tiles = m.tiles.map(e=>new Tile(e))
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
