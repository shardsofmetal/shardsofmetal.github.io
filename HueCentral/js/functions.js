// Hue Bridge API username
var apiName = "HueCentral";

/* Callback function upon successful bridge address lookup */
function foundBridgeAddress(ipaddr) {
	// Update page
	$("#index").html("Found bridge!<br>IP address: "+ipaddr+"<br>Connecting to bridge...");
	// Set bridge address in local storage
	localStorage.address = "http://"+ipaddr;
	// Check if link button needs to be pressed
	$.getJSON(localStorage.address+"/api/"+apiName)
		.done(function(data){
			if(data[0].error.type == 1) {
				pressLinkButton();
			}
			// API name is registered...
		})
		.fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
			$("#index").text("An error occurred while attempting to communicate with the bridge.");
		});
}

/* Register API name */
function registerApiName() {
	$("#index").text("Attempting to register with the bridge...")
	var data = JSON.stringify({
		devicetype: "HueCentral Web App",
		username: "HueCentral"
	});
	$.ajax({
		url: localStorage.address+"/api/",
		data: data,
		dataType: 'json',
		method: 'POST'
	}).done(function(responseData){
		console.log(responseData);
		if(responseData[0].error.type == 101) {
			pressLinkButton();
		} else {
			// API name is successfully registered. Load index...
			localStorage.registered = "true";
		}
	}).fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
		$("#index").text("An error occurred while attempting to communicate with the bridge.");
	});
}
		

/* Callback to press link button */
function pressLinkButton() {
	$("#index").html("Press the button on the bridge to continue...<br><button id='pressLink' class='ui-btn'>Continue</button>");
	$("#pressLink").click(registerApiName);
}

$(document).ready(function(){
	// Setup external toolbars and panels
	$( "[data-role='navbar']" ).navbar();
	$( "[data-role='header'], [data-role='footer']" ).toolbar();
	$( "[data-role='panel']" ).panel().enhanceWithin();
	
	// Update the contents of the toolbars
	$( document ).on( "pagecontainerchange", function() {
		// Each of the four pages in this demo has a data-title attribute
		// which value is equal to the text of the nav button
		// For example, on first page: <div data-role="page" data-title="Info">
		var currentNav = $( ".ui-page-active" ).jqmData( "nav" );
		var currentTitle = $( ".ui-page-active" ).jqmData( "title" );
		// Change the heading
		$( "[data-role='header'] h1" ).text( currentTitle );
		// Remove active class from nav buttons
		$( "[data-role='navbar'] a.ui-btn-active" ).removeClass( "ui-btn-active" );
		// Add active class to current nav button
		$( "[data-role='navbar'] a" ).each(function() {
			if ( $( this ).text() === currentNav ) {
				$( this ).addClass( "ui-btn-active" );
			}
		});
	});


	//localStorage.removeItem("address");
	/*if(typeof(localStorage.address) === 'undefined') {
		$("#index").html(
			"To use this app, you must find the bridge address." +
			"<button id='getAddress' class='ui-btn'>Find Bridge Address</button>"
		);
	} else if(typeof(localStorage.registered) === 'undefined') {
		registerApiName();
	} else {
		// App is successfully connected to bridge.
	}*/
	//$(":mobile-pagecontainer").pagecontainer("change", "#setup");
	$("#getAddress").click(function(){
		$("#index").text("Finding bridge address...");
		$.ajax({
			url: "https://www.meethue.com/api/nupnp?callback=?",
			crossDomain: true,
			cache: true
			})
			.done(function(data){
				if(typeof(data[0].internalipaddress) !== "undefined") {
					foundBridgeAddress(data[0].internalipaddress);
				} else {
					$("#index").text("Cannot find bridge IP address from the Meet Hue website. You will need to enter it manually.");
				}
			})
			.fail(function( jqxhr, textStatus, error ) {
				var err = textStatus + ", " + error;
				console.log( "Request Failed: " + err );
				$("#index").text("There was error trying to find the address of your bridge. You will need to enter it manually.");
			});
	});
});