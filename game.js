var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var delta = 0.2;

var interval;

var sunRot = Math.random() * 359;

var trees = {"items": [
    {"amount" : 20},
    {"amount" : 20}
]};


var teams = {"items": [
    {"amount" : 1},
    {"amount" : 1}
]};


// handle incomming connections

app.listen(8080);

io.sockets.on('connection', function (socket) {


	if (!interval) {
		interval = setInterval (function () {

		  sunRot += 3; if (sunRot >359) sunRot = 0;

		  delta = delta/1.001;

		  if (sunRot > 180) trees.items[1].amount += delta;
		  else trees.items[0].amount += delta;

		  publicMsg("sunStatus", sunRot);
		  publicMsg("treeStatus", trees);

 	        if (trees.items[0].amount > 100) winEnd(1);
	        else if (trees.items[1].amount > 100) winEnd(2);

		}, 100);
	}

	socket.on('playerUpdate', function (data) {

	        switch (data.player.action) {

		        case "change":
		        	trees.items[data.player.tree-1].amount += data.player.amount;
			        if (trees.items[0].amount > 100) winEnd(1);
			        else if (trees.items[1].amount > 100) winEnd(2);
      		        break;

			case "register":
				publicMsg("gameStatus", "Player joined team " + data.player.team);
				teams.items[data.player.team-1].amount ++;

			break;

			case "quit":
				publicMsg("gameStatus", "Player left team " + data.player.team);
				teams.items[data.player.team-1].amount --;
			break;

		}

		//publicMsg("treeStatus", trees);

	});

  function winEnd (team){
    publicMsg("winner", team);
      trees = {"items": [
          {"amount" : 20},
          {"amount" : 20}
      ]};

	delta = 0.2;


      teams = {"items": [
          {"amount" : 1},
          {"amount" : 1}
      ]};
  }


	socket.on('disconnect', function (data) {
		// socket.get('playerNumber', function (err, value) {});



	});



	// Helper functions

	function privateMsg (action, msg) {
		socket.emit('serverUpdate', {
			"server": {
				"action": action,
				"message": msg
			}
		});
	}

	function opponentMsg (action, msg) {
		socket.broadcast.emit('serverUpdate', {
			"server": {
				"action": action,
				"message": msg
			}
		});
	}


	function publicMsg (action, msg) {
		privateMsg (action, msg);
		opponentMsg (action, msg);
	}

});

// this serves HTML files etc

function handler (req, res) {
  if (req.url == "/") {req.url = "/index.html";}
  fs.readFile(__dirname + req.url,
  function (err, data) {
    if (err) {
      res.writeHead(404);
      return res.end('404 File not found');
    }
    res.writeHead(200);
    res.end(data);
  });
}
