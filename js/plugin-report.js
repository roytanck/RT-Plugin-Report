jQuery(document).ready( function( $ ){

	var rtpr_slugs = plugin_report_vars.plugin_slugs;
	var rtpr_slugs_array = rtpr_slugs.split(',');
	var rtpr_nrof_plugins = rtpr_slugs_array.length;
	var rtpr_progress = 0;


	function rtpr_process_next_plugin(){
		if( rtpr_slugs_array.length > 0 ){
			var slug = rtpr_slugs_array.shift();
			if( $( '.plugin-report-row-temp-' + slug ).length ){
				rtpr_get_plugin_info( slug );
			} else {
				rtpr_process_next_plugin();
			}
		}
		// update the progress information on the page
		var perc = Math.ceil( ( rtpr_progress / rtpr_nrof_plugins ) * 100 );
		if( perc < 100 ){
			if( ! $( '#plugin-report-progress' ).find( 'progress' ).length ){
				$( '#plugin-report-progress' ).html( '<progress max="100" value="0"></progress>' );
			}
			$( '#plugin-report-progress progress' ).prop( 'value', perc );
			rtpr_progress++;
		} else {
			// Remove the progress bar.
			$('#plugin-report-progress').html( '' );
			// initialize sorting on table
			new Tablesort(document.getElementById('plugin-report-table'));
			// Create the export button.
			$('#plugin-report-buttons').append('<button class="button" href="#" id="plugin-report-export-btn">' + plugin_report_vars.export_btn + '</button>');
			// Export button event handler.
			$('#plugin-report-export-btn').click( function( e ){
				// Call the function that does the exporting.
				rtpr_export_table();
			});
		}
	}


	function rtpr_get_plugin_info( slug ){
		var data = {
			'action': 'rt_get_plugin_info',
			'slug': slug,
			'nonce': plugin_report_vars.ajax_nonce
		};

		jQuery.post( ajaxurl, data, function(response) {
			// parse the response
			obj = jQuery.parseJSON(response);
			// replace the temporary table row with the new data
			$('#plugin-report-table .plugin-report-row-temp-' + slug ).replaceWith( obj.html );
			// on to the next...
			rtpr_process_next_plugin();
		});
	}

	// kick things off
	rtpr_process_next_plugin();


	// Export CSV file.
	function rtpr_export_table(){
		var csv_data = '';
		var counter = 0;
		// Loop trough the table header to add the header cells.
		$('#plugin-report-table thead tr').each(function(){
			// Use a column counter, because we'll need ot insert two extra columns.
			counter = 0;
			// Loop through the header cells.
			$(this).find('th').each(function(){
				// Remove any comma's from the cell contents, then add to output.
				csv_data += $(this).text().replace(/,/g, ".") + ',';
				// If this is the first column, add the plugin url column
				if( counter == 0 ){
					csv_data += plugin_report_vars.plugin_url_header + ',';
				}
				// If this is the second column, add the author url column
				if( counter == 1 ){
					csv_data += plugin_report_vars.author_url_header + ',';
				}
				counter++;
			});
			// End of the line.
			csv_data += "\n";
		});
		// Loop through the regular rows to get their data
		$('#plugin-report-table tbody tr').each(function(){
			// Use a column counter to insert the two columns.
			counter = 0;
			// Loop through all regular cells.
			$(this).find('td').each(function(){
				// Remove any comma's from the cell contents, then add to output.
				csv_data += $(this).text().replace(/,/g, ".") + ',';
				// If this is one of the first two columns, add a url column.
				if( counter <2 ){
					var href = '';
					$(this).find('a').each(function(){
						// Get the href attribute, but strip any url vars to keep it short.
						href = $(this).attr('href').split('#')[0].split('?')[0];
					});
					// Add to the output.
					csv_data += href + ',';
				}
				counter++;
			});
			// End of the line.
			csv_data += "\n";
		});
		// Create a link element, clickit and remove it.
		var link = document.createElement( 'a' );
		var now = new Date();
		link.download = 'plugin-report-' + now.getFullYear() + '-' + String( '0' + (now.getMonth()+1) ).slice(-2) + '-' + String( '0' + now.getDate() ).slice(-2) + '.csv';
		link.href = URL.createObjectURL( new Blob( [ "\ufeff", csv_data ], {type: 'text/csv; header=present'} ) );
		link.click();
		link.remove();
	}

});
