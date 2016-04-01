var levelup = require('levelup');
var async = require('async');
var _ = require('lodash');
var http = require('http');
var fs = require('fs');

var data = {};
var desires = [];

function get(name) {
  data[name] = {};
  return name;
}

function post(data, url, callback) {
      var post_data = JSON.stringify(data);

       var post_options = {
            host: 'localhost',
            port: '5000',
            path: url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };

        // Set up the request
        var post_req = http.request(post_options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (data) {
              callback(null, data);
            });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();
}

function toDependencies(data) {
  return _.map(data, function (value, key) {
    return {
      question: key,
      answer: value
    };
  });

}

function run(job, jobName) {
  var app = require(job);
  console.log(app);
  console.log(data);
  
  var gets = _.map(data, function (value, key) {

    return function getAnswer(previous, answerCallback) {
      var callback = answerCallback;
      var data = previous;
      if (!answerCallback) {
        callback = previous; 
        data = {}
      }
      
      var db = levelup('./db');
      db.get(key, function (err, value) {
        if (value !== undefined) {
          var question = JSON.parse(value);
          data[question.question] = question.answer;
          db.close();
          callback(err, data);
        } else if (err){
          // we have to create a challenge for this information! 
          console.log("saving new challenge", key);
          var newChallenge = {
            questions: [
              {
                question: key,
                answer: 0
              }
            ],
            job: jobName
          }
          db.close();
          post(newChallenge, 'challenges', function (response) {
            callback("done");
          });  
        } else {
          callback("error");
        }
      });
    }

  });


  async.waterfall(gets.concat([
    function (answers, nextCallback) {
      var callback = nextCallback;
      if (!nextCallback) {
        callback = answers; 
        answers = {};
      }
      console.log("all data retrieved", answers);
      var result = app(answers);

      var data = {
        description: "",
        value: result,        
        dependencies: toDependencies(answers) 
      }
      console.log("Saving", data);
      post(data, '/facts', callback);
    },

      function (response, callback) {
          console.log('Response: ' + response);
          callback(null);
      }


  ]), function (error, blah) {
    if (error) {
      console.log("failed", error);
    }
  });



}

module.exports = {
  get: get,
  run: run
}
