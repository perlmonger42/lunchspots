
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

    Template.venue.roundedScore = function () {
      return this.score.toFixed(1);
    };

    Template.venue.rawScore = function () {
      return computeScore(this.ratingSum, this.ratingCount).toFixed(3);
    };

    Template.venue.ratingStatus = function (aRating) {
      var selected = Session.equals("selected_venue", this._id);
      if (!selected) { return 'inactiveRating' }
      var r = Ratings.findOne({user: Meteor.userId(), venue: this._id});
      if (!r) {
        return aRating === 5 ? 'selectedRating' : 'newRating';
      }
      return r.value === aRating ? 'selectedRating' : 'newRating';
    };

    Template.controls.events({
      'click #recalc': function (/*theEvent, controlsTemplate*/) {
        /*var context = this;*/
        var stats, ratings, venues;
        stats = { };
        ratings = Ratings.find({}).fetch();
        venues = Venues.find({}).fetch();
        _.each(venues, function (venue) {
          var venueId = venue._id, venueStats = stats[venueId];
          if (!venueStats) {
            venueStats = stats[venueId] = { sum: 0, count: 0 };
          }
        });
        _.each(ratings, function (rating) {
          var venueId, venueStats;
          venueId = rating.venue;
          venueStats = stats[venueId];
          if (!venueStats) {
            venueStats = stats[venueId] = { sum: 0, count: 0 };
          }
          venueStats.sum += rating.value;
          venueStats.count += 1;
        });
        _.each(stats, function (venueStats, venueId) {
          var venueScore = computeScore(venueStats.sum, venueStats.count);
          Venues.update(venueId, {$set: {
            score:       venueScore,
            ratingSum:   venueStats.sum,
            ratingCount: venueStats.count
          }});
        });
      }
    });

    Template.lunchspots.events({
      'click span.newRating': function (theEvent /*, lunchspotsTemplate*/) {
        var theVenue = this; // `this` is bound to the current venue. Why? 
        // When event methods are dispatched, Meteor binds `this` to "the
        // current context".  Our HTML has a loop, `{{#each venues}}`,
        // which expands its body once per venue, setting the current
        // context to the current venue.  And since the venue-ratings
        // buttons are generated inside the `venue` template, which is
        // inside the `{{#each venues}}` loop, we get the venue in `this`.
        var value = theEvent.currentTarget.innerText;
        if (value === 'X') { value = ''; /* no rating at all */ }
        rateVenue(Meteor.userId(), theVenue._id, value);
      },
      'click input.add': function () {
        addVenue();
      },
      'click span.destroy': function () {
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
          //random_score = Math.floor(Random.fraction() * 10);
          //random_score = 0;
          random_score = (Random.fraction() * 10);
          venue = venues[i];
          Venues.insert({
            name:    venue[0],
            address: venue[1],
            city:    venue[2],
            score:   random_score,
            ratingSum:   0,
            ratingCount: 0
          });
        }
      }
    });
  }

  function rateVenue(userId, venueId, newRating) {
    if (newRating !== '') {
      newRating = parseInt(newRating, 10);
    }
    var deltaSum, deltaCount, oldRating;
    var r = Ratings.findOne({user: userId, venue: venueId});
    if (r && typeof r.value !== 'number') {
      // This shouldn't happen, but clean it up if it does.
      Ratings.remove(r._id);
    }

    if (!r) {
      // Previously, userId had no rating for venueId.
      oldRating = '';
      if (newRating === '') {
        // Nothing to do: there was no rating before and no rating now.
        deltaSum = 0;
        deltaCount = 0;
      } else {
        // Insert a new rating.
        deltaSum = newRating;
        deltaCount = 1;
        Ratings.insert({user: userId, venue: venueId, value: newRating});
      }
    } else {
      // Previouly, userId had a rating for venueId.
      oldRating = r.value;
      if (newRating === '') {
        // Remove the existing rating.
        deltaSum = -oldRating;
        deltaCount = -1;
        Ratings.remove(r._id);
      } else {
        // Update the existing rating.
        deltaSum = newRating - oldRating;
        deltaCount = 0;
        Ratings.update(r._id, {$set: {value: newRating}});
      }
    }

    // Apply any changes to the venue score.
    if (deltaSum !== 0 || deltaCount !== 0) {
      var v = Venues.findOne(venueId);
      if (v) {
        var sum = v.ratingSum + deltaSum;
        var count = v.ratingCount + deltaCount;
        var score = computeScore(sum, count);

        Venues.update(venueId, {$set: {
          score:       score,
          ratingSum:   sum,
          ratingCount: count
        }});
      }
    }
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

  function computeScore(sum, count) {
    // Venues that haven't been scored should get a score of 5, not  NaN.
    return count === 0 ? 5 : sum / count;
  }

})();
/* vim: set autoindent tabstop=2 shiftwidth=2 expandtab wrapmargin=6: */
