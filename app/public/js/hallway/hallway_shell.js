function Hallway(){
  var rtc_engine = new RTCEngine();
	var hallwayViews = new HallwayViews();

  var handleSocketEvents = function(signaler, data){
    if (signaler){
      switch (signaler) {
        case 'connected':
          console.log('rtc engine connected');
          rtc_engine.join();
          break;
        case 'id':
          localId = data.id;
          break;
        case 'create':
          hallwayViews.appendMedia(data.id);
          break;
        case 'peerDisconnect':
          var pid = data.id;
          break;
        case 'readchar':
          hallwayViews.updateTextArea(data.id, data.code);
          break;
        case 'error':
          console.log(data.msg);
          break;
        default:
          break;
      };
    }
  };

  var handleJoinBtn = function(event){

    $input = $('#roomnameinput');
    console.log('room name:',$input.val());
    
    if ($input.val() === ''){

      alert('Cannot have empty name');

    } else {

      hallwayViews.openMediaViews();

      (function(room, engine){
        console.log('starting rtc engine');
        engine.connect(room, handleSocketEvents);
      })($input.text, rtc_engine);
      
    }
  };

  this.leave = function(destroyCallback){
    hallwayViews.closeMediaViews(destroyCallback);
    $('#joinroombtn').unbind('click', handleJoinBtn);
  };

  $('#joinroombtn').bind('click', handleJoinBtn);

};
