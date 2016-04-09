const ipcRenderer = window.require('electron').ipcRenderer;
const knowledge = require('./models/knowledge');
const RepositoryKnowledgeBase = knowledge.RepositoryKnowledgeBase;
const KnowledgeBase = knowledge.KnowledgeBase;


function KnowledgeRepository() {
  var self = this;

  ipcRenderer.on('available knowledgebases', function(event, arg) {
    self.onRepositories(event, arg);
  });
  self.onFetchedInstalledKnowledgebases = function () {}
  ipcRenderer.on('installed knowledgebases', function(event, arg) {
    self.onFetchedInstalledKnowledgebases(event, arg);
  });

  self.updateRepository = function (callback) {
    console.log("updating repository");

    self.onRepositories = function (event, arg) {
      console.log(RepositoryKnowledgeBase);
      callback(arg.map(function (item) {
        return new RepositoryKnowledgeBase(item);
      }));
    };
    ipcRenderer.send('get available repository knowledgebases');
  };


  self.fetchKnowledgebases = function (callback) {
    self.onFetchedInstalledKnowledgebases = function (event, installed) {
      console.log("repo received installed repositories");
      callback(installed.map(function (data) {
        return new KnowledgeBase(data);
      }));
    } 
    ipcRenderer.send('get installed knowledgebases');
  };

}
module.exports = new KnowledgeRepository();
