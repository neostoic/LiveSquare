// Filename: views/venue/map
define([
	'firebase', 
	'jquery', 
	'underscore', 
	'backbone', 
	'backbonefirebase',
  // Pull in the Collection module from above
    'collections/venues',
    'text!templates/venue/map.html'

], function(Firebase, $, _, Backbone, BackboneFirebase, venuesCollection, venueMapTemplate) {
  var MapView = Backbone.View.extend({
	el: $('#mapCanvas'),

	initialize: function() {
	},

	render: function(lat, lng) {
		this.latlng = new google.maps.LatLng(lat, lng);
		
		var myOptions = {
			zoom: 13,
			center: this.latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		
		this.map = new google.maps.Map($(this.el)[0], myOptions);
	},

  });

  return new MapView;

});

