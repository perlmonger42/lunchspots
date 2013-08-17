// Ban Chi Lunch Spots -- data model
// This JavaScript is loaded on both the client and the server.

////////////////////////////////////////////////////////////////////////
//  Venues
//
//  Each venue is represented by a document in the Venues collection:
//    name:    String    (the name of the restaurant)
//    address: String    (street number and street name of the restaurant)
//    city:    String    (the city in which the restaurant is located)
//    score:   Number    (the overall rating of this restaurant)

// Set up the collection of restaurants.
// On the server, it is backed by a MongoDB collection named "venues".
Venues = new Meteor.Collection("venues");

(function () {
  "use strict";

  function okString(s) {
    return typeof(s) === 'string' && s.length > 0;
  }


  Venues.allow({
    insert: function (userId, venue) {
      var errMsg = '';
      if (userId === null) {
        errMsg = 'You must be logged in to add a lunch spot.';
      } else if (!okString(venue.name)) {
        errMsg = 'Restaurant name must be a non-empty string.';
      } else if (!okString(venue.address)) {
        errMsg = 'Restaurant address must be a non-empty string.';
      } else if (!okString(venue.city)) {
        errMsg = 'Restaurant city must be a non-empty string.';
      } else if (venue.score !== 0) {
        errMsg = 'Initial score must be zero.';
      }
      if (errMsg !== '') {
        throw new Meteor.Error(900, errMsg);
      }
      return true;
    },

    update: function (userId, venue, fields, modifier) {
      var errMsg;
      if (modifier) {
        // use {modifier} to shut up JSHint 'defined but never used' warning
      }

      // Only logged-in users can modify a venue.
      if (!userId) {
        errMsg = "You must be logged in to vote on a lunch spot.";
        throw new Meteor.Error(901, errMsg);
      }

      // Only the score can be modified (for now).
      var allowed = ["score"];
      if (_.difference(fields, allowed).length) {
        // tried to write to forbidden field
        errMsg = "Only the score may be modified (for now).";
        throw new Meteor.Error(901, errMsg);
      }

      // If we passed all the tests, allow the update.
      return true;
    },

    remove: function (userId, venue) {
      var errMsg;
      if (venue) {
        // use {venue} to shut up JSHint 'defined but never used' warning 
      }
      // Only logged-in users can delete a venue.
      if (!userId) {
        errMsg = "You must be logged in to delete a lunch spot.";
        throw new Meteor.Error(901, errMsg);
      }

      return true;
    }
  });

})();
/* vim: set autoindent tabstop=2 shiftwidth=2 expandtab wrapmargin=76: */
