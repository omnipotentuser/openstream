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
