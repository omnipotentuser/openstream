function RTCEngine(){
  var peers = [],
      socket = null,
      roomName = null,
      localStream = null,
      localId = null;

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
          for(prop in e){
            console.log(prop + ' in ' + e[prop]);
          }
        }
        console.log('joining', roomName);
        socket.emit('join', {room:roomName});
      },
      logError
    );
  };

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
  };

  function sendChar(socket, code){
    if (roomName){
      var message = {
        room: roomName,
        code: code
      };
      socket.emit('code', message);
    }
  };

  function handleJoinRoom(socket, callback) {
    if (typeof callback === 'undefined') callback = function(){};
    socket.on('id', function(message){
      localId = message.yourId;
      console.log('localId: ' + localId);
      callback('id', {id:localId});
    });
  };

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
	  var peer = new Peer(socket, pid, roomName);
    peer.buildClient(localStream);
	  peers.push(peer);
	  if(users.length > 0){
      createPeers(users, callback);
    }

  }

  function handleCreateOffer(socket, callback) {
    if (typeof callback === 'undefined') callback = function(){};
    socket.on('createOffer', function(message){
	    var peer = new Peer(socket, message.id, roomName);
	    peer.buildClient(localStream);
	    peers.push(peer);
      callback('create', {id:message.id});
	    peer.peerCreateOffer();
    });
  }

  function handleIceCandidate(socket) {
    socket.on('candidate', function(message) {
	    for(var i = 0; i < peers.length; i++){
        if(peers[i].getid() == message.from_id) {
          if(!peers[i].hasPC()){
            console.log('ICE Candidate received: PC not ready. Building.');
            peers[i].buildClient(localStream);
          };
          console.log('Remote ICE candidate ' + message.candidate.candidate);
          peers[i].addIceCandidate(message.candidate);
        };
	    };
    });
  }

  function handleSetRemoteDescription(socket) {
    socket.on('sdp', function (message) {
	    console.log('sdp offer received');
	    for(var i = 0; i < peers.length; i++) {
        if(peers[i].getid() == message.from_id){
          if(!peers[i].hasPC()){
            console.log('SDP received: PC not ready. Building.');
            peers[i].buildClient(localStream);
          };
          peers[i].setRemoteDescription(message.sdp);
        }
	    };
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
          };
        }
      };
    });
  }

  function handleSysCode(socket, callback) {
    if (typeof callback === 'undefined') callback = function(){};
    socket.on('error', function(message) {
      var errcode;
      console.log('handleSysCode', message);
	    switch (message.error) {
        case 'room full': 
          errcode = 'Room is full';
          break;
        default:
          errcode = 'Unknown Error';
          break;
	    }
      callback('error', {msg:errcode});
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

  function handleReceiveCode(socket, callback) {
    if (typeof callback === 'undefined') callback = function(){};

    socket.on('code', function(message) {
	    for (var i = 0; i < peers.length; i++) {
        if (peers[i].getid() === message.from_id){
          if (!peers[i].hasPC()){
            console.log('Message received: PC not ready.');
          } else {
            callback('readchar', {id:message.from_id, code:message.code});
          };
          return {};
        }
	    };
    });
  }

  var connect = function(room, callback) {
    roomName = room;
    socket = io('/'); 
    console.log('socket connecting');
    //socket.on('connected', function(){
      handleJoinRoom(socket, callback);
      handleCreatePeers(socket, callback);
      handleCreateOffer(socket, callback);
      handleIceCandidate(socket);
      handleSetRemoteDescription(socket);
      handleReceiveCode(socket, callback);
      handleClientDisconnected(socket, callback);
      handleSysCode(socket, callback);
      callback('connected');
    //});
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

  return {
    connect:connect, 
    join:startMedia, 
    leave:stopMedia, 
    sendChar:sendChar
  };
};



/*
  function doMedia(p_socket, p_roomName) {
    setTimeout( function() {
	    if(startMedia) {
        doMedia(p_socket, p_roomName);
	    } else {
        startMedia($('#_openvri_video-src-one'), p_socket, p_roomName);
	    }
    }, 10 );
  }
    
  //setupRTC(socket, roomName);

  $('#_openvri_createBtn').click(function () {
    console.log('createBtn clicked');
    roomName = generateID();
    pageCounter++;
    window.history.pushState(pageCounter, 'VRI Lite', '#' + roomName);
    createFirstDisplay();
    //$('#_openvri_dialog').dialog('open');
  });

  $('#_openvri_hangupBtn').click(function () {
    console.log('hangupBtn clicked');
    stopMedia(socket);
  });

  $('#local-ta').on('keydown', function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    //console.log(e.type, e.which, e.keyCode);

    if( code == '37' || code == '38' || code == '39' || code == '40' ){
	    e.preventDefault();
	    return;
    }

    if( code  != 16 ) {// ignore shift
	    if( code >= 65 && code <= 90 ) {
        if(!e.shiftKey){
          code = code + 32;
        }
        sendMsg(socket, code, roomName);
      } else if(e.shiftKey && (shiftKeyCode[code] !== undefined) ){
        code = shiftKeyCode[code];
        sendMsg(socket, code, roomName);
	    } else if(specialCharCode[code] !== undefined){
        code = specialCharCode[code];
        sendMsg(socket, code, roomName);
	    } else if ( code >= 48 && code <= 57 ) {
        sendMsg(socket, code, roomName);
	    } else {
        console.log('keycode not accepted');
      return;
	    };
    }
  })
  function handleReceiveCode(socket) {
    socket.on('code', function(message) {
	    var code = String.fromCharCode(message.code);
	    for(var i = 0; i < peers.length; i++) {
        //console.log(peers[i].getid() + ' == ' + message.from_id);
        if(peers[i].getid() == message.from_id){
          if(!peers[i].hasPC()){
            console.log('Message received: PC not ready.');
            return;
          } else {
            if( peers[i].getOrientation() ){
              var orient = peers[i].getOrientation();
              if(orient == 'two'){
                if(message.code == '8')
                  $('#_openvri_message-src-two').val( $('#_openvri_message-src-two').val().slice(0,-1) );
                else
                  $('#_openvri_message-src-two').val($('#_openvri_message-src-two').val() + code);

                $('#_openvri_message-src-two').scrollTop($('#_openvri_message-src-two')[0].scrollHeight);
              } else {
                if(message.code == '8')
                  $('#_openvri_message-src-three').val( $('#_openvri_message-src-three').val().slice(0,-1) );
                else
                  $('#_openvri_message-src-three').val($('#_openvri_message-src-three').val() + code);

                $('#_openvri_message-src-three').scrollTop($('#_openvri_message-src-three')[0].scrollHeight);
              }
            }
          };
          return;
        }
	    };
    });
  }
*/
