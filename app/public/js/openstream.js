$(document).ready(function(){

  var currentApp = null,
      hallway = null,
      lavatory = null,
      conference = null,
      lounge = null,
      stage = null,
      modular = null;

  var observer = function(next){
    if (currentApp){
      currentApp.leave(destroy, next);
    } else {
      start(next);
    }
  };

  var destroy = function(next){
    console.log('cleaning up');
    hallway = null;
    lavatory = null;
    conference = null;
    lounge = null;
    stage = null;
    modular = null;
    start(next);
  };

  var start = function(next){
    if (next === 'lobby'){
      console.log('observer calls lobby');
      currentApp = null;
    } else if (next === 'hallway'){
      hallway = new Hallway();
      currentApp = hallway;
    } else if (next === 'lavatory'){
      lavatory = new Lavatory();
      currentApp = lavatory;
    } else if (next === 'conference'){
      conference = new Conference();
      currentApp = conference;
    } else if (next === 'lounge'){
      lounge = new Lounge();
      currentApp = lounge;
    } else if (next === 'stage'){
      stage = new Stage();
      currentApp = stage;
    } else if (next === 'modular'){
      modular = new Modular();
      currentApp = modular;
    } else {
      console.log('start: unrecognized command');
      currentApp = null;
    }
  };

  var lobby = new Lobby(observer);

  var updatePage = function(event){
    var urlpath = window.location.pathname.substring(1);
    var hashurl = window.location.hash.substring(1);
    var url = '';
    url = urlpath ? urlpath : hashurl;
    console.log('urlpath',urlpath);
    console.log('hashurl', hashurl);
    console.log('url',url);
    switch ( url ){
      case 'hallway': 
        lobby.hallway();
        break;
      case 'lavatory':
        lobby.lavatory();
        break;
      case 'stage':
        lobby.stage();
        break;
      case 'modular':
        lobby.modular();
        break;
      case 'conference':
        lobby.conference();
        break;
      case 'lounge':
        lobby.lounge();
        break;
      default:
        lobby.lobby();
        break;
    };
  };

  $(window).bind('hashchange', updatePage).trigger('hashchange');
  $('#href-lobby').on('click', function(event){
    window.history.replaceState({}, "OpenStream - Lobby", "/");
    updatePage(event);
  });
  $('#href-hallway').on('click', function(event){
    window.history.replaceState({}, "OpenStream - Hallway", "/hallway");
    updatePage(event);
  });
  $('#href-lavatory').on('click', function(event){
    window.history.replaceState({}, "OpenStream - Lavatory", "/lavatory");
    updatePage(event);
  });
  $('#href-lounge').on('click', function(event){
    window.history.replaceState({}, "OpenStream - Lounge", "/lounge");
    updatePage(event);
  });
});


function Conference(){
	console.log('conference ready');
	var conferenceViews = new ConferenceViews();
  var rtc_engine = null;

  this.leave = function(destroyCallback, next){
    if (rtc_engine){
      rtc_engine.leave();
      rtc_engine = null;
    }
    // TODO move destroyCallback to the last remaining callback in this call
    destroyCallback(next);
  };
};


function ConferenceViews(){
  // todo build classroom model

};

var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;

function trace(text) {
  // This function is used for logging.
  if (text[text.length - 1] == '\n') {
    text = text.substring(0, text.length - 1);
  }
  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

if (navigator.mozGetUserMedia) {
  console.log("This appears to be Firefox");

  webrtcDetectedBrowser = "firefox";

  webrtcDetectedVersion =
                  parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]);

  // The RTCPeerConnection object.
  RTCPeerConnection = mozRTCPeerConnection;

  // The RTCSessionDescription object.
  RTCSessionDescription = mozRTCSessionDescription;

  // The RTCIceCandidate object.
  RTCIceCandidate = mozRTCIceCandidate;

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);

  // Creates iceServer from the url for FF.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0 &&
               (url.indexOf('transport=udp') !== -1 ||
                url.indexOf('?transport') === -1)) {
      // Create iceServer with turn url.
      // Ignore the transport parameter from TURN url.
      var turn_url_parts = url.split("?");
      iceServer = { 'url': turn_url_parts[0],
                    'credential': password,
                    'username': username };
    }
    return iceServer;
  };

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
    console.log("Attaching media stream");
    element.mozSrcObject = stream;
    element.play();
  };

  reattachMediaStream = function(to, from) {
    console.log("Reattaching media stream");
    to.mozSrcObject = from.mozSrcObject;
    to.play();
  };

  // Fake get{Video,Audio}Tracks
  MediaStream.prototype.getVideoTracks = function() {
    return [];
  };

  MediaStream.prototype.getAudioTracks = function() {
    return [];
  };
} else if (navigator.webkitGetUserMedia) {
  console.log("This appears to be Chrome");

  webrtcDetectedBrowser = "chrome";
  webrtcDetectedVersion =
             parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);

  // Creates iceServer from the url for Chrome.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      if (webrtcDetectedVersion < 28) {
        // For pre-M28 chrome versions use old TURN format.
        var url_turn_parts = url.split("turn:");
        iceServer = { 'url': 'turn:' + username + '@' + url_turn_parts[1],
                      'credential': password };
      } else {
        // For Chrome M28 & above use new TURN format.
        iceServer = { 'url': url,
                      'credential': password,
                      'username': username };
      }
    }
    return iceServer;
  };

  // The RTCPeerConnection object.
  RTCPeerConnection = webkitRTCPeerConnection;

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
    if (typeof element.srcObject !== 'undefined') {
      element.srcObject = stream;
    } else if (typeof element.mozSrcObject !== 'undefined') {
      element.mozSrcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      console.log('Error attaching stream to element.');
    }
  };

  reattachMediaStream = function(to, from) {
    to.src = from.src;
  };

  // The representation of tracks in a stream is changed in M26.
  // Unify them for earlier Chrome versions in the coexisting period.
  if (!webkitMediaStream.prototype.getVideoTracks) {
    webkitMediaStream.prototype.getVideoTracks = function() {
      return this.videoTracks;
    };
    webkitMediaStream.prototype.getAudioTracks = function() {
      return this.audioTracks;
    };
  }

  // New syntax of getXXXStreams method in M26.
  if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
    webkitRTCPeerConnection.prototype.getLocalStreams = function() {
      return this.localStreams;
    };
    webkitRTCPeerConnection.prototype.getRemoteStreams = function() {
      return this.remoteStreams;
    };
  }
} else {
  console.log("Browser does not appear to be WebRTC-capable");
}


function logError(error) {
  console.log('error: ' + error.name);
}

function Peer(p_socket, p_id, p_roomName, iceConfig) {
  var pc = null,
      peerid = p_id,
      onByteChar = null,
      dc = null,
      socket = p_socket,
      localStream = null,
      roomName = p_roomName,
      ice_config = {iceServers:[]},
      credentials = [];

  if (iceConfig.length > 0){
    //console.log('choosing turn server from post');
    credentials = iceConfig;
  } else if (navigator.mozGetUserMedia) {
    credentials = [ { url:"stun:stun.vline.com" } ];
  } else {
    credentials = [
	    {
        url:'stun:stun.1.google.com:19302'
	    },
	    {
        url: 'turn:turn.bistri.com:80',
        credential: 'homeo',
        username: 'homeo'
	    }
    ];
  }

  this.getid = function () {
    return (peerid);
  };

  this.hasPC = function () {
    return (pc) ? true : false ;
  }

  this.close = function(){
    if (pc) pc.close();
    if (dc) dc.close();
  };

  this.buildClient = function(stream, bytecharCallback, requestType){
    for (var i = 0; i<credentials.length; i++){
      var iceServer = {};
      iceServer = createIceServer(credentials[i].url,
      credentials[i].username,
      credentials[i].credential);	
      ice_config.iceServers.push(iceServer);
    }
    pc = new RTCPeerConnection(ice_config);
    pc.onaddstream = onAddStream;
    pc.onicecandidate = onIceCandidate;
    pc.oniceconnectionstatechange = onIceConnectionStateChange;
    pc.onnegotiationneeded = onNegotiationNeeded;
    pc.onremovestream = onRemoveStream;
    pc.onsignalingstatechange = onSignalingStateChange;
    if (requestType === 'offer'){
        dc = pc.createDataChannel('chat'. dataChannelOptions);
        dc.onerror = onDCError;
        dc.onmessage = onDCMessage;
        dc.onopen = onDCOpen;
        dc.onclose = onDCClose;
        console.log('readyState', dc.readyState);
    } else {
      pc.ondatachannel = onCreateDataChannel;
      console.log('DataChannel - listening');
    }

    onByteChar = bytecharCallback;

    if (stream){
      localStream = stream;
	    pc.addStream(localStream);
    }else{
	    alert('Media device is not detected.');
    }
  };

  var onDCError = function (err){
    console.log('data channel error:', err);
  };

  var onDCMessage = function(event){
    if (onByteChar && peerid){
      var message = {
        from_id: peerid,
        code: event.data
      };
      onByteChar(message);
    }
  };

  var onDCOpen = function(event){
    console.log('the data channel is opened');
  };

  var onDCClose = function(){
    console.log('the data channel is closed');
  };

  // since we are not setting any value, it defaults to reliable
  var dataChannelOptions = {
  };

  var onAddStream = function(evt) {
    console.log('onAddStream '+evt.stream.id);
    $('#'+peerid).attr('src', window.URL.createObjectURL(evt.stream));
  };

  var onIceCandidate = function(evt){
    if (evt.candidate){
      var message = {
        room: roomName,
        candidate:evt.candidate,
        to_id: peerid
      };
      //console.log('sending candidate', message.candidate.candidate);
      socket.emit('candidate', message);
    }
  };

  var onIceConnectionStateChange = function(){
    console.log('onIceConnectionStateChange state: ' + pc.iceConnectionState);
  };

  var onNegotiationNeeded = function(){
    console.log('onNegotiationNeeded');
  };

  var onRemoveStream = function(evt){
    console.log('onRemoveStream '+evt);
  };

  var onSignalingStateChange = function(){
    console.log('onSignalingStateChange: ' + pc.signalingState);
  };

  this.addIceCandidate = function (p_candidate) {
    if(pc){
	    pc.addIceCandidate(new RTCIceCandidate(p_candidate));
    } else {
	    console.log('No peer candidate instance');
    };
  };

  var localDescCreated = function(desc){
    if(pc.signalingState == 'closed')
	    return;
    pc.setLocalDescription(desc, function() {
	    var message = {
        room: roomName,
        sdp: pc.localDescription,
        to_id: peerid
	    };
	    socket.emit('sdp', message)
    }, logError);
  };

  var onCreateDataChannel = function(event){
    if (dc && dc.readyState !== 'closed'){
      console.log('dataChannel channel already created');
    } else {
      dc = event.channel;
      dc.onmessage = onDCMessage;
      dc.onopen = onDCOpen;
      dc.onclose = onDCClose;
      console.log('DataChannel remote connection status', dc.readyState);
    }
  };

  this.peerCreateOffer = function () {

    console.log('peerCreateOffer called');
    pc.createOffer(localDescCreated, logError); 

  };

  this.setRemoteDescription = function (p_remote_sdp) {
		console.log('setRemoteDescription signalingState ' + pc.signalingState);
		pc.setRemoteDescription(new RTCSessionDescription(p_remote_sdp), function () {
      if(pc.remoteDescription.type == 'offer') {
        console.log('createAnswer to remote sdp offer');
        pc.createAnswer(localDescCreated, logError);
      }
		}, logError);
  };

  this.sendData = function(byteChar){
    if (dc && dc.readyState.toLowerCase() == 'open'){
      dc.send(byteChar);
    } else {
      console.log('DataChannel not ready');
    }
  };
};

