app.Visible = false;
var config = {};
getConfigFromEnv();
app.displayDialogs = DialogModes.NO;

function registerSessionAction() {
  $.setenv("resize-session", new Date());
}

function clearSessionCount() {
  $.setenv("count-session", 0);
}

function incrementSessionCount() {
  $.setenv("count-session", parseInt($.getenv("count-session")) + 1);
}

function getSessionCount() {
  return $.getenv("count-session");
}

function timeSinceLastSessionAction() {
  return new Date() - new Date($.getenv("resize-session"));
}

function getConfigFromDialog() {
  var settings = setupWindow();
  config.title = settings["title"].text.toString();
  config.screenshot = settings["screenshot"].value;
  config.year = settings["year"].text.toString();
  config.inventory = settings["catnum"].text.toString();
  config.attr = settings["attr"].text.toString();
  config.db = settings["db"].value;
  config.press = settings["press"].value;
  config.web = settings["web"].value;
  setConfigFromEnv();
}

function toHandle(text) {
  return text.toLowerCase().replace(/ /g, "-");
}

function constructFileName(kind, hash) {
  $.writeln(
    toHandle(config.title) +
      "-" +
      config.year +
      "-" +
      config.inventory +
      "-" +
      kind +
      "-" +
      config.attr +
      "-" +
      "-" +
      hash +
      (kind !== "press" ? ".jpg" : ".tif")
  );
  return (
    toHandle(config.title) +
    "-" +
    config.year +
    "-" +
    config.inventory +
    "-" +
    kind +
    "-" +
    config.attr +
    "-" +
    "-" +
    hash +
    (kind !== "press" ? ".jpg" : ".tif")
  );
}

function getConfigFromEnv() {
  if ($.getenv("title")) {
    config.title = $.getenv("title");
    config.screenshot = $.getenv("screenshot");
    config.year = $.getenv("year");
    config.inventory = $.getenv("inventory");
    config.db = $.getenv("db");
    config.web = $.getenv("web");
    config.attr = $.getenv("attr");
    config.press = $.getenv("press");
  } else {
    config = {};
  }
}

function setConfigFromEnv() {
  $.setenv("title", config.title);
  $.setenv("screenshot", config.screenshot);
  $.setenv("year", config.year);
  $.setenv("inventory", config.inventory);
  $.setenv("web", config.web);
  $.setenv("attr", config.attr);
  $.setenv("db", config.db);
  $.setenv("press", config.press);
}

function setupWindow() {
  clearSessionCount();
  var w = new Window("dialog", "Arcangel Studio Image Resizer Wizard", [
    0,
    0,
    480,
    170
  ]);
  w.info = w.add(
    "statictext",
    [205, 43, 485, 110],
    "This wizard saves files in Desktop/RESIZED. \n"
  );
  w.info.hide();
  w.cancel = false;
  var showingNumber = false;
  var leftGutter = 15;
  //var thefile = File.saveDialog("Select the 'images' ");
  w.add(
    "statictext",
    [leftGutter, 15, 190, 35],
    "Artwork or Exhibition Title:"
  );
  w.title = w.add(
    "edittext",
    [178, 15, 360, 35],
    config.title ? config.title : "artwork-title"
  );
  w.add("statictext", [leftGutter, 45, 125, 65], "Year and/or Inv. #:");
  var inventoryFieldXOffset = 30;
  w.year = w.add(
    "edittext",
    [inventoryFieldXOffset + 100, 45, inventoryFieldXOffset + 150, 65],
    config.year ? config.year : new Date().getFullYear()
  );
  //w.year.value = new Date().getFullYear();
  w.add(
    "statictext",
    [inventoryFieldXOffset + 153, 45, inventoryFieldXOffset + 165, 65],
    "-"
  );
  w.catnum = w.add(
    "edittext",
    [inventoryFieldXOffset + 165, 45, inventoryFieldXOffset + 200, 65],
    config.inventory ? config.inventory : "XX"
  );
  //w.catnum.value = "XX";
  w.screenshot = w.add("checkbox", [165, 75, 225, 100], "Screenshot?");
  //w.screenshot.value = false;
  w.add("statictext", [leftGutter, 110, 170, 130], "Generate:");
  w.add("statictext", [leftGutter, 75, 110, 100], "Photographer:");
  w.attr = w.add("edittext", [110, 75, 160, 100], "ih");
  w.db = w.add("checkbox", [leftGutter, 140, 110, 160], "Database?");
  w.db.value = config.db ? config.db : true;
  w.press = w.add("checkbox", [110, 140, 180, 160], "Press?");
  w.press.value = config.press ? config.press : true;
  w.web = w.add("checkbox", [180, 140, 230, 160], "Web?");
  w.web.value = config.web ? config.web : true;
  w.center();
  w.ok = w.add("button", [350, 140, 410, 160], "OK", {
    name: "ok"
  });
  w.infoButton = w.add("button", [420, 10, 450, 20], "about", {
    name: "about"
  });
  w.cancelButton = w.add("button", [405, 140, 470, 160], "CANCEL", {
    name: "cancel"
  });
  w.infoButton.onClick = function() {
    if (!w.info.visible) w.info.show();
    else w.info.hide();
  };
  w.result = w.show();
  return w;
}

