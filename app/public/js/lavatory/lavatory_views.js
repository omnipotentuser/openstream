
// NICK - need to proxy the linode nginx to bovav.com
//
/*
if(window.location.protocol === 'http:')
	server = "http://" + window.location.hostname + ":9999/janus";
else
	server = "https://" + window.location.hostname + ":9999/janus";
  */

function LavatoryViews(){
  var $startbtn = $('.lavatory-engage');
  var $bitratebtn = $('#lavatory-btn-bitrate');
  var $audiobtn = $('#lavatory-toggle-audio');
  var $videobtn = $('#lavatory-toggle-video');
  var $container = $('.lavatory-container-location');
  var $bitratedropdown = $('#lavatory-dropdown-bitrate');

  var janus = null;
  var echotest = null;
  var started = false;
  var bitrateTimer = null;

  var audioenabled = false;
  var videoenabled = false;

  // Using Nginx to reverse proxy the connection to Janus. Lavatory
  // is connected to Node.js through Nginx and for connections
  // to Janus the directive '/janus' is used to point to Janus 
  // server.
  var server = '/janus';

  console.log('creating LavatoryViews');

  var stopLavatory = function(){

    // clear up Janus
    if (janus){
      clearInterval(bitrateTimer);
      janus.destroy();
      janus = null;
      echotest = null;
      started = false;
      bitrateTimer = null;
      audioenabled = false;
      videoenabled = false;
    }

    // reset DOM
    $container.css('display','none');
    $startbtn
      .removeClass('pressed')
      .addClass('lifted')
      .html('start');
    $audiobtn.removeClass("lifted").addClass("pressed");
    $audiobtn.html("Enable audio");
    $videobtn.removeClass("lifted").addClass("pressed");
    $videobtn.html("Enable video");
  };

  function startLavatory(){
    if (started){
      stopLavatory();
    } else {
      $startbtn
        .removeClass('lifted')
        .addClass('pressed')
        .html('stop');
      startJanus();
      started = true;
    }
  }
  
  function startJanus(){
    // Initialize the library (console debug enabled)
    Janus.init({debug: true, callback: function() {
			// Make sure the browser supports WebRTC
			if(!Janus.isWebrtcSupported()) {
				return;
			}
			// Create session
			janus = new Janus(
				{
					server: server,
					// No "iceServers" is provided, meaning janus.js will use a default STUN server
					// Here are some examples of how an iceServers field may look like to support TURN
					// 		iceServers: [{url: "turn:yourturnserver.com:3478", username: "janususer", credential: "januspwd"}],
					// 		iceServers: [{url: "turn:yourturnserver.com:443?transport=tcp", username: "janususer", credential: "januspwd"}],
					// 		iceServers: [{url: "turns:yourturnserver.com:443?transport=tcp", username: "janususer", credential: "januspwd"}],
					success: function() {
						// Attach to echo test plugin
						janus.attach(
							{
								plugin: "janus.plugin.echotest",
								success: function(pluginHandle) {
									$('#details').remove();
                  $container.css('display','inline-block');
									echotest = pluginHandle;
									console.log("Plugin attached! (" + echotest.getPlugin() + ", id=" + echotest.getId() + ")");
									// Negotiate WebRTC
									var body = { "audio": true, "video": true };
									console.log("Sending message (" + JSON.stringify(body) + ")");
									echotest.send({"message": body});
									console.log("Trying a createOffer too (audio/video sendrecv)");
									echotest.createOffer({
											// No media provided: by default, it's sendrecv for audio and video
											media: { data: true },	// Let's negotiate data channels as well
											success: function(jsep) {
												console.log("Got SDP!");
												console.log(jsep);
												echotest.send({"message": body, "jsep": jsep});
											},
											error: function(error) {
												console.log("WebRTC error:");
												console.log(error);
											}
										});
								},
								error: function(error) {
									console.log("  -- Error attaching plugin... " + error);
								},
								consentDialog: function(on) {
								},
								onmessage: function(msg, jsep) {
									console.log(" ::: Got a message :::");
									console.log(JSON.stringify(msg));
									if(jsep !== undefined && jsep !== null) {
										console.log("Handling SDP as well...");
										console.log(jsep);
										echotest.handleRemoteJsep({jsep: jsep});
									}
									var result = msg.result;
									if(result !== null && result !== undefined) {
										if(result === "done") {
											// The plugin closed the echo test
											$('#lavatory-myvideo').remove();
											$('#lavatory-peervideo').remove();
											$('#lavatory-label-curbitrate').hide();
										}
									}
								},
								onlocalstream: function(stream) {
									console.log(" ::: Got a local stream :::");
									console.log(JSON.stringify(stream));
									if($('#lavatory-myvideo').length === 0) {
										$('#lavatory-video-local').append('<video class="rounded centered" id="lavatory-myvideo" width=320 height=240 autoplay muted="muted"/>');
									}
									attachMediaStream($('#lavatory-myvideo').get(0), stream);
									$("#lavatory-myvideo").get(0).muted = "muted";
								},
								onremotestream: function(stream) {
									console.log(" ::: Got a remote stream :::");
									console.log(JSON.stringify(stream));
									if($('#lavatory-peervideo').length === 0) {
										$('#lavatory-video-remote').append('<video class="rounded centered" id="lavatory-peervideo" width=320 height=240 autoplay/>');
										// Detect resolution
										$("#lavatory-peervideo").bind("loadedmetadata", function () {
											if(webrtcDetectedBrowser == "chrome") {
												var width = this.videoWidth;
												var height = this.videoHeight;
												$('#lavatory-label-resolution').text(width+' x '+height);
											} else {
												// Firefox has a bug: width and height are not immediately available after a loadedmetadata
												setTimeout(function() {
													var width = $("#lavatory-peervideo").get(0).videoWidth;
													var height = $("#lavatory-peervideo").get(0).videoHeight;
													$('#lavatory-label-resolution').text(width+' x '+height).show();
												}, 2000);
											}
										});
									}
									attachMediaStream($('#lavatory-peervideo').get(0), stream);
									// Enable audio/video buttons and bitrate limiter
									audioenabled = true;
									videoenabled = true;
									$('#lavatory-toggle-audio').click(
										function() {
											audioenabled = !audioenabled;
											if(audioenabled){
												$audiobtn.removeClass("lifted").addClass("pressed");
                        $audiobtn.html("Enable audio");
                      } else {
												$audiobtn.removeClass("pressed").addClass("lifted");
                        $audiobtn.html("Disable audio");
                      }
											echotest.send({"message": { "audio": audioenabled }});
										});
									$('#lavatory-toggle-video').click(
										function() {
											videoenabled = !videoenabled;
											if(videoenabled){
												$videobtn.removeClass("lifted").addClass("pressed");
                        $videobtn.html("Enable video");
                      } else {
												$videobtn.removeClass("pressed").addClass("lifted");
                        $videobtn.html("Disable video");
                      }
											echotest.send({"message": { "video": videoenabled }});
										});
									$('#lavatory-dropdown-bitrate a').click(function() {
										var id = $(this).attr("id");
										var bitrate = parseInt(id)*1000;
										if(bitrate === 0) {
											console.log("Not limiting bandwidth via REMB");
										} else {
											console.log("Capping bandwidth to " + bitrate + " via REMB");
										}
										echotest.send({"message": { "bitrate": bitrate }});
										return false;
									});
									if(webrtcDetectedBrowser == "chrome") {
										// Only Chrome supports the way we interrogate getStats for the bitrate right now
										$('#lavatory-label-curbitrate').removeClass('hide').show();
										bitrateTimer = setInterval(function() {
											// Display updated bitrate, if supported
											var bitrate = echotest.getBitrate();
											//~ console.log("Current bitrate is " + echotest.getBitrate());
											$('#lavatory-label-curbitrate').text(bitrate);
										}, 1000);
									}
								},
								ondataopen: function(data) {
									console.log("The DataChannel is available!");
								},
								ondata: function(data) {
									console.log("We got data from the DataChannel! " + data);
									$('#lavatory-input-datarecv').val(data);
								},
								oncleanup: function() {
									console.log(" ::: Got a cleanup notification :::");
									$('#lavatory-myvideo').remove();
									$('#lavatory-peervideo').remove();
									$('#lavatory-label-curbitrate').hide();
								}
							});
					},
					error: function(error) {
						console.log(error);
						alert(error, function() {
              startLavatory();
						});
					},
					destroyed: function() {
            startLavatory();
					}
				});
    }});
  }

  return {stop: stopLavatory, start: startLavatory};
}

function checkEnter(event) {
	var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
	if(theCode == 13) {
		sendData();
		return false;
	} else {
		return true;
	}
}

function sendData() {
	var data = $('#lavatory-input-datasend').val();
	if(data === "") {
		alert('Insert a message to send on the DataChannel');
		return;
	}
	echotest.data({
		text: data,
		error: function(reason) { alert(reason); },
		success: function() { $('#lavatory-input-datasend').val(''); },
	});
}
