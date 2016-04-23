'use strict';
const _ = require('lodash');
const Bacon = require('baconjs').Bacon;
const homeDir = require('home-dir').directory;
const path = require('path');
const electron = require('electron');
const async = require('async');
const fs = require('fs');
const shelljs = require('shelljs');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const levelup = require('levelup');

var livingDocumentsHome = '.livingdocuments';
var libraryFolder = "living-documents-library";
var activeRepo = path.join(homeDir, livingDocumentsHome, "default");
var repo = null;
var factListener = null;


function libraryPath() {
  return path.join(homeDir, livingDocumentsHome, libraryFolder);
}

function ExecutionPlan() {

}

function Repo(repoPath) {
  var self = this;
  self.path = repoPath;
  self.dataSources = {};
  self.database = path.join(repoPath, "db");
  self.retrievedChallenges = [];
  shell.cd(self.database);
  if (shell.test('-f', 'LOCK')) {
    shell.rm('LOCK');
    console.log("unlocked folder");
  }
  shell.cd(self.path);

  self.completedChallenges = function () {
    var allAnswers = _(self.retrievedChallenges)
      .flatMap('questions')
      .filter(function (item) { return item.answer !== ""; })
      .flatMap('question')
      .value();

    return allAnswers;
  };

  self.challenges = function (callback) {
    self.query("challenge", function (retrievedChallenges) {
      self.retrievedChallenges = retrievedChallenges;
      callback(retrievedChallenges);
    });
  };

  self.installedModules = [];
  self.installedModuleSettings = {};
  self.dependencyMappings = {};

  self.dependencies = function (callback) {
    shell.cd(self.path);
    async.waterfall([
      function settingsParsing(finishedParsingSettings) {
        fs.readFile("settings.json", function (err, data) {
        if (err) {
          finishedParsingSettings("no settingsjson", {}, {});
          return;
        }
        var settings = JSON.parse(data);
        if (!('dependencies' in settings)) {
          finishedParsingSettings("no installed dependencies", {}, {});
          return;
        }
        self.installedModules = settings.dependencies;



        async.reduce(settings.dependencies, {}, function (previous, item, itemParsed) {
          fs.readFile(path.join(libraryPath(), item, "livingdocument.json"), function (err, knowledgebaseJson) {
            var parsed = JSON.parse(knowledgebaseJson);
            previous[item] = parsed;
            itemParsed(null, previous);
          });
        }, function (err, results) {
          self.installedModuleSettings = results;
          finishedParsingSettings(null, results);
        });

      });
    },

		function installNpmDependencies(installed, finishedInstalling) {
      console.log("installing module dependencies");
			async.map(self.installedModules, function (item, callback) {
        console.log("installing module dependencies", item);
				var thisModule = path.join(libraryPath(), item);
				shell.cd(thisModule);
				console.log("installing", thisModule);
				shell.exec(['npm install'], function () {
					console.log("installed", thisModule);
					callback();
				});
			}, function () {
				finishedInstalling(null, installed);
			});

		},
    function importModules(installed, callback) {
        var modules = self.installedModules.reduce(function (previous, current) {
					var thisModule = path.join(libraryPath(), current);
          previous[current] = require(thisModule);
          return previous;
        }, {});

        callback(null, installed, modules);
    },
    function createMappings(installed, modules, finishedMappings) {

        var mappings = _.map(installed, function (value, key) {
          var mapping = {};
          mapping.inputs = {};
          mapping.outputs = {};
          mapping.inputs[key] = _.keys(value.dependencies);
          mapping.outputs[key] = _.keys(value.outputs);
          return mapping;
        });
        var deps = mappings.reduce(function (previous, current) {
          return _.merge(previous, current);
        }, {});
        finishedMappings(null, deps, modules);

    }], function (err, deps, modules) {
        if (err) {
          console.log("couldnt get dependencies"); 
          callback({}, {});
          return;
        }
        self.dependencyMappings = deps;
        callback(deps, modules);
    });
  };

  self.query = function (type, callback) {
    var db = levelup(self.database, {createIfMissing: true});
    var items = [];
    var query = db.createReadStream({lt: type + "-" + '\xff',
                                    gte: type + "-"  + '\x00'   })
      .on('data', function (data) {
        var parsed = JSON.parse(data.value)
        items.push(parsed);
    }).on('end', function () {
        console.log("finished challenge query");
        db.close();
        callback(items);
    }).on('error', function (err) {
        console.log("error in query", err);
        db.close();
    });
  }

  self.save = function (type, data, saveFinished, update) {
    var db = levelup(self.database);
    var newChallenge = JSON.parse(data);

    async.waterfall([
      function getAndUpdateCountKey(callback) {
        if (update) { callback(null, newChallenge.id); return }

        var countKey = 'count-' + type;
        db.get(countKey, function (err, value) {
          var currentCount, nextCount;
          if (err) {
            console.log("error getting count", err);
            if (err.notFound) {
              nextCount = 1;
              console.log("starting new count");
            } else {
              callback(err);
              return;
            }
          } else {
            var currentCount = parseInt(value)
            nextCount = currentCount + 1;
          }
          db.put(countKey, nextCount, function (err) {
            if (err) {
              callback(err);
              return
            }
            newChallenge.id = nextCount;
            callback(null, nextCount);
          });
        });
    },

    function saveItem(myId, callback) {
      db.put(type + '-' + myId, JSON.stringify(newChallenge), function (err) {
        if (err) {
          console.log("error saving actual", type, "giving up", err);
          callback(err);
          return;
        }
        callback(null, myId);
      });
    }
    ],
    function (err, result) {
      db.close();
      if (err) {
        console.log("failed to update or save", err);
        return;
      }
      saveFinished(newChallenge);
    });
  }

  self.allInputs = [];

  self.execute = function (finishedExecution) {
    // create a graph of dependencies
    // for each answer
    // find dependency in graph
    // execute knowledgebase
    // for each generated fact
    // execute knowledgebase
    //
    self.dependencies(function (wanted, availableModules) {

      self.dataSources = _.reduce(wanted.inputs,
                                  function (previous, value, key) {

        value.forEach(function (question) {
					var hasTimeConfig = 'time' in self.installedModuleSettings[key];
					if (hasTimeConfig) {
						console.log(key, "has a temporal dependencies");
					}
					if (hasTimeConfig && question in self.installedModuleSettings[key].time) {
						console.log(question, "is a defined temporal dependency");
						var timeSettings = self.installedModuleSettings[key].time;
						var interval = timeSettings[question];
						previous[question] = Bacon.interval(interval, {});
						console.log(question, "=", interval + "ms");
          } else if (!(question in previous)) {
            console.log("created bus for", question);
            previous[question] = new Bacon.Bus();
            self.allInputs.push(question);
          } else {
            console.log("reusing existing data source");
          }
        });
        return previous;
      }, self.dataSources);

      _.reduce(wanted.outputs, function (previous, value, key) {
        value.forEach(function (question) {
          if (!(question in previous)) {
            // console.log("created bus for", question);
            previous[question] = new Bacon.Bus();
          } else {
            // console.log("reusing existing data source");
          }
        });
        return previous;
      }, self.dataSources);

      self.modules = _.reduce(wanted.inputs, function (previous, value, key) {
        var dependencies = value.map(function (item) {
          return self.dataSources[item];
        });

        // console.log("module dependencies found", dependencies);
        var bus = Bacon.combineWith(dependencies,
                                    function () {
          var batch = Array.prototype.slice.call(arguments);
					console.log(dependencies);
          var pairs = _.zip(value, batch)
          var changedObject = _.fromPairs(pairs);
          return changedObject;
        });

        var moduleCode = availableModules[key]

        previous[key] = bus;
        if ('view' in moduleCode) {
          var aggregation = bus.scan({}, moduleCode.view);    
          aggregation.onValue(function (item) {
            console.log(item); 
          });
        }
        bus.onValue(function (item) {
          
          moduleCode.run(item,
						function (err, outputData) {
							if (err) {
								console.log(key, "ERROR", err);
								return;
							}

							console.log(key, "OUTPUT", outputData);

              _.forEach(outputData, function (value, key) {
                if (self.allInputs.indexOf(key) !== -1) {
                  console.log("our output is an input for another module", key);
                }
                if (key in self.dataSources) {
                  self.dataSources[key].push(value);
                }
              });
					});

			});


			return previous;
		}, {});


      finishedExecution();

      var allOutputs = _.reduce(self.dependencyMappings.outputs, function (previous, value, key) {
        return _.concat(previous, value);
      }, []);


      var outputSources = allOutputs.map(function (dependency) {
        return self.dataSources[dependency];
      });
      // outputSources = _.concat(outputSources, _.values(self.modules));
      console.log(self.modules);

      console.log("have been asked for facts");
      Bacon.mergeAll(outputSources)
        .onValue(function (item) {

        function createPair(value, key) {
            return {
              name: key,
              value: value
            };
        }

        console.log("output created", item);
          function createPairDeep(value, key) {
            if (typeof value === "object") {
              return _.flatMapDeep(value, createPairDeep);
            } else {
              return createPair(value, key);
            }
          }

          var viewModel = createPairDeep(item);
          console.log(item, viewModel);
          if (mainWindow) {
            mainWindow.send('facts changed', viewModel);
          }
        });

    });
  }
}

