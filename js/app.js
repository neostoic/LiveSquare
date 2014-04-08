// App.js

// Launch app on DOM load
$(document).ready(function() {

  // Open a conenction to Firebase
  var fireRef = new Firebase('http://gamma.firebase.com/livesquare/');

  // Open the about modal
  $('#about').click(function() {
    $('#aboutModal').modal('show');
  });
  
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
  
  // Render function for making list templates
  var render = function(venue){
    var data = {
      venue: venue,
      _: _ 
    };
    // List Item Template
    var listItem = '<li id="<%= venue.id %>" class="liSelect <%= venue.id %>"> <div> <div> <h5><a href="https://foursquare.com/v/<%= venue.id %>" target="_blank"><%= venue.name %></a></h5> </div> <div class="stats"> Checkins: <%= venue.stats.checkinsCount %> <br> Tips: <%= venue.stats.tipCount %> <br> Users: <%= venue.stats.usersCount %> <br> </div> <div class="here"> <h3><%= venue.hereNow.count %> here</h3> </div> </div> <div class="clear"> </div> </li>';
    var compiledTemplate = _.template( listItem, data );
    return compiledTemplate;
    };
  
  // Render function for map
  var renderMap = function(lat, lng) {
    var maplatlng = new google.maps.LatLng(lat, lng);
    
    var myOptions = {
      zoom: 13,
      center: maplatlng,
      scrollwheel: false,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    return new google.maps.Map($('#mapCanvas')[0], myOptions);
  };
  
  // Load Map and List
  $('.city').click(function() {
        
    // Show loading modal and set variables to turn firebase off
    $('#loadingModal').modal('show');
    $('ul.nav > li').removeClass('active');
    $(this).addClass('active');
    
    // Get the selected city and assign it's attributes to variables
    var city = $(this).attr('id');
    var cityLat = $(this).attr('lat');
    var cityLng = $(this).attr('lng');
    console.log("City Selection is: " + city);
    
    // Set Firebase reference location
    var fire = fireRef.child(city);

    // Empty the map and list.
    $('#list').empty();
    $('#mapCanvas').empty();

    // Render the map
    var map = renderMap(cityLat, cityLng);
    
    // Read the initial list of data from Firebase and set priorities
    fire.once('value', function(snapshot) {
      // Loop through each venue and set it's priority
      snapshot.forEach(function(childSnapshot) {  
        // Set priority of venue to the herenow value for ordering purposes
        var priority = childSnapshot.val().hereNow.count;
        var ref = childSnapshot.ref();
        ref.setPriority(-priority);
        console.log("Setting priority of " + ref + " to " + priority);
      }); // End priority set
  
      // Create an array to store map markers
      var markersArray = [];
      var v = 0;
  
      // Add Venue function to update the list and map when venues are added to Firebase
      var venueAdd = function(venueChildSnapshot) {
        
          // Place the venue data into an object and compile an Underscore template
          var venue = venueChildSnapshot.val();
          console.log("Adding venue: " + venue.name);
          console.log("Venue object is:");
          console.log(venue);
          // Pass the venue through the render function
          var template = render(venue);
          // Append the compiled template to the list
          $("#list").append(template);
          
          // Set the title of the venue to a variable for use with map markers
          var title = venue.name + ', ' + venue.hereNow.count + ' people here!';

          // Check if an icon exists for the venue
          if (venue.categories === undefined) {
            var iconFixed = "https://foursquare.com/img/categories/nightlife/default.png";
          } else {
            var iconLocation = venue.categories[0].icon.prefix;
            var icon = iconLocation.substring(0, iconLocation.length - 1);
            var iconFixed = icon + venue.categories[0].icon.name;
          }

          // Convert venue lat and lng to integers
          var lat = parseFloat(venue.location.lat);
          var lng = parseFloat(venue.location.lng);
          var latlng = new google.maps.LatLng(lat, lng);

          // Add map markers to map canvas as the venues are rendered
          var marker = new google.maps.Marker({
            map: map,
            position: latlng,
            animation: google.maps.Animation.DROP,
            title: title,
            icon: iconFixed
          });

          // Store markers in an array for future reference
          markersArray.push(marker);

          // Add highlight and scroll to when mouse over of map icon
          google.maps.event.addListener(marker, "mouseover", function() {
               $('#' + venue.id).addClass("highlight");
             $('#list').scrollTo('#' + venue.id, {duration: 1000});
          });

          // Remove highlight when mouseout of map icon
          google.maps.event.addListener(marker, "mouseout", function() {
               $('#' + venue.id).removeClass("highlight");
          });

          // Open venue details on click
          google.maps.event.addListener(marker, "click", function() {
             window.open('https://foursquare.com/v/' + venue.id);
          });
          
          // Add venue number and icon to list div
          $('#' + venue.id).attr('alt', v);
          if (venue.categories === undefined) {
            var iconFixed = "https://foursquare.com/img/categories/nightlife/default.png";
            $('#' + venue.id).attr('icon', iconFixed);
          } else {
            var iconLocation = venue.categories[0].icon.prefix;
            var icon = iconLocation.substring(0, iconLocation.length - 1);
            var iconFixed = icon + venue.categories[0].icon.name;
            $('#' + venue.id).attr('icon', iconFixed);
          }
          
          // Counter for the marker array push
          v++;
        
      };
      
      // Collection Change function to update the list and map when Firebase changes
      var collectionChange = function(snapshot) {
        var venue = snapshot.val();
        console.log("Changing venue: " + venue.name);
        var itemDiv = $("#" + venue.id + "").attr('alt');
        console.log(itemDiv);
            markersArray[itemDiv].setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ markersArray[itemDiv].setAnimation(null); }, 5000);
        var template = render(venue);
        $("#" + venue.id + "").html(template); 
        $("#" + venue.id + "").effect("highlight", {}, 3000);
      };
      
      // Remove venue from list and map when it is removed from Firebase
      var venueRemove = function(removeSnapshot) {
        var venue = removeSnapshot.val();
        var itemDiv = $("#" + venue.id + "").attr('alt');
          markersArray[itemDiv].setMap(null);
        console.log("Removing Venue: " + venue.name);
        $("." + venue.id + "").remove();
      };
      
      // Turn on Firebase to update the list and map when venues are added
      fire.on('child_added', venueAdd);
      
      // Turn on Firebase to update the list and map using the collectionChange function
      fire.on('child_changed', collectionChange);
      
      // Turn on Firebase to remove venue from list and map when it stops trending
      fire.on('child_removed', venueRemove);
      
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

      // Hide loading modal and change menu state
      $('#loadingModal').modal('hide');
      
      // Turn off Firebase connection on city change
      $('.city').click(function() {
        fire.off('child_added', venueAdd);
        fire.off('child_changed', collectionChange);
        fire.off('child_removed', collectionChange);
        console.log("Turning off: " + fire);
      });
      
    }); // End fire once
    
  }); // End city click
  
  // Launch MYC Trend on page load
  $('#nyc').click();

}); // End Document Ready
