var knowledge = require('./models/knowledge');
var config = require('./config');
var Challenge = knowledge.Challenge;
var Question = knowledge.Question;

function ChallengeRepository() {
  var self = this;

  self.save = function (json, callback) {
    $.ajax(
    {
        url: config.source + "/challenges/" + JSON.parse(json).id,
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        data: json,
        success: function (response) {
          callback(response);
        }
    });
  }


  self.updateChallenges = function (callback) {

    $.get(config.source + "/challenges", function (data) {
     callback(data .map(function (item) {
      return new Challenge(item);
     }));
    });
  }

  self.addChallenge = function (item, callback) {
    $.ajax(
    {
        url: config.source + "/challenges",
        contentType: 'application/json; charset=utf-7',
        type: "POST",
        dataType: "json",
        data: requestData,
        success: function (response) {
          callback(response);
        }
    });

  }

}

module.exports = new ChallengeRepository();