let mainWindow;

var shell = require('shelljs');

shell.cd();
shell.mkdir(livingDocumentsHome);
shell.cd(livingDocumentsHome);
var repo = "git@github.com:samsquire/living-documents-library.git";


if (shell.test('-d', libraryFolder)) {
  shell.cd(libraryFolder);
  shell.exec('git pull', function (code, stdout, stderr) {
    if (code === 0) {
      console.log("library updates downloaded");
    } else {
      console.log("library failed to update");
    }
 });
} else {
  shell.exec('git clone ' + repo, function (code, stdout, stderr) { 
    if (code === 0) {
      console.log("library downloaded");
    } else {
      console.log("library failed download");
    }

  });
}

const ipcMain = require('electron').ipcMain;
ipcMain.on('get facts', function(event, arg) {
  console.log("asked for facts");
});
ipcMain.on('get installed knowledgebases', function(event, arg) {

  repo.challenges(function (retrievedChallenges) {
    var knowledgebaseConfigurations = _.values(repo.installedModuleSettings);
    knowledgebaseConfigurations.forEach(function (item) {
      var name = item.name;
      var myInputs = repo.dependencyMappings.inputs[name];
      item.challenges = myInputs.length;
      item.completedChallenges = _.intersection(myInputs, repo.completedChallenges()).length;
    });

    // console.log("getting installed knowledgebases", knowledgebaseConfigurations);
    event.sender.send('installed knowledgebases', knowledgebaseConfigurations);
  });

});


