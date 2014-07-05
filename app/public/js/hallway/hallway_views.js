
function HallwayViews(){
  // todo build private p2p chat

  this.start = function( engine ){
    console.log('starting rtc engine');
    engine.connect();
  }
};
