
function RepositoryKnowledgeBase(data) {
  this.name = data.name;
  this.author = data.author;
  this.description = data.description;
}
function KnowledgeBase(data) {
  this.name = data.name;
  this.challenges = data.challenges;
  this.completedChallenges = data.completedChallenges;
  this.completedness = (this.completedChallenges / this.challenges) * 100
  this.author = data.author;
}

module.exports = {
  RepositoryKnowledgeBase: RepositoryKnowledgeBase,
  KnowledgeBase: KnowledgeBase
}