function RTCEngine(){
  var peers = [],
      socket = null,
      roomName = null,
      localStream = null,
      localId = null,
      iceConfig = [],
      appCB = function(){}; // holds the callback from external app

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
  };

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
        if(peers[i].getid() == message.from_id) {
          if(!peers[i].hasPC()){
            console.log('ICE Candidate received: PC not ready. Building.');
            peers[i].buildClient(localStream, handleByteChar, 'answer');
          };
          //console.log('Remote ICE candidate',message.candidate.candidate);
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
            peers[i].buildClient(localStream, handleByteChar, 'answer');
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
        };
        return {};
      }
    };
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
            console.log('handleReceiveCode', message.code);
          };
          return {};
        }
	    };
    });
  }

  var connect = function(room, callback) {
    roomName = room;
    appCB = callback;
    socket = io('/', {'forceNew': true}); 
    console.log('socket connecting');
    socket.on('connect', function(){
      handleJoinRoom(socket, callback);
      handleCreatePeers(socket, callback);
      handleCreateOffer(socket, callback);
      handleIceCandidate(socket);
      handleSetRemoteDescription(socket);
      handleReceiveCode(socket, callback);
      handleClientDisconnected(socket, callback);
      handleSysCode(socket, callback);
      callback('connected');
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
};

function Hallway(){
  var rtc_engine = new RTCEngine();
	var hallwayViews = new HallwayViews();
  var localId = null;
  var roomName = '';
  var $input = $('#roomnameinput');
  var joinRoomBtn = $('#joinroombtn');
  var randGenBtn = $('#randomgeneratorbtn');

  $.post("https://api.xirsys.com/getIceServers",{
    ident:"openhack",
    secret:"03150bbb-a1e7-49ff-862b-ab28688111a3",
    domain:"www.openhack.net",
    application:"default",
    room:"default",
    secure: "1"
  },
  function(data, status){
    var icedata = JSON.parse(data);
    //console.log('ice obtained:',icedata.d.iceServers);
    if (status === "success"){
      console.log('post success');
      rtc_engine.updateIce(icedata.d.iceServers);
    }
  });

  var handleSocketEvents = function(signaler, data){
    if (signaler){
      var pid = '';
      switch (signaler) {
        case 'connected':
          console.log('rtc engine connected');
          rtc_engine.join();
          break;
        case 'id':
          localId = data.id;
          break;
        case 'create':
          pid = data.id;
          console.log(
            'creating new media element', 
            pid
          );
          hallwayViews.appendPeerMedia(pid);
          break;
        case 'peerDisconnect':
          pid = data.id;
          hallwayViews.deletePeerMedia(data.id);
          break;
        case 'readbytechar':
          hallwayViews.updateTextArea(data.from_id, data.code);
          break;
        case 'info':
          console.log(data.msg);
          break;
        case 'error':
          // need to handle error for room full
          // by exiting room
          console.log(data.msg);
          break;
        default:
          break;
      }
    }
  };

  var handleJoinBtn = function(event){

    if (roomName === ''){
      roomName = $input.val();
    }
    
    if (roomName === ''){

      alert('Cannot have empty name');

    } else {
      event.preventDefault();
      hallwayViews.openMediaViews();

      (function(room, engine){
        console.log('starting rtc engine');
        engine.connect(room, handleSocketEvents);
      })(roomName, rtc_engine);

      hallwayViews.updateTitle(roomName);
      window.history.replaceState({}, "OpenStream "+roomName, "#"+roomName);
      joinRoomBtn.unbind('click', handleJoinBtn);
      randGenBtn.unbind('click', handleRandGenBtn);
    }
  };

  this.leave = function(destroyCallback, next){
    $input.val('');
    joinRoomBtn.unbind('click', handleJoinBtn);
    randGenBtn.unbind('click', handleRandGenBtn);
    rtc_engine.leave();
    hallwayViews.closeMediaViews(destroyCallback, next);
    hallwayViews = null;
    rtc_engine = null;
  };

  var S4 = function(){
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  var  generateID = function(){
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
  };

  var handleRandGenBtn = function(event){
    $input.val(generateID());
    joinRoomBtn.trigger('click');
  };

  joinRoomBtn.bind('click', handleJoinBtn);
  randGenBtn.bind('click', handleRandGenBtn);

  hallwayViews.setListeners(rtc_engine);
  (function queryUrl(){
    var hashurl = window.location.hash;
    var hashpos = hashurl.lastIndexOf('#');
    if (hashpos != -1){
      hashurl = hashurl.substring(hashpos + 1);
    }
    if (hashpos == -1){
      roomName = '';
    } else if (hashurl.length > 0){
      roomName = hashurl;
    } else {
      roomName = '';
    }
    console.log('roomName',roomName);
    if (roomName !== ''){
      joinRoomBtn.trigger('click');
    }
  })();
}

function HallwayViews(){

  // Enable data message passing through websocket
  // Defaults to DataChannel p2p delivery
  var isrelay = false;

  var shiftKeyCode = {'192':'126', '49':'33', '50':'64', '51':'35', '52':'36', '53':'37', '54':'94', '55':'38', '56':'42', '57':'40', '48':'41', '189':'95', '187':'43', '219':'123', '221':'125', '220':'124', '186':'58', '222':'34', '188':'60', '190':'62', '191':'63'};
  var specialCharCode = {'8':'8', '13':'13', '32':'32', '186':'58', '187':'61', '188':'44', '189':'45', '190':'46', '191':'47', '192':'96', '219':'91', '220':'92', '221':'93', '222':'39'};

  var usewebsocket = function(e){
    e.preventDefault();
    var $lta = $('#local-ta');
    if ($('.hallway-input-checkbox-wsmode').is(':checked')){
      $lta.val( $lta.val() + '\nDataChannel disabled, using WebSocket instead.\n');
      isrelay = true;
    } else {
      $lta.val( $lta.val() + '\nDataChannel enabled.\n');
      isrelay = false;
    }
  };

  var initialize = function(){

    var clip = $('<div/>', {class:'hallway-layout-options'})
      .append('<input type="text" class="hallway-input-text-clip" placeholder="Paste from clipboard"/>')
      .append('<button class="hallway-btn-clip" title="Send to peers" type="submit"> send </button>');
    var wstext = $('<div/>', {class:'hallway-layout-options'})
      .append('<input type="checkbox" class="hallway-input-checkbox-wsmode" value="enable">Use WebSocket</input>');
    $('<div/>', {id:'local-container', class:'media-layout'})
      .append('<video id=\"local-video\" autoplay controls muted>')
      .append(clip)
      .append(wstext)
      .append('<textarea id=\"local-ta\" placeholder="Being typing in real time"></textarea>')
      .appendTo('#hallway-video-container');

    var $input = $('#roomnameinput');
    $input.focus();
    $input.keypress(function(event){
      if (event.which === 13){
        event.preventDefault();
        $('#joinroombtn').trigger("click");
      }
    });
    $('.hallway-input-checkbox-wsmode').bind('change',usewebsocket);
  };

  this.setListeners = function(engine){
    $('#local-ta').on('keydown', function textareaByteChar(e) {
      var sc = engine.sendChar;
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
          sc(code, isrelay);
        } else if(e.shiftKey && (shiftKeyCode[code] !== undefined) ){
          code = shiftKeyCode[code];
          sc(code, isrelay);
        } else if(specialCharCode[code] !== undefined){
          code = specialCharCode[code];
          sc(code, isrelay);
        } else if ( code >= 48 && code <= 57 ) {
          sc(code, isrelay);
        } else {
          console.log('keycode not accepted');
        };
      }
    })
    $('.hallway-btn-clip').on('click', function(event){
      var ss = engine.sendString;
      var $clipinput = $('.hallway-input-text-clip');
      var word = $clipinput.val();
      if (word && word.length < 4){
        alert('Word is too short. Must be at least 4 characters long.');
      } else if (word){
        ss(word, isrelay);
        $clipinput.val('');
      }
    });
  };

  // TODO destroy hallway-btn-clip
  this.destroyListeners = function(){
    $('.hallway-input-checkbox-wsmode').unbind('change',usewebsocket);
  };

  this.openMediaViews = function(){
    $('#hallway-room-input').css('display','none');
    $('#hallway-video-container').css('display','inline-block');
  };

  this.closeMediaViews = function(destroyCallback, next){
    $('#hallway-room-title').empty();
    $('#hallway-video-container').fadeOut(function(){
      $('#hallway-room-input').fadeIn( 200, function destroyCB(){
        destroyCallback(next);
      });
    });
    this.destroyListeners();
    this.deleteAllMedia();
  };

  this.appendPeerMedia = function(pid){
    console.log('appendPeerMedia', pid);
    var options = $('<div/>', {class:'hallway-layout-options'})
      .append('<label class="hallway-label-bitrate">Bitrate: Not implemented yet.</label>');
    $('<div/>', {class:'media-layout'})
      .append('<video id="'+pid+'" autoplay controls>')
      .append(options)
      .append('<div class="hallway-layout-options"/>')
      .append('<textarea id="'+pid+'-ta" class="remote-textarea" readonly></textarea>')
      .appendTo('#hallway-video-container');
    var $ml = $('.media-layout');
    var percent = (100 / $ml.length);
    $ml.css('width',percent+'%');
  }

  this.deletePeerMedia = function(pid){
    $('#'+pid).parent().remove();
    var $ml = $('.media-layout');
    var percent = (100 / $ml.length);
    $ml.css('width',percent+'%');
    console.log('deletePeerMedia', pid);
  }

  this.deleteAllMedia = function(){
    $('#hallway-video-container').empty(); 
  }

  this.updateTextArea = function(pid, bytechar){
    var $ta = $('#'+pid+'-ta');
    if (bytechar.length > 3){
      $ta.val( $ta.val() + '\n' + bytechar + '\n');
    } else if (bytechar == '8'){
      $ta.val( $ta.val().slice(0,-1)); 
    } else{
      var ch = String.fromCharCode(bytechar);
      $ta.val($ta.val() + ch);
    }
    $ta.scrollTop($ta[0].scrollHeight);
  }

  this.updateTitle = function(room){
    $('#hallway-room-title').append('<p>Room: '+room+'</p>');
  }

  initialize();
};

function Lavatory(){
	console.log('lavatory ready');
	var lavatoryViews = new LavatoryViews();
  var rtc_engine = null;

  $('.lavatory-engage').bind('click', lavatoryViews.start);

  this.leave = function(destroyCallback, next){
    if (lavatoryViews){
      lavatoryViews.stop();
      $('.lavatory-engage').unbind('click', lavatoryViews.start);
    }
    destroyCallback(next);
  }
};


function LavatoryViews(){
  var $bitratelist = $('#lavatory-dropdown-bitrate a');
  var $bitratedropdown = $('.lavatory-dropdown-menu');
  var $startbtn = $('.lavatory-engage');
  var $bitratebtn = $('#lavatory-btn-bitrate');
  var $audiobtn = $('#lavatory-toggle-audio');
  var $videobtn = $('#lavatory-toggle-video');
  var $container = $('.lavatory-container-location');

  var janus = null;
  var echotest = null;
  var started = false;
  var bitrateTimer = null;

  var audioenabled = false;
  var videoenabled = false;
  var bitratevisible = false;
  // Using Nginx to reverse proxy the connection to Janus. Lavatory
  // is connected to Node.js through Nginx and for connections
  // to Janus the directive '/janus' is used to point to Janus 
  // server.
  var server = '/janus/';

  console.log('creating LavatoryViews');

  var stopLavatory = function(){

    // clear up Janus
    if (janus){
      clearInterval(bitrateTimer);
      janus.destroy();
      janus = null;
      echotest = null;
      started = false;
      bitrateTimer = null;
      audioenabled = false;
      videoenabled = false;
      bitratevisible = false;
    }

    // reset DOM
    $container.css('display','none');
    $startbtn
      .removeClass('pressed')
      .addClass('lifted')
      .html('start');
    $audiobtn.removeClass("lifted").addClass("pressed");
    $audiobtn.html("Audio Enabled");
    $audiobtn.unbind('click');
    $videobtn.removeClass("lifted").addClass("pressed");
    $videobtn.html("Video Enabled");
    $videobtn.unbind('click');
    $bitratebtn.unbind('click');
    $bitratelist.unbind('click');
    $bitratedropdown.css('display', 'none');
  };

  function startLavatory(){
    if (started){
      stopLavatory();
    } else {
      $startbtn
        .removeClass('lifted')
        .addClass('pressed')
        .html('stop');
      startJanus();
      started = true;
    }
  }
  
  function startJanus(){
    // Initialize the library (console debug enabled)
    Janus.init({debug: true, callback: function() {
      // Make sure the browser supports WebRTC
      if(!Janus.isWebrtcSupported()) {
        return;
      }
      // Create session
      janus = new Janus(
        {
          server: server,
          // No "iceServers" is provided, meaning janus.js will use a default STUN server
          // Here are some examples of how an iceServers field may look like to support TURN
          //     iceServers: [{url: "turn:yourturnserver.com:3478", username: "janususer", credential: "januspwd"}],
          //     iceServers: [{url: "turn:yourturnserver.com:443?transport=tcp", username: "janususer", credential: "januspwd"}],
          //     iceServers: [{url: "turns:yourturnserver.com:443?transport=tcp", username: "janususer", credential: "januspwd"}],
          success: function() {
            // Attach to echo test plugin
            janus.attach(
              {
                plugin: "janus.plugin.echotest",
                success: function(pluginHandle) {
                  $('#details').remove();
                  $container.css('display','inline-block');
                  echotest = pluginHandle;
                  console.log("Plugin attached! (" + echotest.getPlugin() + ", id=" + echotest.getId() + ")");
                  // Negotiate WebRTC
                  var body = { "audio": true, "video": true };
                  console.log("Sending message (" + JSON.stringify(body) + ")");
                  echotest.send({"message": body});
                  console.log("Trying a createOffer too (audio/video sendrecv)");
                  echotest.createOffer({
                      // No media provided: by default, it's sendrecv for audio and video
                      media: { data: true },  // Let's negotiate data channels as well
                      success: function(jsep) {
                        console.log("Got SDP!");
                        console.log(jsep);
                        echotest.send({"message": body, "jsep": jsep});
                      },
                      error: function(error) {
                        console.log("WebRTC error:");
                        console.log(error);
                      }
                    });
                },
                error: function(error) {
                  console.log("  -- Error attaching plugin... " + error);
                },
                consentDialog: function(on) {
                },
                onmessage: function(msg, jsep) {
                  console.log(" ::: Got a message :::");
                  console.log(JSON.stringify(msg));
                  if(jsep !== undefined && jsep !== null) {
                    console.log("Handling SDP as well...");
                    console.log(jsep);
                    echotest.handleRemoteJsep({jsep: jsep});
                  }
                  var result = msg.result;
                  if(result !== null && result !== undefined) {
                    if(result === "done") {
                      // The plugin closed the echo test
                      $('#lavatory-myvideo').remove();
                      $('#lavatory-peervideo').remove();
                      $('#lavatory-label-curbitrate').hide();
                    }
                  }
                },
                onlocalstream: function(stream) {
                  console.log(" ::: Got a local stream :::");
                  console.log(JSON.stringify(stream));
                  if($('#lavatory-myvideo').length === 0) {
                    $('#lavatory-video-local').append('<video class="rounded centered" id="lavatory-myvideo" width=320 height=240 autoplay muted="muted"/>');
                  }
                  attachMediaStream($('#lavatory-myvideo').get(0), stream);
                  $("#lavatory-myvideo").get(0).muted = "muted";
                },
                onremotestream: function(stream) {
                  console.log(" ::: Got a remote stream :::");
                  console.log(JSON.stringify(stream));
                  if($('#lavatory-peervideo').length === 0) {
                    $('#lavatory-video-remote').append('<video class="rounded centered" id="lavatory-peervideo" width=320 height=240 autoplay/>');
                    // Detect resolution
                    $("#lavatory-peervideo").bind("loadedmetadata", function () {
                      if(webrtcDetectedBrowser == "chrome") {
                        var width = this.videoWidth;
                        var height = this.videoHeight;
                        $('#lavatory-label-resolution').text(width+' x '+height);
                      } else {
                        // Firefox has a bug: width and height are not immediately available after a loadedmetadata
                        setTimeout(function() {
                          var width = $("#lavatory-peervideo").get(0).videoWidth;
                          var height = $("#lavatory-peervideo").get(0).videoHeight;
                          $('#lavatory-label-resolution').text(width+' x '+height).show();
                        }, 2000);
                      }
                    });
                  }
                  attachMediaStream($('#lavatory-peervideo').get(0), stream);
                  // Enable audio/video buttons and bitrate limiter
                  audioenabled = true;
                  videoenabled = true;
                  $audiobtn.bind('click', function() {
                      audioenabled = !audioenabled;
                      if(audioenabled){
                        console.log('\n\nNICK audio pressed \n\n');
                        $audiobtn.removeClass("lifted").addClass("pressed");
                        $audiobtn.html("Audio Enabled");
                      } else {
                        console.log('\n\nNICK audio lifted \n\n');
                        $audiobtn.removeClass("pressed").addClass("lifted");
                        $audiobtn.html("Audio Disabled");
                      }
                      echotest.send({"message": { "audio": audioenabled }});
                    });
                  $videobtn.bind('click', function() {
                      videoenabled = !videoenabled;
                      if(videoenabled){
                        $videobtn.removeClass("lifted").addClass("pressed");
                        $videobtn.html("Video Enabled");
                      } else {
                        $videobtn.removeClass("pressed").addClass("lifted");
                        $videobtn.html("Video Disabled");
                      }
                      echotest.send({"message": { "video": videoenabled }});
                    });
                  $bitratebtn.bind('click', function(e){
                    e.preventDefault();
                    bitratevisible = !bitratevisible;
                    if (bitratevisible){
                      $bitratedropdown.css('display','block');
                    } else {
                      $bitratedropdown.css('display','none');
                    }
                  });
                  $bitratelist.bind('click', function(e){
                    e.preventDefault();
                    var id = $(this).attr("id");
                    var bitrate = parseInt(id)*1000;
                    if(bitrate === 0) {
                      console.log("Not limiting bandwidth via REMB");
                    } else {
                      console.log("Capping bandwidth to " + bitrate + " via REMB");
                    }
                    echotest.send({"message": { "bitrate": bitrate }});
                    return false;
                  });
                  if(webrtcDetectedBrowser == "chrome") {
                    // Only Chrome supports the way we interrogate getStats for the bitrate right now
                    $('#lavatory-label-curbitrate').removeClass('hide').show();
                    bitrateTimer = setInterval(function() {
                      // Display updated bitrate, if supported
                      var bitrate = echotest.getBitrate();
                      //~ console.log("Current bitrate is " + echotest.getBitrate());
                      $('#lavatory-label-curbitrate').text(bitrate);
                    }, 1000);
                  }
                },
                ondataopen: function(data) {
                  console.log("The DataChannel is available!");
                },
                ondata: function(data) {
                  console.log("We got data from the DataChannel! " + data);
                  $('#lavatory-input-datarecv').val(data);
                },
                oncleanup: function() {
                  console.log(" ::: Got a cleanup notification :::");
                  $('#lavatory-myvideo').remove();
                  $('#lavatory-peervideo').remove();
                  $('#lavatory-label-curbitrate').hide();
                }
              });
          },
          error: function(error) {
            console.log(error);
            alert(error, function() {
              startLavatory();
            });
          },
          destroyed: function() {
            startLavatory();
          }
        });
    }});
  }

  return {stop: stopLavatory, start: startLavatory};
}

function checkEnter(event) {
  var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
  if(theCode == 13) {
    sendData();
    return false;
  } else {
    return true;
  }
}

function sendData() {
  var data = $('#lavatory-input-datasend').val();
  if(data === "") {
    alert('Insert a message to send on the DataChannel');
    return;
  }
  echotest.data({
    text: data,
    error: function(reason) { alert(reason); },
    success: function() { $('#lavatory-input-datasend').val(''); },
  });
}

function Lobby(cb){
	console.log('lobby ready');
	var lobbyViews = new LobbyViews(cb);
  return lobbyViews.pages;
};


function LobbyViews(cb){

  var LARGE = 1400;
  var MID = 1024;
  var SMALL = 800;
  var $body = $('body');
  var $banner = $('#lobby-banner');

  window.addEventListener('resize', function(){
    var wwidth = window.innerWidth;
    if ( wwidth < MID ){
      $body.css('left',0);
      $body.css('right',0);
      $banner.css('right', 0);
    } else {
      $body.css('left',200);
      $body.css('right',200);
      $banner.css('right', -150);
      clean = true;
    }
  }, true)
  $(document).ready(function(){
    window.dispatchEvent(new Event('resize'));
  });

  var lobby = $('#lobby-banner'),
      lavatory = $('#lavatory-link'),
      conference = $('#conference-link'),
      lounge = $('#lounge-link'),
      stage = $('#stage-link'),
      hallway = $('#hallway-link'),
      modular = $('#modular-link'),
      lobbyMain = $('#lobby-main'),
      currentPage = lobbyMain;

  var lobbyPage = function(){
    lobby.fadeOut();
    currentPage.fadeOut( function(){
      lobbyMain.fadeIn();
    });
    currentPage = lobbyMain;
    cb('lobby');
  };

  var conferencePage = function(){
    currentPage = $('#conference-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn();
      lobby.fadeIn();
    });
    cb('conference');
  };

  var lavatoryPage = function(){
    currentPage = $('#lavatory-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn();
      lobby.fadeIn();
    });
    cb('lavatory');
  };

  var loungePage = function(){
    currentPage = $('#lounge-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn();
      lobby.fadeIn();
    });
    cb('lounge');
  };

  var stagePage = function(){
    currentPage = $('#stage-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn();
      lobby.fadeIn();
    });
    cb('stage');
  };

  var modularPage = function(){
    currentPage = $('#modular-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn();
      lobby.fadeIn();
    });
    cb('modular');
  };

  var hallwayPage = function(){
    currentPage = $('#hallway-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn(function(){
        $('#roomnameinput').focus();
      });
      lobby.fadeIn();
    });
    cb('hallway');
  }

  var pages = {
    lavatory: lavatoryPage,
    conference: conferencePage,
    lounge: loungePage,
    lobby: lobbyPage,
    stage: stagePage,
    modular: modularPage,
    hallway: hallwayPage
  };

  return {pages: pages};
};

