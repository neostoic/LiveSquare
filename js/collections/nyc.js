define([
  'firebase',
  'jquery',
  'underscore',
  'backbone',
  'backbonefirebase',
  'models/nyc'
], function(Firebase, $, _, Backbone, BackboneFirebase, nycModel){
  var nycCollection = Backbone.Collection.extend({
    model: nycModel,
	url: '/nyc',

    initialize: function(){
		this.backboneFirebase = new BackboneFirebase(this);
    }

  });
 
  return new nycCollection;
});
