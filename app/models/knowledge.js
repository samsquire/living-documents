
function RepositoryKnowledgeBase(data) {
  this.name = data.name;
  this.author = data.author;
  this.description = data.description;
  this.installing = ko.observable(false);
  this.installed = ko.observable(false);
}
function KnowledgeBase(data) {
  this.name = data.name;
  this.challenges = data.challenges;
  this.completedChallenges = data.completedChallenges;
  this.completedness = (this.completedChallenges / this.challenges) * 100
  this.author = data.author;
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
