define([
  'firebase',
  'jquery',
  'underscore',
  'backbone',
  'backbonefirebase',
  'models/sanfran'
], function(Firebase, $, _, Backbone, BackboneFirebase, sanfranModel){
  var sanfranCollection = Backbone.Collection.extend({
    model: sanfranModel,
	url: '/sanfran',

    initialize: function(){
		this.backboneFirebase = new BackboneFirebase(this);
    }

  });
 
  return new sanfranCollection;
});
