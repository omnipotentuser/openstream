
function logError(error) {
    console.log('error: ' + error);
    console.log(error.name + ': ' + error.message);
}

function Peer(p_socket, p_id, p_roomName) {
  var pc = null,
      peerid = p_id,
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
  };

  this.buildClient = function(stream){
    for (var i = 0; i<credentials.length; i++){
        var iceServer = {};
        iceServer = createIceServer(credentials[i].url,
        credentials[i].username,
        credentials[i].credential);	
        ice_config.iceServers.push(iceServer);
    }
    pc = new RTCPeerConnection(ice_config, {'mandatory': [{'DtlsSrtpKeyAgreement': 'true'}]});
    pc.onaddstream = onAddStream;
    pc.onicecandidate = onIceCandidate;
    pc.oniceconnectionstatechange = onIceConnectionStateChange;
    pc.onnegotiationneeded = onNegotiationNeeded;
    pc.onremovestream = onRemoveStream;
    pc.onsignalingstatechange = onSignalingStateChange;
    if (stream){
      localStream = stream;
	    pc.addStream(localStream);
    }else{
	    alert('Media device is not detected.');
    }
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
      console.log('sending candidate', message.candidate.candidate);
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
	    console.log('Create new Ice Candidate for peer');
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
};
