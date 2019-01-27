# MusicHub
A simple graphical version control client for music. 

MusicHub allows you to track your music notation files so you can compare any past versions and instantly see what changes you made. This program supports MusicXML which is supported by all major music notation software, including Sibelius, Finale, and MuseScore.

# Why MusicHub?

## How Version Control Helps Create Better Music

Out of the major music notation programs, only Sibelius has the functionality to track and save versions. Meanwhile, version control, which is considered essential in software development, is unavailable to musicians who write their music in Finale, MuseScore, and Dorico. As a result, many professional musicians resort to version-stamping their file names. 

The result is this:

```
MyScore1.xml
MyScore2.xml
MyScore3.xml
MyScore4.xml
...
```

With this system, there is no easy way to check the differences between these files, especially as the version numbers grow very large. This makes an already monumental task even more frustrating and difficult. As it 

We address this solution by developing a graphical music version control client and visual musical diff tool. When designing this, we took the models used by GitHub and Git and focused on offering the key benefits of these tools without requiring any knowledge of Git.

We chose to focus on native support of MusicXML which is the open-source standard for music exchange and is analogous to HTML and JSON. As all major music notation programs support this format, we aim for the benefits of MusicHub to be accessible to as many people as possible. By allowing composers to more easily create their work, we hope to bring more music into this world and help to bring people together through music.

## Designing A MusicXML Diff Algorithm

# Getting Started

This application uses [Electron-Forge](https://electronforge.io/) for building and packaging.

To run locally:

```javascript
npm install -g electron-forge
cd musichub
electron-forge start
```

# Usage
1. Install and run MusicHub. You will be prompted to set up a MusicHubScores folder.
2. Write music in your favorite music notation software and save it as uncompressed MusicXML in the MusicHubScores folder.
3. Select your file in MusicHub.
4. Save new versions of your file and compare past versions in the sidebar!

# Team
| <img src="https://avatars2.githubusercontent.com/u/11649092?s=460&v=4" width="144" /> | <img src="https://avatars0.githubusercontent.com/u/38742521?s=460&v=4" width="144" /> | <img src="https://avatars3.githubusercontent.com/u/32286298?s=460&v=4" width="144" /> | <img src="https://avatars2.githubusercontent.com/u/11417?s=460&v=4" width="144" /> |
| --- | --- | --- | --- |
| [Chauncey Liu](https://github.com/ChaunceyKiwi) | [James Zang](https://github.com/jameszang) | [Benjamin Kwok](https://github.com/benkwokcy) | [Samson Tsui](https://github.com/tsuiswz) 

# Attributions
<div>Icons made by <a href="https://www.flaticon.com/authors/popcorns-arts" title="Icon Pond">Icon Pond</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" 			    title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
