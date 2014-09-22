// We make use of this 'server' variable to provide the address of the
// REST Janus API. By default, in this example we assume that Janus is
// co-located with the web server hosting the HTML pages but listening
// on a different port (8088, the default for HTTP in Janus), which is
// why we make use of the 'window.location.hostname' base address. Since
// Janus can also do HTTPS, and considering we don't really want to make
// use of HTTP for Janus if your demos are served on HTTPS, we also rely
// on the 'window.location.protocol' prefix to build the variable, in
// particular to also change the port used to contact Janus (8088 for
// HTTP and 8089 for HTTPS, if enabled).
// In case you place Janus behind an Apache frontend (as we did on the
// online demos at http://janus.conf.meetecho.com) you can just use a
// relative path for the variable, e.g.:
//
// 		var server = "/janus";
//
// which will take care of this on its own.
//
//
// If you want to use the WebSockets frontend to Janus, instead, you'll
// have to pass a different kind of address, e.g.:
//
// 		var server = "ws://" + window.location.hostname + ":8188";
//
// Of course this assumes that support for WebSockets has been built in
// when compiling the gateway. WebSockets support has not been tested
// as much as the REST API, so handle with care!
//
//
// If you have multiple options available, and want to let the library
// autodetect the best way to contact your gateway (or pool of gateways),
// you can also pass an array of servers, e.g., to provide alternative
// means of access (e.g., try WebSockets first and, if that fails, fall
// back to plain HTTP) or just have failover servers:
//
//		var server = [
//			"ws://" + window.location.hostname + ":8188",
//			"/janus"
//		];
//
// This will tell the library to try connecting to each of the servers
// in the presented order. The first working server will be used for
// the whole session.
//


// NICK - need to proxy the linode nginx to bovav.com
//
var server = null;
if(window.location.protocol === 'http:')
	server = "http://" + window.location.hostname + ":8088/janus";
else
	server = "https://" + window.location.hostname + ":8089/janus";

var janus = null;
var echotest = null;
var started = false;
var bitrateTimer = null;

var audioenabled = false;
var videoenabled = false;

$(document).ready(function() {
	// Initialize the library (console debug enabled)
	Janus.init({debug: true, callback: function() {
		// Use a button to start the demo
		$('#lavatory-engage').click(function() {
			if(started)
				return;
			started = true;
			$(this).attr('disabled', true).unbind('click');
			// Make sure the browser supports WebRTC
			if(!Janus.isWebrtcSupported()) {
				bootbox.alert("No WebRTC support... ");
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
									echotest = pluginHandle;
									console.log("Plugin attached! (" + echotest.getPlugin() + ", id=" + echotest.getId() + ")");
									// Negotiate WebRTC
									var body = { "audio": true, "video": true };
									console.log("Sending message (" + JSON.stringify(body) + ")");
									echotest.send({"message": body});
									console.log("Trying a createOffer too (audio/video sendrecv)");
									echotest.createOffer(
										{
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
												bootbox.alert("WebRTC error... " + JSON.stringify(error));
											}
										});
									$('#lavatory-engage').removeAttr('disabled').html("stop")
										.click(function() {
											$(this).attr('disabled', true);
											clearInterval(bitrateTimer);
											janus.destroy();
										});
								},
								error: function(error) {
									console.log("  -- Error attaching plugin... " + error);
									bootbox.alert("Error attaching plugin... " + error);
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
									var result = msg["result"];
									if(result !== null && result !== undefined) {
										if(result === "done") {
											// The plugin closed the echo test
											bootbox.alert("The Echo Test is over");
											$('#lavatory-myvideo').remove();
											$('#lavatory-peervideo').remove();
											$('#lavatory-toggle-audio').attr('disabled', true);
											$('#lavatory-toggle-video').attr('disabled', true);
											$('#lavatory-dropdown-bitrate').attr('disabled', true);
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
											if(audioenabled)
												$('#lavatory-toggle-audio').html("Disable audio");
											else
												$('#lavatory-toggle-audio').html("Enable audio");
											echotest.send({"message": { "audio": audioenabled }});
										});
									$('#lavatory-toggle-video').click(
										function() {
											videoenabled = !videoenabled;
											if(videoenabled)
												$('#lavatory-toggle-video').html("Disable video");
											else
												$('#lavatory-toggle-video').html("Enable video");
											echotest.send({"message": { "video": videoenabled }});
										});
									$('#lavatory-toggle-audio').parent().removeClass('hide').show();
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
									$('#lavatory-input-datasend').removeAttr('disabled');
								},
								ondata: function(data) {
									console.log("We got data from the DataChannel! " + data);
									$('#lavatory-input-datarecv').val(data);
								},
								oncleanup: function() {
									console.log(" ::: Got a cleanup notification :::");
									$('#lavatory-myvideo').remove();
									$('#lavatory-peervideo').remove();
									$('#lavatory-toggle-audio').attr('disabled', true);
									$('#lavatory-toggle-video').attr('disabled', true);
									$('#lavatory-dropdown-bitrate').attr('disabled', true);
									$('#lavatory-label-curbitrate').hide();
									$('#lavatory-input-datasend').attr('disabled', true);
								}
							});
					},
					error: function(error) {
						console.log(error);
						bootbox.alert(error, function() {
							window.location.reload();
						});
					},
					destroyed: function() {
						window.location.reload();
					}
				});
		});
	}});
});

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
		error: function(reason) { bootbox.alert(reason); },
		success: function() { $('#lavatory-input-datasend').val(''); },
	});
}
