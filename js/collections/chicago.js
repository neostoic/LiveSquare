define([
  'firebase',
  'jquery',
  'underscore',
  'backbone',
  'backbonefirebase',
  'models/chicago'
], function(Firebase, $, _, Backbone, BackboneFirebase, chicagoModel){
  var chicagoCollection = Backbone.Collection.extend({
    model: chicagoModel,
	url: '/chicago',

    initialize: function(){
		this.backboneFirebase = new BackboneFirebase(this);
    }

  });
 
  return new chicagoCollection;
});
