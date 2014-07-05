function Hallway(){
	console.log('hallway ready');
  var rtc_engine = new RTCEngine();
	var hallwayViews = new HallwayViews();

  // DOM start button clicked, handles rtc by
  // inserting room name into the rtc startMedia
  hallwayViews.start( rtc_engine );
};
