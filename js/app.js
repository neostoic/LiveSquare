define(['firebase', 'jquery', 'jqueryui', 'jqueryscrollto', 'underscore', 'backbone', 'backbonefirebase', 'bootstrap', 'bootstrapmodal', 'router'], function(Firebase, $, jQueryUI, jQuerySrollTo, _, Backbone, BackboneFirebase, Bootstrap, BootstrapModal, Router) {

    return {
        initialize: function() {
			console.log("Hello!");
		    Router.initialize();
            Backbone.history.start();
        }
    };

});