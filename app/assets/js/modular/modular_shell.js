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
