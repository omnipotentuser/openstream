function Lavatory(){
	console.log('lavatory ready');
	var lavatoryViews = new LavatoryViews();
  var rtc_engine = null;

  this.leave = function(destroyCallback, next){
    if (rtc_engine){
      rtc_engine.leave();
      rtc_engine = null;
    }
    destroyCallback(next);
  }
};
