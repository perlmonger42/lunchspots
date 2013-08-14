
(function () {
  "use strict";
        
  if (Meteor.isClient) {
    Template.lunchspots.venues = function () {
      return Venues.find({}, {sort: {score: -1, name: 1}});
    };

    Template.lunchspots.selected_name = function () {
      var venue = Venues.findOne(Session.get("selected_venue"));
      return venue && venue.name;
    };

    Template.venue.selected = function () {
      return Session.equals("selected_venue", this._id) ? "selected" : '';
    };

    Template.lunchspots.events({
      'click input.inc': function () {
        Venues.update(Session.get("selected_venue"), {$inc: {score: 1}});
      },
      'click input.dec': function () {
        Venues.update(Session.get("selected_venue"), {$inc: {score: -1}});
      },
      'click input.add': function () {
        addVenue();
      },
      'click input.destroy': function () {
        Venues.remove(Session.get("selected_venue"));
      }
    });

    Template.venue.events({
      'click': function () {
        Session.set("selected_venue", this._id);
        Session.set("error_message", '');
      }
    });

    Template.venueAddError.errorMessage = function () {
      var msg = Session.get("error_message");
      return msg || '';
    };
  }

  // On server startup, create some venues if the database is empty.
  if (Meteor.isServer) {
    Meteor.startup(function () {
      if (Venues.find().count() === 0) {
        var i, random_score, venue, venues;
        venues = [["Wendy's Old Fashioned Hamburgers", "977 N State", "Orem"],
                  ["Buffalo Wild Wings", "92 North 1200 East", "Lehi"],
                  ["Jason's Deli", "771 E University Pkwy", "Orem"],
                  ["Five Star BBQ", "70 N Geneva Rd", "Orem"]];
        for (i = 0; i < venues.length; i++) {
          //random_score = Math.floor(Random.fraction() * 10) * 5;
          random_score = Math.floor(Random.fraction() * 10);
          venue = venues[i];
          Venues.insert({
            name:    venue[0],
            address: venue[1],
            city:    venue[2],
            score:   random_score
          });
        }
      }
    });
  }

  function addVenue() {
    var data = { };

    Session.set("error_message", '');

    $.each($('#venue-add-form').serializeArray(), function() {
      data[this.name] = this.value;
    });

    //do validation on data={name:"Venue Name", street:"Address", city:"City"}

    Venues.insert({
        name:    data.name,
        address: data.street,
        city:    data.city,
        score:   0
      }, function(err, id) {
        var msg;
        if (err) {
          msg = "insert failed: " + err;
          Session.set("error_message", msg);
          console.log(msg);
        } else {
          msg = "created new record with id=" + id;
          $('#venue-add-form')[0].reset();
          console.log(msg);
        }
      }
    );
  }

})();
/* vim: set autoindent tabstop=2 shiftwidth=2 expandtab wrapmargin=76: */
