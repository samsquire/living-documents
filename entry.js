var $ = require('jquery');
require('./app/styles/styles.css');
require('./node_modules/semantic-ui/dist/semantic.min.css');
require('./node_modules/semantic-ui/dist/semantic.min.js');
window.ko = require('./app/vendor/knockout-3.4.0.js');
// require('./node_modules/historyjs/scripts/bundled/html4+html5/jquery.history.js');
/*, './node_modules/historyjs/scripts/bundled/html4+html5/jquery.history.js' */

require('./node_modules/pagerjs/pager.js');
require(['./app/main', './app/vendor/jsoneditor.min.js'],
function(appViewModel, _JSONEditor) {

    // pager.Href5.history = History;
    // pager.useHTML5history = true;
    pager.Href.hash = "#"; 

    console.log("init");
    $(document).ready(function () {

    var viewModel = new appViewModel()

    pager.extendWithPage(viewModel);

    ko.applyBindings(viewModel);
    pager.start();

    console.log(JSONEditor);

    $('.ui.search')
        .search({
//          source: [{title: "i like"}],
          apiSettings: {
            url:
            'http://localhost:5000/search/?query={query}'
          },
          searchFields   : [
            'title'
          ],
          searchFullText: false
        })
      ;




      
      /*
      new JSONEditor(document.getElementById('editor'), {
         schema: {
            type: "array",
            format: "tabs",
            title: "Jobs",
            items: {
              title: "job",  
              type:
                {
                  type: "object",
                  properties: {
                    employer: {
                      description: "Who are you employed by?",
                      type: "string"
                    },
                    address: {
                      type: "string"
                    },
                    annualSalary: {
                      type: "integer"
                    }
                  }
                }
              
            }
          }
      }); 
      */

    });
});