function Lounge(){
	console.log('lounge ready');
	var loungeViews = new LoungeViews();
  var rtc_engine = null;
  
  this.leave = function(destroyCallback, next){
    if (rtc_engine){
      rtc_engine.leave();
      rtc_engine = null;
    }
    destroyCallback(next);
  }
};


function LoungeViews(){
  // todo build public chatrooms!
};

function Modular(){
	console.log('modular ready');
	var modularViews = new ModularViews();
  var rtc_engine = null;

  this.leave = function(destroyCallback, next){
    if (rtc_engine){
      rtc_engine.leave();
      rtc_engine = null;
    }
    destroyCallback(next);
  };
};


function ModularViews(){
  // todo build a gateway hub!
};

function Stage(){
	console.log('stage ready');
	var stageViews = new StageViews();
  var rtc_engine = null;

  this.leave = function(destroyCallback, next){
    if (rtc_engine){
      rtc_engine.leave();
      rtc_engine = null;
    }
    destroyCallback(next);
  };
};


function StageViews(){
  // todo build a streaming star topology app!

};

// List of sessions
Janus.sessions = {};

// Screensharing Chrome Extension ID
Janus.extensionId = "hapfgfdkleiggjjpfpenajgdnfckjpaj";
Janus.isExtensionEnabled = function() {
  if(window.navigator.userAgent.match('Chrome')) {
    var chromever = parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10);
    var maxver = 33;
    if(window.navigator.userAgent.match('Linux'))
      maxver = 35;  // "known" crash in chrome 34 and 35 on linux
    if(chromever >= 26 && chromever <= maxver) {
      // Older versions of Chrome don't support this extension-based approach, so lie
      return true;
    }
    return ($('#janus-extension-installed').length > 0);
  } else {
    // Firefox of others, no need for the extension (but this doesn't mean it will work)
    return true;
  }
};

