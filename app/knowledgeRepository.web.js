var config = require('./config');
var knowledge = require('./models/knowledge.js');
var KnowledgeBase = knowledge.KnowledgeBase;
var RepositoryKnowledgeBase = knowledge.RepositoryKnowledgeBase;

function KnowledgeRepository() {
  var self = this;
  console.log("web knowledge repository");

  self.onFactChange = function (callback) {

  };

  self.fetchKnowledgebases = function (callback) { 
    $.ajax(
      {
        type: "GET",
        url: config.source + "/knowledge",
        dataType: "json",
        success: function (data) {
          callback(data.items.map(function (item) {
            return new KnowledgeBase(item);
          }));
        }
    });
  }

  self.updateRepository = function (callback) {

    $.ajax(
      {
        type: "GET",
        url: config.source + "/repository",
        dataType: "json",
        success: function (data) {

          callback(data.items.map(function (item) {
            return new RepositoryKnowledgeBase(item);
          }));
        }
    });

  }

}

module.exports = new KnowledgeRepository();
