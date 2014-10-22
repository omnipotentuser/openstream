function Lobby(cb){
	console.log('lobby ready');
	var lobbyViews = new LobbyViews(cb);
  return lobbyViews.pages;
};
