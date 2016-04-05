var config = require('./config');
var ko = require('./vendor/knockout-3.4.0.js');
var knowledgeRepository = require('./knowledgeRepository');
var storage = require('./storagePicker');
var knowledge = require('./models/knowledge');
var RepositoryKnowledgeBase = knowledge.RepositoryKnowledgeBase;
var KnowledgeBase = knowledge.KnowledgeBase;

function Question(data) {
  this.question = data.question;
  this.answer = ko.observable(data.answer);
}

function Requirement(id, question) {
  var self = this;
  self.id = id;
  self.question = question;
}

function Challenge(data) {
  var self = this;
  this.id = data.id;
  this.questions = ko.observableArray();
  this.path = data.path;

  data.questions.map(function (question) { return new Question(question)  }).forEach(function (question) { self.questions.push(ko.observable(question)); });

}

function Fact(data) {
  this.description = ko.observable(data.description);
  this.value = ko.observable(data.value);
  this.dependencies = ko.observableArray(data.dependencies);
}

function appViewModel() {
  var self = this;
  self.mode = ko.observable("browse");
  self.storageSelection = ko.observable("");
  self.records = ko.observableArray();

  self.knowledgebase = ko.observableArray();
  self.repository = ko.observableArray();

  self.newQuestionText = ko.observable("");
  self.source = config.source;
  self.language = ko.observable("javascript");
  self.inputs = ko.observableArray();
  self.code = ko.observable("");
  self.response = ko.observable("");
  self.dirty = ko.observable(false);

  self.facts = ko.observableArray();
  self.markDirty = function () {
    self.dirty(true);
  }

  self.language.subscribe(function (newLanguage) {
    console.log("language changes to", newLanguage);
    if (self.dirty()) { return; }
    self.fetchLanguageCode(newLanguage);
  });

  self.install = function (data) {
    console.log("installing", data);
    data.installing(true);

    storage.install(data.name, function() {
      data.installing(false);
      data.installed(true);
    });
  }

  self.fetchKnowledgebases = function () {
    knowledgeRepository.fetchKnowledgebases(function (data) {
      self.knowledgebase.removeAll();
      data.forEach(function (item) {
        self.knowledgebase.push(item);
      });
      self.updateFacts();
    });
  };

  self.login = function () {

    $.ajax(
      {
        type: "GET",
        url: self.source + "/login",
        dataType: "json",
        success: function (data) {
          
          if (!data.registered) {
            console.log("user not set up");
            pager.navigate('#/wizard');
          } else {
            console.log("user set up");
            pager.navigate('#/dashboard');
            self.onLoggedIn();
          }
        }
    });
  }

  self.login();

  self.selectStorage = function (context, event) {
    var mode = $(event.target).attr('data-storage-mode');
    self.storageSelection(mode);
    console.log("storage mode changed to", mode);

    storage.open(mode, function (file) {
      pager.navigate("#/dashboard");
      self.onLoggedIn();
    });

  }

  self.onLoggedIn = function () {
    self.fetchKnowledgebases();
    self.fetchLanguageCode(self.language());
  };


  self.switchTab = function (context, event) {
    var newMode = $(event.target).attr('data-mode');
    console.log("switching to", newMode);
    self.mode(newMode);
    self.tabUpdates[newMode]();
  };

  self.activeIfMode = function (element) {
    var newMode = $(element).attr('data-mode');
    return self.mode() === newMode;
  };

  self.fetchLanguageCode = function (newLanguage) {
    if (self.dirty()) { return; }
    
    $.ajax(
      {
        type: "POST",
        data: ko.toJSON(self.inputs),
        url: self.source + "/usages/" + newLanguage,
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        success: function (data) {
          console.log(data)
          self.code(data.code);
          self.dirty(false);
        }
    });
  };


  self.switchLanguage = function (language, event) {
    var language = $(event.target).attr('data-language');
    self.language(language);
  };


  self.updateChallenges = function () {
    self.records.removeAll();
    $.get(self.source + "/challenges", function (data) {
     data
      .map(function (item) {
      return new Challenge(item);
     })
      .forEach(function (item) {
        self.records.push(item);
      }); 
    }); 

    self.updateRepository();
  };


  self.updateRepository = function () {
    knowledgeRepository.updateRepository(function (data) {
        self.repository.removeAll();
        data.forEach(function (item) {
          self.repository.push(item);
        });
    });
  };


  self.updateFacts = function () {
      console.log("updating facts");
      self.facts.removeAll();
      $.get(self.source + "/facts", function (data) {
       data
        .map(function (item) {
        return new Fact(item);
       })
        .forEach(function (item) {
          self.facts.push(item);
        }); 
        self.updateChallenges();
      }); 
  };

  self.tabUpdates = {
    browse: self.updateFacts.bind(self),
    insert: self.updateChallenges.bind(self),
  };


  this.useQuestion = function (challenge, index) {
    var id = challenge.id;
    console.log(index, challenge);
    var question = challenge.questions()[index];
    console.log(question);
    self.inputs.push(new Requirement(id, question));
    self.fetchLanguageCode(self.language());
  };


  this.addRecord = function (item) {
    var requestData = ko.toJSON(item);
    $.ajax(
    {
        url: self.source + "/challenges",
        contentType: 'application/json; charset=utf-7',
        type: "POST",
        dataType: "json",
        data: requestData,
        success: function (response) {
          console.log();
          self.records.unshift(new Challenge(response));
        }
    });
  return false;
  };

  this.reset = function () {
    self.dirty(false); 
    self.inputs.removeAll();
    self.fetchLanguageCode(self.language());
  };

  this.newCode = function () {
    var requestData = {
      code: self.code(),
      dependencies: ko.toJS(self.inputs())
    };
    $.ajax(
    {
        url: self.source + "/code",
        contentType: 'application/json; charset=utf-7',
        type: "POST",
        dataType: "json",
        data: JSON.stringify(requestData),
        success: function (response) {
          var output = response.output;
          self.response(output);
          setTimeout(function () {
            self.updateFacts()
          }, 1500);
        }
    });
    return false; 
  };

  // this.addRecord({
  //   html: "<strong>hello</strong>"
  // }); 

  this.newRecord = function () {
    this.addRecord(new Challenge({questions: [
      {question: self.newQuestionText(), answer: ""}
    ]}));
    self.newQuestionText("");
  };

  this.updateQuestion = function (challenge) {
    self.save(challenge);
  };

  this.save = function (row) {
    console.log(row);

    $.ajax(
    {
        url: self.source + "/challenges/" + row.id,
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        data: ko.toJSON(row),
        success: function (response) {
          console.log("updated", row.id);  
        }
    });

  };

}

module.exports = appViewModel;
