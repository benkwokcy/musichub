let pickedCommitColor = "#166ef3";
let defaultCommitColor = "#ca0914";
let newCommitColor = "#b4881d";
const git = require("simple-git");
var fs = require("fs");

const remote = require("electron").remote;
const app = remote.app;

let commitCount = 0;
let commitArray = [];
let config = {};
let newChangeExist = false;

require("../node_modules/gitgraph.js/build/gitgraph.js");
let opensheetmusicdisplay = require("../node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js");

renderGitGraph();

function renderGitGraph() {
  let configurationFilePath = require("path").normalize(
    app.getPath("appData") + "/musichub/configuration.json"
  );
  fs.readFile(configurationFilePath, "utf8", function(err, content) {
    config = JSON.parse(content);

    if (config.lastScore === undefined) {
      document.getElementById("bigSidebar").innerText =
        "You need to set up score to track";
      return;
    } else {
      git(config.scorePath).log({ file: config.lastScore }, (err, log) => {
        git(config.scorePath).diff(["--name-only"], (err, diffLog) => {
          let gitGraphObj = new window.GitGraph({
            template: "blackarrow", // could be: "blackarrow" or "metro" or `myTemplate` (custom Template object)
            reverseArrow: true, // to make arrows point to ancestors, if displayed
            orientation: "vertical",
            initCommitOffsetX: -20,
            initCommitOffsetY: -20
          });

          // Create branch named "master"
          var master = gitGraphObj.branch("master");

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

            if (diffLog.includes(require("path").basename(config.lastScore))) {
              newChangeExist = true;
              gitGraphObj.commit({
                message: "You have new changes to save!",
                messageHashDisplay: false,
                messageAuthorDisplay: false,
                messageBranchDisplay: false,
                messageDisplay: true,
                dotStrokeColor: newCommitColor,
                dotColor: newCommitColor
              });
            }

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
          } else {
            newChangeExist = true;
            gitGraphObj.commit({
              message: "You have new changes to save!",
              messageHashDisplay: false,
              messageAuthorDisplay: false,
              messageBranchDisplay: false,
              messageDisplay: true,
              dotStrokeColor: newCommitColor,
              dotColor: newCommitColor
            });
          }
        });
      });
    }
  });
}

function handleCommitClick(commit) {
  if (commitIsInArray(commit, commitArray)) {
    removeCommitFromArray(commit, commitArray);
  } else {
    if (commitArray.length >= 2) {
      alert("You've already selected two versions!");
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
  console.log("You've just clicked this version.", commit);

  commit.messageAuthorDisplay = true;
  commit.messageDisplay = true;
}

$("#confirmBtn").click(function(event) {
  if (commitArray.length === 1 && commitCount === 1) {
    document.getElementById("sheetContainer1").innerText = "Empty!";
    git(config.scorePath).show(
      commitArray[0].sha1 + ":" + require("path").basename(config.lastScore),
      function(err, content) {
        let osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(
          "sheetContainer2"
        );
        osmd.load(content).then(function() {
          osmd.render();
        });
      }
    );

    $(".ui.sidebar").sidebar("toggle");
  }

  else if (commitArray.length === 1 && newChangeExist) {
    git(config.scorePath).show(
      commitArray[0].sha1 + ":" + require("path").basename(config.lastScore),
      function(err, content1) {
        fs.readFile(config.lastScore, "utf8", (error, content2) => {
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
      }
    );
  }

  else if (commitArray.length < 2) {
    alert("You need to select two versions to compare!");
    return;
  } else {
    if (commitArray[0].date > commitArray[1].date) {
      let temp = commitArray[0];
      commitArray[0] = commitArray[1];
      commitArray[1] = temp;
    }

    let option1 =
      commitArray[0].sha1 + ":" + require("path").basename(config.lastScore);
    let option2 =
      commitArray[1].sha1 + ":" + require("path").basename(config.lastScore);

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

document.getElementById("commitButton").addEventListener("click", () => {
  let descriptionBox = document.getElementById("descriptionBox");
  let message = descriptionBox.value;
  if (newChangeExist && message.length > 0) {
    git(config.scorePath).add(config.lastScore).commit(message, () => {
      newChangeExist = false;
      renderGitGraph();
    });
  } else {
    if (!newChangeExist) {
      alert("No change is available yet!");
    } else if (!Boolean(message)) {
      alert("Enter a description of your changes!");
    }
  }
});

document.getElementById("home").addEventListener(
  "click",
  event => {
    $(".ui.wide.sidebar")
      .sidebar("setting", "transition", "push")
      .sidebar("setting", "dimPage", false)
      .sidebar("toggle");
  },
  false
);
