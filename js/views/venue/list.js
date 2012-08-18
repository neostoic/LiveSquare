// Filename: views/venues/list
define([
	'firebase', 
	'jquery', 
	'underscore', 
	'backbone', 
	'backbonefirebase',
	// Pull in the Collection module from above
	'collections/venues',
	'text!templates/venue/list.html'

], function(Firebase, $, _, Backbone, BackboneFirebase, venuesCollection, venueListTemplate) {
  var venueListView = Backbone.View.extend({
    el: $("#list"),

    initialize: function(){
    },

    render: function(venue){
      var data = {
       venue: venue,
        _: _ 
      };
      var compiledTemplate = _.template( venueListTemplate, data );
	  return compiledTemplate;
    }
  });
  return new venueListView;
});