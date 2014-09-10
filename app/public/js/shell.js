$(document).ready(function(){

  var currentApp = null,
      hallway = null,
      lavatory = null,
      conference = null,
      lounge = null,
      stage = null,
      modular = null;

  var observer = function(next){
    if (currentApp){
      currentApp.leave(destroy, next);
    } else {
      start(next);
    }
  };

  var destroy = function(next){
    console.log('cleaning up');
    hallway = null;
    lavatory = null;
    conference = null;
    lounge = null;
    stage = null;
    modular = null;
    start(next);
  };

  var start = function(next){
    if (next === 'lobby'){
      console.log('observer calls lobby');
      currentApp = null;
    } else if (next === 'hallway'){
      hallway = new Hallway();
      currentApp = hallway;
    } else if (next === 'lavatory'){
      lavatory = new Lavatory();
      currentApp = lavatory;
    } else if (next === 'conference'){
      conference = new Conference();
      currentApp = conference;
    } else if (next === 'lounge'){
      lounge = new Lounge();
      currentApp = lounge;
    } else if (next === 'stage'){
      stage = new Stage();
      currentApp = stage;
    } else if (next === 'modular'){
      modular = new Modular();
      currentApp = modular;
    } else {
      console.log('start: unrecognized command');
      currentApp = null;
    }
  };

  var lobby = new Lobby(observer);

  var updatePage = function(event){
    var urlpath = window.location.pathname.substring(1);
    var hashurl = window.location.hash.substring(1);
    var url = '';
    url = urlpath ? urlpath : hashurl;
    console.log('urlpath',urlpath);
    console.log('hashurl', hashurl);
    console.log('url',url);
    switch ( url ){
      case 'hallway': 
        lobby.hallway();
        break;
      case 'lavatory':
        lobby.lavatory();
        break;
      case 'stage':
        lobby.stage();
        break;
      case 'modular':
        lobby.modular();
        break;
      case 'conference':
        lobby.conference();
        break;
      case 'lounge':
        lobby.lounge();
        break;
      default:
        lobby.lobby();
        break;
    };
  };

  $(window).bind('hashchange', updatePage).trigger('hashchange');

});

