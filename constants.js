module.exports = {

	defaultTileLabels : ["storage","RAM","CPU","bandwidth","storage","RAM","RAM","power","bandwidth","CPU","power","power","bandwidth","RAM","CPU","power","storage","CPU","DarkNet"],
	defaultTokenObjects : [
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
	],
	tokenLocationMap : {
		'00': [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 12, 17, 16, 15, 14, 13, 18],
		'02': [2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 13, 12, 17, 16, 15, 14, 18],
		'04': [4, 3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 14, 13, 12, 17, 16, 15, 18],
		'06': [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7, 15, 14, 13, 12, 17, 16, 18], 
		'08': [8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 16, 15, 14, 13, 12, 17, 18],
		'10': [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 17, 16, 15, 14, 19, 12, 18]
	},
	frameSets : [ //all orientation edges start that the same vendor, so all vendor trades will happen in the same order
		//as long as it's not a completely randomized vendor distribution
		[ // 1 to 2 piece on bottom of board
			[{x:5,y:5}, {x:6,y:5}], [{x:2,y:5}, {x:3,y:5}], [{x:1,y:3}, {x:1,y:4}], [{x:1,y:1}, {x:1,y:2}], 
			[{x:2,y:0}, {x:3,y:0}], [{x:5,y:0}, {x:6,y:0}], [{x:8,y:1}, {x:9,y:1}], [{x:10,y:2}, {x:10,y:3}], [{x:9,y:4}, {x:8,y:4}]
		],
		[ // 1 to 2 piece on bottom left of board
			[{x:1,y:4},{x:2,y:4}], [{x:0,y:2},{x:0,y:3}], [{x:2,y:1},{x:1,y:1}], [{x:4,y:0},{x:5,y:0}], 
			[{x:7,y:0},{x:8,y:0}], [{x:9,y:1},{x:9,y:2}], [{x:9,y:3},{x:9,y:4}], [{x:8,y:5},{x:7,y:5}], [{x:4,y:5},{x:5,y:5}] 
		],
		[ // 1 to 2 piece on top left of board
			[{x:1,y:1}, {x:1,y:2}], [{x:2,y:0}, {x:3,y:0}], [{x:5,y:0}, {x:6,y:0}], [{x:8,y:1}, {x:9,y:1}], 
			[{x:10,y:2}, {x:10,y:3}], [{x:9,y:4}, {x:8,y:4}], [{x:5,y:5}, {x:6,y:5}], [{x:2,y:5}, {x:3,y:5}], [{x:1,y:3}, {x:1,y:4}]
		],
		[ // 1 to 2 piece on top of board
			[{x:4,y:0},{x:5,y:0}], [{x:7,y:0},{x:8,y:0}], [{x:9,y:1},{x:9,y:2}], [{x:9,y:3},{x:9,y:4}], 
			[{x:8,y:5},{x:7,y:5}], [{x:4,y:5},{x:5,y:5}], [{x:1,y:4},{x:2,y:4}], [{x:0,y:2},{x:0,y:3}], [{x:2,y:1},{x:1,y:1}] 
		],
		[	// 1 to 2 piece on top right of board
			[{x:8,y:1}, {x:9,y:1}], [{x:10,y:2}, {x:10,y:3}], [{x:9,y:4}, {x:8,y:4}], [{x:5,y:5}, {x:6,y:5}], 
			[{x:2,y:5}, {x:3,y:5}], [{x:1,y:3}, {x:1,y:4}], [{x:1,y:1}, {x:1,y:2}], [{x:2,y:0}, {x:3,y:0}], [{x:5,y:0}, {x:6,y:0}]
		],
		[	// 1 to 2 piece on bottom right of board
			[{x:9,y:3},{x:9,y:4}], [{x:8,y:5},{x:7,y:5}], [{x:4,y:5},{x:5,y:5}], [{x:1,y:4},{x:2,y:4}], 
			[{x:0,y:2},{x:0,y:3}], [{x:2,y:1},{x:1,y:1}], [{x:4,y:0},{x:5,y:0}], [{x:7,y:0},{x:8,y:0}], [{x:9,y:1},{x:9,y:2}] 
		]
	],
	defaultVendorLabels : ["threeToOne", "threeToOne", "bandwidth", "CPU", "threeToOne", "RAM", "storage", "threeToOne", "power"],
	defaultEdgeCoords : [ //edges are defined as pairs of vectors (xy coord pairs)
			{v:{x:07,y:05}, u:{x:08,y:05}},
			{v:{x:07,y:05}, u:{x:06,y:05}},
			{v:{x:05,y:05}, u:{x:06,y:05}},
			{v:{x:05,y:05}, u:{x:04,y:05}},
			{v:{x:03,y:05}, u:{x:04,y:05}},
			{v:{x:03,y:05}, u:{x:02,y:05}},
			{v:{x:08,y:04}, u:{x:08,y:05}},
			{v:{x:06,y:04}, u:{x:06,y:05}},
			{v:{x:04,y:04}, u:{x:04,y:05}},
			{v:{x:02,y:04}, u:{x:02,y:05}},
			{v:{x:08,y:04}, u:{x:09,y:04}},
			{v:{x:08,y:04}, u:{x:07,y:04}},
			{v:{x:06,y:04}, u:{x:07,y:04}},
			{v:{x:06,y:04}, u:{x:05,y:04}},
			{v:{x:04,y:04}, u:{x:05,y:04}},
			{v:{x:04,y:04}, u:{x:03,y:04}},
			{v:{x:02,y:04}, u:{x:03,y:04}},
			{v:{x:02,y:04}, u:{x:01,y:04}},
			{v:{x:09,y:03}, u:{x:09,y:04}},
			{v:{x:07,y:03}, u:{x:07,y:04}},
			{v:{x:05,y:03}, u:{x:05,y:04}},
			{v:{x:03,y:03}, u:{x:03,y:04}},
			{v:{x:01,y:03}, u:{x:01,y:04}},
			{v:{x:09,y:03}, u:{x:10,y:03}},
			{v:{x:09,y:03}, u:{x:08,y:03}},
			{v:{x:07,y:03}, u:{x:08,y:03}},
			{v:{x:07,y:03}, u:{x:06,y:03}},
			{v:{x:05,y:03}, u:{x:06,y:03}},
			{v:{x:05,y:03}, u:{x:04,y:03}},
			{v:{x:03,y:03}, u:{x:04,y:03}},
			{v:{x:03,y:03}, u:{x:02,y:03}},
			{v:{x:01,y:03}, u:{x:02,y:03}},
			{v:{x:01,y:03}, u:{x:00,y:03}},
			{v:{x:10,y:02}, u:{x:10,y:03}},
			{v:{x:08,y:02}, u:{x:08,y:03}},
			{v:{x:06,y:02}, u:{x:06,y:03}},
			{v:{x:04,y:02}, u:{x:04,y:03}},
			{v:{x:02,y:02}, u:{x:02,y:03}},
			{v:{x:00,y:02}, u:{x:00,y:03}},
			{v:{x:09,y:02}, u:{x:10,y:02}},
			{v:{x:09,y:02}, u:{x:08,y:02}},
			{v:{x:07,y:02}, u:{x:08,y:02}},
			{v:{x:07,y:02}, u:{x:06,y:02}},
			{v:{x:05,y:02}, u:{x:06,y:02}},
			{v:{x:05,y:02}, u:{x:04,y:02}},
			{v:{x:03,y:02}, u:{x:04,y:02}},
			{v:{x:03,y:02}, u:{x:02,y:02}},
			{v:{x:01,y:02}, u:{x:02,y:02}},
			{v:{x:01,y:02}, u:{x:00,y:02}},
			{v:{x:09,y:01}, u:{x:09,y:02}},
			{v:{x:07,y:01}, u:{x:07,y:02}},
			{v:{x:05,y:01}, u:{x:05,y:02}},
			{v:{x:03,y:01}, u:{x:03,y:02}},
			{v:{x:01,y:01}, u:{x:01,y:02}},
			{v:{x:08,y:01}, u:{x:09,y:01}},
			{v:{x:08,y:01}, u:{x:07,y:01}},
			{v:{x:06,y:01}, u:{x:07,y:01}},
			{v:{x:06,y:01}, u:{x:05,y:01}},
			{v:{x:04,y:01}, u:{x:05,y:01}},
			{v:{x:04,y:01}, u:{x:03,y:01}},
			{v:{x:02,y:01}, u:{x:03,y:01}},
			{v:{x:02,y:01}, u:{x:01,y:01}},
			{v:{x:08,y:01}, u:{x:08,y:00}},
			{v:{x:06,y:00}, u:{x:06,y:01}},
			{v:{x:04,y:00}, u:{x:04,y:01}},
			{v:{x:02,y:00}, u:{x:02,y:01}},
			{v:{x:07,y:00}, u:{x:08,y:00}},
			{v:{x:02,y:00}, u:{x:03,y:00}},
			{v:{x:03,y:00}, u:{x:04,y:00}},
			{v:{x:04,y:00}, u:{x:05,y:00}},
			{v:{x:05,y:00}, u:{x:06,y:00}},
			{v:{x:06,y:00}, u:{x:07,y:00}}
		],
		vertexTileAdjacencies: [
			{x:0, y:2, tiles:[10]},
			{x:0, y:3, tiles:[10]},
			{x:1, y:1, tiles:[11]},
			{x:1, y:2, tiles:[11,10]},
			{x:1, y:3, tiles:[10,9]},
			{x:1, y:4, tiles:[9]},
			{x:2, y:0, tiles:[0]},
			{x:2, y:1, tiles:[0,11]},
			{x:2, y:2, tiles:[11,10,17]},
			{x:2, y:3, tiles:[10,17,9]},
			{x:2, y:4, tiles:[8,9]},
			{x:2, y:5, tiles:[8]},
			{x:3, y:0, tiles:[0]},
			{x:3, y:1, tiles:[11,12,0]},
			{x:3, y:2, tiles:[11,12,17]},
			{x:3, y:3, tiles:[17,16,9]},
			{x:3, y:4, tiles:[9,16,8]},
			{x:3, y:5, tiles:[8]},
			{x:4, y:0, tiles:[1]},
			{x:4, y:1, tiles:[0,1,12]},
			{x:4, y:2, tiles:[12,18,17]},
			{x:4, y:3, tiles:[18,17,16]},
			{x:4, y:4, tiles:[16,7,8]},
			{x:4, y:5, tiles:[7,8]},
			{x:5, y:0, tiles:[1]},
			{x:5, y:1, tiles:[1,12,13]},
			{x:5, y:2, tiles:[12,13,18]},
			{x:5, y:3, tiles:[18,16,15]},
			{x:5, y:4, tiles:[16,18,7]},
			{x:5, y:5, tiles:[7]},
			{x:6, y:0, tiles:[1,2]},
			{x:6, y:1, tiles:[1,2,13]},
			{x:6, y:2, tiles:[13,18,14]},
			{x:6, y:3, tiles:[14,18,15]},
			{x:6, y:4, tiles:[15,6,7]},
			{x:6, y:5, tiles:[6,7]},
			{x:7, y:0, tiles:[2]},
			{x:7, y:1, tiles:[2,3,13]},
			{x:7, y:2, tiles:[3,13,14]},
			{x:7, y:3, tiles:[14,15,5]},
			{x:7, y:4, tiles:[5,15,6]},
			{x:7, y:5, tiles:[6]},
			{x:8, y:0, tiles:[2]},
			{x:8, y:1, tiles:[2,3]},
			{x:8, y:2, tiles:[3,4,14]},
			{x:8, y:3, tiles:[14,4,5]},
			{x:8, y:4, tiles:[5,6]},
			{x:8, y:5, tiles:[6]},
			{x:9, y:1, tiles:[3]},
			{x:9, y:2, tiles:[3,4]},
			{x:9, y:3, tiles:[4,5]},
			{x:9, y:4, tiles:[5]},
			{x:10, y:2, tiles:[4]},
			{x:10, y:3, tiles:[4]}
		]
};