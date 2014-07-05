function Lobby(cb){
	console.log('lobby ready');
	var lobbyViews = new LobbyViews(cb);
  var pages = lobbyViews.pages;

  return pages;
};
