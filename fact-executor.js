var facts = require('./facts.js');

var jobName = process.argv[2];
console.log(jobName);

var path = './jobs/' + jobName + '.js';
console.log(path);
facts.run(path, jobName);
