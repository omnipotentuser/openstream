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
