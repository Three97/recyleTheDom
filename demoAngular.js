angular.module('demo', [])
  .controller('DemoController', function() {
    var demoTable = this;
    demoTable.data = paintData;
    
  })
  .controller('ButtonController', function() {
        var buttons = this;
        buttons.showAll = function() {
            window.location.assign("file:///C:/dev/infiniteScrollDemo/showAll.html");
        };
        buttons.speedBoost = function() {
            window.location.assign("file:///C:/dev/infiniteScrollDemo/infiniteScrollView.html");
        };
    })