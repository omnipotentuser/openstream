
function HallwayViews(){

  var localId;

  var handleSocketEvents(signaler, data){
    if (signaler){
      switch signaler :
        case 'id':
          localId = data.id;
          break;
        case 'create':
          var pid = data.id;
          break;
        case 'peerDisconnect':
          var pid = data.id;
          break;
        case 'readchar':
          var pid = data.id;
          var c = data.code;
          break;
        case 'error':
          console.log(data.msg);
          break;
        default:
          break;
    }
  };

  this.start = function( engine ){
    console.log('starting rtc engine');
    engine.connect(handleSocketEvents);
  }
};
