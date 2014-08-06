var mcu;
var currentRoom = {};
var watchers = {};

// array of rooms with array of users and their info
var rooms = []; // [ { roomname: name, [ { userid: id, icecandidate: RTCIceCandidate, sdp: RTCSessionDescription } ], ... } ]

exports.createWatcher = function(p_file, p_event) {
  var absolute = path.join(__dirname, file);
  if (watchers[absolute]) { return; }

  fs.watchFile(absolute, function(curr, prev) {
    if (curr.mtime !== prev.mtime) {
	    mcu.emit(p_event, p_file);
    }
  });
  watchers[absolute] = true;
}

function joinRoom(socket, room){
  socket.join(room);
  currentRoom[socket.id] = room;
  var clients = mcu.sockets.adapter.rooms[room];
  var usersInRoom = [];
  for (var clientId in clients){
    usersInRoom.push(mcu.sockets.connected[clientId]);
  }
  if (usersInRoom.length > 1){
    console.log('number of users: ' + usersInRoom.length);
    console.log('id ' + socket.id + ' joining');
    var peers = [];
    for (var i = 0; i<usersInRoom.length; i++){
	    if ( usersInRoom[i].id != socket.id ) {
        peers.push(usersInRoom[i].id);
      };
    };
    socket.to(room).emit('createOffer', {id:socket.id});
    socket.emit('createPeers', {len:peers.length, users:peers});
  } else {
    console.log('Info: Room feels lonely.');
    socket.emit('info', {info:'room empty'});
  }
}

function handleJoinRoom(socket){
  socket.on('join', function (message) {
    if (currentRoom[socket.id])
	    socket.leave(currentRoom[socket.id]);
    socket.emit('id', {yourId:socket.id});
    joinRoom(socket, message.room);
  });
}

function handleMessageBroadcasting(socket){
  socket.on('code', function (message) {
    //console.log("Node received message " + message.code);
    message.from_id = socket.id;
    socket.to(message.room).emit('code', message);
  });
}

function handleIceCandidate(socket){
  socket.on('candidate', function(message){
    //console.log(socket.id, 'sending candidate', message.candidate.candidate);
    //console.log('candidate received: ' + message.room);
    message.from_id = socket.id;
    socket.to(message.to_id).emit('candidate', message);
    //mcu.socket(message.to_id).emit('candidate', message);
 });
};

function handleSetRemoteDescription(socket) {
  socket.on('sdp', function(message){
    message.from_id = socket.id;
    socket.to(message.to_id).emit('sdp', message);
    //mcu.socket(message.to_id).emit('sdp', message);
  });
};

function handleClientDisconnect(socket) {
  socket.on('disconnect', function() {
    console.log(socket.id, 'disconnected from ' + currentRoom[socket.id]);
    socket.to(currentRoom[socket.id]).emit('leave', socket.id);
    socket.leave(currentRoom[socket.id]);
    if (currentRoom[socket.id])
	    delete currentRoom[socket.id];
  });
};

function handleClientExit(socket) {
  socket.on('exit', function () {
    console.log(socket.id, 'exiting from room ' + currentRoom[socket.id]);
    socket.to(currentRoom[socket.id]).emit('leave', socket.id);
    socket.leave(currentRoom[socket.id]);
    if (currentRoom[socket.id])
      delete currentRoom[socket.id];
  });
};

exports.init = function(server){
  mcu = server;
  mcu.on('connection', function(socket){
    console.log('socket connected with id: ' + socket.id);
    //handleGetId(socket);
    handleJoinRoom(socket);
    handleClientExit(socket);
    handleMessageBroadcasting(socket);
    handleIceCandidate(socket);
    handleSetRemoteDescription(socket);
    handleClientDisconnect(socket);
  });
}
