
function logError(error) {
  console.log('error: ' + error.name);
}

function Peer(p_socket, p_id, p_roomName) {
  var pc = null,
      peerid = p_id,
      onByteChar = null,
      dc = null,
      socket = p_socket,
      localStream = null,
      roomName = p_roomName,
      ice_config = {iceServers:[]},
      credentials = {};

  if (navigator.mozGetUserMedia) {
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
