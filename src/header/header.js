const {dialog} = require("electron").remote;

$('#currentFile').ready(() => {
  let configFilePath = require('path').normalize(remote.app.getPath("appData") + "/musichub/configuration.json");
  let config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
  let fileName = "No file selected"
  if (config.lastScore) {
    let path = config.lastScore;
    fileName = path.replace(/^.*[\\\/]/, '');
  }
  $('#currentFile').html(fileName);
})

$('#headerButton').click(() => {
  let path = dialog.showOpenDialog({
    defaultPath: require('path').normalize(remote.app.getPath("documents") + "/MusicHubScores"),
    properties: ['openFile']
  })[0];
  let configFilePath = require('path').normalize(remote.app.getPath("appData") + "/musichub/configuration.json");
  let config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
  config.lastScore = path;
  fs.writeFileSync(configFilePath, JSON.stringify(config));
  let fileName = path.replace(/^.*[\\\/]/, '');
  $('#currentFile').html(fileName);
  renderGitGraph();
});