ipcMain.on('update challenge', function(event, updatedJson) {
  var data = JSON.parse(updatedJson);
		if (data.type) {
			var unanswered = _(data.questions)
				.map('answer')
				.filter(function (item) {
					return item === "";
				}).value();
			if (unanswered.length === 0) {
				console.log("fully answered");
				var challengeBus = repo.dataSources[data.type];
				if (challengeBus) {
					challengeBus.push(data);
				}
			} else {
				console.log("missing some questions");
			}
	} else {
		data.questions.forEach(function (question) {
			var questionText = question.question;
			var entry = repo.dataSources[questionText];
			console.log(data.type);
			if (!entry) {
				console.log("Nobody cares about " + question.question);
			} else {
				console.log("Submitting new value for " + question.question);
				entry.push(question.answer);
			}
		});
	}

	repo.save("challenge", updatedJson, function (newChallenge) {
		event.sender.send('challenge updated', data);
	}, true);
});
ipcMain.on('get available repository knowledgebases', function(event, arg) {

  var available = shell.find('~/.livingdocuments/living-documents-library/')
      .filter(
  function (item) {
    return item.match(/livingdocument\.json/);
  });

  console.log("found", available.length, "available modules to install");
  async.map(available, function (item, finishedItem) {
    fs.readFile(item, function (err, data) {
      if (!err) {
        var metadata = JSON.parse(data);
        finishedItem(null, metadata);
      } else {
        finishedItem(err);
      }

    });

  }, function (err, results) {

    results.forEach(function (item) {
      if (item.name in repo.installedModuleSettings) {
        item.installed = true;
      } else {
        item.installed = false;
      }
    });

    event.sender.send('available knowledgebases', results);
  });

});

