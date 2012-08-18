require.config({
    paths: {
		async:  	'libs/require/async',
		firebase:   'https://static.firebase.com/v0/firebase',
        jquery:     'libs/jquery/jquery',
        jqueryui:   'libs/jquery/jquery-ui',
		jqueryscrollto:   'libs/jquery/jquery-scrollTo',
        underscore: 'libs/underscore/underscore',
        backbone:   'libs/backbone/backbone',
		backbonefirebase: 'libs/backbone-firebase/backbone-firebase',	
		bootstrap:  'libs/bootstrap/bootstrap-min',
		bootstrapmodal: 'libs/bootstrap/bootstrap-modal',
        text:       'libs/require/text',
        json2:      'libs/json/json2',
        templates:   '../templates'
    },
	shim: {
		firebase: {
			exports: 'Firebase'
		},
		jquery: {
			exports: '$'
		},
		jqueryui: {
			deps: ['jquery']
		},
		jqueryscrollto: {
			deps: ['jquery']
		},
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: ["underscore", "jquery"],
			exports: "Backbone"
		},
		backbonefirebase: {
			deps: ["firebase", "underscore", "backbone"],
			exports: "BackboneFirebase"
		},
		bootstrap: {
			deps: ['jquery']
		},
		bootstrapmodal: {
			deps: ['bootstrap']
		}
	}
});

require([
	'app', 
	'json2',
	'async!http://maps.googleapis.com/maps/api/js?key=AIzaSyCp3f9YeLZmAi-ARuziW61AS2uaU8TwoJ4&sensor=false'
], function(app) {
    app.initialize();
});