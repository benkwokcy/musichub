let pickedCommitColor = "#166ef3";
let defaultCommitColor = "#ca0914";
const git = require("simple-git");
var fs = require("fs");
var path = require("path");

let commitCount = 0;
let commitArray = [];

require("../node_modules/gitgraph.js/build/gitgraph.js");

fs.readFile(path.resolve(__dirname, './configuration.json'), 'utf8', function(err, content) {
  let config = JSON.parse(content);
  git(config.scorePath).log({file: config.lastScore}, (err, log) => {
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
        onClick: handleCommitClick,
      });
    }
  });
});

function handleCommitClick(commit) {
  if (commitIsInArray(commit, commitArray)) {
    removeCommitFromArray(commit, commitArray);
  } else {
    if (commitArray.length >= 2) {
      alert('Already choose two commits!');
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
    document.getElementById('sheetContainer1').innerText = "Empty!";
    document.getElementById('sheetContainer2').innerText = commitArray[0].message;
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

    document.getElementById('sheetContainer1').innerText = commitArray[0].message;
    document.getElementById('sheetContainer2').innerText = commitArray[1].message;

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

document.addEventListener(
  "keyup",
  event => {
    /* g */
    if (event.keyCode === 71) {
      $(".ui.sidebar").sidebar("toggle");
    }
  },
  false
);
