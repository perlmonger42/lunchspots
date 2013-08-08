/* vim: set autoindent tabstop=2 shiftwidth=2 expandtab: */

(function () {
  "use strict";

  // Set up a collection to contain restaurant location information.
  // On the server, it is backed by a MongoDB collection named "venues".
  var Venues = new Meteor.Collection("venues");
        
  if (Meteor.isClient) {
    Template.lunchspots.venues = function () {
      return Venues.find({}, {sort: {score: -1, name: 1}});
    };

    Template.lunchspots.selected_name = function () {
      var venue = Venues.findOne(Session.get("selected_player"));
      return venue && venue.name;
    };

    Template.venue.selected = function () {
      return Session.equals("selected_player", this._id) ? "selected" : '';
    };

    Template.lunchspots.events({
      'click input.inc': function () {
        Venues.update(Session.get("selected_player"), {$inc: {score: 5}});
      }
    });

    Template.venue.events({
      'click': function () {
        Session.set("selected_player", this._id);
      }
    });
  }

  // On server startup, create some venues if the database is empty.
  if (Meteor.isServer) {
    Meteor.startup(function () {
      if (Venues.find().count() === 0) {
        var i, random_score, venue, venues;
        venues = [["Wendy's Old Fashioned Hamburgers", "977 N State", "Orem"],
                 ["Buffalo Wild Wings", "92 North 1200 East", "Lehi"],
                 ["Jason's Deli", "771 E University Pkwy", "Orem"]];
        for (i = 0; i < venues.length; i++) {
          random_score = Math.floor(Random.fraction() * 10) * 5;
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

})();
