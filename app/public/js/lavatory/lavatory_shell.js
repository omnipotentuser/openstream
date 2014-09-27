function Lavatory(){
	console.log('lavatory ready');
	var lavatoryViews = new LavatoryViews();
  var rtc_engine = null;

  $('.lavatory-engage').bind('click', lavatoryViews.start);

  this.leave = function(destroyCallback, next){
    if (lavatoryViews){
      lavatoryViews.stop();
      $('.lavatory-engage').unbind('click', lavatoryViews.start);
    }
    destroyCallback(next);
  }
};
