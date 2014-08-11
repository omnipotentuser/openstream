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
