/**
 * Static class for the management of levels in FinchBlox
 */
function LevelManager() {
  const LM = LevelManager;
  LM.currentLevel = 1 //Hatchling ? 3 : 1;
  LM.fileListRetreived = false;
  LM.filesSavedLocally = [];
  LM.levelFileList = null;
  LM.checkSavedFiles();
}

LevelManager.setConstants = function() {
  const LM = LevelManager;
  LM.totalLevels = 3;
  LM.levelButtonFont = Font.uiFont(35);

  LM.savePointFileNames = {
    1: "FinchBloxSavePoint_Level1",
    2: "FinchBloxSavePoint_Level2",
    3: "FinchBloxSavePoint_Level3"
  }
  if (Hatchling) {
    LM.savePointFileNames = {
      1: "HatchlingSavePoint_Level1",
      2: "HatchlingSavePoint_Level2",
      3: "HatchlingSavePoint_Level3"
    }
  }

  //Suffixes must be 2 characters to show correctly in FBFileSelect
  LM.fileLevelSuffixes = {
    1: "_1",
    2: "_2",
    3: "_3"
  }
}

LevelManager.setLevel = function(level) {
  const LM = LevelManager;
  level = parseInt(level);
  //console.log("Setting level to " + level);
  if (LM.currentLevel != level) {
    LM.currentLevel = level;
    GuiElements.blockInteraction();
    //SaveManager.userClose(); //necessary? maybe add callback?
    BlockPalette.setLevel();
    //TabManager.activeTab.clear();
    TitleBar.levelButton.addText(level, LM.levelButtonFont, Colors.white);
    //LM.loadLevelSavePoint();
    if (Hatchling) { TitleBar.levelButton.setSwitch(level) }
  }
}

/**
 * Checks what files are available in the backend
 */
LevelManager.checkSavedFiles = function() {
  HtmlServer.sendRequestWithCallback("data/files", function(response) {
    //console.log("getSavedFiles response: " + response);
    const fileList = new FileList(response);
    LevelManager.filesSavedLocally = fileList.localFiles;
    LevelManager.fileListRetreived = true;
    LevelManager.levelFileList = {
      1: [],
      2: [],
      3: []
    }

    fileList.localFiles.forEach(function(file) {
      //console.log(file);
      const suffix = file.split("_").pop();
      if (LevelManager.levelFileList[suffix]) {
        LevelManager.levelFileList[suffix].push(file);
      }
    })
    //console.log(LevelManager.levelFileList);
  }, function() {
    GuiElements.alert("Error retrieving saved files");
  });
}


LevelManager.loadLevelSavePoint = function() {
  const LM = LevelManager;
  GuiElements.blockInteraction();
  const levelFileName = LM.savePointFileNames[LM.currentLevel];
  console.log("loadLevelSavePoint for level " + LM.currentLevel + ": " + levelFileName);
  if (!LM.fileListRetreived) {
    setTimeout(function() {
      LevelManager.loadLevelSavePoint();
    }, 200);
    return;
  }
  if (LM.filesSavedLocally.indexOf(levelFileName) === -1) {
    //console.log("file '" + levelFileName + "' not found. Must create...");
    const request = new HttpRequestBuilder("data/new");
    request.addParam("filename", levelFileName);
    if (GuiElements.isIos) {
      SaveManager.loadBlank();
    }
    HtmlServer.sendRequestWithCallback(request.toString(), function() {
      LevelManager.filesSavedLocally.push(levelFileName);
      //console.log("file " + levelFileName + " added to list");
      if (!GuiElements.isIos) {
        SaveManager.userOpenFile(levelFileName);
      }
    }, null, true, SaveManager.emptyProgData);
  } else {
    SaveManager.userOpenFile(levelFileName);
  }
  /*if (LD.filesMissing == 0) {
    SaveManager.userOpenFile(LD.savePointFileNames[LD.currentLevel]);
  } else {
    console.log("files missing = " + LD.filesMissing);
  }*/

}


/**
 * LevelManager.saveAs - Saves the currently open level save point file as a
 * named file that will appear in the file list.
 *
 * @param  {string} name name to give this file
 * @param {boolean} rename rename a currently saved file if true
 */
LevelManager.saveAs = function(name, rename) {
  const LM = LevelManager
  const currentFile = SaveManager.fileName;
  const currentLevelFile = LM.savePointFileNames[LM.currentLevel];
  const fileName = name.trim() + LM.fileLevelSuffixes[LM.currentLevel];
  //Check to be sure the current level save point is the file that is open
  if (currentFile != currentLevelFile && !rename) {
    console.error("Tried to rename file with " + SaveManager.fileName + " open instead of " + currentLevelFile);
    return;
  }
  //console.log("Rename " + currentLevelFile + " to " + fileName);
  GuiElements.blockInteraction();
  //console.log("Rename " + currentFile + " to " + fileName);
  //SaveManager.sanitizeRename(false, currentLevelFile, "", fileName, function () {
  SaveManager.sanitizeRename(false, currentFile, "", fileName, function() {
    LM.checkSavedFiles()
    //console.log("Renamed " + currentLevelFile + " to " + fileName);
    //console.log("Renamed " + currentFile + " to " + fileName);
    //console.log(LM.filesSavedLocally);
    TitleBar.fileBn.update();
    if (GuiElements.isAndroid) {
      GuiElements.unblockInteraction();
    }
  });
}

LevelManager.openFile = function(fileName) {
  const fileLevel = fileName.slice(-1);
  //console.log("User selected to open " + fileName + " on level " + fileLevel);
  if (!(fileLevel > 0 && fileLevel <= LevelManager.totalLevels)) {
    console.error("Unsupported level  " + fileLevel);
    return;
  }
  GuiElements.blockInteraction();
  LevelManager.setLevel(fileLevel);
  SaveManager.userOpenFile(fileName);
}

LevelManager.userDeleteFile = function(fileName) {
  /*if (fileName == SaveManager.fileName) {
    LevelManager.loadLevelSavePoint();
  }*/
  let deletingCurrentFile = (fileName == SaveManager.fileName)
  GuiElements.blockInteraction();
  for (let i = 0; i < LevelManager.filesSavedLocally.length; i++) {
    if (LevelManager.filesSavedLocally[i] == fileName) {
      LevelManager.filesSavedLocally.splice(i, 1);
    }
  }
  SaveManager.delete(false, fileName);
  if (!deletingCurrentFile) GuiElements.unblockInteraction();
}
