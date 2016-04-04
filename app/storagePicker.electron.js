const ipcRenderer = window.require('electron').ipcRenderer;

function StoragePicker() {
  var self = this;

  self.open = function (mode, callback) {
    ipcRenderer.on('opened', function(event, arg) {
      console.log("opened",mode, arg);
      callback(arg);
    });
    ipcRenderer.send('open storage', mode);
  }

}

module.exports = new StoragePicker();
