
function RepositoryKnowledgeBase(data) {
  this.name = data.name;
  this.author = data.author;
  this.description = data.description;
  this.installing = ko.observable(data.installing || false);
  this.installed = ko.observable(data.installed);
}
function KnowledgeBase(data) {
  this.name = data.name;
  this.completedChallenges = data.completedChallenges || 0;
  this.challenges = data.challenges || 1;
  this.completedness = (this.completedChallenges / this.challenges) * 100
  this.author = data.author;
  this.description = data.description;
}
function Question(data) {
  this.question = data.question;
  this.answer = ko.observable(data.answer);
}

function Challenge(data) {
  var self = this;
  this.id = data.id;
  this.questions = ko.observableArray();
  this.path = data.path;

  data.questions.map(function (question) {
    return new Question(question)
  }).forEach(function (question) {
    self.questions.push(ko.observable(question));
  });

}

module.exports = {
  RepositoryKnowledgeBase: RepositoryKnowledgeBase,
  KnowledgeBase: KnowledgeBase,
  Challenge: Challenge,
  Question: Question
}