Janus.noop = function() {};

// Initialization
Janus.init = function(options) {
  options = options || {};
  options.callback = (typeof options.callback == "function") ? options.callback : Janus.noop;
  if(Janus.initDone === true) {
    // Already initialized
    options.callback();
  } else {
    if(typeof console == "undefined" || typeof console.log == "undefined")
      console = { log: function() {} };
    // Console log (debugging disabled by default)
    Janus.log = (options.debug === true) ? console.log.bind(console) : Janus.noop;
    Janus.log("Initializing library");
    Janus.initDone = true;
    // Detect tab close
    window.onbeforeunload = function() {
      Janus.log("Closing window");
      for(var s in Janus.sessions) {
        Janus.log("Destroying session " + s);
        Janus.sessions[s].destroy();
      }
    }
    // Helper to add external JavaScript sources
    function addJs(src) {
      if(src === 'jquery.min.js') {
        if(window.jQuery) {
          // Already loaded
          options.callback();
          return;
        }
      }
      var oHead = document.getElementsByTagName('head').item(0);
      var oScript = document.createElement("script");
      oScript.type = "text/javascript";
      oScript.src = src;
      oScript.onload = function() {
        Janus.log("Library " + src + " loaded");
        if(src === 'jquery.min.js') {
          options.callback();
        }
      }
      oHead.appendChild(oScript);
    };

    //addJs('adapter.js');
    addJs('jquery.min.js');
  }
};

// Helper method to check whether WebRTC is supported by this browser
Janus.isWebrtcSupported = function() {
  if(RTCPeerConnection === null || getUserMedia === null) {
    return false;
  }
  return true;
};

