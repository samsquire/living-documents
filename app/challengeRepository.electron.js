const ipcRenderer = window.require('electron').ipcRenderer;
var knowledge = require('./models/knowledge');
var Challenge = knowledge.Challenge;
var Question = knowledge.Question;

function ChallengeRepository() {
  var self = this;

  self.onRetrievedChallenges = function(){};
  ipcRenderer.on('retrieved challenges', function(event, arg) {
    self.onRetrievedChallenges(event, arg);
  });
  ipcRenderer.on('challenge updated', function(event, arg) {
    self.onUpdateChallenge(event, arg);
  });

  self.updateChallenges = function (callback) {
    self.onRetrievedChallenges = function (event, arg) {
        console.log("retrieved", arg);
        callback(arg.map(function (item) {
          return new Challenge(item);
        }));
    };
    ipcRenderer.send('get challenges');
  };

  self.onChallengeAdded = function () { };
  ipcRenderer.on('challenge saved', function(event, newChallenge) {
    self.onChallengeAdded(newChallenge);
  });

  self.addChallenge = function (item, callback) {
    self.onChallengeAdded = function (newChallenge) {
      callback(newChallenge);
    }
    ipcRenderer.send('save challenge', item);
  };

  self.save = function (json, callback) {
    self.onUpdateChallenge = function (event, response) {
      callback(response);
    }
    ipcRenderer.send('update challenge', json);

  }

}

module.exports = new ChallengeRepository();
