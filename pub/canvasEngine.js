//canvasEngine.js
var canvasEngine = new (function(){

	this.select = "none";
	this.roll = {
		spin: false,
		show: false,
		currentLeft: 1,
		currentRight: 1,
		hold: true
	};
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
		this.selected = false;
		this.tiles = vertex.tiles;
		this.coords = vertex.coords;
		this.wasClicked = function(click){
			var coords = translateVertexCoords(vertex.coords);
			// if(vertex.coords.x === 2 && vertex.coords.y === 2){
			// 	console.log(`[2,2] dx: ${click.x - coords.x}  dy: ${click.y - coords.y}`);
			// }
			return size*.1 >= Math.sqrt(Math.pow(click.x - coords.x, 2) + Math.pow(click.y - coords.y, 2));
		}
		this.draw = function(ctx){
			if(!vertex.accessible){return;}
			var vertexSize = size*0.1;
			var coords = translateVertexCoords(vertex.coords);
			var structure = '';
			if(vertex.owner != null){
				vertexSize = size*0.15;
				structure = 'S';
				if(vertex.database){
					structure = 'D';
				}
				var playerColor = players.find(e=>e.username === vertex.owner).color;
				ctx.fillStyle = playerColors[playerColor];
			}
			else{
				ctx.fillStyle = "#a1a1a1";
			}
			ctx.lineWidth = size/25;
			ctx.strokeStyle = "#000000";
			if(this.selected){
				ctx.lineWidth = size/15;
				ctx.strokeStyle = "#ededed";
			}
			ctx.beginPath();
			ctx.arc(coords.x,coords.y,vertexSize,0,2*Math.PI);
			ctx.stroke();
			ctx.fill();
			ctx.fillStyle = "#FFFFFF";
			ctx.font=size*.2+"px arial";
			ctx.fillText(structure, coords.x-(size*.1), coords.y+(size*.1));
		}.bind(this);
	}
	function Edge(edge){
		this.selected = false;
		this.coords = {u:edge.u, v:edge.v};
		this.draw = function(ctx){
			var coordsV = translateVertexCoords(edge.v);
			var coordsU = translateVertexCoords(edge.u);
			ctx.lineWidth = size/25;
			ctx.strokeStyle = "#000000";
			if(this.selected){
				ctx.lineWidth = size/15;
				ctx.strokeStyle = "#ededed";
			}
			if(edge.owner){
				ctx.lineWidth = size/20;
				var playerColor = players.find(e=>e.username === edge.owner).color;
				ctx.strokeStyle = playerColors[playerColor];
			}
			ctx.beginPath();
			ctx.moveTo(coordsV.x, coordsV.y);
			ctx.lineTo(coordsU.x, coordsU.y);
			ctx.stroke();
		}.bind(this);
		this.wasClicked = function(click){
			var coordsV = translateVertexCoords(edge.v);
			var coordsU = translateVertexCoords(edge.u);
			var box = {
				left:Math.min(coordsV.x, coordsU.x),
				right:Math.max(coordsV.x, coordsU.x),
				top:Math.min(coordsV.y, coordsU.y),
				bottom:Math.max(coordsV.y, coordsU.y)
			}
			if(box.left - box.right < 1){
				box.left -= size*.2;
				box.right += size*.2;
			}
			// if(edge.v.x === 2 && edge.v.y === 2 && edge.u.x == 3 && edge.u.y === 2){
			// 	console.log(`[2,2]->[3,2] dx: ${click.x - box.left}  dy: ${click.y - box.top}`);
			// 	console.log(click.x < box.right);
			// 	console.log(click.x > box.left);
			// 	console.log(click.y > box.top);
			// 	console.log(click.y < box.bottom);
			// }
			return click.x < box.right && click.x > box.left && click.y > box.top && click.y < box.bottom;
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
		this.selected = false;
		this.id = tile.id;
		this.wasClicked = function(click){
			var topLeft = translateVertexCoords(corners[0]);
			var bottomRight = translateVertexCoords(corners[3]);
			// if(click.x > topLeft.x && click.x < bottomRight.x && click.y > topLeft.y && click.y < bottomRight.y) console.log("that's me");
			return click.x > topLeft.x && click.x < bottomRight.x && click.y > topLeft.y && click.y < bottomRight.y;
		}
		this.draw = function(ctx){
			ctx.strokeStyle = "#a1a1a1";
			ctx.fillStyle = resourceStyle[tile.resource].color;
			ctx.beginPath();
			corners.forEach(e=>{
				var coords = translateVertexCoords(e);
				ctx.lineTo(coords.x,coords.y);
			})
			ctx.lineWidth = size/25;
			ctx.strokeStyle = "#000000";
			if(this.selected){
				ctx.lineWidth = size/4;
				ctx.strokeStyle = "#ededed";
			}
			ctx.stroke();
			ctx.fill();
			if(tile.token){
				var tokenCoords = translateVertexCoords(corners[0]);
				ctx.fillStyle = "#000000";
				ctx.font = size*.3 + "px arial";
				ctx.fillText(tile.token.number, tokenCoords.x+(size*.2), tokenCoords.y+(size*.2));
			}
			if(tile.hacker){
				var hackerCoords = translateVertexCoords(corners[2]);
				ctx.strokeStyle = "#000000";
				ctx.fillStyle = "#ffffff";
				ctx.font = size*.35 + "px arial";
				ctx.fillText("H", hackerCoords.x-(size*.5),hackerCoords.y+(size*.2));
				ctx.strokeText("H",  hackerCoords.x-(size*.5),hackerCoords.y+(size*.2));
			}
			ctx.strokeStyle = "#000000";
			ctx.font = size*.35 + "px arial";
			var resourceCoords = translateVertexCoords(corners[5]);
			ctx.strokeText(tile.resource, resourceCoords.x+(size*.3), resourceCoords.y-(size*.3));
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
		players = p;
	}
	this.init = function(){
		canvas = document.getElementById("c");
		ctx = canvas.getContext( "2d" );
		canvasEngine.resize();
		window.onresize = canvasEngine.resize;

		canvas.addEventListener("mousedown", (event)=>{
			var rect = canvas.getBoundingClientRect();
			var click = {x:event.pageX - rect.left - camera.x, y:event.pageY - rect.top - camera.y};
			var vert = map.vertices.find(e=>e.wasClicked(click));
			var edge = map.edges.find(e=>e.wasClicked(click));
			var tile = map.tiles.find(e=>e.wasClicked(click));
			map.vertices.forEach(e=>e.selected = false);
			map.edges.forEach(e=>e.selected = false);
			map.tiles.forEach(e=>e.selected = false);
			if(vert && canvasEngine.select === "vertex"){
				vert.selected = true;
			}
			if(edge && canvasEngine.select === "edge"){
				edge.selected = true;
			}
			if(tile && canvasEngine.select === "tile"){
				tile.selected = true;
			}

		}, true)
		render();
	};
	this.getSelectedVertex = function(){
		return map.vertices.find(e=>e.selected);
	};
	this.getSelectedEdge = function(){
		return map.edges.find(e=>e.selected);
	}
	this.getSelectedTile = function(){
		return map.tiles.find(e=>e.selected).id;
	}
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
		if(canvasEngine.roll.spin){
			canvasEngine.roll.hold = !canvasEngine.roll.hold;
			if(canvasEngine.roll.hold){
				canvasEngine.roll.currentLeft = Math.floor((Math.random()*6)+1);
				canvasEngine.roll.currentRight = Math.floor((Math.random()*6)+1);
			}
		}
		if(canvasEngine.roll.show){
			drawDie(ctx,canvasEngine.roll.currentLeft,size*15, size*3);
			drawDie(ctx,canvasEngine.roll.currentRight,size*16.5, size*3);
		}
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
	var faces = [
		[[]], //0
		[[0,0,0],[0,1,0],[0,0,0]],
		[[1,0,0],[0,0,0],[0,0,1]],
		[[1,0,0],[0,1,0],[0,0,1]],
		[[1,0,1],[0,0,0],[1,0,1]],
		[[1,0,1],[0,1,0],[1,0,1]],
		[[1,0,1],[1,0,1],[1,0,1]]
	];
	function drawDie(ctx, num, x, y){
		ctx.fillStyle = "#000000";
		ctx.fillRect(x,y,size,size);
		ctx.fillStyle = "#ffffae";
		faces[num].forEach((arr,j)=>{
			arr.forEach((e,i)=>{
				if(e===1){
					ctx.beginPath();
					ctx.arc(x+(i*size*.3)+size*.2,y+(j*size*.3)+size*.2,size*.1,0,2*Math.PI);
					ctx.stroke();
					ctx.fill();
				}
			});
		})
	}
})();
