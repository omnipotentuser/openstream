$(document).ready(function(){

  var hallway = null,
      lavatory = null,
      conference = null,
      lounge = null,
      stage = null,
      modular = null;

  var observer = function(action){
    destroy();
    if (action === 'lobby'){
      console.log('observer calls lobby');
    } else if (action === 'hallway'){
      hallway = new Hallway();
    } else if (action === 'lavatory'){
      lavatory = new Lavatory();
    } else if (action === 'conference'){
      conference = new Conference();
    } else if (action === 'lounge'){
      lounge = new Lounge();
    } else if (action === 'stage'){
      stage = new Stage();
    } else if (action === 'modular'){
      modular = new Modular();
    } else {
      console.log('unrecognized action');
    }
  };

  var destroy = function(){
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