function currentSettingsPath(source) {
  return path.join(source, "settings.json")
}

ipcMain.on('save challenge', function(event, challengeRequest) {
  repo.save("challenge", challengeRequest, function (newChallenge) {
    event.sender.send('challenge saved', newChallenge);
    console.log("just saved challenge", newChallenge);
  });
});

ipcMain.on('open storage', function(event, arg) {
  if (arg === "custom") {
    const dialog = require('electron').dialog;
    var selection = dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory']});  
    activeRepo = selection[0];
  }

  console.log("opening repository at", activeRepo);
  if (!shell.test('-d', activeRepo)) {
    console.log("repo does not exist");
    shell.mkdir(activeRepo);
    shell.mkdir(path.join(activeRepo, "db"));
  } else {
    console.log("repository already exists");
  }

  var settingsPath = currentSettingsPath(activeRepo);

  console.log("settings path", settingsPath);

  if (!shell.test('-f', settingsPath)) {
    console.log("no settings file exists, writing");
    var data = {
      "version": "0"
    }
    fs.writeFile(settingsPath, JSON.stringify(data));
  } else {
    console.log("settings file exists");
  }

  var packageJson = path.join(activeRepo, "package.json");
  if (!shell.test('-f', packageJson)) {
    shell.cd(activeRepo);
    shell.exec('npm init -y', function (code, stdout, stderr) {
    });
  }
  repo = new Repo(activeRepo);

  var stock = {
				"type": "stock purchase",
        "questions": [
            {
                "answer": "",
                "question": "What did you buy?"
            },
            {
                "answer": "",
                "question": "At what price did you buy at?"
            },
            {
                "answer": "",
                "question": "When did you buy it?"
            },
            {
                "answer": "",
                "question": "How many units did you buy?"
            }
        ]
    };

  repo.execute(function () {
    repo.save("challenge", JSON.stringify(stock), function (newChallenge) {
      event.sender.send('opened', activeRepo);
      console.log("saved new challenge");	
    });
  });

});


ipcMain.on('get challenges', function(event, arg) {
  repo.challenges(function (retrievedChallenges) {
    event.sender.send('retrieved challenges', retrievedChallenges);
  });
});

ipcMain.on('install knowledgebase', function(event, knowledgebaseName) {
  var knowledgebasePath = path.join(libraryPath(), knowledgebaseName);
  var knowledgebaseSettingsPath = path.join(knowledgebasePath, "livingdocument.json");
  console.log("installing knowledge base", knowledgebaseName, knowledgebaseSettingsPath);

  fs.readFile(knowledgebaseSettingsPath, function (err, data) {
    var metadata = JSON.parse(data);

    if (err) {
      console.log("failed to update knowledgebase"); 
      return;
    }
    var packageName = knowledgebaseName;

//    if (!packageName) {
//      packageName = knowledgebasePath ;
//    }
    console.log("now installing package", packageName);
    shell.cd(repo.path);

    fs.readFile('settings.json', function (err, data) {
      var settings = JSON.parse(data);
      if (!('dependencies' in settings)) {
        settings.dependencies = [];
      }
      if (settings.dependencies.indexOf(packageName) == -1) {
        settings.dependencies.push(packageName);
      }

      fs.writeFile('settings.json', JSON.stringify(settings, null, 4), function (err) {
        if (!err) {
          repo.execute(function() {
            event.sender.send('installed', knowledgebaseName);
          });
        }
      });
    });

//     console.log("installing in", repo.path)
//     shell.exec('npm install --save ' + packageName, function (code, stdout, stderr) {
//       event.sender.send('installed', arg);
//     });

  });


});

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/electron.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

