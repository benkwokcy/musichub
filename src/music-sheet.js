var fs = require('fs');
var path = require("path");
let opensheetmusicdisplay = require("../node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js");

fs.readFile(path.resolve(__dirname, './sample/riverflowsinyou.musicxml'), 'utf8', function(err, content) {
  let osmd1 = new opensheetmusicdisplay.OpenSheetMusicDisplay(
    "sheetContainer1"
  );
  osmd1.load(content).then(function() {
    osmd1.render();
  });
});

fs.readFile(path.resolve(__dirname, './sample/riverflowsinyou.musicxml'), 'utf8', function(err, content) {
  let osmd2 = new opensheetmusicdisplay.OpenSheetMusicDisplay(
    "sheetContainer2"
  );
  osmd2.load(content).then(function() {
    osmd2.render();
  });
});