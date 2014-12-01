/* globals io:true, Peer:true, getUserMedia:true, logError:true, */

function RTCEngine(){
  var peers = []
    , peer = null
    , socket = null
    , roomName = null
    , isLocked = null
    , password = null
    , localStream = null
    , localId = null
    , iceConfig = []
    , appCB = function(){}; // holds the callback from external app

  var shiftKeyCode = {'192':'126', '49':'33', '50':'64', '51':'35', '52':'36', '53':'37', '54':'94', '55':'38', '56':'42', '57':'40', '48':'41', '189':'95', '187':'43', '219':'123', '221':'125', '220':'124', '186':'58', '222':'34', '188':'60', '190':'62', '191':'63'};
  var specialCharCode = {'8':'8', '13':'13', '32':'32', '186':'58', '187':'61', '188':'44', '189':'45', '190':'46', '191':'47', '192':'96', '219':'91', '220':'92', '221':'93', '222':'39'};

  function startMedia(){
    var media_constraints = {
      video : {
        mandatory: {
        }
      },
      audio : true
    };

    // getUserMedia
    getUserMedia(
      media_constraints,
      function(stream){
        localStream = stream;
        var video = $('#local-video');
        video.attr('src', window.URL.createObjectURL(localStream));
        localStream.onloadedmetadata = function(e){
          console.log('onloadedmetadata called, properties:');
          for(var prop in e){
            console.log(prop + ' in ' + e[prop]);
          }
        }
        console.log('joining', roomName);
        socket.emit('join', {room:roomName});
      },
      logError
    );
  }

  function stopMedia(){
    if (localStream){
      localStream.stop();
    }
    while (peers.length > 0){
      peer = peers.pop();
      peer.close();
    }
    if(socket){
      socket.emit('exit');
    }
  }

  function createRoom(data){
    socket.emit('createRoom', data);
  }

  function sendChar(code, isrelay){
    if (roomName){
      var message = {
        room: roomName,
        code: code
      };
      if (isrelay){
        //console.log('relaying',message);
        socket.emit('byteChar', message);
      } else {
        for(var i = 0; i < peers.length; i++){
          peers[i].sendData(code);
        }
      }
    }
  }

  function sendString(word, isrelay){
    if (roomName){
      var message = {
        room: roomName,
        code: word
      };
      if (isrelay){
        socket.emit('byteChar', message);
      } else {
        for(var i = 0; i < peers.length; i++){
          peers[i].sendData(word);
        }
      }
    }
  }

  function handleJoinRoom(socket, callback) {
    if (typeof callback === 'undefined') callback = function(){};
    socket.on('id', function(message){
      localId = message.yourId;
      console.log('localId: ' + localId);
      callback('id', {id:localId});
    });
  }

  function handleCreateRoom(socket, callback) {
    if (typeof callback === 'undefined') callback = function(){};
    socket.on('createRoom', function(message){
      console.log('rtcengine - is room created? ' + message.created);
      callback('createRoom', message);
    });
  }

  function handleCreatePeers(socket,callback) {
    if (typeof callback === 'undefined') callback = function(){};
    socket.on('createPeers', function(message){
	    console.log('socket received createPeers signal');
	    var users = message.users;
	    if(users.length > 0)
        createPeers(users, callback);
    });
  }

  function createPeers(users, callback) {
	  var pid = users.shift();
    callback('create', {id:pid});
	  var peer = new Peer(socket, pid, roomName, iceConfig);
    peer.buildClient(localStream, handleByteChar, 'answer');
	  peers.push(peer);
	  if(users.length > 0){
      createPeers(users, callback);
    }

  }

  function handleCreateOffer(socket, callback) {
    if (typeof callback === 'undefined') callback = function(){};
    socket.on('createOffer', function(message){
	    var peer = new Peer(socket, message.id, roomName, iceConfig);
	    peer.buildClient(localStream, handleByteChar, 'offer');
	    peers.push(peer);
      callback('create', {id:message.id});
	    peer.peerCreateOffer();
    });
  }

  function handleIceCandidate(socket) {
    socket.on('candidate', function(message) {
	    for(var i = 0; i < peers.length; i++){
        if(peers[i].getid() === message.from_id) {
          if(!peers[i].hasPC()){
            console.log('ICE Candidate received: PC not ready. Building.');
            peers[i].buildClient(localStream, handleByteChar, 'answer');
          }
          //console.log('Remote ICE candidate',message.candidate.candidate);
          peers[i].addIceCandidate(message.candidate);
        }
	    }
    });
  }

  function handleSetRemoteDescription(socket) {
    socket.on('sdp', function (message) {
	    console.log('sdp offer received');
	    for(var i = 0; i < peers.length; i++) {
        if(peers[i].getid() === message.from_id){
          if(!peers[i].hasPC()){
            console.log('SDP received: PC not ready. Building.');
            peers[i].buildClient(localStream, handleByteChar, 'answer');
          }
          peers[i].setRemoteDescription(message.sdp);
        }
	    }
    });
  }

  function handleClientDisconnected(socket, callback) {
    if (typeof callback === 'undefined') callback = function(){};
    socket.on('leave', function (from_id) {
	    console.log('handleClientDisconnected', from_id);
	    for(var i = 0; i < peers.length; i++) {
        if(peers[i].getid() === from_id){
          if(peers[i].hasPC()){
            peers.splice(i, 1);
            callback('peerDisconnect', {id:from_id});
            return;
          }
        }
      }
    });
  }

  function handleSysCode(socket, callback) {
    if (typeof callback === 'undefined') callback = function(){};
    socket.on('error', function(message) {
      console.log('handleSysCode', message.errcode);
      callback('error', message);
    });
    socket.on('info', function(message){
      var code;
	    switch (message.info) {
        case 'room empty': 
          code = 'Room is empty';
          break;
        default:
          code = 'Unknown Error';
          break;
	    }
      callback('info', {msg:code});
    });
  }

  // DataChannel version of sending char code
  // message consists of:
  // message.from_id
  // message.code
  function handleByteChar(message){
    for (var i = 0; i < peers.length; i++) {
      if (peers[i].getid() === message.from_id){
        if (!peers[i].hasPC()){
          console.log('Message received: PC not ready.');
        } else {
          appCB('readbytechar', message);
        }
        return {};
      }
    }
  }

  // WebSocket version of sending char code
  function handleReceiveCode(socket, callback) {
    if (typeof callback === 'undefined') callback = function(){};
    socket.on('byteChar', function(message) {
	    for (var i = 0; i < peers.length; i++) {
        if (peers[i].getid() === message.from_id){
          if (!peers[i].hasPC()){
            console.log('Message received: PC not ready.');
          } else {
            callback('readbytechar', message);
            //console.log('handleReceiveCode', message.code);
          }
          return {};
        }
	    }
    });
  }

  // data = {room:room, isLocked:isLocked, password:password}
  //
  var connect = function(data, callback) {

    if (typeof data === 'undefined')
      return;

    if (data.isLocked)
      isLocked = data.isLocked;
    if (data.password)
      password = data.password;
    if (data.room)
      roomName = data.room;

    appCB = callback;
    socket = io('/', {'forceNew': true}); 

    socket.on('connect', function(){

      console.log('socket connecting');

      // establish socket callbacks
      handleCreateRoom(socket, callback);
      handleJoinRoom(socket,  callback);
      handleCreatePeers(socket, callback);
      handleCreateOffer(socket, callback);
      handleIceCandidate(socket);
      handleSetRemoteDescription(socket);
      handleReceiveCode(socket, callback);
      handleClientDisconnected(socket, callback);
      handleSysCode(socket, callback);

      if (data.create) createRoom(data);
      else callback('connected');

    });
  }

  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  function generateID () {
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
  }

  function getURL () {
    var pathArray = window.location.href.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    var url = protocol + '//' + host;
    for(var i = 3; i < pathArray.length; i++){
      url += '/' + pathArray[i];
    }
    return url;
  }

  function updateIce(ice){
    if (ice.length > 0){
      //console.log('updating ice from post');
      iceConfig = ice;
    }
  }

  return {
    updateIce:updateIce,
    connect:connect, 
    join:startMedia, 
    leave:stopMedia, 
    sendChar:sendChar,
    sendString:sendString
  };
}
