var camera = {
		x: 50,
		y: 50,
		zoom: 1
};

var clientEngine = new (function(){
	
	const sqrt3 = Math.sqrt(3); //cached
	var size = 80; //everything scales off of this
	var ctx = {};
	var canvas = {};
	var map = {
		vertices:[],
		edges:[],
		tiles:[]
	};
	this.init = function(){
		var socket = io();
		canvas = document.getElementById("c");
		console.log(canvas);
		ctx = canvas.getContext( "2d" );
		socket.emit("msg", "Hello world");
		socket.on("gameMap", e=>{
			map = JSON.parse(e);
		});
		setTimeout(()=>socket.emit("gimmeMap"), 100);
		clientEngine.resize();
		window.onresize = clientEngine.resize;
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
		map.edges.forEach(drawEdge);
		map.vertices.forEach((arr)=>arr.forEach(drawVertex));
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
	function drawVertex(vertex){
		if(!vertex.accessible){return;}
		var coords = translateVertexCoords(vertex.coords);
		ctx.fillStyle = "#a1a1a1";
		ctx.lineWidth = size/25;
		ctx.strokeStyle = "#000000";
		ctx.beginPath();
		ctx.arc(coords.x,coords.y,size*.1,0,2*Math.PI);
		ctx.stroke();
		ctx.fill();
	}
	function drawEdge(edge){
		var coordsV = translateVertexCoords(edge.v);
		var coordsU = translateVertexCoords(edge.u);
		ctx.lineWidth = size/25;
		ctx.strokeStyle = "#000000";
		ctx.beginPath();
		ctx.moveTo(coordsV.x, coordsV.y);
		ctx.lineTo(coordsU.x, coordsU.y);
		ctx.stroke();
	}
})();


window.onload = clientEngine.init;