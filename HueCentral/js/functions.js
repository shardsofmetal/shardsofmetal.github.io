$(document).ready(function(){
	/* Setup external toolbars and panels */
	$( "[data-role='navbar']" ).navbar();
	$( "[data-role='header'], [data-role='footer']" ).toolbar();
	$( "[data-role='panel']" ).panel().enhanceWithin();
	
	/* Update the contents of the toolbars when changing pages */
	$( document ).on( "pagecontainerchange", function() {
		// Get 'data-nav' and 'data-title' attributes
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
});