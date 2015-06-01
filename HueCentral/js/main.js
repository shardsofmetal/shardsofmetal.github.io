/**
 * HueCentral
 *
 * main.js
 * 
 * Provides all javascript functionality for HueCentral, except for external 
 * libraries such as JQuery and JQuery Mobile. This file provides all 
 * functionality of the web app except for the HTML5 markup.
 *
 * @author    Zach Dennison
 * @copyright 2014 Zach Dennison
 * @license   https://www.gnu.org/licenses/gpl-2.0.txt GPL-2.0+
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* Determine if app has been setup */
if (typeof(localStorage.appSetup) === "undefined" || localStorage.appSetup != "true") {
	localStorage.appSetup = "false";
}

$(document).ready(function(){
	/* Setup external toolbars and panels */
	$("[data-role='navbar']").navbar();
	$("[data-role='header'], [data-role='footer']").toolbar();
	$("[data-role='panel']").panel().enhanceWithin();
	
	/* Update the contents of the toolbars when changing pages */
	$(document).on("pagecontainerchange", function() {
		// Get 'data-nav' and 'data-title' attributes
		var currentNav = $(".ui-page-active").jqmData("nav");
		var currentTitle = $(".ui-page-active").jqmData("title");
		// Change the heading
		$("[data-role='header'] h1").text(currentTitle);
		// Remove active class from nav buttons
		$("[data-role='navbar'] a.ui-btn-active").removeClass("ui-btn-active");
		// Add active class to current nav button
		$("[data-role='navbar'] a").each(function() {
			if ($(this).text() === currentNav ) {
				$(this).addClass("ui-btn-active");
			}
		});
	});
	
	/* Perform initial setup */
	if (localStorage.appSetup != "true") {
		/* Initial setup functions */
		
		// Register HueCentral with the bridge
		function registerWithBridge() {
			var data = JSON.stringify({
				devicetype: localStorage.apiDeviceType,
				username: localStorage.apiName
			});
			$.ajax({
				url: localStorage.address+"/api/",
				data: data,
				dataType: 'json',
				method: 'POST'
			}).done(function(responseData){
				if(typeof(responseData[0].error) !== "undefined" && responseData[0].error.type == 101) {
					// Bridge link button not pressed. Wait 2 seconds, then try again.
					setTimeout(registerWithBridge, 2000);
				} else if (typeof(responseData[0].success) !== "undefined") {
					// Api name is registered. HueCentral is ready to use
					localStorage.appSetup = "true";
					$("#initial-setup-bridge-link p").text(
						"Setup complete! Press the button below to " +
						"using HueCentral."
					);
					$("#initial-setup-complete").show();
				} else {
					$("#initial-setup-bridge-link p").text(
						"An unknown error occurred while attempting to " +
						"register HueCentral with the bridge."
					);
					console.log(responseData);
				}
			}).fail(function( jqxhr, textStatus, error ) {
				var err = textStatus + ", " + error;
				console.log( "Request Failed: " + err );
				$("#initial-setup-bridge-link p").text(
					"An error occurred while attempting to communicate with the bridge."
				);
			});
		}
		
		// Automatically fetch bridge IP address from Hue portal
		function getAddressFromPortal() {
			$.ajax({
				url: "https://www.meethue.com/api/nupnp?callback=?",
				crossDomain: true,
				cache: true
			}).done(function(data){
				if(typeof(data[0].internalipaddress) !== "undefined") {
					localStorage.address = "http://" + data[0].internalipaddress;
					$("#initial-setup-ip-address-result p").text("Found bridge!");
					$("#initial-setup-ip-address-result").hide();
					$("#initial-setup-bridge-link").show();
					registerWithBridge();
				} else {
					$("#initial-setup-ip-address-result p").text(
						"HueCentral could not find your bridge. You will " +
						"have to enter the address manually."
					);
				}
			}).fail(function( jqxhr, textStatus, error ) {
				var err = textStatus + ", " + error;
				console.log( "Request Failed: " + err );
				$("#initial-setup-ip-address-result p").text(
					"HueCentral could not find your bridge. You will " +
					"have to enter the address manually."
				);
			});
		}
		
		// Redirect to #initial-setup
		$(":mobile-pagecontainer").pagecontainer("change", "#initial-setup");
		$("#navbar").hide();
		$("#initial-setup-api-name").show();
		$("#api-name-button").click(function() {
			var devName = $("#api-name").val();
			localStorage.apiDeviceType = "HueCentral#" + devName;
			localStorage.apiName = "HueCentral-" + devName.replace(/\s+/g, '_');
			$("#initial-setup-api-name").hide();
			$("#initial-setup-ip-address").show();
		});
		$("#ip-address-button").click(function(){
			$("#initial-setup-ip-address").hide();
			$("#initial-setup-ip-address-result").show();
			getAddressFromPortal();
		});
		$("#initial-setup-complete").click(function() {
			$("#navbar").show();
			$(":mobile-pagecontainer").pagecontainer("change", "#home");
		});
	}
});