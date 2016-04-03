const ipcRenderer = window.require('electron').ipcRenderer;

function KnowledgeRepository() {
  var self = this;
  console.log("electron knowledge repository");

  self.updateRepository = function (callback) {
    console.log("updating repository");

    ipcRenderer.on('available knowledgebases', function(event, arg) {
      callback(arg);
    });
    ipcRenderer.send('get available repository knowledgebases');
  };

  self.fetchKnowledgebases = function (callback) {
    callback([]);
  };

}
module.exports = new KnowledgeRepository();
