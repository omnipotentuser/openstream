$(document).ready(function(){

  var currentApp = null,
      hallway = null,
      lavatory = null,
      conference = null,
      lounge = null,
      stage = null,
      modular = null;

  var observer = function(action){
    if (currentApp){
      currentApp.leave(destroy);
    }
    if (action === 'lobby'){
      console.log('observer calls lobby');
      currentApp = null;
    } else if (action === 'hallway'){
      hallway = new Hallway();
      currentApp = hallway;
    } else if (action === 'lavatory'){
      lavatory = new Lavatory();
      currentApp = lavatory;
    } else if (action === 'conference'){
      conference = new Conference();
      currentApp = conference;
    } else if (action === 'lounge'){
      lounge = new Lounge();
      currentApp = lounge;
    } else if (action === 'stage'){
      stage = new Stage();
      currentApp = stage;
    } else if (action === 'modular'){
      modular = new Modular();
      currentApp = modular;
    } else {
      console.log('unrecognized action');
      currentApp = null;
    }
  };

  var destroy = function(){
    console.log('cleaning up');
    hallway = null;
    lavatory = null;
    conference = null;
    lounge = null;
    stage = null;
    modular = null;
  };

  var lobby = new Lobby(observer);

  var updatePage = function(event){
    var hashurl = window.location.hash.substring(1);
    console.log('updating page');
    switch ( hashurl ){
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

