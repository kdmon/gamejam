var tree, enemyTree;
var delta = 2;
var socket = io.connect('http://it4se.com:8080');

function joinGame (team) {
  $('#welcome').hide();
  $('#gamescreen').show();

  $('#teamnumber').text('Team ' + team);
 
  socket.emit('playerUpdate', {
            "player": {
            "action" : "register",
            "team" : team
            }});
}

function change (tree, amount) {
  socket.emit('playerUpdate', {
    "player": {
      "action": "change",
      "tree": tree,
      "amount": amount
    }
});
}

function reset () {
  socket.emit('playerUpdate', {
    "player": {
      "action": "reset"
    }
});
}

// socket.on('connect', function (data) {  });
var tHeight1 = 1;
var tHeight2 = 1;
socket.on('serverUpdate', function (data) {

  //console.log (data);

  switch (data.server.action) {
    case "gameStatus":
      $("#gamestatus").prepend(data.server.message + '<br/>');
    break;

    case "treeStatus":
      tHeight1 = data.server.message.items[0].amount;
      tHeight2 = data.server.message.items[1].amount;
      drawAgain();
    break;

    case "sunStatus":
	$("#sun").css("transform", "rotate(" + data.server.message + "deg)");
    break;

    case "winner":
      alert("Team " + data.server.message + " is the winner!");
    break;
}
});
