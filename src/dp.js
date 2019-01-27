"use strict";
// Constants
var COLOR_GREEN = '#79c66b';
var COLOR_RED = '#ff5454';
var DECREASING_C_MAJOR_SCALE = ['B', 'A', 'G', 'F', 'E', 'D', 'C'];
// Pitch class, used by Note class
var Pitch = /** @class */ (function () {
    function Pitch(step, octave, alter) {
        this.step = step;
        this.octave = octave;
        this.alter = alter;
    }
    Pitch.prototype.equal = function (other) {
        if (other === null) {
            return this === null;
        }
        else {
            return (this.step === other.step &&
                this.octave === other.octave &&
                this.alter === other.alter);
        }
    };
    return Pitch;
}());
// Represents a single Note
var Note = /** @class */ (function () {
    function Note(pitch, duration, stem, treeObjRef) {
        this.pitch = pitch;
        this.duration = duration;
        this.stem = stem;
        this.treeObjRef = treeObjRef;
    }
    Note.prototype.equal = function (other) {
        if ((this.pitch !== null && other.pitch === null) ||
            (this.pitch === null && other.pitch !== null)) {
            return false;
        }
        else {
            return (((this.pitch === null && other.pitch === null) ||
                this.pitch.equal(other.pitch)) &&
                this.duration === other.duration &&
                this.stem === other.stem);
        }
    };
    return Note;
}());
/* Chord: 1+ notes played at the same time in the same staff.*/
var Chord = /** @class */ (function () {
    function Chord(note) {
        this.notes = [note];
    }
    Chord.prototype.equal = function (other) {
        if (this.notes.length !== other.notes.length) {
            return false;
        }
        else {
            return this.notes.sort(compareNotes).every(function (value, index) { return value.equal(other.notes.sort(compareNotes)[index]); });
        }
    };
    return Chord;
}());
// Custom comparator for Notes (specifically, orders by descending pitch)
//  Primary comparison: octave (higher octave = higher pitch)
//  Secondary comparison: step (B–A–G–F–E–D-C) from https://en.m.wikipedia.org/wiki/Scale_(music)#Background
//  Tertiary comparison: alter (+1 ordered first, then null, then -1)
// If all comparisons are the same then the notes are considered the same
function compareNotes(a, b) {
    if (a.pitch.octave > b.pitch.octave) { // a's octave higher
        return -1;
    }
    else if (b.pitch.octave > a.pitch.octave) { // b's octave higher
        return 1;
    }
    else { // octaves same
        if (DECREASING_C_MAJOR_SCALE.indexOf(a.pitch.step) < DECREASING_C_MAJOR_SCALE.indexOf(b.pitch.step)) { // a's step higher
            return -1;
        }
        else if (DECREASING_C_MAJOR_SCALE.indexOf(b.pitch.step) < DECREASING_C_MAJOR_SCALE.indexOf(a.pitch.step)) { // b's step higher
            return 1;
        }
        else { // steps same
            var alterOfA = a.pitch.alter === null ? 0 : a.pitch.alter;
            var alterOfB = b.pitch.alter === null ? 0 : b.pitch.alter;
            if (alterOfA === alterOfB) { // alters same
                return 0;
            }
            else {
                return alterOfA > alterOfB ? -1 : 1;
            }
        }
    }
}
// Given a parent object and a name, return the index of the first child object with that name
function findChildIndexWithName(parent, name) {
    var child = -1;
    for (var i = 0; i < parent["elements"].length; i++) {
        if (parent["elements"][i].name === name) {
            child = i;
            break;
        }
    }
    return child;
}
// Given a parent object and a name, return the number of children objects with that name
function numChildrenWithName(parent, name) {
    var num = 0;
    for (var i = 0; i < parent["elements"].length; i++) {
        if (parent["elements"][i].name === name) {
            num++;
        }
    }
    return num;
}
// From a JSON tree, extracts and returns all the chords (and by extension, all the notes)
function parseTree(tree) {
    // find "score-partwise" element
    var scorePartwiseIndex = findChildIndexWithName(tree, "score-partwise");
    var scorePartwise = tree["elements"][scorePartwiseIndex];
    var chordArray = [];
    var lastAdded;
    var indexOfFirstPart = findChildIndexWithName(scorePartwise, "part");
    var numParts = numChildrenWithName(scorePartwise, "part");
    for (var partNum = 0; partNum < numParts; partNum++) {
        var part = scorePartwise["elements"][indexOfFirstPart + partNum];
        for (var i = 0; i < part["elements"].length; i++) { // ASSUMES a part contains nothing but measures
            var measure = part["elements"][i];
            var indexOfFirstNote = findChildIndexWithName(measure, "note");
            var stopIndex = numChildrenWithName(measure, "note");
            for (var j = 0; j < stopIndex; j++) {
                var note = measure["elements"][indexOfFirstNote + j];
                if (note["name"] !== "note") { // it is possible that there are elements between notes, such as barlines. Skip these
                    stopIndex++;
                    continue;
                }
                var pitch = void 0;
                if (findChildIndexWithName(note, "pitch") === -1) {
                    pitch = null;
                }
                else {
                    var pitchJS = note["elements"][findChildIndexWithName(note, "pitch")];
                    var step = pitchJS["elements"][findChildIndexWithName(pitchJS, "step")]["elements"][0]["text"];
                    var octave = pitchJS["elements"][findChildIndexWithName(pitchJS, "octave")]["elements"][0]["text"];
                    var alterIndex = findChildIndexWithName(pitchJS, "alter");
                    var alter = (alterIndex === -1 ? 0 : pitchJS["elements"][alterIndex]["elements"][0]["text"]); // TO CHECK
                    pitch = new Pitch(step, octave, alter);
                }
                var duration = (findChildIndexWithName(note, "grace") === -1 ? note["elements"][findChildIndexWithName(note, "duration")]["elements"][0]["text"] : 0); // if grace note, assign duration 0
                var stem = (findChildIndexWithName(note, "stem") === -1 ? null : note["elements"][findChildIndexWithName(note, "stem")]["elements"][0]["text"]);
                var noteObj = new Note(pitch, duration, stem, note);
                if (findChildIndexWithName(note, "chord") !== -1) {
                    lastAdded.notes.push(noteObj);
                }
                else {
                    var chordObj = new Chord(noteObj);
                    lastAdded = chordObj;
                    chordArray.push(chordObj);
                }
            }
        }
    }
    return chordArray;
}
/*
  Reads two musicxml files, converts them to JSON trees, parses the trees for chords (and by extension, notes), and finds
    any differences between them. returns a hash of arrays. Arrays come in pairs-- removals (elements removed from xmlFile1)
    and additions (elements added to xmlFile2). There is a pair of arrays for every type of element.

  Elements diffed so far:
    - Chords (including all Notes)
*/
function parseMusicXML(xml1, xml2) {
    var result1 = xml2js(xml1, { nativeType: true, ignoreComment: true });
    var result2 = xml2js(xml2, { nativeType: true, ignoreComment: true });
    var chords1 = parseTree(result1);
    var chords2 = parseTree(result2);
    var diffs = DP(chords1, chords2);
    for (var i = 0; i < diffs.additions.length; i++) {
        var chord = diffs.additions[i];
        for (var j = 0; j < chord.notes.length; j++) {
            if (chord.notes[j].treeObjRef["attributes"] === undefined) {
                chord.notes[j].treeObjRef["attributes"] = { "color": COLOR_GREEN };
            }
            else {
                chord.notes[j].treeObjRef["attributes"]["color"] = COLOR_GREEN;
            }
        }
    }
    for (var i = 0; i < diffs.removals.length; i++) {
        var chord = diffs.removals[i];
        for (var j = 0; j < chord.notes.length; j++) {
            if (chord.notes[j].treeObjRef["attributes"] === undefined) {
                chord.notes[j].treeObjRef["attributes"] = { "color": COLOR_RED };
            }
            else {
                chord.notes[j].treeObjRef["attributes"]["color"] = COLOR_RED;
            }
        }
    }
    return { "result1": js2xml(result1, { spaces: 1 }), "result2": js2xml(result2, { spaces: 1 }) };
}
function DP(chords1, chords2) {
    var diffs = { removals: [], additions: [] };
    var m = chords1.length;
    var n = chords2.length;
    /* Create a two dimension array-- named 'opt' for 'optimal', as in optimal solution */
    var opt = new Array(m + 1);
    for (var i_1 = 0; i_1 < opt.length; i_1++) {
        opt[i_1] = new Array(n + 1);
    }
    for (var i_2 = 0; i_2 <= m; i_2++) {
        for (var j_1 = 0; j_1 <= n; j_1++) {
            if (i_2 === 0 || j_1 === 0) {
                opt[i_2][j_1] = 0;
            }
            else if (chords1[i_2 - 1].equal(chords2[j_1 - 1])) {
                opt[i_2][j_1] = opt[i_2 - 1][j_1 - 1] + 1;
            }
            else {
                opt[i_2][j_1] = Math.max(opt[i_2 - 1][j_1], opt[i_2][j_1 - 1]);
            }
        }
    }
    var index = opt[m][n];
    var lcs = new Array(index); // longest common subsequence
    var i = m;
    var j = n;
    while (i > 0 && j > 0) {
        if (chords1[i - 1].equal(chords2[j - 1])) {
            lcs[index - 1] = chords1[i - 1];
            i--;
            j--;
            index--;
        }
        else if (opt[i - 1][j] > opt[i][j - 1]) {
            i--;
        }
        else {
            j--;
        }
    }
    index = opt[m][n];
    var idx = 0; // index for lcs
    for (var i_3 = 0; i_3 < chords1.length; i_3++) { //index for chords1
        if (idx >= index || !chords1[i_3].equal(lcs[idx])) {
            diffs.removals.push(chords1[i_3]);
        }
        else {
            idx++;
        }
    }
    idx = 0; // index for lcs
    for (var i_4 = 0; i_4 < chords2.length; i_4++) { //index for chords2
        if (idx >= index || !chords2[i_4].equal(lcs[idx])) {
            diffs.additions.push(chords2[i_4]);
        }
        else {
            idx++;
        }
    }
    return diffs;
}
