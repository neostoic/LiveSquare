define([
	'firebase', 
	'jquery', 
	'underscore', 
	'backbone', 
	'backbonefirebase',
	'views/venue/map',
 	'views/venue/list',
 	'collections/nyc',
 	'collections/sanfran',
 	'collections/chicago'
], function(Firebase, $, _, Backbone, BackboneFirebase, venueMapView, venueListView, nycCollection, sanfranCollection, chicagoCollection) {
	
	var Router = Backbone.Router.extend({
	        routes: {
			  'about': 'about',
			  'chicago': 'chicago',
			  'sanfrancisco': 'sanfran',
			  '*actions': 'defaultAction'
			},
	
		about: function(){
			$('ul.nav > li').removeClass('active');
			$('#about').addClass('active');
			$('#myModal').modal('show');
		},
	
	    defaultAction: function(actions){
				
		$('#loadingModal').modal('show');
		$('ul.nav > li').removeClass('active');
		$('#nyc').addClass('active');
		
		// Clear the collection and view
		nycCollection.reset();
		//venueMapView.remove();
		//venueListView.remove();
		$('#list').empty();
		$('#mapCanvas').empty();
		
		// Scroll the venue list up and down.
		$('#upList').mouseover(function() {
			$(this).removeClass("fade");
			$('#list').scrollTo('0%', {duration: 3000});
		}).mouseout(function() {
			$(this).addClass("fade");
		});
		$('#downList').mouseover(function() {
			$(this).removeClass("fade");
			$('#list').scrollTo('100%', {duration: 3000});
		}).mouseout(function() {
			$(this).addClass("fade");
		});

		// Create an array of markers to place on the map
		var markersArray = [];

		// Render Map on Canvas
		venueMapView.render(40.741925, -73.985023);

		// Fetch Venues

			// Fetch the initial data from Firebase
			nycCollection.fetch({ success: function (response) {
				console.log("Fetching Venues!");

				// Update comparator function
				nycCollection.comparator = function(venue) {
				    return -venue.attributes.hereNow.count;
				}

				// Sort the venues
				nycCollection.sort();

			  // Create an array of markers to place on the map
			  var markersArray = [];
			  var v = 0;

			  // Create a view for each model and append it to the list.
			  nycCollection.each(function(venue) {
				console.log("Grabbing Venue: " + venue.attributes.name);
				console.log("Venue Lat/Lng are: " + venue.attributes.location.lat + ", " + venue.attributes.location.lng);

				var title = venue.attributes.name + ', ' + venue.attributes.hereNow.count + ' people here!';

				if (venue.attributes.categories === undefined) {
					var iconFixed = "https://foursquare.com/img/categories/nightlife/default.png";
				} else {
					var iconLocation = venue.attributes.categories[0].icon.prefix;
					var icon = iconLocation.substring(0, iconLocation.length - 1);
					var iconFixed = icon + venue.attributes.categories[0].icon.name;
				}

				console.log("Icon Path: " + iconFixed);
				console.log("Map Marker Title: " + title);
				var lat = parseFloat(venue.attributes.location.lat);
				var lng = parseFloat(venue.attributes.location.lng);
				var latlng = new google.maps.LatLng(lat, lng);

				// Add map markers to map canvas as the venues are rendered
				var marker = new google.maps.Marker({
					map: venueMapView.map,
					position: latlng,
					animation: google.maps.Animation.DROP,
					title: title,
					icon: iconFixed
				});

				// Store markers in an array for future reference
				markersArray.push(marker);

				// Add highlight and scroll to when mouse over of map icon
				google.maps.event.addListener(marker, "mouseover", function() {
				     $('#' + venue.attributes.id).addClass("highlight");
					 $('#list').scrollTo('#' + venue.attributes.id, {duration: 1000});
				});

				// Remove highlight when mouseout of map icon
				google.maps.event.addListener(marker, "mouseout", function() {
				     $('#' + venue.attributes.id).removeClass("highlight");
				});

				// Open venue details on click
				google.maps.event.addListener(marker, "click", function() {
					 window.open('https://foursquare.com/v/' + venue.attributes.id);
				});

			    // Only create the view if the model doesn't already have one.
			    if (!venue.venueListView) {
					console.log("Creating View for: " + venue.attributes.name);	
					var template = venueListView.render(venue);
					$("#list").append( template );
			    }

				// Add venue number and icon to list div
				$('#' + venue.attributes.id).attr('alt', v);
				if (venue.attributes.categories === undefined) {
					var iconFixed = "https://foursquare.com/img/categories/nightlife/default.png";
					$('#' + venue.attributes.id).attr('icon', iconFixed);
				} else {
					var iconLocation = venue.attributes.categories[0].icon.prefix;
					var icon = iconLocation.substring(0, iconLocation.length - 1);
					var iconFixed = icon + venue.attributes.categories[0].icon.name;
					$('#' + venue.attributes.id).attr('icon', iconFixed);
				}

				console.log(v);
				v++;
				console.log(venue);

			  });

			// Make map icon change when a venue is highlighted
			$('.liSelect').mouseover(function() {
				$(this).addClass("highlight");
				var itemDiv = $(this).attr('alt');
				markersArray[itemDiv].setIcon(null);
			}).mouseout(function() {
				$(this).removeClass("highlight");
				var itemDiv = $(this).attr('alt');
				var iconDiv = $(this).attr('icon');
				markersArray[itemDiv].setIcon(iconDiv);
			});

			// If a model changes in the colelction update the views
			nycCollection.bind("change", function(venue){
				if (!venue.venueListView) {
			  		console.log('Changing Venue: ' + venue.attributes.name);

					var itemDiv = $("#" + venue.attributes.id + "").attr('alt');
			        markersArray[itemDiv].setAnimation(google.maps.Animation.BOUNCE);
			        setTimeout(function(){ markersArray[itemDiv].setAnimation(null); }, 5000);

					var template = venueListView.render(venue);
					$("#" + venue.attributes.id + "").html( template ); 
					$("#" + venue.attributes.id + "").effect("highlight", {}, 3000);
				}
			});

			// Method of adding venues

			// If a model is added to the list remotely create a view for it
			nycCollection.bind('add', function(venue) {
				if (!venue.venueListView) {
					console.log("Remotely Adding Venue: " + venue.attributes.name);
					var template = venueListView.render(venue);
					var title = venue.attributes.name + ', ' + venue.attributes.hereNow.count + ' people here!';
					if (venue.attributes.categories === undefined) {
						var iconFixed = "https://foursquare.com/img/categories/nightlife/default.png";
					} else {
						var iconLocation = venue.attributes.categories[0].icon.prefix;
						var icon = iconLocation.substring(0, iconLocation.length - 1);
						var iconFixed = icon + venue.attributes.categories[0].icon.name;
					}
					console.log("Icon Path: " + iconFixed);
					console.log("Map Marker Title: " + title);
					var lat = parseFloat(venue.attributes.location.lat);
					var lng = parseFloat(venue.attributes.location.lng);
					var latlng = new google.maps.LatLng(lat, lng);

					// Add map markers to map canvas as the venues are rendered
					var marker = new google.maps.Marker({
						map: venueMapView.map,
						position: latlng,
						animation: google.maps.Animation.DROP,
						title: title,
						icon: iconFixed
					});
					
					$("#list").append(template);
					$("#" + venue.attributes.id + "").effect("highlight", {color: "green"}, 3000);
				}
			});

			// If a model is removed from the list remotely remove the view
			nycCollection.bind('remove', function(venue) {
					var itemDiv = $("#" + venue.attributes.id + "").attr('alt');
			        markersArray[itemDiv].setMap(null);
					console.log("Removing Venue: " + venue.attributes.name);
					$("#" + venue.attributes.id + "").effect("highlight", {color: "red"}, 3000).remove();
			});

			$('#loadingModal').modal('hide');

			}});

		// End Fetch
				
		},
		
		chicago: function() {
			
		$('#loadingModal').modal('show');
		$('ul.nav > li').removeClass('active');
		$('#chicago').addClass('active');
			
		// Clear the collection
		chicagoCollection.reset();
		$('#list').empty();

		// Scroll the venue list up and down.
		$('#upList').mouseover(function() {
			$(this).removeClass("fade");
			$('#list').scrollTo('0%', {duration: 3000});
		}).mouseout(function() {
			$(this).addClass("fade");
		});
		$('#downList').mouseover(function() {
			$(this).removeClass("fade");
			$('#list').scrollTo('100%', {duration: 3000});
		}).mouseout(function() {
			$(this).addClass("fade");
		});

		// Create an array of markers to place on the map
		var markersArray = [];

		// Render Map on Canvas
		venueMapView.render(41.903938, -87.650814);

		// Fetch Venues

			// Fetch the initial data from Firebase
			chicagoCollection.fetch({ success: function (response) {
				console.log("Fetching Venues!");

				// Update comparator function
				chicagoCollection.comparator = function(venue) {
				    return -venue.attributes.hereNow.count;
				}

				// Sort the venues
				chicagoCollection.sort();

			  // Create an array of markers to place on the map
			  var markersArray = [];
			  var v = 0;

			  // Create a view for each model and append it to the list.
			  chicagoCollection.each(function(venue) {
				console.log("Grabbing Venue: " + venue.attributes.name);
				console.log("Venue Lat/Lng are: " + venue.attributes.location.lat + ", " + venue.attributes.location.lng);

				var title = venue.attributes.name + ', ' + venue.attributes.hereNow.count + ' people here!';

				if (venue.attributes.categories === undefined) {
					var iconFixed = "https://foursquare.com/img/categories/nightlife/default.png";
				} else {
					var iconLocation = venue.attributes.categories[0].icon.prefix;
					var icon = iconLocation.substring(0, iconLocation.length - 1);
					var iconFixed = icon + venue.attributes.categories[0].icon.name;
				}

				console.log("Icon Path: " + iconFixed);
				console.log("Map Marker Title: " + title);
				var lat = parseFloat(venue.attributes.location.lat);
				var lng = parseFloat(venue.attributes.location.lng);
				var latlng = new google.maps.LatLng(lat, lng);

				// Add map markers to map canvas as the venues are rendered
				var marker = new google.maps.Marker({
					map: venueMapView.map,
					position: latlng,
					animation: google.maps.Animation.DROP,
					title: title,
					icon: iconFixed
				});

				// Store markers in an array for future reference
				markersArray.push(marker);

				// Add highlight and scroll to when mouse over of map icon
				google.maps.event.addListener(marker, "mouseover", function() {
				     $('#' + venue.attributes.id).addClass("highlight");
					 $('#list').scrollTo('#' + venue.attributes.id, {duration: 1000});
				});

				// Remove highlight when mouseout of map icon
				google.maps.event.addListener(marker, "mouseout", function() {
				     $('#' + venue.attributes.id).removeClass("highlight");
				});

				// Open venue details on click
				google.maps.event.addListener(marker, "click", function() {
					 window.open('https://foursquare.com/v/' + venue.attributes.id);
				});

			    // Only create the view if the model doesn't already have one.
			    if (!venue.venueListView) {
					console.log("Creating View for: " + venue.attributes.name);	
					var template = venueListView.render(venue);
					$("#list").append( template );
			    }

				// Add venue number and icon to list div
				$('#' + venue.attributes.id).attr('alt', v);
				if (venue.attributes.categories === undefined) {
					var iconFixed = "https://foursquare.com/img/categories/nightlife/default.png";
					$('#' + venue.attributes.id).attr('icon', iconFixed);
				} else {
					var iconLocation = venue.attributes.categories[0].icon.prefix;
					var icon = iconLocation.substring(0, iconLocation.length - 1);
					var iconFixed = icon + venue.attributes.categories[0].icon.name;
					$('#' + venue.attributes.id).attr('icon', iconFixed);
				}

				console.log(v);
				v++;
				console.log(venue);

			  });

			// Make map icon bounce when a venue is highlighted
			$('.liSelect').mouseover(function() {
				$(this).addClass("highlight");
				var itemDiv = $(this).attr('alt');
				markersArray[itemDiv].setIcon(null);
			}).mouseout(function() {
				$(this).removeClass("highlight");
				var itemDiv = $(this).attr('alt');
				var iconDiv = $(this).attr('icon');
				markersArray[itemDiv].setIcon(iconDiv);
			});

			// If a model changes in the colelction update the views
			chicagoCollection.bind("change", function(venue){
				if (!venue.venueListView) {
			  		console.log('Changing Venue: ' + venue.attributes.name);

					var itemDiv = $("#" + venue.attributes.id + "").attr('alt');
			        markersArray[itemDiv].setAnimation(google.maps.Animation.BOUNCE);
			        setTimeout(function(){ markersArray[itemDiv].setAnimation(null); }, 5000);

					var template = venueListView.render(venue);
					$("#" + venue.attributes.id + "").html( template ); 
					$("#" + venue.attributes.id + "").effect("highlight", {}, 3000);
				}
			});

			// Method of adding venues

//			// If a model is added to the list remotely create a view for it
//			chicagoCollection.bind('add', function(venue) {
//				if (!venue.venueListView) {
//					console.log("Remotely Adding Venue: " + venue.attributes.name);
//					var template = venueListView.render(venue);
//					var title = venue.attributes.name + ', ' + venue.attributes.hereNow.count + ' people here!';
//					if (venue.attributes.categories === undefined) {
//						var iconFixed = "https://foursquare.com/img/categories/nightlife/default.png";
//					} else {
//						var iconLocation = venue.attributes.categories[0].icon.prefix;
//						var icon = iconLocation.substring(0, iconLocation.length - 1);
//						var iconFixed = icon + venue.attributes.categories[0].icon.name;
//					}
//					console.log("Icon Path: " + iconFixed);
//					console.log("Map Marker Title: " + title);
//					var lat = parseFloat(venue.attributes.location.lat);
//					var lng = parseFloat(venue.attributes.location.lng);
//					var latlng = new google.maps.LatLng(lat, lng);
//
//					// Add map markers to map canvas as the venues are rendered
//					var marker = new google.maps.Marker({
//						map: venueMapView.map,
//						position: latlng,
//						animation: google.maps.Animation.DROP,
//						title: title,
//						icon: iconFixed
//					});
//					
//					$("#list").append(template);
//					$("#" + venue.attributes.id + "").effect("highlight", {color: "green"}, 3000);
//				}
//			});

			// If a model is removed from the list remotely remove the view
			chicagoCollection.bind('remove', function(venue) {
					var itemDiv = $("#" + venue.attributes.id + "").attr('alt');
			        markersArray[itemDiv].setMap(null);
					console.log("Removing Venue: " + venue.attributes.name);
					$("#" + venue.attributes.id + "").effect("highlight", {color: "red"}, 3000).remove();
			});

			$('#loadingModal').modal('hide');

			}});

		// End Fetch
						
		},
		
		sanfran: function() {
			
			$('#loadingModal').modal('show');
			$('ul.nav > li').removeClass('active');
			$('#sanFran').addClass('active');
			
			// Clear the collection
			sanfranCollection.reset();
			$('#list').empty();

			// Scroll the venue list up and down.
			$('#upList').mouseover(function() {
				$(this).removeClass("fade");
				$('#list').scrollTo('0%', {duration: 3000});
			}).mouseout(function() {
				$(this).addClass("fade");
			});
			$('#downList').mouseover(function() {
				$(this).removeClass("fade");
				$('#list').scrollTo('100%', {duration: 3000});
			}).mouseout(function() {
				$(this).addClass("fade");
			});

			// Create an array of markers to place on the map
			var markersArray = [];

			// Render Map on Canvas
			venueMapView.render(37.774921, -122.427692);

			// Fetch Venues

				// Fetch the initial data from Firebase
				sanfranCollection.fetch({ success: function (response) {
					console.log("Fetching Venues!");

					// Update comparator function
					sanfranCollection.comparator = function(venue) {
					    return -venue.attributes.hereNow.count;
					}

					// Sort the venues
					sanfranCollection.sort();

				  // Create an array of markers to place on the map
				  var markersArray = [];
				  var v = 0;

				  // Create a view for each model and append it to the list.
				  sanfranCollection.each(function(venue) {
					console.log("Grabbing Venue: " + venue.attributes.name);
					console.log("Venue Lat/Lng are: " + venue.attributes.location.lat + ", " + venue.attributes.location.lng);

					var title = venue.attributes.name + ', ' + venue.attributes.hereNow.count + ' people here!';

					if (venue.attributes.categories === undefined) {
						var iconFixed = "https://foursquare.com/img/categories/nightlife/default.png";
					} else {
						var iconLocation = venue.attributes.categories[0].icon.prefix;
						var icon = iconLocation.substring(0, iconLocation.length - 1);
						var iconFixed = icon + venue.attributes.categories[0].icon.name;
					}

					console.log("Icon Path: " + iconFixed);
					console.log("Map Marker Title: " + title);
					var lat = parseFloat(venue.attributes.location.lat);
					var lng = parseFloat(venue.attributes.location.lng);
					var latlng = new google.maps.LatLng(lat, lng);

					// Add map markers to map canvas as the venues are rendered
					var marker = new google.maps.Marker({
						map: venueMapView.map,
						position: latlng,
						animation: google.maps.Animation.DROP,
						title: title,
						icon: iconFixed
					});

					// Store markers in an array for future reference
					markersArray.push(marker);

					// Add highlight and scroll to when mouse over of map icon
					google.maps.event.addListener(marker, "mouseover", function() {
					     $('#' + venue.attributes.id).addClass("highlight");
						 $('#list').scrollTo('#' + venue.attributes.id, {duration: 1000});
					});

					// Remove highlight when mouseout of map icon
					google.maps.event.addListener(marker, "mouseout", function() {
					     $('#' + venue.attributes.id).removeClass("highlight");
					});

					// Open venue details on click
					google.maps.event.addListener(marker, "click", function() {
						 window.open('https://foursquare.com/v/' + venue.attributes.id);
					});

				    // Only create the view if the model doesn't already have one.
				    if (!venue.venueListView) {
						console.log("Creating View for: " + venue.attributes.name);	
						var template = venueListView.render(venue);
						$("#list").append( template );
				    }

					// Add venue number and icon to list div
					$('#' + venue.attributes.id).attr('alt', v);
					if (venue.attributes.categories === undefined) {
						var iconFixed = "https://foursquare.com/img/categories/nightlife/default.png";
						$('#' + venue.attributes.id).attr('icon', iconFixed);
					} else {
						var iconLocation = venue.attributes.categories[0].icon.prefix;
						var icon = iconLocation.substring(0, iconLocation.length - 1);
						var iconFixed = icon + venue.attributes.categories[0].icon.name;
						$('#' + venue.attributes.id).attr('icon', iconFixed);
					}

					console.log(v);
					v++;
					console.log(venue);

				  });

				// Make map icon bounce when a venue is highlighted
				$('.liSelect').mouseover(function() {
					$(this).addClass("highlight");
					var itemDiv = $(this).attr('alt');
					markersArray[itemDiv].setIcon(null);
				}).mouseout(function() {
					$(this).removeClass("highlight");
					var itemDiv = $(this).attr('alt');
					var iconDiv = $(this).attr('icon');
					markersArray[itemDiv].setIcon(iconDiv);
				});

				// If a model changes in the colelction update the views
				sanfranCollection.bind("change", function(venue){
					if (!venue.venueListView) {
				  		console.log('Changing Venue: ' + venue.attributes.name);

						var itemDiv = $("#" + venue.attributes.id + "").attr('alt');
				        markersArray[itemDiv].setAnimation(google.maps.Animation.BOUNCE);
				        setTimeout(function(){ markersArray[itemDiv].setAnimation(null); }, 5000);

						var template = venueListView.render(venue);
						$("#" + venue.attributes.id + "").html( template ); 
						$("#" + venue.attributes.id + "").effect("highlight", {}, 3000);
					}
				});

				// Method of adding venues

	//			// If a model is added to the list remotely create a view for it
	//			sanfranCollection.bind('add', function(venue) {
	//				if (!venue.venueListView) {
	//					console.log("Remotely Adding Venue: " + venue.attributes.name);
	//					var template = venueListView.render(venue);
	//					var title = venue.attributes.name + ', ' + venue.attributes.hereNow.count + ' people here!';
	//					if (venue.attributes.categories === undefined) {
	//						var iconFixed = "https://foursquare.com/img/categories/nightlife/default.png";
	//					} else {
	//						var iconLocation = venue.attributes.categories[0].icon.prefix;
	//						var icon = iconLocation.substring(0, iconLocation.length - 1);
	//						var iconFixed = icon + venue.attributes.categories[0].icon.name;
	//					}
	//					console.log("Icon Path: " + iconFixed);
	//					console.log("Map Marker Title: " + title);
	//					var lat = parseFloat(venue.attributes.location.lat);
	//					var lng = parseFloat(venue.attributes.location.lng);
	//					var latlng = new google.maps.LatLng(lat, lng);
	//
	//					// Add map markers to map canvas as the venues are rendered
	//					var marker = new google.maps.Marker({
	//						map: venueMapView.map,
	//						position: latlng,
	//						animation: google.maps.Animation.DROP,
	//						title: title,
	//						icon: iconFixed
	//					});
	//					
	//					$("#list").append(template);
	//					$("#" + venue.attributes.id + "").effect("highlight", {color: "green"}, 3000);
	//				}
	//			});

				// If a model is removed from the list remotely remove the view
				sanfranCollection.bind('remove', function(venue) {
						var itemDiv = $("#" + venue.attributes.id + "").attr('alt');
			        	markersArray[itemDiv].setMap(null);
						console.log("Removing Venue: " + venue.attributes.name);
						$("#" + venue.attributes.id + "").effect("highlight", {color: "red"}, 3000).remove();
				});

				$('#loadingModal').modal('hide');

				}});

			// End Fetch
						
		}
		
	});

	return {
		initialize: function() {
			new Router();
		}
	};

});