function Lavatory(){
	console.log('lavatory ready');
	var lavatoryViews = new LavatoryViews();
  var rtc_engine = null;

  this.leave = function(destroyCallback, next){
    if (lavatoryViews){
      lavatoryViews.stop();
    }
    destroyCallback(next);
  }
};
