let pickedCommitColor = "#166ef3";
let defaultCommitColor = "#ca0914";
const git = require('simple-git');

require('../node_modules/gitgraph.js/build/gitgraph.js')
git("/Users/Chauncey/Workspace/my-resume").log(
  (err, log) => {
    let commitsJSON = {};
    commitsJSON.commits = log.all.map(x => {
      return {
        sha: x.hash,
        author: x.author_name + " <" + x.author_email + ">",
        date: x.date,
        message: x.message
      };
    });
    
    let commits = commitsJSON.commits;
    var config = {
      template: "blackarrow", // could be: "blackarrow" or "metro" or `myTemplate` (custom Template object)
      reverseArrow: false, // to make arrows point to ancestors, if displayed
      orientation: "vertical",
      initCommitOffsetX: -20,
      initCommitOffsetY: -20
    };
    let gitGraphObj = new window.GitGraph(config);

    // Create branch named "master"
    var master = gitGraphObj.branch("master");

    for (let i = 0; i < commits.length; i++) {
      gitGraphObj.commit({
        sha1: commits[i].sha,
        message: commits[i].message,
        author: commits[i].author,
        messageHashDisplay: false,
        messageAuthorDisplay: false,
        messageBranchDisplay: false,
        messageDisplay: true,
        dotStrokeColor: pickedCommitColor,
        dotColor: pickedCommitColor,
        onClick: function(commit) {
          commit.messageAuthorDisplay = false;
          commit.messageDisplay = false;
          if (commit.dotColor === pickedCommitColor) {
            commit.dotColor = defaultCommitColor;
            commit.dotStrokeColor = defaultCommitColor;
          } else {
            commit.dotColor = pickedCommitColor;
            commit.dotStrokeColor = pickedCommitColor;
          }
          console.log("You just clicked this commit.", commit);
          commit.render();
        }
      });
    }
  }
);

document.addEventListener('keyup', (event) => {
  /* g */
  if (event.keyCode === 71) {
    $('.ui.sidebar').sidebar('toggle');
  }
}, false);