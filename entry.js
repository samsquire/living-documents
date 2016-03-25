require('./app/styles/styles.css');
require('./node_modules/semantic-ui/dist/semantic.min.css');
require(['./app/vendor/knockout-3.4.0.js', './app/main', './app/vendor/jsoneditor.min.js', './app/vendor/jquery-1.12.2.min.js'], function(ko, appViewModel, _JSONEditor, $) {
    $(document).on('ready', function () {

      ko.applyBindings(new appViewModel());
      console.log(JSONEditor);
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

    });
});
