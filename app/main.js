var ko = require('./vendor/knockout-3.4.0.js');
var $ = require('./vendor/jquery-1.12.2.min.js');

function Question(data) {
  this.question = data.question;
  this.answer = data.answer;
}

function Challenge(data) {
  var self = this;
  this.id = data.id;
  this.questions = ko.observableArray();
  this.path = data.path;

  data.questions.map(function (question) { return new Question(question)  }).forEach(function (question) { self.questions.push(question); });

}

function appViewModel() {
  var self = this;
  self.records = ko.observableArray();
  self.newQuestionText = ko.observable("");
  self.source = "http://localhost:5000";


  $.get(self.source + "/challenges", function (data) {
   data
    .map(function (item) {
    return new Challenge(item);
   })
    .forEach(function (item) {
      self.records.push(item);
    }); 

  }); 

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
          self.records.push(new Challenge(response));
        }
    });

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
        contentType: 'application/json; charset=utf-8',
        type: "POST",
        dataType: "json",
        data: ko.toJSON(row),
        success: function (response) {
          console.log("updated", row.id);  
        }
    });

  };

}

module.exports = appViewModel;
