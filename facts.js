var levelup = require('levelup');
var async = require('async');
var _ = require('lodash');
var http = require('http');
var fs = require('fs');

var data = {};

function get(id, name) {
  data[id] = name;
  return name;
}

function toDependencies(data) {
  return _.map(data, function (value, key) {
    return {
      question: key,
      answer: value
    };
  });

}

function run(job) {
  var app = require(job);

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
      console.log("fetching", key); 
      db.get(key, function (err, value) {
        var challenge = JSON.parse(value);
        var question = challenge.questions[0];
        data[question.question] = question.answer;
        db.close();
        callback(err, data);
      });
    }

  });


  async.waterfall(gets.concat([
    function (answers, callback) {
      console.log("all data retrieved", answers);
      var result = app(answers);

      var data = {
        description: "",
        value: result,        
        dependencies: toDependencies(answers) 
      }
      console.log("Saving", data);
      var post_data = JSON.stringify(data);

       var post_options = {
            host: 'localhost',
            port: '5000',
            path: '/facts',
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
