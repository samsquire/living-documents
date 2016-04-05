const ipcRenderer = window.require('electron').ipcRenderer;
const knowledge = require('./models/knowledge');
const RepositoryKnowledgeBase = knowledge.RepositoryKnowledgeBase;


function KnowledgeRepository() {
  var self = this;
  console.log("electron knowledge repository");

  self.updateRepository = function (callback) {
    console.log("updating repository");

    ipcRenderer.on('available knowledgebases', function(event, arg) {
      console.log(RepositoryKnowledgeBase);
      callback(arg.map(function (item) {
        return new RepositoryKnowledgeBase(item);
      }));
    });
    ipcRenderer.send('get available repository knowledgebases');
  };

  self.fetchKnowledgebases = function (callback) {
    callback([]);
  };

}
module.exports = new KnowledgeRepository();