function Janus(gatewayCallbacks) {
  if(Janus.initDone === undefined) {
    gatewayCallbacks.error("Library not initialized");
    return {};
  }
  if(!Janus.isWebrtcSupported()) {
    gatewayCallbacks.error("WebRTC not supported by this browser");
    return {};
  }
  Janus.log("Library initialized: " + Janus.initDone);
  gatewayCallbacks = gatewayCallbacks || {};
  gatewayCallbacks.success = (typeof gatewayCallbacks.success == "function") ? gatewayCallbacks.success : jQuery.noop;
  gatewayCallbacks.error = (typeof gatewayCallbacks.error == "function") ? gatewayCallbacks.error : jQuery.noop;
  gatewayCallbacks.destroyed = (typeof gatewayCallbacks.destroyed == "function") ? gatewayCallbacks.destroyed : jQuery.noop;
  if(gatewayCallbacks.server === null || gatewayCallbacks.server === undefined) {
    gatewayCallbacks.error("Invalid gateway url");
    return {};
  }
  var websockets = false;
  var ws = null;
  var servers = null, serversIndex = 0;
  var server = gatewayCallbacks.server;
  if($.isArray(server)) {
    Janus.log("Multiple servers provided (" + server.length + "), will use the first that works");
    server = null;
    servers = gatewayCallbacks.server;
    Janus.log(servers);
  } else {
    if(server.indexOf("ws") === 0) {
      websockets = true;
      Janus.log("Using WebSockets to contact Janus");
    } else {
      websockets = false;
      Janus.log("Using REST API to contact Janus");
    }
    Janus.log(server);
  }
  var iceServers = gatewayCallbacks.iceServers;
  if(iceServers === undefined || iceServers === null)
    iceServers = [{"url": "stun:stun.l.google.com:19302"}];
  var maxev = null;
  if(gatewayCallbacks.max_poll_events !== undefined && gatewayCallbacks.max_poll_events !== null)
    maxev = gatewayCallbacks.max_poll_events;
  if(maxev < 1)
    maxev = 1;
  var connected = false;
  var sessionId = null;
  var pluginHandles = {};
  var that = this;
  var retries = 0;
  var transactions = {};
  createSession(gatewayCallbacks);

  // Public methods
  this.getServer = function() { return server; };
  this.isConnected = function() { return connected; };
  this.getSessionId = function() { return sessionId; };
  this.destroy = function(callbacks) { destroySession(callbacks); };
  this.attach = function(callbacks) { createHandle(callbacks); };

  
  // Private method to create random identifiers (e.g., transaction)
  function randomString(len) {
    charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
  }

  function eventHandler() {
    if(sessionId == null)
      return;
    Janus.log('Long poll...');
    if(!connected) {
      Janus.log("Is the gateway down? (connected=false)");
      return;
    }
    var longpoll = server + "/" + sessionId + "?rid=" + new Date().getTime();
    if(maxev !== undefined && maxev !== null)
      longpoll = longpoll + "&maxev=" + maxev;
    $.ajax({
      type: 'GET',
      url: longpoll,
      cache: false,
      timeout: 60000,  // FIXME
      success: handleEvent,
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        Janus.log(textStatus + ": " + errorThrown);
        //~ clearTimeout(timeoutTimer);
        retries++;
        if(retries > 3) {
          // Did we just lose the gateway? :-(
          connected = false;
          gatewayCallbacks.error("Lost connection to the gateway (is it down?)");
          return;
        }
        eventHandler();
      },
      dataType: "json"
    });
  }
  
  // Private event handler: this will trigger plugin callbacks, if set
  function handleEvent(json) {
    retries = 0;
    if(!websockets && sessionId !== undefined && sessionId !== null)
      setTimeout(eventHandler, 200);
    Janus.log("Got event on session " + sessionId);
    Janus.log(json);
    if(!websockets && $.isArray(json)) {
      // We got an array: it means we passed a maxev > 1, iterate on all objects
      for(var i=0; i<json.length; i++) {
        handleEvent(json[i]);
      }
      return;
    }
    if(json["janus"] === "keepalive") {
      // Nothing happened
      return;
    } else if(json["janus"] === "ack") {
      // Just an ack, ignore
      return;
    } else if(json["janus"] === "success") {
      // Success!
      var transaction = json["transaction"];
      if(transaction !== null && transaction !== undefined) {
        var reportSuccess = transactions[transaction];
        if(reportSuccess !== null && reportSuccess !== undefined) {
          reportSuccess(json);
        }
        transactions[transaction] = null;
      }
      return;
    } else if(json["janus"] === "webrtcup") {
      // The PeerConnection with the gateway is up! FIXME Should we notify this?
      return;
    } else if(json["janus"] === "hangup") {
      // A plugin asked the core to hangup a PeerConnection on one of our handles
      var sender = json["sender"];
      if(sender === undefined || sender === null) {
        Janus.log("Missing sender...");
        return;
      }
      var pluginHandle = pluginHandles[sender];
      if(pluginHandle === undefined || pluginHandle === null) {
        Janus.log("This handle is not attached to this session");
        return;
      }
      pluginHandle.hangup();
    } else if(json["janus"] === "detached") {
      // A plugin asked the core to detach one of our handles
      var sender = json["sender"];
      if(sender === undefined || sender === null) {
        Janus.log("Missing sender...");
        return;
      }
      var pluginHandle = pluginHandles[sender];
      if(pluginHandle === undefined || pluginHandle === null) {
        Janus.log("This handle is not attached to this session");
        return;
      }
      pluginHandle.ondetached();
      pluginHandle.detach();
    } else if(json["janus"] === "error") {
      // Oops, something wrong happened
      Janus.log("Ooops: " + json["error"].code + " " + json["error"].reason);  // FIXME
      var transaction = json["transaction"];
      if(transaction !== null && transaction !== undefined) {
        var reportSuccess = transactions[transaction];
        if(reportSuccess !== null && reportSuccess !== undefined) {
          reportSuccess(json);
        }
        transactions[transaction] = null;
      }
      return;
    } else if(json["janus"] === "event") {
      var sender = json["sender"];
      if(sender === undefined || sender === null) {
        Janus.log("Missing sender...");
        return;
      }
      var plugindata = json["plugindata"];
      if(plugindata === undefined || plugindata === null) {
        Janus.log("Missing plugindata...");
        return;
      }
      Janus.log("  -- Event is coming from " + sender + " (" + plugindata["plugin"] + ")");
      var data = plugindata["data"];
      Janus.log(data);
      var pluginHandle = pluginHandles[sender];
      if(pluginHandle === undefined || pluginHandle === null) {
        Janus.log("This handle is not attached to this session");
        return;
      }
      var jsep = json["jsep"];
      if(jsep !== undefined && jsep !== null) {
        Janus.log("Handling SDP as well...");
        Janus.log(jsep);
      }
      var callback = pluginHandle.onmessage;
      if(callback !== null && callback !== undefined) {
        Janus.log("Notifying application...");
        // Send to callback specified when attaching plugin handle
        callback(data, jsep);
      } else {
        // Send to generic callback (?)
        Janus.log("No provided notification callback");
      }
    } else {
      Janus.log("Unknown message '" + json["janus"] + "'");
    }
  }
  
  // Private helper to send keep-alive messages on WebSockets
  function keepAlive() {
    if(server === null || !websockets || !connected)
      return;
    setTimeout(keepAlive, 30000);
    var request = { "janus": "keepalive", "session_id": sessionId, "transaction": randomString(12) };
    ws.send(JSON.stringify(request));
  }

  // Private method to create a session
  function createSession(callbacks) {
    var transaction = randomString(12);
    var request = { "janus": "create", "transaction": transaction };
    if(server === null && $.isArray(servers)) {
      // We still need to find a working server from the list we were given
      server = servers[serversIndex];
      if(server.indexOf("ws") === 0) {
        websockets = true;
        Janus.log("Server #" + (serversIndex+1) + ": trying WebSockets to contact Janus");
      } else {
        websockets = false;
        Janus.log("Server #" + (serversIndex+1) + ": trying REST API to contact Janus");
      }
      Janus.log(server);
    }
    if(websockets) {
      ws = new WebSocket(server); 
      ws.onerror = function() {
        Janus.log("Error connecting to the Janus WebSockets server...");
        if($.isArray(servers)) {
          serversIndex++;
          if(serversIndex == servers.length) {
            // We tried all the servers the user gave us and they all failed
            callbacks.error("Error connecting to any of the provided Janus servers: Is the gateway down?");
            return;
          }
          // Let's try the next server
          server = null;
          setTimeout(function() { createSession(callbacks); }, 200);
          return;
        }
        callbacks.error("Error connecting to the Janus WebSockets server: Is the gateway down?");
      };
      ws.onopen = function() {
        // We need to be notified about the success
        transactions[transaction] = function(json) {
          Janus.log("Create session:");
          Janus.log(json);
          if(json["janus"] !== "success") {
            Janus.log("Ooops: " + json["error"].code + " " + json["error"].reason);  // FIXME
            callbacks.error(json["error"].reason);
            return;
          }
          setTimeout(keepAlive, 30000);
          connected = true;
          sessionId = json.data["id"];
          Janus.log("Created session: " + sessionId);
          Janus.sessions[sessionId] = that;
          callbacks.success();
        };
        ws.send(JSON.stringify(request));
      };
      ws.onmessage = function(event) {
        handleEvent(JSON.parse(event.data));
      };
      ws.onclose = function() {
        if(server === null || !connected)
          return;
        connected = false;
        // FIXME What if this is called when the page is closed?
        gatewayCallbacks.error("Lost connection to the gateway (is it down?)");
      };
      return;
    }
    $.ajax({
      type: 'POST',
      url: server,
      cache: false,
      contentType: "application/json",
      data: JSON.stringify(request),
      success: function(json) {
        Janus.log("Create session:");
        Janus.log(json);
        if(json["janus"] !== "success") {
          Janus.log("Ooops: " + json["error"].code + " " + json["error"].reason);  // FIXME
          callbacks.error(json["error"].reason);
          return;
        }
        connected = true;
        sessionId = json.data["id"];
        Janus.log("Created session: " + sessionId);
        Janus.sessions[sessionId] = that;
        eventHandler();
        callbacks.success();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        Janus.log(textStatus + ": " + errorThrown);  // FIXME
        if($.isArray(servers)) {
          serversIndex++;
          if(serversIndex == servers.length) {
            // We tried all the servers the user gave us and they all failed
            callbacks.error("Error connecting to any of the provided Janus servers: Is the gateway down?");
            return;
          }
          // Let's try the next server
          server = null;
          setTimeout(function() { createSession(callbacks); }, 200);
          return;
        }
        if(errorThrown === "")
          callbacks.error(textStatus + ": Is the gateway down?");
        else
          callbacks.error(textStatus + ": " + errorThrown);
      },
      dataType: "json"
    });
  }

  // Private method to destroy a session
  function destroySession(callbacks, syncRequest) {
    syncRequest = (syncRequest === true);
    Janus.log("Destroying session " + sessionId + " (sync=" + syncRequest + ")");
    callbacks = callbacks || {};
    // FIXME This method triggers a success even when we fail
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : jQuery.noop;
    if(!connected) {
      Janus.log("Is the gateway down? (connected=false)");
      callbacks.success();
      return;
    }
    if(sessionId === undefined || sessionId === null) {
      Janus.log("No session to destroy");
      callbacks.success();
      gatewayCallbacks.destroyed();
      return;
    }
    delete Janus.sessions[sessionId];
    // Destroy all handles first
    for(ph in pluginHandles) {
      var phv = pluginHandles[ph];
      Janus.log("Destroying handle " + phv.id + " (" + phv.plugin + ")");
      destroyHandle(phv.id, null, syncRequest);
    }
    // Ok, go on
    var request = { "janus": "destroy", "transaction": randomString(12) };
    if(websockets) {
      request["session_id"] = sessionId;
      ws.send(JSON.stringify(request));
      callbacks.success();
      gatewayCallbacks.destroyed();
      return;
    }
    $.ajax({
      type: 'POST',
      url: server + "/" + sessionId,
      async: syncRequest,  // Sometimes we need false here, or destroying in onbeforeunload won't work
      cache: false,
      contentType: "application/json",
      data: JSON.stringify(request),
      success: function(json) {
        Janus.log("Destroyed session:");
        Janus.log(json);
        sessionId = null;
        connected = false;
        if(json["janus"] !== "success") {
          Janus.log("Ooops: " + json["error"].code + " " + json["error"].reason);  // FIXME
        }
        callbacks.success();
        gatewayCallbacks.destroyed();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        Janus.log(textStatus + ": " + errorThrown);  // FIXME
        // Reset everything anyway
        sessionId = null;
        connected = false;
        callbacks.success();
        gatewayCallbacks.destroyed();
      },
      dataType: "json"
    });
  }
  
  // Private method to create a plugin handle
  function createHandle(callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : jQuery.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : jQuery.noop;
    callbacks.consentDialog = (typeof callbacks.consentDialog == "function") ? callbacks.consentDialog : jQuery.noop;
    callbacks.onmessage = (typeof callbacks.onmessage == "function") ? callbacks.onmessage : jQuery.noop;
    callbacks.onlocalstream = (typeof callbacks.onlocalstream == "function") ? callbacks.onlocalstream : jQuery.noop;
    callbacks.onremotestream = (typeof callbacks.onremotestream == "function") ? callbacks.onremotestream : jQuery.noop;
    callbacks.ondata = (typeof callbacks.ondata == "function") ? callbacks.ondata : jQuery.noop;
    callbacks.ondataopen = (typeof callbacks.ondataopen == "function") ? callbacks.ondataopen : jQuery.noop;
    callbacks.oncleanup = (typeof callbacks.oncleanup == "function") ? callbacks.oncleanup : jQuery.noop;
    callbacks.ondetached = (typeof callbacks.ondetached == "function") ? callbacks.ondetached : jQuery.noop;
    if(!connected) {
      Janus.log("Is the gateway down? (connected=false)");
      callbacks.error("Is the gateway down? (connected=false)");
      return;
    }
    var plugin = callbacks.plugin;
    if(plugin === undefined || plugin === null) {
      Janus.log("Invalid plugin");
      callbacks.error("Invalid plugin");
      return;
    }
    var transaction = randomString(12);
    var request = { "janus": "attach", "plugin": plugin, "transaction": transaction };
    if(websockets) {
      transactions[transaction] = function(json) {
        Janus.log("Create handle:");
        Janus.log(json);
        if(json["janus"] !== "success") {
          Janus.log("Ooops: " + json["error"].code + " " + json["error"].reason);  // FIXME
          callbacks.error("Ooops: " + json["error"].code + " " + json["error"].reason);
          return;
        }
        var handleId = json.data["id"];
        Janus.log("Created handle: " + handleId);
        var pluginHandle =
          {
            session : that,
            plugin : plugin,
            id : handleId,
            webrtcStuff : {
              started : false,
              myStream : null,
              mySdp : null,
              pc : null,
              dataChannel : null,
              dtmfSender : null,
              trickle : true,
              iceDone : false,
              sdpSent : false,
              bitrate : {
                value : null,
                bsnow : null,
                bsbefore : null,
                tsnow : null,
                tsbefore : null,
                timer : null
              }
            },
            getId : function() { return handleId; },
            getPlugin : function() { return plugin; },
            getBitrate : function() { return getBitrate(handleId); },
            send : function(callbacks) { sendMessage(handleId, callbacks); },
            data : function(callbacks) { sendData(handleId, callbacks); },
            dtmf : function(callbacks) { sendDtmf(handleId, callbacks); },
            consentDialog : callbacks.consentDialog,
            onmessage : callbacks.onmessage,
            createOffer : function(callbacks) { prepareWebrtc(handleId, callbacks); },
            createAnswer : function(callbacks) { prepareWebrtc(handleId, callbacks); },
            handleRemoteJsep : function(callbacks) { prepareWebrtcPeer(handleId, callbacks); },
            onlocalstream : callbacks.onlocalstream,
            onremotestream : callbacks.onremotestream,
            ondata : callbacks.ondata,
            ondataopen : callbacks.ondataopen,
            oncleanup : callbacks.oncleanup,
            ondetached : callbacks.ondetached,
            hangup : function() { cleanupWebrtc(handleId); },
            detach : function(callbacks) { destroyHandle(handleId, callbacks); },
          }
        pluginHandles[handleId] = pluginHandle;
        callbacks.success(pluginHandle);
      };
      request["session_id"] = sessionId;
      ws.send(JSON.stringify(request));
      return;
    }
    $.ajax({
      type: 'POST',
      url: server + "/" + sessionId,
      cache: false,
      contentType: "application/json",
      data: JSON.stringify(request),
      success: function(json) {
        Janus.log("Create handle:");
        Janus.log(json);
        if(json["janus"] !== "success") {
          Janus.log("Ooops: " + json["error"].code + " " + json["error"].reason);  // FIXME
          callbacks.error("Ooops: " + json["error"].code + " " + json["error"].reason);
          return;
        }
        var handleId = json.data["id"];
        Janus.log("Created handle: " + handleId);
        var pluginHandle =
          {
            session : that,
            plugin : plugin,
            id : handleId,
            webrtcStuff : {
              started : false,
              myStream : null,
              mySdp : null,
              pc : null,
              dataChannel : null,
              dtmfSender : null,
              trickle : true,
              iceDone : false,
              sdpSent : false,
              bitrate : {
                value : null,
                bsnow : null,
                bsbefore : null,
                tsnow : null,
                tsbefore : null,
                timer : null
              }
            },
            getId : function() { return handleId; },
            getPlugin : function() { return plugin; },
            getBitrate : function() { return getBitrate(handleId); },
            send : function(callbacks) { sendMessage(handleId, callbacks); },
            data : function(callbacks) { sendData(handleId, callbacks); },
            dtmf : function(callbacks) { sendDtmf(handleId, callbacks); },
            consentDialog : callbacks.consentDialog,
            onmessage : callbacks.onmessage,
            createOffer : function(callbacks) { prepareWebrtc(handleId, callbacks); },
            createAnswer : function(callbacks) { prepareWebrtc(handleId, callbacks); },
            handleRemoteJsep : function(callbacks) { prepareWebrtcPeer(handleId, callbacks); },
            onlocalstream : callbacks.onlocalstream,
            onremotestream : callbacks.onremotestream,
            ondata : callbacks.ondata,
            ondataopen : callbacks.ondataopen,
            oncleanup : callbacks.oncleanup,
            ondetached : callbacks.ondetached,
            hangup : function() { cleanupWebrtc(handleId); },
            detach : function(callbacks) { destroyHandle(handleId, callbacks); }
          }
        pluginHandles[handleId] = pluginHandle;
        callbacks.success(pluginHandle);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        Janus.log(textStatus + ": " + errorThrown);  // FIXME
      },
      dataType: "json"
    });
  }

  // Private method to send a message
  function sendMessage(handleId, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : jQuery.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : jQuery.noop;
    if(!connected) {
      Janus.log("Is the gateway down? (connected=false)");
      callbacks.error("Is the gateway down? (connected=false)");
      return;
    }
    var message = callbacks.message;
    var jsep = callbacks.jsep;
    var request = { "janus": "message", "body": message, "transaction": randomString(12) };
    if(jsep !== null && jsep !== undefined)
      request.jsep = jsep;
    Janus.log("Sending message to plugin (handle=" + handleId + "):");
    Janus.log(request);
    if(websockets) {
      request["session_id"] = sessionId;
      request["handle_id"] = handleId;
      ws.send(JSON.stringify(request));
      return;
    }
    $.ajax({
      type: 'POST',
      url: server + "/" + sessionId + "/" + handleId,
      cache: false,
      contentType: "application/json",
      data: JSON.stringify(request),
      success: function(json) {
        Janus.log(json);
        Janus.log("Message sent!");
        if(json["janus"] !== "ack") {
          Janus.log("Ooops: " + json["error"].code + " " + json["error"].reason);  // FIXME
          callbacks.error(json["error"].code + " " + json["error"].reason);
          return;
        }
        callbacks.success();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        Janus.log(textStatus + ": " + errorThrown);  // FIXME
        callbacks.error(textStatus + ": " + errorThrown);
      },
      dataType: "json"
    });
  }

  // Private method to send a trickle candidate
  function sendTrickleCandidate(handleId, candidate) {
    if(!connected) {
      Janus.log("Is the gateway down? (connected=false)");
      return;
    }
    var request = { "janus": "trickle", "candidate": candidate, "transaction": randomString(12) };
    Janus.log("Sending trickle candidate (handle=" + handleId + "):");
    Janus.log(request);
    if(websockets) {
      request["session_id"] = sessionId;
      request["handle_id"] = handleId;
      ws.send(JSON.stringify(request));
      return;
    }
    $.ajax({
      type: 'POST',
      url: server + "/" + sessionId + "/" + handleId,
      cache: false,
      contentType: "application/json",
      data: JSON.stringify(request),
      success: function(json) {
        Janus.log(json);
        Janus.log("Candidate sent!");
        if(json["janus"] !== "ack") {
          Janus.log("Ooops: " + json["error"].code + " " + json["error"].reason);  // FIXME
          return;
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        Janus.log(textStatus + ": " + errorThrown);  // FIXME
      },
      dataType: "json"
    });
  }

  // Private method to send a data channel message
  function sendData(handleId, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : jQuery.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : jQuery.noop;
    var pluginHandle = pluginHandles[handleId];
    var config = pluginHandle.webrtcStuff;
    if(config.dataChannel === null || config.dataChannel === undefined) {
      Janus.log("Invalid data channel");
      callbacks.error("Invalid data channel");
      return;
    }
    var text = callbacks.text;
    if(text === null || text === undefined) {
      Janus.log("Invalid text");
      callbacks.error("Invalid text");
      return;
    }
    Janus.log("Sending string on data channel: " + text); 
    config.dataChannel.send(text);
    callbacks.success();
  }

  // Private method to send a DTMF tone
  function sendDtmf(handleId, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : jQuery.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : jQuery.noop;
    var pluginHandle = pluginHandles[handleId];
    var config = pluginHandle.webrtcStuff;
    if(config.dtmfSender === null || config.dtmfSender === undefined) {
      // Create the DTMF sender, if possible
      if(config.myStream !== undefined && config.myStream !== null) {
        var tracks = config.myStream.getAudioTracks();
        if(tracks !== null && tracks !== undefined && tracks.length > 0) {
          var local_audio_track = tracks[0];
          config.dtmfSender = config.pc.createDTMFSender(local_audio_track);
          Janus.log("Created DTMF Sender");
          config.dtmfSender.ontonechange = function(tone) { Janus.log("Sent DTMF tone: " + tone.tone); };
        }
      }
      if(config.dtmfSender === null || config.dtmfSender === undefined) {
        Janus.log("Invalid DTMF configuration");
        callbacks.error("Invalid DTMF configuration");
        return;
      }
    }
    var dtmf = callbacks.dtmf;
    if(dtmf === null || dtmf === undefined) {
      Janus.log("Invalid DTMF parameters");
      callbacks.error("Invalid DTMF parameters");
      return;
    }
    var tones = dtmf.tones;
    if(tones === null || tones === undefined) {
      Janus.log("Invalid DTMF string");
      callbacks.error("Invalid DTMF string");
      return;
    }
    var duration = dtmf.duration;
    if(duration === null || duration === undefined)
      duration = 500;  // We choose 500ms as the default duration for a tone 
    var gap = dtmf.gap;
    if(gap === null || gap === undefined)
      gap = 50;  // We choose 50ms as the default gap between tones
    Janus.log("Sending DTMF string " + tones + " (duration " + duration + "ms, gap " + gap + "ms"); 
    config.dtmfSender.insertDTMF(tones, duration, gap);
  }

  // Private method to destroy a plugin handle
  function destroyHandle(handleId, callbacks, syncRequest) {
    syncRequest = (syncRequest === true);
    Janus.log("Destroying handle " + handleId + " (sync=" + syncRequest + ")");
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : jQuery.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : jQuery.noop;
    cleanupWebrtc(handleId);
    if(!connected) {
      Janus.log("Is the gateway down? (connected=false)");
      callbacks.error("Is the gateway down? (connected=false)");
      return;
    }
    var request = { "janus": "detach", "transaction": randomString(12) };
    if(websockets) {
      request["session_id"] = sessionId;
      request["handle_id"] = handleId;
      ws.send(JSON.stringify(request));
      var pluginHandle = pluginHandles[handleId];
      delete pluginHandles[handleId];
      callbacks.success();
      return;
    }
    $.ajax({
      type: 'POST',
      url: server + "/" + sessionId + "/" + handleId,
      async: syncRequest,  // Sometimes we need false here, or destroying in onbeforeunload won't work
      cache: false,
      contentType: "application/json",
      data: JSON.stringify(request),
      success: function(json) {
        Janus.log("Destroyed handle:");
        Janus.log(json);
        if(json["janus"] !== "success") {
          Janus.log("Ooops: " + json["error"].code + " " + json["error"].reason);  // FIXME
        }
        var pluginHandle = pluginHandles[handleId];
        delete pluginHandles[handleId];
        callbacks.success();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        Janus.log(textStatus + ": " + errorThrown);  // FIXME
        // We cleanup anyway
        var pluginHandle = pluginHandles[handleId];
        delete pluginHandles[handleId];
        callbacks.success();
      },
      dataType: "json"
    });
  }
  
  // WebRTC stuff
  function streamsDone(handleId, jsep, media, callbacks, stream) {
    var pluginHandle = pluginHandles[handleId];
    var config = pluginHandle.webrtcStuff;
    if(stream !== null && stream !== undefined)
      Janus.log(stream);
    config.myStream = stream;
    Janus.log("streamsDone:");
    if(stream !== null && stream !== undefined)
      Janus.log(stream);
    var pc_config = {"iceServers": iceServers};
    //~ var pc_constraints = {'mandatory': {'MozDontOfferDataChannel':true}};
    var pc_constraints = {
      "optional": [{"DtlsSrtpKeyAgreement": true}]
    };
    Janus.log("Creating PeerConnection:");
    Janus.log(pc_constraints);
    config.pc = new RTCPeerConnection(pc_config, pc_constraints);
    Janus.log(config.pc);
    if(config.pc.getStats && webrtcDetectedBrowser == "chrome")  // FIXME
      config.bitrate.value = "0 kbps";
    Janus.log("Preparing local SDP and gathering candidates (trickle=" + config.trickle + ")"); 
    config.pc.onicecandidate = function(event) {
      if (event.candidate == null) {
        Janus.log("End of candidates.");
        config.iceDone = true;
        if(config.trickle === true) {
          // Notify end of candidates
          sendTrickleCandidate(handleId, null);
        } else {
          // No trickle, time to send the complete SDP (including all candidates) 
          sendSDP(handleId, callbacks);
        }
      } else {
        Janus.log("candidates: " + JSON.stringify(event.candidate));
        if(config.trickle === true) {
          // Send candidate
          sendTrickleCandidate(handleId, event.candidate);
        }
      }
    };
    if(stream !== null && stream !== undefined) {
      Janus.log('Adding local stream');
      config.pc.addStream(stream);
      pluginHandle.onlocalstream(stream);
    }
    config.pc.onaddstream = function(remoteStream) {
      Janus.log("Handling Remote Stream:");
      Janus.log(remoteStream);
      // Start getting the bitrate, if getStats is supported
      if(config.pc.getStats && webrtcDetectedBrowser == "chrome") {  // FIXME
        // http://webrtc.googlecode.com/svn/trunk/samples/js/demos/html/constraints-and-stats.html
        Janus.log("Starting bitrate monitor");
        config.bitrate.timer = setInterval(function() {
          //~ config.pc.getStats(config.pc.getRemoteStreams()[0].getVideoTracks()[0], function(stats) {
          config.pc.getStats(function(stats) {
            var results = stats.result();
            for(var i=0; i<results.length; i++) {
              var res = results[i];
              if(res.type == 'ssrc' && res.stat('googFrameHeightReceived')) {
                config.bitrate.bsnow = res.stat('bytesReceived');
                config.bitrate.tsnow = res.timestamp;
                if(config.bitrate.bsbefore === null || config.bitrate.tsbefore === null) {
                  // Skip this round
                  config.bitrate.bsbefore = config.bitrate.bsnow;
                  config.bitrate.tsbefore = config.bitrate.tsnow;
                } else {
                  // Calculate bitrate
                  var bitRate = Math.round((config.bitrate.bsnow - config.bitrate.bsbefore) * 8 / (config.bitrate.tsnow - config.bitrate.tsbefore));
                  config.bitrate.value = bitRate + ' kbits/sec';
                  //~ Janus.log("Estimated bitrate is " + config.bitrate.value);
                  config.bitrate.bsbefore = config.bitrate.bsnow;
                  config.bitrate.tsbefore = config.bitrate.tsnow;
                }
              }
            }
          });
        }, 1000);
      }
      pluginHandle.onremotestream(remoteStream.stream);
    };
    // Any data channel to create?
    if(isDataEnabled(media)) {
      Janus.log("Creating data channel");
      var onDataChannelMessage = function(event) {
        Janus.log('Received message on data channel: ' + event.data);
        pluginHandle.ondata(event.data);  // FIXME
      }
      var onDataChannelStateChange = function() {
        Janus.log('State change on data channel: ' + config.dataChannel.readyState);
        if(config.dataChannel.readyState === 'open') {
          pluginHandle.ondataopen();  // FIXME
        }
      }
      var onDataChannelError = function(error) {
        Janus.log('Got error on data channel:');
        Janus.log(error);
        // TODO
      }
      // Until we implement the proxying of open requests within the Janus core, we open a channel ourselves whatever the case
      config.dataChannel = config.pc.createDataChannel("JanusDataChannel", {ordered:false});  // FIXME Add options (ordered, maxRetransmits, etc.)
      config.dataChannel.onmessage = onDataChannelMessage;
      config.dataChannel.onopen = onDataChannelStateChange;
      config.dataChannel.onclose = onDataChannelStateChange;
      config.dataChannel.onerror = onDataChannelError;
    }
    // Create offer/answer now
    if(jsep === null || jsep === undefined) {
      createOffer(handleId, media, callbacks);
    } else {
      config.pc.setRemoteDescription(
          new RTCSessionDescription(jsep),
          function() {
            Janus.log("Remote description accepted!");
            createAnswer(handleId, media, callbacks);
          }, callbacks.error);
    }
  }

  function prepareWebrtc(handleId, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : jQuery.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : webrtcError;
    var jsep = callbacks.jsep;
    var media = callbacks.media;
    var pluginHandle = pluginHandles[handleId];
    var config = pluginHandle.webrtcStuff;
    // Are we updating a session?
    if(config.pc !== undefined && config.pc !== null) {
      Janus.log("Updating existing media session");
      // Create offer/answer now
      if(jsep === null || jsep === undefined) {
        createOffer(handleId, media, callbacks);
      } else {
        config.pc.setRemoteDescription(
            new RTCSessionDescription(jsep),
            function() {
              Janus.log("Remote description accepted!");
              createAnswer(handleId, media, callbacks);
            }, callbacks.error);
      }
      return;
    } 
    config.trickle = isTrickleEnabled(callbacks.trickle);
    if(isAudioSendEnabled(media) || isVideoSendEnabled(media)) {
      var constraints = { mandatory: {}, optional: []};
      pluginHandle.consentDialog(true);
      var videoSupport = isVideoSendEnabled(media);
      if(videoSupport === true && media != undefined && media != null) {
        if(media.video === 'lowres') {
          // Add a video constraint (320x240)
          if(!navigator.mozGetUserMedia) {
            videoSupport = {"mandatory": {"maxHeight": "240", "maxWidth": "320"}, "optional": []};
            Janus.log("Adding media constraint (low-res video)");
            Janus.log(videoSupport);
          } else {
            Janus.log("Firefox doesn't support media constraints at the moment, ignoring low-res video");
          }
        } else if(media.video === 'hires') {
          // Add a video constraint (1280x720)
          if(!navigator.mozGetUserMedia) {
            videoSupport = {"mandatory": {"minHeight": "720", "minWidth": "1280"}, "optional": []};
            Janus.log("Adding media constraint (hi-res video)");
            Janus.log(videoSupport);
          } else {
            Janus.log("Firefox doesn't support media constraints at the moment, ignoring hi-res video");
          }
        } else if(media.video === 'screen') {
          // Not a webcam, but screen capture
          if(window.location.protocol !== 'https:') {
            // Screen sharing mandates HTTPS
            Janus.log("Screen sharing only works on HTTPS, try the https:// version of this page");
            pluginHandle.consentDialog(false);
            callbacks.error("Screen sharing only works on HTTPS, try the https:// version of this page");
            return;
          }
          // We're going to try and use the extension for Chrome 34+, the old approach
          // for older versions of Chrome, or the experimental support in Firefox 33+
          var cache = {};
          function callbackUserMedia (error, stream) {
            pluginHandle.consentDialog(false);
            if(error) {
              callbacks.error(error);
            } else {
              streamsDone(handleId, jsep, media, callbacks, stream);
            }
          };
          function getScreenMedia(constraints, gsmCallback) {
            Janus.log("Adding media constraint (screen capture)");
            Janus.log(constraints);
            getUserMedia(constraints,
              function(stream) {
                gsmCallback(null, stream);
              },
              function(error) {
                pluginHandle.consentDialog(false);
                gsmCallback(error);
              }
            );
          };
          if(window.navigator.userAgent.match('Chrome')) {
            var chromever = parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10);
            var maxver = 33;
            if(window.navigator.userAgent.match('Linux'))
              maxver = 35;  // "known" crash in chrome 34 and 35 on linux
            if(chromever >= 26 && chromever <= maxver) {
              // Chrome 26->33 requires some awkward chrome://flags manipulation
              constraints = {
                video: {
                  mandatory: {
                    googLeakyBucket: true,
                    maxWidth: window.screen.width,
                    maxHeight: window.screen.height,
                    maxFrameRate: 3,
                    chromeMediaSource: 'screen'
                  }
                },
                audio: isAudioSendEnabled(media)
              };
              getScreenMedia(constraints, callbackUserMedia);
            } else {
              // Chrome 34+ requires an extension
              var pending = window.setTimeout(
                function () {
                  error = new Error('NavigatorUserMediaError');
                  error.name = 'The required Chrome extension is not installed: click <a href="#">here</a> to install it. (NOTE: this will need you to refresh the page)';
                  pluginHandle.consentDialog(false);
                  return callbacks.error(error);
                }, 1000);
              cache[pending] = [callbackUserMedia, null];
              window.postMessage({ type: 'janusGetScreen', id: pending }, '*');
            }
          } else if (window.navigator.userAgent.match('Firefox')) {
            var ffver = parseInt(window.navigator.userAgent.match(/Firefox\/(.*)/)[1], 10);
            if(ffver >= 33) {
              // Firefox 33+ has experimental support for screen sharing
              constraints = {
                video: {
                  mozMediaSource: 'window',
                  mediaSource: 'window'
                },
                audio: isAudioSendEnabled(media)
              };
              getScreenMedia(constraints, function (err, stream) {
                callbackUserMedia(err, stream);
                // Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1045810
                if (!err) {
                  var lastTime = stream.currentTime;
                  var polly = window.setInterval(function () {
                    if(!stream)
                      window.clearInterval(polly);
                    if(stream.currentTime == lastTime) {
                      window.clearInterval(polly);
                      if(stream.onended) {
                        stream.onended();
                      }
                    }
                    lastTime = stream.currentTime;
                  }, 500);
                }
              });
            } else {
              var error = new Error('NavigatorUserMediaError');
              error.name = 'Your version of Firefox does not support screen sharing, please install Firefox 33 (or more recent versions)';
              pluginHandle.consentDialog(false);
              callbacks.error(error);
              return;
            }
          }

          // Wait for events from the Chrome Extension
          window.addEventListener('message', function (event) {
            if(event.origin != window.location.origin)
              return;
            if(event.data.type == 'janusGotScreen' && cache[event.data.id]) {
              var data = cache[event.data.id];
              var callback = data[0];
              delete cache[event.data.id];

              if (event.data.sourceId === '') {
                // user canceled
                var error = new Error('NavigatorUserMediaError');
                error.name = 'You cancelled the request for permission, giving up...';
                pluginHandle.consentDialog(false);
                callbacks.error(error);
              } else {
                constraints = {
                  audio: isAudioSendEnabled(media),
                  video: {
                    mandatory: {
                    chromeMediaSource: 'desktop',
                    maxWidth: window.screen.width,
                    maxHeight: window.screen.height,
                    maxFrameRate: 3
                  },
                  optional: [
                    {googLeakyBucket: true},
                    {googTemporalLayeredScreencast: true}
                  ]
                }};
                constraints.video.mandatory.chromeMediaSourceId = event.data.sourceId;
                getScreenMedia(constraints, callback);
              }
            } else if (event.data.type == 'janusGetScreenPending') {
              window.clearTimeout(event.data.id);
            }
          });
        }
      }
      // If we got here, we're not screensharing
      if(media.video !== 'screen') {
        getUserMedia(
          {audio:isAudioSendEnabled(media), video:videoSupport},
          function(stream) { pluginHandle.consentDialog(false); streamsDone(handleId, jsep, media, callbacks, stream); },
          function(error) { pluginHandle.consentDialog(false); callbacks.error(error); });
      }
    } else {
      // No need to do a getUserMedia, create offer/answer right away
      streamsDone(handleId, jsep, media, callbacks);
    }
  }

  function prepareWebrtcPeer(handleId, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : jQuery.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : webrtcError;
    var jsep = callbacks.jsep;
    var pluginHandle = pluginHandles[handleId];
    var config = pluginHandle.webrtcStuff;
    if(jsep !== undefined && jsep !== null) {
      if(config.pc === null) {
        Janus.log("Wait, no PeerConnection?? if this is an answer, use createAnswer and not handleRemoteJsep");
        callbacks.error("No PeerConnection: if this is an answer, use createAnswer and not handleRemoteJsep");
        return;
      }
      config.pc.setRemoteDescription(
          new RTCSessionDescription(jsep),
          function() {
            Janus.log("Remote description accepted!");
            callbacks.success();
          }, callbacks.error);
    } else {
      callbacks.error("Invalid JSEP");
    }
  }

  function createOffer(handleId, media, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : jQuery.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : jQuery.noop;
    var pluginHandle = pluginHandles[handleId];
    var config = pluginHandle.webrtcStuff;
    Janus.log("Creating offer (iceDone=" + config.iceDone + ")");
    var mediaConstraints = {
      'mandatory': {
        'OfferToReceiveAudio':isAudioRecvEnabled(media), 
        'OfferToReceiveVideo':isVideoRecvEnabled(media)
      }
    };
    Janus.log(mediaConstraints);
    config.pc.createOffer(
      function(offer) {
        Janus.log(offer);
        if(config.mySdp === null || config.mySdp === undefined) {
          Janus.log("Setting local description");
          config.mySdp = offer.sdp;
          config.pc.setLocalDescription(offer);
        }
        if(!config.iceDone && !config.trickle) {
          // Don't do anything until we have all candidates
          Janus.log("Waiting for all candidates...");
          return;
        }
        if(config.sdpSent) {
          Janus.log("Offer already sent, not sending it again");
          return;
        }
        Janus.log("Offer ready");
        Janus.log(callbacks);
        config.sdpSent = true;
        callbacks.success(offer);
      }, callbacks.error, mediaConstraints);
  }
  
  function createAnswer(handleId, media, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : jQuery.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : jQuery.noop;
    var pluginHandle = pluginHandles[handleId];
    var config = pluginHandle.webrtcStuff;
    Janus.log("Creating answer (iceDone=" + config.iceDone + ")");
    var mediaConstraints = {
      'mandatory': {
        'OfferToReceiveAudio':isAudioRecvEnabled(media), 
        'OfferToReceiveVideo':isVideoRecvEnabled(media)
      }
    };
    Janus.log(mediaConstraints);
    config.pc.createAnswer(
      function(answer) {
        Janus.log(answer);
        if(config.mySdp === null || config.mySdp === undefined) {
          Janus.log("Setting local description");
          config.mySdp = answer.sdp;
          config.pc.setLocalDescription(answer);
        }
        if(!config.iceDone && !config.trickle) {
          // Don't do anything until we have all candidates
          Janus.log("Waiting for all candidates...");
          return;
        }
        if(config.sdpSent) {  // FIXME badly
          Janus.log("Answer already sent, not sending it again");
          return;
        }
        config.sdpSent = true;
        callbacks.success(answer);
      }, callbacks.error, mediaConstraints);
  }

  function sendSDP(handleId, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : jQuery.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : jQuery.noop;
    var pluginHandle = pluginHandles[handleId];
    var config = pluginHandle.webrtcStuff;
    Janus.log("Sending offer/answer SDP...");
    if(config.mySdp === null || config.mySdp === undefined) {
      Janus.log("Local SDP instance is invalid, not sending anything...");
      return;
    }
    config.mySdp = config.pc.localDescription;
    if(config.sdpSent) {
      Janus.log("Offer/Answer SDP already sent, not sending it again");
      return;
    }
    Janus.log(callbacks);
    config.sdpSent = true;
    callbacks.success(config.mySdp);
  }

  function getBitrate(handleId) {
    var pluginHandle = pluginHandles[handleId];
    var config = pluginHandle.webrtcStuff;
    //~ Janus.log(pluginHandle);
    //~ Janus.log(config);
    //~ Janus.log(config.bitrate);
    if(config.bitrate.value === undefined || config.bitrate.value === null)
      return "Feature unsupported by browser";
    return config.bitrate.value;
  }
  
  function webrtcError(error) {
    Janus.log("WebRTC error:");
    Janus.log(error);
  }

  function cleanupWebrtc(handleId) {
    Janus.log("Cleaning WebRTC stuff");
    var pluginHandle = pluginHandles[handleId];
    var config = pluginHandle.webrtcStuff;
    // Cleanup
    if(config.bitrate.timer)
      clearInterval(config.bitrate.timer);
    config.bitrate.timer = null;
    config.bitrate.bsnow = null;
    config.bitrate.bsbefore = null;
    config.bitrate.tsnow = null;
    config.bitrate.tsbefore = null;
    config.bitrate.value = null;
    if(config.myStream !== null && config.myStream !== undefined) {
      Janus.log("Stopping local stream");
      config.myStream.stop();
    }
    config.myStream = null;
    // Close PeerConnection
    try {
      config.pc.close();
    } catch(e) {
      // Do nothing
    }
    config.pc = null;
    config.mySdp = null;
    config.iceDone = false;
    config.sdpSent = false;
    config.dataChannel = null;
    config.dtmfSender = null;
    pluginHandle.oncleanup();
  }

  // Helper methods to parse a media object
  function isAudioSendEnabled(media) {
    Janus.log("isAudioSendEnabled:");
    Janus.log(media);
    if(media === undefined || media === null)
      return true;  // Default
    if(media.audio === false)
      return false;  // Generic audio has precedence
    if(media.audioSend === undefined || media.audioSend === null)
      return true;  // Default
    return (media.audioSend === true);
  }

  function isAudioRecvEnabled(media) {
    Janus.log("isAudioRecvEnabled:");
    Janus.log(media);
    if(media === undefined || media === null)
      return true;  // Default
    if(media.audio === false)
      return false;  // Generic audio has precedence
    if(media.audioRecv === undefined || media.audioRecv === null)
      return true;  // Default
    return (media.audioRecv === true);
  }

  function isVideoSendEnabled(media) {
    Janus.log("isVideoSendEnabled:");
    Janus.log(media);
    if(media === undefined || media === null)
      return true;  // Default
    if(media.video === false)
      return false;  // Generic video has precedence
    if(media.videoSend === undefined || media.videoSend === null)
      return true;  // Default
    return (media.videoSend === true);
  }

  function isVideoRecvEnabled(media) {
    Janus.log("isVideoRecvEnabled:");
    Janus.log(media);
    if(media === undefined || media === null)
      return true;  // Default
    if(media.video === false)
      return false;  // Generic video has precedence
    if(media.videoRecv === undefined || media.videoRecv === null)
      return true;  // Default
    return (media.videoRecv === true);
  }

  function isDataEnabled(media) {
    Janus.log("isDataEnabled:");
    Janus.log(media);
    if(media === undefined || media === null)
      return false;  // Default
    return (media.data === true);
  }

  function isTrickleEnabled(trickle) {
    Janus.log("isTrickleEnabled:");
    Janus.log(trickle);
    if(trickle === undefined || trickle === null)
      return true;  // Default is true
    return (trickle === true);
  }
};
