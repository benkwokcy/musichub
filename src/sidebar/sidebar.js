let pickedCommitColor = "#166ef3";
let defaultCommitColor = "#ca0914";
const git = require("simple-git");
var fs = require("fs");
var path = require("path");

const remote = require("electron").remote;
const app = remote.app;

let commitCount = 0;
let commitArray = [];
let config = {};

require("../node_modules/gitgraph.js/build/gitgraph.js");
let opensheetmusicdisplay = require("../node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js");

fs.readFile(
  path.normalize(app.getPath("appData") + "/musichub/configuration.json"),
  "utf8",
  function(err, content) {
    config = JSON.parse(content);
    git(config.scorePath).log({ file: config.lastScore }, (err, log) => {
      if (log !== null) {
        let commitsJSON = {};
        commitsJSON.commits = log.all.map(x => {
          return {
            sha: x.hash,
            author: x.author_name + " <" + x.author_email + ">",
            date: x.date,
            message: x.message
          };
        });

        commitCount = log.total;
        let commits = commitsJSON.commits;
        var config = {
          template: "blackarrow", // could be: "blackarrow" or "metro" or `myTemplate` (custom Template object)
          reverseArrow: true, // to make arrows point to ancestors, if displayed
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
            date: commits[i].date,
            messageHashDisplay: false,
            messageAuthorDisplay: false,
            messageBranchDisplay: false,
            messageDisplay: true,
            dotStrokeColor: pickedCommitColor,
            dotColor: pickedCommitColor,
            onClick: handleCommitClick
          });
        }
      }
    });
  }
);

function handleCommitClick(commit) {
  if (commitIsInArray(commit, commitArray)) {
    removeCommitFromArray(commit, commitArray);
  } else {
    if (commitArray.length >= 2) {
      alert("Already choose two commits!");
      return;
    } else {
      commitArray.push(commit);
    }
  }

  commit.messageAuthorDisplay = false;
  commit.messageDisplay = false;
  if (commit.dotColor === pickedCommitColor) {
    commit.dotColor = defaultCommitColor;
    commit.dotStrokeColor = defaultCommitColor;
  } else {
    commit.dotColor = pickedCommitColor;
    commit.dotStrokeColor = pickedCommitColor;
  }
  commit.render();
  console.log("You just clicked this commit.", commit);

  commit.messageAuthorDisplay = true;
  commit.messageDisplay = true;
}

$("#confirmBtn").click(function() {
  if (commitArray.length === 1 && commitCount === 1) {
    document.getElementById("sheetContainer1").innerText = "Empty!";
    document.getElementById("sheetContainer2").innerText =
      commitArray[0].message;
    $(".ui.sidebar").sidebar("toggle");
    return;
  }

  if (commitArray.length < 2) {
    alert("You need to pick two commits to compare!");
    return;
  } else {
    if (commitArray[0].date > commitArray[1].date) {
      let temp = commitArray[0];
      commitArray[0] = commitArray[1];
      commitArray[1] = temp;
    }

    let option1 = commitArray[0].sha1 + ":" + config.lastScore;
    let option2 = commitArray[1].sha1 + ":" + config.lastScore;

    git(config.scorePath).show(option1, function(err, content1) {
      git(config.scorePath).show(option2, function(err, content2) {
        let res = parseMusicXML(content1, content2);
        let osmd1 = new opensheetmusicdisplay.OpenSheetMusicDisplay(
          "sheetContainer1"
        );
        osmd1.load(res.result1).then(function() {
          osmd1.render();
        });
        let osmd2 = new opensheetmusicdisplay.OpenSheetMusicDisplay(
          "sheetContainer2"
        );
        osmd2.load(res.result2).then(function() {
          osmd2.render();
        });
      });
    });

    $(".ui.sidebar").sidebar("toggle");
  }
});

function commitIsInArray(commit, commitArray) {
  for (let i = 0; i < commitArray.length; i++) {
    if (commitArray[i].sha1 === commit.sha1) {
      return true;
    }
  }
  return false;
}

function removeCommitFromArray(commit, commitArray) {
  for (let i = 0; i < commitArray.length; i++) {
    if (commitArray[i].sha1 === commit.sha1) {
      commitArray.splice(i, 1);
      return true;
    }
  }
  return false;
}

document.getElementById("home").addEventListener('click', (event) => {
  $('.ui.wide.sidebar').sidebar('setting', 'transition', 'push').sidebar('setting', 'dimPage', false).sidebar('toggle');
}, false);

document.addEventListener('keyup', (event) => {
  /* g */
  if (event.keyCode === 71) {
    $('.ui.wide.sidebar').sidebar('setting', 'transition', 'push').sidebar('setting', 'dimPage', false).sidebar('toggle');
  }
}, false);

document.getElementById("commitButton").addEventListener("click", (event) => {
  //document.getElementById("nameBox").getAttribute("value")
  //whatever commit is
})