function logConfig() {
  for (c in config) {
    $.writeln(c + ": " + config[c]);
  }
}
var sessionCount = getSessionCount();
$.writeln(timeSinceLastSessionAction());
if (timeSinceLastSessionAction() > 5000) {
  $.writeln("new session, opening window.");
  getConfigFromDialog();
  logConfig();
}
$.writeln("processing image now");
var doc = app.activeDocument;
var randomHash = randomString(4);
var date = new Date();
var work_folder = new Folder("~/Desktop/RESIZED-IMAGES");
if (!work_folder.exists) {
  work_folder.create();
}
var thisSession = 0;
logConfig();
var resampleMethod = ResampleMethod.BILINEAR;
if (config.press) {
  var outfile = new File(
    work_folder + "/" + constructFileName("press", randomHash)
  );
  if (config.screenshot && doc.width.value < 3600) {
    resampleMethod = ResampleMethod.NEARESTNEIGHBOR;
  }
  if (doc.width.value < doc.height.value) {
    doc.resizeImage(undefined, "12in", 300, resampleMethod);
  } else {
    doc.resizeImage("12in", undefined, 300, resampleMethod);
  }
  var tiffOptions = new TiffSaveOptions();
  tiffOptions.imageCompression = TIFFEncoding.TIFFLZW;
  tiffOptions.layers = false;
  tiffOptions.embedColorProfile = false;
  $.writeln("making press image with ", resampleMethod, ". ", doc.width.value);
  if (!outfile.exists) {
    doc.saveAs(outfile, tiffOptions);
  }
  doc.activeHistoryState = doc.historyStates[doc.historyStates.length - 2];
}
if (config.web) {
  var outfile = new File(
    work_folder + "/" + constructFileName("web", randomHash)
  );
  resampleMethod = ResampleMethod.BILINEAR;
  doc.resizeImage("1400px", undefined, undefined, resampleMethod);
  var opts = new JPEGSaveOptions();
  opts.quality = 9;
  $.writeln("making web image with ", resampleMethod, ". ", doc.width.value);
  if (!outfile.exists) doc.saveAs(outfile, opts);
  doc.activeHistoryState = doc.historyStates[doc.historyStates.length - 2];
}
if (config.db) {
  var outfile = new File(
    work_folder + "/" + constructFileName("db", randomHash)
  );
  resampleMethod = ResampleMethod.BILINEAR;
  $.writeln("making db image with ", resampleMethod, ". ", doc.width.value);
  doc.resizeImage("800px", undefined, 72, resampleMethod);
  if (!outfile.exists) doc.saveAs(outfile, new JPEGSaveOptions());
}
doc.close(SaveOptions.DONOTSAVECHANGES);

function randomString(len) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
incrementSessionCount();
registerSessionAction();
