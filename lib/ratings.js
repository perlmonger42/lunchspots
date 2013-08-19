// Ban Chi Lunch Spots -- data model
// This JavaScript is loaded on both the client and the server.

////////////////////////////////////////////////////////////////////////
//  Ratings
//
//  Each rating is represented by a document in the Ratings collection:
//    user:    String    (the user id)
//    venue:   String    (the venue id)
//    value:   Number    (the rating user has assigned to venue)

// Set up the collection of ratings.
// On the server, it is backed by a MongoDB collection named "ratings".
Ratings = new Meteor.Collection("ratings");

(function () {
  "use strict";

  function isNumber(s) {
    return typeof(s) === 'number';
  }


  Ratings.allow({
    insert: function (userId, rating) {
      var errMsg = '';
      if (userId === null) {
        errMsg = 'You must be logged in to change a rating.';
      } else if (!isNumber(rating.value)) {
        errMsg = 'The rating value must be a number';
      } else if (rating.value < 0 || rating.value > 10) {
        errMsg = 'The rating must be between 0 and 10, inclusive';
      }
      if (errMsg !== '') {
        throw new Meteor.Error(910, errMsg);
      }
      return true;
    },

    update: function (userId, rating, fields, modifier) {
      var errMsg = '';
      if (modifier) {
        // use {modifier} to shut up JSHint 'defined but never used' warning
      }

      // Only the value can be modified (for now).
      var allowed = ["value"];

      // Only logged-in users can modify a rating.
      if (!userId) {
        errMsg = "You must be logged in to vote on a lunch spot.";
      } else if (_.difference(fields, allowed).length) {
        // tried to write to forbidden field
        errMsg = "Only the value may be modified.";
      } else if (!isNumber(rating.value)) {
        errMsg = 'The rating value must be a number';
      } else if (rating.value < 0 || rating.value > 10) {
        errMsg = 'The rating must be between 0 and 10, inclusive';
      }

      if (errMsg !== '') {
        throw new Meteor.Error(911, errMsg);
      }

      // If we passed all the tests, allow the update.
      return true;
    },

    remove: function (userId, rating) {
      var errMsg;
      if (rating) {
        // use {rating} to shut up JSHint 'defined but never used' warning 
      }
      // Only logged-in users can delete a rating.
      if (!userId) {
        errMsg = "You must be logged in to delete a rating.";
        throw new Meteor.Error(914, errMsg);
      }

      return true;
    }
  });

})();
/* vim: set autoindent tabstop=2 shiftwidth=2 expandtab wrapmargin=76: */
