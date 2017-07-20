(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.getVPAIDAd = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
  'diagHost': 'localhost:4444'
};

},{}],2:[function(require,module,exports){
'use strict';

module.exports = {
  'diagHost': 'geo-errserv.btrll.com'
};

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* eslint-disable */
var NULL = null;
var FINE_TIMEOUT_DEFAULT = 100;
var COARSE_TIMEOUT_DEFAULT = 750;
var IN_VIEW_TIME_THRESHOLD = 1000;
var THRESHOLD_BIG_PERCENTAGE = 30;
var THRESHOLD_SMALL_PERCENTAGE = 50;
var BIG_AD_SIZE_THRESHOLD = 242500;
var PERCENT_IN_VIEW100_THRESHOLD = 99;
var MAX_INTERSECTION_RATIO = 1;
var INTERSECTION_OBSERVER_THRESHOLD_STEP = 0.05;
var YIMG_URL = "https://s.yimg.com/rq/iv/";
var HIDDEN_STRING = 'hidden';
var VISIBLE_STRING = 'visible';
var TAG_SIZE = 1;
var GRID_SIZE = 5;
var EMPTY_STRING = "";
var CONTROL_A = "\x01";
var CONTROL_B = "\x02";
var PLUGINS = "plugins";
var NAME = "name";
var LENGTH = "length";
var TEXT_BASELINE = "textBaseline";
var FILL_STYLE = "fillStyle";
var FILL_TEXT = "fillText";
var TOP = "top";
var OBJECT = "object";
var PERFORMANCE = "performance";
var GET_ENTRIES_BY_TYPE = "getEntriesByType";
var RESOURCE = "resource";
var FUNCTION = "function";
var METRICS_BEACON_DOMAIN = "https://beap-bc.yahoo.com/ym?";
var GET_ATTRIBUTE = "getAttribute";
var BUCKET_ID = "100";
var JS_VERSION = "1.0.132";
var IN_VIEW_PERCENTAGE = "inViewPercentage";
var RESIZE_EVENT_NAME = "resize";
var UNLOAD_EVENT_NAME = "unload";
var BEFOREUNLOAD_EVENT_NAME = "beforeunload";
var AD_SIZE_WIDTH_THRESHOLD = 20;
var AD_SIZE_HEIGHT_THRESHOLD = 20;
var VIDEO_PLAY_DURATION_THRESHOLD = 2000;
var BEAP_ATTR_SIZE = 255;
var FLASH_TAGS_LOAD_TIMEOUT = 5000;

/*global Image*/
/*global navigator*/
var beaconMe;

if (navigator.sendBeacon) {
  beaconMe = function beaconMe(url, data) {
    navigator.sendBeacon(url, data);
  };
} else {
  beaconMe = function beaconMe(url, data) {
    var imageTag = new Image();
    if (!data) {
      data = '';
    }
    imageTag.src = url + data;
  };
}

function LOG(message, check) {
  if (arguments.length === 1 || check) {
    beaconMe("http://${host}:${port}/beacon-server/log?browserId=${browserId}&slotId=${slotId}&message=" + encodeURIComponent(message) + "&t=" + new Date().getTime());
  }
}

/*global window*/
/*global document*/
function _get_prop(obj, prop, defaultVal) {
  var ret = defaultVal || "";
  try {
    ret = obj && prop in obj ? obj[prop] : ret;
  } catch (e) {}
  return ret;
}

function parseBase10Integer(str) {
  return parseFloat(str, 10);
}

function isInteger(n) {
  return n === +n && n === (n | 0);
}

//window and document specific data
var win = window;
var doc = document;
var winScreen = _get_prop(win, "screen", NULL);
var nav = _get_prop(win, "navigator", NULL);
var loc = _get_prop(win, "location", NULL);
var lang = _get_prop(nav, "language", "");
var agent = _get_prop(nav, "userAgent", "");
var match = agent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i);
var browser = RegExp.$1.toLowerCase();
var version = parseFloat(agent.match(/version\/([\d]+)/i) && RegExp.$1 || match && match[2] || "");
var device = agent.match(/((ip)(hone|ad|od)|playbook|hp-tablet)/i) && RegExp.$1.toLowerCase() || 'desktop';
var os = agent.match(/(android|blackberry|bb10|macintosh|webos|windows)/i) && RegExp.$1.toLowerCase() || NULL;
var isWebView = false;
var isOneLevelDown = false;
var isInFrame = false;
var hasTopAccess = false;
var isSafeFrame = false;
var scrollWindow;
var browserInt;
var hidden;
var visibilityChange;
var height;
var width;
var isBigAd;
var thresholdPercentage;
var adElement;
var adWrapperElement;
var pageStartTime = new Date().getTime();

function setWindowLevelInfo() {
  //is one level down data
  try {
    var parWin = win.parent,
        topWin = win.top;
    /*jshint eqeqeq: false */
    isOneLevelDown = !!(topWin && parWin && topWin == parWin && topWin != win);
    isInFrame = !!(parWin && parWin && parWin != win);
    /*jshint eqeqeq: true */
  } catch (e) {}
}

function setHasTopAccess() {
  //has top access or not
  try {
    hasTopAccess = !!win.top.document;
  } catch (e) {}
}

function setScrollWindow() {
  scrollWindow = hasTopAccess && isOneLevelDown ? win.parent : win;
}

function setIsSafeFrame() {
  isSafeFrame = win.$sf && win.$sf.ext && typeof win.$sf.ext[IN_VIEW_PERCENTAGE] === 'function' || false;
}

function setIsWebView() {
  try {
    //on iphone
    isWebView = /((iPhone|iPod|iPad).*AppleWebKit(?!.*(Safari|CriOS)))/i.test(agent) ||
    //on android for chrome
    browser === "chrome" && (/wv\).* Chrome.* Mobile/i.test(agent) || /Version\/\d*\.\d* (?:Chrome.* Mobile)?/i.test(agent)) ||
    //on windows phone
    /(MSAppHost\/.*|WebView)/.test(agent);
  } catch (e) {}
}

function setBrowserInt() {
  // For convenience, let's track the user agent, stored in browserInt.
  // 1 == Chrome
  // 2 == Firefox
  // 3 == MSIE
  // 4 == Safari
  // 5 == Webkit
  // 6 == Gecko
  // 7 == other
  if (agent.indexOf('Chrome/') !== -1) {
    browserInt = 1;
  } else if (agent.indexOf('Firefox/') !== -1) {
    browserInt = 2;
  } else if (agent.indexOf('; MSIE') !== -1) {
    browserInt = 3;
  } else if (agent.indexOf('Safari/') !== -1) {
    browserInt = 4;
  } else if (agent.indexOf('WebKit') !== -1) {
    browserInt = 5;
  } else if (agent.indexOf('Gecko') !== -1) {
    browserInt = 6;
  } else {
    browserInt = 7;
  }
}

function setDocumentVisibilityInfo() {
  //setupPageVisibilityDetection
  if (typeof doc.hidden !== 'undefined') {
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  }
  // firefox <= 17
  else if (typeof doc.mozHidden !== 'undefined') {
      hidden = 'mozHidden';
      visibilityChange = 'mozvisibilitychange';
    }
    // chrome <= v32, Android <= v4.4, Blackberry up to v10
    else if (typeof doc.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
      } else if (typeof doc.msHidden !== 'undefined') {
        hidden = 'msHidden';
        visibilityChange = 'msvisibilitychange';
      }
}

function getSizeFromElement(element) {
  var size = {
    width: 0,
    height: 0,
    valid: true
  };
  try {
    var computedStyle = win.getComputedStyle && win.getComputedStyle(element, NULL) || element.currentStyle;
    size.width = parseBase10Integer(computedStyle.width) || 0;
    size.height = parseBase10Integer(computedStyle.height) || 0;
  } catch (e) {
    size.width = 0;
    size.height = 0;
    size.valid = false;
  }

  return size;
}

function sizeIsBelowThreshold(element) {
  var size = getSizeFromElement(element);
  return size.width <= AD_SIZE_WIDTH_THRESHOLD || size.height <= AD_SIZE_HEIGHT_THRESHOLD;
}

function setAdSize(serverWidth, serverHeight) {
  if (arguments.length > 0 && isInteger(serverWidth) && isInteger(serverHeight)) {
    width = serverWidth;
    height = serverHeight;
  } else {
    var _width, _height;
    if (isInFrame) {
      try {
        _width = doc.documentElement && Math.max(doc.documentElement.clientWidth, doc.documentElement.scrollWidth) || win.frameElement && win.frameElement.width || NULL;
        _height = doc.documentElement && Math.max(doc.documentElement.clientHeight, doc.documentElement.scrollHeight) || win.frameElement && win.frameElement.height || NULL;
      } catch (e) {
        _width = win.innerWidth || doc.body && doc.body.clientWidth || NULL;
        _height = win.innerHeight || doc.body && doc.body.clientHeight || NULL;
      }
    } else {
      var size = getSizeFromElement(adWrapperElement);
      _width = size.width || NULL;
      _height = size.height || NULL;
    }

    width = _width;
    height = _height;
  }

  isBigAd = width * height >= BIG_AD_SIZE_THRESHOLD;
  thresholdPercentage = isBigAd ? THRESHOLD_BIG_PERCENTAGE : THRESHOLD_SMALL_PERCENTAGE;
}

//moved outside, as isInFrame is used before setup is called
setWindowLevelInfo();

function setup(_adElement, _adWrapperElement) {
  adElement = _adElement;

  //initialise all variables
  setHasTopAccess();
  setScrollWindow();
  setIsSafeFrame();
  setIsWebView();
  setBrowserInt();
  setDocumentVisibilityInfo();

  //if ad wrapper element is explicitly mentioned, in case of video
  if (_adWrapperElement) {
    adWrapperElement = _adWrapperElement;
  } else if (isInFrame) {
    if (hasTopAccess) {
      try {
        adWrapperElement = win.frameElement;
      } catch (e) {
        adWrapperElement = NULL;
      }
    } else {
      adWrapperElement = doc.body || NULL;

      if (sizeIsBelowThreshold(adWrapperElement)) {
        var selected;
        var divs = adWrapperElement.getElementsByTagName("div");
        for (var i = 0; i < divs.length; i++) {
          if (!sizeIsBelowThreshold(divs[i])) {
            selected = divs[i];
            break;
          }
        }

        if (!selected) {
          var videos = adWrapperElement.getElementsByTagName("video");
          for (i = 0; i < videos.length; i++) {
            if (!sizeIsBelowThreshold(videos[i])) {
              selected = videos[i];
              break;
            }
          }
        }

        if (selected) {
          adWrapperElement = selected;
        }
      }
    }
  } else {
    adWrapperElement = adElement && (adElement.parentElement || adElement.parentNode) || NULL;
  }

  return adElement !== NULL && adElement !== undefined && adWrapperElement !== NULL && adWrapperElement !== undefined;
}

function getDomain(url) {
  var domain = "",
      m;
  if (url && typeof url === "string") {
    try {
      m = url.match(/^https?:\/\/([-\w\.]*)(:\d+)?([\/\?#]|$)/);
      if (m && m[1]) {
        domain = m[1];
      }
    } catch (e) {
      domain = "";
    }
  }
  return domain;
}

function getTimeFromStart(startTime, endTime) {
  return Math.floor((endTime - startTime) / 1000);
}

function registerListener(eventType, callback, target) {
  target = target || win;
  if (target.addEventListener) {
    target.addEventListener(eventType, callback);
  } else if (target.attachEvent) {
    target.attachEvent('on' + eventType, callback);
  }
}

function unregisterListener(eventType, callback, target) {
  target = target || win;
  if (target.removeEventListener) {
    target.removeEventListener(eventType, callback);
  } else if (target.detachEvent) {
    target.detachEvent('on' + eventType, callback);
  }
}

function getTagCoordinates(width$$1, height$$1) {
  var i,
      j,
      x,
      y,
      id,
      maxX = width$$1 > TAG_SIZE ? width$$1 - TAG_SIZE : 0,
      maxY = height$$1 > TAG_SIZE ? height$$1 - TAG_SIZE : 0,
      coordinates = [],
      coordinateMap = {}; // used to make sure the elements of the array are unique

  // initialize i and j to 0.5 to target the middle of the tag's region
  for (i = 0.5; i < GRID_SIZE; i += 1) {
    x = Math.round(i * maxX / GRID_SIZE);

    for (j = 0.5; j < GRID_SIZE; j += 1) {
      y = Math.round(j * maxY / GRID_SIZE);
      id = x + '_' + y;

      if (!coordinateMap[id]) {
        coordinates.push(id);
        coordinateMap[id] = 1;
      }
    }
  }

  return coordinates;
}

var scrollTimeoutId;

function handleScrollTimeout(archive) {
  var calculatedDepth,
      nowish = new Date().getTime(),
      totalScrollTime = getTimeFromStart(archive.scrollStartTime, nowish),
      numberOfPixelsScrolled = scrollWindow.scrollY - archive.scrollStartY,
      heightToUse = scrollWindow.document.body.clientHeight;

  if (!heightToUse) {
    heightToUse = scrollWindow.document.body.height;
  }

  // scd scroll depth
  calculatedDepth = Math.round(scrollWindow.scrollY / heightToUse * 100);
  if (calculatedDepth > archive.scd) {
    archive.scd = calculatedDepth;
  }

  if (numberOfPixelsScrolled > 0) {
    archive.scrolledDownPixels += numberOfPixelsScrolled;
    archive.scrolledDownTime += totalScrollTime;
  } else {
    archive.scrolledUpPixels -= numberOfPixelsScrolled;
    archive.scrolledUpTime += totalScrollTime;
  }

  archive.scrollStartTime = 0;
}

function handleScroll(archive) {
  var nowish = new Date().getTime();
  archive.scr = 1;

  if (!archive.sct) {
    archive.sct = getTimeFromStart(pageStartTime, nowish);
  }

  if (!archive.scrollStartTime || archive.scrollStartTime === 0) {
    archive.scrollStartTime = nowish;
    archive.scrollStartY = scrollWindow.scrollY;
  }

  if (!scrollTimeoutId) {
    clearTimeout(scrollTimeoutId);
  }

  scrollTimeoutId = setTimeout(function () {
    handleScrollTimeout(archive);
  }, 250);
}

function setup$1(archive) {
  registerListener('scroll', function () {
    handleScroll(archive);
  }, scrollWindow);
}

function handleMouseOver(archive) {
  var nowish = new Date().getTime();
  archive.hov = 1;
  if (!archive.tth) {
    archive.tth = getTimeFromStart(pageStartTime, nowish);
  }
  archive.hoverStartTime = nowish;
}

function handleMouseOut(archive) {
  var nowish = new Date().getTime(),
      checkInteractionTime = getTimeFromStart(archive.hoverStartTime, nowish);

  if (checkInteractionTime > 500) {
    archive.intt = 1;
    archive.intl = nowish;
    //TODO check logic
    archive.tti = getTimeFromStart(pageStartTime, nowish);
  }
}

function setup$2(archive) {
  registerListener('mouseover', function () {
    handleMouseOver(archive);
  });
  registerListener('mouseout', function () {
    handleMouseOut(archive);
  });
}

function visibilityChanged(archive) {
  var nowish = new Date().getTime();
  // if document is changing from visible to hidden
  // calculate dwell and add it to the total.
  if (doc[hidden] && archive.dwellStartTime > 0) {
    archive.adt += getTimeFromStart(archive.dwellStartTime, nowish);
  } else {
    archive.foc = 1;
    archive.dwellStartTime = nowish;
  }
}

function setup$3(archive) {
  if (!doc[hidden]) {
    visibilityChanged(archive);
  }
  registerListener(visibilityChange, function () {
    visibilityChanged(archive);
  }, doc);
}

var archive = {
  w: 0, // window.innerWidth
  h: 0, // window.innerHeight
  mw: -1, // measured width
  mh: -1, // measured height
  bl: -1, // bounding client rectangle left
  bt: -1, // bounding client rectangle top
  ew: -1, // frame width
  eh: -1, // frame height
  ex: -1, // bl + parentBody.scrollLeft
  ey: -1, // bt + parentBody.scrollTop
  vw: -1, // viewportWidth
  vh: -1, // viewportHeight
  sx: -1, // scrollX
  sy: -1, // scrollY
  ivp: -1, // inViewPercentage
  ivd: -1, // in-view duration
  pt: -1, // page-time
  mi: -1, // maximum inViewPercentage
  b: -1, // browser
  gm0: 0, // 100% inview 0s
  gm1: 0, // 100% inview 1s
  m: -1, // method
  tivt: 0, // total in view time
  hov: 2, // did the user hover over the ad?
  tth: 0, // how long after page load before the user hovered
  intt: 2, // did the user interact with the page?
  intl: 0, // how long did the user interact
  tti: 0, // how long after page load before the user interacted
  st: 0, // the total amount of time spent on the page in seconds
  foc: 2, // did the page have focus at any time?
  adt: 0, // total amount of time spent on the page while in focus
  scr: 2, // did the user scroll?
  scd: 0, // scroll depth
  svd: 0, // how fast (px/second) did they scroll down
  svu: 0, // how fast (px/second) did they scroll up
  sct: 0, // how long after page load did they first scroll
  mivp: 0, // maximum in view percentage
  mivt: 0, // maximum in view time
  ls: 0, // load source, did the ad load in a window, div, or iFrame
  winl: '', // the value of window.location
  winr: '', // the value of document.referrer
  lvl: 0, // how many windows down are we?
  al: 3, // did the ad load as far as we can tell?
  ae: 0, // ad errors
  bct: 2, // beacon type is inside.js
  ph: -1, // page height
  dwellStartTime: 0, // used to calculate adt
  scrolledUpPixels: 0,
  scrolledUpTime: 0,
  scrolledDownPixels: 0,
  scrolledDownTime: 0,
  avoc: 0, //audio video on complete
  avoc_debug: 0
};

/* Trackers */
function registerErrorListener() {
  var oldErrorHandler;

  oldErrorHandler = win.onerror;
  win.onerror = function (errorMsg, errorURL, lineNumber, columnNumber, errorObject) {
    archive.ae += 1;
    if (oldErrorHandler) {
      return oldErrorHandler(errorMsg, errorURL, lineNumber, columnNumber, errorObject);
    }
    return false;
  };
}

function setupTrackers() {
  if (isInFrame) {
    // we're in an iFrame, easy to track mouse moves
    setup$2(archive);
  }
  setup$3(archive);
  if (!isInFrame || hasTopAccess && isOneLevelDown) {
    // we can access the parent, track scrolling.
    setup$1(archive);
  }
  registerErrorListener();
}

function adIsInIframe() {
  //if inside.js is not in iframe there will too much noise from parent page to detect this
  if (isInFrame) {
    var iframes = doc.getElementsByTagName("iframe");
    for (var i = 0; i < iframes.length; i++) {
      //check for size. there might be other iframe which are too small or hidden
      if (!sizeIsBelowThreshold(iframes[i])) {
        try {
          //try to access inner document
          var contentDocument = iframes[i].contentDocument ? iframes[i].contentDocument : iframes[i].contentWindow ? iframes[i].contentWindow.document : iframes[i].document;
          //try to query
          contentDocument.getElementsByTagName("div");
        } catch (e) {
          //cross domain iframe with considerable size. might be ad
          return true;
        }
      }
    }
  }
  return false;
}

function getCommonAdditionalData(methodInstance) {
  // threshold percentage: 2 = 30% threshold, 1 = 50% threshold
  var additionalData = "tp=" + (isBigAd ? '2' : '1');
  // measurement type
  // 1 == SafeFrame measured viewability
  // 2 == X-Domain iFrame with script access
  // 3 == Firefox mozPaintCount based
  // 4 == Flash approach
  // 5 == Not Measurable
  // 6 == No iFrame, it was measured directly
  // 7 == Measured using IntersectionObserver api
  // 8 == Measured using mraid api
  additionalData += ":mt=" + methodInstance.measurementBucket;
  additionalData += ":iww=" + (isWebView ? '2' : '1');
  additionalData += ":aif=" + (adIsInIframe() ? '1' : '0');
  additionalData += ":iif=" + (isInFrame ? '1' : '0');
  additionalData += ":fns=" + methodInstance.flashNotSupported;
  return additionalData;
}

var generateGuid = function () {
  var defaultPrefix = "$yinsideIV",
      nextID = new Date().getTime() - _guid_rand(100000),
      nextIDIncrement = _guid_rand(100);

  function _guid_rand(exp) {
    return Math.floor(Math.random() * (10 * exp));
  }

  function _generate_guid(sPrefix) {
    var ret = nextID;

    nextID += nextIDIncrement;
    nextIDIncrement = _guid_rand(100);

    try {
      sPrefix = sPrefix && String(sPrefix);
    } catch (e) {
      sPrefix = "";
    }

    sPrefix = sPrefix || defaultPrefix;

    ret = sPrefix + "_" + ret;

    return ret;
  }

  return _generate_guid;
}();

function replaceOrAppendParam(beacon, placeholder, param, value) {
  return beacon.indexOf(placeholder) > -1 ? beacon.replace(placeholder, value) : beacon + "&" + param + "=" + value;
}

function fireViewableBeacon(beacon, measurementType, isViewed, isMeasurable, methodInstance, additionalViewableData, additionalData) {
  var timestamp = new Date().getTime();

  if (beacon) {
    try {
      beacon = beacon.replace('%InViewPercentage%', methodInstance.getAverageInViewPercentage());
      beacon = beacon.replace('{pctview}', methodInstance.getAverageInViewPercentage());
      // passing value of 1 for true (it is in view), 2 for false, it is not in view (only fired for not measurable).
      beacon = beacon.replace('%Viewable%', isViewed ? '1' : '2');
      beacon = beacon.replace('{initview}', isViewed ? '1' : '2');
      beacon = replaceOrAppendParam(beacon, '%Measurable%', 'im', isMeasurable ? '1' : '2');

      beacon = beacon.replace('%MeasurementType%', measurementType);
      beacon = replaceOrAppendParam(beacon, '%Timestamp%', 'r', timestamp);
      beacon = replaceOrAppendParam(beacon, '%BucketId%', 'b', BUCKET_ID);
      beacon = replaceOrAppendParam(beacon, '%AdditionalData%', 'ad', "jv=" + JS_VERSION + (additionalData && additionalData !== "" ? ":" + additionalData : "") + ":" + getCommonAdditionalData(methodInstance));

      if (additionalViewableData) {
        beacon += "&" + additionalViewableData;
      }
      beaconMe(beacon);
    } catch (ex) {}
  }
}

/*
 * MD5 component
 *
 * Original JavaScript code base courtesy of:
 * Author:
 * Joseph Myers
 *  http://www.myersdaily.org/joseph/
 *
 * Original Code Found At:
 *   http://www.myersdaily.org/joseph/javascript/md5.js
 *   With Notes:
 *    http://www.myersdaily.org/joseph/javascript/md5-speed-test.html
 *    http://www.myersdaily.org/joseph/javascript/md5-text.html
 * Circa 2010
 *
 * Updates / Edits:
 * Sean Snider
 * Yahoo! 2016 - current
 *
 * Changes:
 *
 * -- Updated coding style / indentation / white-space to make the source code
 *    more readable
 *
 * -- Added wrapper "module" pattern, with more syntax sugar to come
 *    later, for now it's just expected to run in a web-browser
 *    with no other dependancies and simply outputs a single
 *    global function called "md5" to the window object
 *
 * -- Updated the loops in the following sub-routines to be slightly
 *     more optimized by setting local variables for the length
 *    of the string rather than constantly rechecking the .length property:
 *     md51
 *     hex
 *
 * -- Created local/inner sub-routines for the following String prototype
 *    methods which again slighly increases run-time performance and also
 *     allows the code minification to be a bit smaller:
 *
 *   String_charCodeAt >> String.prototype.substring
 *    String_lsub >> String.prototype.substring with only 2 arguments, the string and start offset, end is assumed
 *   String_sub >> String.prototype.substring with 3 arguments, string, start and end offsets
 *
 *    We can potentially replace these later if said code
 *     is part of larger framework
 *
 * -- Changed the md5blk function to use Array.prototype.push (i.e. the array/string buffer approach)
 *    for string concatentation rather than using + operator which has poor performance
 *    in many older browsers and even in newer browsers is always equal or slighlty
 *     faster (since the inherit ambiguity of an operator makes it more difficult to
 *    to optimize effectively).
 *
 * -- Changed the rhex inner function/sub-routine to no longer use a loop as that's
 *    not necessary since the input and calcluations needed are quite static,
 *    and updated it to use an array join rather than string concats
 *
 * -- Added "constants" (well really just local vars to the module since, not
 *    all JS engines actually allow true constants), most all magic numbers
 *     that are >= 2 characters/reused multiple times, which again
 *     slightly improves run-time and compression performance.
 *
 *    these constants (like many others) could also be added as part
 *     of some framework.
 *
 */

/* istanbul ignore next */
var HEX_CHAR_LIST = '0123456789abcdef'.split('');
var HEX_UNSIGNED_INT = 0xFFFFFFFF;
var MD5_OK = 0;
var MD5_ERR_MSG = "MD5 module is broken";
var MD5_TEST_INPUT = 'hello';
var MD5_TEST_EXPECT_OUTPUT = '5d41402abc4b2a76b9719d911017c592';
var MD5_VERBOSE_MODE = 0;
var PROTO = "prototype";
var StringProto_substring = String[PROTO].substring;
var NUM_10 = 10;
var NUM_11 = 11;
var NUM_12 = 12;
var NUM_13 = 13;
var NUM_14 = 14;
var NUM_15 = 15;
var NUM_16 = 16;
var NUM_17 = 17;
var NUM_20 = 20;
var NUM_21 = 21;
var NUM_22 = 22;
var NUM_23 = 23;
var NUM_24 = 24;
var NUM_32 = 32;
var NUM_64 = 64;
var add32 = _add32;
var BYTES_64 = 65535;
var BITS_128 = 128;
var BITS_15 = NUM_15; // 0x0F

/* istanbul ignore next */
function String_charCodeAt(s, i) {
  //Assumes 1st argument is a string, and 2nd argument is a number/integer with no type checking
  return s.charCodeAt(i);
}

/* istanbul ignore next */
function String_lsub(s, start) {
  //Assumes 1st argument is a string,
  //and 2nd argument is a number/integer
  //with no type checking

  return StringProto_substring.call(s, start);
}

/* istanbul ignore next */
function String_sub(s, start, end) {
  return StringProto_substring.call(s, start, end);
}

/* istanbul ignore next */
function md5cycle(x, k) {
  var a = x[0],
      b = x[1],
      c = x[2],
      d = x[3];

  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], NUM_12, -389564586);
  c = ff(c, d, a, b, k[2], NUM_17, 606105819);
  b = ff(b, c, d, a, k[3], NUM_22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], NUM_12, 1200080426);
  c = ff(c, d, a, b, k[6], NUM_17, -1473231341);
  b = ff(b, c, d, a, k[7], NUM_22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], NUM_12, -1958414417);
  c = ff(c, d, a, b, k[NUM_10], NUM_17, -42063);
  b = ff(b, c, d, a, k[NUM_11], NUM_22, -1990404162);
  a = ff(a, b, c, d, k[NUM_12], 7, 1804603682);
  d = ff(d, a, b, c, k[NUM_13], NUM_12, -40341101);
  c = ff(c, d, a, b, k[NUM_14], NUM_17, -1502002290);
  b = ff(b, c, d, a, k[NUM_15], NUM_22, 1236535329);

  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[NUM_11], NUM_14, 643717713);
  b = gg(b, c, d, a, k[0], NUM_20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691);
  d = gg(d, a, b, c, k[NUM_10], 9, 38016083);
  c = gg(c, d, a, b, k[NUM_15], NUM_14, -660478335);
  b = gg(b, c, d, a, k[4], NUM_20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438);
  d = gg(d, a, b, c, k[NUM_14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], NUM_14, -187363961);
  b = gg(b, c, d, a, k[8], NUM_20, 1163531501);
  a = gg(a, b, c, d, k[NUM_13], 5, -1444681467);
  d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], NUM_14, 1735328473);
  b = gg(b, c, d, a, k[NUM_12], NUM_20, -1926607734);

  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], NUM_11, -2022574463);
  c = hh(c, d, a, b, k[NUM_11], NUM_16, 1839030562);
  b = hh(b, c, d, a, k[NUM_14], NUM_23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060);
  d = hh(d, a, b, c, k[4], NUM_11, 1272893353);
  c = hh(c, d, a, b, k[7], NUM_16, -155497632);
  b = hh(b, c, d, a, k[NUM_10], NUM_23, -1094730640);
  a = hh(a, b, c, d, k[NUM_13], 4, 681279174);
  d = hh(d, a, b, c, k[0], NUM_11, -358537222);
  c = hh(c, d, a, b, k[3], NUM_16, -722521979);
  b = hh(b, c, d, a, k[6], NUM_23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487);
  d = hh(d, a, b, c, k[NUM_12], NUM_11, -421815835);
  c = hh(c, d, a, b, k[NUM_15], NUM_16, 530742520);
  b = hh(b, c, d, a, k[2], NUM_23, -995338651);

  a = ii(a, b, c, d, k[0], 6, -198630844);
  d = ii(d, a, b, c, k[7], NUM_10, 1126891415);
  c = ii(c, d, a, b, k[NUM_14], NUM_15, -1416354905);
  b = ii(b, c, d, a, k[5], NUM_21, -57434055);
  a = ii(a, b, c, d, k[NUM_12], 6, 1700485571);
  d = ii(d, a, b, c, k[3], NUM_10, -1894986606);
  c = ii(c, d, a, b, k[NUM_10], NUM_15, -1051523);
  b = ii(b, c, d, a, k[1], NUM_21, -2054922799);
  a = ii(a, b, c, d, k[8], 6, 1873313359);
  d = ii(d, a, b, c, k[NUM_15], NUM_10, -30611744);
  c = ii(c, d, a, b, k[6], NUM_15, -1560198380);
  b = ii(b, c, d, a, k[NUM_13], NUM_21, 1309151649);
  a = ii(a, b, c, d, k[4], 6, -145523070);
  d = ii(d, a, b, c, k[NUM_11], NUM_10, -1120210379);
  c = ii(c, d, a, b, k[2], NUM_15, 718787259);
  b = ii(b, c, d, a, k[9], NUM_21, -343485551);

  x[0] = add32(a, x[0]);
  x[1] = add32(b, x[1]);
  x[2] = add32(c, x[2]);
  x[3] = add32(d, x[3]);
}

/* istanbul ignore next */
function cmn(q, a, b, x, s, t) {
  a = add32(add32(a, q), add32(x, t));
  return add32(a << s | a >>> NUM_32 - s, b);
}

/* istanbul ignore next */
function ff(a, b, c, d, x, s, t) {
  return cmn(b & c | ~b & d, a, b, x, s, t);
}

/* istanbul ignore next */
function gg(a, b, c, d, x, s, t) {
  return cmn(b & d | c & ~d, a, b, x, s, t);
}

/* istanbul ignore next */
function hh(a, b, c, d, x, s, t) {
  return cmn(b ^ c ^ d, a, b, x, s, t);
}

/* istanbul ignore next */
function ii(a, b, c, d, x, s, t) {
  return cmn(c ^ (b | ~d), a, b, x, s, t);
}

/* istanbul ignore next */
function md51(s) {
  var n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878],
      tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      i = NUM_64;

  for (; i <= n; i += NUM_64) {
    md5cycle(state, md5blk(String_sub(s, i - NUM_64, i)));
    i += NUM_64;
  }

  s = String_lsub(s, i - NUM_64);
  for (i = 0, n = s.length; i < n; i++) {
    tail[i >> 2] |= String_charCodeAt(s, i) << (i % 4 << 3);
  }

  tail[i >> 2] |= BITS_128 << (i % 4 << 3);

  if (i > 55) {
    md5cycle(state, tail);
    for (i = 0; i < NUM_16; i++) {
      tail[i] = 0;
    }
  }

  tail[NUM_14] = n * 8;
  md5cycle(state, tail);
  return state;
}

/*
 * original source comment:
 *
 * there needs to be support for Unicode here,
 * unless we pretend that we can redefine the MD-5
 * algorithm for multi-byte characters (perhaps
 * by adding every four 16-bit characters and
 * shortening the sum to 32 bits). Otherwise
 * I suggest performing MD-5 as if every character
 * was two bytes--e.g., 0040 0025 = @%--but then
 * how will an ordinary MD-5 sum be matched?
 * There is no way to standardize text to something
 * like UTF-8 before transformation; speed cost is
 * utterly prohibitive. The JavaScript standard
 * itself needs to look at this: it should start
 * providing access to strings as preformed UTF-8
 * 8-bit unsigned value arrays.
 *
 * update from Sean Snider:
 *
 * well that's finally starting to exist
 * now in 2014 and beyond but nonetheless it's
 * not always available so making the blocks
 * this way is probably just as good
 *
 *
 */
/* istanbul ignore next */
function md5blk(s) {

  /*
   * original source/author comment:
   *
   * I figured global was faster.
   * Andy King said do it this way.
   */

  var md5blks = [],
      i;

  for (i = 0; i < NUM_64; i += 4) {
    md5blks[i >> 2] = String_charCodeAt(s, i) + (String_charCodeAt(s, i + 1) << 8) + (String_charCodeAt(s, i + 2) << NUM_16) + (String_charCodeAt(s, i + 3) << NUM_24);
  }
  return md5blks;
}

/* istanbul ignore next */
function rhex(n) {
  /*
   * update from Sean Snider:
   *
   * originally (commeted out below), this would loop 4 iterations
   * but the loop is not really needed since we have a fixed number of iterations
   * it's faster to just do the 4 calculations ourselves inline via an array/buffer combo
   *
   * it's a bit more verbose but not enough to be concerned about and since rhex
   * will be called via other loops, it's better to avoid the loop
   */

  return [HEX_CHAR_LIST[n >> 4 & BITS_15], HEX_CHAR_LIST[n >> 0 & BITS_15], HEX_CHAR_LIST[n >> NUM_12 & BITS_15], HEX_CHAR_LIST[n >> 8 & BITS_15], HEX_CHAR_LIST[n >> NUM_20 & BITS_15], HEX_CHAR_LIST[n >> NUM_16 & BITS_15], HEX_CHAR_LIST[n >> NUM_24 + 4 & BITS_15], HEX_CHAR_LIST[n >> NUM_24 & BITS_15]].join('');

  /*
   * update from Sean Snider
   * original implementation no longer used
   * the original does an ugly string concat with += and + operators
   * and also uses a for loop. but as noted above, the loop is really
   * not necessary since we only have 4 lines/iterations and 8 total parts
   * that need to be built. . .everything else is already a constant. .
   * the only thing the loop below is really doing is using the 'j' index
   * number to compute bits to be shifted which is unecessary since that's
   * effectively a static value
   *
   *
   *  function rhex(n)
   *  {
   *    var s='', j=0;
   *    for(; j<4; j++)
   *    {
   *      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
   *    }
   *    return s;
   *  }
   */
}

/* istanbul ignore next */
function hex(x) {
  var i = 0,
      l = x.length;

  for (; i < l; i++) {
    x[i] = rhex(x[i]);
  }
  return x.join('');
}

/*
 * original comment from author:
 *
 * this function is much faster,
 * so if possible we use it. Some IEs
 * are the only ones I know of that
 * need the idiotic second function,
 * generated by an if clause.
 *
 *
 * update from Sean Snider:
 *
 * Well the $20K question is WHY is the 2nd
 * function needed in some IE browsers?
 * My guess is that perhaps the max value
 * for numbers in the JS engine is a problem
 * so you can't use the constant?
 *
 * Intersting though b/c I tested in >= IE8
 * and never saw the problem. .
 *
 *
 */

/* istanbul ignore next */
function _add32(a, b) {
  return a + b & HEX_UNSIGNED_INT;
}

/* istanbul ignore next */
function altAdd32(x, y) {
  var lsw = (x & BYTES_64) + (y & BYTES_64),
      msw = (x >> NUM_16) + (y >> NUM_16) + (lsw >> NUM_16);

  return msw << NUM_16 | lsw & BYTES_64;
}

/*
 * in the extremely rare case where the library
 * fails (which should be never), we simply
 * export a function to throw an error if in
 * verbose mode or return an empty string in quiet
 * mode
 */

/* istanbul ignore next */
function md5_throw(s) {
  if (MD5_VERBOSE_MODE) {
    throw new Error(MD5_ERR_MSG);
  }
  return "";
}

/* istanbul ignore next */
function md5_systemCheck() {
  return $md5(MD5_TEST_INPUT) === MD5_TEST_EXPECT_OUTPUT;
}

/* istanbul ignore next */
function $md5(s) {
  return hex(md51(s));
}

/* istanbul ignore next */
if (!md5_systemCheck()) {
  add32 = altAdd32;

  if (!md5_systemCheck()) {
    MD5_OK = 0;
  } else {
    MD5_OK = 1;
  }
} else {
  MD5_OK = 1;
}

var _md5 = MD5_OK ? $md5 : md5_throw;

var _encodeURIComponent = encodeURIComponent;

function getAdWeight() {
  var performanceApi,
      adWeight = 0,
      i = 0,
      transferSize = 0,
      resources = [],
      resource,
      name,
      fileRegex = /(r\-(.*)\.html)|(sf(.*?)\.js)/gi;

  try {
    performanceApi = win[PERFORMANCE];
    if (performanceApi && _typeof(performanceApi[GET_ENTRIES_BY_TYPE]) === FUNCTION) {
      resources = performanceApi[GET_ENTRIES_BY_TYPE](RESOURCE);
    }
  } catch (e) {
    resources = [];
  }

  while (resource = resources[i++]) {
    try {
      name = resource.name;
      transferSize = resource.transferSize;
    } catch (e) {
      name = EMPTY_STRING;
      transferSize = 0;
    }

    if (transferSize && transferSize > 0 && name && name.search(fileRegex) === -1) {
      adWeight += transferSize;
    }
  }

  return adWeight;
}

function getCanvasImage() {
  var dataUrl,
      dataItems,
      canvasText,
      canvas,
      text = "yj";

  try {
    canvas = doc.createElement("canvas");
  } catch (e) {}

  if (!canvas || !canvas.getContext) {
    return _md5(EMPTY_STRING);
  }

  canvas.style.border = "1px solid black";
  canvas.width = 16;
  canvas.height = 22;
  canvasText = canvas.getContext("2d");
  canvasText[TEXT_BASELINE] = TOP;
  canvasText.font = "15px 'Arial'";
  canvasText[TEXT_BASELINE] = "alphabetic";
  canvasText[FILL_STYLE] = "#ffa";
  canvasText.fillRect(1, 1, 15, 20);
  canvasText[FILL_STYLE] = "#00a";
  canvasText[FILL_TEXT](text, 2, 15);
  canvasText[FILL_STYLE] = "rgba(100, 100, 100, 0.7)";
  canvasText[FILL_TEXT](text, 4, 17);

  dataUrl = canvas.toDataURL("image/png");
  dataItems = dataUrl.split(",");
  return _md5(dataItems[LENGTH] === 2 ? dataItems[1] : dataUrl);
}

function getAncestorOrigins(archive$$1) {
  var originString = "",
      aoLength,
      ancestorOrigins;

  try {
    ancestorOrigins = loc && loc.ancestorOrigins;
    if (ancestorOrigins) {
      aoLength = ancestorOrigins.length;
      if (aoLength) {
        //log just the root url as this is all thats need in terms of acutal url by ILS to ensure supply quality
        originString = getDomain(ancestorOrigins[aoLength - 1]);

        //append ancestors from bottom upto size available by beap
        for (var i = 0, nextDomain = getDomain(ancestorOrigins[0]); i < aoLength - 1 && originString.length + (i === 0 ? CONTROL_B : CONTROL_A).length + nextDomain.length <= BEAP_ATTR_SIZE; i++, nextDomain = getDomain(ancestorOrigins[i])) {
          originString += (i === 0 ? CONTROL_B : CONTROL_A) + nextDomain;
        }
      }
      //supply quality n
      archive$$1.sao = aoLength || 0;
    } else {
      //temporarily used to denote that ancestorOrigins is not supported
      archive$$1.sao = -1;
    }
  } catch (e) {
    originString = "";
    archive$$1.sao = -1;
  }

  return originString;
}

function getPluginsString() {
  var i,
      len,
      result = EMPTY_STRING;

  try {
    len = nav[PLUGINS][LENGTH];
    for (i = 0; i < len; i++) {
      if (result !== EMPTY_STRING) {
        result += CONTROL_A;
      }
      result += nav[PLUGINS][i][NAME];
    }
  } catch (e) {
    result = EMPTY_STRING;
  }

  return result;
}

function getHashedPluginsString() {
  var ret = EMPTY_STRING;

  try {
    ret = browserInt === 3 || browser === "msie" || browser === "trident" ? getIePluginsString() : getPluginsString();
  } catch (e) {
    ret = EMPTY_STRING;
  }
  return _md5(ret);
}

function checkActiveX(name) {
  var ret = "",
      plugin;

  try {
    plugin = nav[PLUGINS][name];
    if (plugin) {
      ret = plugin.name;
    } else {
      new win.ActiveXObject(name);
      ret = name;
    }
  } catch (e) {
    ret = EMPTY_STRING;
  }

  return ret;
}

function getIePluginsString() {
  var i,
      result = "",
      plugin = "",
      check_plugins = ['ShockwaveFlash.ShockwaveFlash', 'AcroPDF.PDF', 'PDF.PdfCtrl', 'QuickTime.QuickTime', 'rmocx.RealPlayer G2 Control', 'rmocx.RealPlayer G2 Control.1', 'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)', 'RealVideo.RealVideo(tm) ActiveX Control (32-bit)', 'RealPlayer', 'SWCtl.SWCtl', 'WMPlayer.OCX', 'AgControl.AgControl', 'Skype.Detection'],
      numPluginToCheck = check_plugins.length;

  for (i = 0; i < numPluginToCheck; i++) {
    plugin = checkActiveX(check_plugins[i]);
    if (plugin !== "") {
      if (result !== "") {
        result += CONTROL_A;
      }
      result += plugin;
    }
  }
  return result;
}

// where sek is Source Event Key, also known as unique event identifier.
function getSek(beacon) {
  var keyStart,
      keyEnd,
      keyName = 'sek=';

  if (beacon) {
    keyStart = beacon.indexOf(keyName);
    if (keyStart !== -1) {
      keyEnd = beacon.indexOf('&', keyStart + keyName.length);
      if (keyEnd === -1) {
        keyEnd = beacon.length;
      }
      return beacon.substring(keyStart + keyName.length, keyEnd);
    }
  }

  return EMPTY_STRING;
}

function getTimeDelta(startTime, endTime) {
  return endTime - startTime;
}

function getNumberOfLevelsDown() {
  var numberOfLevels = 0,
      winParent,
      top = win.top;
  try {
    /*jshint eqeqeq: false */
    if (top == win) {
      numberOfLevels = 0;
    } else {
      winParent = win.parent;
      numberOfLevels++;
      while (top != winParent) {
        winParent = winParent.parent;
        numberOfLevels++;
      }
    }
    /*jshint eqeqeq: true */
  } catch (ex) {
    numberOfLevels = -1;
  }
  return numberOfLevels;
}

function getListOfElementAttributes(tagName, attributeName) {
  var elementList,
      i,
      attributeList = [],
      attributeValue;

  elementList = doc.getElementsByTagName(tagName);
  for (i = 0; i < elementList.length; i++) {
    attributeValue = elementList[i][GET_ATTRIBUTE](attributeName);
    if (attributeValue) {
      attributeList.push(attributeValue);
    }
  }

  return attributeList;
}

function findMatch(listOne, listTwo) {
  var lengthOne = listOne.length,
      lengthTwo = listTwo.length,
      i,
      j,
      match$$1;

  if (lengthOne !== lengthTwo) {
    return false;
  } else {
    for (i = 0; i < lengthOne; i++) {
      match$$1 = false;
      for (j = 0; j < lengthTwo; j++) {
        if (listOne[i].indexOf(listTwo[j]) !== -1) {
          match$$1 = true;
        }
      }
      if (!match$$1) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Checks if all img, script and object have loaded
 *
 * @method getAdLoaded
 * @returns {Number} 1 if ad is not loaded, 2 if ad is loaded
 */
function getAdLoaded() {
  var adLoaded = 3,
      imgElements = [],
      imgTimings = [],
      scriptElements = [],
      scriptTimings = [],
      objectElements = [],
      objectTimings = [],
      timingsHolder,
      i;

  // feature check
  if (win && win.performance && win.performance.getEntriesByType && typeof win.performance.getEntriesByType === 'function') {
    // collect elements
    imgElements = getListOfElementAttributes('img', 'src');
    scriptElements = getListOfElementAttributes('script', 'src');
    objectElements = getListOfElementAttributes('object', 'data');

    // collect timings
    timingsHolder = win.performance.getEntriesByType('resource');
    for (i = 0; i < timingsHolder.length; i++) {
      if (timingsHolder[i].initiatorType === 'img') {
        imgTimings.push(timingsHolder[i].name);
      } else if (timingsHolder[i].initiatorType === 'script') {
        scriptTimings.push(timingsHolder[i].name);
      } else if (timingsHolder[i].initiatorType === 'object') {
        objectTimings.push(timingsHolder[i].name);
      }
    }

    if (!findMatch(imgElements, imgTimings)) {
      adLoaded = 2;
    }

    if (!findMatch(scriptElements, scriptTimings)) {
      adLoaded = 2;
    }

    if (!findMatch(objectElements, objectTimings)) {
      adLoaded = 2;
    }

    if (adLoaded !== 2) {
      adLoaded = 1;
    }
  }

  return adLoaded;
}

function constructMetricsData(archive$$1, viewabilityBeaconUrl, methodInstance, additionalMetricsData, additionalData) {
  var data = '',
      timestamp = new Date().getTime();

  data += "sek=" + getSek(viewabilityBeaconUrl);
  data += '&gm0=' + methodInstance.inView100For0Sec;
  data += '&gm1=' + methodInstance.inView100For1Sec;
  //TODO data += '&tivt=' + Math.floor(archive.tivt/1000);
  data += '&tivt=' + methodInstance.totalInViewTime;
  data += '&hov=' + archive$$1.hov;
  data += '&tth=' + archive$$1.tth;
  data += '&intt=' + archive$$1.intt;
  data += '&intl=' + archive$$1.intl;
  data += '&tti=' + archive$$1.tti;
  data += '&st=' + getTimeDelta(pageStartTime, timestamp);
  data += '&foc=' + archive$$1.foc;
  // calculate/add addition dwell time
  if (doc && !doc[hidden]) {
    archive$$1.adt += getTimeDelta(archive$$1.dwellStartTime, timestamp);
  }
  data += '&adt=' + archive$$1.adt;
  data += '&scr=' + archive$$1.scr;
  data += '&ph=' + archive$$1.ph;
  data += '&scd=' + archive$$1.scd;
  data += '&svd=' + (archive$$1.scrolledDownTime > 0 ? Math.round(archive$$1.scrolledDownPixels / archive$$1.scrolledDownTime) : 0);
  data += '&svu=' + (archive$$1.scrolledUpTime > 0 ? Math.round(archive$$1.scrolledUpPixels / archive$$1.scrolledUpTime) : 0);
  data += '&sct=' + archive$$1.sct;
  data += '&mivp=' + methodInstance.maxInViewPercentage;
  data += '&mivt=' + methodInstance.maxInViewTime;
  //data += '&ls=' + (methodInstance.measurementBucket === '6' ? '2' : '3');
  data += '&ls=' + methodInstance.measurementBucket;
  data += '&winl=' + _encodeURIComponent(getDomain(loc));
  data += '&winr=' + _encodeURIComponent(getDomain(doc && doc.referrer));
  data += '&lvl=' + getNumberOfLevelsDown();
  //TODO figure this out
  data += '&atf=' + '0'; // + aboveTheFold Defaulting to Zero until implemented
  data += '&al=' + getAdLoaded();
  data += '&ae=' + archive$$1.ae;
  data += '&aw=' + getAdWeight();
  data += '&ao=' + getAncestorOrigins(archive$$1);
  data += '&sao=' + archive$$1.sao;
  data += '&lang=' + _encodeURIComponent(lang);
  data += '&sw=' + (winScreen ? winScreen.width : 0);
  data += '&sh=' + (winScreen ? winScreen.height : 0);
  data += '&tzo=' + new Date().getTimezoneOffset();
  data += '&plgn=' + _encodeURIComponent(getHashedPluginsString());
  data += '&ci=' + _encodeURIComponent(getCanvasImage());
  data += '&b=' + BUCKET_ID;
  data += '&ad=jv=' + JS_VERSION + (additionalData ? ':' + additionalData : '') + ":" + getCommonAdditionalData(methodInstance);

  if (additionalMetricsData) {
    data += "&" + additionalMetricsData;
  }

  return data;
}

function fireMetricsBeacon(archive$$1, viewabilityBeaconUrl, methodInstance, additionalMetricsData, additionalData) {
  try {
    beaconMe(METRICS_BEACON_DOMAIN + constructMetricsData(archive$$1, viewabilityBeaconUrl, methodInstance, additionalMetricsData, additionalData));
  } catch (ex) {}
}

/**
 * Base measurement method
 *
 * @class MeasurementMethod
 */
var MeasurementMethod = function MeasurementMethod(options) {
  /**
   * Initial calcuated ad width
   *
   * @property adWidth
   * @mandatory
   */
  this.adWidth = options.adWidth;
  /**
   * Initial calcuated ad height
   *
   * @property adHeight
   * @mandatory
   */
  this.adHeight = options.adHeight;

  /**
   * @method inViewCallback
   */
  this.inViewCallback = options.inViewCallback;

  /**
   * @method outOfViewCallback
   * @param {Boolean} forceBeacon
   */
  this.outOfViewCallback = options.outOfViewCallback;

  /**
   * @property thresholdPercentage
   */
  this.thresholdPercentage = options.thresholdPercentage || thresholdPercentage;

  /**
   * Current in view percentage
   *
   * @property inViewPercentage
   */
  this.inViewPercentage = 0;
  /**
   * All in view percentages used to calculate average
   *
   * @property inViewPercentages
   */
  this.inViewPercentages = [];
  /**
   * Max in view percentage
   *
   * @property maxInViewPercentage
   */
  this.maxInViewPercentage = 0;
  /**
   * @property inView
   */
  this.inView = false;
  /**
   * @property isMeasurable
   */
  this.isMeasurable = true;
  /**
   * @property isCurrentlyInView
   */
  this.isCurrentlyInView = false;
  /**
   * @property currentTimestamp
   */
  this.currentTimestamp = 0;
  /**
   * @property lastTimestamp
   */
  this.lastTimestamp = 0;
  /**
   * @property nextTimestamp
   */
  this.nextTimestamp = 0;
  /**
   * @property totalInViewTime
   */
  this.totalInViewTime = 0;
  /**
   * @property maxInViewTime
   */
  this.maxInViewTime = 0;
  /**
   * @property totalInView100Time
   */
  this.totalInView100Time = 0;
  /**
   * @property inView100StartTime
   */
  this.inView100StartTime = 0;
  /**
   * @property lastInView100Timestamp
   */
  this.lastInView100Timestamp = 0;
  /**
   * @property inView100For0Sec
   */
  this.inView100For0Sec = 0;
  /**
   * @property inView100For1Sec
   */
  this.inView100For1Sec = 0;
  /**
   * @property stopCallbacks
   */
  this.stopCallbacks = false;

  //video only methods.
  //TODO find a better way to initialize from options
  /**
   * Callback called when the ad is loaded. Used to start in viewport measurement calculation
   *
   * @method adLoaded
   * @mandatory
   */
  this.adLoaded = options.adLoaded;

  /**
   * Player id used to identify the player and inside-js instance for the subscription manager in case of flash.
   *
   * @method playerId
   * @mandatory
   */
  this.playerId = options.playerId;

  /**
   * Handle to adUnit's object to add listeners
   *
   * @property adUnit
   * @mandatory
   */
  this.adUnit = options.adUnit;

  /**
   * @property adSizeChanged
   * @mandatory
   */
  this.adSizeChanged = options.adSizeChanged;

  /**
   * @property adVideoComplete
   * @mandatory
   */
  this.adVideoComplete = options.adVideoComplete;

  /**
   * Will be set to true only when measurement method is flash and it is not supported.
   * But will be logged in addn_data all the time.
   * 0 - supported
   * 1 - not supported
   * 2 - timedout
   *
   * @property flashNotSupported
   */
  this.flashNotSupported = 0;
};

/**
 * Time period for which ad is to be in view to fire viewable beacon
 *
 * @property beaconTimeout
 * @default 1000
 */
MeasurementMethod.prototype.beaconTimeout = IN_VIEW_TIME_THRESHOLD;

/**
 * @property measurementBucket
 */
MeasurementMethod.prototype.measurementBucket = "2";

/**
 * @method init
 */
MeasurementMethod.prototype.init = function () {
  this.registerInViewListener();
};

/**
 * @method canApplyMethod
 * @return {Boolean}
 */
MeasurementMethod.prototype.canApplyMethod = function () {
  return false;
};

/**
 * @method registerInViewListener
 */
MeasurementMethod.prototype.registerInViewListener = function () {};

/**
 * @method inViewListenerCallback
 * @param {Object} entry
 */
MeasurementMethod.prototype.inViewListenerCallback = function (entry) {
  this.currentEntry = entry;
  this.currentTimestamp = entry.time;

  this.updateInViewPercentages(entry);

  if (this.isInView() && !doc[hidden]) {
    this.updateTimestamps();

    if (!this.isCurrentlyInView) {}
    this.isCurrentlyInView = true;

    // stopCallbacks will be set to true once all other requirements are met (2 seconds of video played in case of inside-video)
    if (!this.stopCallbacks) {
      this.inViewCallback();
    }

    if (this.isInView100()) {
      this.updateTimestamps100();
    } else {
      this.resetTimestamps100();
    }
  } else {
    if (this.isCurrentlyInView) {}
    this.resetTimestamps();
    this.resetTimestamps100();
    this.isCurrentlyInView = false;
    this.inView = false;

    if (!this.stopCallbacks) {
      this.outOfViewCallback();
    }
  }
};

/**
 * @method metViewableStandard
 */
MeasurementMethod.prototype.metViewableStandard = function () {
  this.inView = this.isCurrentlyInView;
  this.stopCallbacks = true;

  this.currentTimestamp = new Date().getTime();

  if (this.isCurrentlyInView) {
    this.updateTimestamps();
  } else {
    this.resetTimestamps();
  }
};

/**
 * @method updateInViewPercentages
 * @param {Object} entry
 */
MeasurementMethod.prototype.updateInViewPercentages = function (entry) {
  this.inViewPercentage = entry.intersectionRatio;

  if (this.maxInViewPercentage < this.inViewPercentage) {
    this.maxInViewPercentage = this.inViewPercentage;
  }

  this.inViewPercentages.push(this.inViewPercentage);
};

/**
 * Updates in-view, last and current timestamps
 * @method updateTimestamps
 * @return {Number} The last timestamp
 */
MeasurementMethod.prototype.updateTimestamps = function () {
  var timeDelta;

  if (this.lastTimestamp > 0) {
    timeDelta = this.currentTimestamp - this.lastTimestamp;
    this.totalInViewTime += timeDelta;
  }

  if (this.maxInViewTime < this.totalInViewTime) {
    this.maxInViewTime = this.totalInViewTime;
  }

  this.lastTimestamp = this.currentTimestamp;

  return this.lastTimestamp;
};

/**
 * @method isInView
 * @return {Boolean}
 */
MeasurementMethod.prototype.isInView = function () {
  //LOG("Measurement isInView : " + this.inViewPercentage);
  return this.inViewPercentage >= this.thresholdPercentage;
};

/**
 * Method to check if ad is sufficiently in view
 *
 * @method isSufficientlyInView
 * @return {Boolean}
 */
MeasurementMethod.prototype.isSufficientlyInView = function () {
  return this.totalInViewTime >= this.beaconTimeout;
};

/**
 * @method resetTimestamps
 */
MeasurementMethod.prototype.resetTimestamps = function () {
  this.lastTimestamp = this.nextTimestamp = this.totalInViewTime = 0;
  this.inViewPercentages = [];
};

//100% in view calculation

/**
 * @method updateTimestamps100
 * @param {Object} entry
 */
MeasurementMethod.prototype.updateTimestamps100 = function () {
  this.inView100For0Sec = 1;

  if (this.lastInView100Timestamp > 0) {
    this.totalInView100Time += this.currentTimestamp - this.lastInView100Timestamp;
  } else {
    this.inView100StartTime = this.currentTimestamp;
  }
  this.lastInView100Timestamp = this.currentTimestamp;

  if (this.totalInView100Time > this.beaconTimeout) {
    this.inView100For1Sec = 1;
  }
};

/**
 * @method isInView100
 * @return {Boolean}
 */
MeasurementMethod.prototype.isInView100 = function () {
  return this.inViewPercentage > PERCENT_IN_VIEW100_THRESHOLD;
};

/**
 * @method resetTimestamps100
 */
MeasurementMethod.prototype.resetTimestamps100 = function () {
  this.lastInView100Timestamp = this.totalInView100Time = this.inView100StartTime = 0;
};

/**
 * @method cleanup
 */
MeasurementMethod.prototype.cleanup = function () {};

/**
 * @method reset
 */
MeasurementMethod.prototype.reset = function () {};

/**
 * @method extends
 * @static
 */
MeasurementMethod.extend = function () {
  var child = function child(options) {
    child.parent.call(this, options);
  };

  child.prototype = Object.create !== undefined ? Object.create(this.prototype) : new this({});
  child.prototype.constructor = child;
  child.parent = this;

  child.extend = this.extend;

  //TODO add _super method if needed
  for (var i = 0; i < arguments.length; i++) {
    var forInObj = arguments[i];
    if (undefined !== forInObj.prototype) {
      forInObj = forInObj.prototype;
    }
    for (var m in forInObj) {
      if (forInObj.hasOwnProperty(m)) {
        child.prototype[m] = forInObj[m];
      }
    }
  }

  return child;
};

/**
 * @method getAverageInViewPercentage
 * @return {Number}
 */
//TODO : consider the time stamps when the percentages were recorded
MeasurementMethod.prototype.getAverageInViewPercentage = function () {
  var i,
      count = this.inViewPercentages.length,
      sum = 0;

  for (i = 0; i < count; i++) {
    sum += this.inViewPercentages[i];
  }

  return count ? Math.round(sum / count) : 0;
};

/**
 * Base measurement method for methods that check regularly
 *
 * @class RegularCheckMethod
 */
var RegularCheckMethod = MeasurementMethod.extend({
  /**
   * Timeout to use when ad is in view and to check it is in view for 'beaconTimeout' ms
   *
   * @property fineTimeout
   * @default 100
   */
  fineTimeout: FINE_TIMEOUT_DEFAULT,

  /**
   * Timeout used to when check ad comes in view
   *
   * @property fineTimeout
   * @default 750
   */
  coarseTimeout: COARSE_TIMEOUT_DEFAULT,

  /**
   * @method registerInViewListener
   */
  registerInViewListener: function registerInViewListener() {
    var that = this;
    this.timeout = this.notInViewTimerWrapper(function () {
      that.fireInViewListenerCallback();
    });
  },

  /**
   * Calculate in view percentage and call 'inViewListenerCallback'
   *
   * @method fireInViewListenerCallback
   */
  fireInViewListenerCallback: function fireInViewListenerCallback() {
    var entry = {
      intersectionRatio: this.getInViewPercentage(),
      time: new Date().getTime()
    },
        that = this;

    this.inViewListenerCallback(entry);

    this.timeout = this[this.isCurrentlyInView ? "inViewTimerWrapper" : "notInViewTimerWrapper"](function () {
      that.fireInViewListenerCallback();
    });
  },

  /**
   * Method to get in view percentage
   *
   * @method getInViewPercentage
   * @mandatory
   * @return {Number}
   */
  getInViewPercentage: function getInViewPercentage() {
    return 0;
  },

  /**
   * Wrapper Method to start a timer when ad is not in view
   *
   * @mthod notInViewTimerWrapper
   */
  notInViewTimerWrapper: function notInViewTimerWrapper(callback) {
    return setTimeout(callback, this.coarseTimeout);
  },

  /**
   * Wrapper Method to start a timer when ad is in view
   *
   * @mthod inViewTimerWrapper
   */
  inViewTimerWrapper: function inViewTimerWrapper(callback) {
    return setTimeout(callback, this.fineTimeout);
  },

  /**
   * Method to cleanup elements and other listeners created by the method
   *
   * @method cleanup
   */
  cleanup: function cleanup() {
    clearTimeout(this.timeout);
  },

  /**
   * @property measurementBucket
   */
  measurementBucket: "0"
});

/**
 * Geometric Method to measure is in view
 *
 * @class GeometricMethod
 * @extends RegularCheckMethod
 */

/**
 * @method browserMeasurement
 * @static
 * @private
 */
var browserMeasurement;

/**
 * @method measureWebkit
 * @static
 * @private
 */
function measureWebkit(p) {
  var v = {
    x: 0,
    y: 0
  };

  // p.x is the ad's left edge
  // p.y is the ad's top edge
  // p.scrlX is the viewport's left edge (set to 0 for Gecko)
  // p.scrlY is the viewport's top edge (set to 0 for Gecko)

  // left half of ad is in viewport
  // the ad's left edge is on the right side of the viewport's left edge AND
  // the middle of ad is on the left of the viewport's right edge
  if (p.x >= p.scrlX && p.x + p.halfWidth < p.scrlX + p.viewportWidth) {
    // distance to right edge: viewport's right edge - ad's left edge; vieweport's right edge = p.scrlX + p.viewportWidth
    v.x = p.scrlX + p.viewportWidth - p.x;
  }
  // right half of ad in viewport
  // the middle of ad is on the right of the viewport's left edge AND
  // the ad's right edge is on the left side of the viewport's right edge
  else if (p.x + p.halfWidth > p.scrlX && p.x + p.adWidth <= p.scrlX + p.viewportWidth) {
      // pixels from viewport's left edge that are in view
      // ad's right edge minus viewport's left edge; ad's right edge = p.x + p.adWidth
      v.x = p.x + p.adWidth - p.scrlX;
    }
    // viewport is smaller than the ad
    // ad's left edge is to the left of the viewport's left edge AND
    // ad's right edge is to the right of the viewport's right edge AND
    // the viewport is wider than half of the ad
    else if (p.x < p.scrlX && p.x + p.adWidth > p.scrlX + p.viewportWidth && p.viewportWidth >= p.halfWidth) {
        // viewable adWidth is the viewport width
        v.x = p.viewportWidth;
      }

  // top half of ad is in viewport
  // the ad's top edge is below the viewport's top edge AND
  // the middle of ad is above the viewport's bottom edge
  if (p.y >= p.scrlY && p.y + p.halfHeight < p.scrlY + p.viewportHeight) {
    // distance from top of ad to bottom of veiwport
    // to right edge: viewport's bottom edge - ad's top edge; vieweport's bottom edge = p.scrlY + p.viewportHeight
    v.y = p.scrlY + p.viewportHeight - p.y;
  }
  // bottom half of ad in viewport
  // the middle of ad is below the viewport's top edge AND
  // the ad's bottom edge is above the viewport's bottom edge
  else if (p.y + p.halfHeight > p.scrlY && p.y + p.adHeight <= p.scrlY + p.viewportHeight) {
      // pixels from viewport's top edge that are in view
      // ad's bottom edge minus viewport's top edge; ad's bottom edge = p.y + p.adHeight
      v.y = p.y + p.adHeight - p.scrlY;
    }
    // viewport is smaller than the ad
    // ad's top edge is above the viewport's top edge AND
    // ad's bottom edge is below the viewport's bottom edge AND
    // the viewport is wider than half of the ad
    else if (p.y < p.scrlY && p.y + p.adHeight > p.scrlY + p.viewportHeight && p.viewportHeight >= p.halfHeight) {
        // viewable adHeight is the viewport height
        v.y = p.viewportHeight;
      }

  return v;
}

/**
 * @method measureGecko
 * @static
 * @private
 */
function measureGecko(p) {
  // ensure p.scrlX and p.scrlY are set to zero, and call measureWebkit to reduce repeated code
  p.scrlX = 0;
  p.scrlY = 0;

  return measureWebkit(p);
}

/**
 * @method setBrowserMeasurement
 * @static
 * @private
 */
function setBrowserMeasurement() {
  // 1 == Chrome
  // 2 == Firefox
  // 3 == MSIE
  // 4 == Safari
  // 5 == Webkit
  // 6 == Gecko
  // 7 == other
  if (browserInt === 1 || browserInt === 4 || browserInt === 5 || browserInt === 7) {
    browserMeasurement = measureWebkit;
  } else if (browserInt === 2 || browserInt === 3 || browserInt === 6) {
    browserMeasurement = measureGecko;
  }
}

/**
 * @method calculate
 * @static
 * @private
 */
function calculate(config) {

  var frameCBR = config.bcr,
      frameWidth = config.adWidth,
      frameHeight = config.adHeight,

  // set frameSizeInPixels to 0 when frameWidth and/or frameHeight is either zero or undefined.
  frameSizeInPixels = frameWidth && frameHeight ? frameWidth * frameHeight : 0,
      wParent = win.parent,
      parentDoc = wParent.document,
      parentBody = parentDoc.body,
      e = {},
      result;

  // If frameSizeInPixels is 0, then 0 will be returned.
  // Rather than short-circuiting now, let's continue and set the debug data, if debug is enabled.

  // find position
  e.x = Math.round(frameCBR.left + parentBody.scrollLeft);
  e.y = Math.round(frameCBR.top + parentBody.scrollTop);
  e.adWidth = frameWidth;
  e.adHeight = frameHeight;
  e.halfWidth = Math.floor(frameWidth / 2);
  e.halfHeight = Math.floor(frameHeight / 2);
  // On some browsers, the client{Width,Height} are incorrect, so the comparison to window.inner{Width,Height} is needed.
  // On some browsers, the client{Width,Height} do not include the scrollbar width, so pixels covered by the scrollbars are still considered to be in view
  e.viewportWidth = Math.max(parentDoc.documentElement.clientWidth, win.innerWidth || 0);
  e.viewportHeight = Math.max(parentDoc.documentElement.clientHeight, win.innerHeight || 0);
  //changed the spelling on e to facilitate properties mangling
  e.scrlX = wParent.scrollX;
  e.scrlY = wParent.scrollY;

  result = browserMeasurement(e);

  if (result.x > frameWidth) {
    result.x = frameWidth;
  }

  if (result.y > frameHeight) {
    result.y = frameHeight;
  }

  // return 0 when frameSizeInPixels is 0
  return frameSizeInPixels ? Math.round(100 * result.x * result.y / frameSizeInPixels) : 0;
}

var GeometricMethod = RegularCheckMethod.extend({
  /**
   * @method init
   */
  init: function init() {
    setBrowserMeasurement();
    this.registerInViewListener();
  },

  /**
   * Method to get in view percentage
   *
   * @method getInViewPercentage
   * @mandatory
   * @return {Number}
   */
  getInViewPercentage: function getInViewPercentage() {
    try {
      return calculate({
        bcr: adWrapperElement.getBoundingClientRect(),
        adWidth: width,
        adHeight: height
      }, this);
    } catch (exception) {
      //console.log('geometric approach failed. ' + exception);
    }

    return 0;
  }
});

/**
 * Direct Gemoetric Method to measure viewability
 *
 * @class DirectGemoetricMethod
 * @extends GeometricMethod
 */
var DirectGeometricMethod = GeometricMethod.extend({
  /**
   * @method canApplyMethod
   * @return {Boolean}
   */
  canApplyMethod: function canApplyMethod() {
    return !isWebView && !isInFrame;
  },

  /**
   * @property measurementBucket
   */
  measurementBucket: "6"
});

/**
 * Friendly Frame method to be used when ad is in an iframe with access to parent window
 *
 * @class FriendlyFrameGeometricMethod
 * @extends GeometricMethod
 */
var FriendlyFrameGeometricMethod = GeometricMethod.extend({
  /**
   * @method canApplyMethod
   * @return {Boolean}
   */
  canApplyMethod: function canApplyMethod() {
    return !isWebView && hasTopAccess && isOneLevelDown;
  },

  /**
   * @property measurementBucket
   */
  measurementBucket: "2"
});

/**
 * Safe frame method in cross domain cases where the iframe has no access to parent window
 *
 * @class SafeFrameMethod
 * @extends RegularCheckMethod
 */
var SafeFrameMethod = RegularCheckMethod.extend({
  /**
   * Timeout used to check when ad comes in view
   *
   * @property fineTimeout
   * @default 750
   */
  coarseTimeout: FINE_TIMEOUT_DEFAULT,

  /**
   * @method canApplyMethod
   * @return {Boolean}
   */
  canApplyMethod: function canApplyMethod() {
    return !isWebView && isSafeFrame;
  },

  /**
   * @method getInViewPercentage
   * @return {Number}
   */
  getInViewPercentage: function getInViewPercentage() {
    return win.$sf.ext[IN_VIEW_PERCENTAGE]();
  },

  /**
   * @property measurementBucket
   */
  measurementBucket: "1"
});

/**
 * Method to be run on fire fox on cross domain cases which uses paint calls to get in view percentage
 *
 * @class FirefoxPaintMethod
 * @extends RegularCheckMethod
 */

/**
 * @method createIFrameTag
 * @private
 * @static
 * @param ffMethod {FirefoxPaintMethod}
 * @param id {Number}
 */
function createIFrameTag(ffMethod, id) {
  var tag,
      xy = id.split('_');

  if (xy.length === 2) {
    tag = doc.createElement('iframe');
    tag.style.cssText = 'width:' + TAG_SIZE + 'px;height:' + TAG_SIZE + 'px;left:' + xy[0] + 'px;top:' + xy[1] + 'px;position:absolute;background-color:transparent;';
    tag.scrolling = 'no';
    tag.allowtransparency = 'true';
    tag.hidefocus = 'true';
    tag.setAttribute('frameBorder', '0');
    tag.id = id;
    ffMethod.lastMozPaintCounts[id] = 0; // register id
    ffMethod.paintCounts[id] = 0; // register id
    ffMethod.paintTimestamps[id] = 0; // register id
    ffMethod.lastPaintCounts[id] = 0; // register id
    ffMethod.lastPaintTimestamps[id] = 0; // register id
  }

  return tag;
}

/**
 * @method appendTags
 * @private
 * @static
 * @param ffMethod {FirefoxPaintMethod}
 */
function appendTags(ffMethod) {
  var i;

  ffMethod.tags = getTagCoordinates(width, height);
  ffMethod.numTag = ffMethod.tags.length;
  ffMethod.tagArray = [];
  // create all the tags and keep them in an array (the array will be used to remove them after firing the beacon)
  for (i = 0; i < ffMethod.numTag; i++) {
    ffMethod.tagArray.push(createIFrameTag(ffMethod, ffMethod.tags[i]));
  }

  // add each element to the DOM
  for (i = 0; i < ffMethod.numTag; i++) {
    doc.body.appendChild(ffMethod.tagArray[i]);
  }
}

/**
 * @method toggleTagVisibility
 * @private
 * @static
 * @param ffMethod {FirefoxPaintMethod}
 * @param id {Number}
 */
function toggleTagVisibility(ffMethod, id) {
  var tag = doc.getElementById(id);
  if (tag) {
    tag.style.visibility = tag.style.visibility === HIDDEN_STRING ? VISIBLE_STRING : HIDDEN_STRING;
  }
}

/**
 * @method waitForUpdatedTimestamp
 * @private
 * @static
 * @param ffMethod {FirefoxPaintMethod}
 * @param timestamp {Number}
 * @param id {Number}
 */
function waitForUpdatedTimestamp(ffMethod, timestamp, id) {
  var mozPaintWindow, tag;

  ffMethod.paintTimestamps[id] = timestamp;

  if (timestamp > ffMethod.lastPaintTimestamps[id]) {
    tag = doc.getElementById(id);

    if (tag) {
      try {
        mozPaintWindow = tag.contentWindow;

        if (!mozPaintWindow.document) {
          mozPaintWindow = NULL;
        }
      } catch (ex) {
        mozPaintWindow = NULL;
      }
      if (mozPaintWindow && mozPaintWindow.mozPaintCount > ffMethod.lastMozPaintCounts[id]) {
        ffMethod.paintCounts[id] += 1;
        ffMethod.lastMozPaintCounts[id] = mozPaintWindow.mozPaintCount;
      }
    }
  }
}

/**
 * @method animate
 * @private
 * @static
 * @param ffMethod {FirefoxPaintMethod}
 * @param id {Number}
 */
function animate(ffMethod, id) {
  var requestAnimationFrame = win.requestAnimationFrame || win.mozRequestAnimationFrame || NULL;

  toggleTagVisibility(ffMethod, id);

  if (requestAnimationFrame) {
    requestAnimationFrame(function (timestamp) {
      waitForUpdatedTimestamp(ffMethod, timestamp, id);
    });
  }
}

/**
 * @method paint
 * @private
 * @static
 * @param ffMethod {FirefoxPaintMethod}
 */
function paint(ffMethod) {
  var i;

  for (i = 0; i < ffMethod.numTag; i++) {
    animate(ffMethod, ffMethod.tags[i]);
  }
}

/**
 * update paint counts and paint timestamps
 * @method updatePaintCounts
 * @static
 * @private
 * @param  {FirefoxPaintMethod} ffMethod
 * @return {Number}             number of tags painted
 */
function updatePaintCounts(ffMethod) {
  var i,
      id,
      numPaint = 0;

  for (i = 0; i < ffMethod.numTag; i++) {
    id = ffMethod.tags[i];
    if (ffMethod.paintTimestamps[id] > ffMethod.lastPaintTimestamps[id]) {
      if (ffMethod.paintCounts[id] > ffMethod.lastPaintCounts[id]) {
        numPaint += 1;
      }
      ffMethod.lastPaintCounts[id] = ffMethod.paintCounts[id];
      ffMethod.lastPaintTimestamps[id] = ffMethod.paintTimestamps[id];
    }
  }

  return numPaint;
}

var FirefoxPaintMethod = RegularCheckMethod.extend({
  /**
   * @method canApplyMethod
   * @return {Boolean}
   */
  canApplyMethod: function canApplyMethod() {
    return !isWebView && 'mozPaintCount' in win;
  },

  /**
   * Init function that sets up elements for paint calls and starts the viewability caluclations.
   *
   * @method init
   */
  init: function init() {
    this.lastMozPaintCounts = {};
    this.paintCounts = {};
    this.paintTimestamps = {};
    this.lastPaintCounts = {};
    this.lastPaintTimestamps = {};

    appendTags(this);
    paint(this);

    this.registerInViewListener();
  },

  /**
   * Gets the in view percentage based on paint counts
   *
   * @method getInViewPercentage
   * @return {Number}
   */
  getInViewPercentage: function getInViewPercentage() {
    var numPaint = updatePaintCounts(this);
    paint(this);
    return this.numTag ? 100.0 * numPaint / this.numTag : 0;
  },

  /**
   * Wrapper Method to start a timer when ad is not in view
   *
   * @mthod notInViewTimerWrapper
   */
  notInViewTimerWrapper: function notInViewTimerWrapper(callback) {
    var that = this;
    return setTimeout(function () {
      paint(that);
      that.timeout = setTimeout(callback, 0.5 * that.coarseTimeout);
    }, 0.5 * this.coarseTimeout);
  },

  /**
   * Wrapper Method to start a timer when ad is in view
   *
   * @mthod inViewTimerWrapper
   */
  inViewTimerWrapper: function inViewTimerWrapper(callback) {
    var that = this;
    return setTimeout(function () {
      paint(that);
      that.timeout = setTimeout(callback, 0.5 * that.fineTimeout);
    }, 0.5 * this.fineTimeout);
  },

  removeTags: function removeTags() {
    for (var i = 0; i < this.numTag; i++) {
      doc.body.removeChild(this.tagArray[i]);
    }
  },

  /**
   * Method to cleanup elements and other listeners created by the method
   *
   * @method cleanup
   */
  cleanup: function cleanup() {
    this.constructor.parent.prototype.cleanup.call(this);

    this.removeTags();
  },

  /**
   * Resets the grid
   *
   * @method reset
   */
  reset: function reset() {
    this.removeTags();
    appendTags(this);
  },

  measurementBucket: "3"
});

/*global swfobject*/
/**
 * Flash method to be used in cross domain and iframe has no access to parent
 *
 * @class FlashMeasurementMethod
 * @extends RegularCheckMethod
 */

/**
 * Determines the number of tags currently visible
 * @method countInView
 * @static
 * @private
 * @param {FlashMeasurementMethod} flMethod
 * @return {Number} The number of viewable tags
 */
function countInView(flMethod) {
  var i = 0,
      numPaint = 0;

  if (tabIsActive(flMethod)) {

    for (; i < flMethod.numTag; i++) {

      if (isFlashPainted(flMethod, i)) {
        numPaint++;
      }
    }
  }

  return numPaint;
}

/**
 * Get flash object by id
 *
 * @method flashGetObjectById
 * @param {String} objectIdStr
 * @return {DOMElement}
 */
function flashGetObjectById(objectIdStr) {
  var returnNode = null;
  var object = doc.getElementById(objectIdStr);

  if (object && object.nodeName === "OBJECT") {
    if (typeof object.SetVariable !== "undefined") {
      returnNode = object;
    } else {
      var node = object.getElementsByTagName(OBJECT)[0];
      if (node) {
        returnNode = node;
      }
    }
  }
  return returnNode;
}

/**
 * Helper method to determine if flash object is visible
 *
 * @method isFlashPainted
 * @static
 * @private
 * @param  {FlashMeasurementMethod} flMethod
 * @param  {Number} index The tag index (maps to a specific id 1 = Darla1)
 * @return {Boolean}      The true or false value
 */
function isFlashPainted(flMethod, index) {
  var minPaint,
      rect = flashGetObjectById('Darla' + index);

  if (rect && rect.jsCallback) {
    minPaint = flMethod.minFlashPaintCalls[flMethod.isCurrentlyInView ? 'fine' : 'coarse'];

    return rect.jsCallback('count') > minPaint;
  }

  return false;
}

/**
 * Determines whether or not the current browser tab is actually active or not
 *
 * Note:
 * We use the `Page Visibility API` for IE10+ and all other modern browsers
 *
 * @method tabIsActive
 * @static
 * @private
 * @param  {FlashMeasurementMethod} flMethod
 * @return {Boolean} The true or false value
 */
function tabIsActive(flMethod) {
  var actualTimeoutAmount, expectedTimeoutAmount;

  if (flMethod.tabVisibilityState !== undefined) {
    return flMethod.tabVisibilityState;
  }

  actualTimeoutAmount = flMethod.currentTimestamp - flMethod.previousTimestamp;
  expectedTimeoutAmount = flMethod.isCurrentlyInView ? flMethod.fineTimeout : flMethod.coarseTimeout;

  //TODO what is this check ?
  return actualTimeoutAmount / expectedTimeoutAmount < 5;
}

/**
 * @method listeners
 * @static
 * @private
 * @param {FlashMeasurementMethod} flMethod
 * Binds to event helpers (e.g. page visibility for modern browsers)
 */
function listeners(flMethod) {
  // TODO : should be a call to handleVisChange
  // set visibility to true
  flMethod.tabVisibilityState = true;
  // Handle page visibility change
  registerListener(visibilityChange, function () {
    flMethod.tabVisibilityState = !doc[hidden];
  });
}

/**
 * Creates a Flash tag
 * @method createFlashTag
 * @static
 * @private
 * @param  {String}  coords    The X/Y position of the tag
 * @param  {String}  id        The unique Id for the tag
 * @return {Element}           The tag element
 */
function createFlashTag(coords, id) {
  var outerTag = doc.createElement('div'),
      innerTag = doc.createElement('div'),
      xy = coords.split('_');

  innerTag.id = id;

  outerTag.style.cssText = 'width: ' + TAG_SIZE + 'px; height: ' + TAG_SIZE + 'px; left: ' + xy[0] + 'px; top: ' + xy[1] + 'px; position: absolute; background-color: transparent; filter: alpha(opacity=10); opacity: 0.1;';
  outerTag.classname = 'outer';
  outerTag.appendChild(innerTag);

  return outerTag;
}

/**
 * Renders the Flash tags container and appends the flash tags to it
 *
 * Notes:
 * installer - for express install set value to `playerProductInstall.swf`, otherwise leave blank
 * version   - for version detection, set to minimum required Flash Player version, or 0 (or 0.0.0), for no version detection
 *
 * @method appendFlashTags
 * @static
 * @private
 * @param {FlashMeasurementMethod} flMethod
 */
function appendFlashTags(flMethod) {
  var flashvars = {},
      i,
      installer = YIMG_URL + 'playerProductInstall.swf',
      params = {
    allowfullscreen: 'false',
    allowscriptaccess: 'always',
    bgcolor: '#ffffff',
    quality: 'high',
    wmode: 'transparent'
  },
      version$$1 = '11.4.0',
      id,
      attributes,
      tag;

  flMethod.tags = getTagCoordinates(width, height);
  flMethod.numTag = flMethod.tags.length;
  flMethod.tagArray = [];
  // create all the tags and keep them in an array (the array will be used to remove them after firing the beacon)
  for (i = 0; i < flMethod.numTag; i++) {
    id = 'Darla' + i;
    attributes = {
      align: 'middle',
      id: id,
      name: id,
      style: 'height: 1px; left: 50%; margin: -1px 0 0 -1px; position: absolute; top: 50%; width: 1px;'
    };

    tag = createFlashTag(flMethod.tags[i], id);
    flMethod.tagArray.push(tag);
    doc.body.appendChild(tag);

    swfobject.embedSWF(YIMG_URL + 'Darla.swf', id, 1, 1, version$$1, installer, flashvars, params, attributes);
  }

  // render flashContent div in case it is not replaced with a swf object
  swfobject.createCSS('#flashContent', 'display: block; text-align: left;');
}

/**
 * Setup flash tags container and begin tracking tag elements
 *
 * @method loadSwfobjectInterval
 * @static
 * @private
 * @param {FlashMeasurementMethod} flMethod
 * @param {Function} callback
 */
function loadSwfobjectInterval(flMethod, callback) {
  var rect = flashGetObjectById('Darla0'),
      curTime = new Date().getTime();

  if (rect && rect.jsCallback) {
    clearInterval(loadSwfobjectInterval.hook);
    flMethod.lastTimestamp = curTime;
    callback();
  } else if (curTime - loadSwfobjectInterval.time >= FLASH_TAGS_LOAD_TIMEOUT) {
    clearInterval(loadSwfobjectInterval.hook);
    //user didnt whitelist flash in time
    flMethod.markFlashNotSupported(true);
  }
}

var FlashMeasurementMethod = RegularCheckMethod.extend({
  /**
   * @method canApplyMethod
   * @return {Boolean}
   */
  canApplyMethod: function canApplyMethod() {
    //return !isWebView && (browser === 'chrome' || browser === 'msie' || browser === 'trident' || browser === 'opera'); // browser === 'safari'
    return !isWebView && browser !== 'safari';
  },

  loadSwfObject: function loadSwfObject() {
    var intervalId,
        parentBody = doc.getElementsByTagName('body')[0],
        swfobjectScript,
        that = this;

    if (parentBody) {
      swfobjectScript = doc.createElement('script');
      swfobjectScript.setAttribute('src', YIMG_URL + 'swfobject.js');
      parentBody.appendChild(swfobjectScript);

      intervalId = setInterval(function () {
        if ((typeof swfobject === 'undefined' ? 'undefined' : _typeof(swfobject)) === 'object') {
          clearInterval(intervalId);
          listeners(that);

          if (swfobject.hasFlashPlayerVersion("9.0.0")) {
            appendFlashTags(that);
            loadSwfobjectInterval.time = new Date().getTime();
            loadSwfobjectInterval.hook = setInterval(function () {
              loadSwfobjectInterval(that, function () {
                that.flashTagsLoaded = true;
                that.registerInViewListener();
              });
            }, 100);
          } else {
            that.markFlashNotSupported();
          }
        }
      }, 100);
    }
  },

  /**
   * Loads swfobject.js
   *
   * @method init
   */
  init: function init() {
    this.minFlashPaintCalls = {
      fine: 1,
      coarse: Math.floor(this.coarseTimeout / 100)
    };
    this.flashTagsLoaded = false;

    this.loadSwfObject();
  },

  /**
   * Method to get in view percentage
   *
   * @method getInViewPercentage
   * @return {Number}
   */
  getInViewPercentage: function getInViewPercentage() {
    return (countInView(this) || 0) * 100 / this.numTag;
  },

  /**
   * Determines whether or not the viewable time meets our minimum threshold
   * @method isSufficientlyInView
   * @return {Boolean} The true or false value
   */
  isSufficientlyInView: function isSufficientlyInView() {
    //TODO we only check for half the beacon time !!
    var half = this.beaconTimeout / this.fineTimeout / 2;

    //TODO why archive.ivd ???
    //this.ivd = this.totalInViewTime;

    return this.isCurrentlyInView && this.totalInViewTime > this.beaconTimeout && this.inViewPercentages.length > half;
  },

  /**
   * Determines the amount of time before the next incrementalFlashCheck
   * @method inViewTimerWrapper
   * @return {Number}
   */
  inViewTimerWrapper: function inViewTimerWrapper(callback) {
    var timeout;

    if (!this.nextTimestamp || this.nextTimestamp === 0) {
      this.nextTimestamp = this.currentTimestamp;
    }

    this.nextTimestamp += this.fineTimeout;

    timeout = this.nextTimestamp - this.currentTimestamp;

    if (timeout > this.fineTimeout) {
      timeout = this.fineTimeout;
    }

    if (timeout < 0) {
      timeout = this.fineTimeout / 2;
    }

    return setTimeout(callback, timeout);
  },

  removeTags: function removeTags() {
    for (var i = 0; i < this.numTag; i++) {
      swfobject.removeSWF('Darla' + i);
    }
  },

  /**
   * Removes all flash tags from the tags container element
   *
   * @method cleanup
   */
  cleanup: function cleanup() {
    this.constructor.parent.prototype.cleanup.call(this);
    this.removeTags();
  },

  /**
   * Resets the grid
   *
   * @method reset
   */
  reset: function reset() {
    if ((typeof swfobject === 'undefined' ? 'undefined' : _typeof(swfobject)) !== 'object') {
      this.loadSwfObject();
    } else {
      this.removeTags();
      appendFlashTags(this);
    }
  },

  /**
   * Flash load failed for some reason.
   *
   * @method markFlashNotSupported
   */
  markFlashNotSupported: function markFlashNotSupported(flashLoadTimedout) {
    this.cleanup();
    this.isMeasurable = false;
    this.flashNotSupported = 1 + (flashLoadTimedout ? 1 : 0);

    if (!this.stopCallbacks) {
      this.stopCallbacks = true;
      this.outOfViewCallback(true);
    }
  },

  measurementBucket: "4"
});

/**
 * Uses IntersectionObserver api currently available on chrome 51.0+
 *
 * @class IntersectionObserverMethod
 * @extends MeasurementMethod
 */
var IntersectionObserverMethod = MeasurementMethod.extend({
  /**
   * @method canApplyMethod
   * @return {Boolean}
   */
  canApplyMethod: function canApplyMethod() {
    return !isWebView && !isSafeFrame && undefined !== win.IntersectionObserver;
  },

  /**
   * @method registerInViewListener
   */
  registerInViewListener: function registerInViewListener() {
    var that = this;

    var thresholds = [];
    for (var i = this.thresholdPercentage / 100; i < MAX_INTERSECTION_RATIO; i += INTERSECTION_OBSERVER_THRESHOLD_STEP) {
      thresholds.push(i);
    }
    thresholds.push(MAX_INTERSECTION_RATIO);

    this.io = new win.IntersectionObserver(function (entries) {
      var entry;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].target === adWrapperElement) {
          entry = entries[i];
          break;
        }
      }
      if (entry) {
        that.inViewListenerCallback({
          intersectionRatio: entries[0].intersectionRatio * 100,
          time: new Date().getTime()
        });
      }
    }, {
      threshold: thresholds
    });

    this.io.observe(adWrapperElement);
  },

  /**
   * @method cleanup
   */
  cleanup: function cleanup() {
    if (this.io) {
      this.io.disconnect();
    }
  },

  /**
   * @property measurementBucket
   */
  measurementBucket: "7"
});

/**
 * Method used in web view on mobiles where mraid is supported
 *
 * @class MraidMethod
 * @extends MeasurementMethod
 */
var MraidMethod = MeasurementMethod.extend({
  /**
   * @method canApplyMethod
   * @returns {Boolean}
   */
  canApplyMethod: function canApplyMethod() {
    return isWebView && undefined !== win.mraid;
  },

  /**
   * @method registerInViewListener
   */
  registerInViewListener: function registerInViewListener() {
    var that = this;

    //used to remove listener
    that.mraidVersion = win.mraid.getVersion && win.mraid.getVersion();
    if (that.mraidVersion === "3.0") {
      //ref: http://www.iab.com/wp-content/uploads/2016/11/MRAID-V3_Draft_for_Public_Comment.pdf
      this.viewableChangeEventListener = function (intersectionRatio) {
        that.inViewListenerCallback({
          time: new Date().getTime(),
          intersectionRatio: intersectionRatio
        });
      };
      win.mraid.addEventListener('exposureChange', this.viewableChangeEventListener);
    } else {
      this.viewableChangeEventListener = function () {
        that.inViewListenerCallback({
          time: new Date().getTime(),
          //mraid doesnt give exact intersectionRatio as of now
          intersectionRatio: win.mraid.isViewable() ? 100 : 0
        });
      };

      win.mraid.addEventListener("viewableChange", this.viewableChangeEventListener);
    }
  },

  /**
   * @method cleanup
   */
  cleanup: function cleanup() {
    if (this.mraidVersion === "3.0") {
      win.mraid.removeEventListener("exposureChange", this.viewableChangeEventListener);
    } else {
      win.mraid.removeEventListener("viewableChange", this.viewableChangeEventListener);
    }
  },

  /**
   * @property measurementBucket
   */
  measurementBucket: "8"
});

/**
 * Method used in web view on GOOGLE AMP Pages on mobiles
 *
 * ref: https://github.com/ampproject/amphtml/blob/master/ads/README.md#ad-viewability
 *
 * @class AmpMethod
 * @extends MeasurementMethod
 */
var AmpMethod = MeasurementMethod.extend({
  /**
   * @method canApplyMethod
   * @returns {Boolean}
   */
  canApplyMethod: function canApplyMethod() {
    return !isWebView && !isSafeFrame && undefined !== win.context && undefined !== win.context.observeIntersection;
  },

  /**
   * @method registerInViewListener
   */
  registerInViewListener: function registerInViewListener() {
    var that = this;

    //returns the function to remove listener
    that.cleanup = win.context.observeIntersection(function (entries) {
      // get most recent entry by time
      entries = entries.sort(function (a, b) {
        return a.time > b.time;
      });
      entries.forEach(function (entry) {
        that.inViewListenerCallback({
          time: entry.time,
          intersectionRatio: entry.intersectionRatio * 100
        });
      });
    });
  },

  /**
   * @property measurementBucket
   */
  measurementBucket: "9"
});

/**
 * Method using performance optimizations on safari when calling requestAnimationFrame when out of view.
 *
 * @class PerfMethod
 * @extends RegularCheckMethod
 */

//Repeated code. Will be cleaned up with GroupM changes

/**
 * @method createIFrameTag
 * @private
 * @static
 * @param pMethod {PerfMethod}
 * @param id {Number}
 */
function createIFrameTag$1(pMethod, id) {
  var tag,
      xy = id.split('_');

  if (xy.length === 2) {
    tag = doc.createElement('iframe');
    tag.style.cssText = 'width:' + TAG_SIZE + 'px;height:' + TAG_SIZE + 'px;left:' + xy[0] + 'px;top:' + xy[1] + 'px;position:absolute;background-color:transparent;';
    tag.scrolling = 'no';
    tag.allowtransparency = 'true';
    tag.hidefocus = 'true';
    tag.setAttribute('frameBorder', '0');
    tag.id = id;
    pMethod.painted[id] = 0; // register id
  }

  return tag;
}

/**
 * @method appendTags
 * @private
 * @static
 * @param pMethod {PerfMethod}
 */
function appendTags$1(pMethod) {
  var i;

  pMethod.tags = getTagCoordinates(width, height);
  pMethod.numTag = pMethod.tags.length;
  pMethod.tagArray = [];
  // create all the tags and keep them in an array (the array will be used to remove them after firing the beacon)
  for (i = 0; i < pMethod.numTag; i++) {
    pMethod.tagArray.push(createIFrameTag$1(pMethod, pMethod.tags[i]));
  }

  // add each element to the DOM
  for (i = 0; i < pMethod.numTag; i++) {
    doc.body.appendChild(pMethod.tagArray[i]);
  }
}

var PerfMethod = RegularCheckMethod.extend({
  /**
   * @method canApplyMethod
   * @return {Boolean}
   */
  canApplyMethod: function canApplyMethod() {
    //requestAnimationFrame method only works in safari v9+
    return !isWebView && 'requestAnimationFrame' in win && 'cancelAnimationFrame' in win && browser === 'safari' && Number(version) >= 10;
  },

  setupHandlerPerTag: function setupHandlerPerTag(id) {
    var tagWin = this.tagArray[id].contentWindow,
        that = this;
    if (tagWin) {
      //using window of the iframe as a reference for all variables
      tagWin.prevTimestamp = new Date().getTime();
      if (tagWin.animationFrameRequest) {
        tagWin.cancelAnimationFrame(tagWin.animationFrameRequest);
        this.painted[id] = 0;
      }

      tagWin.animationFrameRequest = tagWin.requestAnimationFrame(function () {
        var currentTimestamp = new Date().getTime();

        if (currentTimestamp - tagWin.prevTimestamp < that.fineTimeout / 2) {
          that.painted[id] = 1;
        } else {
          that.painted[id] = 0;
        }
        tagWin.prevTimestamp = currentTimestamp;
      });
    }
  },

  setupHandlers: function setupHandlers() {
    for (var i = 0; i < this.numTag; i++) {
      this.setupHandlerPerTag(i);
    }
  },

  /**
   * Init function that sets up elements for paint calls and starts the viewability caluclations.
   *
   * @method init
   */
  init: function init() {
    this.painted = {};

    appendTags$1(this);
    this.setupHandlers();

    this.registerInViewListener();
  },

  /**
   * Gets the in view percentage based on paint counts
   *
   * @method getInViewPercentage
   * @return {Number}
   */
  getInViewPercentage: function getInViewPercentage() {
    var paintCount = 0;
    for (var i = 0; i < this.numTag; i++) {
      paintCount += this.painted[i];
      //reset painted
      this.painted[i] = 0;
    }
    this.setupHandlers();
    return this.numTag ? 100.0 * paintCount / this.numTag : 0;
  },

  /**
   * Wrapper Method to start a timer when ad is not in view
   *
   * @mthod notInViewTimerWrapper
   */
  notInViewTimerWrapper: function notInViewTimerWrapper(callback) {
    var that = this;
    return setTimeout(function () {
      that.setupHandlers();
      that.timeout = setTimeout(callback, 0.5 * that.coarseTimeout);
    }, 0.5 * this.coarseTimeout);
  },

  /**
   * Wrapper Method to start a timer when ad is in view
   *
   * @mthod inViewTimerWrapper
   */
  inViewTimerWrapper: function inViewTimerWrapper(callback) {
    var that = this;
    return setTimeout(function () {
      that.setupHandlers();
      that.timeout = setTimeout(callback, 0.5 * that.fineTimeout);
    }, 0.5 * this.fineTimeout);
  },

  removeTags: function removeTags() {
    for (var i = 0; i < this.numTag; i++) {
      doc.body.removeChild(this.tagArray[i]);
    }
  },

  /**
   * Method to cleanup elements and other listeners created by the method
   *
   * @method cleanup
   */
  cleanup: function cleanup() {
    this.constructor.parent.prototype.cleanup.call(this);

    this.removeTags();
  },

  /**
   * Resets the grid
   *
   * @method reset
   */
  reset: function reset() {
    this.removeTags();
    appendTags$1(this);
  },

  measurementBucket: "10"
});

/**
 * Method where there is for no measurable. It is to provide same api for non measurable case.
 *
 * @class NotMeasurableMethod
 */
var NotMeasurableMethod = MeasurementMethod.extend({
  /**
   * @method canApplyMethod
   * @return {Boolean}
   */
  canApplyMethod: function canApplyMethod() {
    return true;
  },

  /**
   * call the inViewCallback during init
   * @method init
   */
  init: function init() {
    this.isMeasurable = false;
    this.outOfViewCallback(true);
  },

  /**
   * @property measurementBucket
   */
  measurementBucket: "5"
});

/**
 * Method for video viewability.
 *
 * @class VideoMethod
 */
var VideoMethod = MeasurementMethod.extend({
  init: function init() {
    /**
     * @property adClicked
     */
    this.adClicked = false;
    /**
     * @property adErrored
     */
    this.adErrored = false;
    /**
     * @property minVolume
     */
    this.minVolume = 999;
    /**
     * @property timeAtMinVolume
     */
    this.timeAtMinVolume = 0;
    /**
     * @property maxTimeAtMinVolume
     */
    this.maxTimeAtMinVolume = 0;
    /**
     * @property currentlyAtMinVolume
     */
    this.currentlyAtMinVolume = false;
    /**
     * @property maxVolume
     */
    this.maxVolume = 0;
    /**
     * @property timeAtMaxVolume
     */
    this.timeAtMaxVolume = 0;
    /**
     * @property maxTimeAtMaxVolume
     */
    this.maxTimeAtMaxVolume = 0;
    /**
     * @property currentlyAtMaxVolume
     */
    this.currentlyAtMaxVolume = false;
    /**
     * @property playerWidth
     */
    this.playerWidth = 0;
    /**
     * @property playerHeight
     */
    this.playerHeight = 0;

    this.playerSizeIsValid = false;

    /**
     * @property adHasLoaded
     */
    this.adHasLoaded = false;
    /**
     * @property adHasStarted
     */
    this.adHasStarted = false;
    /**
     * @property adImpressionFired
     */
    this.adImpressionFired = false;
    /**
     * @property adVideoCompleteFired
     */
    this.adVideoCompleteFired = false;
    /**
     * @property adUserCloseFired
     */
    this.adUserCloseFired = false;
    /**
     * @property adSkippedFired
     */
    this.adSkippedFired = false;
    /**
     * @property adStoppedFired
     */
    this.adStoppedFired = false;

    if (this.adUnit) {
      this.subscribeToEvents();
    }
  },

  /**
   * @method subscribeToEvents
   */
  subscribeToEvents: function subscribeToEvents() {
    this.adUnit.subscribe(this.adLoadedWrapper, "AdLoaded", this, this.playerId);
    this.adUnit.subscribe(this.adStartedPlaying, "AdStarted", this, this.playerId);
    this.adUnit.subscribe(this.adStartedPlaying, "AdVideoStart", this, this.playerId);
    this.adUnit.subscribe(this.adImpressionHandler, "AdImpression", this, this.playerId);
    //resumed
    this.adUnit.subscribe(this.adStartedPlaying, "AdPlaying", this, this.playerId);
    this.adUnit.subscribe(this.adStoppedPlaying, "AdPaused", this, this.playerId);
    this.adUnit.subscribe(this.adStoppedHandler, "AdStopped", this, this.playerId);
    this.adUnit.subscribe(this.adVideoCompleteHandler, "AdVideoComplete", this, this.playerId);
    this.adUnit.subscribe(this.adUserCloseHandler, "AdUserClose", this, this.playerId);
    this.adUnit.subscribe(this.adSkippedHandler, "AdSkipped", this, this.playerId);
    this.adUnit.subscribe(this.playerError, "AdError", this, this.playerId);
    this.adUnit.subscribe(this.adClickedHandler, "AdClickThru", this, this.playerId);

    this.adUnit.subscribe(this.adSizeChangeHandler, "AdSizeChange", this, this.playerId);
    this.adUnit.subscribe(this.adExpandedChangeHandler, "AdExpandedChange", this, this.playerId);
    this.adUnit.subscribe(this.adVolumeChangeHandler, "AdVolumeChange", this, this.playerId);
  },

  /**
   * @method unsubscribeToEvents
   */
  unsubscribeToEvents: function unsubscribeToEvents() {
    this.adUnit.unsubscribe(this.adLoadedWrapper, "AdLoaded", this.playerId);
    this.adUnit.unsubscribe(this.adStartedPlaying, "AdStarted", this.playerId);
    this.adUnit.unsubscribe(this.adStartedPlaying, "AdVideoStart", this.playerId);
    this.adUnit.unsubscribe(this.adImpressionHandler, "AdImpression", this.playerId);
    //resumed
    this.adUnit.unsubscribe(this.adStartedPlaying, "AdPlaying", this.playerId);
    this.adUnit.unsubscribe(this.adStoppedPlaying, "AdPaused", this.playerId);
    this.adUnit.unsubscribe(this.adStoppedHandler, "AdStopped", this.playerId);
    this.adUnit.unsubscribe(this.adVideoCompleteHandler, "AdVideoComplete", this.playerId);
    this.adUnit.unsubscribe(this.adUserCloseHandler, "AdUserClose", this.playerId);
    this.adUnit.unsubscribe(this.adSkippedHandler, "AdSkipped", this.playerId);
    this.adUnit.unsubscribe(this.playerError, "AdError", this.playerId);
    this.adUnit.unsubscribe(this.adClickedHandler, "AdClickThru", this.playerId);

    this.adUnit.unsubscribe(this.adSizeChangeHandler, "AdSizeChange", this.playerId);
    this.adUnit.unsubscribe(this.adExpandedChangeHandler, "AdExpandedChange", this.playerId);
    this.adUnit.unsubscribe(this.adVolumeChangeHandler, "AdVolumeChange", this.playerId);
  },

  /**
   * @method updateTimestamps
   */
  updateTimestamps: function updateTimestamps() {
    this.currentTimestamp = new Date().getTime();

    if (this.lastTimestamp > 0) {
      var timeDiff = this.currentTimestamp - this.lastTimestamp;

      //calculate volume times only if the adUnit has getAdVolume api (vpaid >= 2.0)
      if (this.adUnit && this.adUnit.getAdVolume) {
        //update times only if volume is at max/min
        if (this.currentlyAtMinVolume) {
          this.timeAtMinVolume += timeDiff;
          if (this.timeAtMinVolume > this.maxTimeAtMinVolume) {
            this.maxTimeAtMinVolume = this.timeAtMinVolume;
          }
        }

        if (this.currentlyAtMaxVolume) {
          this.timeAtMaxVolume += timeDiff;
          if (this.timeAtMaxVolume > this.maxTimeAtMaxVolume) {
            this.maxTimeAtMaxVolume = this.timeAtMaxVolume;
          }
        }
      }
    }

    this.constructor.parent.prototype.updateTimestamps.call(this);
  },

  /**
   * @method resetVolumeTimestamps
   */
  resetVolumeTimestamps: function resetVolumeTimestamps() {
    this.timeAtMinVolume = this.timeAtMaxVolume = 0;
  },

  /**
   * @method resetTimestamps
   */
  resetTimestamps: function resetTimestamps() {
    this.resetVolumeTimestamps();
    this.constructor.parent.prototype.resetTimestamps.call(this);
  },

  /**
   * @method updateAdVolume
   */
  updateAdVolume: function updateAdVolume() {
    //calculate volume only if the adUnit has getAdVolume api (vpaid >= 2.0)
    if (this.adUnit && this.adUnit.getAdVolume) {
      var curVolume = this.adUnit.getAdVolume();

      //reset times only if volume changed
      //this function is called when timer is started
      if (curVolume < this.minVolume) {
        this.minVolume = curVolume;
        this.resetVolumeTimestamps();
        this.currentlyAtMinVolume = true;
      } else if (curVolume !== this.minVolume) {
        this.currentlyAtMinVolume = false;
      }
      if (curVolume > this.maxVolume) {
        this.maxVolume = curVolume;
        this.resetVolumeTimestamps();
        this.currentlyAtMaxVolume = true;
      } else if (curVolume !== this.maxVolume) {
        this.currentlyAtMaxVolume = false;
      }
    }
  },

  /**
   * @method adLoadedWrapper
   */
  adLoadedWrapper: function adLoadedWrapper() {
    this.adHasLoaded = true;
    //update player size when ad loaded
    this.updatePlayerSize();
    this.adLoaded();
  },

  /**
   * Starts a timer when ad is played/resumed with 'VIDEO_PLAY_DURATION_THRESHOLD' timeout.
   * 
   * @method adStartedPlaying
   */
  adStartedPlaying: function adStartedPlaying() {
    this.adHasStarted = true;

    //update the volume if it changed
    this.updateAdVolume();
    this.updateTimestamps();
    this.adSizeChangeHandler();

    this.isCurrentlyInView = true;

    if (!this.stopCallbacks) {
      this.inViewCallback();
    }
  },

  /**
   * @method adImpressionHandler
   */
  adImpressionHandler: function adImpressionHandler() {
    this.adImpressionFired = true;
  },

  /**
   * Stops the timer for ad played/resumed.
   *
   * @method adStoppedPlaying
   */
  adStoppedPlaying: function adStoppedPlaying(adEnded) {
    this.currentTimestamp = new Date().getTime();

    this.resetTimestamps();

    this.isCurrentlyInView = false;

    if (!this.stopCallbacks || adEnded) {
      this.outOfViewCallback(adEnded);
    }
  },

  /**
   * End ad and make callbacks.
   *
   * @method endAd
   */
  endAd: function endAd() {
    this.adStoppedPlaying(true);

    this.unsubscribeToEvents();
  },

  /**
   * @method adStoppedHandler
   */
  adStoppedHandler: function adStoppedHandler() {
    this.adStoppedFired = true;

    this.endAd();
  },

  /**
   * @method adVideoCompleteHandler
   */
  adVideoCompleteHandler: function adVideoCompleteHandler() {
    this.updateAdVolume();

    this.adVideoCompleteFired = true;

    this.adVideoComplete();

    this.endAd();
  },

  /**
   * @method adUserCloseHandler
   */
  adUserCloseHandler: function adUserCloseHandler() {
    this.adUserCloseFired = true;

    this.endAd();
  },

  /**
   * @method adSkippedHandler
   */
  adSkippedHandler: function adSkippedHandler() {
    this.adSkippedFired = true;

    this.endAd();
  },

  /**
   * Player errored out
   *
   * @method playerError
   */
  playerError: function playerError() {
    this.updateTimestamps();

    //mark as not measurable if ad impression is not fired
    this.isMeasurable = this.adImpressionFired;
    //mark as not viewed
    this.isCurrentlyInView = false;
    this.inView = false;
    //stop all callbacks as this will be fired as not measurable
    this.stopCallbacks = true;
    this.adErrored = true;

    this.outOfViewCallback(true);

    this.unsubscribeToEvents();
  },

  /**
   * Ad was clicked
   *
   * @method adClickedHandler
   */
  adClickedHandler: function adClickedHandler() {
    this.updateTimestamps();

    //clicking an ad is to be marked as viewed as per IAB
    this.adClicked = true;

    if (!this.stopCallbacks) {
      this.inViewCallback(true);
    }

    //stop all callbacks as this should have fired the beacon
    this.stopCallbacks = true;

    this.unsubscribeToEvents();
  },

  updatePlayerSize: function updatePlayerSize() {
    var size = getSizeFromElement(adElement);
    this.playerWidth = size.width;
    this.playerHeight = size.height;
    this.playerSizeIsValid = size.valid;
  },

  /**
   * Ad was resized
   *
   * @method adSizeChangeHandler
   */
  adSizeChangeHandler: function adSizeChangeHandler() {
    this.updateTimestamps();

    setAdSize(this.adUnit.adWidth, this.adUnit.adHeight);
    this.updatePlayerSize();

    if (!this.stopCallbacks) {
      this.adSizeChanged();
    }
  },

  /**
   * Ad expanded state was changed
   *
   * @method adExpandedChangeHandler
   */
  adExpandedChangeHandler: function adExpandedChangeHandler() {
    this.updateTimestamps();

    setAdSize(this.adUnit.adWidth, this.adUnit.adHeight);

    if (!this.stopCallbacks) {
      this.adSizeChanged();
    }
  },

  /**
   * Ad volume was changed
   *
   * @method adVolumeChangeHandler
   */
  adVolumeChangeHandler: function adVolumeChangeHandler() {
    this.updateAdVolume();
    this.updateTimestamps();
  },

  /**
   * @method metViewableStandard
   */
  metViewableStandard: function metViewableStandard() {
    this.constructor.parent.prototype.metViewableStandard.call(this);
    //if ad has not loaded or strated mark as not measurable
    this.isMeasurable = this.adHasLoaded && this.adHasStarted && this.adImpressionFired && this.isMeasurable;
    //if ad was not measurable mark as not viewable too
    this.inView = this.isMeasurable && this.inView;
  },

  /**
   * @method cleanup
   */
  cleanup: function cleanup() {
    this.unsubscribeToEvents();
  },

  /**
   * @method getVideoEventBits
   */
  getVideoEventBits: function getVideoEventBits() {
    return (this.adHasLoaded << 0) + (this.adHasStarted << 1) + (this.adImpressionFired << 2) + (this.adVideoCompleteFired << 3) + (this.adUserCloseFired << 4) + (this.adSkippedFired << 5) + (this.adStoppedFired << 6);
  }
});

function Timer(timeout, callback) {
  this.timeout = timeout;
  this.callback = callback;

  this.timeoutRef = 0;
}

Timer.prototype.startTimer = function (forceCallback) {
  var that = this;

  if (forceCallback) {
    this.callback(forceCallback);
  } else if (!this.timeoutRef) {
    this.timeoutRef = setTimeout(function () {
      that.callback(forceCallback);
    }, this.timeout);
  }
};

Timer.prototype.stopTimer = function (forceCallback) {
  clearTimeout(this.timeoutRef);
  this.timeoutRef = 0;

  if (forceCallback) {
    this.callback(forceCallback);
  }
};

var methodSelectionOrder = [MraidMethod, IntersectionObserverMethod, AmpMethod, DirectGeometricMethod, FriendlyFrameGeometricMethod, SafeFrameMethod, FirefoxPaintMethod, PerfMethod, FlashMeasurementMethod, NotMeasurableMethod];
var viewabilityBeaconUrl = "";
var viewportMethodInstance;
var viewportMethodIsInitialized = false;
var videoMethodInstance;
var hasFiredBeacon = false;
var hasFiredMetricsBeacon = false;
var timer;
var vpaidVersion = "2";
var elementDetected = false;

function getAdditionalData() {
  var additionalData = "vd=1";
  additionalData += ":vv=" + vpaidVersion;
  additionalData += ":clk=" + (videoMethodInstance.adClicked ? "1" : "0");
  additionalData += ":err=" + (videoMethodInstance.adErrored ? "1" : "0");
  additionalData += ":ve=" + videoMethodInstance.getVideoEventBits();
  additionalData += ":ed=" + (elementDetected ? "1" : "0");
  //debug avoc to check a differet way of detecting avoc,
  //this is for not muted only on completion
  //avoc in metrics beacon is never muted
  additionalData += ":avoc=" + archive.avoc_debug;
  //player size was taken from a valid player element
  additionalData += ":psv=" + (elementDetected && videoMethodInstance.playerSizeIsValid ? "1" : "0");
  //videoSlotCanAutoPlay is passed to init of vpaid wrapper
  additionalData += ":ap=" + (videoMethodInstance.adUnit && videoMethodInstance.adUnit._videoSlotCanAutoPlay ? "1" : "0");
  return additionalData;
}

function getAdditionalViewableData() {
  return "plw=" + videoMethodInstance.playerWidth + "&plh=" + videoMethodInstance.playerHeight;
}

function getAdditionalMetricsData() {
  return "plw=" + videoMethodInstance.playerWidth + "&plh=" + videoMethodInstance.playerHeight + (
  //dont sent avoc if volume was not recorded
  archive.avoc >= 0 ? "&avoc=" + archive.avoc : "") + "&mivl=" + videoMethodInstance.minVolume + "&mivlt=" + videoMethodInstance.maxTimeAtMinVolume + "&mxvl=" + videoMethodInstance.maxVolume + "&mxvlt=" + videoMethodInstance.maxTimeAtMaxVolume;
}

function fireBeacon(fromUnload) {
  //dont fire if ad has not loaded and not started
  if (!hasFiredBeacon) {
    videoMethodInstance.metViewableStandard();
    viewportMethodInstance.metViewableStandard();

    fireViewableBeacon(viewabilityBeaconUrl,
    //measurementType
    //1 - not viewable beacons are not fired explicitly
    //2 - not viewable beacons are fired explicitly
    '2',
    //inView is a combinaton of inView of video method and viewport method
    videoMethodInstance.inView && viewportMethodInstance.inView,
    //isMeasurable is true if both video method or viewport method is possible and not errored out
    videoMethodInstance.isMeasurable && viewportMethodInstance.isMeasurable, viewportMethodInstance, getAdditionalViewableData(), getAdditionalData() + ":fu=" + (fromUnload ? "1" : "0"));
  }
  hasFiredBeacon = true;
}

function fireMetricsBeaconWrapper() {
  if (!hasFiredMetricsBeacon) {
    fireMetricsBeacon(archive, viewabilityBeaconUrl, viewportMethodInstance, getAdditionalMetricsData(), getAdditionalData());
  }
  hasFiredMetricsBeacon = true;
}

function cleanup() {
  fireBeacon(true);
  fireMetricsBeaconWrapper();
  videoMethodInstance.cleanup();
  viewportMethodInstance.cleanup();
}

function cleanupAll() {
  cleanup();
  unregisterListener(UNLOAD_EVENT_NAME, unloadHandler);
  unregisterListener(BEFOREUNLOAD_EVENT_NAME, beforeUnloadHandler);
}

function unloadHandler() {
  cleanup();
  unregisterListener(UNLOAD_EVENT_NAME, unloadHandler);
}

function beforeUnloadHandler() {
  cleanup();
  unregisterListener(BEFOREUNLOAD_EVENT_NAME, beforeUnloadHandler);
}

function inViewCallback(forceBeacon) {
  //when ad is stopped or ended, container iframe will be removed.
  //unload handler is not called in this case. So force it.
  if (forceBeacon) {
    cleanupAll();
  } else if (videoMethodInstance.isCurrentlyInView && viewportMethodInstance.isCurrentlyInView) {
    timer.startTimer();
  }
}

function outOfViewCallback(forceBeacon) {
  timer.stopTimer();

  //when ad is stopped or ended, container iframe will be removed.
  //unload handler is not called in this case. So force it.
  if (forceBeacon) {
    cleanupAll();
  }
}

function init(params) {
  if (!params) {
    return;
  }
  viewabilityBeaconUrl = params.adParams && params.adParams.viewabilityBeaconUrl;
  if (!viewabilityBeaconUrl || viewabilityBeaconUrl === "") {
    // short the init if there was no viewabilityBeaconUrl fetched
    return;
  }

  if (params.vpaidVersion) {
    vpaidVersion = params.vpaidVersion;
  }

  if (params.videoSlot && !sizeIsBelowThreshold(params.videoSlot)) {
    //set both adElement and adElementWrapper to videoSlot
    //adElementWrapper is used in viewport method
    elementDetected = setup(params.videoSlot, params.videoSlot);
  } else if (params.slot) {
    elementDetected = setup(params.slot);
  }
  setAdSize(params.adWidth, params.adHeight);

  timer = new Timer(VIDEO_PLAY_DURATION_THRESHOLD, fireBeacon);

  var methodClass;
  if (elementDetected) {
    var i = 0;
    for (; i < methodSelectionOrder.length && !methodSelectionOrder[i].prototype.canApplyMethod(); i++) {}
    methodClass = methodSelectionOrder[i];
  } else {
    //if no element was detect for player, then mark as not measurable
    methodClass = NotMeasurableMethod;
  }
  viewportMethodInstance = new methodClass({
    adWidth: width,
    adHeight: height,
    inViewCallback: inViewCallback,
    outOfViewCallback: outOfViewCallback
  });

  videoMethodInstance = new VideoMethod({
    adUnit: params.vpaidJSWrapper,
    playerId: params.adParams.playerId,
    inViewCallback: inViewCallback,
    outOfViewCallback: outOfViewCallback,
    adLoaded: function adLoaded() {
      //call init on viewportMethodInstance once the ad has loaded
      viewportMethodInstance.init();
      viewportMethodIsInitialized = true;
    },
    adSizeChanged: function adSizeChanged() {
      //call this only if viewportMethodInstance is initialized
      if (viewportMethodIsInitialized) {
        viewportMethodInstance.reset();
      }
    },
    adVideoComplete: function adVideoComplete() {
      if (videoMethodInstance.isCurrentlyInView && viewportMethodInstance.isCurrentlyInView) {
        if (videoMethodInstance.minVolume > 0 && videoMethodInstance.minVolume !== 999) {
          archive.avoc = 1;
        } else if (videoMethodInstance.minVolume === 999) {
          //make avoc -1 if minVolue was 999, ie not recorded
          archive.avoc = -1;
        }
      }

      if (videoMethodInstance.adUnit && videoMethodInstance.adUnit.getAdVolume) {
        archive.avoc_debug = videoMethodInstance.adUnit.getAdVolume() > 0 ? "1" : "2";
      } else {
        archive.avoc_debug = "0";
      }
    }
  });
  videoMethodInstance.init();

  registerListener(RESIZE_EVENT_NAME, function () {
    setAdSize();
    if (viewportMethodIsInitialized) {
      viewportMethodInstance.reset();
    }
  });

  registerListener(UNLOAD_EVENT_NAME, unloadHandler);
  registerListener(BEFOREUNLOAD_EVENT_NAME, beforeUnloadHandler);

  setupTrackers();
}

exports.default = init;

},{}],4:[function(require,module,exports){
"use strict";

/*eslint-disable*/
/*Copyright (c) 2011-2016 Moat Inc. All Rights Reserved.*/
var initMoat = function initMoatTracking(b, c, g, p) {
  var l = document.createElement("script"),
      f = { events: [], addEvent: function addEvent(a) {
      d.sendEvent ? (f.events && (d.sendEvent(f.events), f.events = !1), d.sendEvent(a)) : f.events.push(a);
    } },
      a = function a(_a) {
    return function () {
      var d = -1,
          h;b && b.getAdVolume && (h = b.getAdVolume());"number" == typeof h && !isNaN(h) && 0 <= h && (d = h);f.addEvent({ type: _a, adVolume: d });if (-1 !== q.indexOf(_a) && b && b.unsubscribe && !n) {
        n = !0;for (var c in e) {
          if (e.hasOwnProperty && e.hasOwnProperty(c)) try {
            b.unsubscribe(e[c], c);
          } catch (g) {}
        }
      }
    };
  },
      d = { adData: { ids: g, vpaid: b, build: "cc07a80-clean" }, dispatchEvent: f.addEvent };g = "_moatApi" + Math.floor(1E8 * Math.random());var e = { AdStarted: a("AdStarted"), AdStopped: a("AdStopped"), AdSkipped: a("AdSkipped"), AdLoaded: a("AdLoaded"), AdLinearChange: a("AdLinearChange"), AdSizeChange: a("AdSizeChange"), AdExpandedChange: a("AdExpandedChange"), AdSkippableStateChange: a("AdSkippableStateChange"), AdDurationChange: a("AdDurationChange"), AdRemainingTimeChange: a("AdRemainingTimeChange"), AdVolumeChange: a("AdVolumeChange"),
    AdImpression: a("AdImpression"), AdClickThru: a("AdClickThru"), AdInteraction: a("AdInteraction"), AdVideoStart: a("AdVideoStart"), AdVideoFirstQuartile: a("AdVideoFirstQuartile"), AdVideoMidpoint: a("AdVideoMidpoint"), AdVideoThirdQuartile: a("AdVideoThirdQuartile"), AdVideoComplete: a("AdVideoComplete"), AdUserAcceptInvitation: a("AdUserAcceptInvitation"), AdUserMinimize: a("AdUserMinimize"), AdUserClose: a("AdUserClose"), AdPaused: a("AdPaused"), AdPlaying: a("AdPlaying"), AdError: a("AdError") },
      n = !1,
      q = ["AdStopped", "AdSkipped", "AdVideoComplete"];(function () {
    if (b && b.subscribe) for (var a in e) {
      e.hasOwnProperty && e.hasOwnProperty(a) && b.subscribe(e[a], a);
    }
  })();var k, m;try {
    k = c.ownerDocument, m = k.defaultView || k.parentWindow;
  } catch (r) {
    k = document, m = window;
  }m[g] = d;l.type = "text/javascript";c && c.insertBefore(l, c.childNodes[0] || null);l.src = "https://z.moatads.com/" + p + "/moatvideo.js#" + g;return d;
};

/*eslint-enable*/

module.exports = initMoat;

},{}],5:[function(require,module,exports){
(function (process,global){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (typeof arguments[1] === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var hasError = false;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            if (hasError) return;
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    hasError = true;

                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback.apply(null, [null].concat(args));
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while(!q.paused && workers < q.concurrency && q.tasks.length){

                    var tasks = q.payload ?
                        q.tasks.splice(0, q.payload) :
                        q.tasks.splice(0, q.tasks.length);

                    var data = _map(tasks, function (task) {
                        return task.data;
                    });

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);
                    var cb = only_once(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        var has = Object.prototype.hasOwnProperty;
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (has.call(memo, key)) {   
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (has.call(queues, key)) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":6}],6:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],7:[function(require,module,exports){
/**
 * UAParser.js v0.7.12
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2016 Faisal Salman <fyzlman@gmail.com>
 * Dual licensed under GPLv2 & MIT
 */

(function (window, undefined) {

    'use strict';

    //////////////
    // Constants
    /////////////


    var LIBVERSION  = '0.7.12',
        EMPTY       = '',
        UNKNOWN     = '?',
        FUNC_TYPE   = 'function',
        UNDEF_TYPE  = 'undefined',
        OBJ_TYPE    = 'object',
        STR_TYPE    = 'string',
        MAJOR       = 'major', // deprecated
        MODEL       = 'model',
        NAME        = 'name',
        TYPE        = 'type',
        VENDOR      = 'vendor',
        VERSION     = 'version',
        ARCHITECTURE= 'architecture',
        CONSOLE     = 'console',
        MOBILE      = 'mobile',
        TABLET      = 'tablet',
        SMARTTV     = 'smarttv',
        WEARABLE    = 'wearable',
        EMBEDDED    = 'embedded';


    ///////////
    // Helper
    //////////


    var util = {
        extend : function (regexes, extensions) {
            var margedRegexes = {};
            for (var i in regexes) {
                if (extensions[i] && extensions[i].length % 2 === 0) {
                    margedRegexes[i] = extensions[i].concat(regexes[i]);
                } else {
                    margedRegexes[i] = regexes[i];
                }
            }
            return margedRegexes;
        },
        has : function (str1, str2) {
          if (typeof str1 === "string") {
            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
          } else {
            return false;
          }
        },
        lowerize : function (str) {
            return str.toLowerCase();
        },
        major : function (version) {
            return typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g,'').split(".")[0] : undefined;
        },
        trim : function (str) {
          return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
    };


    ///////////////
    // Map helper
    //////////////


    var mapper = {

        rgx : function () {

            var result, i = 0, j, k, p, q, matches, match, args = arguments;

            // loop through all regexes maps
            while (i < args.length && !matches) {

                var regex = args[i],       // even sequence (0,2,4,..)
                    props = args[i + 1];   // odd sequence (1,3,5,..)

                // construct object barebones
                if (typeof result === UNDEF_TYPE) {
                    result = {};
                    for (p in props) {
                        if (props.hasOwnProperty(p)){
                            q = props[p];
                            if (typeof q === OBJ_TYPE) {
                                result[q[0]] = undefined;
                            } else {
                                result[q] = undefined;
                            }
                        }
                    }
                }

                // try matching uastring with regexes
                j = k = 0;
                while (j < regex.length && !matches) {
                    matches = regex[j++].exec(this.getUA());
                    if (!!matches) {
                        for (p = 0; p < props.length; p++) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if (typeof q === OBJ_TYPE && q.length > 0) {
                                if (q.length == 2) {
                                    if (typeof q[1] == FUNC_TYPE) {
                                        // assign modified match
                                        result[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        result[q[0]] = q[1];
                                    }
                                } else if (q.length == 3) {
                                    // check whether function or regex
                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length == 4) {
                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                result[q] = match ? match : undefined;
                            }
                        }
                    }
                }
                i += 2;
            }
            return result;
        },

        str : function (str, map) {

            for (var i in map) {
                // check if array
                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                    for (var j = 0; j < map[i].length; j++) {
                        if (util.has(map[i][j], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                } else if (util.has(map[i], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                }
            }
            return str;
        }
    };


    ///////////////
    // String map
    //////////////


    var maps = {

        browser : {
            oldsafari : {
                version : {
                    '1.0'   : '/8',
                    '1.2'   : '/1',
                    '1.3'   : '/3',
                    '2.0'   : '/412',
                    '2.0.2' : '/416',
                    '2.0.3' : '/417',
                    '2.0.4' : '/419',
                    '?'     : '/'
                }
            }
        },

        device : {
            amazon : {
                model : {
                    'Fire Phone' : ['SD', 'KF']
                }
            },
            sprint : {
                model : {
                    'Evo Shift 4G' : '7373KT'
                },
                vendor : {
                    'HTC'       : 'APA',
                    'Sprint'    : 'Sprint'
                }
            }
        },

        os : {
            windows : {
                version : {
                    'ME'        : '4.90',
                    'NT 3.11'   : 'NT3.51',
                    'NT 4.0'    : 'NT4.0',
                    '2000'      : 'NT 5.0',
                    'XP'        : ['NT 5.1', 'NT 5.2'],
                    'Vista'     : 'NT 6.0',
                    '7'         : 'NT 6.1',
                    '8'         : 'NT 6.2',
                    '8.1'       : 'NT 6.3',
                    '10'        : ['NT 6.4', 'NT 10.0'],
                    'RT'        : 'ARM'
                }
            }
        }
    };


    //////////////
    // Regex map
    /////////////


    var regexes = {

        browser : [[

            // Presto based
            /(opera\smini)\/([\w\.-]+)/i,                                       // Opera Mini
            /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,                      // Opera Mobi/Tablet
            /(opera).+version\/([\w\.]+)/i,                                     // Opera > 9.80
            /(opera)[\/\s]+([\w\.]+)/i                                          // Opera < 9.80
            ], [NAME, VERSION], [

            /(opios)[\/\s]+([\w\.]+)/i                                          // Opera mini on iphone >= 8.0
            ], [[NAME, 'Opera Mini'], VERSION], [

            /\s(opr)\/([\w\.]+)/i                                               // Opera Webkit
            ], [[NAME, 'Opera'], VERSION], [

            // Mixed
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,
                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

            // Trident based
            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,
                                                                                // Avant/IEMobile/SlimBrowser/Baidu
            /(?:ms|\()(ie)\s([\w\.]+)/i,                                        // Internet Explorer

            // Webkit/KHTML based
            /(rekonq)\/([\w\.]+)*/i,                                            // Rekonq
            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs)\/([\w\.-]+)/i
                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS
            ], [NAME, VERSION], [

            /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i                         // IE11
            ], [[NAME, 'IE'], VERSION], [

            /(edge)\/((\d+)?[\w\.]+)/i                                          // Microsoft Edge
            ], [NAME, VERSION], [

            /(yabrowser)\/([\w\.]+)/i                                           // Yandex
            ], [[NAME, 'Yandex'], VERSION], [

            /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
            ], [[NAME, /_/g, ' '], VERSION], [

            /(micromessenger)\/([\w\.]+)/i                                      // WeChat
            ], [[NAME, 'WeChat'], VERSION], [

            /xiaomi\/miuibrowser\/([\w\.]+)/i                                   // MIUI Browser
            ], [VERSION, [NAME, 'MIUI Browser']], [

            /\swv\).+(chrome)\/([\w\.]+)/i                                      // Chrome WebView
            ], [[NAME, /(.+)/, '$1 WebView'], VERSION], [

            /android.+samsungbrowser\/([\w\.]+)/i,
            /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)*/i        // Android Browser
            ], [VERSION, [NAME, 'Android Browser']], [

            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i,
                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
            /(qqbrowser)[\/\s]?([\w\.]+)/i
                                                                                // QQBrowser
            ], [NAME, VERSION], [

            /(uc\s?browser)[\/\s]?([\w\.]+)/i,
            /ucweb.+(ucbrowser)[\/\s]?([\w\.]+)/i,
            /juc.+(ucweb)[\/\s]?([\w\.]+)/i
                                                                                // UCBrowser
            ], [[NAME, 'UCBrowser'], VERSION], [

            /(dolfin)\/([\w\.]+)/i                                              // Dolphin
            ], [[NAME, 'Dolphin'], VERSION], [

            /((?:android.+)crmo|crios)\/([\w\.]+)/i                             // Chrome for Android/iOS
            ], [[NAME, 'Chrome'], VERSION], [

            /;fbav\/([\w\.]+);/i                                                // Facebook App for iOS
            ], [VERSION, [NAME, 'Facebook']], [

            /fxios\/([\w\.-]+)/i                                                // Firefox for iOS
            ], [VERSION, [NAME, 'Firefox']], [

            /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i                       // Mobile Safari
            ], [VERSION, [NAME, 'Mobile Safari']], [

            /version\/([\w\.]+).+?(mobile\s?safari|safari)/i                    // Safari & Safari Mobile
            ], [VERSION, NAME], [

            /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i                     // Safari < 3.0
            ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [

            /(konqueror)\/([\w\.]+)/i,                                          // Konqueror
            /(webkit|khtml)\/([\w\.]+)/i
            ], [NAME, VERSION], [

            // Gecko based
            /(navigator|netscape)\/([\w\.-]+)/i                                 // Netscape
            ], [[NAME, 'Netscape'], VERSION], [
            /(swiftfox)/i,                                                      // Swiftfox
            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,
                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
            /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,                          // Mozilla

            // Other
            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
            /(links)\s\(([\w\.]+)/i,                                            // Links
            /(gobrowser)\/?([\w\.]+)*/i,                                        // GoBrowser
            /(ice\s?browser)\/v?([\w\._]+)/i,                                   // ICE Browser
            /(mosaic)[\/\s]([\w\.]+)/i                                          // Mosaic
            ], [NAME, VERSION]

            /* /////////////////////
            // Media players BEGIN
            ////////////////////////

            , [

            /(apple(?:coremedia|))\/((\d+)[\w\._]+)/i,                          // Generic Apple CoreMedia
            /(coremedia) v((\d+)[\w\._]+)/i
            ], [NAME, VERSION], [

            /(aqualung|lyssna|bsplayer)\/((\d+)?[\w\.-]+)/i                     // Aqualung/Lyssna/BSPlayer
            ], [NAME, VERSION], [

            /(ares|ossproxy)\s((\d+)[\w\.-]+)/i                                 // Ares/OSSProxy
            ], [NAME, VERSION], [

            /(audacious|audimusicstream|amarok|bass|core|dalvik|gnomemplayer|music on console|nsplayer|psp-internetradioplayer|videos)\/((\d+)[\w\.-]+)/i,
                                                                                // Audacious/AudiMusicStream/Amarok/BASS/OpenCORE/Dalvik/GnomeMplayer/MoC
                                                                                // NSPlayer/PSP-InternetRadioPlayer/Videos
            /(clementine|music player daemon)\s((\d+)[\w\.-]+)/i,               // Clementine/MPD
            /(lg player|nexplayer)\s((\d+)[\d\.]+)/i,
            /player\/(nexplayer|lg player)\s((\d+)[\w\.-]+)/i                   // NexPlayer/LG Player
            ], [NAME, VERSION], [
            /(nexplayer)\s((\d+)[\w\.-]+)/i                                     // Nexplayer
            ], [NAME, VERSION], [

            /(flrp)\/((\d+)[\w\.-]+)/i                                          // Flip Player
            ], [[NAME, 'Flip Player'], VERSION], [

            /(fstream|nativehost|queryseekspider|ia-archiver|facebookexternalhit)/i
                                                                                // FStream/NativeHost/QuerySeekSpider/IA Archiver/facebookexternalhit
            ], [NAME], [

            /(gstreamer) souphttpsrc (?:\([^\)]+\)){0,1} libsoup\/((\d+)[\w\.-]+)/i
                                                                                // Gstreamer
            ], [NAME, VERSION], [

            /(htc streaming player)\s[\w_]+\s\/\s((\d+)[\d\.]+)/i,              // HTC Streaming Player
            /(java|python-urllib|python-requests|wget|libcurl)\/((\d+)[\w\.-_]+)/i,
                                                                                // Java/urllib/requests/wget/cURL
            /(lavf)((\d+)[\d\.]+)/i                                             // Lavf (FFMPEG)
            ], [NAME, VERSION], [

            /(htc_one_s)\/((\d+)[\d\.]+)/i                                      // HTC One S
            ], [[NAME, /_/g, ' '], VERSION], [

            /(mplayer)(?:\s|\/)(?:(?:sherpya-){0,1}svn)(?:-|\s)(r\d+(?:-\d+[\w\.-]+){0,1})/i
                                                                                // MPlayer SVN
            ], [NAME, VERSION], [

            /(mplayer)(?:\s|\/|[unkow-]+)((\d+)[\w\.-]+)/i                      // MPlayer
            ], [NAME, VERSION], [

            /(mplayer)/i,                                                       // MPlayer (no other info)
            /(yourmuze)/i,                                                      // YourMuze
            /(media player classic|nero showtime)/i                             // Media Player Classic/Nero ShowTime
            ], [NAME], [

            /(nero (?:home|scout))\/((\d+)[\w\.-]+)/i                           // Nero Home/Nero Scout
            ], [NAME, VERSION], [

            /(nokia\d+)\/((\d+)[\w\.-]+)/i                                      // Nokia
            ], [NAME, VERSION], [

            /\s(songbird)\/((\d+)[\w\.-]+)/i                                    // Songbird/Philips-Songbird
            ], [NAME, VERSION], [

            /(winamp)3 version ((\d+)[\w\.-]+)/i,                               // Winamp
            /(winamp)\s((\d+)[\w\.-]+)/i,
            /(winamp)mpeg\/((\d+)[\w\.-]+)/i
            ], [NAME, VERSION], [

            /(ocms-bot|tapinradio|tunein radio|unknown|winamp|inlight radio)/i  // OCMS-bot/tap in radio/tunein/unknown/winamp (no other info)
                                                                                // inlight radio
            ], [NAME], [

            /(quicktime|rma|radioapp|radioclientapplication|soundtap|totem|stagefright|streamium)\/((\d+)[\w\.-]+)/i
                                                                                // QuickTime/RealMedia/RadioApp/RadioClientApplication/
                                                                                // SoundTap/Totem/Stagefright/Streamium
            ], [NAME, VERSION], [

            /(smp)((\d+)[\d\.]+)/i                                              // SMP
            ], [NAME, VERSION], [

            /(vlc) media player - version ((\d+)[\w\.]+)/i,                     // VLC Videolan
            /(vlc)\/((\d+)[\w\.-]+)/i,
            /(xbmc|gvfs|xine|xmms|irapp)\/((\d+)[\w\.-]+)/i,                    // XBMC/gvfs/Xine/XMMS/irapp
            /(foobar2000)\/((\d+)[\d\.]+)/i,                                    // Foobar2000
            /(itunes)\/((\d+)[\d\.]+)/i                                         // iTunes
            ], [NAME, VERSION], [

            /(wmplayer)\/((\d+)[\w\.-]+)/i,                                     // Windows Media Player
            /(windows-media-player)\/((\d+)[\w\.-]+)/i
            ], [[NAME, /-/g, ' '], VERSION], [

            /windows\/((\d+)[\w\.-]+) upnp\/[\d\.]+ dlnadoc\/[\d\.]+ (home media server)/i
                                                                                // Windows Media Server
            ], [VERSION, [NAME, 'Windows']], [

            /(com\.riseupradioalarm)\/((\d+)[\d\.]*)/i                          // RiseUP Radio Alarm
            ], [NAME, VERSION], [

            /(rad.io)\s((\d+)[\d\.]+)/i,                                        // Rad.io
            /(radio.(?:de|at|fr))\s((\d+)[\d\.]+)/i
            ], [[NAME, 'rad.io'], VERSION]

            //////////////////////
            // Media players END
            ////////////////////*/

        ],

        cpu : [[

            /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i                     // AMD64
            ], [[ARCHITECTURE, 'amd64']], [

            /(ia32(?=;))/i                                                      // IA32 (quicktime)
            ], [[ARCHITECTURE, util.lowerize]], [

            /((?:i[346]|x)86)[;\)]/i                                            // IA32
            ], [[ARCHITECTURE, 'ia32']], [

            // PocketPC mistakenly identified as PowerPC
            /windows\s(ce|mobile);\sppc;/i
            ], [[ARCHITECTURE, 'arm']], [

            /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i                           // PowerPC
            ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [

            /(sun4\w)[;\)]/i                                                    // SPARC
            ], [[ARCHITECTURE, 'sparc']], [

            /((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
                                                                                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
            ], [[ARCHITECTURE, util.lowerize]]
        ],

        device : [[

            /\((ipad|playbook);[\w\s\);-]+(rim|apple)/i                         // iPad/PlayBook
            ], [MODEL, VENDOR, [TYPE, TABLET]], [

            /applecoremedia\/[\w\.]+ \((ipad)/                                  // iPad
            ], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [

            /(apple\s{0,1}tv)/i                                                 // Apple TV
            ], [[MODEL, 'Apple TV'], [VENDOR, 'Apple']], [

            /(archos)\s(gamepad2?)/i,                                           // Archos
            /(hp).+(touchpad)/i,                                                // HP TouchPad
            /(hp).+(tablet)/i,                                                  // HP Tablet
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /\s(nook)[\w\s]+build\/(\w+)/i,                                     // Nook
            /(dell)\s(strea[kpr\s\d]*[\dko])/i                                  // Dell Streak
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i                               // Kindle Fire HD
            ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
            /(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i                  // Fire Phone
            ], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [

            /\((ip[honed|\s\w*]+);.+(apple)/i                                   // iPod/iPhone
            ], [MODEL, VENDOR, [TYPE, MOBILE]], [
            /\((ip[honed|\s\w*]+);/i                                            // iPod/iPhone
            ], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [

            /(blackberry)[\s-]?(\w+)/i,                                         // BlackBerry
            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,
                                                                                // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Huawei/Meizu/Motorola/Polytron
            /(hp)\s([\w\s]+\w)/i,                                               // HP iPAQ
            /(asus)-?(\w+)/i                                                    // Asus
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /\(bb10;\s(\w+)/i                                                   // BlackBerry 10
            ], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
                                                                                // Asus Tablets
            /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone)/i
            ], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [

            /(sony)\s(tablet\s[ps])\sbuild\//i,                                  // Sony
            /(sony)?(?:sgp.+)\sbuild\//i
            ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Tablet'], [TYPE, TABLET]], [
            /(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i
            ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Phone'], [TYPE, MOBILE]], [

            /\s(ouya)\s/i,                                                      // Ouya
            /(nintendo)\s([wids3u]+)/i                                          // Nintendo
            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [

            /android.+;\s(shield)\sbuild/i                                      // Nvidia
            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [

            /(playstation\s[34portablevi]+)/i                                   // Playstation
            ], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [

            /(sprint\s(\w+))/i                                                  // Sprint Phones
            ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [

            /(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i                         // Lenovo tablets
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,                               // HTC
            /(zte)-(\w+)*/i,                                                    // ZTE
            /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i
                                                                                // Alcatel/GeeksPhone/Huawei/Lenovo/Nexian/Panasonic/Sony
            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

            /(nexus\s9)/i                                                       // HTC Nexus 9
            ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [

            /(nexus\s6p)/i                                                      // Huawei Nexus 6P
            ], [MODEL, [VENDOR, 'Huawei'], [TYPE, MOBILE]], [

            /(microsoft);\s(lumia[\s\w]+)/i                                     // Microsoft Lumia
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

            /[\s\(;](xbox(?:\sone)?)[\s\);]/i                                   // Microsoft Xbox
            ], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [
            /(kin\.[onetw]{3})/i                                                // Microsoft Kin
            ], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [

                                                                                // Motorola
            /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i,
            /mot[\s-]?(\w+)*/i,
            /(XT\d{3,4}) build\//i,
            /(nexus\s6)/i
            ], [MODEL, [VENDOR, 'Motorola'], [TYPE, MOBILE]], [
            /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
            ], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [

            /hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i            // HbbTV devices
            ], [[VENDOR, util.trim], [MODEL, util.trim], [TYPE, SMARTTV]], [

            /hbbtv.+maple;(\d+)/i
            ], [[MODEL, /^/, 'SmartTV'], [VENDOR, 'Samsung'], [TYPE, SMARTTV]], [

            /\(dtv[\);].+(aquos)/i                                              // Sharp
            ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [

            /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i,
            /((SM-T\w+))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [                  // Samsung
            /smart-tv.+(samsung)/i
            ], [VENDOR, [TYPE, SMARTTV], MODEL], [
            /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i,
            /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,
            /sec-((sgh\w+))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [

            /sie-(\w+)*/i                                                       // Siemens
            ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [

            /(maemo|nokia).*(n900|lumia\s\d+)/i,                                // Nokia
            /(nokia)[\s_-]?([\w-]+)*/i
            ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [

            /android\s3\.[\s\w;-]{10}(a\d{3})/i                                 // Acer
            ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

            /android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i                     // LG Tablet
            ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
            /(lg) netcast\.tv/i                                                 // LG SmartTV
            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
            /(nexus\s[45])/i,                                                   // LG
            /lg[e;\s\/-]+(\w+)*/i
            ], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [

            /android.+(ideatab[a-z0-9\-\s]+)/i                                  // Lenovo
            ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [

            /linux;.+((jolla));/i                                               // Jolla
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

            /((pebble))app\/[\d\.]+\s/i                                         // Pebble
            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [

            /android.+;\s(glass)\s\d/i                                          // Google Glass
            ], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [

            /android.+(\w+)\s+build\/hm\1/i,                                    // Xiaomi Hongmi 'numeric' models
            /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,               // Xiaomi Hongmi
            /android.+(mi[\s\-_]*(?:one|one[\s_]plus|note lte)?[\s_]*(?:\d\w)?)\s+build/i    // Xiaomi Mi
            ], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, MOBILE]], [

            /android.+a000(1)\s+build/i                                         // OnePlus
            ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [

            /\s(tablet)[;\/]/i,                                                 // Unidentifiable Tablet
            /\s(mobile)(?:[;\/]|\ssafari)/i                                     // Unidentifiable Mobile
            ], [[TYPE, util.lowerize], VENDOR, MODEL]

            /*//////////////////////////
            // TODO: move to string map
            ////////////////////////////

            /(C6603)/i                                                          // Sony Xperia Z C6603
            ], [[MODEL, 'Xperia Z C6603'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [
            /(C6903)/i                                                          // Sony Xperia Z 1
            ], [[MODEL, 'Xperia Z 1'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [

            /(SM-G900[F|H])/i                                                   // Samsung Galaxy S5
            ], [[MODEL, 'Galaxy S5'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G7102)/i                                                       // Samsung Galaxy Grand 2
            ], [[MODEL, 'Galaxy Grand 2'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G530H)/i                                                       // Samsung Galaxy Grand Prime
            ], [[MODEL, 'Galaxy Grand Prime'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G313HZ)/i                                                      // Samsung Galaxy V
            ], [[MODEL, 'Galaxy V'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-T805)/i                                                        // Samsung Galaxy Tab S 10.5
            ], [[MODEL, 'Galaxy Tab S 10.5'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [
            /(SM-G800F)/i                                                       // Samsung Galaxy S5 Mini
            ], [[MODEL, 'Galaxy S5 Mini'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-T311)/i                                                        // Samsung Galaxy Tab 3 8.0
            ], [[MODEL, 'Galaxy Tab 3 8.0'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [

            /(R1001)/i                                                          // Oppo R1001
            ], [MODEL, [VENDOR, 'OPPO'], [TYPE, MOBILE]], [
            /(X9006)/i                                                          // Oppo Find 7a
            ], [[MODEL, 'Find 7a'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
            /(R2001)/i                                                          // Oppo YOYO R2001
            ], [[MODEL, 'Yoyo R2001'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
            /(R815)/i                                                           // Oppo Clover R815
            ], [[MODEL, 'Clover R815'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
             /(U707)/i                                                          // Oppo Find Way S
            ], [[MODEL, 'Find Way S'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [

            /(T3C)/i                                                            // Advan Vandroid T3C
            ], [MODEL, [VENDOR, 'Advan'], [TYPE, TABLET]], [
            /(ADVAN T1J\+)/i                                                    // Advan Vandroid T1J+
            ], [[MODEL, 'Vandroid T1J+'], [VENDOR, 'Advan'], [TYPE, TABLET]], [
            /(ADVAN S4A)/i                                                      // Advan Vandroid S4A
            ], [[MODEL, 'Vandroid S4A'], [VENDOR, 'Advan'], [TYPE, MOBILE]], [

            /(V972M)/i                                                          // ZTE V972M
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [

            /(i-mobile)\s(IQ\s[\d\.]+)/i                                        // i-mobile IQ
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(IQ6.3)/i                                                          // i-mobile IQ IQ 6.3
            ], [[MODEL, 'IQ 6.3'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [
            /(i-mobile)\s(i-style\s[\d\.]+)/i                                   // i-mobile i-STYLE
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(i-STYLE2.1)/i                                                     // i-mobile i-STYLE 2.1
            ], [[MODEL, 'i-STYLE 2.1'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [

            /(mobiistar touch LAI 512)/i                                        // mobiistar touch LAI 512
            ], [[MODEL, 'Touch LAI 512'], [VENDOR, 'mobiistar'], [TYPE, MOBILE]], [

            /////////////
            // END TODO
            ///////////*/

        ],

        engine : [[

            /windows.+\sedge\/([\w\.]+)/i                                       // EdgeHTML
            ], [VERSION, [NAME, 'EdgeHTML']], [

            /(presto)\/([\w\.]+)/i,                                             // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
            ], [NAME, VERSION], [

            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
            ], [VERSION, NAME]
        ],

        os : [[

            // Windows based
            /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
            ], [NAME, VERSION], [
            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
            /(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s]+\w)*/i,                  // Windows Phone
            /(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

            // Mobile/Embedded OS
            /\((bb)(10);/i                                                      // BlackBerry 10
            ], [[NAME, 'BlackBerry'], VERSION], [
            /(blackberry)\w*\/?([\w\.]+)*/i,                                    // Blackberry
            /(tizen)[\/\s]([\w\.]+)/i,                                          // Tizen
            /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,
                                                                                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
            /linux;.+(sailfish);/i                                              // Sailfish OS
            ], [NAME, VERSION], [
            /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i                 // Symbian
            ], [[NAME, 'Symbian'], VERSION], [
            /\((series40);/i                                                    // Series 40
            ], [NAME], [
            /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
            ], [[NAME, 'Firefox OS'], VERSION], [

            // Console
            /(nintendo|playstation)\s([wids34portablevu]+)/i,                   // Nintendo/Playstation

            // GNU/Linux based
            /(mint)[\/\s\(]?(\w+)*/i,                                           // Mint
            /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
            /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?(?!chrom)([\w\.-]+)*/i,
                                                                                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                                                                                // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
            /(hurd|linux)\s?([\w\.]+)*/i,                                       // Hurd/Linux
            /(gnu)\s?([\w\.]+)*/i                                               // GNU
            ], [NAME, VERSION], [

            /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
            ], [[NAME, 'Chromium OS'], VERSION],[

            // Solaris
            /(sunos)\s?([\w\.]+\d)*/i                                           // Solaris
            ], [[NAME, 'Solaris'], VERSION], [

            // BSD based
            /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i                   // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
            ], [NAME, VERSION],[

            /(haiku)\s(\w+)/i                                                  // Haiku
            ], [NAME, VERSION],[

            /(ip[honead]+)(?:.*os\s([\w]+)*\slike\smac|;\sopera)/i              // iOS
            ], [[NAME, 'iOS'], [VERSION, /_/g, '.']], [

            /(mac\sos\sx)\s?([\w\s\.]+\w)*/i,
            /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
            ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

            // Other
            /((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,                            // Solaris
            /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,                               // AIX
            /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,
                                                                                // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
            /(unix)\s?([\w\.]+)*/i                                              // UNIX
            ], [NAME, VERSION]
        ]
    };


    /////////////////
    // Constructor
    ////////////////


    var UAParser = function (uastring, extensions) {

        if (!(this instanceof UAParser)) {
            return new UAParser(uastring, extensions).getResult();
        }

        var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
        var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

        this.getBrowser = function () {
            var browser = mapper.rgx.apply(this, rgxmap.browser);
            browser.major = util.major(browser.version);
            return browser;
        };
        this.getCPU = function () {
            return mapper.rgx.apply(this, rgxmap.cpu);
        };
        this.getDevice = function () {
            return mapper.rgx.apply(this, rgxmap.device);
        };
        this.getEngine = function () {
            return mapper.rgx.apply(this, rgxmap.engine);
        };
        this.getOS = function () {
            return mapper.rgx.apply(this, rgxmap.os);
        };
        this.getResult = function() {
            return {
                ua      : this.getUA(),
                browser : this.getBrowser(),
                engine  : this.getEngine(),
                os      : this.getOS(),
                device  : this.getDevice(),
                cpu     : this.getCPU()
            };
        };
        this.getUA = function () {
            return ua;
        };
        this.setUA = function (uastring) {
            ua = uastring;
            return this;
        };
        return this;
    };

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER = {
        NAME    : NAME,
        MAJOR   : MAJOR, // deprecated
        VERSION : VERSION
    };
    UAParser.CPU = {
        ARCHITECTURE : ARCHITECTURE
    };
    UAParser.DEVICE = {
        MODEL   : MODEL,
        VENDOR  : VENDOR,
        TYPE    : TYPE,
        CONSOLE : CONSOLE,
        MOBILE  : MOBILE,
        SMARTTV : SMARTTV,
        TABLET  : TABLET,
        WEARABLE: WEARABLE,
        EMBEDDED: EMBEDDED
    };
    UAParser.ENGINE = {
        NAME    : NAME,
        VERSION : VERSION
    };
    UAParser.OS = {
        NAME    : NAME,
        VERSION : VERSION
    };


    ///////////
    // Export
    //////////


    // check js environment
    if (typeof(exports) !== UNDEF_TYPE) {
        // nodejs env
        if (typeof module !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else {
        // requirejs env (optional)
        if (typeof(define) === FUNC_TYPE && define.amd) {
            define(function () {
                return UAParser;
            });
        } else {
            // browser env
            window.UAParser = UAParser;
        }
    }

    // jQuery/Zepto specific (optional)
    // Note:
    //   In AMD env the global scope should be kept clean, but jQuery is an exception.
    //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
    //   and we should catch that.
    var $ = window.jQuery || window.Zepto;
    if (typeof $ !== UNDEF_TYPE) {
        var parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = function() {
            return parser.getUA();
        };
        $.ua.set = function (uastring) {
            parser.setUA(uastring);
            var result = parser.getResult();
            for (var prop in result) {
                $.ua[prop] = result[prop];
            }
        };
    }

})(typeof window === 'object' ? window : this);

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addDefaults;
function addDefaults(adParams, cb) {
  // Fill in optional AdParams fields
  adParams.pixels = adParams.pixels || [];
  adParams.sources = adParams.sources || [];
  adParams.features = adParams.features || [];
  adParams.options = adParams.options || {};
  adParams.videoClicks = adParams.videoClicks || {};
  adParams.videoClicks.clickTracking = adParams.videoClicks.clickTracking || [];
  // For when we are console inventory
  adParams.metadata = adParams.metadata || {};
  adParams.metadata.demandSourceId = adParams.metadata.demandSourceId || 0;
  cb(null, adParams);
}

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addMetadata;

var _url = require('../util/url');

var _metadata = require('../metadata.json');

function addMetadata(adParams, callback) {
  adParams.metadata.protocol = (0, _url.getTrueUrlInfo)().topUrl.match(/^(\w+):/)[1] || 'https';
  adParams.metadata.vpaidJSWrapperVersion = _metadata.vpaidJSWrapperVersion;
  callback(null, adParams);
}

},{"../metadata.json":26,"../util/url":32}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fireInitPixels;

var _diag = require('../diag');

var _diag2 = _interopRequireDefault(_diag);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fireInitPixels(adParams, cb) {
  var diag = new _diag2.default(adParams);
  diag.fire('VISTA_LOADED');
  cb(null, adParams);
}

},{"../diag":17}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseAd;

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _parse_yahoo_adparams = require('./parse_yahoo_adparams');

var _parse_yahoo_adparams2 = _interopRequireDefault(_parse_yahoo_adparams);

var _add_defaults = require('./add_defaults');

var _add_defaults2 = _interopRequireDefault(_add_defaults);

var _add_metadata = require('./add_metadata');

var _add_metadata2 = _interopRequireDefault(_add_metadata);

var _fire_init_pixels = require('./fire_init_pixels');

var _fire_init_pixels2 = _interopRequireDefault(_fire_init_pixels);

var _vast_parser = require('./vast_parser');

var _vast_parser2 = _interopRequireDefault(_vast_parser);

var _map_vast_vpaid = require('./map_vast_vpaid');

var _map_vast_vpaid2 = _interopRequireDefault(_map_vast_vpaid);

var _process_click_tracking = require('./process_click_tracking');

var _process_click_tracking2 = _interopRequireDefault(_process_click_tracking);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseAd(adParams, callback) {
  pipeline(adParams, [_parse_yahoo_adparams2.default, _add_defaults2.default, _add_metadata2.default, _fire_init_pixels2.default, _vast_parser2.default, _map_vast_vpaid2.default, _process_click_tracking2.default], callback);
}

function pipeline(adParams, steps, callback) {
  if (steps[0]) {
    steps[0] = _async2.default.apply(steps[0], adParams);
  }
  _async2.default.waterfall(steps, callback);
}

},{"./add_defaults":8,"./add_metadata":9,"./fire_init_pixels":10,"./map_vast_vpaid":12,"./parse_yahoo_adparams":13,"./process_click_tracking":14,"./vast_parser":15,"async":5}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mapVastPixelsToVpaid;
var vastToVpaidMap = {
  skip: 'AdSkipped',
  creativeView: 'AdStarted',
  impression: 'AdImpression',
  start: 'AdVideoStart',
  firstQuartile: 'AdVideoFirstQuartile',
  midpoint: 'AdVideoMidpoint',
  thirdQuartile: 'AdVideoThirdQuartile',
  complete: 'AdVideoComplete',
  acceptInvitation: 'AdUserAcceptInvitation',
  collapse: 'AdUserMinimize',
  close: 'AdUserClose',
  pause: 'AdPaused',
  resume: 'AdPlaying',
  error: 'AdError'
};

function mapVastPixelsToVpaid(adParams, cb) {
  adParams.pixels.forEach(function (p) {
    // Parse progress pixels
    if (p.event === 'progress' && p.offset !== undefined) {
      p.offset = parseTime(p.offset);
    }
    // Map VAST events to VPAID events
    var mapping = vastToVpaidMap[p.event];
    if (mapping) {
      p.event = mapping;
    }
  });

  cb(null, adParams);
}

function parseTime(timeString) {
  // Match the HH:MM:SS.mmm case
  var explicit = timeString.match(/^(\d{2}):(\d{2}):(\d{2})(.(\d{3}))?$/);
  if (explicit) {
    console.log(explicit);
    console.log(parseInt(explicit[1], 10));
    return {
      type: 'time',
      offset:
      // Hours
      3600 * parseInt(explicit[1], 10) +
      // Minutes
      60 * parseInt(explicit[2], 10) +
      // Seconds
      parseInt(explicit[3], 10) + (
      // Milliseconds
      explicit[5] ? parseInt(explicit[5], 10) / 1000.0 : 0)
    };
  }
  // Match the n% case
  var percentage = timeString.match(/^(\d+)%$/);
  if (percentage) {
    return {
      type: 'percentage',
      offset: parseInt(percentage[1], 10)
    };
  }
  return null;
}

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getAdParamsFromXml;

var _xml = require('../util/xml');

function getAdParamsFromXml(encodedAdParameters, cb) {
  // Decode the base64 encoded string
  try {
    var jsonAdParams = parseJSON(encodedAdParameters);
    cb(null, jsonAdParams);
  } catch (e) {
    try {
      var xmlParsedAdParams = parseEncodedXML(encodedAdParameters);
      cb(null, xmlParsedAdParams);
    } catch (e) {
      cb(e);
    }
  }
  return;
}

function parseEncodedXML(encodedAdParameters) {
  var adParams = {};

  var base64DecodedXml = void 0;
  try {
    base64DecodedXml = window.atob(encodedAdParameters); // decode the string
  } catch (e) {
    throw new Error('XML parsing error: ' + e.message);
    // console.log(encodedAdParameters);
  }

  // Parsing the decoded xml
  var adXML = void 0;
  if (base64DecodedXml !== null) {
    try {
      adXML = (0, _xml.parseXml)(base64DecodedXml);
      if (adXML.getElementsByTagName('parsererror').length > 0 || adXML.parseError && adXML.parseError.errorCode !== 0) {
        throw new Error(adXML.getElementsByTagName('parsererror')[0].nodeValue);
      }
    } catch (e) {
      throw new Error('XML parsing error: ' + e.message);
    }
  }

  var rootNode = adXML.documentElement.nodeName;

  if (rootNode === 'YahooViewability') {
    // calling call() on a null array is bad
    var viewableImpression = adXML.getElementsByTagName('ViewableImpression');
    forEach(viewableImpression, function (vimp) {
      adParams.viewabilityBeaconUrl = vimp.textContent;
    });

    // calling call() on a null array is bad
    adParams.pixels = adParams.pixels || [];
    var impressions = adXML.getElementsByTagName('Impression');
    forEach(impressions, function (imp) {
      adParams.pixels.push({
        event: 'impression',
        url: imp.textContent
      });
    });

    adParams.sources = adParams.sources || [];
    var mediaFiles = adXML.getElementsByTagName('MediaFile');
    forEach(mediaFiles, function (mediaFile) {
      adParams.sources.push({
        url: mediaFile.textContent && mediaFile.textContent.replace(/^\s+|\s+$/g, ''),
        mimetype: mediaFile.getAttribute('type'),
        apiFramework: mediaFile.getAttribute('apiFramework')
      });
    });

    var vastAdTagURI = adXML.getElementsByTagName('VASTAdTagURI');
    forEach(vastAdTagURI, function (vastUrl) {
      // check for vast tags in the param
      adParams.sources.push({
        url: vastUrl.textContent && vastUrl.textContent.replace(/^\s+|\s+$/g, ''),
        mimetype: 'application/xml'
      });
    });

    var trackingEvents = adXML.getElementsByTagName('Tracking');
    forEach(trackingEvents, function (event) {
      // these are mapped to VPAID in processAdParams
      adParams.pixels.push({
        event: event.getAttribute('event'),
        url: event.textContent
      });
    });

    var errorEvents = adXML.getElementsByTagName('Error');
    adParams.error = adParams.error || [];
    forEach(errorEvents, function (event) {
      adParams.error.push({
        event: event.getAttribute('event'),
        url: event.textContent
      });
    });

    adParams.videoClicks = adParams.videoClicks || {};
    adParams.videoClicks.clickTracking = adParams.videoClicks.clickTracking || [];
    var videoClicks = adXML.getElementsByTagName('ClickTracking');
    forEach(videoClicks, function (click) {
      adParams.videoClicks.clickTracking.push(click.textContent);
    });

    var clickThrough = adXML.getElementsByTagName('ClickThrough')[0];
    if (clickThrough) {
      adParams.videoClicks.clickThrough = clickThrough.textContent;
    }

    adParams.metadata = adParams.metadata || {};
    var moatParams = getMoatParamFromAdParams(adXML);
    if (moatParams) {
      forEach(moatParams, function (moatParam) {
        var propName = moatParam.nodeName;
        var propValue = moatParam.textContent;
        if (propName && propValue) {
          adParams.metadata[propName] = propValue;
        }
      });
    }
  }
  return adParams;
}

function parseJSON(adParameters) {
  var adParams = {};

  try {
    var parsedParams = JSON.parse(adParameters);
    if (parsedParams) {
      var viewableImpression = parsedParams.viewableImpression;
      forEachJson(viewableImpression, function (vimp) {
        adParams.viewabilityBeaconUrl = vimp;
      });

      // calling call() on a null array is bad
      adParams.pixels = adParams.pixels || [];
      var impressions = parsedParams.impression;
      adParams.pixels = adParams.pixels.concat(arrayfy(impressions).map(function (imp) {
        return {
          event: 'impression',
          url: imp
        };
      }));

      adParams.sources = adParams.sources || [];
      var mediaFiles = parsedParams.mediaFiles;
      adParams.sources = adParams.sources.concat(arrayfy(mediaFiles).map(function (mediaFile) {
        return {
          url: mediaFile.value && mediaFile.value.replace(/^\s+|\s+$/g, ''),
          mimetype: mediaFile.type,
          apiFramework: mediaFile.apiFramework
        };
      }));

      var vastAdTagURI = parsedParams.vastAdTagURI;
      adParams.sources = adParams.sources.concat(arrayfy(vastAdTagURI).map(function (vastUrl) {
        return {
          url: vastUrl && vastUrl.replace(/^\s+|\s+$/g, ''),
          mimetype: 'application/xml'
        };
      }));

      var trackingEvents = parsedParams.trackingEvents;
      adParams.pixels = adParams.pixels.concat(arrayfy(trackingEvents).map(function (event) {
        return {
          event: event.eventType,
          url: event.value
        };
      }));

      var errorEvents = parsedParams.error;
      adParams.error = adParams.error || [];
      adParams.error = adParams.error.concat(arrayfy(errorEvents).map(function (event) {
        return {
          event: 'error',
          url: event
        };
      }));

      adParams.videoClicks = adParams.videoClicks || {};
      adParams.videoClicks.clickTracking = adParams.videoClicks.clickTracking || [];

      var videoClicks = parsedParams.videoClicks.clickTracking;
      adParams.videoClicks.clickTracking = adParams.videoClicks.clickTracking.concat(arrayfy(videoClicks).map(function (click) {
        return click;
      }));

      var clickThroughs = parsedParams.videoClicks.clickThrough;
      forEachJson(clickThroughs, function (clickThrough) {
        adParams.videoClicks.clickThrough = clickThrough;
      });

      adParams.metadata = adParams.metadata || {};
      var moatParams = parsedParams.moatParams;
      if (moatParams) {
        for (var paramKey in moatParams) {
          var propName = paramKey;
          var propValue = moatParams[paramKey];
          if (propName && propValue) {
            adParams.metadata[propName] = propValue;
          }
        }
      }
    }
  } catch (e) {
    throw new Error('JSON parsing error: ' + e.message);
  }

  return adParams;
}

function getMoatParamFromAdParams(adXML) {
  var moatParams = adXML.getElementsByTagName('MOATparams')[0];
  if (moatParams) {
    return moatParams.childNodes;
  }
}
function forEach(collection, func) {
  collection = collection || [];
  [].forEach.call(collection, func);
}

function forEachJson(value, func) {
  /* Check if the value is null, further check if the value is an array */
  if (value) {
    if (!Array.isArray(value)) {
      value = [value];
    }
  } else {
    value = [];
  }
  value.forEach(func);
}

function arrayfy(value) {
  /* Check if the value is null, further check if the value is an array */
  if (value) {
    if (!Array.isArray(value)) {
      value = [value];
    }
  } else {
    value = [];
  }
  return value;
}

},{"../util/xml":33}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = processClickTracking;
function processClickTracking(adParams, cb) {
  adParams.videoClicks.clickTracking.forEach(function (url) {
    return adParams.pixels.push({
      event: 'AdClickThru',
      url: url
    });
  });
  cb(null, adParams);
}

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseVast;

var _diag = require('../diag');

var _diag2 = _interopRequireDefault(_diag);

var _macros = require('../macros');

var Macros = _interopRequireWildcard(_macros);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MAX_RECURSIVE_DEPTH = 5;

function parseVast(parsedAdParams, cb) {
  var vastUri = popVastUrl(parsedAdParams);
  parsedAdParams.debugData = { vastUri: vastUri };
  parsedAdParams.vastXmls = [];
  // recursively parse until we find a mediafile or hit depth
  if (vastUri) {
    fetchAndParseVastUrl(vastUri, parsedAdParams, cb, 0);
  } else {
    cb(null, parsedAdParams);
  }
}

function fetchAndParseVastUrl(url, adParams, cb, depth) {
  var diag = new _diag2.default(adParams);
  if (depth >= MAX_RECURSIVE_DEPTH) {
    console.log('recursive depth reached');
    diag.fire('VAST_MAX_DEPTH', function () {
      cb(new Error('max VAST unwrapping depth reached'));
    });
    return;
  }

  var req = new XMLHttpRequest();

  req.onreadystatechange = function () {
    // 4 === DONE
    if (4 !== req.readyState) {
      return;
    }

    if (200 !== req.status) {
      diag.fire('VAST_NOT_FOUND', function () {
        cb(new Error('parseVast error: response status: ' + req.status));
      });
      return;
    }

    if (!req.responseXML) {
      // dunno if this is possible
      diag.fire('VAST_PARSER_ERROR', function () {
        cb(new Error('parseVast error: missing responseXML'));
      });
      return;
    }

    // will be processed upon hitting a InLine ad
    adParams.vastXmls.push(req.responseXML);

    switch (getAdType(req.responseXML)) {
      case 'Wrapper':
        // recurse
        var vastAdTagURI = getVastAdTagUri(req.responseXML);
        if (vastAdTagURI) {
          fetchAndParseVastUrl(vastAdTagURI, adParams, cb, depth + 1);
        } else {
          diag.fire('VAST_WRAPPER_URI_MISSING', function () {
            cb(new Error('VASTAdTag URI not found'));
          });
        }
        break;

      case 'InLine':
        // found a source, update adParams, call callback
        var postProcess = void 0;
        try {
          postProcess = processAdParams(adParams);
        } catch (e) {
          cb(new Error('addAdParams error: ' + e.message));
          return;
        }
        cb(null, postProcess);
        break;

      default:
        diag.fire('VAST_MISSING_AD_TYPE', function () {
          cb(new Error('vast error: no ad type found'));
        });
        break;
    }
  };
  // don't need to pass it AdParams at this step, pageUrl non-dependent
  url = Macros.expand(url, null, [Macros.pageUrl]);
  req.open('GET', url);
  req.send();
}

function getVastAdTagUri(xml) {
  var tag = xml.getElementsByTagName('VASTAdTagURI')[0];
  if (tag) {
    return tag.textContent;
  }
  return null;
}

function getAdType(xml) {
  var adXml = xml.getElementsByTagName('Ad')[0];
  if (adXml) {
    // InLine or Wrapper
    return adXml.firstElementChild.tagName;
  }
  return null;
}

function forEach(collection, func) {
  collection = collection || [];
  [].forEach.call(collection, func);
}

// stores the relevant fields from XML to our adParams
function parseVastXml(adParams, responseXML) {
  var diag = new _diag2.default(adParams);
  // is this sanity check needed?
  var adXML = responseXML.getElementsByTagName('Ad')[0];
  if (!adXML || adXML.childElementCount !== 1 || adXML === 'null') {
    diag.fire('VAST_MALFORMED');
    throw Error('parseVastXml error: invalid VAST format');
  }

  // calling call() on a null array is bad
  var impressions = adXML.getElementsByTagName('Impression');
  forEach(impressions, function (imp) {
    adParams.pixels.push({
      event: 'impression',
      url: imp.textContent
    });
  });

  var mediaFiles = adXML.getElementsByTagName('MediaFile');
  forEach(mediaFiles, function (mediaFile) {
    adParams.sources.push({
      url: mediaFile.textContent && mediaFile.textContent.replace(/^\s+|\s+$/g, ''),
      mimetype: mediaFile.getAttribute('type'),
      apiFramework: mediaFile.getAttribute('apiFramework')
    });
  });

  var trackingEvents = adXML.getElementsByTagName('Tracking');
  forEach(trackingEvents, function (event) {
    // these are mapped to VPAID in processAdParams
    adParams.pixels.push({
      event: event.getAttribute('event'),
      url: event.textContent
    });
  });

  var videoClicks = adXML.getElementsByTagName('ClickTracking');
  forEach(videoClicks, function (click) {
    adParams.videoClicks.clickTracking.push(click.textContent);
  });

  var clickThrough = adXML.getElementsByTagName('ClickThrough')[0];
  if (clickThrough) {
    adParams.videoClicks.clickThrough = clickThrough.textContent;
  }

  var thirdPartyAdParams = adXML.getElementsByTagName('AdParameters')[0];
  if (thirdPartyAdParams) {
    adParams.thirdPartyAdParams = thirdPartyAdParams.textContent;
  }
}

function processAdParams(adParams) {
  // parse fields out of each XML encountered
  adParams.vastXmls.forEach(function (item) {
    return parseVastXml(adParams, item);
  });
  return adParams;
}

// pops so it won't be a video source
function popVastUrl(adParams) {
  var sources = adParams.sources;
  var vastURL = null;
  if (sources) {
    adParams.sources = sources.filter(function (source) {
      if ('application/xml' === source.mimetype) {
        vastURL = source.url;
        return false;
      }
      return true;
    });
  }

  return vastURL;
}

},{"../diag":17,"../macros":25}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var envConfig = void 0;
/*eslint-disable*/
if (undefined === 'prod') {
  /*eslint-enable*/
  envConfig = require('../conf/prod');
} else {
  envConfig = require('../conf/dev');
}

var baseConfig = {
  adPlaybackTimeout: 1000 * 60 * 10, // 10 minutes
  vpaidCreativeMethodTimeout: 20000, // 20 seconds
  scoutWatchShouldFire: {
    AdImpression: true,
    AdVideoStart: true,
    AdVideoFirstQuartile: true,
    AdVideoMidpoint: true,
    AdVideoThirdQuartile: true,
    AdVideoComplete: true,
    AdStopped: true,
    AdError: true,
    AdClickThru: true,
    AdSizeChange: true,
    AdDurationChange: true
  }
};

for (var k in envConfig) {
  baseConfig[k] = envConfig[k];
}

exports.default = baseConfig;

},{"../conf/dev":1,"../conf/prod":2}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fire2 = require('./util/fire');

var _fire3 = _interopRequireDefault(_fire2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var parser = require('ua-parser-js');

var diagCodes = {
  'VAST_NOT_FOUND': 20001,
  'VAST_PARSER_ERROR': 20002,
  'VAST_WRAPPER_URI_MISSING': 20003,
  'VAST_MALFORMED': 20004,
  'VAST_NO_AD': 20005,
  'VAST_MAX_DEPTH': 20006,
  'VAST_MISSING_AD_TYPE': 20007,

  // VPAID error cases
  'VPAID_HANDSHAKE_FAIL': 20010,
  'VPAID_LOAD_ERROR': 20011,
  'VPAID_LOAD_TIMEOUT': 20012,
  'VPAID_VITAL_METHOD_TIMEOUT': 20013,
  'VPAID_PROTOCOL_NOT_SUPPORTED': 20014,
  'VPAID_INTERNAL_ERROR': 20015,
  'NO_VIDEO_SLOT': 20201,
  'VPAID_NONVITAL_METHOD_TIMEOUT': 20202,
  'VPAID_STATE_INCONSISTENCY': 20203,
  'AD_DURATION_NOT_SUPPORTED': 20204,
  'VIDEO_SLOT_ERROR': 20205,
  'SUBSCRIBER_ERROR': 20206,
  'VISTA_UNCAUGHT_ERROR': 20207,
  'NO_COMPATIBLE_VIDEO': 20208,
  'PUBLISHER_UNCAUGHT_ERROR': 20209,
  // LOADED and IMP are used in creative throttling
  'VISTA_LOADED': 60000,
  'VISTA_IMP': 60001
};

var eventNameMap = {
  AdImpression: 'VISTA_IMP'
};

var Diag = function () {
  function Diag(adParams) {
    _classCallCheck(this, Diag);

    this.adParams = adParams;
  }

  _createClass(Diag, [{
    key: '_getUrlForName',
    value: function _getUrlForName(name, details) {
      var code = 'JS-' + diagCodes[name];
      if (this.adParams.browser === undefined) {
        try {
          var userAgent = this._getUserAgent();
          this.adParams.browser = this._getBrowserFromUserAgent(userAgent);
        } catch (e) {
          // empty
        }
      }
      var baseUrl = this.adParams.error[0].url || '';
      if (this.adParams && this.adParams.browser) {
        code = code + ',' + 'rb:' + this.adParams.browser;
      }
      if (this.adParams && this.adParams.selectedFileType) {
        code = code + ',' + 'rm:' + this.adParams.selectedFileType;
      }
      return baseUrl.replace(/(##|\[)ERRORCODE(##|\])/gi, code);
    }
  }, {
    key: 'getUrlByEvent',
    value: function getUrlByEvent(event) {
      var name = eventNameMap[event];
      return name && this._getUrlForName(name);
    }
  }, {
    key: 'fire',
    value: function fire(name, cb, details) {
      (0, _fire3.default)(this._getUrlForName(name, details), cb);
    }
  }, {
    key: '_getUserAgent',
    value: function _getUserAgent() {
      return navigator && navigator.userAgent;
    }
  }, {
    key: '_getBrowserFromUserAgent',
    value: function _getBrowserFromUserAgent(userAgent) {
      var agent = parser(userAgent);
      return agent && agent.browser && agent.browser.name + agent.browser.major;
    }
  }]);

  return Diag;
}();

exports.default = Diag;

},{"./util/fire":30,"ua-parser-js":7}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fire2 = require('../util/fire');

var _fire3 = _interopRequireDefault(_fire2);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _index = require('./providers/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventHandler = function () {
  function EventHandler(params) {
    _classCallCheck(this, EventHandler);

    this.params = params;
    this.pixelProviders = (0, _index2.default)(params);
    this.diag = null;

    // maps from events to arrays of subscribers
    this.internalSubscribers = {};
    this.externalSubscribers = {};
  }

  _createClass(EventHandler, [{
    key: 'init',
    value: function init(params) {
      for (var key in this.pixelProviders) {
        this.pixelProviders[key].init(params);
      }
      this.diag = params.diag;
    }
  }, {
    key: 'addExternalSubscriber',
    value: function addExternalSubscriber(cb, event, context) {
      var eventSubscribers = this.externalSubscribers[event] || [];
      eventSubscribers.push({
        callback: cb,
        context: context
      });
      this.externalSubscribers[event] = eventSubscribers;
    }
  }, {
    key: 'addInternalSubscriber',
    value: function addInternalSubscriber(cb, event, context) {
      var eventSubscribers = this.internalSubscribers[event] || [];
      eventSubscribers.push({
        callback: cb,
        context: context
      });
      this.internalSubscribers[event] = eventSubscribers;
    }
  }, {
    key: 'removeSubscriber',
    value: function removeSubscriber(cb, event) {
      removeCallback(this.internalSubscribers, cb, event);
      removeCallback(this.externalSubscribers, cb, event);
    }
  }, {
    key: 'fire',
    value: function fire(event, params, playbackInfo, callback) {
      var _this = this;

      var uris = Object.keys(this.pixelProviders).reduce(function (uris, provider) {
        return uris.concat(_this.pixelProviders[provider].getUris(event, playbackInfo));
      }, []);

      _async2.default.each(uris, function (uri, done) {
        (0, _fire3.default)(uri, done);
      }, function () {
        try {
          fireEvent(_this.internalSubscribers, event, params);
          fireEvent(_this.externalSubscribers, event, params);
        } catch (e) {
          if (event !== 'AdError') {
            var details;
            var stack;
            if (e !== null) {
              details = e.message;
              stack = e.stack.toString().split(/\r\n|\n/);
              if (!!stack && stack.length > 1) {
                details += ' ' + window.btoa('stack1: ' + stack[1] + 'stackn: ' + stack[stack.length - 1]);
              }
            }
            _this.diag && _this.diag.fire('SUBSCRIBER_ERROR', function () {
              _this.fire('AdError', ['Error occurred when firing ' + event + ' event handlers: ' + e.message], playbackInfo);
            }, event + ' event handlers: ' + details);
          }
          return;
        }
        callback && callback();
      });
    }
  }, {
    key: 'getProviders',
    value: function getProviders() {
      return this.pixelProviders;
    }
  }]);

  return EventHandler;
}();

exports.default = EventHandler;


function removeCallback(subscribersMap, cb, event) {
  var subscribers = subscribersMap[event];
  if (subscribers) {
    subscribersMap[event] = subscribers.filter(function (s) {
      return s.callback !== cb;
    });
  }
}

function fireEvent(subscribersMap, event, params) {
  var subscribers = subscribersMap[event];
  if (params) {
    if (!Array || !Array.isArray || !Array.isArray(params)) {
      params = [params];
    }
  }
  subscribers && subscribers.forEach(function (s) {
    return s.callback.apply(s.context || null, params);
  });
}

},{"../util/fire":30,"./providers/index.js":21,"async":5}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// This contains all the impression and event pixels encountered during parsing.
var AdParamsProvider = function () {
  function AdParamsProvider() {
    _classCallCheck(this, AdParamsProvider);

    // map of events to arrays of pixels
    this.eventPixelMap = {};
    this.adParams = null;
  }

  _createClass(AdParamsProvider, [{
    key: 'init',
    value: function init(params) {
      var _this = this;

      this.adParams = params.adParams;
      this.adParams.pixels.forEach(function (pixel) {
        var eventName = pixel.event;
        var url = pixel.url;

        // progress events are dealt with elsewhere
        if (eventName && url && eventName !== 'progress') {
          _this.eventPixelMap[eventName] = _this.eventPixelMap[eventName] || [];
          _this.eventPixelMap[eventName].push(url);
        }
      });
    }
  }, {
    key: 'getUris',
    value: function getUris(event) {
      return this.eventPixelMap[event] || [];
    }
  }]);

  return AdParamsProvider;
}();

exports.default = AdParamsProvider;

},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _diag = require('../../diag');

var _diag2 = _interopRequireDefault(_diag);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DiagProvider = function () {
  function DiagProvider() {
    _classCallCheck(this, DiagProvider);

    this.diag = null;
  }

  _createClass(DiagProvider, [{
    key: 'init',
    value: function init(params) {
      this.diag = new _diag2.default(params.adParams);
    }
  }, {
    key: 'getUris',
    value: function getUris(event, playbackInfo) {
      if (this.diag) {
        // For errors before we parse adparams, we won't init.
        var url = this.diag.getUrlByEvent(event);
        return url ? [url] : [];
      }
      return [];
    }
  }]);

  return DiagProvider;
}();

exports.default = DiagProvider;

},{"../../diag":17}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getPixelProviders;

var _ad_params = require('./ad_params');

var _ad_params2 = _interopRequireDefault(_ad_params);

var _diag = require('./diag');

var _diag2 = _interopRequireDefault(_diag);

var _moat = require('./moat');

var _moat2 = _interopRequireDefault(_moat);

var _pip_boy = require('./pip_boy');

var _pip_boy2 = _interopRequireDefault(_pip_boy);

var _insideVideo = require('./inside-video');

var _insideVideo2 = _interopRequireDefault(_insideVideo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPixelProviders(params) {
  return {
    AdParamsProvider: new _ad_params2.default(params),
    PipBoyProvider: new _pip_boy2.default(params),
    MoatProvider: new _moat2.default(params),
    DiagProvider: new _diag2.default(params),
    InsideVideoProvider: new _insideVideo2.default(params)
  };
}

},{"./ad_params":19,"./diag":20,"./inside-video":22,"./moat":23,"./pip_boy":24}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*eslint-disable*/

var _insideVideo = require('../../../lib/inside-video');

var _insideVideo2 = _interopRequireDefault(_insideVideo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InsideVideo = function () {
  function InsideVideo() {
    _classCallCheck(this, InsideVideo);

    this.adParams = null;
  }

  //adElement,adWidth,adWHeight,adUnit,viewabilityBeaconUrl


  _createClass(InsideVideo, [{
    key: 'init',
    value: function init(params) {
      this.adParams = params.adParams;
      var metadata = this.adParams.metadata;
      if (this.adParams) {

        if (params.vpaidJSWrapper && params.vpaidJSWrapper.videoSlot) {
          params.adWHeight = params.vpaidJSWrapper.videoSlot.offsetHeight;
          params.adWidth = params.vpaidJSWrapper.videoSlot.offsetWidth;
          params.videoSlot = params.vpaidJSWrapper.videoSlot;
        }

        if (params.slot) {
          // vpaid, container, adIds, partnerCode
          (0, _insideVideo2.default)(params);
        }
      }
    }
  }, {
    key: 'getUris',
    value: function getUris(event) {
      return [];
    }
  }]);

  return InsideVideo;
}();

exports.default = InsideVideo;

},{"../../../lib/inside-video":3}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*eslint-disable*/

var _moat = require('../../../lib/moat');

var _moat2 = _interopRequireDefault(_moat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var partnerCode = 'yahoovpaidtwoint215831825037';

var Moat = function () {
  function Moat() {
    _classCallCheck(this, Moat);

    this.adParams = null;
  }

  _createClass(Moat, [{
    key: 'init',
    value: function init(params) {
      this.adParams = params.adParams;
      var metadata = this.adParams.metadata;
      if (this.adParams && this.adParams.metadata) {
        var ids = {
          level1: 'Yahoo!',
          level2: metadata.campaignID,
          level3: metadata.lineItemID,
          level4: metadata.creativeID,
          slicer1: metadata.publisherID,
          slicer2: metadata.sitePlacementID,
          sampling: '1.0',
          viewMode: 'normal',
          zMoatAuctionID: metadata.auctionID,
          zMoatAdReqDomain: metadata.adRequestDomainName
        };

        if (params.slot) {
          // vpaid, container, adIds, partnerCode
          (0, _moat2.default)(params.vpaidJSWrapper, params.slot, ids, partnerCode);
        }
      }
    }
  }, {
    key: 'getUris',
    value: function getUris(event) {
      return [];
    }
  }]);

  return Moat;
}();

exports.default = Moat;

},{"../../../lib/moat":4}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PipBoyProvider = function () {
  function PipBoyProvider(params) {
    _classCallCheck(this, PipBoyProvider);

    this.pipBoy = params.pipBoy;
  }

  _createClass(PipBoyProvider, [{
    key: "init",
    value: function init() {}
  }, {
    key: "getUris",
    value: function getUris(event, playbackInfo) {
      // const url = this.pipBoy.getUrlByEvent(event);
      return [];
    }
  }]);

  return PipBoyProvider;
}();

exports.default = PipBoyProvider;

},{}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.xtraHacker = exports.xtra = exports.timeStamp = exports.publisher = exports.protocol = exports.pageUrl = exports.sitePlacementId = exports.lineItemId = exports.insertionOrderId = exports.vpaidJSWrapperVersion = exports.demandSourceId = exports.creativeIdHacker = exports.creativeId = exports.adRequestDomainName = undefined;
exports.expand = expand;

var _url = require('./util/url');

function expand(url, adParams, macros) {
  macros.forEach(function (macro) {
    var replacement = void 0;
    try {
      replacement = macro.replacement(adParams);
    } catch (e) {
      replacement = 'undefined';
    }
    url = url.replace(macro.regex, replacement);
  });
  return url;
}

var adRequestDomainName = exports.adRequestDomainName = {
  regex: /##AD_REQUEST_DOMAIN_NAME##/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.adRequestDomainName);
  }
};

var creativeId = exports.creativeId = {
  regex: /(##|\[)CREATIVE_ID(##|\])/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.creativeId);
  }
};

var creativeIdHacker = exports.creativeIdHacker = {
  regex: /(##|\[)CREATIVE_ID_HACKER(##|\])/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.creativeId);
  }
};

var demandSourceId = exports.demandSourceId = {
  regex: /(\[)demand_source_id(\])/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.demandSourceId);
  }
};

var vpaidJSWrapperVersion = exports.vpaidJSWrapperVersion = {
  regex: /(##|\[)VISTA_VERSION(##|\])/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.vpaidJSWrapperVersion);
  }
};

var insertionOrderId = exports.insertionOrderId = {
  regex: /(##|\[)IO_ID(##|\])/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.insertionOrderId);
  }
};

var lineItemId = exports.lineItemId = {
  regex: /(##|\[)LINE_ITEM_ID(##|\])/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.lineItemId);
  }
};

var sitePlacementId = exports.sitePlacementId = {
  regex: /(##|\[)(SITE_PLACEMENT_ID|SITE_ID|SITE_PLACEMENT)(##|\])/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.sitePlacementId);
  }
};

var pageUrl = exports.pageUrl = {
  regex: /(##|\[)PAGE_URL(##|\])/gi,
  replacement: function replacement(adParams) {
    return String((0, _url.getTrueUrlInfo)().topUrl);
  }
};

var protocol = exports.protocol = {
  regex: /(##|\[)PROTOCOL(##|\])/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.protocol);
  }
};

var publisher = exports.publisher = {
  regex: /(##|\[)(PUBLISHER|PUBLISHER_ID)(##|\])/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.publisherId);
  }
};

var timeStamp = exports.timeStamp = {
  regex: /(##|%|\[)TIMESTAMP(##|%|\])/gi,
  replacement: function replacement(adParams) {
    return new Date().toUTCString();
  }
};

var xtra = exports.xtra = {
  regex: /(##|\[)XTRA(##|\])/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.xtra);
  }
};

var xtraHacker = exports.xtraHacker = {
  regex: /(##|\[)XTRA_HACKER(##|\])/gi,
  replacement: function replacement(adParams) {
    return String(adParams.metadata.xtra);
  }
};

},{"./util/url":32}],26:[function(require,module,exports){
module.exports={
  "vpaidJSWrapperVersion": "VISTA_1_2_VERSION"
}

},{}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import fire from './util/fire';


var _clock = require('./util/clock');

var _clock2 = _interopRequireDefault(_clock);

var _macros = require('./macros');

var Macros = _interopRequireWildcard(_macros);

var _metadata = require('./metadata.json');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 1xx: VPAID events
var eventMapping = {
  AdLoaded: { code: '101', onlyOnDebug: false, fireOnce: false },
  AdStarted: { code: '102', onlyOnDebug: false, fireOnce: false },
  AdStopped: { code: '103', onlyOnDebug: true, fireOnce: false },
  AdSkipped: { code: '104', onlyOnDebug: true, fireOnce: false },
  AdSkippableStateChange: { code: '105', onlyOnDebug: true, fireOnce: false },
  AdSizeChange: { code: '106', onlyOnDebug: true, fireOnce: false },
  AdLinearChange: { code: '107', onlyOnDebug: true, fireOnce: false },
  AdDurationChange: { code: '108', onlyOnDebug: true, fireOnce: false },
  AdExpandedChange: { code: '109', onlyOnDebug: true, fireOnce: false },
  AdRemainingTimeChange: { code: '110', onlyOnDebug: true, fireOnce: true },
  AdVolumeChange: { code: '111', onlyOnDebug: true, fireOnce: false },
  AdImpression: { code: '112', onlyOnDebug: false, fireOnce: false },
  AdClickThru: { code: '114', onlyOnDebug: true, fireOnce: false },
  AdInteraction: { code: '115', onlyOnDebug: true, fireOnce: false },
  AdLog: { code: '118', onlyOnDebug: true, fireOnce: false },
  AdError: { code: '119', onlyOnDebug: false, fireOnce: false },
  AdVideoStart: { code: '120', onlyOnDebug: true, fireOnce: false },
  AdVideoFirstQuartile: { code: '121', onlyOnDebug: true, fireOnce: false },
  AdVideoMidpoint: { code: '122', onlyOnDebug: true, fireOnce: false },
  AdVideoThirdQuartile: { code: '123', onlyOnDebug: true, fireOnce: false },
  AdVideoComplete: { code: '124', onlyOnDebug: true, fireOnce: false },
  AdUserAcceptInvitation: { code: '130', onlyOnDebug: true, fireOnce: false },
  AdUserMinimize: { code: '131', onlyOnDebug: true, fireOnce: false },
  AdUserClose: { code: '132', onlyOnDebug: true, fireOnce: false },
  AdPaused: { code: '140', onlyOnDebug: true, fireOnce: false },
  AdPlaying: { code: '141', onlyOnDebug: true, fireOnce: false }
};

// 2xx: VPAID method calls
var methodMapping = {
  subscribe: { code: '200', onlyOnDebug: true, fireOnce: true },
  handshakeVersion: { code: '201', onlyOnDebug: true, fireOnce: false },
  initAd: { code: '202', onlyOnDebug: true, fireOnce: false },
  resizeAd: { code: '203', onlyOnDebug: true, fireOnce: false },
  startAd: { code: '204', onlyOnDebug: false, fireOnce: false },
  stopAd: { code: '205', onlyOnDebug: true, fireOnce: false },
  pauseAd: { code: '206', onlyOnDebug: true, fireOnce: false },
  resumeAd: { code: '207', onlyOnDebug: true, fireOnce: false },
  expandAd: { code: '208', onlyOnDebug: true, fireOnce: false },
  collapseAd: { code: '209', onlyOnDebug: true, fireOnce: false },
  skipAd: { code: '210', onlyOnDebug: true, fireOnce: false }
};

// 3xx: Browser/Vista behavior
var behaviorMapping = {
  loadedFile: { code: '300', onlyOnDebug: true, fireOnce: false },
  getVPAIDAdCalled: { code: '301', onlyOnDebug: true, fireOnce: false },
  instantiatedVista: { code: '302', onlyOnDebug: true, fireOnce: false }
};

// 4xx: Errors
var errorMapping = {
  adPlaybackTimedOut: { code: '401', onlyOnDebug: false, fireOnce: false }
};

var baseUrl = '[protocol]://pipboy.btrll.com/Pix-1x1.gif?' + 'p_id=[publisher_id]&sp_id=[site_placement_id]&li_id=[line_item_id]&c_id=[creative_id_hacker]' + '&xtra=[xtra_hacker]&version=[vpaidJSWrapper_version]';

var macroList = [Macros.creativeIdHacker, Macros.vpaidJSWrapperVersion, Macros.lineItemId, Macros.protocol, Macros.publisher, Macros.sitePlacementId, Macros.xtraHacker];

var PipBoy = function () {
  function PipBoy(queryParams) {
    _classCallCheck(this, PipBoy);

    var adParams = {};
    adParams.metadata = queryParams;
    adParams.metadata.vpaidJSWrapperVersion = _metadata.vpaidJSWrapperVersion;

    this.firedPixels = {};
    this.clock = new _clock2.default();
    this.count = 0;
    this.debug = !!adParams.metadata.debug;
    this.adParams = adParams;
  }

  _createClass(PipBoy, [{
    key: '_logFire',
    value: function _logFire(pixel) {
      this.firedPixels[pixel.code] = true;
      this.count++;
    }
  }, {
    key: '_canFirePixel',
    value: function _canFirePixel(pixel) {
      if (!pixel) {
        return false;
      }
      // Only fire debug pixels if we're in debug mode
      if (!this.debug && pixel.onlyOnDebug) {
        return false;
      }
      // Avoid firing some pixels more than once
      if (pixel.fireOnce && this.firedPixels[pixel.code]) {
        return false;
      }
      return true;
    }
  }, {
    key: '_getUrlFromMap',
    value: function _getUrlFromMap(name, map) {
      var pixel = map[name];
      if (this._canFirePixel(pixel)) {
        var url = getUrl(pixel, this.count, this.clock.getCurrentTime(), this.adParams);
        this._logFire(pixel);
        return url;
      } else {
        return null;
      }
    }
  }, {
    key: '_fireUrlFromMap',
    value: function _fireUrlFromMap(name, map) {
      var url = this._getUrlFromMap(name, map);
      if (url) {
        // fire(url);
        console.log(url);
      }
    }
  }, {
    key: 'init',
    value: function init(params) {
      this.adParams = params;
      this.debug = this.adParams.features.some(function (f) {
        return f === 'debug';
      }) || this.debug;
    }
  }, {
    key: 'getUrlByEvent',
    value: function getUrlByEvent(name) {
      return this._getUrlFromMap(name, eventMapping);
    }
  }, {
    key: 'fireMethod',
    value: function fireMethod(name) {
      return this._fireUrlFromMap(name, methodMapping);
    }
  }, {
    key: 'fireBehavior',
    value: function fireBehavior(name) {
      return this._fireUrlFromMap(name, behaviorMapping);
    }
  }, {
    key: 'fireError',
    value: function fireError(name) {
      return this._fireUrlFromMap(name, errorMapping);
    }
  }]);

  return PipBoy;
}();

exports.default = PipBoy;


function getUrl(pixel, count, currentTime, adParams) {
  return Macros.expand(baseUrl, adParams, macroList) + '&count=' + count + '&time=' + currentTime.toFixed(3) + '&code=' + pixel.code;
}

},{"./macros":25,"./metadata.json":26,"./util/clock":29}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fire = require('./util/fire');

var _fire2 = _interopRequireDefault(_fire);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProgressEvents = function () {
  function ProgressEvents() {
    _classCallCheck(this, ProgressEvents);

    this.listeners = [];
    this.percentageListeners = [];
    this.uris = [];
    this.percentageUris = [];
  }

  _createClass(ProgressEvents, [{
    key: 'addListener',
    value: function addListener(cb, offset, context) {
      addSorted(this.listeners, {
        callback: cb,
        context: context,
        offset: offset
      });
    }
  }, {
    key: 'addListenerPercentage',
    value: function addListenerPercentage(cb, offset, context) {
      addSorted(this.percentageListeners, {
        callback: cb,
        context: context,
        offset: offset
      });
    }
  }, {
    key: 'addURI',
    value: function addURI(uri, offset) {
      addSorted(this.uris, {
        uri: uri,
        offset: offset
      });
    }
  }, {
    key: 'addURIPercentage',
    value: function addURIPercentage(uri, offset) {
      addSorted(this.percentageUris, {
        uri: uri,
        offset: offset
      });
    }
  }, {
    key: 'checkAndFire',
    value: function checkAndFire(time, duration, params, callback) {
      var _this = this;

      var percentage = time / duration * 100;
      _async2.default.series([_async2.default.apply(_checkAndFire, this.percentageUris, percentage), _async2.default.apply(_checkAndFire, this.uris, time)], function () {
        checkAndCall(_this.percentageListeners, percentage, params);
        checkAndCall(_this.listeners, time, params);
        callback && callback();
      });
    }
  }]);

  return ProgressEvents;
}();

exports.default = ProgressEvents;


function addSorted(arr, item) {
  var left = 0;
  var right = arr.length;
  while (left !== right) {
    var middle = Math.floor((right - left) / 2) + left;
    if (item.offset > arr[middle].offset) {
      right = middle;
    } else if (item.offset === arr[middle].offset) {
      left = middle;
      break;
    } else {
      left = middle + 1;
    }
  }
  arr.splice(left, 0, item);
}

function _checkAndFire(arr, offset, callback) {
  _async2.default.whilst(function () {
    return arr.length > 0 && arr[arr.length - 1].offset <= offset;
  }, function (done) {
    var uri = arr.pop();
    (0, _fire2.default)(uri.uri, done);
  }, callback);
}

function checkAndCall(arr, offset, params) {
  var listener = void 0;
  // Go through the sorted array until we've passed offset
  while (arr.length > 0 && arr[arr.length - 1].offset <= offset) {
    listener = arr.pop();
    listener.callback.apply(listener.context || null, params);
  }
}

},{"./util/fire":30,"async":5}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Clock = function () {
  function Clock() {
    _classCallCheck(this, Clock);

    this.startTime = getTime();
  }

  // Returns the time in seconds


  _createClass(Clock, [{
    key: "getCurrentTime",
    value: function getCurrentTime() {
      return (getTime() - this.startTime) / 1000;
    }
  }]);

  return Clock;
}();

exports.default = Clock;


function getTime() {
  return new Date().getTime();
}

},{}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fire;
function fire(uri, callback) {
  var img = new Image();

  var imageCB = function imageCB() {
    callback && callback();
  };

  img.onload = imageCB;
  img.onerror = imageCB;

  img.src = uri;
}

},{}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseQueryParams;
function parseQueryParams(url) {
  var queryParams = {};
  var protocolMatch = url && url.match(/^\s*(\w+):/);
  if (protocolMatch && protocolMatch[1]) {
    queryParams.protocol = protocolMatch[1];
  } else {
    queryParams.protocol = 'https';
  }
  var params = url && url.split('?')[1];
  if (params) {
    var paramsList = params.split('&');
    paramsList.forEach(function (param) {
      var kv = param.split('=');
      switch (kv[0]) {
        // publisher id
        case 'p':
          queryParams.publisherId = kv[1];
          break;
        // SPID
        case 's':
          queryParams.sitePlacementId = kv[1];
          break;
        // Line Item ID
        case 'l':
          queryParams.lineItemId = kv[1];
          break;
        // Demand Source ID
        case 'ds':
          queryParams.demandSourceId = kv[1];
          break;
        // Creative ID
        case 'ic':
          queryParams.creativeId = kv[1];
          break;
        // Xtra, will be auctionId for RTBD responses
        case 'x':
          queryParams.xtra = kv[1];
          break;
        // Auction ID
        case 'au':
          queryParams.auctionId = kv[1];
          break;
        // debug
        case 'debug':
          queryParams.debug = kv[1] === 'y';
          break;
      }
    });
  }

  return queryParams;
}

},{}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTrueUrlInfo = getTrueUrlInfo;
exports.getVpaidJSWrapperUrl = getVpaidJSWrapperUrl;
// GetTrueUrlInfo logic taken from Scout
// Detection of top-level URL, given the possible nested frame scenarios that may occur in the wild
function getTrueUrlInfo() {
  var currentUrl = window.location.href;

  // Binary string to indicate whether or not we're inside of an iframe
  var inIframe = '0';

  // If we're not within an iframe, the parent will be an empty string
  var parentUrl = '';

  // Here, the top URL is the URL at the highest level at which we can detect.
  // The top URL should always have a value
  var topUrl = '';

  // The method by which we detected these domains
  var detectionMethod = '';

  // Ampersand-delimited string of domains, where the first item is the current page URL
  // and the last is the top-most domain we're able to detect
  var domainChainString = '';

  var ancestorOrigins;
  var ancestorOriginsArray;
  var ancestorOriginsString;
  var i;

  var ancestorOriginsSupported = function ancestorOriginsSupported() {
    try {
      var ancestorOrigins = window.location.ancestorOrigins;
      if (typeof ancestorOrigins !== 'undefined') {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  var isTopSameDomain = function isTopSameDomain() {
    try {
      var topUrl = window.top.location.href;
      if (typeof topUrl !== 'undefined') {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  // First, check to see if we're actually in an iframe. If we are, there's no parent/top URL to grab
  if (window.self === window.top) {
    topUrl = currentUrl;
    domainChainString = topUrl;
    detectionMethod = 'noFrames';
  } else {
    inIframe = '1';

    // 1) Check to see if the top domain is the same as the child
    // This will only be the case when the top domain matches the child domain in protocol, host and port
    if (isTopSameDomain()) {
      parentUrl = window.parent.location.href;
      topUrl = window.top.location.href;
      domainChainString = currentUrl + '||' + parentUrl + '||' + topUrl;
      detectionMethod = 'sameDomain';

      // 1) ancestorOrigins
    } else if (ancestorOriginsSupported()) {
      ancestorOrigins = window.location.ancestorOrigins;
      ancestorOriginsArray = [];
      for (i = 0; i < ancestorOrigins.length; i = i + 1) {
        ancestorOriginsArray[i] = ancestorOrigins[i];
      }

      // Grab each URL in the domain chain and format in an ampersand-delimited string
      ancestorOriginsString = ancestorOriginsArray.join('||');
      domainChainString = currentUrl + '||' + ancestorOriginsString;

      // We also need to grab the parent URL, and top-level URL, to pass as separate parameters
      // First element is parent
      parentUrl = ancestorOriginsArray[0];

      // Last element is top-level URL
      topUrl = ancestorOriginsArray[ancestorOriginsArray.length - 1];
      detectionMethod = 'ancestorOrigins';

      // 3) If neither of the above detection methods work correctly, grab the referer URL,
      // which should be the URL of the parent (retrievable in cross-domain settings)
    } else {
      parentUrl = document.referrer;
      // If we have a referer URL, use that as the top URL in this case.
      // Otherwise, there may not be a referer under certain conditions and we need to use the current URL
      if (parentUrl !== '') {
        topUrl = parentUrl;
      } else {
        topUrl = currentUrl;
      }
      domainChainString = currentUrl + '||' + parentUrl;
      detectionMethod = 'referer';
    }
  }

  // After detection, encode our domain chain string and return everything.
  return {
    inIframe: inIframe,
    currentUrl: currentUrl,
    parentUrl: parentUrl,
    topUrl: topUrl,
    detectionMethod: detectionMethod,
    domainChainString: domainChainString,
    encodedDomainChainString: encodeURIComponent(domainChainString)
  };
}

// returns the Vista url loaded in the DOM
function getVpaidJSWrapperUrl() {
  var scripts = document.getElementsByTagName('script') || [];
  var vpaidJSWrapperUrl = null;
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].getAttribute('src');
    if (src && src.match(/\/vista\.js/)) {
      vpaidJSWrapperUrl = src;
      break;
    }
  }

  return vpaidJSWrapperUrl;
}

},{}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseXml = parseXml;
function parseXml(xml) {
  // cross browser xml parsing shim
  if (typeof window.DOMParser !== 'undefined') {
    return new window.DOMParser().parseFromString(xml, 'text/xml');
  } else if (typeof window.ActiveXObject !== 'undefined' && new window.ActiveXObject('Microsoft.XMLDOM')) {
    var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
    xmlDoc.async = 'false';
    xmlDoc.loadXML(xml);
    return xmlDoc;
  } else {
    throw new Error('No XML parser found');
  }
}

},{}],34:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _diag = require('./diag');

var _diag2 = _interopRequireDefault(_diag);

var _event_handler = require('./event/event_handler');

var _event_handler2 = _interopRequireDefault(_event_handler);

var _url = require('./util/url');

var _index = require('./ad_parser/index.js');

var _index2 = _interopRequireDefault(_index);

var _query_params = require('./util/query_params');

var _query_params2 = _interopRequireDefault(_query_params);

var _pip_boy = require('./pip_boy');

var _pip_boy2 = _interopRequireDefault(_pip_boy);

var _progress_events = require('./progress_events');

var _progress_events2 = _interopRequireDefault(_progress_events);

var _vpaid_handler = require('./vpaid_handler');

var _vpaid_handler2 = _interopRequireDefault(_vpaid_handler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import Watch from './watch';

// console shim for IE9
/*eslint-disable*/
if (typeof console === 'undefined') {
  console = {
    log: function log() {}
  };
}
/*eslint-enable*/

var vpaidJSWrapperUrl = (0, _url.getVpaidJSWrapperUrl)();
var queryParams = (0, _query_params2.default)(vpaidJSWrapperUrl);
var pipBoy = new _pip_boy2.default(queryParams);

// Fire 'Vista JavaScript file loaded' (300) pixel
pipBoy.fireBehavior('loadedFile');
// fireUserMappingPixels(queryParams);

var Vista = function () {
  function Vista() {
    var _this = this;

    _classCallCheck(this, Vista);

    this.videoSlot = null;
    this.debug = queryParams.debug || false;
    this.initialized = false;
    this.stopAdCalled = false;
    this.errorTimeout = null;
    this.progressEvents = new _progress_events2.default();
    this.eventHandler = new _event_handler2.default({ pipBoy: pipBoy });
    this.vpaidHandler = new _vpaid_handler2.default(this.eventHandler);
    this.diag = null;
    this.props = null;
    this.watch = null;

    this.eventHandler.addInternalSubscriber(function (e) {
      _this._watchLog({ error: e });
      _this._cleanUp();
    }, 'AdError');

    window.onerror = function (message, url, line, col, e) {
      if (vpaidJSWrapperUrl === url) {
        _this.diag && _this.diag.fire('VISTA_UNCAUGHT_ERROR', function () {
          _this._adError('Vista error occurred: ' + message);
          return true;
        });
      } else {
        _this.diag && _this.diag.fire('PUBLISHER_UNCAUGHT_ERROR');
      }
    };

    // States for skip prevention
    var NORMAL = 0; // Normal video playback
    var SEEKING = 1; // Playhead is being moved by a 3rd party
    var FIXING_PLAYHEAD = 2; // We're moving the playhead back

    var seekingState = NORMAL;
    var firedStart = false;
    var firedImpression = false;

    this.slotListeners = {
      timeupdate: function timeupdate() {
        if (seekingState === NORMAL) {
          if (!firedImpression && _this.videoSlot.currentTime > 0) {
            _this._callEvent('AdImpression');
            firedImpression = true;
          }
          _this._callEvent('AdRemainingTimeChange');
          _this.progressEvents.checkAndFire(_this.videoSlot.currentTime, _this.videoSlot.duration);
        }
      },
      play: function play() {
        if (seekingState === SEEKING) {
          _this.videoSlot.currentTime = 0.0;
          seekingState = FIXING_PLAYHEAD;
        }
      },
      playing: function playing() {
        if (!firedStart) {
          if (_this.videoSlot.src !== undefined && _this.diag && _this.diag.adParams) {
            _this.diag.adParams.selectedFileType = _this._getMediaFileType(_this.videoSlot.src);
          }
          _this._callEvent('AdStarted');
          firedStart = true;
        }
      },
      seeking: function seeking() {
        if (seekingState === NORMAL) {
          seekingState = SEEKING;
        }
      },
      seeked: function seeked() {
        // Changing the current time back to the old one triggers a seeking event, deal with it here
        if (seekingState === FIXING_PLAYHEAD) {
          seekingState = NORMAL;
        }
      },
      ended: function ended() {
        if (seekingState === NORMAL) {
          // Catch progress pixels between the last timeupdate event and the end of the video
          _this.progressEvents.checkAndFire(_this.videoSlot.currentTime, _this.videoSlot.duration, [], function () {
            _this._callEvent('AdVideoComplete', [], function () {
              // After we finish performing AdVideoComplete callbacks, make this check
              if (!_this.stopAdCalled) {
                _this._cleanUp();
                _this._callEvent('AdStopped');
              }
            });
          });
        }
      },
      loadstart: function loadstart() {
        if (_this.initialized && _this.videoSlot.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
          _this._adError('No valid video sources found');
          return;
        }
      },
      loadedmetadata: function loadedmetadata() {
        // We just got duration data from the video, let the player know
        _this._callEvent('AdDurationChange');
      },
      canplay: function canplay() {
        console.log('canplay happened!');
      },
      click: function click() {
        _this._onClick();
      },
      contextmenu: function contextmenu(event) {
        event.preventDefault();
      },
      error: function error() {
        _this.diag && _this.diag.fire('VIDEO_SLOT_ERROR', function () {
          _this._adError('Error occurred when playing video with code ' + (_this.videoSlot.error && _this.videoSlot.error.code));
        }, _this.videoSlot.error && _this.videoSlot.error.code);
      }
    };
  }

  _createClass(Vista, [{
    key: '_watchLog',
    value: function _watchLog(message) {
      if (this.debug && this.watch) {
        console.log(message);
        // this.watch.log(message);
      }
    }
  }, {
    key: '_callEvent',
    value: function _callEvent(e, params, callback) {
      console.log('calling event ' + e);
      if (_config2.default.scoutWatchShouldFire[e]) {
        this._watchLog({ event: e });
      }
      this.eventHandler.fire(e, params, {
        adTime: this.videoSlot && this.videoSlot.currentTime,
        adDuration: this.videoSlot && this.videoSlot.duration
      }, callback);
    }
  }, {
    key: '_trackMethod',
    value: function _trackMethod(method) {
      pipBoy.fireMethod(method);
    }
  }, {
    key: '_adError',
    value: function _adError(message) {
      this._callEvent('AdError', [message]);
    }
  }, {
    key: '_setTrackingPixels',
    value: function _setTrackingPixels(pixels) {
      var _this2 = this;

      pixels.forEach(function (pixel) {
        var eventName = pixel.event;
        var url = pixel.url;
        if (!eventName || !url) {
          return;
        }
        if (eventName === 'progress' && pixel.offset !== undefined) {
          var offset = pixel.offset;
          switch (offset.type) {
            case 'time':
              _this2.progressEvents.addURI(url, offset.offset);
              break;
            case 'percentage':
              _this2.progressEvents.addURIPercentage(url, offset.offset);
              break;
          }
        }
      });
    }
  }, {
    key: '_setPlaybackEvents',
    value: function _setPlaybackEvents() {
      var _this3 = this;

      var playbackEvents = {
        AdVideoStart: 0,
        AdVideoFirstQuartile: 25,
        AdVideoMidpoint: 50,
        AdVideoThirdQuartile: 75
      };
      for (var e in playbackEvents) {
        this.progressEvents.addListenerPercentage(function (event) {
          return function () {
            _this3._callEvent(event);
          };
        }(e), playbackEvents[e]);
      }
    }
  }, {
    key: '_setVideoSources',
    value: function _setVideoSources(videos, debugData) {
      var _this4 = this;

      console.log('setting sources');
      if (videos) {
        var selectedVideo = null;
        videos.some(function (video) {
          var canPlay = _this4.videoSlot.canPlayType(video.mimetype);
          if (canPlay === 'probably') {
            selectedVideo = video;
            return true;
          }
          if (canPlay === 'maybe' && !selectedVideo) {
            selectedVideo = video;
          }
        });
        if (selectedVideo) {
          this.videoSlot.src = selectedVideo.url;
          return selectedVideo.url;
        } else {
          this._watchLog({
            foundNoCompatible: videos.length,
            sources: videos.map(function (vid) {
              return vid.mimetype + ':' + vid.url && vid.url.slice(0, 255) + ':' + vid.apiFramework;
            }).join(),
            ogUri: debugData && debugData.vastUri && debugData.vastUri.slice(0, 255)
          });
          this._adError('NO_COMPATIBLE_VIDEO');
        }
      } else {
        this._adError('No videos');
      }
    }
  }, {
    key: '_getMediaFileType',
    value: function _getMediaFileType(url) {
      // this removes the anchor at the end, if there is one
      url = url.substring(0, url.indexOf('#') === -1 ? url.length : url.indexOf('#'));
      // this removes the query after the file name, if there is one
      url = url.substring(0, url.indexOf('?') === -1 ? url.length : url.indexOf('?'));
      // this removes everything before the last slash in the path
      url = url.substring(url.lastIndexOf('/') + 1, url.length);
      // this return the type of the file
      var type = url.substring(url.lastIndexOf('.') + 1, url.length);
      if (url !== type && type.length < 5) {
        return type;
      }
    }

    // videoWidth / videoHeight are 'true' video size, not settable
    // width / height control what we see, are settable

  }, {
    key: '_setAdSize',
    value: function _setAdSize(width, height) {
      if (this.videoSlot) {
        this.videoSlot.width = width;
        this.videoSlot.height = height;
        this._callEvent('AdSizeChange');
      } else {
        console.log('No videoSlot');
      }
    }
  }, {
    key: '_onClick',
    value: function _onClick() {
      if (!this.videoSlot.paused) {
        console.log('clicked!');
        var url = this.props.adParameters.videoClicks.clickThrough;
        this._callEvent('AdClickThru', [url || null, '', false]);
        window.open(url, '_blank');
      } else {
        this.videoSlot.play();
      }
    }
  }, {
    key: '_cleanUp',
    value: function _cleanUp() {
      if (this.videoSlot) {
        for (var ev in this.slotListeners) {
          this.videoSlot.removeEventListener && this.videoSlot.removeEventListener(ev, this.slotListeners[ev], false);
        }
      }
      if (this.errorTimeout) {
        window.clearTimeout(this.errorTimeout);
      }
      this.progressEvents = new _progress_events2.default();
    }
  }, {
    key: '_readFeatures',
    value: function _readFeatures(data) {
      var _this5 = this;

      data.features.forEach(function (f) {
        switch (f) {
          case 'debug':
            _this5.debug = true;
            break;
        }
      });
    }
  }, {
    key: 'initAd',
    value: function initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
      var _this6 = this;

      this._trackMethod('initAd');
      // console.log('initAd ' + width + 'x' + height + ' ' + viewMode + ' ' + desiredBitrate +
      // ' ' + creativeData);

      // don't use slice on arguments, messes with optimization
      var vpaidArgs = new Array(arguments.length);
      for (var i = 0; i < arguments.length; ++i) {
        // i is always valid index in the arguments object
        vpaidArgs[i] = arguments[i];
      }

      var afterParse = function afterParse(err, data) {
        _this6.diag = new _diag2.default(data);

        if (err) {
          _this6._adError(err.message);
          return;
        }

        _this6.props = getDefaultProps();
        _this6.props.width = width;
        _this6.props.height = height;
        _this6.props.viewMode = viewMode;
        _this6.props.desiredBitrate = desiredBitrate;

        _this6.videoSlot = environmentVars.videoSlot;
        _this6._videoSlotCanAutoPlay = environmentVars.videoSlotCanAutoPlay;

        if (!_this6.videoSlot) {
          _this6.diag.fire('NO_VIDEO_SLOT', function () {
            _this6._adError('No video slot!');
          });
          return;
        }

        if (typeof _this6.videoSlot.volume === 'undefined') {
          _this6.videoSlot.volume = _this6.videoSlot.muted ? 0 : 1;
        }

        if (_this6.videoSlot.style) {
          _this6.videoSlot.style.cursor = 'pointer';
        }

        var slot = environmentVars.slot;
        if (slot) {
          slot.style.cursor = 'pointer';
          slot.style.width = '100%';
          slot.style.height = '100%';
          slot.style.position = 'absolute';
          slot.style['z-index'] = '100';
        }

        _this6.videoSlot.autoplay = false;
        _this6._readFeatures(data);
        _this6.props.adParameters = data;
        _this6.initialized = true;
        // otherwise .height and .width are 0, even though visually they are not
        _this6.videoSlot.width = _this6.props.width;
        _this6.videoSlot.height = _this6.props.height;

        // this.watch = new Watch(data);

        pipBoy.init(data);

        _this6.eventHandler.init({
          adParams: data,
          vpaidJSWrapper: _this6,
          slot: slot,
          diag: _this6.diag
        });

        if (_this6.props.adParameters.pixels) {
          _this6._setTrackingPixels(_this6.props.adParameters.pixels);
        }
        _this6._setPlaybackEvents();

        if (_this6.props.adParameters.sources) {
          var vpaidSource = getVPAIDSource(_this6.props.adParameters.sources);
          if (vpaidSource !== null) {
            for (var _i = 0; _i < vpaidArgs.length; ++_i) {
              // i is always valid index in the arguments object
              if (vpaidArgs[_i] === creativeData) {
                vpaidArgs[_i] = { AdParameters: _this6.props.adParameters.thirdPartyAdParams };
              }
            }
            _this6.vpaidHandler.loadVPAIDAd(vpaidSource, _this6.videoSlot, _this6.props, _this6.debug, _this6.watch, _this6.diag, _this6.progressEvents, vpaidArgs);
          } else {
            // Add event listeners to videoSlot
            for (var ev in _this6.slotListeners) {
              _this6.videoSlot.addEventListener(ev, _this6.slotListeners[ev], false);
            }
            if (slot) {
              slot.addEventListener('click', function () {
                _this6._onClick();
              });
            }
            var url = _this6._setVideoSources(_this6.props.adParameters.sources, _this6.props.adParameters.debugData);
            if (!url) {
              _this6.diag.fire('NO_COMPATIBLE_VIDEO', function () {
                _this6._adError('NO_COMPATIBLE_VIDEO');
              });
              return;
            }
            _this6.videoSlot.load();
            _this6._callEvent('AdLoaded');
          }
        }
      };

      var adParams = void 0;
      if (typeof creativeData === 'string') {
        // Some players pass in a string
        adParams = creativeData;
      } else {
        // The VPAID spec says to expect an object with the `AdParameters` key
        adParams = creativeData.AdParameters;
      }

      (0, _index2.default)(adParams, afterParse);
    }
  }, {
    key: 'handshakeVersion',
    value: function handshakeVersion(version) {
      this._trackMethod('handshakeVersion');
      console.log('handshake called');
      return '2.0';
    }
  }, {
    key: 'startAd',
    value: function startAd() {
      var _this7 = this;

      this._trackMethod('startAd');
      this._watchLog({ vpaid: 'startAd' });
      if (this.vpaidHandler.hasAd()) {
        this.vpaidHandler.startAd();
        return;
      }
      this.videoSlot.play();
      this.errorTimeout = setTimeout(function () {
        pipBoy.fireError('adPlaybackTimedOut');
        _this7._adError('Ad playback timed out');
      }, _config2.default.adPlaybackTimeout);
    }
  }, {
    key: 'stopAd',
    value: function stopAd() {
      this._trackMethod('stopAd');
      this._watchLog({ vpaid: 'stopAd' });
      if (this.vpaidHandler.hasAd()) {
        this.vpaidHandler.stopAd();
        return;
      }
      this.videoSlot && this.videoSlot.pause();
      this._cleanUp();
      this.progressEvents = new _progress_events2.default();
      this.stopAdCalled = true;
      this._callEvent('AdStopped');
    }
  }, {
    key: 'setAdVolume',
    value: function setAdVolume(v) {
      this._watchLog({ vpaid: 'setAdVolume' });
      if (v >= 0 && v <= 1 && this.videoSlot) {
        this.props.adVolume = v;
        if (this.vpaidHandler.hasAd()) {
          this.vpaidHandler.setAdVolume(v);
          return;
        }
        if (this.videoSlot.volume === 0 && v > 0) {
          this._callEvent('unmute');
        } else if (this.videoSlot.volume > 0 && v === 0) {
          this._callEvent('mute');
        }
        this.videoSlot.volume = v;
        this._callEvent('AdVolumeChange');
      } else {
        console.log('Invalid volume ', v);
      }
    }
  }, {
    key: 'getAdVolume',
    value: function getAdVolume() {
      if (this.vpaidHandler.hasAd()) {
        return this.vpaidHandler.getAdVolume();
      } else if (this.videoSlot) {
        return this.videoSlot.volume;
      } else {
        console.log('No videoSlot');
      }
    }
  }, {
    key: 'resizeAd',
    value: function resizeAd(width, height, viewMode) {
      console.log('resizeAd ' + width + 'x' + height + ' ' + viewMode);
      this._watchLog({
        vpaid: 'resizeAd',
        width: width,
        height: height,
        viewMode: viewMode
      });
      this._trackMethod('resizeAd');

      this.props.viewMode = viewMode;
      if (viewMode !== 'fullscreen') {
        this.props.width = width;
        this.props.height = height;
      }
      if (this.vpaidHandler.hasAd()) {
        this.vpaidHandler.resizeAd(width, height, viewMode);
        return;
      }
      if (this.props.viewMode !== 'fullscreen' && viewMode === 'fullscreen') {
        this._callEvent('fullscreen');
      } else if (this.props.viewMode === 'fullscreen' && viewMode !== 'fullscreen') {
        this._callEvent('exitFullscreen');
      }
      this._setAdSize(width, height);
    }
  }, {
    key: 'pauseAd',
    value: function pauseAd() {
      this._trackMethod('pauseAd');
      this._watchLog({ vpaid: 'pauseAd' });
      if (this.vpaidHandler.hasAd()) {
        this.vpaidHandler.pauseAd();
      } else {
        this.videoSlot.pause();
        this._callEvent('AdPaused');
      }
    }
  }, {
    key: 'resumeAd',
    value: function resumeAd() {
      this._trackMethod('resumeAd');
      this._watchLog({ vpaid: 'resumeAd' });
      if (this.vpaidHandler.hasAd()) {
        this.vpaidHandler.resumeAd();
      } else {
        this.videoSlot.play();
        this._callEvent('AdPlaying');
      }
    }
  }, {
    key: 'expandAd',
    value: function expandAd() {
      this._trackMethod('expandAd');
      this._watchLog({ vpaid: 'expandAd' });
      if (this.vpaidHandler.hasAd()) {
        this.vpaidHandler.expandAd();
      } else {
        this._callEvent('AdExpandedChange');
      }
      this.props.adExpanded = true;
    }
  }, {
    key: 'getAdExpanded',
    value: function getAdExpanded() {
      this._watchLog({ vpaid: 'getAdExpanded' });
      return this.vpaidHandler.hasAd() ? this.vpaidHandler.getAdExpanded() : this.props.adExpanded;
    }
  }, {
    key: 'getAdSkippableState',
    value: function getAdSkippableState() {
      this._watchLog({ vpaid: 'getAdSkippableState' });
      return this.vpaidHandler.hasAd() ? this.vpaidHandler.getAdSkippableState() : this.props.adSkippableState;
    }
  }, {
    key: 'collapseAd',
    value: function collapseAd() {
      this._trackMethod('collapseAd');
      this._watchLog({ vpaid: 'collapseAd' });
      if (this.vpaidHandler.hasAd()) {
        this.vpaidHandler.collapseAd();
      } else {
        this._callEvent('AdExpandedChange');
      }
      this.props.adExpanded = false;
    }
  }, {
    key: 'skipAd',
    value: function skipAd() {
      this._trackMethod('skipAd');
      this._watchLog({ vpaid: 'skipAd' });
      if (this.vpaidHandler.hasAd()) {
        this.vpaidHandler.skipAd();
      } else if (this.props.adSkippableState) {
        this._callEvent('AdSkipped');
      } else {
        console.log('Ad is not skippable.');
      }
    }
  }, {
    key: 'subscribe',
    value: function subscribe(callback, eventName, context) {
      this._trackMethod('subscribe');
      this.eventHandler.addExternalSubscriber(callback, eventName, context);
      console.log('Subscribe ' + eventName);
    }
  }, {
    key: 'unsubscribe',
    value: function unsubscribe(callback, eventName) {
      this.eventHandler.removeSubscriber(callback, eventName);
      this._watchLog({ vpaid: 'unsubscribe' });
    }
  }, {
    key: 'getAdWidth',
    value: function getAdWidth() {
      this._watchLog({ vpaid: 'getAdWidth' });
      if (this.vpaidHandler.hasAd()) {
        return this.vpaidHandler.getAdWidth();
      }
      if (this.videoSlot) {
        return this.props.width;
      } else {
        console.log('No videoSlot');
      }
    }
  }, {
    key: 'getAdHeight',
    value: function getAdHeight() {
      this._watchLog({ vpaid: 'getAdHeight' });
      if (this.vpaidHandler.hasAd()) {
        return this.vpaidHandler.getAdHeight();
      }
      if (this.videoSlot) {
        return this.props.height;
      } else {
        console.log('No videoSlot');
      }
    }
  }, {
    key: 'getAdRemainingTime',
    value: function getAdRemainingTime() {
      // don't watchLog this because it's too verbose
      // Return -2 if duration information isn't available (from VPAID 2.0 spec, 3.2.6)
      return !this.videoSlot || isNaN(this.videoSlot.duration) ? -2 : this.videoSlot.duration - this.videoSlot.currentTime;
    }
  }, {
    key: 'getAdDuration',
    value: function getAdDuration() {
      this._watchLog({ vpaid: 'getAdDuration' });
      // Return -2 if duration information isn't available (from VPAID 2.0 spec, 3.2.7)
      return !this.videoSlot || isNaN(this.videoSlot.duration) ? -2 : this.videoSlot.duration;
    }
  }, {
    key: 'getAdCompanions',
    value: function getAdCompanions() {
      this._watchLog({ vpaid: 'getAdCompanions' });
      return this.props.adCompanions;
    }
  }, {
    key: 'getAdIcons',
    value: function getAdIcons() {
      this._watchLog({ vpaid: 'getAdIcons' });
      return this.props.adIcons;
    }
  }, {
    key: 'getAdLinear',
    value: function getAdLinear() {
      this._watchLog({ vpaid: 'getAdLinear' });
      if (this.vpaidHandler.hasAd()) {
        this.props.adLinear = this.vpaidHandler.getAdLinear();
      }
      return this.props.adLinear;
    }
  }]);

  return Vista;
}();

function getVPAIDSource(sources) {
  var url = null;
  if (sources) {
    sources.some(function (source) {
      if (['application/javascript', 'application/x-javascript'].indexOf(source.mimetype) > -1 && source.apiFramework === 'VPAID') {
        url = source.url;
        return true;
      }
      return false;
    });
  }
  return url;
}

function getDefaultProps() {
  return {
    adExpanded: false,
    adLinear: true,
    adSkippableState: false,
    adCompanions: '',
    adIcons: false,
    adVolume: 1
  };
}

/*eslint-disable */
var getVPAIDAd = function () {
  var h = new Vista();
  return function () {
    pipBoy.fireBehavior('getVPAIDAdCalled');
    return h;
  };
}();
/*eslint-enable */

if (typeof TEST !== 'undefined' && TEST) {
  getVPAIDAd.Vista = Vista;
}

module = typeof module === 'undefined' ? {} : module;
module.exports = getVPAIDAd;

pipBoy.fireBehavior('instantiatedVista');

},{"./ad_parser/index.js":11,"./config":16,"./diag":17,"./event/event_handler":18,"./pip_boy":27,"./progress_events":28,"./util/query_params":31,"./util/url":32,"./vpaid_handler":35}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VPAIDMethods = ['handshakeVersion', 'initAd', 'startAd', 'stopAd', 'skipAd', 'resizeAd', 'pauseAd', 'resumeAd', 'expandAd', 'collapseAd', 'subscribe', 'unsubscribe'];

var echoedEvents = ['AdSkipped', 'AdLinearChange', 'AdExpandedChange', 'AdSkippableStateChange', 'AdDurationChange', 'AdRemainingTimeChange', 'AdVolumeChange', 'AdImpression', 'AdInteraction', 'AdVideoStart', 'AdVideoFirstQuartile', 'AdVideoMidpoint', 'AdVideoThirdQuartile', 'AdUserAcceptInvitation', 'AdUserMinimize', 'AdUserClose'];

var VpaidHandler = function () {
  function VpaidHandler(eventHandler) {
    var _this = this;

    _classCallCheck(this, VpaidHandler);

    this.eventHandler = eventHandler;
    this.iFrame;
    this.adUnit;
    this.adDuration;
    this.stopped = false;

    // from Horizon
    this.videoSlot = null;
    this.watch = null;
    this.debug = null;
    this.props = null;
    this.diag = null;
    this.progressEvents = null;

    // ids for timeouts on async functions
    this.timeouts = {
      load: null,
      handshake: null,
      initAd: null,
      startAd: null,
      pauseAd: null,
      resumeAd: null,
      stopAd: null
    };

    this.adPlayingState = null;

    /* Ad Event Callbacks
     * These are subscribed to their respective events
     * which are fired by the adUnit.
     *
     * Many simply have Horizon echo the event back
     * up to the video player.
     *
     * there are timeouts associated with AdLoaded,
     * AdStarted, AdStopped that must be cleared in
     * their respective callbacks.
     *
     * When the 3rd party VPAID unit's state of the video
     * player is inconsistent with Horizons, we fire a diag.
     */
    this.adEventCBs = {
      // non standard events
      AdLoaded: function AdLoaded() {
        clearTimeout(_this.timeouts.initAd);
        _this._callEvent('AdLoaded');
      },
      AdStarted: function AdStarted() {
        // set a state
        _this.adPlayingState = 'AdPlaying';
        clearTimeout(_this.timeouts.startAd);
        if (_this.videoSlot.paused) {
          _this.diag.fire('VPAID_STATE_INCONSISTENCY');
        }

        _this.adDuration = _this.adUnit.getAdDuration();
        if (_this.adDuration >= 0) {
          _this._progressEventCron();
        } else if (_this.adDuration === -1) {
          _this.diag.fire('AD_DURATION_NOT_SUPPORTED');
        }

        _this._callEvent('AdStarted');
      },
      AdStopped: function AdStopped() {
        // reset the state
        _this.adPlayingState = 'AdStopped';
        clearTimeout(_this.timeouts.stopAd);
        // document.body.removeChild(this.iFrame);
        if (!_this.stopped) {
          _this.stopped = true;
          _this._callEvent('AdStopped');
        }
      },
      AdLog: function AdLog(id) {
        this._callEvent('AdLog', id);
      },
      AdSizeChange: function AdSizeChange() {
        // resizeAd defines the max size, not the exact size
        if (_this.props.viewMode !== 'fullscreen' && (_this.props.width > _this.videoSlot.width || _this.props.height > _this.videoSlot.height)) {
          _this.diag.fire('VPAID_STATE_INCONSISTENCY');
        }
        _this._callEvent('AdSizeChange');
      },
      AdPaused: function AdPaused() {
        clearTimeout(_this.timeouts.pauseAd);
        if (!_this.videoSlot.paused) {
          _this.diag.fire('VPAID_STATE_INCONSISTENCY');
        }
        _this._callEvent('AdPaused');
      },
      AdPlaying: function AdPlaying() {
        clearTimeout(_this.timeouts.resumeAd);
        if (_this.videoSlot.paused) {
          _this.diag.fire('VPAID_STATE_INCONSISTENCY');
        }
        _this._callEvent('AdPlaying');
      },
      AdVolumeChange: function AdVolumeChange() {
        if (_this.props.adVolume !== _this.adUnit.getAdVolume()) {
          _this.diag.fire('VPAID_STATE_INCONSISTENCY');
        }
        _this._callEvent('AdVolumeChange');
      },
      AdDurationChange: function AdDurationChange() {
        _this.adDuration = _this.adUnit.getAdDuration();
        _this._callEvent('AdDurationChange');
      },
      AdClickThru: function AdClickThru(url, trackingId, playerHandles) {
        if (!url) {
          url = _this.props.adParameters.videoClicks.clickThrough;
          playerHandles = true;
        }
        _this._callEvent('AdClickThru', [url || null, trackingId || '', playerHandles]);
      },
      AdVideoComplete: function AdVideoComplete() {
        _this.progressEvents.checkAndFire(_this.adDuration - _this.adUnit.getAdRemainingTime(), _this.adDuration);
        _this._callEvent('AdVideoComplete');
      },
      AdError: function AdError(message) {
        _this.diag.fire('VPAID_INTERNAL_ERROR', function () {
          _this._callEvent('AdError', message);
        });
      }
    };

    echoedEvents.forEach(function (event) {
      _this.adEventCBs[event] = function () {
        return _this._callEvent(event);
      };
    });
  }

  _createClass(VpaidHandler, [{
    key: '_watchLog',
    value: function _watchLog(message) {
      if (this.debug && this.watch) {
        this.watch.log(message);
      }
    }
  }, {
    key: '_callEvent',
    value: function _callEvent(e, params, callback) {
      console.log('calling 3rd party vpaid event ' + e);
      this._watchLog({ event: e });
      this.eventHandler.fire(e, params, {
        adTime: this.videoSlot && this.videoSlot.currentTime,
        adDuration: this.videoSlot && this.videoSlot.duration
      }, callback);
    }
  }, {
    key: '_progressEventCron',
    value: function _progressEventCron() {
      // checks at 4 Hertz
      var cronId = setInterval(function fireProgress() {
        var currentTime = this.adDuration - this.adUnit.getAdRemainingTime();
        this.progressEvents.checkAndFire(currentTime, this.adDuration);
        if (currentTime >= this.adDuration) {
          clearInterval(cronId);
        }
      }.bind(this), 250);
    }
  }, {
    key: '_adError',
    value: function _adError(message) {
      console.log('3rd party vpaid error ' + message);
      this._watchLog({ error: message });
      this._callEvent('AdError', [message]);
    }
  }, {
    key: '_fireDiagError',
    value: function _fireDiagError(name) {
      var _this2 = this;

      this.diag.fire(name, function () {
        return _this2._adError(name);
      });
    }
  }, {
    key: '_subscribeAdEvents',
    value: function _subscribeAdEvents(adUnit) {
      for (var event in this.adEventCBs) {
        this.adUnit.subscribe(this.adEventCBs[event], event, this);
      }
    }

    /* loadVPAIDAd is the main VPAIDHandler function called by Horizon
     * params: source Url, boolean for debug, scoutWatch object, array of
     * the initAd() params passed to Horizon itself (that are passed through
     * to the 3rd party initAd call)
     */

  }, {
    key: 'loadVPAIDAd',
    value: function loadVPAIDAd(sourceUrl, vidSlot, vpaidJSWrapperProps, isDebug, scoutWatch, vpaidJSWrapperDiag, vpaidJSWrapperProgEvents, vpaidJSWrapperInitAdArgs) {
      var _this3 = this;

      this.videoSlot = vidSlot;
      this.props = vpaidJSWrapperProps;
      this.debug = isDebug;
      this.watch = scoutWatch;
      this.diag = vpaidJSWrapperDiag;
      this.progressEvents = vpaidJSWrapperProgEvents;

      // load 3rd party vpaid into clean iFrame
      // this.iFrame = document.createElement('iframe');
      // this.iFrame.id = '3rd-party-vpaid-frame';
      // this.iFrame.setAttribute('style', 'border:0 none');
      // this.iFrame.src = 'javascript:false';
      // this.iFrame.onload = () => {
      // const iFrameDoc = this.iFrame.contentWindow.document;
      var script = document.createElement('script');
      this.timeouts.load = setTimeout(function () {
        _this3._fireDiagError('VPAID_LOAD_TIMEOUT');
      }, _config2.default.vpaidCreativeMethodTimeout);

      // main logic once 3rd party source loads
      script.onload = function () {
        clearTimeout(_this3.timeouts.load);
        var getVPAIDAd = window.getVPAIDAd;
        if (getVPAIDAd && typeof getVPAIDAd === 'function') {
          _this3.adUnit = getVPAIDAd();
          _this3.timeouts.handshake = setTimeout(function () {
            _this3.diag.fire('VPAID_VITAL_METHOD_TIMEOUT', function () {
              _this3._adError('handshake timed out');
            });
          }, _config2.default.vpaidCreativeMethodTimeout);
          var vpaidVersion = _this3.adUnit.handshakeVersion('2.0');
          clearTimeout(_this3.timeouts.handshake);

          if (!implementsVPAIDSpec(_this3.adUnit)) {
            _this3.fireDiagError('VPAID_PROTOCOL_NOT_SUPPORTED');
            return;
          }

          if (!acceptableVPAIDVersion(vpaidVersion)) {
            _this3.fireDiagError('VPAID_HANDSHAKE_FAIL');
            return;
          }

          _this3._subscribeAdEvents(_this3.adUnit);
          _this3.timeouts.initAd = setTimeout(function () {
            _this3.diag.fire('VPAID_VITAL_METHOD_TIMEOUT', function () {
              _this3._adError('initAd timed out');
            });
          }, _config2.default.vpaidCreativeMethodTimeout);
          _this3.adUnit.initAd.apply(_this3.adUnit, vpaidJSWrapperInitAdArgs);
        } else {
          _this3.fireDiagError('VPAID_PROTOCOL_NOT_SUPPORTED');
        }
      };

      script.onerror = function (event) {
        clearTimeout(_this3.timeouts.load);
        _this3.fireDiagError('VPAID_LOAD_ERROR');
      };

      script.src = sourceUrl;
      script.type = 'text/javascript';

      // iFrameDoc.body.appendChild(script);
      // };

      document.body.appendChild(script);
    }
  }, {
    key: 'hasAd',
    value: function hasAd() {
      return !!this.adUnit;
    }
    // Passthrough Functions

  }, {
    key: 'startAd',
    value: function startAd() {
      var _this4 = this;

      if (this.adPlayingState === 'AdPlaying') {
        return;
      }
      clearTimeout(this.timeouts.startAd);
      this.timeouts.startAd = setTimeout(function () {
        _this4.diag.fire('VPAID_VITAL_METHOD_TIMEOUT', function () {
          _this4._adError('startAd timed out');
        });
      }, _config2.default.vpaidCreativeMethodTimeout);
      this.adUnit.startAd();
    }
  }, {
    key: 'resizeAd',
    value: function resizeAd(width, height, viewMode) {
      this.adUnit.resizeAd(width, height, viewMode);
    }
  }, {
    key: 'stopAd',
    value: function stopAd() {
      var _this5 = this;

      clearTimeout(this.timeouts.stopAd);
      this.timeouts.stopAd = setTimeout(function () {
        _this5.diag.fire('VPAID_VITAL_METHOD_TIMEOUT', function () {
          _this5._adError('stopAd timed out');
        });
      }, _config2.default.vpaidCreativeMethodTimeout);
      this.adUnit.stopAd();
    }
  }, {
    key: 'pauseAd',
    value: function pauseAd() {
      var _this6 = this;

      clearTimeout(this.timeouts.pauseAd);
      this.timeouts.pauseAd = setTimeout(function () {
        _this6.diag.fire('VPAID_NONVITAL_METHOD_TIMEOUT');
        console.log('pauseAd timed out');
      }, _config2.default.vpaidCreativeMethodTimeout);
      this.adUnit.pauseAd();
    }
  }, {
    key: 'resumeAd',
    value: function resumeAd() {
      var _this7 = this;

      clearTimeout(this.timeouts.resumeAd);
      this.timeouts.resumeAd = setTimeout(function () {
        _this7.diag.fire('VPAID_NONVITAL_METHOD_TIMEOUT');
        console.log('resumeAd timed out');
      }, _config2.default.vpaidCreativeMethodTimeout);
      this.adUnit.resumeAd();
    }
  }, {
    key: 'expandAd',
    value: function expandAd() {
      this.adUnit.expandAd();
    }
  }, {
    key: 'collapseAd',
    value: function collapseAd() {
      this.adUnit.collapseAd();
    }
  }, {
    key: 'skipAd',
    value: function skipAd() {
      this.adUnit.skipAd();
    }

    // getters and setters

  }, {
    key: 'getAdLinear',
    value: function getAdLinear() {
      return this.adUnit.getAdLinear();
    }
  }, {
    key: 'getAdWidth',
    value: function getAdWidth() {
      return this.adUnit.getAdWidth();
    }
  }, {
    key: 'getAdHeight',
    value: function getAdHeight() {
      return this.adUnit.getAdHeight();
    }
  }, {
    key: 'getAdExpanded',
    value: function getAdExpanded() {
      return this.adUnit.getAdExpanded();
    }
  }, {
    key: 'getAdSkippableState',
    value: function getAdSkippableState() {
      this.props.adSkippableState = this.adUnit.getAdSkippableState();
      return this.props.adSkippableState;
    }
    // Since 3rd party ad units may use a different videoslot,
    // we may observe discrepancies with remainingtime and duration

  }, {
    key: 'getAdRemainingTime',
    value: function getAdRemainingTime() {
      return this.adUnit.getAdRemainingTime();
    }
  }, {
    key: 'getAdDuration',
    value: function getAdDuration() {
      return this.adUnit.getAdDuration();
    }
  }, {
    key: 'setAdVolume',
    value: function setAdVolume(v) {
      this.adUnit.setAdVolume(v);
    }
  }, {
    key: 'getAdVolume',
    value: function getAdVolume() {
      return this.adUnit.getAdVolume();
    }

    // we don't support adCompanions and adIcons atm,
    // so I don't pass these up to Horizon

  }, {
    key: 'getAdCompanions',
    value: function getAdCompanions() {
      return this.adUnit.getAdCompanions();
    }
  }, {
    key: 'getAdIcons',
    value: function getAdIcons() {
      return this.adUnit.getAdIcons();
    }
  }]);

  return VpaidHandler;
}();

exports.default = VpaidHandler;


function acceptableVPAIDVersion(version) {
  return version && parseFloat(version) >= 2.0;
}

function implementsVPAIDSpec(adUnit) {
  return VPAIDMethods.every(function (current) {
    var method = adUnit[current];
    return method && typeof method === 'function';
  });
}

},{"./config":16}]},{},[34])(34)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25mL2Rldi5qcyIsImNvbmYvcHJvZC5qcyIsImxpYi9pbnNpZGUtdmlkZW8uanMiLCJsaWIvbW9hdC5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy9saWIvYXN5bmMuanMiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3VhLXBhcnNlci1qcy9zcmMvdWEtcGFyc2VyLmpzIiwic3JjL2FkX3BhcnNlci9hZGRfZGVmYXVsdHMuanMiLCJzcmMvYWRfcGFyc2VyL2FkZF9tZXRhZGF0YS5qcyIsInNyYy9hZF9wYXJzZXIvZmlyZV9pbml0X3BpeGVscy5qcyIsInNyYy9hZF9wYXJzZXIvaW5kZXguanMiLCJzcmMvYWRfcGFyc2VyL21hcF92YXN0X3ZwYWlkLmpzIiwic3JjL2FkX3BhcnNlci9wYXJzZV95YWhvb19hZHBhcmFtcy5qcyIsInNyYy9hZF9wYXJzZXIvcHJvY2Vzc19jbGlja190cmFja2luZy5qcyIsInNyYy9hZF9wYXJzZXIvdmFzdF9wYXJzZXIuanMiLCJzcmMvY29uZmlnLmpzIiwic3JjL2RpYWcuanMiLCJzcmMvZXZlbnQvZXZlbnRfaGFuZGxlci5qcyIsInNyYy9ldmVudC9wcm92aWRlcnMvYWRfcGFyYW1zLmpzIiwic3JjL2V2ZW50L3Byb3ZpZGVycy9kaWFnLmpzIiwic3JjL2V2ZW50L3Byb3ZpZGVycy9pbmRleC5qcyIsInNyYy9ldmVudC9wcm92aWRlcnMvaW5zaWRlLXZpZGVvLmpzIiwic3JjL2V2ZW50L3Byb3ZpZGVycy9tb2F0LmpzIiwic3JjL2V2ZW50L3Byb3ZpZGVycy9waXBfYm95LmpzIiwic3JjL21hY3Jvcy5qcyIsInNyYy9tZXRhZGF0YS5qc29uIiwic3JjL3BpcF9ib3kuanMiLCJzcmMvcHJvZ3Jlc3NfZXZlbnRzLmpzIiwic3JjL3V0aWwvY2xvY2suanMiLCJzcmMvdXRpbC9maXJlLmpzIiwic3JjL3V0aWwvcXVlcnlfcGFyYW1zLmpzIiwic3JjL3V0aWwvdXJsLmpzIiwic3JjL3V0aWwveG1sLmpzIiwic3JjL3Zpc3RhLmpzIiwic3JjL3ZwYWlkX2hhbmRsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQjtBQUNmLGNBQWE7QUFERSxDQUFqQjs7Ozs7QUNBQSxPQUFPLE9BQVAsR0FBaUI7QUFDZixjQUFhO0FBREUsQ0FBakI7Ozs7Ozs7Ozs7O0FDQUE7QUFDQSxJQUFJLE9BQXdDLElBQTVDO0FBQ0EsSUFBSSx1QkFBd0MsR0FBNUM7QUFDQSxJQUFJLHlCQUF3QyxHQUE1QztBQUNBLElBQUkseUJBQXdDLElBQTVDO0FBQ0EsSUFBSSwyQkFBd0MsRUFBNUM7QUFDQSxJQUFJLDZCQUF3QyxFQUE1QztBQUNBLElBQUksd0JBQXdDLE1BQTVDO0FBQ0EsSUFBSSwrQkFBd0MsRUFBNUM7QUFDQSxJQUFJLHlCQUF3QyxDQUE1QztBQUNBLElBQUksdUNBQXdDLElBQTVDO0FBQ0EsSUFBSSxXQUF3QywyQkFBNUM7QUFDQSxJQUFJLGdCQUF3QyxRQUE1QztBQUNBLElBQUksaUJBQXdDLFNBQTVDO0FBQ0EsSUFBSSxXQUF3QyxDQUE1QztBQUNBLElBQUksWUFBd0MsQ0FBNUM7QUFDQSxJQUFJLGVBQXdDLEVBQTVDO0FBQ0EsSUFBSSxZQUF3QyxNQUE1QztBQUNBLElBQUksWUFBd0MsTUFBNUM7QUFDQSxJQUFJLFVBQXdDLFNBQTVDO0FBQ0EsSUFBSSxPQUF3QyxNQUE1QztBQUNBLElBQUksU0FBd0MsUUFBNUM7QUFDQSxJQUFJLGdCQUF3QyxjQUE1QztBQUNBLElBQUksYUFBd0MsV0FBNUM7QUFDQSxJQUFJLFlBQXdDLFVBQTVDO0FBQ0EsSUFBSSxNQUF3QyxLQUE1QztBQUNBLElB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUNBLFdBQU8sVUFBVSxPQUFPLE1BQVAsS0FBa0IsVUFBbkM7QUFDRCxHQUhNLENBQVA7QUFJRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ2RpYWdIb3N0JyA6ICdsb2NhbGhvc3Q6NDQ0NCdcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnZGlhZ0hvc3QnIDogJ2dlby1lcnJzZXJ2LmJ0cmxsLmNvbSdcbn1cbiIsIi8qIGVzbGludC1kaXNhYmxlICovXG52YXIgTlVMTCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IG51bGw7XG52YXIgRklORV9USU1FT1VUX0RFRkFVTFQgICAgICAgICAgICAgICAgICA9IDEwMDtcbnZhciBDT0FSU0VfVElNRU9VVF9ERUZBVUxUICAgICAgICAgICAgICAgID0gNzUwO1xudmFyIElOX1ZJRVdfVElNRV9USFJFU0hPTEQgICAgICAgICAgICAgICAgPSAxMDAwO1xudmFyIFRIUkVTSE9MRF9CSUdfUEVSQ0VOVEFHRSAgICAgICAgICAgICAgPSAzMDtcbnZhciBUSFJFU0hPTERfU01BTExfUEVSQ0VOVEFHRSAgICAgICAgICAgID0gNTA7XG52YXIgQklHX0FEX1NJWkVfVEhSRVNIT0xEICAgICAgICAgICAgICAgICA9IDI0MjUwMDtcbnZhciBQRVJDRU5UX0lOX1ZJRVcxMDBfVEhSRVNIT0xEICAgICAgICAgID0gOTk7XG52YXIgTUFYX0lOVEVSU0VDVElPTl9SQVRJTyAgICAgICAgICAgICAgICA9IDE7XG52YXIgSU5URVJTRUNUSU9OX09CU0VSVkVSX1RIUkVTSE9MRF9TVEVQICA9IDAuMDU7XG52YXIgWUlNR19VUkwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFwiaHR0cHM6Ly9zLnlpbWcuY29tL3JxL2l2L1wiO1xudmFyIEhJRERFTl9TVFJJTkcgICAgICAgICAgICAgICAgICAgICAgICAgPSAnaGlkZGVuJztcbnZhciBWSVNJQkxFX1NUUklORyAgICAgICAgICAgICAgICAgICAgICAgID0gJ3Zpc2libGUnO1xudmFyIFRBR19TSVpFICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAxO1xudmFyIEdSSURfU0laRSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSA1O1xudmFyIEVNUFRZX1NUUklORyAgICAgICAgICAgICAgICAgICAgICAgICAgPSBcIlwiO1xudmFyIENPTlRST0xfQSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBcIlxceDAxXCI7XG52YXIgQ09OVFJPTF9CICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFwiXFx4MDJcIjtcbnZhciBQTFVHSU5TICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gXCJwbHVnaW5zXCI7XG52YXIgTkFNRSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFwibmFtZVwiO1xudmFyIExFTkdUSCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBcImxlbmd0aFwiO1xudmFyIFRFWFRfQkFTRUxJTkUgICAgICAgICAgICAgICAgICAgICAgICAgPSBcInRleHRCYXNlbGluZVwiO1xudmFyIEZJTExfU1RZTEUgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBcImZpbGxTdHlsZVwiO1xudmFyIEZJTExfVEVYVCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBcImZpbGxUZXh0XCI7XG52YXIgVE9QICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFwidG9wXCI7XG52YXIgT0JKRUNUICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFwib2JqZWN0XCI7XG52YXIgUEVSRk9STUFOQ0UgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFwicGVyZm9ybWFuY2VcIjtcbnZhciBHRVRfRU5UUklFU19CWV9UWVBFICAgICAgICAgICAgICAgICAgID0gXCJnZXRFbnRyaWVzQnlUeXBlXCI7XG52YXIgUkVTT1VSQ0UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFwicmVzb3VyY2VcIjtcbnZhciBGVU5DVElPTiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gXCJmdW5jdGlvblwiO1xudmFyIE1FVFJJQ1NfQkVBQ09OX0RPTUFJTiAgICAgICAgICAgICAgICAgPSBcImh0dHBzOi8vYmVhcC1iYy55YWhvby5jb20veW0/XCI7XG52YXIgR0VUX0FUVFJJQlVURSAgICAgICAgICAgICAgICAgICAgICAgICA9IFwiZ2V0QXR0cmlidXRlXCI7XG52YXIgQlVDS0VUX0lEICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFwiMTAwXCI7XG52YXIgSlNfVkVSU0lPTiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFwiMS4wLjEzMlwiO1xudmFyIElOX1ZJRVdfUEVSQ0VOVEFHRSAgICAgICAgICAgICAgICAgICAgPSBcImluVmlld1BlcmNlbnRhZ2VcIjtcbnZhciBSRVNJWkVfRVZFTlRfTkFNRSAgICAgICAgICAgICAgICAgICAgID0gXCJyZXNpemVcIjtcbnZhciBVTkxPQURfRVZFTlRfTkFNRSAgICAgICAgICAgICAgICAgICAgID0gXCJ1bmxvYWRcIjtcbnZhciBCRUZPUkVVTkxPQURfRVZFTlRfTkFNRSAgICAgICAgICAgICAgID0gXCJiZWZvcmV1bmxvYWRcIjtcbnZhciBBRF9TSVpFX1dJRFRIX1RIUkVTSE9MRCAgICAgICAgICAgICAgID0gMjA7XG52YXIgQURfU0laRV9IRUlHSFRfVEhSRVNIT0xEICAgICAgICAgICAgICA9IDIwO1xudmFyIFZJREVPX1BMQVlfRFVSQVRJT05fVEhSRVNIT0xEICAgICAgICAgPSAyMDAwO1xudmFyIEJFQVBfQVRUUl9TSVpFICAgICAgICAgICAgICAgICAgICAgICAgPSAyNTU7XG52YXIgRkxBU0hfVEFHU19MT0FEX1RJTUVPVVQgICAgICAgICAgICAgICA9IDUwMDA7XG5cbi8qZ2xvYmFsIEltYWdlKi9cbi8qZ2xvYmFsIG5hdmlnYXRvciovXG52YXIgYmVhY29uTWU7XG5cbmlmIChuYXZpZ2F0b3Iuc2VuZEJlYWNvbikge1xuICBiZWFjb25NZSA9IGZ1bmN0aW9uKHVybCwgZGF0YSkge1xuICAgIG5hdmlnYXRvci5zZW5kQmVhY29uKHVybCwgZGF0YSk7XG4gIH07XG59XG5lbHNlIHtcbiAgYmVhY29uTWUgPSBmdW5jdGlvbih1cmwsIGRhdGEpIHtcbiAgICB2YXIgaW1hZ2VUYWcgPSBuZXcgSW1hZ2UoKTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIGRhdGEgPSAnJztcbiAgICB9XG4gICAgaW1hZ2VUYWcuc3JjID0gdXJsK2RhdGE7XG4gIH07XG59XG5cbmZ1bmN0aW9uIExPRyhtZXNzYWdlLCBjaGVjaykge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSB8fCBjaGVjaykge1xuICAgIGJlYWNvbk1lKFwiaHR0cDovLyR7aG9zdH06JHtwb3J0fS9iZWFjb24tc2VydmVyL2xvZz9icm93c2VySWQ9JHticm93c2VySWR9JnNsb3RJZD0ke3Nsb3RJZH0mbWVzc2FnZT1cIiArIGVuY29kZVVSSUNvbXBvbmVudChtZXNzYWdlKSArIFwiJnQ9XCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG4gIH1cbn1cblxuLypnbG9iYWwgd2luZG93Ki9cbi8qZ2xvYmFsIGRvY3VtZW50Ki9cbmZ1bmN0aW9uIF9nZXRfcHJvcChvYmosIHByb3AsIGRlZmF1bHRWYWwpIHtcbiAgdmFyIHJldCA9IGRlZmF1bHRWYWwgfHwgXCJcIjtcbiAgdHJ5IHtcbiAgICByZXQgPSAob2JqICYmIChwcm9wIGluIG9iaikpID8gb2JqW3Byb3BdIDogcmV0O1xuICB9IGNhdGNoIChlKSB7fVxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBwYXJzZUJhc2UxMEludGVnZXIoc3RyKSB7XG4gIHJldHVybiBwYXJzZUZsb2F0KHN0ciwgMTApO1xufVxuXG5mdW5jdGlvbiBpc0ludGVnZXIgKG4pIHtcbiAgcmV0dXJuIG4gPT09ICtuICYmIG4gPT09IChufDApO1xufVxuXG4vL3dpbmRvdyBhbmQgZG9jdW1lbnQgc3BlY2lmaWMgZGF0YVxudmFyIHdpbiA9IHdpbmRvdztcbnZhciBkb2MgPSBkb2N1bWVudDtcbnZhciB3aW5TY3JlZW4gPSBfZ2V0X3Byb3Aod2luLCBcInNjcmVlblwiLCBOVUxMKTtcbnZhciBuYXYgPSBfZ2V0X3Byb3Aod2luLCBcIm5hdmlnYXRvclwiLCBOVUxMKTtcbnZhciBsb2MgPSBfZ2V0X3Byb3Aod2luLCBcImxvY2F0aW9uXCIsIE5VTEwpO1xudmFyIGxhbmcgPSBfZ2V0X3Byb3AobmF2LCBcImxhbmd1YWdlXCIsIFwiXCIpO1xudmFyIGFnZW50ID0gX2dldF9wcm9wKG5hdiwgXCJ1c2VyQWdlbnRcIiwgXCJcIik7XG52YXIgbWF0Y2ggPSBhZ2VudC5tYXRjaCgvKG9wZXJhfGNocm9tZXxzYWZhcml8ZmlyZWZveHxtc2llfHRyaWRlbnQoPz1cXC8pKVxcLz9cXHMqKFtcXGRcXC5dKykvaSk7XG52YXIgYnJvd3NlciA9IFJlZ0V4cC4kMS50b0xvd2VyQ2FzZSgpO1xudmFyIHZlcnNpb24gPSBwYXJzZUZsb2F0KGFnZW50Lm1hdGNoKC92ZXJzaW9uXFwvKFtcXGRdKykvaSkgJiYgUmVnRXhwLiQxIHx8IChtYXRjaCAmJiBtYXRjaFsyXSkgfHwgXCJcIik7XG52YXIgZGV2aWNlID0gYWdlbnQubWF0Y2goLygoaXApKGhvbmV8YWR8b2QpfHBsYXlib29rfGhwLXRhYmxldCkvaSkgJiYgUmVnRXhwLiQxLnRvTG93ZXJDYXNlKCkgfHwgJ2Rlc2t0b3AnO1xudmFyIG9zID0gYWdlbnQubWF0Y2goLyhhbmRyb2lkfGJsYWNrYmVycnl8YmIxMHxtYWNpbnRvc2h8d2Vib3N8d2luZG93cykvaSkgJiYgUmVnRXhwLiQxLnRvTG93ZXJDYXNlKCkgfHwgTlVMTDtcbnZhciBpc1dlYlZpZXcgPSBmYWxzZTtcbnZhciBpc09uZUxldmVsRG93biA9IGZhbHNlO1xudmFyIGlzSW5GcmFtZSA9IGZhbHNlO1xudmFyIGhhc1RvcEFjY2VzcyA9IGZhbHNlO1xudmFyIGlzU2FmZUZyYW1lID0gZmFsc2U7XG52YXIgc2Nyb2xsV2luZG93O1xudmFyIGJyb3dzZXJJbnQ7XG52YXIgaGlkZGVuO1xudmFyIHZpc2liaWxpdHlDaGFuZ2U7XG52YXIgaGVpZ2h0O1xudmFyIHdpZHRoO1xudmFyIGlzQmlnQWQ7XG52YXIgdGhyZXNob2xkUGVyY2VudGFnZTtcbnZhciBhZEVsZW1lbnQ7XG52YXIgYWRXcmFwcGVyRWxlbWVudDtcbnZhciBwYWdlU3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbmZ1bmN0aW9uIHNldFdpbmRvd0xldmVsSW5mbyAoKSB7XG4gIC8vaXMgb25lIGxldmVsIGRvd24gZGF0YVxuICB0cnkge1xuICAgIHZhciBwYXJXaW4gPSB3aW4ucGFyZW50LCB0b3BXaW4gPSB3aW4udG9wO1xuICAgIC8qanNoaW50IGVxZXFlcTogZmFsc2UgKi9cbiAgICBpc09uZUxldmVsRG93biA9ICEhKHRvcFdpbiAmJiBwYXJXaW4gJiYgdG9wV2luID09IHBhcldpbiAmJiB0b3BXaW4gIT0gd2luKTtcbiAgICBpc0luRnJhbWUgPSAhIShwYXJXaW4gJiYgcGFyV2luICYmIHBhcldpbiAhPSB3aW4pO1xuICAgIC8qanNoaW50IGVxZXFlcTogdHJ1ZSAqL1xuICB9IGNhdGNoIChlKSB7fVxufVxuXG5mdW5jdGlvbiBzZXRIYXNUb3BBY2Nlc3MgKCkge1xuICAvL2hhcyB0b3AgYWNjZXNzIG9yIG5vdFxuICB0cnkge1xuICAgIGhhc1RvcEFjY2VzcyA9ICEhd2luLnRvcC5kb2N1bWVudDtcbiAgfSBjYXRjaCAoZSkge31cbn1cblxuZnVuY3Rpb24gc2V0U2Nyb2xsV2luZG93ICgpIHtcbiAgc2Nyb2xsV2luZG93ID0gKGhhc1RvcEFjY2VzcyAmJiBpc09uZUxldmVsRG93bikgPyB3aW4ucGFyZW50IDogd2luO1xufVxuXG5mdW5jdGlvbiBzZXRJc1NhZmVGcmFtZSAoKSB7XG4gIGlzU2FmZUZyYW1lID0gKHdpbi4kc2YgJiYgd2luLiRzZi5leHQgJiYgdHlwZW9mIHdpbi4kc2YuZXh0W0lOX1ZJRVdfUEVSQ0VOVEFHRV0gPT09ICdmdW5jdGlvbicpIHx8IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBzZXRJc1dlYlZpZXcgKCkge1xuICB0cnkge1xuICAgICAgICAgICAgICAgIC8vb24gaXBob25lXG4gICAgaXNXZWJWaWV3ID0gLygoaVBob25lfGlQb2R8aVBhZCkuKkFwcGxlV2ViS2l0KD8hLiooU2FmYXJpfENyaU9TKSkpL2kudGVzdChhZ2VudCkgfHxcbiAgICAgICAgICAgICAgICAvL29uIGFuZHJvaWQgZm9yIGNocm9tZVxuICAgICAgICAgICAgICAgIChicm93c2VyID09PSBcImNocm9tZVwiICYmICgvd3ZcXCkuKiBDaHJvbWUuKiBNb2JpbGUvaS50ZXN0KGFnZW50KSB8fCAvVmVyc2lvblxcL1xcZCpcXC5cXGQqICg/OkNocm9tZS4qIE1vYmlsZSk/L2kudGVzdChhZ2VudCkpKSB8fFxuICAgICAgICAgICAgICAgIC8vb24gd2luZG93cyBwaG9uZVxuICAgICAgICAgICAgICAgIC8oTVNBcHBIb3N0XFwvLip8V2ViVmlldykvLnRlc3QoYWdlbnQpO1xuICB9IGNhdGNoIChlKSB7fVxufVxuXG5mdW5jdGlvbiBzZXRCcm93c2VySW50ICgpIHtcbiAgLy8gRm9yIGNvbnZlbmllbmNlLCBsZXQncyB0cmFjayB0aGUgdXNlciBhZ2VudCwgc3RvcmVkIGluIGJyb3dzZXJJbnQuXG4gIC8vIDEgPT0gQ2hyb21lXG4gIC8vIDIgPT0gRmlyZWZveFxuICAvLyAzID09IE1TSUVcbiAgLy8gNCA9PSBTYWZhcmlcbiAgLy8gNSA9PSBXZWJraXRcbiAgLy8gNiA9PSBHZWNrb1xuICAvLyA3ID09IG90aGVyXG4gIGlmIChhZ2VudC5pbmRleE9mKCdDaHJvbWUvJykgIT09IC0xKSB7XG4gICAgYnJvd3NlckludCA9IDE7XG4gIH0gZWxzZSBpZiAoYWdlbnQuaW5kZXhPZignRmlyZWZveC8nKSAhPT0gLTEpIHtcbiAgICBicm93c2VySW50ID0gMjtcbiAgfSBlbHNlIGlmICgoYWdlbnQuaW5kZXhPZignOyBNU0lFJykgIT09IC0xKSkge1xuICAgIGJyb3dzZXJJbnQgPSAzO1xuICB9IGVsc2UgaWYgKGFnZW50LmluZGV4T2YoJ1NhZmFyaS8nKSAhPT0gLTEpIHtcbiAgICBicm93c2VySW50ID0gNDtcbiAgfSBlbHNlIGlmIChhZ2VudC5pbmRleE9mKCdXZWJLaXQnKSAhPT0gLTEpIHtcbiAgICBicm93c2VySW50ID0gNTtcbiAgfSBlbHNlIGlmIChhZ2VudC5pbmRleE9mKCdHZWNrbycpICE9PSAtMSkge1xuICAgIGJyb3dzZXJJbnQgPSA2O1xuICB9IGVsc2Uge1xuICAgIGJyb3dzZXJJbnQgPSA3O1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldERvY3VtZW50VmlzaWJpbGl0eUluZm8gKCkge1xuICAvL3NldHVwUGFnZVZpc2liaWxpdHlEZXRlY3Rpb25cbiAgaWYgKHR5cGVvZiBkb2MuaGlkZGVuICE9PSAndW5kZWZpbmVkJykge1xuICAgIGhpZGRlbiA9ICdoaWRkZW4nO1xuICAgIHZpc2liaWxpdHlDaGFuZ2UgPSAndmlzaWJpbGl0eWNoYW5nZSc7XG4gIH1cbiAgLy8gZmlyZWZveCA8PSAxN1xuICBlbHNlIGlmICh0eXBlb2YgZG9jLm1vekhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBoaWRkZW4gPSAnbW96SGlkZGVuJztcbiAgICB2aXNpYmlsaXR5Q2hhbmdlID0gJ21venZpc2liaWxpdHljaGFuZ2UnO1xuICB9XG4gIC8vIGNocm9tZSA8PSB2MzIsIEFuZHJvaWQgPD0gdjQuNCwgQmxhY2tiZXJyeSB1cCB0byB2MTBcbiAgZWxzZSBpZiAodHlwZW9mIGRvYy53ZWJraXRIaWRkZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaGlkZGVuID0gJ3dlYmtpdEhpZGRlbic7XG4gICAgdmlzaWJpbGl0eUNoYW5nZSA9ICd3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlJztcbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgZG9jLm1zSGlkZGVuICE9PSAndW5kZWZpbmVkJykge1xuICAgIGhpZGRlbiA9ICdtc0hpZGRlbic7XG4gICAgdmlzaWJpbGl0eUNoYW5nZSA9ICdtc3Zpc2liaWxpdHljaGFuZ2UnO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNpemVGcm9tRWxlbWVudCAoZWxlbWVudCkge1xuICB2YXIgc2l6ZSA9IHtcbiAgICB3aWR0aCA6IDAsXG4gICAgaGVpZ2h0IDogMCxcbiAgICB2YWxpZCA6IHRydWUsXG4gIH07XG4gIHRyeSB7XG4gICAgdmFyIGNvbXB1dGVkU3R5bGUgPSAod2luLmdldENvbXB1dGVkU3R5bGUgJiYgd2luLmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCwgTlVMTCkpIHx8IGVsZW1lbnQuY3VycmVudFN0eWxlO1xuICAgIHNpemUud2lkdGggPSBwYXJzZUJhc2UxMEludGVnZXIoY29tcHV0ZWRTdHlsZS53aWR0aCkgfHwgMDtcbiAgICBzaXplLmhlaWdodCA9IHBhcnNlQmFzZTEwSW50ZWdlcihjb21wdXRlZFN0eWxlLmhlaWdodCkgfHwgMDtcbiAgfSBjYXRjaChlKSB7XG4gICAgc2l6ZS53aWR0aCA9IDA7XG4gICAgc2l6ZS5oZWlnaHQgPSAwO1xuICAgIHNpemUudmFsaWQgPSBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBzaXplO1xufVxuXG5mdW5jdGlvbiBzaXplSXNCZWxvd1RocmVzaG9sZCAoZWxlbWVudCkge1xuICB2YXIgc2l6ZSA9IGdldFNpemVGcm9tRWxlbWVudChlbGVtZW50KTtcbiAgcmV0dXJuIHNpemUud2lkdGggPD0gQURfU0laRV9XSURUSF9USFJFU0hPTEQgfHwgc2l6ZS5oZWlnaHQgPD0gQURfU0laRV9IRUlHSFRfVEhSRVNIT0xEO1xufVxuXG5mdW5jdGlvbiBzZXRBZFNpemUgKHNlcnZlcldpZHRoLCBzZXJ2ZXJIZWlnaHQpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGlzSW50ZWdlcihzZXJ2ZXJXaWR0aCkgJiYgaXNJbnRlZ2VyKHNlcnZlckhlaWdodCkpIHtcbiAgICB3aWR0aCA9IHNlcnZlcldpZHRoO1xuICAgIGhlaWdodCA9IHNlcnZlckhlaWdodDtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgX3dpZHRoLCBfaGVpZ2h0O1xuICAgIGlmIChpc0luRnJhbWUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIF93aWR0aCA9IChkb2MuZG9jdW1lbnRFbGVtZW50ICYmIE1hdGgubWF4KGRvYy5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsIGRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGgpKSB8fCAod2luLmZyYW1lRWxlbWVudCAmJiB3aW4uZnJhbWVFbGVtZW50LndpZHRoKSB8fCBOVUxMO1xuICAgICAgICBfaGVpZ2h0ID0gKGRvYy5kb2N1bWVudEVsZW1lbnQgJiYgTWF0aC5tYXgoZG9jLmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsIGRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0KSkgfHwgKHdpbi5mcmFtZUVsZW1lbnQgJiYgd2luLmZyYW1lRWxlbWVudC5oZWlnaHQpIHx8IE5VTEw7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgX3dpZHRoID0gd2luLmlubmVyV2lkdGggfHwgKGRvYy5ib2R5ICYmIGRvYy5ib2R5LmNsaWVudFdpZHRoKSB8fCBOVUxMO1xuICAgICAgICBfaGVpZ2h0ID0gd2luLmlubmVySGVpZ2h0IHx8IChkb2MuYm9keSAmJiBkb2MuYm9keS5jbGllbnRIZWlnaHQpIHx8IE5VTEw7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHNpemUgPSBnZXRTaXplRnJvbUVsZW1lbnQoYWRXcmFwcGVyRWxlbWVudCk7XG4gICAgICBfd2lkdGggPSBzaXplLndpZHRoIHx8IE5VTEw7XG4gICAgICBfaGVpZ2h0ID0gc2l6ZS5oZWlnaHQgfHwgTlVMTDtcbiAgICB9XG5cbiAgICB3aWR0aCA9IF93aWR0aDtcbiAgICBoZWlnaHQgPSBfaGVpZ2h0O1xuICB9XG5cbiAgaXNCaWdBZCA9IHdpZHRoICogaGVpZ2h0ID49IEJJR19BRF9TSVpFX1RIUkVTSE9MRDtcbiAgdGhyZXNob2xkUGVyY2VudGFnZSA9IGlzQmlnQWQgPyBUSFJFU0hPTERfQklHX1BFUkNFTlRBR0UgOiBUSFJFU0hPTERfU01BTExfUEVSQ0VOVEFHRTtcbn1cblxuLy9tb3ZlZCBvdXRzaWRlLCBhcyBpc0luRnJhbWUgaXMgdXNlZCBiZWZvcmUgc2V0dXAgaXMgY2FsbGVkXG5zZXRXaW5kb3dMZXZlbEluZm8oKTtcblxuZnVuY3Rpb24gc2V0dXAgKF9hZEVsZW1lbnQsIF9hZFdyYXBwZXJFbGVtZW50KSB7XG4gIGFkRWxlbWVudCA9IF9hZEVsZW1lbnQ7XG5cbiAgLy9pbml0aWFsaXNlIGFsbCB2YXJpYWJsZXNcbiAgc2V0SGFzVG9wQWNjZXNzKCk7XG4gIHNldFNjcm9sbFdpbmRvdygpO1xuICBzZXRJc1NhZmVGcmFtZSgpO1xuICBzZXRJc1dlYlZpZXcoKTtcbiAgc2V0QnJvd3NlckludCgpO1xuICBzZXREb2N1bWVudFZpc2liaWxpdHlJbmZvKCk7XG4gIFxuICAvL2lmIGFkIHdyYXBwZXIgZWxlbWVudCBpcyBleHBsaWNpdGx5IG1lbnRpb25lZCwgaW4gY2FzZSBvZiB2aWRlb1xuICBpZiAoX2FkV3JhcHBlckVsZW1lbnQpIHtcbiAgICBhZFdyYXBwZXJFbGVtZW50ID0gX2FkV3JhcHBlckVsZW1lbnQ7XG4gIH1cbiAgZWxzZSBpZiAoaXNJbkZyYW1lKSB7XG4gICAgaWYgKGhhc1RvcEFjY2Vzcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYWRXcmFwcGVyRWxlbWVudCA9IHdpbi5mcmFtZUVsZW1lbnQ7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgYWRXcmFwcGVyRWxlbWVudCA9IE5VTEw7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYWRXcmFwcGVyRWxlbWVudCA9IGRvYy5ib2R5IHx8IE5VTEw7XG5cbiAgICAgIGlmIChzaXplSXNCZWxvd1RocmVzaG9sZChhZFdyYXBwZXJFbGVtZW50KSkge1xuICAgICAgICB2YXIgc2VsZWN0ZWQ7XG4gICAgICAgIHZhciBkaXZzID0gYWRXcmFwcGVyRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImRpdlwiKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFzaXplSXNCZWxvd1RocmVzaG9sZChkaXZzW2ldKSkge1xuICAgICAgICAgICAgc2VsZWN0ZWQgPSBkaXZzW2ldO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzZWxlY3RlZCkge1xuICAgICAgICAgIHZhciB2aWRlb3MgPSBhZFdyYXBwZXJFbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidmlkZW9cIik7XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IHZpZGVvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKCFzaXplSXNCZWxvd1RocmVzaG9sZCh2aWRlb3NbaV0pKSB7XG4gICAgICAgICAgICAgIHNlbGVjdGVkID0gdmlkZW9zW2ldO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICBhZFdyYXBwZXJFbGVtZW50ID0gc2VsZWN0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgYWRXcmFwcGVyRWxlbWVudCA9IChhZEVsZW1lbnQgJiYgKGFkRWxlbWVudC5wYXJlbnRFbGVtZW50IHx8IGFkRWxlbWVudC5wYXJlbnROb2RlKSkgfHwgTlVMTDtcbiAgfVxuXG4gIHJldHVybiBhZEVsZW1lbnQgIT09IE5VTEwgJiYgYWRFbGVtZW50ICE9PSB1bmRlZmluZWQgJiYgYWRXcmFwcGVyRWxlbWVudCAhPT0gTlVMTCAmJiBhZFdyYXBwZXJFbGVtZW50ICE9PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGdldERvbWFpbih1cmwpIHtcbiAgdmFyIGRvbWFpbiA9IFwiXCIsXG4gICAgbTtcbiAgaWYgKHVybCAmJiB0eXBlb2YgdXJsID09PSBcInN0cmluZ1wiKSB7XG4gICAgdHJ5IHtcbiAgICAgIG0gPSB1cmwubWF0Y2goL15odHRwcz86XFwvXFwvKFstXFx3XFwuXSopKDpcXGQrKT8oW1xcL1xcPyNdfCQpLyk7XG4gICAgICBpZiAobSAmJiBtWzFdKSB7XG4gICAgICAgIGRvbWFpbiA9IG1bMV07XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZG9tYWluID0gXCJcIjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRvbWFpbjtcbn1cblxuZnVuY3Rpb24gZ2V0VGltZUZyb21TdGFydChzdGFydFRpbWUsIGVuZFRpbWUpIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoKGVuZFRpbWUgLSBzdGFydFRpbWUpIC8gMTAwMCk7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyTGlzdGVuZXIoZXZlbnRUeXBlLCBjYWxsYmFjaywgdGFyZ2V0KSB7XG4gIHRhcmdldCA9IHRhcmdldCB8fCB3aW47XG4gIGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2spO1xuICB9IGVsc2UgaWYgKHRhcmdldC5hdHRhY2hFdmVudCkge1xuICAgIHRhcmdldC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBjYWxsYmFjayk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5yZWdpc3Rlckxpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2ssIHRhcmdldCkge1xuICB0YXJnZXQgPSB0YXJnZXQgfHwgd2luO1xuICBpZiAodGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGNhbGxiYWNrKTtcbiAgfSBlbHNlIGlmICh0YXJnZXQuZGV0YWNoRXZlbnQpIHtcbiAgICB0YXJnZXQuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgY2FsbGJhY2spO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFRhZ0Nvb3JkaW5hdGVzKHdpZHRoJCQxLCBoZWlnaHQkJDEpIHtcbiAgdmFyIGksXG4gICAgaixcbiAgICB4LFxuICAgIHksXG4gICAgaWQsXG4gICAgbWF4WCA9IHdpZHRoJCQxID4gVEFHX1NJWkUgPyB3aWR0aCQkMSAtIFRBR19TSVpFIDogMCxcbiAgICBtYXhZID0gaGVpZ2h0JCQxID4gVEFHX1NJWkUgPyBoZWlnaHQkJDEgLSBUQUdfU0laRSA6IDAsXG4gICAgY29vcmRpbmF0ZXMgPSBbXSxcbiAgICBjb29yZGluYXRlTWFwID0ge307IC8vIHVzZWQgdG8gbWFrZSBzdXJlIHRoZSBlbGVtZW50cyBvZiB0aGUgYXJyYXkgYXJlIHVuaXF1ZVxuXG4gIC8vIGluaXRpYWxpemUgaSBhbmQgaiB0byAwLjUgdG8gdGFyZ2V0IHRoZSBtaWRkbGUgb2YgdGhlIHRhZydzIHJlZ2lvblxuICBmb3IgKGkgPSAwLjU7IGkgPCBHUklEX1NJWkU7IGkgKz0gMSkge1xuICAgIHggPSBNYXRoLnJvdW5kKGkgKiBtYXhYIC8gR1JJRF9TSVpFKTtcblxuICAgIGZvciAoaiA9IDAuNTsgaiA8IEdSSURfU0laRTsgaiArPSAxKSB7XG4gICAgICB5ID0gTWF0aC5yb3VuZChqICogbWF4WSAvIEdSSURfU0laRSk7XG4gICAgICBpZCA9IHggKyAnXycgKyB5O1xuXG4gICAgICBpZiAoIWNvb3JkaW5hdGVNYXBbaWRdKSB7XG4gICAgICAgIGNvb3JkaW5hdGVzLnB1c2goaWQpO1xuICAgICAgICBjb29yZGluYXRlTWFwW2lkXSA9IDE7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvb3JkaW5hdGVzO1xufVxuXG52YXIgc2Nyb2xsVGltZW91dElkO1xuXG5mdW5jdGlvbiBoYW5kbGVTY3JvbGxUaW1lb3V0KGFyY2hpdmUpIHtcbiAgdmFyIGNhbGN1bGF0ZWREZXB0aCxcbiAgICBub3dpc2ggPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICB0b3RhbFNjcm9sbFRpbWUgPSBnZXRUaW1lRnJvbVN0YXJ0KGFyY2hpdmUuc2Nyb2xsU3RhcnRUaW1lLCBub3dpc2gpLFxuICAgIG51bWJlck9mUGl4ZWxzU2Nyb2xsZWQgPSBzY3JvbGxXaW5kb3cuc2Nyb2xsWSAtIGFyY2hpdmUuc2Nyb2xsU3RhcnRZLFxuICAgIGhlaWdodFRvVXNlID0gc2Nyb2xsV2luZG93LmRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0O1xuXG4gIGlmICghaGVpZ2h0VG9Vc2UpIHtcbiAgICBoZWlnaHRUb1VzZSA9IHNjcm9sbFdpbmRvdy5kb2N1bWVudC5ib2R5LmhlaWdodDtcbiAgfVxuXG4gIC8vIHNjZCBzY3JvbGwgZGVwdGhcbiAgY2FsY3VsYXRlZERlcHRoID0gTWF0aC5yb3VuZCgoc2Nyb2xsV2luZG93LnNjcm9sbFkgLyBoZWlnaHRUb1VzZSkgKiAxMDApO1xuICBpZiAoY2FsY3VsYXRlZERlcHRoID4gYXJjaGl2ZS5zY2QpIHtcbiAgICBhcmNoaXZlLnNjZCA9IGNhbGN1bGF0ZWREZXB0aDtcbiAgfVxuXG4gIGlmIChudW1iZXJPZlBpeGVsc1Njcm9sbGVkID4gMCkge1xuICAgIGFyY2hpdmUuc2Nyb2xsZWREb3duUGl4ZWxzICs9IG51bWJlck9mUGl4ZWxzU2Nyb2xsZWQ7XG4gICAgYXJjaGl2ZS5zY3JvbGxlZERvd25UaW1lICs9IHRvdGFsU2Nyb2xsVGltZTtcbiAgfSBlbHNlIHtcbiAgICBhcmNoaXZlLnNjcm9sbGVkVXBQaXhlbHMgLT0gbnVtYmVyT2ZQaXhlbHNTY3JvbGxlZDtcbiAgICBhcmNoaXZlLnNjcm9sbGVkVXBUaW1lICs9IHRvdGFsU2Nyb2xsVGltZTtcbiAgfVxuXG4gIGFyY2hpdmUuc2Nyb2xsU3RhcnRUaW1lID0gMDtcbn1cblxuZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKGFyY2hpdmUpIHtcbiAgdmFyIG5vd2lzaCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICBhcmNoaXZlLnNjciA9IDE7XG5cbiAgaWYgKCFhcmNoaXZlLnNjdCkge1xuICAgIGFyY2hpdmUuc2N0ID0gZ2V0VGltZUZyb21TdGFydChwYWdlU3RhcnRUaW1lLCBub3dpc2gpO1xuICB9XG5cbiAgaWYgKCFhcmNoaXZlLnNjcm9sbFN0YXJ0VGltZSB8fCBhcmNoaXZlLnNjcm9sbFN0YXJ0VGltZSA9PT0gMCkge1xuICAgIGFyY2hpdmUuc2Nyb2xsU3RhcnRUaW1lID0gbm93aXNoO1xuICAgIGFyY2hpdmUuc2Nyb2xsU3RhcnRZID0gc2Nyb2xsV2luZG93LnNjcm9sbFk7XG4gIH1cblxuICBpZiAoIXNjcm9sbFRpbWVvdXRJZCkge1xuICAgIGNsZWFyVGltZW91dChzY3JvbGxUaW1lb3V0SWQpO1xuICB9XG5cbiAgc2Nyb2xsVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgIGhhbmRsZVNjcm9sbFRpbWVvdXQoYXJjaGl2ZSk7XG4gIH0sIDI1MCk7XG59XG5cbmZ1bmN0aW9uIHNldHVwJDEoYXJjaGl2ZSkge1xuICByZWdpc3Rlckxpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbigpIHtcbiAgICBoYW5kbGVTY3JvbGwoYXJjaGl2ZSk7XG4gIH0sIHNjcm9sbFdpbmRvdyk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZU1vdXNlT3ZlcihhcmNoaXZlKSB7XG4gIHZhciBub3dpc2ggPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgYXJjaGl2ZS5ob3YgPSAxO1xuICBpZiAoIWFyY2hpdmUudHRoKSB7XG4gICAgYXJjaGl2ZS50dGggPSBnZXRUaW1lRnJvbVN0YXJ0KHBhZ2VTdGFydFRpbWUsIG5vd2lzaCk7XG4gIH1cbiAgYXJjaGl2ZS5ob3ZlclN0YXJ0VGltZSA9IG5vd2lzaDtcbn1cblxuZnVuY3Rpb24gaGFuZGxlTW91c2VPdXQgKGFyY2hpdmUpIHtcbiAgdmFyIG5vd2lzaCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgIGNoZWNrSW50ZXJhY3Rpb25UaW1lID0gZ2V0VGltZUZyb21TdGFydChhcmNoaXZlLmhvdmVyU3RhcnRUaW1lLCBub3dpc2gpO1xuXG4gIGlmIChjaGVja0ludGVyYWN0aW9uVGltZSA+IDUwMCkge1xuICAgIGFyY2hpdmUuaW50dCA9IDE7XG4gICAgYXJjaGl2ZS5pbnRsID0gbm93aXNoO1xuICAgIC8vVE9ETyBjaGVjayBsb2dpY1xuICAgIGFyY2hpdmUudHRpID0gZ2V0VGltZUZyb21TdGFydChwYWdlU3RhcnRUaW1lLCBub3dpc2gpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc2V0dXAkMihhcmNoaXZlKSB7XG4gIHJlZ2lzdGVyTGlzdGVuZXIoJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xuICAgIGhhbmRsZU1vdXNlT3ZlcihhcmNoaXZlKTtcbiAgfSk7XG4gIHJlZ2lzdGVyTGlzdGVuZXIoJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG4gICAgaGFuZGxlTW91c2VPdXQoYXJjaGl2ZSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB2aXNpYmlsaXR5Q2hhbmdlZChhcmNoaXZlKSB7XG4gIHZhciBub3dpc2ggPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgLy8gaWYgZG9jdW1lbnQgaXMgY2hhbmdpbmcgZnJvbSB2aXNpYmxlIHRvIGhpZGRlblxuICAvLyBjYWxjdWxhdGUgZHdlbGwgYW5kIGFkZCBpdCB0byB0aGUgdG90YWwuXG4gIGlmIChkb2NbaGlkZGVuXSAmJiBhcmNoaXZlLmR3ZWxsU3RhcnRUaW1lID4gMCkge1xuICAgIGFyY2hpdmUuYWR0ICs9IGdldFRpbWVGcm9tU3RhcnQoYXJjaGl2ZS5kd2VsbFN0YXJ0VGltZSwgbm93aXNoKTtcbiAgfSBlbHNlIHtcbiAgICBhcmNoaXZlLmZvYyA9IDE7XG4gICAgYXJjaGl2ZS5kd2VsbFN0YXJ0VGltZSA9IG5vd2lzaDtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHNldHVwJDMoYXJjaGl2ZSkge1xuICBpZiAoIWRvY1toaWRkZW5dKSB7XG4gICAgdmlzaWJpbGl0eUNoYW5nZWQoYXJjaGl2ZSk7XG4gIH1cbiAgcmVnaXN0ZXJMaXN0ZW5lcih2aXNpYmlsaXR5Q2hhbmdlLCBmdW5jdGlvbigpIHtcbiAgICB2aXNpYmlsaXR5Q2hhbmdlZChhcmNoaXZlKTtcbiAgfSwgZG9jKTtcbn1cblxudmFyIGFyY2hpdmUgPSB7XG4gICAgdzogMCwgIC8vIHdpbmRvdy5pbm5lcldpZHRoXG4gICAgaDogMCwgLy8gd2luZG93LmlubmVySGVpZ2h0XG4gICAgbXc6IC0xLCAgICAvLyBtZWFzdXJlZCB3aWR0aFxuICAgIG1oOiAtMSwgICAgLy8gbWVhc3VyZWQgaGVpZ2h0XG4gICAgYmw6IC0xLCAgICAvLyBib3VuZGluZyBjbGllbnQgcmVjdGFuZ2xlIGxlZnRcbiAgICBidDogLTEsICAgIC8vIGJvdW5kaW5nIGNsaWVudCByZWN0YW5nbGUgdG9wXG4gICAgZXc6IC0xLCAgICAvLyBmcmFtZSB3aWR0aFxuICAgIGVoOiAtMSwgICAgLy8gZnJhbWUgaGVpZ2h0XG4gICAgZXg6IC0xLCAgICAvLyBibCArIHBhcmVudEJvZHkuc2Nyb2xsTGVmdFxuICAgIGV5OiAtMSwgICAgLy8gYnQgKyBwYXJlbnRCb2R5LnNjcm9sbFRvcFxuICAgIHZ3OiAtMSwgICAgLy8gdmlld3BvcnRXaWR0aFxuICAgIHZoOiAtMSwgICAgLy8gdmlld3BvcnRIZWlnaHRcbiAgICBzeDogLTEsICAgIC8vIHNjcm9sbFhcbiAgICBzeTogLTEsICAgIC8vIHNjcm9sbFlcbiAgICBpdnA6IC0xLCAgIC8vIGluVmlld1BlcmNlbnRhZ2VcbiAgICBpdmQ6IC0xLCAgIC8vIGluLXZpZXcgZHVyYXRpb25cbiAgICBwdDogLTEsICAgIC8vIHBhZ2UtdGltZVxuICAgIG1pOiAtMSwgICAgLy8gbWF4aW11bSBpblZpZXdQZXJjZW50YWdlXG4gICAgYjogLTEsICAgICAvLyBicm93c2VyXG4gICAgZ20wOiAwLCAgIC8vIDEwMCUgaW52aWV3IDBzXG4gICAgZ20xOiAwLCAgIC8vIDEwMCUgaW52aWV3IDFzXG4gICAgbTogLTEsICAgICAvLyBtZXRob2RcbiAgICB0aXZ0OiAwLCAgIC8vIHRvdGFsIGluIHZpZXcgdGltZVxuICAgIGhvdjogMiwgICAgLy8gZGlkIHRoZSB1c2VyIGhvdmVyIG92ZXIgdGhlIGFkP1xuICAgIHR0aDogMCwgICAgLy8gaG93IGxvbmcgYWZ0ZXIgcGFnZSBsb2FkIGJlZm9yZSB0aGUgdXNlciBob3ZlcmVkXG4gICAgaW50dDogMiwgICAgLy8gZGlkIHRoZSB1c2VyIGludGVyYWN0IHdpdGggdGhlIHBhZ2U/XG4gICAgaW50bDogMCwgICAgLy8gaG93IGxvbmcgZGlkIHRoZSB1c2VyIGludGVyYWN0XG4gICAgdHRpOiAwLCAgICAvLyBob3cgbG9uZyBhZnRlciBwYWdlIGxvYWQgYmVmb3JlIHRoZSB1c2VyIGludGVyYWN0ZWRcbiAgICBzdDogMCwgICAgLy8gdGhlIHRvdGFsIGFtb3VudCBvZiB0aW1lIHNwZW50IG9uIHRoZSBwYWdlIGluIHNlY29uZHNcbiAgICBmb2M6IDIsICAgIC8vIGRpZCB0aGUgcGFnZSBoYXZlIGZvY3VzIGF0IGFueSB0aW1lP1xuICAgIGFkdDogMCwgICAgLy8gdG90YWwgYW1vdW50IG9mIHRpbWUgc3BlbnQgb24gdGhlIHBhZ2Ugd2hpbGUgaW4gZm9jdXNcbiAgICBzY3I6IDIsICAgIC8vIGRpZCB0aGUgdXNlciBzY3JvbGw/XG4gICAgc2NkOiAwLCAgICAvLyBzY3JvbGwgZGVwdGhcbiAgICBzdmQ6IDAsICAgIC8vIGhvdyBmYXN0IChweC9zZWNvbmQpIGRpZCB0aGV5IHNjcm9sbCBkb3duXG4gICAgc3Z1OiAwLCAgICAvLyBob3cgZmFzdCAocHgvc2Vjb25kKSBkaWQgdGhleSBzY3JvbGwgdXBcbiAgICBzY3Q6IDAsICAgIC8vIGhvdyBsb25nIGFmdGVyIHBhZ2UgbG9hZCBkaWQgdGhleSBmaXJzdCBzY3JvbGxcbiAgICBtaXZwOiAwLCAgICAvLyBtYXhpbXVtIGluIHZpZXcgcGVyY2VudGFnZVxuICAgIG1pdnQ6IDAsICAgIC8vIG1heGltdW0gaW4gdmlldyB0aW1lXG4gICAgbHM6IDAsICAgIC8vIGxvYWQgc291cmNlLCBkaWQgdGhlIGFkIGxvYWQgaW4gYSB3aW5kb3csIGRpdiwgb3IgaUZyYW1lXG4gICAgd2lubDogJycsICAgIC8vIHRoZSB2YWx1ZSBvZiB3aW5kb3cubG9jYXRpb25cbiAgICB3aW5yOiAnJywgICAgLy8gdGhlIHZhbHVlIG9mIGRvY3VtZW50LnJlZmVycmVyXG4gICAgbHZsOiAwLCAgICAvLyBob3cgbWFueSB3aW5kb3dzIGRvd24gYXJlIHdlP1xuICAgIGFsOiAzLCAgICAvLyBkaWQgdGhlIGFkIGxvYWQgYXMgZmFyIGFzIHdlIGNhbiB0ZWxsP1xuICAgIGFlOiAwLCAgICAvLyBhZCBlcnJvcnNcbiAgICBiY3Q6IDIsICAgIC8vIGJlYWNvbiB0eXBlIGlzIGluc2lkZS5qc1xuICAgIHBoOiAtMSwgICAvLyBwYWdlIGhlaWdodFxuICAgIGR3ZWxsU3RhcnRUaW1lOiAwLCAgICAvLyB1c2VkIHRvIGNhbGN1bGF0ZSBhZHRcbiAgICBzY3JvbGxlZFVwUGl4ZWxzOiAwLFxuICAgIHNjcm9sbGVkVXBUaW1lOiAwLFxuICAgIHNjcm9sbGVkRG93blBpeGVsczogMCxcbiAgICBzY3JvbGxlZERvd25UaW1lOiAwLFxuICAgIGF2b2MgOiAwLCAvL2F1ZGlvIHZpZGVvIG9uIGNvbXBsZXRlXG4gICAgYXZvY19kZWJ1ZyA6IDAsXG4gIH07XG5cbi8qIFRyYWNrZXJzICovXG5mdW5jdGlvbiByZWdpc3RlckVycm9yTGlzdGVuZXIoKSB7XG4gIHZhciBvbGRFcnJvckhhbmRsZXI7XG5cbiAgb2xkRXJyb3JIYW5kbGVyID0gd2luLm9uZXJyb3I7XG4gIHdpbi5vbmVycm9yID0gZnVuY3Rpb24gKGVycm9yTXNnLCBlcnJvclVSTCwgbGluZU51bWJlciwgY29sdW1uTnVtYmVyLCBlcnJvck9iamVjdCkge1xuICAgIGFyY2hpdmUuYWUgKz0gMTtcbiAgICBpZiAob2xkRXJyb3JIYW5kbGVyKSB7XG4gICAgICByZXR1cm4gb2xkRXJyb3JIYW5kbGVyKGVycm9yTXNnLCBlcnJvclVSTCwgbGluZU51bWJlciwgY29sdW1uTnVtYmVyLCBlcnJvck9iamVjdCk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2V0dXBUcmFja2VycygpIHtcbiAgaWYgKGlzSW5GcmFtZSkge1xuICAgIC8vIHdlJ3JlIGluIGFuIGlGcmFtZSwgZWFzeSB0byB0cmFjayBtb3VzZSBtb3Zlc1xuICAgIHNldHVwJDIoYXJjaGl2ZSk7XG4gIH1cbiAgc2V0dXAkMyhhcmNoaXZlKTtcbiAgaWYgKCFpc0luRnJhbWUgfHwgKGhhc1RvcEFjY2VzcyAmJiBpc09uZUxldmVsRG93bikpIHtcbiAgICAvLyB3ZSBjYW4gYWNjZXNzIHRoZSBwYXJlbnQsIHRyYWNrIHNjcm9sbGluZy5cbiAgICBzZXR1cCQxKGFyY2hpdmUpO1xuICB9XG4gIHJlZ2lzdGVyRXJyb3JMaXN0ZW5lcigpO1xufVxuXG5mdW5jdGlvbiBhZElzSW5JZnJhbWUoKSB7XG4gIC8vaWYgaW5zaWRlLmpzIGlzIG5vdCBpbiBpZnJhbWUgdGhlcmUgd2lsbCB0b28gbXVjaCBub2lzZSBmcm9tIHBhcmVudCBwYWdlIHRvIGRldGVjdCB0aGlzXG4gIGlmIChpc0luRnJhbWUpIHtcbiAgICB2YXIgaWZyYW1lcyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcImlmcmFtZVwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlmcmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vY2hlY2sgZm9yIHNpemUuIHRoZXJlIG1pZ2h0IGJlIG90aGVyIGlmcmFtZSB3aGljaCBhcmUgdG9vIHNtYWxsIG9yIGhpZGRlblxuICAgICAgaWYgKCFzaXplSXNCZWxvd1RocmVzaG9sZChpZnJhbWVzW2ldKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vdHJ5IHRvIGFjY2VzcyBpbm5lciBkb2N1bWVudFxuICAgICAgICAgIHZhciBjb250ZW50RG9jdW1lbnQgPSBpZnJhbWVzW2ldLmNvbnRlbnREb2N1bWVudCA/IGlmcmFtZXNbaV0uY29udGVudERvY3VtZW50IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaWZyYW1lc1tpXS5jb250ZW50V2luZG93ID8gaWZyYW1lc1tpXS5jb250ZW50V2luZG93LmRvY3VtZW50IDogaWZyYW1lc1tpXS5kb2N1bWVudCk7XG4gICAgICAgICAgLy90cnkgdG8gcXVlcnlcbiAgICAgICAgICBjb250ZW50RG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJkaXZcIik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgIC8vY3Jvc3MgZG9tYWluIGlmcmFtZSB3aXRoIGNvbnNpZGVyYWJsZSBzaXplLiBtaWdodCBiZSBhZFxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29tbW9uQWRkaXRpb25hbERhdGEobWV0aG9kSW5zdGFuY2UpIHtcbiAgLy8gdGhyZXNob2xkIHBlcmNlbnRhZ2U6IDIgPSAzMCUgdGhyZXNob2xkLCAxID0gNTAlIHRocmVzaG9sZFxuICB2YXIgYWRkaXRpb25hbERhdGEgPSBcInRwPVwiICsgKGlzQmlnQWQgPyAnMicgOiAnMScpO1xuICAvLyBtZWFzdXJlbWVudCB0eXBlXG4gIC8vIDEgPT0gU2FmZUZyYW1lIG1lYXN1cmVkIHZpZXdhYmlsaXR5XG4gIC8vIDIgPT0gWC1Eb21haW4gaUZyYW1lIHdpdGggc2NyaXB0IGFjY2Vzc1xuICAvLyAzID09IEZpcmVmb3ggbW96UGFpbnRDb3VudCBiYXNlZFxuICAvLyA0ID09IEZsYXNoIGFwcHJvYWNoXG4gIC8vIDUgPT0gTm90IE1lYXN1cmFibGVcbiAgLy8gNiA9PSBObyBpRnJhbWUsIGl0IHdhcyBtZWFzdXJlZCBkaXJlY3RseVxuICAvLyA3ID09IE1lYXN1cmVkIHVzaW5nIEludGVyc2VjdGlvbk9ic2VydmVyIGFwaVxuICAvLyA4ID09IE1lYXN1cmVkIHVzaW5nIG1yYWlkIGFwaVxuICBhZGRpdGlvbmFsRGF0YSArPSBcIjptdD1cIiArIG1ldGhvZEluc3RhbmNlLm1lYXN1cmVtZW50QnVja2V0O1xuICBhZGRpdGlvbmFsRGF0YSArPSBcIjppd3c9XCIgKyAoaXNXZWJWaWV3ID8gJzInIDogJzEnKTtcbiAgYWRkaXRpb25hbERhdGEgKz0gXCI6YWlmPVwiICsgKGFkSXNJbklmcmFtZSgpID8gJzEnIDogJzAnKTtcbiAgYWRkaXRpb25hbERhdGEgKz0gXCI6aWlmPVwiICsgKGlzSW5GcmFtZSA/ICcxJyA6ICcwJyk7XG4gIGFkZGl0aW9uYWxEYXRhICs9IFwiOmZucz1cIiArIG1ldGhvZEluc3RhbmNlLmZsYXNoTm90U3VwcG9ydGVkO1xuICByZXR1cm4gYWRkaXRpb25hbERhdGE7XG59XG5cbnZhciBnZW5lcmF0ZUd1aWQgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBkZWZhdWx0UHJlZml4ID0gXCIkeWluc2lkZUlWXCIsXG4gICAgbmV4dElEID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSAtIF9ndWlkX3JhbmQoMTAwMDAwKSxcbiAgICBuZXh0SURJbmNyZW1lbnQgPSBfZ3VpZF9yYW5kKDEwMCk7XG5cblxuICBmdW5jdGlvbiBfZ3VpZF9yYW5kKGV4cCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoMTAgKiBleHApKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9nZW5lcmF0ZV9ndWlkKHNQcmVmaXgpIHtcbiAgICB2YXIgcmV0ID0gbmV4dElEO1xuXG4gICAgbmV4dElEICs9IG5leHRJREluY3JlbWVudDtcbiAgICBuZXh0SURJbmNyZW1lbnQgPSBfZ3VpZF9yYW5kKDEwMCk7XG5cbiAgICB0cnkge1xuICAgICAgc1ByZWZpeCA9IHNQcmVmaXggJiYgU3RyaW5nKHNQcmVmaXgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNQcmVmaXggPSBcIlwiO1xuICAgIH1cblxuICAgIHNQcmVmaXggPSBzUHJlZml4IHx8IGRlZmF1bHRQcmVmaXg7XG5cbiAgICByZXQgPSBzUHJlZml4ICsgXCJfXCIgKyByZXQ7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgcmV0dXJuIF9nZW5lcmF0ZV9ndWlkO1xufSkoKTtcblxuZnVuY3Rpb24gcmVwbGFjZU9yQXBwZW5kUGFyYW0gKGJlYWNvbiwgcGxhY2Vob2xkZXIsIHBhcmFtLCB2YWx1ZSkge1xuICByZXR1cm4gYmVhY29uLmluZGV4T2YocGxhY2Vob2xkZXIpID4gLTEgPyBiZWFjb24ucmVwbGFjZShwbGFjZWhvbGRlciwgdmFsdWUpIDogYmVhY29uICsgXCImXCIgKyBwYXJhbSArIFwiPVwiICsgdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGZpcmVWaWV3YWJsZUJlYWNvbiAoYmVhY29uLCBtZWFzdXJlbWVudFR5cGUsIGlzVmlld2VkLCBpc01lYXN1cmFibGUsIG1ldGhvZEluc3RhbmNlLCBhZGRpdGlvbmFsVmlld2FibGVEYXRhLCBhZGRpdGlvbmFsRGF0YSkge1xuICB2YXIgdGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgaWYgKGJlYWNvbikge1xuICAgIHRyeSB7XG4gICAgICBiZWFjb24gPSBiZWFjb24ucmVwbGFjZSgnJUluVmlld1BlcmNlbnRhZ2UlJywgbWV0aG9kSW5zdGFuY2UuZ2V0QXZlcmFnZUluVmlld1BlcmNlbnRhZ2UoKSk7XG4gICAgICBiZWFjb24gPSBiZWFjb24ucmVwbGFjZSgne3BjdHZpZXd9JywgbWV0aG9kSW5zdGFuY2UuZ2V0QXZlcmFnZUluVmlld1BlcmNlbnRhZ2UoKSk7XG4gICAgICAvLyBwYXNzaW5nIHZhbHVlIG9mIDEgZm9yIHRydWUgKGl0IGlzIGluIHZpZXcpLCAyIGZvciBmYWxzZSwgaXQgaXMgbm90IGluIHZpZXcgKG9ubHkgZmlyZWQgZm9yIG5vdCBtZWFzdXJhYmxlKS5cbiAgICAgIGJlYWNvbiA9IGJlYWNvbi5yZXBsYWNlKCclVmlld2FibGUlJywgKGlzVmlld2VkID8gJzEnIDogJzInKSk7XG4gICAgICBiZWFjb24gPSBiZWFjb24ucmVwbGFjZSgne2luaXR2aWV3fScsIChpc1ZpZXdlZCA/ICcxJyA6ICcyJykpO1xuICAgICAgYmVhY29uID0gcmVwbGFjZU9yQXBwZW5kUGFyYW0oYmVhY29uLCAnJU1lYXN1cmFibGUlJywgJ2ltJywgKGlzTWVhc3VyYWJsZSA/ICcxJyA6ICcyJykpO1xuXG4gICAgICBiZWFjb24gPSBiZWFjb24ucmVwbGFjZSgnJU1lYXN1cmVtZW50VHlwZSUnLCBtZWFzdXJlbWVudFR5cGUpO1xuICAgICAgYmVhY29uID0gcmVwbGFjZU9yQXBwZW5kUGFyYW0oYmVhY29uLCAnJVRpbWVzdGFtcCUnLCAncicsIHRpbWVzdGFtcCk7XG4gICAgICBiZWFjb24gPSByZXBsYWNlT3JBcHBlbmRQYXJhbShiZWFjb24sICclQnVja2V0SWQlJywgJ2InLCBCVUNLRVRfSUQpO1xuICAgICAgYmVhY29uID0gcmVwbGFjZU9yQXBwZW5kUGFyYW0oYmVhY29uLCAnJUFkZGl0aW9uYWxEYXRhJScsICdhZCcsIFwianY9XCIgKyBKU19WRVJTSU9OICsgKGFkZGl0aW9uYWxEYXRhICYmIGFkZGl0aW9uYWxEYXRhICE9PSBcIlwiID8gXCI6XCIgKyBhZGRpdGlvbmFsRGF0YSA6IFwiXCIpICsgXCI6XCIgKyBnZXRDb21tb25BZGRpdGlvbmFsRGF0YShtZXRob2RJbnN0YW5jZSkpO1xuXG4gICAgICBpZiAoYWRkaXRpb25hbFZpZXdhYmxlRGF0YSkge1xuICAgICAgICBiZWFjb24gKz0gXCImXCIgKyBhZGRpdGlvbmFsVmlld2FibGVEYXRhO1xuICAgICAgfVxuICAgICAgYmVhY29uTWUoYmVhY29uKTtcbiAgICB9IGNhdGNoIChleCkgeyB9XG4gIH1cbn1cblxuLypcbiAqIE1ENSBjb21wb25lbnRcbiAqXG4gKiBPcmlnaW5hbCBKYXZhU2NyaXB0IGNvZGUgYmFzZSBjb3VydGVzeSBvZjpcbiAqIEF1dGhvcjpcbiAqIEpvc2VwaCBNeWVyc1xuICogIGh0dHA6Ly93d3cubXllcnNkYWlseS5vcmcvam9zZXBoL1xuICpcbiAqIE9yaWdpbmFsIENvZGUgRm91bmQgQXQ6XG4gKiAgIGh0dHA6Ly93d3cubXllcnNkYWlseS5vcmcvam9zZXBoL2phdmFzY3JpcHQvbWQ1LmpzXG4gKiAgIFdpdGggTm90ZXM6XG4gKiAgICBodHRwOi8vd3d3Lm15ZXJzZGFpbHkub3JnL2pvc2VwaC9qYXZhc2NyaXB0L21kNS1zcGVlZC10ZXN0Lmh0bWxcbiAqICAgIGh0dHA6Ly93d3cubXllcnNkYWlseS5vcmcvam9zZXBoL2phdmFzY3JpcHQvbWQ1LXRleHQuaHRtbFxuICogQ2lyY2EgMjAxMFxuICpcbiAqIFVwZGF0ZXMgLyBFZGl0czpcbiAqIFNlYW4gU25pZGVyXG4gKiBZYWhvbyEgMjAxNiAtIGN1cnJlbnRcbiAqXG4gKiBDaGFuZ2VzOlxuICpcbiAqIC0tIFVwZGF0ZWQgY29kaW5nIHN0eWxlIC8gaW5kZW50YXRpb24gLyB3aGl0ZS1zcGFjZSB0byBtYWtlIHRoZSBzb3VyY2UgY29kZVxuICogICAgbW9yZSByZWFkYWJsZVxuICpcbiAqIC0tIEFkZGVkIHdyYXBwZXIgXCJtb2R1bGVcIiBwYXR0ZXJuLCB3aXRoIG1vcmUgc3ludGF4IHN1Z2FyIHRvIGNvbWVcbiAqICAgIGxhdGVyLCBmb3Igbm93IGl0J3MganVzdCBleHBlY3RlZCB0byBydW4gaW4gYSB3ZWItYnJvd3NlclxuICogICAgd2l0aCBubyBvdGhlciBkZXBlbmRhbmNpZXMgYW5kIHNpbXBseSBvdXRwdXRzIGEgc2luZ2xlXG4gKiAgICBnbG9iYWwgZnVuY3Rpb24gY2FsbGVkIFwibWQ1XCIgdG8gdGhlIHdpbmRvdyBvYmplY3RcbiAqXG4gKiAtLSBVcGRhdGVkIHRoZSBsb29wcyBpbiB0aGUgZm9sbG93aW5nIHN1Yi1yb3V0aW5lcyB0byBiZSBzbGlnaHRseVxuICogICAgIG1vcmUgb3B0aW1pemVkIGJ5IHNldHRpbmcgbG9jYWwgdmFyaWFibGVzIGZvciB0aGUgbGVuZ3RoXG4gKiAgICBvZiB0aGUgc3RyaW5nIHJhdGhlciB0aGFuIGNvbnN0YW50bHkgcmVjaGVja2luZyB0aGUgLmxlbmd0aCBwcm9wZXJ0eTpcbiAqICAgICBtZDUxXG4gKiAgICAgaGV4XG4gKlxuICogLS0gQ3JlYXRlZCBsb2NhbC9pbm5lciBzdWItcm91dGluZXMgZm9yIHRoZSBmb2xsb3dpbmcgU3RyaW5nIHByb3RvdHlwZVxuICogICAgbWV0aG9kcyB3aGljaCBhZ2FpbiBzbGlnaGx5IGluY3JlYXNlcyBydW4tdGltZSBwZXJmb3JtYW5jZSBhbmQgYWxzb1xuICogICAgIGFsbG93cyB0aGUgY29kZSBtaW5pZmljYXRpb24gdG8gYmUgYSBiaXQgc21hbGxlcjpcbiAqXG4gKiAgIFN0cmluZ19jaGFyQ29kZUF0ID4+IFN0cmluZy5wcm90b3R5cGUuc3Vic3RyaW5nXG4gKiAgICBTdHJpbmdfbHN1YiA+PiBTdHJpbmcucHJvdG90eXBlLnN1YnN0cmluZyB3aXRoIG9ubHkgMiBhcmd1bWVudHMsIHRoZSBzdHJpbmcgYW5kIHN0YXJ0IG9mZnNldCwgZW5kIGlzIGFzc3VtZWRcbiAqICAgU3RyaW5nX3N1YiA+PiBTdHJpbmcucHJvdG90eXBlLnN1YnN0cmluZyB3aXRoIDMgYXJndW1lbnRzLCBzdHJpbmcsIHN0YXJ0IGFuZCBlbmQgb2Zmc2V0c1xuICpcbiAqICAgIFdlIGNhbiBwb3RlbnRpYWxseSByZXBsYWNlIHRoZXNlIGxhdGVyIGlmIHNhaWQgY29kZVxuICogICAgIGlzIHBhcnQgb2YgbGFyZ2VyIGZyYW1ld29ya1xuICpcbiAqIC0tIENoYW5nZWQgdGhlIG1kNWJsayBmdW5jdGlvbiB0byB1c2UgQXJyYXkucHJvdG90eXBlLnB1c2ggKGkuZS4gdGhlIGFycmF5L3N0cmluZyBidWZmZXIgYXBwcm9hY2gpXG4gKiAgICBmb3Igc3RyaW5nIGNvbmNhdGVudGF0aW9uIHJhdGhlciB0aGFuIHVzaW5nICsgb3BlcmF0b3Igd2hpY2ggaGFzIHBvb3IgcGVyZm9ybWFuY2VcbiAqICAgIGluIG1hbnkgb2xkZXIgYnJvd3NlcnMgYW5kIGV2ZW4gaW4gbmV3ZXIgYnJvd3NlcnMgaXMgYWx3YXlzIGVxdWFsIG9yIHNsaWdobHR5XG4gKiAgICAgZmFzdGVyIChzaW5jZSB0aGUgaW5oZXJpdCBhbWJpZ3VpdHkgb2YgYW4gb3BlcmF0b3IgbWFrZXMgaXQgbW9yZSBkaWZmaWN1bHQgdG9cbiAqICAgIHRvIG9wdGltaXplIGVmZmVjdGl2ZWx5KS5cbiAqXG4gKiAtLSBDaGFuZ2VkIHRoZSByaGV4IGlubmVyIGZ1bmN0aW9uL3N1Yi1yb3V0aW5lIHRvIG5vIGxvbmdlciB1c2UgYSBsb29wIGFzIHRoYXQnc1xuICogICAgbm90IG5lY2Vzc2FyeSBzaW5jZSB0aGUgaW5wdXQgYW5kIGNhbGNsdWF0aW9ucyBuZWVkZWQgYXJlIHF1aXRlIHN0YXRpYyxcbiAqICAgIGFuZCB1cGRhdGVkIGl0IHRvIHVzZSBhbiBhcnJheSBqb2luIHJhdGhlciB0aGFuIHN0cmluZyBjb25jYXRzXG4gKlxuICogLS0gQWRkZWQgXCJjb25zdGFudHNcIiAod2VsbCByZWFsbHkganVzdCBsb2NhbCB2YXJzIHRvIHRoZSBtb2R1bGUgc2luY2UsIG5vdFxuICogICAgYWxsIEpTIGVuZ2luZXMgYWN0dWFsbHkgYWxsb3cgdHJ1ZSBjb25zdGFudHMpLCBtb3N0IGFsbCBtYWdpYyBudW1iZXJzXG4gKiAgICAgdGhhdCBhcmUgPj0gMiBjaGFyYWN0ZXJzL3JldXNlZCBtdWx0aXBsZSB0aW1lcywgd2hpY2ggYWdhaW5cbiAqICAgICBzbGlnaHRseSBpbXByb3ZlcyBydW4tdGltZSBhbmQgY29tcHJlc3Npb24gcGVyZm9ybWFuY2UuXG4gKlxuICogICAgdGhlc2UgY29uc3RhbnRzIChsaWtlIG1hbnkgb3RoZXJzKSBjb3VsZCBhbHNvIGJlIGFkZGVkIGFzIHBhcnRcbiAqICAgICBvZiBzb21lIGZyYW1ld29yay5cbiAqXG4gKi9cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbnZhciBIRVhfQ0hBUl9MSVNUID0gJzAxMjM0NTY3ODlhYmNkZWYnLnNwbGl0KCcnKTtcbnZhciBIRVhfVU5TSUdORURfSU5UID0gMHhGRkZGRkZGRjtcbnZhciBNRDVfT0sgPSAwO1xudmFyIE1ENV9FUlJfTVNHID0gXCJNRDUgbW9kdWxlIGlzIGJyb2tlblwiO1xudmFyIE1ENV9URVNUX0lOUFVUID0gJ2hlbGxvJztcbnZhciBNRDVfVEVTVF9FWFBFQ1RfT1VUUFVUID0gJzVkNDE0MDJhYmM0YjJhNzZiOTcxOWQ5MTEwMTdjNTkyJztcbnZhciBNRDVfVkVSQk9TRV9NT0RFID0gMDtcbnZhciBQUk9UTyA9IFwicHJvdG90eXBlXCI7XG52YXIgU3RyaW5nUHJvdG9fc3Vic3RyaW5nID0gU3RyaW5nW1BST1RPXS5zdWJzdHJpbmc7XG52YXIgTlVNXzEwID0gMTA7XG52YXIgTlVNXzExID0gMTE7XG52YXIgTlVNXzEyID0gMTI7XG52YXIgTlVNXzEzID0gMTM7XG52YXIgTlVNXzE0ID0gMTQ7XG52YXIgTlVNXzE1ID0gMTU7XG52YXIgTlVNXzE2ID0gMTY7XG52YXIgTlVNXzE3ID0gMTc7XG52YXIgTlVNXzIwID0gMjA7XG52YXIgTlVNXzIxID0gMjE7XG52YXIgTlVNXzIyID0gMjI7XG52YXIgTlVNXzIzID0gMjM7XG52YXIgTlVNXzI0ID0gMjQ7XG52YXIgTlVNXzMyID0gMzI7XG52YXIgTlVNXzY0ID0gNjQ7XG52YXIgYWRkMzIgPSBfYWRkMzI7XG52YXIgQllURVNfNjQgPSA2NTUzNTtcbnZhciBCSVRTXzEyOCA9IDEyODtcbnZhciBCSVRTXzE1ID0gTlVNXzE1OyAvLyAweDBGXG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBTdHJpbmdfY2hhckNvZGVBdChzLCBpKSB7XG4gIC8vQXNzdW1lcyAxc3QgYXJndW1lbnQgaXMgYSBzdHJpbmcsIGFuZCAybmQgYXJndW1lbnQgaXMgYSBudW1iZXIvaW50ZWdlciB3aXRoIG5vIHR5cGUgY2hlY2tpbmdcbiAgcmV0dXJuIHMuY2hhckNvZGVBdChpKTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIFN0cmluZ19sc3ViKHMsIHN0YXJ0KSB7XG4gIC8vQXNzdW1lcyAxc3QgYXJndW1lbnQgaXMgYSBzdHJpbmcsXG4gIC8vYW5kIDJuZCBhcmd1bWVudCBpcyBhIG51bWJlci9pbnRlZ2VyXG4gIC8vd2l0aCBubyB0eXBlIGNoZWNraW5nXG5cbiAgcmV0dXJuIFN0cmluZ1Byb3RvX3N1YnN0cmluZy5jYWxsKHMsIHN0YXJ0KTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIFN0cmluZ19zdWIocywgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gU3RyaW5nUHJvdG9fc3Vic3RyaW5nLmNhbGwocywgc3RhcnQsIGVuZCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBtZDVjeWNsZSh4LCBrKSB7XG4gIHZhciBhID0geFswXSxcbiAgICBiID0geFsxXSxcbiAgICBjID0geFsyXSxcbiAgICBkID0geFszXTtcblxuICBhID0gZmYoYSwgYiwgYywgZCwga1swXSwgNywgLTY4MDg3NjkzNik7XG4gIGQgPSBmZihkLCBhLCBiLCBjLCBrWzFdLCBOVU1fMTIsIC0zODk1NjQ1ODYpO1xuICBjID0gZmYoYywgZCwgYSwgYiwga1syXSwgTlVNXzE3LCA2MDYxMDU4MTkpO1xuICBiID0gZmYoYiwgYywgZCwgYSwga1szXSwgTlVNXzIyLCAtMTA0NDUyNTMzMCk7XG4gIGEgPSBmZihhLCBiLCBjLCBkLCBrWzRdLCA3LCAtMTc2NDE4ODk3KTtcbiAgZCA9IGZmKGQsIGEsIGIsIGMsIGtbNV0sIE5VTV8xMiwgMTIwMDA4MDQyNik7XG4gIGMgPSBmZihjLCBkLCBhLCBiLCBrWzZdLCBOVU1fMTcsIC0xNDczMjMxMzQxKTtcbiAgYiA9IGZmKGIsIGMsIGQsIGEsIGtbN10sIE5VTV8yMiwgLTQ1NzA1OTgzKTtcbiAgYSA9IGZmKGEsIGIsIGMsIGQsIGtbOF0sIDcsIDE3NzAwMzU0MTYpO1xuICBkID0gZmYoZCwgYSwgYiwgYywga1s5XSwgTlVNXzEyLCAtMTk1ODQxNDQxNyk7XG4gIGMgPSBmZihjLCBkLCBhLCBiLCBrW05VTV8xMF0sIE5VTV8xNywgLTQyMDYzKTtcbiAgYiA9IGZmKGIsIGMsIGQsIGEsIGtbTlVNXzExXSwgTlVNXzIyLCAtMTk5MDQwNDE2Mik7XG4gIGEgPSBmZihhLCBiLCBjLCBkLCBrW05VTV8xMl0sIDcsIDE4MDQ2MDM2ODIpO1xuICBkID0gZmYoZCwgYSwgYiwgYywga1tOVU1fMTNdLCBOVU1fMTIsIC00MDM0MTEwMSk7XG4gIGMgPSBmZihjLCBkLCBhLCBiLCBrW05VTV8xNF0sIE5VTV8xNywgLTE1MDIwMDIyOTApO1xuICBiID0gZmYoYiwgYywgZCwgYSwga1tOVU1fMTVdLCBOVU1fMjIsIDEyMzY1MzUzMjkpO1xuXG4gIGEgPSBnZyhhLCBiLCBjLCBkLCBrWzFdLCA1LCAtMTY1Nzk2NTEwKTtcbiAgZCA9IGdnKGQsIGEsIGIsIGMsIGtbNl0sIDksIC0xMDY5NTAxNjMyKTtcbiAgYyA9IGdnKGMsIGQsIGEsIGIsIGtbTlVNXzExXSwgTlVNXzE0LCA2NDM3MTc3MTMpO1xuICBiID0gZ2coYiwgYywgZCwgYSwga1swXSwgTlVNXzIwLCAtMzczODk3MzAyKTtcbiAgYSA9IGdnKGEsIGIsIGMsIGQsIGtbNV0sIDUsIC03MDE1NTg2OTEpO1xuICBkID0gZ2coZCwgYSwgYiwgYywga1tOVU1fMTBdLCA5LCAzODAxNjA4Myk7XG4gIGMgPSBnZyhjLCBkLCBhLCBiLCBrW05VTV8xNV0sIE5VTV8xNCwgLTY2MDQ3ODMzNSk7XG4gIGIgPSBnZyhiLCBjLCBkLCBhLCBrWzRdLCBOVU1fMjAsIC00MDU1Mzc4NDgpO1xuICBhID0gZ2coYSwgYiwgYywgZCwga1s5XSwgNSwgNTY4NDQ2NDM4KTtcbiAgZCA9IGdnKGQsIGEsIGIsIGMsIGtbTlVNXzE0XSwgOSwgLTEwMTk4MDM2OTApO1xuICBjID0gZ2coYywgZCwgYSwgYiwga1szXSwgTlVNXzE0LCAtMTg3MzYzOTYxKTtcbiAgYiA9IGdnKGIsIGMsIGQsIGEsIGtbOF0sIE5VTV8yMCwgMTE2MzUzMTUwMSk7XG4gIGEgPSBnZyhhLCBiLCBjLCBkLCBrW05VTV8xM10sIDUsIC0xNDQ0NjgxNDY3KTtcbiAgZCA9IGdnKGQsIGEsIGIsIGMsIGtbMl0sIDksIC01MTQwMzc4NCk7XG4gIGMgPSBnZyhjLCBkLCBhLCBiLCBrWzddLCBOVU1fMTQsIDE3MzUzMjg0NzMpO1xuICBiID0gZ2coYiwgYywgZCwgYSwga1tOVU1fMTJdLCBOVU1fMjAsIC0xOTI2NjA3NzM0KTtcblxuICBhID0gaGgoYSwgYiwgYywgZCwga1s1XSwgNCwgLTM3ODU1OCk7XG4gIGQgPSBoaChkLCBhLCBiLCBjLCBrWzhdLCBOVU1fMTEsIC0yMDIyNTc0NDYzKTtcbiAgYyA9IGhoKGMsIGQsIGEsIGIsIGtbTlVNXzExXSwgTlVNXzE2LCAxODM5MDMwNTYyKTtcbiAgYiA9IGhoKGIsIGMsIGQsIGEsIGtbTlVNXzE0XSwgTlVNXzIzLCAtMzUzMDk1NTYpO1xuICBhID0gaGgoYSwgYiwgYywgZCwga1sxXSwgNCwgLTE1MzA5OTIwNjApO1xuICBkID0gaGgoZCwgYSwgYiwgYywga1s0XSwgTlVNXzExLCAxMjcyODkzMzUzKTtcbiAgYyA9IGhoKGMsIGQsIGEsIGIsIGtbN10sIE5VTV8xNiwgLTE1NTQ5NzYzMik7XG4gIGIgPSBoaChiLCBjLCBkLCBhLCBrW05VTV8xMF0sIE5VTV8yMywgLTEwOTQ3MzA2NDApO1xuICBhID0gaGgoYSwgYiwgYywgZCwga1tOVU1fMTNdLCA0LCA2ODEyNzkxNzQpO1xuICBkID0gaGgoZCwgYSwgYiwgYywga1swXSwgTlVNXzExLCAtMzU4NTM3MjIyKTtcbiAgYyA9IGhoKGMsIGQsIGEsIGIsIGtbM10sIE5VTV8xNiwgLTcyMjUyMTk3OSk7XG4gIGIgPSBoaChiLCBjLCBkLCBhLCBrWzZdLCBOVU1fMjMsIDc2MDI5MTg5KTtcbiAgYSA9IGhoKGEsIGIsIGMsIGQsIGtbOV0sIDQsIC02NDAzNjQ0ODcpO1xuICBkID0gaGgoZCwgYSwgYiwgYywga1tOVU1fMTJdLCBOVU1fMTEsIC00MjE4MTU4MzUpO1xuICBjID0gaGgoYywgZCwgYSwgYiwga1tOVU1fMTVdLCBOVU1fMTYsIDUzMDc0MjUyMCk7XG4gIGIgPSBoaChiLCBjLCBkLCBhLCBrWzJdLCBOVU1fMjMsIC05OTUzMzg2NTEpO1xuXG4gIGEgPSBpaShhLCBiLCBjLCBkLCBrWzBdLCA2LCAtMTk4NjMwODQ0KTtcbiAgZCA9IGlpKGQsIGEsIGIsIGMsIGtbN10sIE5VTV8xMCwgMTEyNjg5MTQxNSk7XG4gIGMgPSBpaShjLCBkLCBhLCBiLCBrW05VTV8xNF0sIE5VTV8xNSwgLTE0MTYzNTQ5MDUpO1xuICBiID0gaWkoYiwgYywgZCwgYSwga1s1XSwgTlVNXzIxLCAtNTc0MzQwNTUpO1xuICBhID0gaWkoYSwgYiwgYywgZCwga1tOVU1fMTJdLCA2LCAxNzAwNDg1NTcxKTtcbiAgZCA9IGlpKGQsIGEsIGIsIGMsIGtbM10sIE5VTV8xMCwgLTE4OTQ5ODY2MDYpO1xuICBjID0gaWkoYywgZCwgYSwgYiwga1tOVU1fMTBdLCBOVU1fMTUsIC0xMDUxNTIzKTtcbiAgYiA9IGlpKGIsIGMsIGQsIGEsIGtbMV0sIE5VTV8yMSwgLTIwNTQ5MjI3OTkpO1xuICBhID0gaWkoYSwgYiwgYywgZCwga1s4XSwgNiwgMTg3MzMxMzM1OSk7XG4gIGQgPSBpaShkLCBhLCBiLCBjLCBrW05VTV8xNV0sIE5VTV8xMCwgLTMwNjExNzQ0KTtcbiAgYyA9IGlpKGMsIGQsIGEsIGIsIGtbNl0sIE5VTV8xNSwgLTE1NjAxOTgzODApO1xuICBiID0gaWkoYiwgYywgZCwgYSwga1tOVU1fMTNdLCBOVU1fMjEsIDEzMDkxNTE2NDkpO1xuICBhID0gaWkoYSwgYiwgYywgZCwga1s0XSwgNiwgLTE0NTUyMzA3MCk7XG4gIGQgPSBpaShkLCBhLCBiLCBjLCBrW05VTV8xMV0sIE5VTV8xMCwgLTExMjAyMTAzNzkpO1xuICBjID0gaWkoYywgZCwgYSwgYiwga1syXSwgTlVNXzE1LCA3MTg3ODcyNTkpO1xuICBiID0gaWkoYiwgYywgZCwgYSwga1s5XSwgTlVNXzIxLCAtMzQzNDg1NTUxKTtcblxuICB4WzBdID0gYWRkMzIoYSwgeFswXSk7XG4gIHhbMV0gPSBhZGQzMihiLCB4WzFdKTtcbiAgeFsyXSA9IGFkZDMyKGMsIHhbMl0pO1xuICB4WzNdID0gYWRkMzIoZCwgeFszXSk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBjbW4ocSwgYSwgYiwgeCwgcywgdCkge1xuICBhID0gYWRkMzIoYWRkMzIoYSwgcSksIGFkZDMyKHgsIHQpKTtcbiAgcmV0dXJuIGFkZDMyKChhIDw8IHMpIHwgKGEgPj4+IChOVU1fMzIgLSBzKSksIGIpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gZmYoYSwgYiwgYywgZCwgeCwgcywgdCkge1xuICByZXR1cm4gY21uKChiICYgYykgfCAoKH5iKSAmIGQpLCBhLCBiLCB4LCBzLCB0KTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIGdnKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcbiAgcmV0dXJuIGNtbigoYiAmIGQpIHwgKGMgJiAofmQpKSwgYSwgYiwgeCwgcywgdCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBoaChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gIHJldHVybiBjbW4oYiBeIGMgXiBkLCBhLCBiLCB4LCBzLCB0KTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIGlpKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcbiAgcmV0dXJuIGNtbihjIF4gKGIgfCAofmQpKSwgYSwgYiwgeCwgcywgdCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBtZDUxKHMpIHtcbiAgdmFyIG4gPSBzLmxlbmd0aCxcbiAgICBzdGF0ZSA9IFsxNzMyNTg0MTkzLCAtMjcxNzMzODc5LCAtMTczMjU4NDE5NCwgMjcxNzMzODc4XSxcbiAgICB0YWlsID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgIGkgPSBOVU1fNjQ7XG5cbiAgZm9yICg7IGkgPD0gbjsgaSArPSBOVU1fNjQpIHtcbiAgICBtZDVjeWNsZShzdGF0ZSwgbWQ1YmxrKFN0cmluZ19zdWIocywgaSAtIE5VTV82NCwgaSkpKTtcbiAgICBpICs9IE5VTV82NDtcbiAgfVxuXG4gIHMgPSBTdHJpbmdfbHN1YihzLCBpIC0gTlVNXzY0KTtcbiAgZm9yIChpID0gMCwgbiA9IHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgdGFpbFtpID4+IDJdIHw9IFN0cmluZ19jaGFyQ29kZUF0KHMsIGkpIDw8ICgoaSAlIDQpIDw8IDMpO1xuICB9XG5cbiAgdGFpbFtpID4+IDJdIHw9IEJJVFNfMTI4IDw8ICgoaSAlIDQpIDw8IDMpO1xuXG4gIGlmIChpID4gNTUpIHtcbiAgICBtZDVjeWNsZShzdGF0ZSwgdGFpbCk7XG4gICAgZm9yIChpID0gMDsgaSA8IE5VTV8xNjsgaSsrKSB7XG4gICAgICB0YWlsW2ldID0gMDtcbiAgICB9XG4gIH1cblxuICB0YWlsW05VTV8xNF0gPSBuICogODtcbiAgbWQ1Y3ljbGUoc3RhdGUsIHRhaWwpO1xuICByZXR1cm4gc3RhdGU7XG59XG5cbi8qXG4gKiBvcmlnaW5hbCBzb3VyY2UgY29tbWVudDpcbiAqXG4gKiB0aGVyZSBuZWVkcyB0byBiZSBzdXBwb3J0IGZvciBVbmljb2RlIGhlcmUsXG4gKiB1bmxlc3Mgd2UgcHJldGVuZCB0aGF0IHdlIGNhbiByZWRlZmluZSB0aGUgTUQtNVxuICogYWxnb3JpdGhtIGZvciBtdWx0aS1ieXRlIGNoYXJhY3RlcnMgKHBlcmhhcHNcbiAqIGJ5IGFkZGluZyBldmVyeSBmb3VyIDE2LWJpdCBjaGFyYWN0ZXJzIGFuZFxuICogc2hvcnRlbmluZyB0aGUgc3VtIHRvIDMyIGJpdHMpLiBPdGhlcndpc2VcbiAqIEkgc3VnZ2VzdCBwZXJmb3JtaW5nIE1ELTUgYXMgaWYgZXZlcnkgY2hhcmFjdGVyXG4gKiB3YXMgdHdvIGJ5dGVzLS1lLmcuLCAwMDQwIDAwMjUgPSBAJS0tYnV0IHRoZW5cbiAqIGhvdyB3aWxsIGFuIG9yZGluYXJ5IE1ELTUgc3VtIGJlIG1hdGNoZWQ/XG4gKiBUaGVyZSBpcyBubyB3YXkgdG8gc3RhbmRhcmRpemUgdGV4dCB0byBzb21ldGhpbmdcbiAqIGxpa2UgVVRGLTggYmVmb3JlIHRyYW5zZm9ybWF0aW9uOyBzcGVlZCBjb3N0IGlzXG4gKiB1dHRlcmx5IHByb2hpYml0aXZlLiBUaGUgSmF2YVNjcmlwdCBzdGFuZGFyZFxuICogaXRzZWxmIG5lZWRzIHRvIGxvb2sgYXQgdGhpczogaXQgc2hvdWxkIHN0YXJ0XG4gKiBwcm92aWRpbmcgYWNjZXNzIHRvIHN0cmluZ3MgYXMgcHJlZm9ybWVkIFVURi04XG4gKiA4LWJpdCB1bnNpZ25lZCB2YWx1ZSBhcnJheXMuXG4gKlxuICogdXBkYXRlIGZyb20gU2VhbiBTbmlkZXI6XG4gKlxuICogd2VsbCB0aGF0J3MgZmluYWxseSBzdGFydGluZyB0byBleGlzdFxuICogbm93IGluIDIwMTQgYW5kIGJleW9uZCBidXQgbm9uZXRoZWxlc3MgaXQnc1xuICogbm90IGFsd2F5cyBhdmFpbGFibGUgc28gbWFraW5nIHRoZSBibG9ja3NcbiAqIHRoaXMgd2F5IGlzIHByb2JhYmx5IGp1c3QgYXMgZ29vZFxuICpcbiAqXG4gKi9cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBtZDVibGsocykge1xuXG4gIC8qXG4gICAqIG9yaWdpbmFsIHNvdXJjZS9hdXRob3IgY29tbWVudDpcbiAgICpcbiAgICogSSBmaWd1cmVkIGdsb2JhbCB3YXMgZmFzdGVyLlxuICAgKiBBbmR5IEtpbmcgc2FpZCBkbyBpdCB0aGlzIHdheS5cbiAgICovXG5cbiAgdmFyIG1kNWJsa3MgPSBbXSxcbiAgICBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBOVU1fNjQ7IGkgKz0gNCkge1xuICAgIG1kNWJsa3NbaSA+PiAyXSA9IFN0cmluZ19jaGFyQ29kZUF0KHMsIGkpICsgKFN0cmluZ19jaGFyQ29kZUF0KHMsIGkgKyAxKSA8PCA4KSArIChTdHJpbmdfY2hhckNvZGVBdChzLCBpICsgMikgPDwgTlVNXzE2KSArIChTdHJpbmdfY2hhckNvZGVBdChzLCBpICsgMykgPDwgTlVNXzI0KTtcbiAgfVxuICByZXR1cm4gbWQ1Ymxrcztcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIHJoZXgobikge1xuICAvKlxuICAgKiB1cGRhdGUgZnJvbSBTZWFuIFNuaWRlcjpcbiAgICpcbiAgICogb3JpZ2luYWxseSAoY29tbWV0ZWQgb3V0IGJlbG93KSwgdGhpcyB3b3VsZCBsb29wIDQgaXRlcmF0aW9uc1xuICAgKiBidXQgdGhlIGxvb3AgaXMgbm90IHJlYWxseSBuZWVkZWQgc2luY2Ugd2UgaGF2ZSBhIGZpeGVkIG51bWJlciBvZiBpdGVyYXRpb25zXG4gICAqIGl0J3MgZmFzdGVyIHRvIGp1c3QgZG8gdGhlIDQgY2FsY3VsYXRpb25zIG91cnNlbHZlcyBpbmxpbmUgdmlhIGFuIGFycmF5L2J1ZmZlciBjb21ib1xuICAgKlxuICAgKiBpdCdzIGEgYml0IG1vcmUgdmVyYm9zZSBidXQgbm90IGVub3VnaCB0byBiZSBjb25jZXJuZWQgYWJvdXQgYW5kIHNpbmNlIHJoZXhcbiAgICogd2lsbCBiZSBjYWxsZWQgdmlhIG90aGVyIGxvb3BzLCBpdCdzIGJldHRlciB0byBhdm9pZCB0aGUgbG9vcFxuICAgKi9cblxuICByZXR1cm4gKFtcblxuICAgIEhFWF9DSEFSX0xJU1RbKG4gPj4gNCkgJiBCSVRTXzE1XSwgSEVYX0NIQVJfTElTVFsobiA+PiAwKSAmIEJJVFNfMTVdLFxuICAgIEhFWF9DSEFSX0xJU1RbKG4gPj4gTlVNXzEyKSAmIEJJVFNfMTVdLCBIRVhfQ0hBUl9MSVNUWyhuID4+IDgpICYgQklUU18xNV0sXG4gICAgSEVYX0NIQVJfTElTVFsobiA+PiBOVU1fMjApICYgQklUU18xNV0sIEhFWF9DSEFSX0xJU1RbKG4gPj4gTlVNXzE2KSAmIEJJVFNfMTVdLFxuICAgIEhFWF9DSEFSX0xJU1RbKG4gPj4gKE5VTV8yNCArIDQpKSAmIEJJVFNfMTVdLCBIRVhfQ0hBUl9MSVNUWyhuID4+IE5VTV8yNCkgJiBCSVRTXzE1XVxuICBdKS5qb2luKCcnKTtcblxuXG4gIC8qXG4gICAqIHVwZGF0ZSBmcm9tIFNlYW4gU25pZGVyXG4gICAqIG9yaWdpbmFsIGltcGxlbWVudGF0aW9uIG5vIGxvbmdlciB1c2VkXG4gICAqIHRoZSBvcmlnaW5hbCBkb2VzIGFuIHVnbHkgc3RyaW5nIGNvbmNhdCB3aXRoICs9IGFuZCArIG9wZXJhdG9yc1xuICAgKiBhbmQgYWxzbyB1c2VzIGEgZm9yIGxvb3AuIGJ1dCBhcyBub3RlZCBhYm92ZSwgdGhlIGxvb3AgaXMgcmVhbGx5XG4gICAqIG5vdCBuZWNlc3Nhcnkgc2luY2Ugd2Ugb25seSBoYXZlIDQgbGluZXMvaXRlcmF0aW9ucyBhbmQgOCB0b3RhbCBwYXJ0c1xuICAgKiB0aGF0IG5lZWQgdG8gYmUgYnVpbHQuIC4gLmV2ZXJ5dGhpbmcgZWxzZSBpcyBhbHJlYWR5IGEgY29uc3RhbnQuIC5cbiAgICogdGhlIG9ubHkgdGhpbmcgdGhlIGxvb3AgYmVsb3cgaXMgcmVhbGx5IGRvaW5nIGlzIHVzaW5nIHRoZSAnaicgaW5kZXhcbiAgICogbnVtYmVyIHRvIGNvbXB1dGUgYml0cyB0byBiZSBzaGlmdGVkIHdoaWNoIGlzIHVuZWNlc3Nhcnkgc2luY2UgdGhhdCdzXG4gICAqIGVmZmVjdGl2ZWx5IGEgc3RhdGljIHZhbHVlXG4gICAqXG4gICAqXG4gICAqICBmdW5jdGlvbiByaGV4KG4pXG4gICAqICB7XG4gICAqICAgIHZhciBzPScnLCBqPTA7XG4gICAqICAgIGZvcig7IGo8NDsgaisrKVxuICAgKiAgICB7XG4gICAqICAgICAgcyArPSBoZXhfY2hyWyhuID4+IChqICogOCArIDQpKSAmIDB4MEZdICsgaGV4X2NoclsobiA+PiAoaiAqIDgpKSAmIDB4MEZdO1xuICAgKiAgICB9XG4gICAqICAgIHJldHVybiBzO1xuICAgKiAgfVxuICAgKi9cbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIGhleCh4KSB7XG4gIHZhciBpID0gMCxcbiAgICBsID0geC5sZW5ndGg7XG5cbiAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICB4W2ldID0gcmhleCh4W2ldKTtcbiAgfVxuICByZXR1cm4geC5qb2luKCcnKTtcbn1cblxuLypcbiAqIG9yaWdpbmFsIGNvbW1lbnQgZnJvbSBhdXRob3I6XG4gKlxuICogdGhpcyBmdW5jdGlvbiBpcyBtdWNoIGZhc3RlcixcbiAqIHNvIGlmIHBvc3NpYmxlIHdlIHVzZSBpdC4gU29tZSBJRXNcbiAqIGFyZSB0aGUgb25seSBvbmVzIEkga25vdyBvZiB0aGF0XG4gKiBuZWVkIHRoZSBpZGlvdGljIHNlY29uZCBmdW5jdGlvbixcbiAqIGdlbmVyYXRlZCBieSBhbiBpZiBjbGF1c2UuXG4gKlxuICpcbiAqIHVwZGF0ZSBmcm9tIFNlYW4gU25pZGVyOlxuICpcbiAqIFdlbGwgdGhlICQyMEsgcXVlc3Rpb24gaXMgV0hZIGlzIHRoZSAybmRcbiAqIGZ1bmN0aW9uIG5lZWRlZCBpbiBzb21lIElFIGJyb3dzZXJzP1xuICogTXkgZ3Vlc3MgaXMgdGhhdCBwZXJoYXBzIHRoZSBtYXggdmFsdWVcbiAqIGZvciBudW1iZXJzIGluIHRoZSBKUyBlbmdpbmUgaXMgYSBwcm9ibGVtXG4gKiBzbyB5b3UgY2FuJ3QgdXNlIHRoZSBjb25zdGFudD9cbiAqXG4gKiBJbnRlcnN0aW5nIHRob3VnaCBiL2MgSSB0ZXN0ZWQgaW4gPj0gSUU4XG4gKiBhbmQgbmV2ZXIgc2F3IHRoZSBwcm9ibGVtLiAuXG4gKlxuICpcbiAqL1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gX2FkZDMyKGEsIGIpIHtcbiAgcmV0dXJuIChhICsgYikgJiBIRVhfVU5TSUdORURfSU5UO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gYWx0QWRkMzIoeCwgeSkge1xuICB2YXIgbHN3ID0gKHggJiBCWVRFU182NCkgKyAoeSAmIEJZVEVTXzY0KSxcbiAgICBtc3cgPSAoeCA+PiBOVU1fMTYpICsgKHkgPj4gTlVNXzE2KSArIChsc3cgPj4gTlVNXzE2KTtcblxuICByZXR1cm4gKG1zdyA8PCBOVU1fMTYpIHwgKGxzdyAmIEJZVEVTXzY0KTtcbn1cblxuLypcbiAqIGluIHRoZSBleHRyZW1lbHkgcmFyZSBjYXNlIHdoZXJlIHRoZSBsaWJyYXJ5XG4gKiBmYWlscyAod2hpY2ggc2hvdWxkIGJlIG5ldmVyKSwgd2Ugc2ltcGx5XG4gKiBleHBvcnQgYSBmdW5jdGlvbiB0byB0aHJvdyBhbiBlcnJvciBpZiBpblxuICogdmVyYm9zZSBtb2RlIG9yIHJldHVybiBhbiBlbXB0eSBzdHJpbmcgaW4gcXVpZXRcbiAqIG1vZGVcbiAqL1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gbWQ1X3Rocm93KHMpIHtcbiAgaWYgKE1ENV9WRVJCT1NFX01PREUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoTUQ1X0VSUl9NU0cpO1xuICB9XG4gIHJldHVybiBcIlwiO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gbWQ1X3N5c3RlbUNoZWNrKCkge1xuICByZXR1cm4gKCRtZDUoTUQ1X1RFU1RfSU5QVVQpID09PSBNRDVfVEVTVF9FWFBFQ1RfT1VUUFVUKTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uICRtZDUocykge1xuICByZXR1cm4gaGV4KG1kNTEocykpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuaWYgKCFtZDVfc3lzdGVtQ2hlY2soKSkge1xuICBhZGQzMiA9IGFsdEFkZDMyO1xuXG4gIGlmICghbWQ1X3N5c3RlbUNoZWNrKCkpIHtcbiAgICBNRDVfT0sgPSAwO1xuICB9IGVsc2Uge1xuICAgIE1ENV9PSyA9IDE7XG4gIH1cbn0gZWxzZSB7XG4gIE1ENV9PSyA9IDE7XG59XG5cbnZhciBfbWQ1ID0gKChNRDVfT0spID8gJG1kNSA6IG1kNV90aHJvdyk7XG5cbnZhciBfZW5jb2RlVVJJQ29tcG9uZW50ID0gZW5jb2RlVVJJQ29tcG9uZW50O1xuXG5mdW5jdGlvbiBnZXRBZFdlaWdodCgpIHtcbiAgdmFyIHBlcmZvcm1hbmNlQXBpLFxuICAgIGFkV2VpZ2h0ID0gMCxcbiAgICBpID0gMCxcbiAgICB0cmFuc2ZlclNpemUgPSAwLFxuICAgIHJlc291cmNlcyA9IFtdLFxuICAgIHJlc291cmNlLFxuICAgIG5hbWUsXG4gICAgZmlsZVJlZ2V4ID0gLyhyXFwtKC4qKVxcLmh0bWwpfChzZiguKj8pXFwuanMpL2dpO1xuXG4gIHRyeSB7XG4gICAgcGVyZm9ybWFuY2VBcGkgPSB3aW5bUEVSRk9STUFOQ0VdO1xuICAgIGlmIChwZXJmb3JtYW5jZUFwaSAmJiB0eXBlb2YgcGVyZm9ybWFuY2VBcGlbR0VUX0VOVFJJRVNfQllfVFlQRV0gPT09IEZVTkNUSU9OKSB7XG4gICAgICByZXNvdXJjZXMgPSBwZXJmb3JtYW5jZUFwaVtHRVRfRU5UUklFU19CWV9UWVBFXShSRVNPVVJDRSk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmVzb3VyY2VzID0gW107XG4gIH1cblxuICB3aGlsZSAoKHJlc291cmNlID0gcmVzb3VyY2VzW2krK10pKSB7XG4gICAgdHJ5IHtcbiAgICAgIG5hbWUgPSByZXNvdXJjZS5uYW1lO1xuICAgICAgdHJhbnNmZXJTaXplID0gcmVzb3VyY2UudHJhbnNmZXJTaXplO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG5hbWUgPSBFTVBUWV9TVFJJTkc7XG4gICAgICB0cmFuc2ZlclNpemUgPSAwO1xuICAgIH1cblxuICAgIGlmICh0cmFuc2ZlclNpemUgJiYgdHJhbnNmZXJTaXplID4gMCAmJiBuYW1lICYmIG5hbWUuc2VhcmNoKGZpbGVSZWdleCkgPT09IC0xKSB7XG4gICAgICBhZFdlaWdodCArPSB0cmFuc2ZlclNpemU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFkV2VpZ2h0O1xufVxuXG5mdW5jdGlvbiBnZXRDYW52YXNJbWFnZSgpIHtcbiAgdmFyXG4gICAgZGF0YVVybCwgZGF0YUl0ZW1zLCBjYW52YXNUZXh0LCBjYW52YXMsIHRleHQgPSBcInlqXCI7XG5cbiAgdHJ5IHtcbiAgICBjYW52YXMgPSBkb2MuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgfSBjYXRjaCAoZSkge31cblxuICBpZiAoIWNhbnZhcyB8fCAhY2FudmFzLmdldENvbnRleHQpIHtcbiAgICByZXR1cm4gX21kNShFTVBUWV9TVFJJTkcpO1xuICB9XG5cbiAgY2FudmFzLnN0eWxlLmJvcmRlciA9IFwiMXB4IHNvbGlkIGJsYWNrXCI7XG4gIGNhbnZhcy53aWR0aCA9IDE2O1xuICBjYW52YXMuaGVpZ2h0ID0gMjI7XG4gIGNhbnZhc1RleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICBjYW52YXNUZXh0W1RFWFRfQkFTRUxJTkVdID0gVE9QO1xuICBjYW52YXNUZXh0LmZvbnQgPSBcIjE1cHggJ0FyaWFsJ1wiO1xuICBjYW52YXNUZXh0W1RFWFRfQkFTRUxJTkVdID0gXCJhbHBoYWJldGljXCI7XG4gIGNhbnZhc1RleHRbRklMTF9TVFlMRV0gPSBcIiNmZmFcIjtcbiAgY2FudmFzVGV4dC5maWxsUmVjdCgxLCAxLCAxNSwgMjApO1xuICBjYW52YXNUZXh0W0ZJTExfU1RZTEVdID0gXCIjMDBhXCI7XG4gIGNhbnZhc1RleHRbRklMTF9URVhUXSh0ZXh0LCAyLCAxNSk7XG4gIGNhbnZhc1RleHRbRklMTF9TVFlMRV0gPSBcInJnYmEoMTAwLCAxMDAsIDEwMCwgMC43KVwiO1xuICBjYW52YXNUZXh0W0ZJTExfVEVYVF0odGV4dCwgNCwgMTcpO1xuXG4gIGRhdGFVcmwgPSBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICBkYXRhSXRlbXMgPSBkYXRhVXJsLnNwbGl0KFwiLFwiKTtcbiAgcmV0dXJuIF9tZDUoZGF0YUl0ZW1zW0xFTkdUSF0gPT09IDIgPyBkYXRhSXRlbXNbMV0gOiBkYXRhVXJsKTtcbn1cblxuZnVuY3Rpb24gZ2V0QW5jZXN0b3JPcmlnaW5zKGFyY2hpdmUkJDEpIHtcbiAgdmFyIG9yaWdpblN0cmluZyA9IFwiXCIsXG4gICAgYW9MZW5ndGgsXG4gICAgYW5jZXN0b3JPcmlnaW5zO1xuXG4gIHRyeSB7XG4gICAgYW5jZXN0b3JPcmlnaW5zID0gbG9jICYmIGxvYy5hbmNlc3Rvck9yaWdpbnM7XG4gICAgaWYgKGFuY2VzdG9yT3JpZ2lucykge1xuICAgICAgYW9MZW5ndGggPSBhbmNlc3Rvck9yaWdpbnMubGVuZ3RoO1xuICAgICAgaWYgKGFvTGVuZ3RoKSB7XG4gICAgICAgIC8vbG9nIGp1c3QgdGhlIHJvb3QgdXJsIGFzIHRoaXMgaXMgYWxsIHRoYXRzIG5lZWQgaW4gdGVybXMgb2YgYWN1dGFsIHVybCBieSBJTFMgdG8gZW5zdXJlIHN1cHBseSBxdWFsaXR5XG4gICAgICAgIG9yaWdpblN0cmluZyA9IGdldERvbWFpbihhbmNlc3Rvck9yaWdpbnNbYW9MZW5ndGggLSAxXSk7XG5cbiAgICAgICAgLy9hcHBlbmQgYW5jZXN0b3JzIGZyb20gYm90dG9tIHVwdG8gc2l6ZSBhdmFpbGFibGUgYnkgYmVhcFxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbmV4dERvbWFpbiA9IGdldERvbWFpbihhbmNlc3Rvck9yaWdpbnNbMF0pO1xuICAgICAgICAgICAgIGkgPCBhb0xlbmd0aCAtIDEgJiYgb3JpZ2luU3RyaW5nLmxlbmd0aCArIChpID09PSAwID8gQ09OVFJPTF9CIDogQ09OVFJPTF9BKS5sZW5ndGggKyBuZXh0RG9tYWluLmxlbmd0aCA8PSBCRUFQX0FUVFJfU0laRTtcbiAgICAgICAgICAgICBpKyssIG5leHREb21haW4gPSBnZXREb21haW4oYW5jZXN0b3JPcmlnaW5zW2ldKSkge1xuICAgICAgICAgIG9yaWdpblN0cmluZyArPSAoaSA9PT0gMCA/IENPTlRST0xfQiA6IENPTlRST0xfQSkgKyBuZXh0RG9tYWluO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL3N1cHBseSBxdWFsaXR5IG5cbiAgICAgIGFyY2hpdmUkJDEuc2FvID0gYW9MZW5ndGggfHwgMDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy90ZW1wb3JhcmlseSB1c2VkIHRvIGRlbm90ZSB0aGF0IGFuY2VzdG9yT3JpZ2lucyBpcyBub3Qgc3VwcG9ydGVkXG4gICAgICBhcmNoaXZlJCQxLnNhbyA9IC0xO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIG9yaWdpblN0cmluZyA9IFwiXCI7XG4gICAgYXJjaGl2ZSQkMS5zYW8gPSAtMTtcbiAgfVxuXG4gIHJldHVybiBvcmlnaW5TdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGdldFBsdWdpbnNTdHJpbmcgKCkge1xuICB2YXJcbiAgICBpLCBsZW4sXG4gICAgcmVzdWx0ID0gRU1QVFlfU1RSSU5HO1xuXG4gIHRyeSB7XG4gICAgbGVuID0gbmF2W1BMVUdJTlNdW0xFTkdUSF07XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAocmVzdWx0ICE9PSBFTVBUWV9TVFJJTkcpIHtcbiAgICAgICAgcmVzdWx0ICs9IENPTlRST0xfQTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCArPSBuYXZbUExVR0lOU11baV1bTkFNRV07XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmVzdWx0ID0gRU1QVFlfU1RSSU5HO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZ2V0SGFzaGVkUGx1Z2luc1N0cmluZygpIHtcbiAgdmFyIHJldCA9IEVNUFRZX1NUUklORztcblxuICB0cnkge1xuICAgIHJldCA9IGJyb3dzZXJJbnQgPT09IDMgfHwgYnJvd3NlciA9PT0gXCJtc2llXCIgfHwgYnJvd3NlciA9PT0gXCJ0cmlkZW50XCIgPyBnZXRJZVBsdWdpbnNTdHJpbmcoKSA6IGdldFBsdWdpbnNTdHJpbmcoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldCA9IEVNUFRZX1NUUklORztcbiAgfVxuICByZXR1cm4gX21kNShyZXQpO1xufVxuXG5mdW5jdGlvbiBjaGVja0FjdGl2ZVgobmFtZSkge1xuICB2YXIgcmV0ID0gXCJcIixcbiAgICBwbHVnaW47XG5cbiAgdHJ5IHtcbiAgICBwbHVnaW4gPSBuYXZbUExVR0lOU11bbmFtZV07XG4gICAgaWYgKHBsdWdpbikge1xuICAgICAgcmV0ID0gcGx1Z2luLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ldyB3aW4uQWN0aXZlWE9iamVjdChuYW1lKTtcbiAgICAgIHJldCA9IG5hbWU7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0ID0gRU1QVFlfU1RSSU5HO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gZ2V0SWVQbHVnaW5zU3RyaW5nKCkge1xuICB2YXIgaSxcbiAgICByZXN1bHQgPSBcIlwiLFxuICAgIHBsdWdpbiA9IFwiXCIsXG4gICAgY2hlY2tfcGx1Z2lucyA9IFtcbiAgICAgICdTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaCcsXG4gICAgICAnQWNyb1BERi5QREYnLFxuICAgICAgJ1BERi5QZGZDdHJsJyxcbiAgICAgICdRdWlja1RpbWUuUXVpY2tUaW1lJyxcbiAgICAgICdybW9jeC5SZWFsUGxheWVyIEcyIENvbnRyb2wnLFxuICAgICAgJ3Jtb2N4LlJlYWxQbGF5ZXIgRzIgQ29udHJvbC4xJyxcbiAgICAgICdSZWFsUGxheWVyLlJlYWxQbGF5ZXIodG0pIEFjdGl2ZVggQ29udHJvbCAoMzItYml0KScsXG4gICAgICAnUmVhbFZpZGVvLlJlYWxWaWRlbyh0bSkgQWN0aXZlWCBDb250cm9sICgzMi1iaXQpJyxcbiAgICAgICdSZWFsUGxheWVyJyxcbiAgICAgICdTV0N0bC5TV0N0bCcsXG4gICAgICAnV01QbGF5ZXIuT0NYJyxcbiAgICAgICdBZ0NvbnRyb2wuQWdDb250cm9sJyxcbiAgICAgICdTa3lwZS5EZXRlY3Rpb24nXG4gICAgXSxcbiAgICBudW1QbHVnaW5Ub0NoZWNrID0gY2hlY2tfcGx1Z2lucy5sZW5ndGg7XG5cbiAgZm9yIChpID0gMDsgaSA8IG51bVBsdWdpblRvQ2hlY2s7IGkrKykge1xuICAgIHBsdWdpbiA9IGNoZWNrQWN0aXZlWChjaGVja19wbHVnaW5zW2ldKTtcbiAgICBpZiAocGx1Z2luICE9PSBcIlwiKSB7XG4gICAgICBpZiAocmVzdWx0ICE9PSBcIlwiKSB7XG4gICAgICAgIHJlc3VsdCArPSBDT05UUk9MX0E7XG4gICAgICB9XG4gICAgICByZXN1bHQgKz0gcGx1Z2luO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyB3aGVyZSBzZWsgaXMgU291cmNlIEV2ZW50IEtleSwgYWxzbyBrbm93biBhcyB1bmlxdWUgZXZlbnQgaWRlbnRpZmllci5cbmZ1bmN0aW9uIGdldFNlayhiZWFjb24pIHtcbiAgdmFyIGtleVN0YXJ0LCBrZXlFbmQsIGtleU5hbWUgPSAnc2VrPSc7XG5cbiAgaWYgKGJlYWNvbikge1xuICAgIGtleVN0YXJ0ID0gYmVhY29uLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgaWYgKGtleVN0YXJ0ICE9PSAtMSkge1xuICAgICAga2V5RW5kID0gYmVhY29uLmluZGV4T2YoJyYnLCBrZXlTdGFydCArIGtleU5hbWUubGVuZ3RoKTtcbiAgICAgIGlmIChrZXlFbmQgPT09IC0xKSB7XG4gICAgICAgIGtleUVuZCA9IGJlYWNvbi5sZW5ndGg7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmVhY29uLnN1YnN0cmluZyhrZXlTdGFydCArIGtleU5hbWUubGVuZ3RoLCBrZXlFbmQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBFTVBUWV9TVFJJTkc7XG59XG5cbmZ1bmN0aW9uIGdldFRpbWVEZWx0YShzdGFydFRpbWUsIGVuZFRpbWUpIHtcbiAgcmV0dXJuIGVuZFRpbWUgLSBzdGFydFRpbWU7XG59XG5cbmZ1bmN0aW9uIGdldE51bWJlck9mTGV2ZWxzRG93bigpIHtcbiAgdmFyIG51bWJlck9mTGV2ZWxzID0gMCxcbiAgICB3aW5QYXJlbnQsXG4gICAgdG9wID0gd2luLnRvcDtcbiAgdHJ5IHtcbiAgICAvKmpzaGludCBlcWVxZXE6IGZhbHNlICovXG4gICAgaWYgKHRvcCA9PSB3aW4pIHtcbiAgICAgIG51bWJlck9mTGV2ZWxzID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luUGFyZW50ID0gd2luLnBhcmVudDtcbiAgICAgIG51bWJlck9mTGV2ZWxzKys7XG4gICAgICB3aGlsZSAodG9wICE9IHdpblBhcmVudCkge1xuICAgICAgICB3aW5QYXJlbnQgPSB3aW5QYXJlbnQucGFyZW50O1xuICAgICAgICBudW1iZXJPZkxldmVscysrO1xuICAgICAgfVxuICAgIH1cbiAgICAvKmpzaGludCBlcWVxZXE6IHRydWUgKi9cbiAgfSBjYXRjaCAoZXgpIHtcbiAgICBudW1iZXJPZkxldmVscyA9IC0xO1xuICB9XG4gIHJldHVybiBudW1iZXJPZkxldmVscztcbn1cblxuXG5mdW5jdGlvbiBnZXRMaXN0T2ZFbGVtZW50QXR0cmlidXRlcyh0YWdOYW1lLCBhdHRyaWJ1dGVOYW1lKSB7XG4gIHZhciBlbGVtZW50TGlzdCwgaSwgYXR0cmlidXRlTGlzdCA9IFtdLFxuICAgIGF0dHJpYnV0ZVZhbHVlO1xuXG4gIGVsZW1lbnRMaXN0ID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKHRhZ05hbWUpO1xuICBmb3IgKGkgPSAwOyBpIDwgZWxlbWVudExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBhdHRyaWJ1dGVWYWx1ZSA9IGVsZW1lbnRMaXN0W2ldW0dFVF9BVFRSSUJVVEVdKGF0dHJpYnV0ZU5hbWUpO1xuICAgIGlmIChhdHRyaWJ1dGVWYWx1ZSkge1xuICAgICAgYXR0cmlidXRlTGlzdC5wdXNoKGF0dHJpYnV0ZVZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXR0cmlidXRlTGlzdDtcbn1cblxuZnVuY3Rpb24gZmluZE1hdGNoKGxpc3RPbmUsIGxpc3RUd28pIHtcbiAgdmFyIGxlbmd0aE9uZSA9IGxpc3RPbmUubGVuZ3RoLFxuICAgIGxlbmd0aFR3byA9IGxpc3RUd28ubGVuZ3RoLFxuICAgIGksIGosXG4gICAgbWF0Y2gkJDE7XG5cbiAgaWYgKGxlbmd0aE9uZSAhPT0gbGVuZ3RoVHdvKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGhPbmU7IGkrKykge1xuICAgICAgbWF0Y2gkJDEgPSBmYWxzZTtcbiAgICAgIGZvciAoaiA9IDA7IGogPCBsZW5ndGhUd287IGorKykge1xuICAgICAgICBpZiAobGlzdE9uZVtpXS5pbmRleE9mKGxpc3RUd29bal0pICE9PSAtMSkge1xuICAgICAgICAgIG1hdGNoJCQxID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFtYXRjaCQkMSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhbGwgaW1nLCBzY3JpcHQgYW5kIG9iamVjdCBoYXZlIGxvYWRlZFxuICpcbiAqIEBtZXRob2QgZ2V0QWRMb2FkZWRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IDEgaWYgYWQgaXMgbm90IGxvYWRlZCwgMiBpZiBhZCBpcyBsb2FkZWRcbiAqL1xuZnVuY3Rpb24gZ2V0QWRMb2FkZWQoKSB7XG4gIHZhciBhZExvYWRlZCA9IDMsXG4gICAgaW1nRWxlbWVudHMgPSBbXSxcbiAgICBpbWdUaW1pbmdzID0gW10sXG4gICAgc2NyaXB0RWxlbWVudHMgPSBbXSxcbiAgICBzY3JpcHRUaW1pbmdzID0gW10sXG4gICAgb2JqZWN0RWxlbWVudHMgPSBbXSxcbiAgICBvYmplY3RUaW1pbmdzID0gW10sXG4gICAgdGltaW5nc0hvbGRlcixcbiAgICBpO1xuXG4gIC8vIGZlYXR1cmUgY2hlY2tcbiAgaWYgKHdpbiAmJiB3aW4ucGVyZm9ybWFuY2UgJiYgd2luLnBlcmZvcm1hbmNlLmdldEVudHJpZXNCeVR5cGUgJiYgdHlwZW9mIHdpbi5wZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlUeXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gY29sbGVjdCBlbGVtZW50c1xuICAgIGltZ0VsZW1lbnRzID0gZ2V0TGlzdE9mRWxlbWVudEF0dHJpYnV0ZXMoJ2ltZycsICdzcmMnKTtcbiAgICBzY3JpcHRFbGVtZW50cyA9IGdldExpc3RPZkVsZW1lbnRBdHRyaWJ1dGVzKCdzY3JpcHQnLCAnc3JjJyk7XG4gICAgb2JqZWN0RWxlbWVudHMgPSBnZXRMaXN0T2ZFbGVtZW50QXR0cmlidXRlcygnb2JqZWN0JywgJ2RhdGEnKTtcblxuICAgIC8vIGNvbGxlY3QgdGltaW5nc1xuICAgIHRpbWluZ3NIb2xkZXIgPSB3aW4ucGVyZm9ybWFuY2UuZ2V0RW50cmllc0J5VHlwZSgncmVzb3VyY2UnKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGltaW5nc0hvbGRlci5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRpbWluZ3NIb2xkZXJbaV0uaW5pdGlhdG9yVHlwZSA9PT0gJ2ltZycpIHtcbiAgICAgICAgaW1nVGltaW5ncy5wdXNoKHRpbWluZ3NIb2xkZXJbaV0ubmFtZSk7XG4gICAgICB9IGVsc2UgaWYgKHRpbWluZ3NIb2xkZXJbaV0uaW5pdGlhdG9yVHlwZSA9PT0gJ3NjcmlwdCcpIHtcbiAgICAgICAgc2NyaXB0VGltaW5ncy5wdXNoKHRpbWluZ3NIb2xkZXJbaV0ubmFtZSk7XG4gICAgICB9IGVsc2UgaWYgKHRpbWluZ3NIb2xkZXJbaV0uaW5pdGlhdG9yVHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgb2JqZWN0VGltaW5ncy5wdXNoKHRpbWluZ3NIb2xkZXJbaV0ubmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFmaW5kTWF0Y2goaW1nRWxlbWVudHMsIGltZ1RpbWluZ3MpKSB7XG4gICAgICBhZExvYWRlZCA9IDI7XG4gICAgfVxuXG4gICAgaWYgKCFmaW5kTWF0Y2goc2NyaXB0RWxlbWVudHMsIHNjcmlwdFRpbWluZ3MpKSB7XG4gICAgICBhZExvYWRlZCA9IDI7XG4gICAgfVxuXG4gICAgaWYgKCFmaW5kTWF0Y2gob2JqZWN0RWxlbWVudHMsIG9iamVjdFRpbWluZ3MpKSB7XG4gICAgICBhZExvYWRlZCA9IDI7XG4gICAgfVxuXG4gICAgaWYgKGFkTG9hZGVkICE9PSAyKSB7XG4gICAgICBhZExvYWRlZCA9IDE7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFkTG9hZGVkO1xufVxuXG5cbmZ1bmN0aW9uIGNvbnN0cnVjdE1ldHJpY3NEYXRhKGFyY2hpdmUkJDEsIHZpZXdhYmlsaXR5QmVhY29uVXJsLCBtZXRob2RJbnN0YW5jZSwgYWRkaXRpb25hbE1ldHJpY3NEYXRhLCBhZGRpdGlvbmFsRGF0YSkge1xuICB2YXIgZGF0YSA9ICcnLFxuICAgIHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gIGRhdGEgKz0gXCJzZWs9XCIgKyBnZXRTZWsodmlld2FiaWxpdHlCZWFjb25VcmwpO1xuICBkYXRhICs9ICcmZ20wPScgKyBtZXRob2RJbnN0YW5jZS5pblZpZXcxMDBGb3IwU2VjO1xuICBkYXRhICs9ICcmZ20xPScgKyBtZXRob2RJbnN0YW5jZS5pblZpZXcxMDBGb3IxU2VjO1xuICAvL1RPRE8gZGF0YSArPSAnJnRpdnQ9JyArIE1hdGguZmxvb3IoYXJjaGl2ZS50aXZ0LzEwMDApO1xuICBkYXRhICs9ICcmdGl2dD0nICsgbWV0aG9kSW5zdGFuY2UudG90YWxJblZpZXdUaW1lO1xuICBkYXRhICs9ICcmaG92PScgKyBhcmNoaXZlJCQxLmhvdjtcbiAgZGF0YSArPSAnJnR0aD0nICsgYXJjaGl2ZSQkMS50dGg7XG4gIGRhdGEgKz0gJyZpbnR0PScgKyBhcmNoaXZlJCQxLmludHQ7XG4gIGRhdGEgKz0gJyZpbnRsPScgKyBhcmNoaXZlJCQxLmludGw7XG4gIGRhdGEgKz0gJyZ0dGk9JyArIGFyY2hpdmUkJDEudHRpO1xuICBkYXRhICs9ICcmc3Q9JyArIGdldFRpbWVEZWx0YShwYWdlU3RhcnRUaW1lLCB0aW1lc3RhbXApO1xuICBkYXRhICs9ICcmZm9jPScgKyBhcmNoaXZlJCQxLmZvYztcbiAgLy8gY2FsY3VsYXRlL2FkZCBhZGRpdGlvbiBkd2VsbCB0aW1lXG4gIGlmIChkb2MgJiYgIWRvY1toaWRkZW5dKSB7XG4gICAgYXJjaGl2ZSQkMS5hZHQgKz0gZ2V0VGltZURlbHRhKGFyY2hpdmUkJDEuZHdlbGxTdGFydFRpbWUsIHRpbWVzdGFtcCk7XG4gIH1cbiAgZGF0YSArPSAnJmFkdD0nICsgYXJjaGl2ZSQkMS5hZHQ7XG4gIGRhdGEgKz0gJyZzY3I9JyArIGFyY2hpdmUkJDEuc2NyO1xuICBkYXRhICs9ICcmcGg9JyArIGFyY2hpdmUkJDEucGg7XG4gIGRhdGEgKz0gJyZzY2Q9JyArIGFyY2hpdmUkJDEuc2NkO1xuICBkYXRhICs9ICcmc3ZkPScgKyAoYXJjaGl2ZSQkMS5zY3JvbGxlZERvd25UaW1lID4gMCA/IE1hdGgucm91bmQoYXJjaGl2ZSQkMS5zY3JvbGxlZERvd25QaXhlbHMgLyBhcmNoaXZlJCQxLnNjcm9sbGVkRG93blRpbWUpIDogMCk7XG4gIGRhdGEgKz0gJyZzdnU9JyArIChhcmNoaXZlJCQxLnNjcm9sbGVkVXBUaW1lID4gMCA/IE1hdGgucm91bmQoYXJjaGl2ZSQkMS5zY3JvbGxlZFVwUGl4ZWxzIC8gYXJjaGl2ZSQkMS5zY3JvbGxlZFVwVGltZSkgOiAwKTtcbiAgZGF0YSArPSAnJnNjdD0nICsgYXJjaGl2ZSQkMS5zY3Q7XG4gIGRhdGEgKz0gJyZtaXZwPScgKyBtZXRob2RJbnN0YW5jZS5tYXhJblZpZXdQZXJjZW50YWdlO1xuICBkYXRhICs9ICcmbWl2dD0nICsgbWV0aG9kSW5zdGFuY2UubWF4SW5WaWV3VGltZTtcbiAgLy9kYXRhICs9ICcmbHM9JyArIChtZXRob2RJbnN0YW5jZS5tZWFzdXJlbWVudEJ1Y2tldCA9PT0gJzYnID8gJzInIDogJzMnKTtcbiAgZGF0YSArPSAnJmxzPScgKyBtZXRob2RJbnN0YW5jZS5tZWFzdXJlbWVudEJ1Y2tldDtcbiAgZGF0YSArPSAnJndpbmw9JyArIF9lbmNvZGVVUklDb21wb25lbnQoZ2V0RG9tYWluKGxvYykpO1xuICBkYXRhICs9ICcmd2lucj0nICsgX2VuY29kZVVSSUNvbXBvbmVudChnZXREb21haW4oKGRvYyAmJiBkb2MucmVmZXJyZXIpKSk7XG4gIGRhdGEgKz0gJyZsdmw9JyArIGdldE51bWJlck9mTGV2ZWxzRG93bigpO1xuICAvL1RPRE8gZmlndXJlIHRoaXMgb3V0XG4gIGRhdGEgKz0gJyZhdGY9JyArICcwJzsgLy8gKyBhYm92ZVRoZUZvbGQgRGVmYXVsdGluZyB0byBaZXJvIHVudGlsIGltcGxlbWVudGVkXG4gIGRhdGEgKz0gJyZhbD0nICsgZ2V0QWRMb2FkZWQoKTtcbiAgZGF0YSArPSAnJmFlPScgKyBhcmNoaXZlJCQxLmFlO1xuICBkYXRhICs9ICcmYXc9JyArIGdldEFkV2VpZ2h0KCk7XG4gIGRhdGEgKz0gJyZhbz0nICsgZ2V0QW5jZXN0b3JPcmlnaW5zKGFyY2hpdmUkJDEpO1xuICBkYXRhICs9ICcmc2FvPScgKyBhcmNoaXZlJCQxLnNhbztcbiAgZGF0YSArPSAnJmxhbmc9JyArIF9lbmNvZGVVUklDb21wb25lbnQobGFuZyk7XG4gIGRhdGEgKz0gJyZzdz0nICsgKHdpblNjcmVlbiA/IHdpblNjcmVlbi53aWR0aCA6IDApO1xuICBkYXRhICs9ICcmc2g9JyArICh3aW5TY3JlZW4gPyB3aW5TY3JlZW4uaGVpZ2h0IDogMCk7XG4gIGRhdGEgKz0gJyZ0em89JyArIG5ldyBEYXRlKCkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgZGF0YSArPSAnJnBsZ249JyArIF9lbmNvZGVVUklDb21wb25lbnQoZ2V0SGFzaGVkUGx1Z2luc1N0cmluZygpKTtcbiAgZGF0YSArPSAnJmNpPScgKyBfZW5jb2RlVVJJQ29tcG9uZW50KGdldENhbnZhc0ltYWdlKCkpO1xuICBkYXRhICs9ICcmYj0nICsgQlVDS0VUX0lEO1xuICBkYXRhICs9ICcmYWQ9anY9JyArIEpTX1ZFUlNJT04gKyAoYWRkaXRpb25hbERhdGEgPyAnOicgKyBhZGRpdGlvbmFsRGF0YSA6ICcnKSArIFwiOlwiICsgZ2V0Q29tbW9uQWRkaXRpb25hbERhdGEobWV0aG9kSW5zdGFuY2UpO1xuXG4gIGlmIChhZGRpdGlvbmFsTWV0cmljc0RhdGEpIHtcbiAgICBkYXRhICs9IFwiJlwiICsgYWRkaXRpb25hbE1ldHJpY3NEYXRhO1xuICB9XG5cbiAgcmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIGZpcmVNZXRyaWNzQmVhY29uKGFyY2hpdmUkJDEsIHZpZXdhYmlsaXR5QmVhY29uVXJsLCBtZXRob2RJbnN0YW5jZSwgYWRkaXRpb25hbE1ldHJpY3NEYXRhLCBhZGRpdGlvbmFsRGF0YSkge1xuICB0cnkge1xuICAgIGJlYWNvbk1lKE1FVFJJQ1NfQkVBQ09OX0RPTUFJTiArIGNvbnN0cnVjdE1ldHJpY3NEYXRhKGFyY2hpdmUkJDEsIHZpZXdhYmlsaXR5QmVhY29uVXJsLCBtZXRob2RJbnN0YW5jZSwgYWRkaXRpb25hbE1ldHJpY3NEYXRhLCBhZGRpdGlvbmFsRGF0YSkpO1xuICB9IGNhdGNoIChleCkge31cbn1cblxuLyoqXG4gKiBCYXNlIG1lYXN1cmVtZW50IG1ldGhvZFxuICpcbiAqIEBjbGFzcyBNZWFzdXJlbWVudE1ldGhvZFxuICovXG52YXIgTWVhc3VyZW1lbnRNZXRob2QgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIC8qKlxuICAgKiBJbml0aWFsIGNhbGN1YXRlZCBhZCB3aWR0aFxuICAgKlxuICAgKiBAcHJvcGVydHkgYWRXaWR0aFxuICAgKiBAbWFuZGF0b3J5XG4gICAqL1xuICB0aGlzLmFkV2lkdGggPSBvcHRpb25zLmFkV2lkdGg7XG4gIC8qKlxuICAgKiBJbml0aWFsIGNhbGN1YXRlZCBhZCBoZWlnaHRcbiAgICpcbiAgICogQHByb3BlcnR5IGFkSGVpZ2h0XG4gICAqIEBtYW5kYXRvcnlcbiAgICovXG4gIHRoaXMuYWRIZWlnaHQgPSBvcHRpb25zLmFkSGVpZ2h0O1xuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGluVmlld0NhbGxiYWNrXG4gICAqL1xuICB0aGlzLmluVmlld0NhbGxiYWNrID0gb3B0aW9ucy5pblZpZXdDYWxsYmFjaztcblxuICAvKipcbiAgICogQG1ldGhvZCBvdXRPZlZpZXdDYWxsYmFja1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGZvcmNlQmVhY29uXG4gICAqL1xuICB0aGlzLm91dE9mVmlld0NhbGxiYWNrID0gb3B0aW9ucy5vdXRPZlZpZXdDYWxsYmFjaztcblxuICAvKipcbiAgICogQHByb3BlcnR5IHRocmVzaG9sZFBlcmNlbnRhZ2VcbiAgICovXG4gIHRoaXMudGhyZXNob2xkUGVyY2VudGFnZSA9IG9wdGlvbnMudGhyZXNob2xkUGVyY2VudGFnZSB8fCB0aHJlc2hvbGRQZXJjZW50YWdlO1xuXG4gIC8qKlxuICAgKiBDdXJyZW50IGluIHZpZXcgcGVyY2VudGFnZVxuICAgKlxuICAgKiBAcHJvcGVydHkgaW5WaWV3UGVyY2VudGFnZVxuICAgKi9cbiAgdGhpcy5pblZpZXdQZXJjZW50YWdlID0gMDtcbiAgLyoqXG4gICAqIEFsbCBpbiB2aWV3IHBlcmNlbnRhZ2VzIHVzZWQgdG8gY2FsY3VsYXRlIGF2ZXJhZ2VcbiAgICpcbiAgICogQHByb3BlcnR5IGluVmlld1BlcmNlbnRhZ2VzXG4gICAqL1xuICB0aGlzLmluVmlld1BlcmNlbnRhZ2VzID0gW107XG4gIC8qKlxuICAgKiBNYXggaW4gdmlldyBwZXJjZW50YWdlXG4gICAqXG4gICAqIEBwcm9wZXJ0eSBtYXhJblZpZXdQZXJjZW50YWdlXG4gICAqL1xuICB0aGlzLm1heEluVmlld1BlcmNlbnRhZ2UgPSAwO1xuICAvKipcbiAgICogQHByb3BlcnR5IGluVmlld1xuICAgKi9cbiAgdGhpcy5pblZpZXcgPSBmYWxzZTtcbiAgLyoqXG4gICAqIEBwcm9wZXJ0eSBpc01lYXN1cmFibGVcbiAgICovXG4gIHRoaXMuaXNNZWFzdXJhYmxlID0gdHJ1ZTtcbiAgLyoqXG4gICAqIEBwcm9wZXJ0eSBpc0N1cnJlbnRseUluVmlld1xuICAgKi9cbiAgdGhpcy5pc0N1cnJlbnRseUluVmlldyA9IGZhbHNlO1xuICAvKipcbiAgICogQHByb3BlcnR5IGN1cnJlbnRUaW1lc3RhbXBcbiAgICovXG4gIHRoaXMuY3VycmVudFRpbWVzdGFtcCA9IDA7XG4gIC8qKlxuICAgKiBAcHJvcGVydHkgbGFzdFRpbWVzdGFtcFxuICAgKi9cbiAgdGhpcy5sYXN0VGltZXN0YW1wID0gMDtcbiAgLyoqXG4gICAqIEBwcm9wZXJ0eSBuZXh0VGltZXN0YW1wXG4gICAqL1xuICB0aGlzLm5leHRUaW1lc3RhbXAgPSAwO1xuICAvKipcbiAgICogQHByb3BlcnR5IHRvdGFsSW5WaWV3VGltZVxuICAgKi9cbiAgdGhpcy50b3RhbEluVmlld1RpbWUgPSAwO1xuICAvKipcbiAgICogQHByb3BlcnR5IG1heEluVmlld1RpbWVcbiAgICovXG4gIHRoaXMubWF4SW5WaWV3VGltZSA9IDA7XG4gIC8qKlxuICAgKiBAcHJvcGVydHkgdG90YWxJblZpZXcxMDBUaW1lXG4gICAqL1xuICB0aGlzLnRvdGFsSW5WaWV3MTAwVGltZSA9IDA7XG4gIC8qKlxuICAgKiBAcHJvcGVydHkgaW5WaWV3MTAwU3RhcnRUaW1lXG4gICAqL1xuICB0aGlzLmluVmlldzEwMFN0YXJ0VGltZSA9IDA7XG4gIC8qKlxuICAgKiBAcHJvcGVydHkgbGFzdEluVmlldzEwMFRpbWVzdGFtcFxuICAgKi9cbiAgdGhpcy5sYXN0SW5WaWV3MTAwVGltZXN0YW1wID0gMDtcbiAgLyoqXG4gICAqIEBwcm9wZXJ0eSBpblZpZXcxMDBGb3IwU2VjXG4gICAqL1xuICB0aGlzLmluVmlldzEwMEZvcjBTZWMgPSAwO1xuICAvKipcbiAgICogQHByb3BlcnR5IGluVmlldzEwMEZvcjFTZWNcbiAgICovXG4gIHRoaXMuaW5WaWV3MTAwRm9yMVNlYyA9IDA7XG4gIC8qKlxuICAgKiBAcHJvcGVydHkgc3RvcENhbGxiYWNrc1xuICAgKi9cbiAgdGhpcy5zdG9wQ2FsbGJhY2tzID0gZmFsc2U7XG5cbiAgLy92aWRlbyBvbmx5IG1ldGhvZHMuXG4gIC8vVE9ETyBmaW5kIGEgYmV0dGVyIHdheSB0byBpbml0aWFsaXplIGZyb20gb3B0aW9uc1xuICAvKipcbiAgICogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gdGhlIGFkIGlzIGxvYWRlZC4gVXNlZCB0byBzdGFydCBpbiB2aWV3cG9ydCBtZWFzdXJlbWVudCBjYWxjdWxhdGlvblxuICAgKlxuICAgKiBAbWV0aG9kIGFkTG9hZGVkXG4gICAqIEBtYW5kYXRvcnlcbiAgICovXG4gIHRoaXMuYWRMb2FkZWQgPSBvcHRpb25zLmFkTG9hZGVkO1xuXG4gIC8qKlxuICAgKiBQbGF5ZXIgaWQgdXNlZCB0byBpZGVudGlmeSB0aGUgcGxheWVyIGFuZCBpbnNpZGUtanMgaW5zdGFuY2UgZm9yIHRoZSBzdWJzY3JpcHRpb24gbWFuYWdlciBpbiBjYXNlIG9mIGZsYXNoLlxuICAgKlxuICAgKiBAbWV0aG9kIHBsYXllcklkXG4gICAqIEBtYW5kYXRvcnlcbiAgICovXG4gIHRoaXMucGxheWVySWQgPSBvcHRpb25zLnBsYXllcklkO1xuXG4gIC8qKlxuICAgKiBIYW5kbGUgdG8gYWRVbml0J3Mgb2JqZWN0IHRvIGFkZCBsaXN0ZW5lcnNcbiAgICpcbiAgICogQHByb3BlcnR5IGFkVW5pdFxuICAgKiBAbWFuZGF0b3J5XG4gICAqL1xuICB0aGlzLmFkVW5pdCA9IG9wdGlvbnMuYWRVbml0O1xuXG4gIC8qKlxuICAgKiBAcHJvcGVydHkgYWRTaXplQ2hhbmdlZFxuICAgKiBAbWFuZGF0b3J5XG4gICAqL1xuICB0aGlzLmFkU2l6ZUNoYW5nZWQgPSBvcHRpb25zLmFkU2l6ZUNoYW5nZWQ7XG5cbiAgLyoqXG4gICAqIEBwcm9wZXJ0eSBhZFZpZGVvQ29tcGxldGVcbiAgICogQG1hbmRhdG9yeVxuICAgKi9cbiAgdGhpcy5hZFZpZGVvQ29tcGxldGUgPSBvcHRpb25zLmFkVmlkZW9Db21wbGV0ZTtcblxuICAvKipcbiAgICogV2lsbCBiZSBzZXQgdG8gdHJ1ZSBvbmx5IHdoZW4gbWVhc3VyZW1lbnQgbWV0aG9kIGlzIGZsYXNoIGFuZCBpdCBpcyBub3Qgc3VwcG9ydGVkLlxuICAgKiBCdXQgd2lsbCBiZSBsb2dnZWQgaW4gYWRkbl9kYXRhIGFsbCB0aGUgdGltZS5cbiAgICogMCAtIHN1cHBvcnRlZFxuICAgKiAxIC0gbm90IHN1cHBvcnRlZFxuICAgKiAyIC0gdGltZWRvdXRcbiAgICpcbiAgICogQHByb3BlcnR5IGZsYXNoTm90U3VwcG9ydGVkXG4gICAqL1xuICB0aGlzLmZsYXNoTm90U3VwcG9ydGVkID0gMDtcbn07XG5cbi8qKlxuICogVGltZSBwZXJpb2QgZm9yIHdoaWNoIGFkIGlzIHRvIGJlIGluIHZpZXcgdG8gZmlyZSB2aWV3YWJsZSBiZWFjb25cbiAqXG4gKiBAcHJvcGVydHkgYmVhY29uVGltZW91dFxuICogQGRlZmF1bHQgMTAwMFxuICovXG5NZWFzdXJlbWVudE1ldGhvZC5wcm90b3R5cGUuYmVhY29uVGltZW91dCA9IElOX1ZJRVdfVElNRV9USFJFU0hPTEQ7XG5cbi8qKlxuICogQHByb3BlcnR5IG1lYXN1cmVtZW50QnVja2V0XG4gKi9cbk1lYXN1cmVtZW50TWV0aG9kLnByb3RvdHlwZS5tZWFzdXJlbWVudEJ1Y2tldCA9IFwiMlwiO1xuXG4vKipcbiAqIEBtZXRob2QgaW5pdFxuICovXG5NZWFzdXJlbWVudE1ldGhvZC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJlZ2lzdGVySW5WaWV3TGlzdGVuZXIoKTtcbn07XG5cbi8qKlxuICogQG1ldGhvZCBjYW5BcHBseU1ldGhvZFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuTWVhc3VyZW1lbnRNZXRob2QucHJvdG90eXBlLmNhbkFwcGx5TWV0aG9kID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogQG1ldGhvZCByZWdpc3RlckluVmlld0xpc3RlbmVyXG4gKi9cbk1lYXN1cmVtZW50TWV0aG9kLnByb3RvdHlwZS5yZWdpc3RlckluVmlld0xpc3RlbmVyID0gZnVuY3Rpb24oKSB7fTtcblxuLyoqXG4gKiBAbWV0aG9kIGluVmlld0xpc3RlbmVyQ2FsbGJhY2tcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeVxuICovXG5NZWFzdXJlbWVudE1ldGhvZC5wcm90b3R5cGUuaW5WaWV3TGlzdGVuZXJDYWxsYmFjayA9IGZ1bmN0aW9uKGVudHJ5KSB7XG4gIHRoaXMuY3VycmVudEVudHJ5ID0gZW50cnk7XG4gIHRoaXMuY3VycmVudFRpbWVzdGFtcCA9IGVudHJ5LnRpbWU7XG5cbiAgdGhpcy51cGRhdGVJblZpZXdQZXJjZW50YWdlcyhlbnRyeSk7XG5cbiAgaWYgKHRoaXMuaXNJblZpZXcoKSAmJiAhZG9jW2hpZGRlbl0pIHtcbiAgICB0aGlzLnVwZGF0ZVRpbWVzdGFtcHMoKTtcblxuICAgIGlmICghdGhpcy5pc0N1cnJlbnRseUluVmlldykge31cbiAgICB0aGlzLmlzQ3VycmVudGx5SW5WaWV3ID0gdHJ1ZTtcblxuICAgIC8vIHN0b3BDYWxsYmFja3Mgd2lsbCBiZSBzZXQgdG8gdHJ1ZSBvbmNlIGFsbCBvdGhlciByZXF1aXJlbWVudHMgYXJlIG1ldCAoMiBzZWNvbmRzIG9mIHZpZGVvIHBsYXllZCBpbiBjYXNlIG9mIGluc2lkZS12aWRlbylcbiAgICBpZiAoIXRoaXMuc3RvcENhbGxiYWNrcykge1xuICAgICAgdGhpcy5pblZpZXdDYWxsYmFjaygpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzSW5WaWV3MTAwKCkpIHtcbiAgICAgIHRoaXMudXBkYXRlVGltZXN0YW1wczEwMCgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMucmVzZXRUaW1lc3RhbXBzMTAwKCk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGlmICh0aGlzLmlzQ3VycmVudGx5SW5WaWV3KSB7fVxuICAgIHRoaXMucmVzZXRUaW1lc3RhbXBzKCk7XG4gICAgdGhpcy5yZXNldFRpbWVzdGFtcHMxMDAoKTtcbiAgICB0aGlzLmlzQ3VycmVudGx5SW5WaWV3ID0gZmFsc2U7XG4gICAgdGhpcy5pblZpZXcgPSBmYWxzZTtcblxuICAgIGlmICghdGhpcy5zdG9wQ2FsbGJhY2tzKSB7XG4gICAgICB0aGlzLm91dE9mVmlld0NhbGxiYWNrKCk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEBtZXRob2QgbWV0Vmlld2FibGVTdGFuZGFyZFxuICovXG5NZWFzdXJlbWVudE1ldGhvZC5wcm90b3R5cGUubWV0Vmlld2FibGVTdGFuZGFyZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmluVmlldyA9IHRoaXMuaXNDdXJyZW50bHlJblZpZXc7XG4gIHRoaXMuc3RvcENhbGxiYWNrcyA9IHRydWU7XG5cbiAgdGhpcy5jdXJyZW50VGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgaWYgKHRoaXMuaXNDdXJyZW50bHlJblZpZXcpIHtcbiAgICB0aGlzLnVwZGF0ZVRpbWVzdGFtcHMoKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLnJlc2V0VGltZXN0YW1wcygpO1xuICB9XG59O1xuXG4vKipcbiAqIEBtZXRob2QgdXBkYXRlSW5WaWV3UGVyY2VudGFnZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeVxuICovXG5NZWFzdXJlbWVudE1ldGhvZC5wcm90b3R5cGUudXBkYXRlSW5WaWV3UGVyY2VudGFnZXMgPSBmdW5jdGlvbihlbnRyeSkge1xuICB0aGlzLmluVmlld1BlcmNlbnRhZ2UgPSBlbnRyeS5pbnRlcnNlY3Rpb25SYXRpbztcblxuICBpZiAodGhpcy5tYXhJblZpZXdQZXJjZW50YWdlIDwgdGhpcy5pblZpZXdQZXJjZW50YWdlKSB7XG4gICAgdGhpcy5tYXhJblZpZXdQZXJjZW50YWdlID0gdGhpcy5pblZpZXdQZXJjZW50YWdlO1xuICB9XG5cbiAgdGhpcy5pblZpZXdQZXJjZW50YWdlcy5wdXNoKHRoaXMuaW5WaWV3UGVyY2VudGFnZSk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgaW4tdmlldywgbGFzdCBhbmQgY3VycmVudCB0aW1lc3RhbXBzXG4gKiBAbWV0aG9kIHVwZGF0ZVRpbWVzdGFtcHNcbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIGxhc3QgdGltZXN0YW1wXG4gKi9cbk1lYXN1cmVtZW50TWV0aG9kLnByb3RvdHlwZS51cGRhdGVUaW1lc3RhbXBzID0gZnVuY3Rpb24oKSB7XG4gIHZhciB0aW1lRGVsdGE7XG5cbiAgaWYgKHRoaXMubGFzdFRpbWVzdGFtcCA+IDApIHtcbiAgICB0aW1lRGVsdGEgPSB0aGlzLmN1cnJlbnRUaW1lc3RhbXAgLSB0aGlzLmxhc3RUaW1lc3RhbXA7XG4gICAgdGhpcy50b3RhbEluVmlld1RpbWUgKz0gdGltZURlbHRhO1xuICB9XG5cbiAgaWYgKHRoaXMubWF4SW5WaWV3VGltZSA8IHRoaXMudG90YWxJblZpZXdUaW1lKSB7XG4gICAgdGhpcy5tYXhJblZpZXdUaW1lID0gdGhpcy50b3RhbEluVmlld1RpbWU7XG4gIH1cblxuICB0aGlzLmxhc3RUaW1lc3RhbXAgPSB0aGlzLmN1cnJlbnRUaW1lc3RhbXA7XG5cbiAgcmV0dXJuIHRoaXMubGFzdFRpbWVzdGFtcDtcbn07XG5cbi8qKlxuICogQG1ldGhvZCBpc0luVmlld1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuTWVhc3VyZW1lbnRNZXRob2QucHJvdG90eXBlLmlzSW5WaWV3ID0gZnVuY3Rpb24oKSB7XG4gIC8vTE9HKFwiTWVhc3VyZW1lbnQgaXNJblZpZXcgOiBcIiArIHRoaXMuaW5WaWV3UGVyY2VudGFnZSk7XG4gIHJldHVybiB0aGlzLmluVmlld1BlcmNlbnRhZ2UgPj0gdGhpcy50aHJlc2hvbGRQZXJjZW50YWdlO1xufTtcblxuLyoqXG4gKiBNZXRob2QgdG8gY2hlY2sgaWYgYWQgaXMgc3VmZmljaWVudGx5IGluIHZpZXdcbiAqXG4gKiBAbWV0aG9kIGlzU3VmZmljaWVudGx5SW5WaWV3XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5NZWFzdXJlbWVudE1ldGhvZC5wcm90b3R5cGUuaXNTdWZmaWNpZW50bHlJblZpZXcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG90YWxJblZpZXdUaW1lID49IHRoaXMuYmVhY29uVGltZW91dDtcbn07XG5cbi8qKlxuICogQG1ldGhvZCByZXNldFRpbWVzdGFtcHNcbiAqL1xuTWVhc3VyZW1lbnRNZXRob2QucHJvdG90eXBlLnJlc2V0VGltZXN0YW1wcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmxhc3RUaW1lc3RhbXAgPSB0aGlzLm5leHRUaW1lc3RhbXAgPSB0aGlzLnRvdGFsSW5WaWV3VGltZSA9IDA7XG4gIHRoaXMuaW5WaWV3UGVyY2VudGFnZXMgPSBbXTtcbn07XG5cbi8vMTAwJSBpbiB2aWV3IGNhbGN1bGF0aW9uXG5cbi8qKlxuICogQG1ldGhvZCB1cGRhdGVUaW1lc3RhbXBzMTAwXG4gKiBAcGFyYW0ge09iamVjdH0gZW50cnlcbiAqL1xuTWVhc3VyZW1lbnRNZXRob2QucHJvdG90eXBlLnVwZGF0ZVRpbWVzdGFtcHMxMDAgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pblZpZXcxMDBGb3IwU2VjID0gMTtcblxuICBpZiAodGhpcy5sYXN0SW5WaWV3MTAwVGltZXN0YW1wID4gMCkge1xuICAgIHRoaXMudG90YWxJblZpZXcxMDBUaW1lICs9IHRoaXMuY3VycmVudFRpbWVzdGFtcCAtIHRoaXMubGFzdEluVmlldzEwMFRpbWVzdGFtcDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmluVmlldzEwMFN0YXJ0VGltZSA9IHRoaXMuY3VycmVudFRpbWVzdGFtcDtcbiAgfVxuICB0aGlzLmxhc3RJblZpZXcxMDBUaW1lc3RhbXAgPSB0aGlzLmN1cnJlbnRUaW1lc3RhbXA7XG5cbiAgaWYgKHRoaXMudG90YWxJblZpZXcxMDBUaW1lID4gdGhpcy5iZWFjb25UaW1lb3V0KSB7XG4gICAgdGhpcy5pblZpZXcxMDBGb3IxU2VjID0gMTtcbiAgfVxufTtcblxuLyoqXG4gKiBAbWV0aG9kIGlzSW5WaWV3MTAwXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5NZWFzdXJlbWVudE1ldGhvZC5wcm90b3R5cGUuaXNJblZpZXcxMDAgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuaW5WaWV3UGVyY2VudGFnZSA+IFBFUkNFTlRfSU5fVklFVzEwMF9USFJFU0hPTEQ7XG59O1xuXG4vKipcbiAqIEBtZXRob2QgcmVzZXRUaW1lc3RhbXBzMTAwXG4gKi9cbk1lYXN1cmVtZW50TWV0aG9kLnByb3RvdHlwZS5yZXNldFRpbWVzdGFtcHMxMDAgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5sYXN0SW5WaWV3MTAwVGltZXN0YW1wID0gdGhpcy50b3RhbEluVmlldzEwMFRpbWUgPSB0aGlzLmluVmlldzEwMFN0YXJ0VGltZSA9IDA7XG59O1xuXG4vKipcbiAqIEBtZXRob2QgY2xlYW51cFxuICovXG5NZWFzdXJlbWVudE1ldGhvZC5wcm90b3R5cGUuY2xlYW51cCA9IGZ1bmN0aW9uKCkge307XG5cbi8qKlxuICogQG1ldGhvZCByZXNldFxuICovXG5NZWFzdXJlbWVudE1ldGhvZC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHt9O1xuXG4vKipcbiAqIEBtZXRob2QgZXh0ZW5kc1xuICogQHN0YXRpY1xuICovXG5NZWFzdXJlbWVudE1ldGhvZC5leHRlbmQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNoaWxkID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGNoaWxkLnBhcmVudC5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICB9O1xuXG4gIGNoaWxkLnByb3RvdHlwZSA9IChPYmplY3QuY3JlYXRlICE9PSB1bmRlZmluZWQgPyBPYmplY3QuY3JlYXRlKHRoaXMucHJvdG90eXBlKSA6IG5ldyB0aGlzKHt9KSk7XG4gIGNoaWxkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGNoaWxkO1xuICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xuXG4gIGNoaWxkLmV4dGVuZCA9IHRoaXMuZXh0ZW5kO1xuXG4gIC8vVE9ETyBhZGQgX3N1cGVyIG1ldGhvZCBpZiBuZWVkZWRcbiAgZm9yKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBmb3JJbk9iaiA9IGFyZ3VtZW50c1tpXTtcbiAgICBpZih1bmRlZmluZWQgIT09IGZvckluT2JqLnByb3RvdHlwZSkge1xuICAgICAgZm9ySW5PYmogPSBmb3JJbk9iai5wcm90b3R5cGU7XG4gICAgfVxuICAgIGZvcih2YXIgbSBpbiBmb3JJbk9iaikge1xuICAgICAgaWYoZm9ySW5PYmouaGFzT3duUHJvcGVydHkobSkpIHtcbiAgICAgICAgY2hpbGQucHJvdG90eXBlW21dID0gZm9ySW5PYmpbbV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNoaWxkO1xufTtcblxuLyoqXG4gKiBAbWV0aG9kIGdldEF2ZXJhZ2VJblZpZXdQZXJjZW50YWdlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbi8vVE9ETyA6IGNvbnNpZGVyIHRoZSB0aW1lIHN0YW1wcyB3aGVuIHRoZSBwZXJjZW50YWdlcyB3ZXJlIHJlY29yZGVkXG5NZWFzdXJlbWVudE1ldGhvZC5wcm90b3R5cGUuZ2V0QXZlcmFnZUluVmlld1BlcmNlbnRhZ2UgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGksXG4gICAgY291bnQgPSB0aGlzLmluVmlld1BlcmNlbnRhZ2VzLmxlbmd0aCxcbiAgICBzdW0gPSAwO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgc3VtICs9IHRoaXMuaW5WaWV3UGVyY2VudGFnZXNbaV07XG4gIH1cblxuICByZXR1cm4gY291bnQgPyBNYXRoLnJvdW5kKHN1bSAvIGNvdW50KSA6IDA7XG59O1xuXG4vKipcbiAqIEJhc2UgbWVhc3VyZW1lbnQgbWV0aG9kIGZvciBtZXRob2RzIHRoYXQgY2hlY2sgcmVndWxhcmx5XG4gKlxuICogQGNsYXNzIFJlZ3VsYXJDaGVja01ldGhvZFxuICovXG52YXIgUmVndWxhckNoZWNrTWV0aG9kID0gTWVhc3VyZW1lbnRNZXRob2QuZXh0ZW5kKHtcbiAgLyoqXG4gICAqIFRpbWVvdXQgdG8gdXNlIHdoZW4gYWQgaXMgaW4gdmlldyBhbmQgdG8gY2hlY2sgaXQgaXMgaW4gdmlldyBmb3IgJ2JlYWNvblRpbWVvdXQnIG1zXG4gICAqXG4gICAqIEBwcm9wZXJ0eSBmaW5lVGltZW91dFxuICAgKiBAZGVmYXVsdCAxMDBcbiAgICovXG4gIGZpbmVUaW1lb3V0IDogRklORV9USU1FT1VUX0RFRkFVTFQsXG5cbiAgLyoqXG4gICAqIFRpbWVvdXQgdXNlZCB0byB3aGVuIGNoZWNrIGFkIGNvbWVzIGluIHZpZXdcbiAgICpcbiAgICogQHByb3BlcnR5IGZpbmVUaW1lb3V0XG4gICAqIEBkZWZhdWx0IDc1MFxuICAgKi9cbiAgY29hcnNlVGltZW91dCA6IENPQVJTRV9USU1FT1VUX0RFRkFVTFQsXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgcmVnaXN0ZXJJblZpZXdMaXN0ZW5lclxuICAgKi9cbiAgcmVnaXN0ZXJJblZpZXdMaXN0ZW5lciA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB0aGlzLnRpbWVvdXQgPSB0aGlzLm5vdEluVmlld1RpbWVyV3JhcHBlcihmdW5jdGlvbigpIHtcbiAgICAgIHRoYXQuZmlyZUluVmlld0xpc3RlbmVyQ2FsbGJhY2soKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGluIHZpZXcgcGVyY2VudGFnZSBhbmQgY2FsbCAnaW5WaWV3TGlzdGVuZXJDYWxsYmFjaydcbiAgICpcbiAgICogQG1ldGhvZCBmaXJlSW5WaWV3TGlzdGVuZXJDYWxsYmFja1xuICAgKi9cbiAgZmlyZUluVmlld0xpc3RlbmVyQ2FsbGJhY2sgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZW50cnkgPSB7XG4gICAgICBpbnRlcnNlY3Rpb25SYXRpbyA6IHRoaXMuZ2V0SW5WaWV3UGVyY2VudGFnZSgpLFxuICAgICAgdGltZSA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgIH0sIHRoYXQgPSB0aGlzO1xuXG4gICAgdGhpcy5pblZpZXdMaXN0ZW5lckNhbGxiYWNrKGVudHJ5KTtcblxuICAgIHRoaXMudGltZW91dCA9IHRoaXNbKHRoaXMuaXNDdXJyZW50bHlJblZpZXcgPyBcImluVmlld1RpbWVyV3JhcHBlclwiIDogXCJub3RJblZpZXdUaW1lcldyYXBwZXJcIildKGZ1bmN0aW9uKCkge1xuICAgICAgdGhhdC5maXJlSW5WaWV3TGlzdGVuZXJDYWxsYmFjaygpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBNZXRob2QgdG8gZ2V0IGluIHZpZXcgcGVyY2VudGFnZVxuICAgKlxuICAgKiBAbWV0aG9kIGdldEluVmlld1BlcmNlbnRhZ2VcbiAgICogQG1hbmRhdG9yeVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAqL1xuICBnZXRJblZpZXdQZXJjZW50YWdlIDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIDA7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFdyYXBwZXIgTWV0aG9kIHRvIHN0YXJ0IGEgdGltZXIgd2hlbiBhZCBpcyBub3QgaW4gdmlld1xuICAgKlxuICAgKiBAbXRob2Qgbm90SW5WaWV3VGltZXJXcmFwcGVyXG4gICAqL1xuICBub3RJblZpZXdUaW1lcldyYXBwZXIgOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGNhbGxiYWNrLCB0aGlzLmNvYXJzZVRpbWVvdXQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBXcmFwcGVyIE1ldGhvZCB0byBzdGFydCBhIHRpbWVyIHdoZW4gYWQgaXMgaW4gdmlld1xuICAgKlxuICAgKiBAbXRob2QgaW5WaWV3VGltZXJXcmFwcGVyXG4gICAqL1xuICBpblZpZXdUaW1lcldyYXBwZXIgOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGNhbGxiYWNrLCB0aGlzLmZpbmVUaW1lb3V0KTtcbiAgfSxcblxuICAvKipcbiAgICogTWV0aG9kIHRvIGNsZWFudXAgZWxlbWVudHMgYW5kIG90aGVyIGxpc3RlbmVycyBjcmVhdGVkIGJ5IHRoZSBtZXRob2RcbiAgICpcbiAgICogQG1ldGhvZCBjbGVhbnVwXG4gICAqL1xuICBjbGVhbnVwIDogZnVuY3Rpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwcm9wZXJ0eSBtZWFzdXJlbWVudEJ1Y2tldFxuICAgKi9cbiAgbWVhc3VyZW1lbnRCdWNrZXQgOiBcIjBcIixcbn0pO1xuXG4vKipcbiAqIEdlb21ldHJpYyBNZXRob2QgdG8gbWVhc3VyZSBpcyBpbiB2aWV3XG4gKlxuICogQGNsYXNzIEdlb21ldHJpY01ldGhvZFxuICogQGV4dGVuZHMgUmVndWxhckNoZWNrTWV0aG9kXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIGJyb3dzZXJNZWFzdXJlbWVudFxuICogQHN0YXRpY1xuICogQHByaXZhdGVcbiAqL1xudmFyIGJyb3dzZXJNZWFzdXJlbWVudDtcblxuLyoqXG4gKiBAbWV0aG9kIG1lYXN1cmVXZWJraXRcbiAqIEBzdGF0aWNcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIG1lYXN1cmVXZWJraXQocCkge1xuICB2YXIgdiA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfTtcblxuICAvLyBwLnggaXMgdGhlIGFkJ3MgbGVmdCBlZGdlXG4gIC8vIHAueSBpcyB0aGUgYWQncyB0b3AgZWRnZVxuICAvLyBwLnNjcmxYIGlzIHRoZSB2aWV3cG9ydCdzIGxlZnQgZWRnZSAoc2V0IHRvIDAgZm9yIEdlY2tvKVxuICAvLyBwLnNjcmxZIGlzIHRoZSB2aWV3cG9ydCdzIHRvcCBlZGdlIChzZXQgdG8gMCBmb3IgR2Vja28pXG5cbiAgLy8gbGVmdCBoYWxmIG9mIGFkIGlzIGluIHZpZXdwb3J0XG4gIC8vIHRoZSBhZCdzIGxlZnQgZWRnZSBpcyBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgdmlld3BvcnQncyBsZWZ0IGVkZ2UgQU5EXG4gIC8vIHRoZSBtaWRkbGUgb2YgYWQgaXMgb24gdGhlIGxlZnQgb2YgdGhlIHZpZXdwb3J0J3MgcmlnaHQgZWRnZVxuICBpZiAocC54ID49IHAuc2NybFggJiYgcC54ICsgcC5oYWxmV2lkdGggPCBwLnNjcmxYICsgcC52aWV3cG9ydFdpZHRoKSB7XG4gICAgLy8gZGlzdGFuY2UgdG8gcmlnaHQgZWRnZTogdmlld3BvcnQncyByaWdodCBlZGdlIC0gYWQncyBsZWZ0IGVkZ2U7IHZpZXdlcG9ydCdzIHJpZ2h0IGVkZ2UgPSBwLnNjcmxYICsgcC52aWV3cG9ydFdpZHRoXG4gICAgdi54ID0gcC5zY3JsWCArIHAudmlld3BvcnRXaWR0aCAtIHAueDtcbiAgfVxuICAvLyByaWdodCBoYWxmIG9mIGFkIGluIHZpZXdwb3J0XG4gIC8vIHRoZSBtaWRkbGUgb2YgYWQgaXMgb24gdGhlIHJpZ2h0IG9mIHRoZSB2aWV3cG9ydCdzIGxlZnQgZWRnZSBBTkRcbiAgLy8gdGhlIGFkJ3MgcmlnaHQgZWRnZSBpcyBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSB2aWV3cG9ydCdzIHJpZ2h0IGVkZ2VcbiAgZWxzZSBpZiAocC54ICsgcC5oYWxmV2lkdGggPiBwLnNjcmxYICYmIHAueCArIHAuYWRXaWR0aCA8PSBwLnNjcmxYICsgcC52aWV3cG9ydFdpZHRoKSB7XG4gICAgLy8gcGl4ZWxzIGZyb20gdmlld3BvcnQncyBsZWZ0IGVkZ2UgdGhhdCBhcmUgaW4gdmlld1xuICAgIC8vIGFkJ3MgcmlnaHQgZWRnZSBtaW51cyB2aWV3cG9ydCdzIGxlZnQgZWRnZTsgYWQncyByaWdodCBlZGdlID0gcC54ICsgcC5hZFdpZHRoXG4gICAgdi54ID0gcC54ICsgcC5hZFdpZHRoIC0gcC5zY3JsWDtcbiAgfVxuICAvLyB2aWV3cG9ydCBpcyBzbWFsbGVyIHRoYW4gdGhlIGFkXG4gIC8vIGFkJ3MgbGVmdCBlZGdlIGlzIHRvIHRoZSBsZWZ0IG9mIHRoZSB2aWV3cG9ydCdzIGxlZnQgZWRnZSBBTkRcbiAgLy8gYWQncyByaWdodCBlZGdlIGlzIHRvIHRoZSByaWdodCBvZiB0aGUgdmlld3BvcnQncyByaWdodCBlZGdlIEFORFxuICAvLyB0aGUgdmlld3BvcnQgaXMgd2lkZXIgdGhhbiBoYWxmIG9mIHRoZSBhZFxuICBlbHNlIGlmIChwLnggPCBwLnNjcmxYICYmIHAueCArIHAuYWRXaWR0aCA+IHAuc2NybFggKyBwLnZpZXdwb3J0V2lkdGggJiYgcC52aWV3cG9ydFdpZHRoID49IHAuaGFsZldpZHRoKSB7XG4gICAgLy8gdmlld2FibGUgYWRXaWR0aCBpcyB0aGUgdmlld3BvcnQgd2lkdGhcbiAgICB2LnggPSBwLnZpZXdwb3J0V2lkdGg7XG4gIH1cblxuICAvLyB0b3AgaGFsZiBvZiBhZCBpcyBpbiB2aWV3cG9ydFxuICAvLyB0aGUgYWQncyB0b3AgZWRnZSBpcyBiZWxvdyB0aGUgdmlld3BvcnQncyB0b3AgZWRnZSBBTkRcbiAgLy8gdGhlIG1pZGRsZSBvZiBhZCBpcyBhYm92ZSB0aGUgdmlld3BvcnQncyBib3R0b20gZWRnZVxuICBpZiAocC55ID49IHAuc2NybFkgJiYgcC55ICsgcC5oYWxmSGVpZ2h0IDwgcC5zY3JsWSArIHAudmlld3BvcnRIZWlnaHQpIHtcbiAgICAvLyBkaXN0YW5jZSBmcm9tIHRvcCBvZiBhZCB0byBib3R0b20gb2YgdmVpd3BvcnRcbiAgICAvLyB0byByaWdodCBlZGdlOiB2aWV3cG9ydCdzIGJvdHRvbSBlZGdlIC0gYWQncyB0b3AgZWRnZTsgdmlld2Vwb3J0J3MgYm90dG9tIGVkZ2UgPSBwLnNjcmxZICsgcC52aWV3cG9ydEhlaWdodFxuICAgIHYueSA9IHAuc2NybFkgKyBwLnZpZXdwb3J0SGVpZ2h0IC0gcC55O1xuICB9XG4gIC8vIGJvdHRvbSBoYWxmIG9mIGFkIGluIHZpZXdwb3J0XG4gIC8vIHRoZSBtaWRkbGUgb2YgYWQgaXMgYmVsb3cgdGhlIHZpZXdwb3J0J3MgdG9wIGVkZ2UgQU5EXG4gIC8vIHRoZSBhZCdzIGJvdHRvbSBlZGdlIGlzIGFib3ZlIHRoZSB2aWV3cG9ydCdzIGJvdHRvbSBlZGdlXG4gIGVsc2UgaWYgKHAueSArIHAuaGFsZkhlaWdodCA+IHAuc2NybFkgJiYgcC55ICsgcC5hZEhlaWdodCA8PSBwLnNjcmxZICsgcC52aWV3cG9ydEhlaWdodCkge1xuICAgIC8vIHBpeGVscyBmcm9tIHZpZXdwb3J0J3MgdG9wIGVkZ2UgdGhhdCBhcmUgaW4gdmlld1xuICAgIC8vIGFkJ3MgYm90dG9tIGVkZ2UgbWludXMgdmlld3BvcnQncyB0b3AgZWRnZTsgYWQncyBib3R0b20gZWRnZSA9IHAueSArIHAuYWRIZWlnaHRcbiAgICB2LnkgPSBwLnkgKyBwLmFkSGVpZ2h0IC0gcC5zY3JsWTtcbiAgfVxuICAvLyB2aWV3cG9ydCBpcyBzbWFsbGVyIHRoYW4gdGhlIGFkXG4gIC8vIGFkJ3MgdG9wIGVkZ2UgaXMgYWJvdmUgdGhlIHZpZXdwb3J0J3MgdG9wIGVkZ2UgQU5EXG4gIC8vIGFkJ3MgYm90dG9tIGVkZ2UgaXMgYmVsb3cgdGhlIHZpZXdwb3J0J3MgYm90dG9tIGVkZ2UgQU5EXG4gIC8vIHRoZSB2aWV3cG9ydCBpcyB3aWRlciB0aGFuIGhhbGYgb2YgdGhlIGFkXG4gIGVsc2UgaWYgKHAueSA8IHAuc2NybFkgJiYgKHAueSArIHAuYWRIZWlnaHQpID4gcC5zY3JsWSArIHAudmlld3BvcnRIZWlnaHQgJiYgcC52aWV3cG9ydEhlaWdodCA+PSBwLmhhbGZIZWlnaHQpIHtcbiAgICAvLyB2aWV3YWJsZSBhZEhlaWdodCBpcyB0aGUgdmlld3BvcnQgaGVpZ2h0XG4gICAgdi55ID0gcC52aWV3cG9ydEhlaWdodDtcbiAgfVxuXG4gIHJldHVybiB2O1xufVxuXG4vKipcbiAqIEBtZXRob2QgbWVhc3VyZUdlY2tvXG4gKiBAc3RhdGljXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBtZWFzdXJlR2Vja28ocCkge1xuICAvLyBlbnN1cmUgcC5zY3JsWCBhbmQgcC5zY3JsWSBhcmUgc2V0IHRvIHplcm8sIGFuZCBjYWxsIG1lYXN1cmVXZWJraXQgdG8gcmVkdWNlIHJlcGVhdGVkIGNvZGVcbiAgcC5zY3JsWCA9IDA7XG4gIHAuc2NybFkgPSAwO1xuXG4gIHJldHVybiBtZWFzdXJlV2Via2l0KHApO1xufVxuXG4vKipcbiAqIEBtZXRob2Qgc2V0QnJvd3Nlck1lYXN1cmVtZW50XG4gKiBAc3RhdGljXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBzZXRCcm93c2VyTWVhc3VyZW1lbnQoKSB7XG4gIC8vIDEgPT0gQ2hyb21lXG4gIC8vIDIgPT0gRmlyZWZveFxuICAvLyAzID09IE1TSUVcbiAgLy8gNCA9PSBTYWZhcmlcbiAgLy8gNSA9PSBXZWJraXRcbiAgLy8gNiA9PSBHZWNrb1xuICAvLyA3ID09IG90aGVyXG4gIGlmIChicm93c2VySW50ID09PSAxIHx8IGJyb3dzZXJJbnQgPT09IDQgfHwgYnJvd3NlckludCA9PT0gNSB8fCBicm93c2VySW50ID09PSA3KSB7XG4gICAgYnJvd3Nlck1lYXN1cmVtZW50ID0gbWVhc3VyZVdlYmtpdDtcbiAgfSBlbHNlIGlmIChicm93c2VySW50ID09PSAyIHx8IGJyb3dzZXJJbnQgPT09IDMgfHwgYnJvd3NlckludCA9PT0gNikge1xuICAgIGJyb3dzZXJNZWFzdXJlbWVudCA9IG1lYXN1cmVHZWNrbztcbiAgfVxufVxuXG5cbi8qKlxuICogQG1ldGhvZCBjYWxjdWxhdGVcbiAqIEBzdGF0aWNcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZShjb25maWcpIHtcblxuICB2YXIgZnJhbWVDQlIgPSBjb25maWcuYmNyLFxuICAgIGZyYW1lV2lkdGggPSBjb25maWcuYWRXaWR0aCxcbiAgICBmcmFtZUhlaWdodCA9IGNvbmZpZy5hZEhlaWdodCxcbiAgICAvLyBzZXQgZnJhbWVTaXplSW5QaXhlbHMgdG8gMCB3aGVuIGZyYW1lV2lkdGggYW5kL29yIGZyYW1lSGVpZ2h0IGlzIGVpdGhlciB6ZXJvIG9yIHVuZGVmaW5lZC5cbiAgICBmcmFtZVNpemVJblBpeGVscyA9IGZyYW1lV2lkdGggJiYgZnJhbWVIZWlnaHQgPyBmcmFtZVdpZHRoICogZnJhbWVIZWlnaHQgOiAwLFxuICAgIHdQYXJlbnQgPSB3aW4ucGFyZW50LFxuICAgIHBhcmVudERvYyA9IHdQYXJlbnQuZG9jdW1lbnQsXG4gICAgcGFyZW50Qm9keSA9IHBhcmVudERvYy5ib2R5LFxuICAgIGUgPSB7fSxcbiAgICByZXN1bHQ7XG4gIFxuICAvLyBJZiBmcmFtZVNpemVJblBpeGVscyBpcyAwLCB0aGVuIDAgd2lsbCBiZSByZXR1cm5lZC5cbiAgLy8gUmF0aGVyIHRoYW4gc2hvcnQtY2lyY3VpdGluZyBub3csIGxldCdzIGNvbnRpbnVlIGFuZCBzZXQgdGhlIGRlYnVnIGRhdGEsIGlmIGRlYnVnIGlzIGVuYWJsZWQuXG5cbiAgLy8gZmluZCBwb3NpdGlvblxuICBlLnggPSBNYXRoLnJvdW5kKGZyYW1lQ0JSLmxlZnQgKyBwYXJlbnRCb2R5LnNjcm9sbExlZnQpO1xuICBlLnkgPSBNYXRoLnJvdW5kKGZyYW1lQ0JSLnRvcCArIHBhcmVudEJvZHkuc2Nyb2xsVG9wKTtcbiAgZS5hZFdpZHRoID0gZnJhbWVXaWR0aDtcbiAgZS5hZEhlaWdodCA9IGZyYW1lSGVpZ2h0O1xuICBlLmhhbGZXaWR0aCA9IE1hdGguZmxvb3IoZnJhbWVXaWR0aCAvIDIpO1xuICBlLmhhbGZIZWlnaHQgPSBNYXRoLmZsb29yKGZyYW1lSGVpZ2h0IC8gMik7XG4gIC8vIE9uIHNvbWUgYnJvd3NlcnMsIHRoZSBjbGllbnR7V2lkdGgsSGVpZ2h0fSBhcmUgaW5jb3JyZWN0LCBzbyB0aGUgY29tcGFyaXNvbiB0byB3aW5kb3cuaW5uZXJ7V2lkdGgsSGVpZ2h0fSBpcyBuZWVkZWQuXG4gIC8vIE9uIHNvbWUgYnJvd3NlcnMsIHRoZSBjbGllbnR7V2lkdGgsSGVpZ2h0fSBkbyBub3QgaW5jbHVkZSB0aGUgc2Nyb2xsYmFyIHdpZHRoLCBzbyBwaXhlbHMgY292ZXJlZCBieSB0aGUgc2Nyb2xsYmFycyBhcmUgc3RpbGwgY29uc2lkZXJlZCB0byBiZSBpbiB2aWV3XG4gIGUudmlld3BvcnRXaWR0aCA9IE1hdGgubWF4KHBhcmVudERvYy5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsIHdpbi5pbm5lcldpZHRoIHx8IDApO1xuICBlLnZpZXdwb3J0SGVpZ2h0ID0gTWF0aC5tYXgocGFyZW50RG9jLmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsIHdpbi5pbm5lckhlaWdodCB8fCAwKTtcbiAgLy9jaGFuZ2VkIHRoZSBzcGVsbGluZyBvbiBlIHRvIGZhY2lsaXRhdGUgcHJvcGVydGllcyBtYW5nbGluZ1xuICBlLnNjcmxYID0gd1BhcmVudC5zY3JvbGxYO1xuICBlLnNjcmxZID0gd1BhcmVudC5zY3JvbGxZO1xuXG4gIHJlc3VsdCA9IGJyb3dzZXJNZWFzdXJlbWVudChlKTtcblxuICBpZiAocmVzdWx0LnggPiBmcmFtZVdpZHRoKSB7XG4gICAgcmVzdWx0LnggPSBmcmFtZVdpZHRoO1xuICB9XG5cbiAgaWYgKHJlc3VsdC55ID4gZnJhbWVIZWlnaHQpIHtcbiAgICByZXN1bHQueSA9IGZyYW1lSGVpZ2h0O1xuICB9XG5cbiAgLy8gcmV0dXJuIDAgd2hlbiBmcmFtZVNpemVJblBpeGVscyBpcyAwXG4gIHJldHVybiBmcmFtZVNpemVJblBpeGVscyA/IE1hdGgucm91bmQoMTAwICogcmVzdWx0LnggKiByZXN1bHQueSAvIGZyYW1lU2l6ZUluUGl4ZWxzKSA6IDA7XG59XG5cbnZhciBHZW9tZXRyaWNNZXRob2QgPSBSZWd1bGFyQ2hlY2tNZXRob2QuZXh0ZW5kKHtcbiAgLyoqXG4gICAqIEBtZXRob2QgaW5pdFxuICAgKi9cbiAgaW5pdCA6IGZ1bmN0aW9uKCkge1xuICAgIHNldEJyb3dzZXJNZWFzdXJlbWVudCgpO1xuICAgIHRoaXMucmVnaXN0ZXJJblZpZXdMaXN0ZW5lcigpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBNZXRob2QgdG8gZ2V0IGluIHZpZXcgcGVyY2VudGFnZVxuICAgKlxuICAgKiBAbWV0aG9kIGdldEluVmlld1BlcmNlbnRhZ2VcbiAgICogQG1hbmRhdG9yeVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAqL1xuICBnZXRJblZpZXdQZXJjZW50YWdlIDogZnVuY3Rpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBjYWxjdWxhdGUoe1xuICAgICAgICBiY3I6IGFkV3JhcHBlckVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIGFkV2lkdGg6IHdpZHRoLFxuICAgICAgICBhZEhlaWdodDogaGVpZ2h0XG4gICAgICB9LCB0aGlzKTtcbiAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgIC8vY29uc29sZS5sb2coJ2dlb21ldHJpYyBhcHByb2FjaCBmYWlsZWQuICcgKyBleGNlcHRpb24pO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9LFxufSk7XG5cbi8qKlxuICogRGlyZWN0IEdlbW9ldHJpYyBNZXRob2QgdG8gbWVhc3VyZSB2aWV3YWJpbGl0eVxuICpcbiAqIEBjbGFzcyBEaXJlY3RHZW1vZXRyaWNNZXRob2RcbiAqIEBleHRlbmRzIEdlb21ldHJpY01ldGhvZFxuICovXG52YXIgRGlyZWN0R2VvbWV0cmljTWV0aG9kID0gR2VvbWV0cmljTWV0aG9kLmV4dGVuZCh7XG4gIC8qKlxuICAgKiBAbWV0aG9kIGNhbkFwcGx5TWV0aG9kXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBjYW5BcHBseU1ldGhvZCA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAhaXNXZWJWaWV3ICYmICFpc0luRnJhbWU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwcm9wZXJ0eSBtZWFzdXJlbWVudEJ1Y2tldFxuICAgKi9cbiAgbWVhc3VyZW1lbnRCdWNrZXQgOiBcIjZcIixcbn0pO1xuXG4vKipcbiAqIEZyaWVuZGx5IEZyYW1lIG1ldGhvZCB0byBiZSB1c2VkIHdoZW4gYWQgaXMgaW4gYW4gaWZyYW1lIHdpdGggYWNjZXNzIHRvIHBhcmVudCB3aW5kb3dcbiAqXG4gKiBAY2xhc3MgRnJpZW5kbHlGcmFtZUdlb21ldHJpY01ldGhvZFxuICogQGV4dGVuZHMgR2VvbWV0cmljTWV0aG9kXG4gKi9cbnZhciBGcmllbmRseUZyYW1lR2VvbWV0cmljTWV0aG9kID0gR2VvbWV0cmljTWV0aG9kLmV4dGVuZCh7XG4gIC8qKlxuICAgKiBAbWV0aG9kIGNhbkFwcGx5TWV0aG9kXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBjYW5BcHBseU1ldGhvZCA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAhaXNXZWJWaWV3ICYmIGhhc1RvcEFjY2VzcyAmJiBpc09uZUxldmVsRG93bjtcbiAgfSxcblxuICAvKipcbiAgICogQHByb3BlcnR5IG1lYXN1cmVtZW50QnVja2V0XG4gICAqL1xuICBtZWFzdXJlbWVudEJ1Y2tldCA6IFwiMlwiLFxufSk7XG5cbi8qKlxuICogU2FmZSBmcmFtZSBtZXRob2QgaW4gY3Jvc3MgZG9tYWluIGNhc2VzIHdoZXJlIHRoZSBpZnJhbWUgaGFzIG5vIGFjY2VzcyB0byBwYXJlbnQgd2luZG93XG4gKlxuICogQGNsYXNzIFNhZmVGcmFtZU1ldGhvZFxuICogQGV4dGVuZHMgUmVndWxhckNoZWNrTWV0aG9kXG4gKi9cbnZhciBTYWZlRnJhbWVNZXRob2QgPSBSZWd1bGFyQ2hlY2tNZXRob2QuZXh0ZW5kKHtcbiAgLyoqXG4gICAqIFRpbWVvdXQgdXNlZCB0byBjaGVjayB3aGVuIGFkIGNvbWVzIGluIHZpZXdcbiAgICpcbiAgICogQHByb3BlcnR5IGZpbmVUaW1lb3V0XG4gICAqIEBkZWZhdWx0IDc1MFxuICAgKi9cbiAgY29hcnNlVGltZW91dCA6IEZJTkVfVElNRU9VVF9ERUZBVUxULFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGNhbkFwcGx5TWV0aG9kXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBjYW5BcHBseU1ldGhvZCA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAhaXNXZWJWaWV3ICYmIGlzU2FmZUZyYW1lO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGdldEluVmlld1BlcmNlbnRhZ2VcbiAgICogQHJldHVybiB7TnVtYmVyfVxuICAgKi9cbiAgZ2V0SW5WaWV3UGVyY2VudGFnZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpbi4kc2YuZXh0W0lOX1ZJRVdfUEVSQ0VOVEFHRV0oKTtcbiAgfSxcblxuICAvKipcbiAgICogQHByb3BlcnR5IG1lYXN1cmVtZW50QnVja2V0XG4gICAqL1xuICBtZWFzdXJlbWVudEJ1Y2tldCA6IFwiMVwiLFxufSk7XG5cbi8qKlxuICogTWV0aG9kIHRvIGJlIHJ1biBvbiBmaXJlIGZveCBvbiBjcm9zcyBkb21haW4gY2FzZXMgd2hpY2ggdXNlcyBwYWludCBjYWxscyB0byBnZXQgaW4gdmlldyBwZXJjZW50YWdlXG4gKlxuICogQGNsYXNzIEZpcmVmb3hQYWludE1ldGhvZFxuICogQGV4dGVuZHMgUmVndWxhckNoZWNrTWV0aG9kXG4gKi9cblxuXG4vKipcbiAqIEBtZXRob2QgY3JlYXRlSUZyYW1lVGFnXG4gKiBAcHJpdmF0ZVxuICogQHN0YXRpY1xuICogQHBhcmFtIGZmTWV0aG9kIHtGaXJlZm94UGFpbnRNZXRob2R9XG4gKiBAcGFyYW0gaWQge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlSUZyYW1lVGFnKGZmTWV0aG9kLCBpZCkge1xuICB2YXIgdGFnLFxuICAgIHh5ID0gaWQuc3BsaXQoJ18nKTtcblxuICBpZiAoeHkubGVuZ3RoID09PSAyKSB7XG4gICAgdGFnID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIHRhZy5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOicgKyBUQUdfU0laRSArICdweDtoZWlnaHQ6JyArIFRBR19TSVpFICsgJ3B4O2xlZnQ6JyArIHh5WzBdICsgJ3B4O3RvcDonICsgeHlbMV0gKyAncHg7cG9zaXRpb246YWJzb2x1dGU7YmFja2dyb3VuZC1jb2xvcjp0cmFuc3BhcmVudDsnO1xuICAgIHRhZy5zY3JvbGxpbmcgPSAnbm8nO1xuICAgIHRhZy5hbGxvd3RyYW5zcGFyZW5jeSA9ICd0cnVlJztcbiAgICB0YWcuaGlkZWZvY3VzID0gJ3RydWUnO1xuICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ2ZyYW1lQm9yZGVyJywgJzAnKTtcbiAgICB0YWcuaWQgPSBpZDtcbiAgICBmZk1ldGhvZC5sYXN0TW96UGFpbnRDb3VudHNbaWRdID0gMDsgLy8gcmVnaXN0ZXIgaWRcbiAgICBmZk1ldGhvZC5wYWludENvdW50c1tpZF0gPSAwOyAvLyByZWdpc3RlciBpZFxuICAgIGZmTWV0aG9kLnBhaW50VGltZXN0YW1wc1tpZF0gPSAwOyAvLyByZWdpc3RlciBpZFxuICAgIGZmTWV0aG9kLmxhc3RQYWludENvdW50c1tpZF0gPSAwOyAvLyByZWdpc3RlciBpZFxuICAgIGZmTWV0aG9kLmxhc3RQYWludFRpbWVzdGFtcHNbaWRdID0gMDsgLy8gcmVnaXN0ZXIgaWRcbiAgfVxuXG4gIHJldHVybiB0YWc7XG59XG5cbi8qKlxuICogQG1ldGhvZCBhcHBlbmRUYWdzXG4gKiBAcHJpdmF0ZVxuICogQHN0YXRpY1xuICogQHBhcmFtIGZmTWV0aG9kIHtGaXJlZm94UGFpbnRNZXRob2R9XG4gKi9cbmZ1bmN0aW9uIGFwcGVuZFRhZ3MoZmZNZXRob2QpIHtcbiAgdmFyIGk7XG5cbiAgZmZNZXRob2QudGFncyA9IGdldFRhZ0Nvb3JkaW5hdGVzKHdpZHRoLCBoZWlnaHQpO1xuICBmZk1ldGhvZC5udW1UYWcgPSBmZk1ldGhvZC50YWdzLmxlbmd0aDtcbiAgZmZNZXRob2QudGFnQXJyYXkgPSBbXTtcbiAgLy8gY3JlYXRlIGFsbCB0aGUgdGFncyBhbmQga2VlcCB0aGVtIGluIGFuIGFycmF5ICh0aGUgYXJyYXkgd2lsbCBiZSB1c2VkIHRvIHJlbW92ZSB0aGVtIGFmdGVyIGZpcmluZyB0aGUgYmVhY29uKVxuICBmb3IgKGkgPSAwOyBpIDwgZmZNZXRob2QubnVtVGFnOyBpKyspIHtcbiAgICBmZk1ldGhvZC50YWdBcnJheS5wdXNoKGNyZWF0ZUlGcmFtZVRhZyhmZk1ldGhvZCwgZmZNZXRob2QudGFnc1tpXSkpO1xuICB9XG5cbiAgLy8gYWRkIGVhY2ggZWxlbWVudCB0byB0aGUgRE9NXG4gIGZvciAoaSA9IDA7IGkgPCBmZk1ldGhvZC5udW1UYWc7IGkrKykge1xuICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKGZmTWV0aG9kLnRhZ0FycmF5W2ldKTtcbiAgfVxufVxuXG4vKipcbiAqIEBtZXRob2QgdG9nZ2xlVGFnVmlzaWJpbGl0eVxuICogQHByaXZhdGVcbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSBmZk1ldGhvZCB7RmlyZWZveFBhaW50TWV0aG9kfVxuICogQHBhcmFtIGlkIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIHRvZ2dsZVRhZ1Zpc2liaWxpdHkoZmZNZXRob2QsIGlkKSB7XG4gIHZhciB0YWcgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICBpZiAodGFnKSB7XG4gICAgdGFnLnN0eWxlLnZpc2liaWxpdHkgPSB0YWcuc3R5bGUudmlzaWJpbGl0eSA9PT0gSElEREVOX1NUUklORyA/IFZJU0lCTEVfU1RSSU5HIDogSElEREVOX1NUUklORztcbiAgfVxufVxuXG4vKipcbiAqIEBtZXRob2Qgd2FpdEZvclVwZGF0ZWRUaW1lc3RhbXBcbiAqIEBwcml2YXRlXG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gZmZNZXRob2Qge0ZpcmVmb3hQYWludE1ldGhvZH1cbiAqIEBwYXJhbSB0aW1lc3RhbXAge051bWJlcn1cbiAqIEBwYXJhbSBpZCB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiB3YWl0Rm9yVXBkYXRlZFRpbWVzdGFtcChmZk1ldGhvZCwgdGltZXN0YW1wLCBpZCkge1xuICB2YXIgbW96UGFpbnRXaW5kb3csXG4gICAgdGFnO1xuXG4gIGZmTWV0aG9kLnBhaW50VGltZXN0YW1wc1tpZF0gPSB0aW1lc3RhbXA7XG5cbiAgaWYgKHRpbWVzdGFtcCA+IGZmTWV0aG9kLmxhc3RQYWludFRpbWVzdGFtcHNbaWRdKSB7XG4gICAgdGFnID0gZG9jLmdldEVsZW1lbnRCeUlkKGlkKTtcblxuICAgIGlmICh0YWcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG1velBhaW50V2luZG93ID0gdGFnLmNvbnRlbnRXaW5kb3c7XG5cbiAgICAgICAgaWYgKCFtb3pQYWludFdpbmRvdy5kb2N1bWVudCkge1xuICAgICAgICAgIG1velBhaW50V2luZG93ID0gTlVMTDtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgbW96UGFpbnRXaW5kb3cgPSBOVUxMO1xuICAgICAgfVxuICAgICAgaWYgKG1velBhaW50V2luZG93ICYmIG1velBhaW50V2luZG93Lm1velBhaW50Q291bnQgPiBmZk1ldGhvZC5sYXN0TW96UGFpbnRDb3VudHNbaWRdKSB7XG4gICAgICAgIGZmTWV0aG9kLnBhaW50Q291bnRzW2lkXSArPSAxO1xuICAgICAgICBmZk1ldGhvZC5sYXN0TW96UGFpbnRDb3VudHNbaWRdID0gbW96UGFpbnRXaW5kb3cubW96UGFpbnRDb3VudDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAbWV0aG9kIGFuaW1hdGVcbiAqIEBwcml2YXRlXG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gZmZNZXRob2Qge0ZpcmVmb3hQYWludE1ldGhvZH1cbiAqIEBwYXJhbSBpZCB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBhbmltYXRlKGZmTWV0aG9kLCBpZCkge1xuICB2YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luLnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW4ubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IE5VTEw7XG5cbiAgdG9nZ2xlVGFnVmlzaWJpbGl0eShmZk1ldGhvZCwgaWQpO1xuXG4gIGlmIChyZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgICB3YWl0Rm9yVXBkYXRlZFRpbWVzdGFtcChmZk1ldGhvZCwgdGltZXN0YW1wLCBpZCk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAbWV0aG9kIHBhaW50XG4gKiBAcHJpdmF0ZVxuICogQHN0YXRpY1xuICogQHBhcmFtIGZmTWV0aG9kIHtGaXJlZm94UGFpbnRNZXRob2R9XG4gKi9cbmZ1bmN0aW9uIHBhaW50KGZmTWV0aG9kKSB7XG4gIHZhciBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBmZk1ldGhvZC5udW1UYWc7IGkrKykge1xuICAgIGFuaW1hdGUoZmZNZXRob2QsIGZmTWV0aG9kLnRhZ3NbaV0pO1xuICB9XG59XG5cbi8qKlxuICogdXBkYXRlIHBhaW50IGNvdW50cyBhbmQgcGFpbnQgdGltZXN0YW1wc1xuICogQG1ldGhvZCB1cGRhdGVQYWludENvdW50c1xuICogQHN0YXRpY1xuICogQHByaXZhdGVcbiAqIEBwYXJhbSAge0ZpcmVmb3hQYWludE1ldGhvZH0gZmZNZXRob2RcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgbnVtYmVyIG9mIHRhZ3MgcGFpbnRlZFxuICovXG5mdW5jdGlvbiB1cGRhdGVQYWludENvdW50cyAoZmZNZXRob2QpIHtcbiAgdmFyIGksXG4gICAgaWQsXG4gICAgbnVtUGFpbnQgPSAwO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBmZk1ldGhvZC5udW1UYWc7IGkrKykge1xuICAgIGlkID0gZmZNZXRob2QudGFnc1tpXTtcbiAgICBpZiAoZmZNZXRob2QucGFpbnRUaW1lc3RhbXBzW2lkXSA+IGZmTWV0aG9kLmxhc3RQYWludFRpbWVzdGFtcHNbaWRdKSB7XG4gICAgICBpZiAoZmZNZXRob2QucGFpbnRDb3VudHNbaWRdID4gZmZNZXRob2QubGFzdFBhaW50Q291bnRzW2lkXSkge1xuICAgICAgICBudW1QYWludCArPSAxO1xuICAgICAgfVxuICAgICAgZmZNZXRob2QubGFzdFBhaW50Q291bnRzW2lkXSA9IGZmTWV0aG9kLnBhaW50Q291bnRzW2lkXTtcbiAgICAgIGZmTWV0aG9kLmxhc3RQYWludFRpbWVzdGFtcHNbaWRdID0gZmZNZXRob2QucGFpbnRUaW1lc3RhbXBzW2lkXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVtUGFpbnQ7XG59XG5cbnZhciBGaXJlZm94UGFpbnRNZXRob2QgPSBSZWd1bGFyQ2hlY2tNZXRob2QuZXh0ZW5kKHtcbiAgLyoqXG4gICAqIEBtZXRob2QgY2FuQXBwbHlNZXRob2RcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGNhbkFwcGx5TWV0aG9kIDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICFpc1dlYlZpZXcgJiYgKCdtb3pQYWludENvdW50JyBpbiB3aW4pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBJbml0IGZ1bmN0aW9uIHRoYXQgc2V0cyB1cCBlbGVtZW50cyBmb3IgcGFpbnQgY2FsbHMgYW5kIHN0YXJ0cyB0aGUgdmlld2FiaWxpdHkgY2FsdWNsYXRpb25zLlxuICAgKlxuICAgKiBAbWV0aG9kIGluaXRcbiAgICovXG4gIGluaXQgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmxhc3RNb3pQYWludENvdW50cyA9IHt9O1xuICAgIHRoaXMucGFpbnRDb3VudHMgPSB7fTtcbiAgICB0aGlzLnBhaW50VGltZXN0YW1wcyA9IHt9O1xuICAgIHRoaXMubGFzdFBhaW50Q291bnRzID0ge307XG4gICAgdGhpcy5sYXN0UGFpbnRUaW1lc3RhbXBzID0ge307XG5cbiAgICBhcHBlbmRUYWdzKHRoaXMpO1xuICAgIHBhaW50KHRoaXMpO1xuXG4gICAgdGhpcy5yZWdpc3RlckluVmlld0xpc3RlbmVyKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGluIHZpZXcgcGVyY2VudGFnZSBiYXNlZCBvbiBwYWludCBjb3VudHNcbiAgICpcbiAgICogQG1ldGhvZCBnZXRJblZpZXdQZXJjZW50YWdlXG4gICAqIEByZXR1cm4ge051bWJlcn1cbiAgICovXG4gIGdldEluVmlld1BlcmNlbnRhZ2UgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbnVtUGFpbnQgPSB1cGRhdGVQYWludENvdW50cyh0aGlzKTtcbiAgICBwYWludCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5udW1UYWcgPyAoMTAwLjAgKiBudW1QYWludCAvIHRoaXMubnVtVGFnKSA6IDA7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFdyYXBwZXIgTWV0aG9kIHRvIHN0YXJ0IGEgdGltZXIgd2hlbiBhZCBpcyBub3QgaW4gdmlld1xuICAgKlxuICAgKiBAbXRob2Qgbm90SW5WaWV3VGltZXJXcmFwcGVyXG4gICAqL1xuICBub3RJblZpZXdUaW1lcldyYXBwZXIgOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHBhaW50KHRoYXQpO1xuICAgICAgdGhhdC50aW1lb3V0ID0gc2V0VGltZW91dChjYWxsYmFjaywgMC41ICogdGhhdC5jb2Fyc2VUaW1lb3V0KTtcbiAgICB9LCAwLjUgKiB0aGlzLmNvYXJzZVRpbWVvdXQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBXcmFwcGVyIE1ldGhvZCB0byBzdGFydCBhIHRpbWVyIHdoZW4gYWQgaXMgaW4gdmlld1xuICAgKlxuICAgKiBAbXRob2QgaW5WaWV3VGltZXJXcmFwcGVyXG4gICAqL1xuICBpblZpZXdUaW1lcldyYXBwZXIgOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHBhaW50KHRoYXQpO1xuICAgICAgdGhhdC50aW1lb3V0ID0gc2V0VGltZW91dChjYWxsYmFjaywgMC41ICogdGhhdC5maW5lVGltZW91dCk7XG4gICAgfSwgMC41ICogdGhpcy5maW5lVGltZW91dCk7XG4gIH0sXG5cbiAgcmVtb3ZlVGFncyA6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW1UYWc7IGkrKykge1xuICAgICAgZG9jLmJvZHkucmVtb3ZlQ2hpbGQodGhpcy50YWdBcnJheVtpXSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBNZXRob2QgdG8gY2xlYW51cCBlbGVtZW50cyBhbmQgb3RoZXIgbGlzdGVuZXJzIGNyZWF0ZWQgYnkgdGhlIG1ldGhvZFxuICAgKlxuICAgKiBAbWV0aG9kIGNsZWFudXBcbiAgICovXG4gIGNsZWFudXAgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnN0cnVjdG9yLnBhcmVudC5wcm90b3R5cGUuY2xlYW51cC5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5yZW1vdmVUYWdzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgZ3JpZFxuICAgKlxuICAgKiBAbWV0aG9kIHJlc2V0XG4gICAqL1xuICByZXNldCA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlVGFncygpO1xuICAgIGFwcGVuZFRhZ3ModGhpcyk7XG4gIH0sXG5cbiAgbWVhc3VyZW1lbnRCdWNrZXQgOiBcIjNcIixcbn0pO1xuXG4vKmdsb2JhbCBzd2ZvYmplY3QqL1xuLyoqXG4gKiBGbGFzaCBtZXRob2QgdG8gYmUgdXNlZCBpbiBjcm9zcyBkb21haW4gYW5kIGlmcmFtZSBoYXMgbm8gYWNjZXNzIHRvIHBhcmVudFxuICpcbiAqIEBjbGFzcyBGbGFzaE1lYXN1cmVtZW50TWV0aG9kXG4gKiBAZXh0ZW5kcyBSZWd1bGFyQ2hlY2tNZXRob2RcbiAqL1xuXG5cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgbnVtYmVyIG9mIHRhZ3MgY3VycmVudGx5IHZpc2libGVcbiAqIEBtZXRob2QgY291bnRJblZpZXdcbiAqIEBzdGF0aWNcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0ZsYXNoTWVhc3VyZW1lbnRNZXRob2R9IGZsTWV0aG9kXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBudW1iZXIgb2Ygdmlld2FibGUgdGFnc1xuICovXG5mdW5jdGlvbiBjb3VudEluVmlldyhmbE1ldGhvZCkge1xuICB2YXIgaSA9IDAsXG4gICAgbnVtUGFpbnQgPSAwO1xuXG4gIGlmICh0YWJJc0FjdGl2ZShmbE1ldGhvZCkpIHtcblxuICAgIGZvciAoOyBpIDwgZmxNZXRob2QubnVtVGFnOyBpKyspIHtcblxuICAgICAgaWYgKGlzRmxhc2hQYWludGVkKGZsTWV0aG9kLCBpKSkge1xuICAgICAgICBudW1QYWludCsrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudW1QYWludDtcbn1cblxuLyoqXG4gKiBHZXQgZmxhc2ggb2JqZWN0IGJ5IGlkXG4gKlxuICogQG1ldGhvZCBmbGFzaEdldE9iamVjdEJ5SWRcbiAqIEBwYXJhbSB7U3RyaW5nfSBvYmplY3RJZFN0clxuICogQHJldHVybiB7RE9NRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gZmxhc2hHZXRPYmplY3RCeUlkKG9iamVjdElkU3RyKSB7XG4gIHZhciByZXR1cm5Ob2RlID0gbnVsbDtcbiAgdmFyIG9iamVjdCA9IGRvYy5nZXRFbGVtZW50QnlJZChvYmplY3RJZFN0cik7XG5cbiAgaWYgKG9iamVjdCAmJiBvYmplY3Qubm9kZU5hbWUgPT09IFwiT0JKRUNUXCIpIHtcbiAgICBpZiAodHlwZW9mIG9iamVjdC5TZXRWYXJpYWJsZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgcmV0dXJuTm9kZSA9IG9iamVjdDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXIgbm9kZSA9IG9iamVjdC5nZXRFbGVtZW50c0J5VGFnTmFtZShPQkpFQ1QpWzBdO1xuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuTm9kZSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXR1cm5Ob2RlO1xufVxuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gZGV0ZXJtaW5lIGlmIGZsYXNoIG9iamVjdCBpcyB2aXNpYmxlXG4gKlxuICogQG1ldGhvZCBpc0ZsYXNoUGFpbnRlZFxuICogQHN0YXRpY1xuICogQHByaXZhdGVcbiAqIEBwYXJhbSAge0ZsYXNoTWVhc3VyZW1lbnRNZXRob2R9IGZsTWV0aG9kXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGluZGV4IFRoZSB0YWcgaW5kZXggKG1hcHMgdG8gYSBzcGVjaWZpYyBpZCAxID0gRGFybGExKVxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICBUaGUgdHJ1ZSBvciBmYWxzZSB2YWx1ZVxuICovXG5mdW5jdGlvbiBpc0ZsYXNoUGFpbnRlZChmbE1ldGhvZCwgaW5kZXgpIHtcbiAgdmFyIG1pblBhaW50LFxuICAgIHJlY3QgPSBmbGFzaEdldE9iamVjdEJ5SWQoJ0RhcmxhJyArIGluZGV4KTtcblxuICBpZiAocmVjdCAmJiByZWN0LmpzQ2FsbGJhY2spIHtcbiAgICBtaW5QYWludCA9IGZsTWV0aG9kLm1pbkZsYXNoUGFpbnRDYWxsc1tmbE1ldGhvZC5pc0N1cnJlbnRseUluVmlldyA/ICdmaW5lJyA6ICdjb2Fyc2UnXTtcblxuICAgIHJldHVybiByZWN0LmpzQ2FsbGJhY2soJ2NvdW50JykgPiBtaW5QYWludDtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBvciBub3QgdGhlIGN1cnJlbnQgYnJvd3NlciB0YWIgaXMgYWN0dWFsbHkgYWN0aXZlIG9yIG5vdFxuICpcbiAqIE5vdGU6XG4gKiBXZSB1c2UgdGhlIGBQYWdlIFZpc2liaWxpdHkgQVBJYCBmb3IgSUUxMCsgYW5kIGFsbCBvdGhlciBtb2Rlcm4gYnJvd3NlcnNcbiAqXG4gKiBAbWV0aG9kIHRhYklzQWN0aXZlXG4gKiBAc3RhdGljXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtICB7Rmxhc2hNZWFzdXJlbWVudE1ldGhvZH0gZmxNZXRob2RcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFRoZSB0cnVlIG9yIGZhbHNlIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHRhYklzQWN0aXZlKGZsTWV0aG9kKSB7XG4gIHZhciBhY3R1YWxUaW1lb3V0QW1vdW50LFxuICAgIGV4cGVjdGVkVGltZW91dEFtb3VudDtcblxuICBpZiAoZmxNZXRob2QudGFiVmlzaWJpbGl0eVN0YXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZmxNZXRob2QudGFiVmlzaWJpbGl0eVN0YXRlO1xuICB9XG5cbiAgYWN0dWFsVGltZW91dEFtb3VudCA9IGZsTWV0aG9kLmN1cnJlbnRUaW1lc3RhbXAgLSBmbE1ldGhvZC5wcmV2aW91c1RpbWVzdGFtcDtcbiAgZXhwZWN0ZWRUaW1lb3V0QW1vdW50ID0gZmxNZXRob2QuaXNDdXJyZW50bHlJblZpZXcgPyBmbE1ldGhvZC5maW5lVGltZW91dCA6IGZsTWV0aG9kLmNvYXJzZVRpbWVvdXQ7XG5cbiAgLy9UT0RPIHdoYXQgaXMgdGhpcyBjaGVjayA/XG4gIHJldHVybiBhY3R1YWxUaW1lb3V0QW1vdW50IC8gZXhwZWN0ZWRUaW1lb3V0QW1vdW50IDwgNTtcbn1cblxuXG5cbi8qKlxuICogQG1ldGhvZCBsaXN0ZW5lcnNcbiAqIEBzdGF0aWNcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0ZsYXNoTWVhc3VyZW1lbnRNZXRob2R9IGZsTWV0aG9kXG4gKiBCaW5kcyB0byBldmVudCBoZWxwZXJzIChlLmcuIHBhZ2UgdmlzaWJpbGl0eSBmb3IgbW9kZXJuIGJyb3dzZXJzKVxuICovXG5mdW5jdGlvbiBsaXN0ZW5lcnMoZmxNZXRob2QpIHtcbiAgLy8gVE9ETyA6IHNob3VsZCBiZSBhIGNhbGwgdG8gaGFuZGxlVmlzQ2hhbmdlXG4gIC8vIHNldCB2aXNpYmlsaXR5IHRvIHRydWVcbiAgZmxNZXRob2QudGFiVmlzaWJpbGl0eVN0YXRlID0gdHJ1ZTtcbiAgLy8gSGFuZGxlIHBhZ2UgdmlzaWJpbGl0eSBjaGFuZ2VcbiAgcmVnaXN0ZXJMaXN0ZW5lcih2aXNpYmlsaXR5Q2hhbmdlLCBmdW5jdGlvbigpIHtcbiAgICBmbE1ldGhvZC50YWJWaXNpYmlsaXR5U3RhdGUgPSAhZG9jW2hpZGRlbl07XG4gIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBGbGFzaCB0YWdcbiAqIEBtZXRob2QgY3JlYXRlRmxhc2hUYWdcbiAqIEBzdGF0aWNcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gIHtTdHJpbmd9ICBjb29yZHMgICAgVGhlIFgvWSBwb3NpdGlvbiBvZiB0aGUgdGFnXG4gKiBAcGFyYW0gIHtTdHJpbmd9ICBpZCAgICAgICAgVGhlIHVuaXF1ZSBJZCBmb3IgdGhlIHRhZ1xuICogQHJldHVybiB7RWxlbWVudH0gICAgICAgICAgIFRoZSB0YWcgZWxlbWVudFxuICovXG5mdW5jdGlvbiBjcmVhdGVGbGFzaFRhZyhjb29yZHMsIGlkKSB7XG4gIHZhciBvdXRlclRhZyA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICBpbm5lclRhZyA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICB4eSA9IGNvb3Jkcy5zcGxpdCgnXycpO1xuXG4gIGlubmVyVGFnLmlkID0gaWQ7XG5cbiAgb3V0ZXJUYWcuc3R5bGUuY3NzVGV4dCA9ICd3aWR0aDogJyArIFRBR19TSVpFICsgJ3B4OyBoZWlnaHQ6ICcgKyBUQUdfU0laRSArICdweDsgbGVmdDogJyArIHh5WzBdICsgJ3B4OyB0b3A6ICcgKyB4eVsxXSArICdweDsgcG9zaXRpb246IGFic29sdXRlOyBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsgZmlsdGVyOiBhbHBoYShvcGFjaXR5PTEwKTsgb3BhY2l0eTogMC4xOyc7XG4gIG91dGVyVGFnLmNsYXNzbmFtZSA9ICdvdXRlcic7XG4gIG91dGVyVGFnLmFwcGVuZENoaWxkKGlubmVyVGFnKTtcblxuICByZXR1cm4gb3V0ZXJUYWc7XG59XG5cbi8qKlxuICogUmVuZGVycyB0aGUgRmxhc2ggdGFncyBjb250YWluZXIgYW5kIGFwcGVuZHMgdGhlIGZsYXNoIHRhZ3MgdG8gaXRcbiAqXG4gKiBOb3RlczpcbiAqIGluc3RhbGxlciAtIGZvciBleHByZXNzIGluc3RhbGwgc2V0IHZhbHVlIHRvIGBwbGF5ZXJQcm9kdWN0SW5zdGFsbC5zd2ZgLCBvdGhlcndpc2UgbGVhdmUgYmxhbmtcbiAqIHZlcnNpb24gICAtIGZvciB2ZXJzaW9uIGRldGVjdGlvbiwgc2V0IHRvIG1pbmltdW0gcmVxdWlyZWQgRmxhc2ggUGxheWVyIHZlcnNpb24sIG9yIDAgKG9yIDAuMC4wKSwgZm9yIG5vIHZlcnNpb24gZGV0ZWN0aW9uXG4gKlxuICogQG1ldGhvZCBhcHBlbmRGbGFzaFRhZ3NcbiAqIEBzdGF0aWNcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0ZsYXNoTWVhc3VyZW1lbnRNZXRob2R9IGZsTWV0aG9kXG4gKi9cbmZ1bmN0aW9uIGFwcGVuZEZsYXNoVGFncyhmbE1ldGhvZCkge1xuICB2YXIgZmxhc2h2YXJzID0ge30sXG4gICAgaSxcbiAgICBpbnN0YWxsZXIgPSBZSU1HX1VSTCArICdwbGF5ZXJQcm9kdWN0SW5zdGFsbC5zd2YnLFxuICAgIHBhcmFtcyA9IHtcbiAgICAgIGFsbG93ZnVsbHNjcmVlbjogJ2ZhbHNlJyxcbiAgICAgIGFsbG93c2NyaXB0YWNjZXNzOiAnYWx3YXlzJyxcbiAgICAgIGJnY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgIHF1YWxpdHk6ICdoaWdoJyxcbiAgICAgIHdtb2RlOiAndHJhbnNwYXJlbnQnXG4gICAgfSxcbiAgICB2ZXJzaW9uJCQxID0gJzExLjQuMCcsXG4gICAgaWQsXG4gICAgYXR0cmlidXRlcyxcbiAgICB0YWc7XG5cbiAgZmxNZXRob2QudGFncyA9IGdldFRhZ0Nvb3JkaW5hdGVzKHdpZHRoLCBoZWlnaHQpO1xuICBmbE1ldGhvZC5udW1UYWcgPSBmbE1ldGhvZC50YWdzLmxlbmd0aDtcbiAgZmxNZXRob2QudGFnQXJyYXkgPSBbXTtcbiAgLy8gY3JlYXRlIGFsbCB0aGUgdGFncyBhbmQga2VlcCB0aGVtIGluIGFuIGFycmF5ICh0aGUgYXJyYXkgd2lsbCBiZSB1c2VkIHRvIHJlbW92ZSB0aGVtIGFmdGVyIGZpcmluZyB0aGUgYmVhY29uKVxuICBmb3IgKGkgPSAwOyBpIDwgZmxNZXRob2QubnVtVGFnOyBpKyspIHtcbiAgICBpZCA9ICdEYXJsYScgKyBpO1xuICAgIGF0dHJpYnV0ZXMgPSB7XG4gICAgICBhbGlnbjogJ21pZGRsZScsXG4gICAgICBpZDogaWQsXG4gICAgICBuYW1lOiBpZCxcbiAgICAgIHN0eWxlOiAnaGVpZ2h0OiAxcHg7IGxlZnQ6IDUwJTsgbWFyZ2luOiAtMXB4IDAgMCAtMXB4OyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogNTAlOyB3aWR0aDogMXB4OydcbiAgICB9O1xuXG4gICAgdGFnID0gY3JlYXRlRmxhc2hUYWcoZmxNZXRob2QudGFnc1tpXSwgaWQpO1xuICAgIGZsTWV0aG9kLnRhZ0FycmF5LnB1c2godGFnKTtcbiAgICBkb2MuYm9keS5hcHBlbmRDaGlsZCh0YWcpO1xuXG4gICAgc3dmb2JqZWN0LmVtYmVkU1dGKFlJTUdfVVJMICsgJ0RhcmxhLnN3ZicsIGlkLCAxLCAxLCB2ZXJzaW9uJCQxLCBpbnN0YWxsZXIsIGZsYXNodmFycywgcGFyYW1zLCBhdHRyaWJ1dGVzKTtcbiAgfVxuXG4gIC8vIHJlbmRlciBmbGFzaENvbnRlbnQgZGl2IGluIGNhc2UgaXQgaXMgbm90IHJlcGxhY2VkIHdpdGggYSBzd2Ygb2JqZWN0XG4gIHN3Zm9iamVjdC5jcmVhdGVDU1MoJyNmbGFzaENvbnRlbnQnLCAnZGlzcGxheTogYmxvY2s7IHRleHQtYWxpZ246IGxlZnQ7Jyk7XG59XG5cbi8qKlxuICogU2V0dXAgZmxhc2ggdGFncyBjb250YWluZXIgYW5kIGJlZ2luIHRyYWNraW5nIHRhZyBlbGVtZW50c1xuICpcbiAqIEBtZXRob2QgbG9hZFN3Zm9iamVjdEludGVydmFsXG4gKiBAc3RhdGljXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGbGFzaE1lYXN1cmVtZW50TWV0aG9kfSBmbE1ldGhvZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gbG9hZFN3Zm9iamVjdEludGVydmFsKGZsTWV0aG9kLCBjYWxsYmFjaykge1xuICB2YXIgcmVjdCA9IGZsYXNoR2V0T2JqZWN0QnlJZCgnRGFybGEwJyksXG4gICAgY3VyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gIGlmIChyZWN0ICYmIHJlY3QuanNDYWxsYmFjaykge1xuICAgIGNsZWFySW50ZXJ2YWwobG9hZFN3Zm9iamVjdEludGVydmFsLmhvb2spO1xuICAgIGZsTWV0aG9kLmxhc3RUaW1lc3RhbXAgPSBjdXJUaW1lO1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cbiAgZWxzZSBpZiAoY3VyVGltZSAtIGxvYWRTd2ZvYmplY3RJbnRlcnZhbC50aW1lID49IEZMQVNIX1RBR1NfTE9BRF9USU1FT1VUKSB7XG4gICAgY2xlYXJJbnRlcnZhbChsb2FkU3dmb2JqZWN0SW50ZXJ2YWwuaG9vayk7XG4gICAgLy91c2VyIGRpZG50IHdoaXRlbGlzdCBmbGFzaCBpbiB0aW1lXG4gICAgZmxNZXRob2QubWFya0ZsYXNoTm90U3VwcG9ydGVkKHRydWUpO1xuICB9XG59XG5cblxudmFyIEZsYXNoTWVhc3VyZW1lbnRNZXRob2QgPSBSZWd1bGFyQ2hlY2tNZXRob2QuZXh0ZW5kKHtcbiAgLyoqXG4gICAqIEBtZXRob2QgY2FuQXBwbHlNZXRob2RcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGNhbkFwcGx5TWV0aG9kIDogZnVuY3Rpb24oKSB7XG4gICAgLy9yZXR1cm4gIWlzV2ViVmlldyAmJiAoYnJvd3NlciA9PT0gJ2Nocm9tZScgfHwgYnJvd3NlciA9PT0gJ21zaWUnIHx8IGJyb3dzZXIgPT09ICd0cmlkZW50JyB8fCBicm93c2VyID09PSAnb3BlcmEnKTsgLy8gYnJvd3NlciA9PT0gJ3NhZmFyaSdcbiAgICByZXR1cm4gIWlzV2ViVmlldyAmJiBicm93c2VyICE9PSAnc2FmYXJpJztcbiAgfSxcblxuICBsb2FkU3dmT2JqZWN0IDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGludGVydmFsSWQsXG4gICAgICBwYXJlbnRCb2R5ID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0sXG4gICAgICBzd2ZvYmplY3RTY3JpcHQsXG4gICAgICB0aGF0ID0gdGhpcztcblxuICAgIGlmIChwYXJlbnRCb2R5KSB7XG4gICAgICBzd2ZvYmplY3RTY3JpcHQgPSBkb2MuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBzd2ZvYmplY3RTY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBZSU1HX1VSTCArICdzd2ZvYmplY3QuanMnKTtcbiAgICAgIHBhcmVudEJvZHkuYXBwZW5kQ2hpbGQoc3dmb2JqZWN0U2NyaXB0KTtcblxuICAgICAgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodHlwZW9mIHN3Zm9iamVjdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICAgIGxpc3RlbmVycyh0aGF0KTtcblxuICAgICAgICAgIGlmIChzd2ZvYmplY3QuaGFzRmxhc2hQbGF5ZXJWZXJzaW9uKFwiOS4wLjBcIikpIHtcbiAgICAgICAgICAgIGFwcGVuZEZsYXNoVGFncyh0aGF0KTtcbiAgICAgICAgICAgIGxvYWRTd2ZvYmplY3RJbnRlcnZhbC50aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBsb2FkU3dmb2JqZWN0SW50ZXJ2YWwuaG9vayA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBsb2FkU3dmb2JqZWN0SW50ZXJ2YWwodGhhdCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5mbGFzaFRhZ3NMb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoYXQucmVnaXN0ZXJJblZpZXdMaXN0ZW5lcigpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhhdC5tYXJrRmxhc2hOb3RTdXBwb3J0ZWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIDEwMCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBMb2FkcyBzd2ZvYmplY3QuanNcbiAgICpcbiAgICogQG1ldGhvZCBpbml0XG4gICAqL1xuICBpbml0IDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5taW5GbGFzaFBhaW50Q2FsbHMgPSB7XG4gICAgICBmaW5lIDogMSxcbiAgICAgIGNvYXJzZSA6IE1hdGguZmxvb3IodGhpcy5jb2Fyc2VUaW1lb3V0IC8gMTAwKSxcbiAgICB9O1xuICAgIHRoaXMuZmxhc2hUYWdzTG9hZGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLmxvYWRTd2ZPYmplY3QoKTtcbiAgfSxcblxuICAvKipcbiAgICogTWV0aG9kIHRvIGdldCBpbiB2aWV3IHBlcmNlbnRhZ2VcbiAgICpcbiAgICogQG1ldGhvZCBnZXRJblZpZXdQZXJjZW50YWdlXG4gICAqIEByZXR1cm4ge051bWJlcn1cbiAgICovXG4gIGdldEluVmlld1BlcmNlbnRhZ2UgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGNvdW50SW5WaWV3KHRoaXMpIHx8IDApICogMTAwIC8gdGhpcy5udW1UYWc7XG4gIH0sXG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGhlciBvciBub3QgdGhlIHZpZXdhYmxlIHRpbWUgbWVldHMgb3VyIG1pbmltdW0gdGhyZXNob2xkXG4gICAqIEBtZXRob2QgaXNTdWZmaWNpZW50bHlJblZpZXdcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gVGhlIHRydWUgb3IgZmFsc2UgdmFsdWVcbiAgICovXG4gIGlzU3VmZmljaWVudGx5SW5WaWV3IDogZnVuY3Rpb24oKSB7XG4gICAgLy9UT0RPIHdlIG9ubHkgY2hlY2sgZm9yIGhhbGYgdGhlIGJlYWNvbiB0aW1lICEhXG4gICAgdmFyIGhhbGYgPSAodGhpcy5iZWFjb25UaW1lb3V0IC8gdGhpcy5maW5lVGltZW91dCkgLyAyO1xuXG4gICAgLy9UT0RPIHdoeSBhcmNoaXZlLml2ZCA/Pz9cbiAgICAvL3RoaXMuaXZkID0gdGhpcy50b3RhbEluVmlld1RpbWU7XG5cbiAgICByZXR1cm4gdGhpcy5pc0N1cnJlbnRseUluVmlldyAmJiB0aGlzLnRvdGFsSW5WaWV3VGltZSA+IHRoaXMuYmVhY29uVGltZW91dCAmJiB0aGlzLmluVmlld1BlcmNlbnRhZ2VzLmxlbmd0aCA+IGhhbGY7XG4gIH0sXG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgdGhlIGFtb3VudCBvZiB0aW1lIGJlZm9yZSB0aGUgbmV4dCBpbmNyZW1lbnRhbEZsYXNoQ2hlY2tcbiAgICogQG1ldGhvZCBpblZpZXdUaW1lcldyYXBwZXJcbiAgICogQHJldHVybiB7TnVtYmVyfVxuICAgKi9cbiAgaW5WaWV3VGltZXJXcmFwcGVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciB0aW1lb3V0O1xuXG4gICAgaWYgKCF0aGlzLm5leHRUaW1lc3RhbXAgfHwgdGhpcy5uZXh0VGltZXN0YW1wID09PSAwKSB7XG4gICAgICB0aGlzLm5leHRUaW1lc3RhbXAgPSB0aGlzLmN1cnJlbnRUaW1lc3RhbXA7XG4gICAgfVxuXG4gICAgdGhpcy5uZXh0VGltZXN0YW1wICs9IHRoaXMuZmluZVRpbWVvdXQ7XG5cbiAgICB0aW1lb3V0ID0gdGhpcy5uZXh0VGltZXN0YW1wIC0gdGhpcy5jdXJyZW50VGltZXN0YW1wO1xuXG4gICAgaWYgKHRpbWVvdXQgPiB0aGlzLmZpbmVUaW1lb3V0KSB7XG4gICAgICB0aW1lb3V0ID0gdGhpcy5maW5lVGltZW91dDtcbiAgICB9XG5cbiAgICBpZiAodGltZW91dCA8IDApIHtcbiAgICAgIHRpbWVvdXQgPSB0aGlzLmZpbmVUaW1lb3V0IC8gMjtcbiAgICB9XG5cbiAgICByZXR1cm4gc2V0VGltZW91dChjYWxsYmFjaywgdGltZW91dCk7XG4gIH0sXG5cbiAgcmVtb3ZlVGFncyA6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW1UYWc7IGkrKykge1xuICAgICAgc3dmb2JqZWN0LnJlbW92ZVNXRignRGFybGEnICsgaSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBmbGFzaCB0YWdzIGZyb20gdGhlIHRhZ3MgY29udGFpbmVyIGVsZW1lbnRcbiAgICpcbiAgICogQG1ldGhvZCBjbGVhbnVwXG4gICAqL1xuICBjbGVhbnVwOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnN0cnVjdG9yLnBhcmVudC5wcm90b3R5cGUuY2xlYW51cC5jYWxsKHRoaXMpO1xuICAgIHRoaXMucmVtb3ZlVGFncygpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIGdyaWRcbiAgICpcbiAgICogQG1ldGhvZCByZXNldFxuICAgKi9cbiAgcmVzZXQgOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHN3Zm9iamVjdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRoaXMubG9hZFN3Zk9iamVjdCgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMucmVtb3ZlVGFncygpO1xuICAgICAgYXBwZW5kRmxhc2hUYWdzKHRoaXMpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRmxhc2ggbG9hZCBmYWlsZWQgZm9yIHNvbWUgcmVhc29uLlxuICAgKlxuICAgKiBAbWV0aG9kIG1hcmtGbGFzaE5vdFN1cHBvcnRlZFxuICAgKi9cbiAgbWFya0ZsYXNoTm90U3VwcG9ydGVkIDogZnVuY3Rpb24oZmxhc2hMb2FkVGltZWRvdXQpIHtcbiAgICB0aGlzLmNsZWFudXAoKTtcbiAgICB0aGlzLmlzTWVhc3VyYWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuZmxhc2hOb3RTdXBwb3J0ZWQgPSAxICsgKGZsYXNoTG9hZFRpbWVkb3V0ID8gMSA6IDApO1xuXG4gICAgaWYgKCF0aGlzLnN0b3BDYWxsYmFja3MpIHtcbiAgICAgIHRoaXMuc3RvcENhbGxiYWNrcyA9IHRydWU7XG4gICAgICB0aGlzLm91dE9mVmlld0NhbGxiYWNrKHRydWUpO1xuICAgIH1cbiAgfSxcblxuICBtZWFzdXJlbWVudEJ1Y2tldCA6IFwiNFwiLFxufSk7XG5cbi8qKlxuICogVXNlcyBJbnRlcnNlY3Rpb25PYnNlcnZlciBhcGkgY3VycmVudGx5IGF2YWlsYWJsZSBvbiBjaHJvbWUgNTEuMCtcbiAqXG4gKiBAY2xhc3MgSW50ZXJzZWN0aW9uT2JzZXJ2ZXJNZXRob2RcbiAqIEBleHRlbmRzIE1lYXN1cmVtZW50TWV0aG9kXG4gKi9cbnZhciBJbnRlcnNlY3Rpb25PYnNlcnZlck1ldGhvZCA9IE1lYXN1cmVtZW50TWV0aG9kLmV4dGVuZCh7XG4gIC8qKlxuICAgKiBAbWV0aG9kIGNhbkFwcGx5TWV0aG9kXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBjYW5BcHBseU1ldGhvZCA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAhaXNXZWJWaWV3ICYmICFpc1NhZmVGcmFtZSAmJiAodW5kZWZpbmVkICE9PSB3aW4uSW50ZXJzZWN0aW9uT2JzZXJ2ZXIpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIHJlZ2lzdGVySW5WaWV3TGlzdGVuZXJcbiAgICovXG4gIHJlZ2lzdGVySW5WaWV3TGlzdGVuZXIgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB2YXIgdGhyZXNob2xkcyA9IFtdO1xuICAgIGZvcih2YXIgaSA9IHRoaXMudGhyZXNob2xkUGVyY2VudGFnZSAvIDEwMDsgaSA8IE1BWF9JTlRFUlNFQ1RJT05fUkFUSU87IGkgKz0gSU5URVJTRUNUSU9OX09CU0VSVkVSX1RIUkVTSE9MRF9TVEVQKSB7XG4gICAgICB0aHJlc2hvbGRzLnB1c2goaSk7XG4gICAgfVxuICAgIHRocmVzaG9sZHMucHVzaChNQVhfSU5URVJTRUNUSU9OX1JBVElPKTtcblxuICAgIHRoaXMuaW8gPSBuZXcgd2luLkludGVyc2VjdGlvbk9ic2VydmVyKGZ1bmN0aW9uKGVudHJpZXMpIHtcbiAgICAgIHZhciBlbnRyeTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZW50cmllc1tpXS50YXJnZXQgPT09IGFkV3JhcHBlckVsZW1lbnQpIHtcbiAgICAgICAgICBlbnRyeSA9IGVudHJpZXNbaV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICB0aGF0LmluVmlld0xpc3RlbmVyQ2FsbGJhY2soe1xuICAgICAgICAgIGludGVyc2VjdGlvblJhdGlvIDogZW50cmllc1swXS5pbnRlcnNlY3Rpb25SYXRpbyAqIDEwMCxcbiAgICAgICAgICB0aW1lIDogbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIHRocmVzaG9sZCA6IHRocmVzaG9sZHMsXG4gICAgfSk7XG5cbiAgICB0aGlzLmlvLm9ic2VydmUoYWRXcmFwcGVyRWxlbWVudCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgY2xlYW51cFxuICAgKi9cbiAgY2xlYW51cCA6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmlvKSB7XG4gICAgICB0aGlzLmlvLmRpc2Nvbm5lY3QoKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwcm9wZXJ0eSBtZWFzdXJlbWVudEJ1Y2tldFxuICAgKi9cbiAgbWVhc3VyZW1lbnRCdWNrZXQgOiBcIjdcIixcbn0pO1xuXG4vKipcbiAqIE1ldGhvZCB1c2VkIGluIHdlYiB2aWV3IG9uIG1vYmlsZXMgd2hlcmUgbXJhaWQgaXMgc3VwcG9ydGVkXG4gKlxuICogQGNsYXNzIE1yYWlkTWV0aG9kXG4gKiBAZXh0ZW5kcyBNZWFzdXJlbWVudE1ldGhvZFxuICovXG52YXIgTXJhaWRNZXRob2QgPSBNZWFzdXJlbWVudE1ldGhvZC5leHRlbmQoe1xuICAvKipcbiAgICogQG1ldGhvZCBjYW5BcHBseU1ldGhvZFxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICovXG4gIGNhbkFwcGx5TWV0aG9kIDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGlzV2ViVmlldyAmJiB1bmRlZmluZWQgIT09IHdpbi5tcmFpZDtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCByZWdpc3RlckluVmlld0xpc3RlbmVyXG4gICAqL1xuICByZWdpc3RlckluVmlld0xpc3RlbmVyIDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgLy91c2VkIHRvIHJlbW92ZSBsaXN0ZW5lclxuICAgIHRoYXQubXJhaWRWZXJzaW9uID0gd2luLm1yYWlkLmdldFZlcnNpb24gJiYgd2luLm1yYWlkLmdldFZlcnNpb24oKTtcbiAgICBpZih0aGF0Lm1yYWlkVmVyc2lvbiA9PT0gXCIzLjBcIil7XG4gICAgICAvL3JlZjogaHR0cDovL3d3dy5pYWIuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDE2LzExL01SQUlELVYzX0RyYWZ0X2Zvcl9QdWJsaWNfQ29tbWVudC5wZGZcbiAgICAgIHRoaXMudmlld2FibGVDaGFuZ2VFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oaW50ZXJzZWN0aW9uUmF0aW8pIHtcbiAgICAgICAgdGhhdC5pblZpZXdMaXN0ZW5lckNhbGxiYWNrKHtcbiAgICAgICAgICB0aW1lIDogbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICAgICAgaW50ZXJzZWN0aW9uUmF0aW8gOiBpbnRlcnNlY3Rpb25SYXRpbyxcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgd2luLm1yYWlkLmFkZEV2ZW50TGlzdGVuZXIoJ2V4cG9zdXJlQ2hhbmdlJywgdGhpcy52aWV3YWJsZUNoYW5nZUV2ZW50TGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZpZXdhYmxlQ2hhbmdlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGF0LmluVmlld0xpc3RlbmVyQ2FsbGJhY2soe1xuICAgICAgICAgIHRpbWUgOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICAgICAgICAvL21yYWlkIGRvZXNudCBnaXZlIGV4YWN0IGludGVyc2VjdGlvblJhdGlvIGFzIG9mIG5vd1xuICAgICAgICAgIGludGVyc2VjdGlvblJhdGlvIDogd2luLm1yYWlkLmlzVmlld2FibGUoKSA/IDEwMCA6IDAsXG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgd2luLm1yYWlkLmFkZEV2ZW50TGlzdGVuZXIoXCJ2aWV3YWJsZUNoYW5nZVwiLCB0aGlzLnZpZXdhYmxlQ2hhbmdlRXZlbnRMaXN0ZW5lcik7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGNsZWFudXBcbiAgICovXG4gIGNsZWFudXAgOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLm1yYWlkVmVyc2lvbiA9PT0gXCIzLjBcIikge1xuICAgICAgd2luLm1yYWlkLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJleHBvc3VyZUNoYW5nZVwiLCB0aGlzLnZpZXdhYmxlQ2hhbmdlRXZlbnRMaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbi5tcmFpZC5yZW1vdmVFdmVudExpc3RlbmVyKFwidmlld2FibGVDaGFuZ2VcIiwgdGhpcy52aWV3YWJsZUNoYW5nZUV2ZW50TGlzdGVuZXIpO1xuICAgIH1cblxuICB9LFxuXG4gIC8qKlxuICAgKiBAcHJvcGVydHkgbWVhc3VyZW1lbnRCdWNrZXRcbiAgICovXG4gIG1lYXN1cmVtZW50QnVja2V0IDogXCI4XCIsXG59KTtcblxuLyoqXG4gKiBNZXRob2QgdXNlZCBpbiB3ZWIgdmlldyBvbiBHT09HTEUgQU1QIFBhZ2VzIG9uIG1vYmlsZXNcbiAqXG4gKiByZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbXBwcm9qZWN0L2FtcGh0bWwvYmxvYi9tYXN0ZXIvYWRzL1JFQURNRS5tZCNhZC12aWV3YWJpbGl0eVxuICpcbiAqIEBjbGFzcyBBbXBNZXRob2RcbiAqIEBleHRlbmRzIE1lYXN1cmVtZW50TWV0aG9kXG4gKi9cbnZhciBBbXBNZXRob2QgPSBNZWFzdXJlbWVudE1ldGhvZC5leHRlbmQoe1xuICAvKipcbiAgICogQG1ldGhvZCBjYW5BcHBseU1ldGhvZFxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICovXG4gIGNhbkFwcGx5TWV0aG9kIDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICFpc1dlYlZpZXcgJiYgIWlzU2FmZUZyYW1lICYmIHVuZGVmaW5lZCAhPT0gd2luLmNvbnRleHQgJiYgdW5kZWZpbmVkICE9PSB3aW4uY29udGV4dC5vYnNlcnZlSW50ZXJzZWN0aW9uO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIHJlZ2lzdGVySW5WaWV3TGlzdGVuZXJcbiAgICovXG4gIHJlZ2lzdGVySW5WaWV3TGlzdGVuZXIgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAvL3JldHVybnMgdGhlIGZ1bmN0aW9uIHRvIHJlbW92ZSBsaXN0ZW5lclxuICAgIHRoYXQuY2xlYW51cCA9IHdpbi5jb250ZXh0Lm9ic2VydmVJbnRlcnNlY3Rpb24oZnVuY3Rpb24oZW50cmllcyl7XG4gICAgICAvLyBnZXQgbW9zdCByZWNlbnQgZW50cnkgYnkgdGltZVxuICAgICAgZW50cmllcyA9IGVudHJpZXMuc29ydChmdW5jdGlvbihhLGIpe1xuICAgICAgICByZXR1cm4gYS50aW1lID4gYi50aW1lO1xuICAgICAgfSk7XG4gICAgICBlbnRyaWVzLmZvckVhY2goZnVuY3Rpb24oZW50cnkpe1xuICAgICAgICB0aGF0LmluVmlld0xpc3RlbmVyQ2FsbGJhY2soe1xuICAgICAgICAgIHRpbWUgOiBlbnRyeS50aW1lLFxuICAgICAgICAgIGludGVyc2VjdGlvblJhdGlvIDogZW50cnkuaW50ZXJzZWN0aW9uUmF0aW8gKiAxMDAsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cblxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcHJvcGVydHkgbWVhc3VyZW1lbnRCdWNrZXRcbiAgICovXG4gIG1lYXN1cmVtZW50QnVja2V0IDogXCI5XCIsXG59KTtcblxuLyoqXG4gKiBNZXRob2QgdXNpbmcgcGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9ucyBvbiBzYWZhcmkgd2hlbiBjYWxsaW5nIHJlcXVlc3RBbmltYXRpb25GcmFtZSB3aGVuIG91dCBvZiB2aWV3LlxuICpcbiAqIEBjbGFzcyBQZXJmTWV0aG9kXG4gKiBAZXh0ZW5kcyBSZWd1bGFyQ2hlY2tNZXRob2RcbiAqL1xuXG4vL1JlcGVhdGVkIGNvZGUuIFdpbGwgYmUgY2xlYW5lZCB1cCB3aXRoIEdyb3VwTSBjaGFuZ2VzXG5cbi8qKlxuICogQG1ldGhvZCBjcmVhdGVJRnJhbWVUYWdcbiAqIEBwcml2YXRlXG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gcE1ldGhvZCB7UGVyZk1ldGhvZH1cbiAqIEBwYXJhbSBpZCB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBjcmVhdGVJRnJhbWVUYWckMShwTWV0aG9kLCBpZCkge1xuICB2YXIgdGFnLFxuICAgIHh5ID0gaWQuc3BsaXQoJ18nKTtcblxuICBpZiAoeHkubGVuZ3RoID09PSAyKSB7XG4gICAgdGFnID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIHRhZy5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOicgKyBUQUdfU0laRSArICdweDtoZWlnaHQ6JyArIFRBR19TSVpFICsgJ3B4O2xlZnQ6JyArIHh5WzBdICsgJ3B4O3RvcDonICsgeHlbMV0gKyAncHg7cG9zaXRpb246YWJzb2x1dGU7YmFja2dyb3VuZC1jb2xvcjp0cmFuc3BhcmVudDsnO1xuICAgIHRhZy5zY3JvbGxpbmcgPSAnbm8nO1xuICAgIHRhZy5hbGxvd3RyYW5zcGFyZW5jeSA9ICd0cnVlJztcbiAgICB0YWcuaGlkZWZvY3VzID0gJ3RydWUnO1xuICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ2ZyYW1lQm9yZGVyJywgJzAnKTtcbiAgICB0YWcuaWQgPSBpZDtcbiAgICBwTWV0aG9kLnBhaW50ZWRbaWRdID0gMDsgLy8gcmVnaXN0ZXIgaWRcbiAgfVxuXG4gIHJldHVybiB0YWc7XG59XG5cbi8qKlxuICogQG1ldGhvZCBhcHBlbmRUYWdzXG4gKiBAcHJpdmF0ZVxuICogQHN0YXRpY1xuICogQHBhcmFtIHBNZXRob2Qge1BlcmZNZXRob2R9XG4gKi9cbmZ1bmN0aW9uIGFwcGVuZFRhZ3MkMShwTWV0aG9kKSB7XG4gIHZhciBpO1xuXG4gIHBNZXRob2QudGFncyA9IGdldFRhZ0Nvb3JkaW5hdGVzKHdpZHRoLCBoZWlnaHQpO1xuICBwTWV0aG9kLm51bVRhZyA9IHBNZXRob2QudGFncy5sZW5ndGg7XG4gIHBNZXRob2QudGFnQXJyYXkgPSBbXTtcbiAgLy8gY3JlYXRlIGFsbCB0aGUgdGFncyBhbmQga2VlcCB0aGVtIGluIGFuIGFycmF5ICh0aGUgYXJyYXkgd2lsbCBiZSB1c2VkIHRvIHJlbW92ZSB0aGVtIGFmdGVyIGZpcmluZyB0aGUgYmVhY29uKVxuICBmb3IgKGkgPSAwOyBpIDwgcE1ldGhvZC5udW1UYWc7IGkrKykge1xuICAgIHBNZXRob2QudGFnQXJyYXkucHVzaChjcmVhdGVJRnJhbWVUYWckMShwTWV0aG9kLCBwTWV0aG9kLnRhZ3NbaV0pKTtcbiAgfVxuXG4gIC8vIGFkZCBlYWNoIGVsZW1lbnQgdG8gdGhlIERPTVxuICBmb3IgKGkgPSAwOyBpIDwgcE1ldGhvZC5udW1UYWc7IGkrKykge1xuICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKHBNZXRob2QudGFnQXJyYXlbaV0pO1xuICB9XG59XG5cbnZhciBQZXJmTWV0aG9kID0gUmVndWxhckNoZWNrTWV0aG9kLmV4dGVuZCh7XG4gIC8qKlxuICAgKiBAbWV0aG9kIGNhbkFwcGx5TWV0aG9kXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBjYW5BcHBseU1ldGhvZCA6IGZ1bmN0aW9uKCkge1xuICAgIC8vcmVxdWVzdEFuaW1hdGlvbkZyYW1lIG1ldGhvZCBvbmx5IHdvcmtzIGluIHNhZmFyaSB2OStcbiAgICByZXR1cm4gIWlzV2ViVmlldyAmJiAoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScgaW4gd2luKSAmJiAoJ2NhbmNlbEFuaW1hdGlvbkZyYW1lJyBpbiB3aW4pICYmIGJyb3dzZXIgPT09ICdzYWZhcmknICYmIE51bWJlcih2ZXJzaW9uKSA+PSAxMDtcbiAgfSxcblxuICBzZXR1cEhhbmRsZXJQZXJUYWcgOiBmdW5jdGlvbihpZCkge1xuICAgIHZhciB0YWdXaW4gPSB0aGlzLnRhZ0FycmF5W2lkXS5jb250ZW50V2luZG93LCB0aGF0ID0gdGhpcztcbiAgICBpZiAodGFnV2luKSB7XG4gICAgICAvL3VzaW5nIHdpbmRvdyBvZiB0aGUgaWZyYW1lIGFzIGEgcmVmZXJlbmNlIGZvciBhbGwgdmFyaWFibGVzXG4gICAgICB0YWdXaW4ucHJldlRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgaWYgKHRhZ1dpbi5hbmltYXRpb25GcmFtZVJlcXVlc3QpIHtcbiAgICAgICAgdGFnV2luLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRhZ1dpbi5hbmltYXRpb25GcmFtZVJlcXVlc3QpO1xuICAgICAgICB0aGlzLnBhaW50ZWRbaWRdID0gMDtcbiAgICAgIH1cblxuICAgICAgdGFnV2luLmFuaW1hdGlvbkZyYW1lUmVxdWVzdCA9IHRhZ1dpbi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjdXJyZW50VGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRUaW1lc3RhbXAgLSB0YWdXaW4ucHJldlRpbWVzdGFtcCA8ICh0aGF0LmZpbmVUaW1lb3V0IC8gMikpIHtcbiAgICAgICAgICB0aGF0LnBhaW50ZWRbaWRdID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGF0LnBhaW50ZWRbaWRdID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0YWdXaW4ucHJldlRpbWVzdGFtcCA9IGN1cnJlbnRUaW1lc3RhbXA7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2V0dXBIYW5kbGVycyA6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW1UYWc7IGkrKykge1xuICAgICAgdGhpcy5zZXR1cEhhbmRsZXJQZXJUYWcoaSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBJbml0IGZ1bmN0aW9uIHRoYXQgc2V0cyB1cCBlbGVtZW50cyBmb3IgcGFpbnQgY2FsbHMgYW5kIHN0YXJ0cyB0aGUgdmlld2FiaWxpdHkgY2FsdWNsYXRpb25zLlxuICAgKlxuICAgKiBAbWV0aG9kIGluaXRcbiAgICovXG4gIGluaXQgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhaW50ZWQgPSB7fTtcblxuICAgIGFwcGVuZFRhZ3MkMSh0aGlzKTtcbiAgICB0aGlzLnNldHVwSGFuZGxlcnMoKTtcblxuICAgIHRoaXMucmVnaXN0ZXJJblZpZXdMaXN0ZW5lcigpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBpbiB2aWV3IHBlcmNlbnRhZ2UgYmFzZWQgb24gcGFpbnQgY291bnRzXG4gICAqXG4gICAqIEBtZXRob2QgZ2V0SW5WaWV3UGVyY2VudGFnZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAqL1xuICBnZXRJblZpZXdQZXJjZW50YWdlIDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhaW50Q291bnQgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW1UYWc7IGkrKykge1xuICAgICAgcGFpbnRDb3VudCArPSB0aGlzLnBhaW50ZWRbaV07XG4gICAgICAvL3Jlc2V0IHBhaW50ZWRcbiAgICAgIHRoaXMucGFpbnRlZFtpXSA9IDA7XG4gICAgfVxuICAgIHRoaXMuc2V0dXBIYW5kbGVycygpO1xuICAgIHJldHVybiB0aGlzLm51bVRhZyA/ICgxMDAuMCAqIHBhaW50Q291bnQgLyB0aGlzLm51bVRhZykgOiAwO1xuICB9LFxuXG4gIC8qKlxuICAgKiBXcmFwcGVyIE1ldGhvZCB0byBzdGFydCBhIHRpbWVyIHdoZW4gYWQgaXMgbm90IGluIHZpZXdcbiAgICpcbiAgICogQG10aG9kIG5vdEluVmlld1RpbWVyV3JhcHBlclxuICAgKi9cbiAgbm90SW5WaWV3VGltZXJXcmFwcGVyIDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICB0aGF0LnNldHVwSGFuZGxlcnMoKTtcbiAgICAgIHRoYXQudGltZW91dCA9IHNldFRpbWVvdXQoY2FsbGJhY2ssIDAuNSAqIHRoYXQuY29hcnNlVGltZW91dCk7XG4gICAgfSwgMC41ICogdGhpcy5jb2Fyc2VUaW1lb3V0KTtcbiAgfSxcblxuICAvKipcbiAgICogV3JhcHBlciBNZXRob2QgdG8gc3RhcnQgYSB0aW1lciB3aGVuIGFkIGlzIGluIHZpZXdcbiAgICpcbiAgICogQG10aG9kIGluVmlld1RpbWVyV3JhcHBlclxuICAgKi9cbiAgaW5WaWV3VGltZXJXcmFwcGVyIDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICB0aGF0LnNldHVwSGFuZGxlcnMoKTtcbiAgICAgIHRoYXQudGltZW91dCA9IHNldFRpbWVvdXQoY2FsbGJhY2ssIDAuNSAqIHRoYXQuZmluZVRpbWVvdXQpO1xuICAgIH0sIDAuNSAqIHRoaXMuZmluZVRpbWVvdXQpO1xuICB9LFxuXG4gIHJlbW92ZVRhZ3MgOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubnVtVGFnOyBpKyspIHtcbiAgICAgIGRvYy5ib2R5LnJlbW92ZUNoaWxkKHRoaXMudGFnQXJyYXlbaV0pO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogTWV0aG9kIHRvIGNsZWFudXAgZWxlbWVudHMgYW5kIG90aGVyIGxpc3RlbmVycyBjcmVhdGVkIGJ5IHRoZSBtZXRob2RcbiAgICpcbiAgICogQG1ldGhvZCBjbGVhbnVwXG4gICAqL1xuICBjbGVhbnVwIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb25zdHJ1Y3Rvci5wYXJlbnQucHJvdG90eXBlLmNsZWFudXAuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMucmVtb3ZlVGFncygpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIGdyaWRcbiAgICpcbiAgICogQG1ldGhvZCByZXNldFxuICAgKi9cbiAgcmVzZXQgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZVRhZ3MoKTtcbiAgICBhcHBlbmRUYWdzJDEodGhpcyk7XG4gIH0sXG5cbiAgbWVhc3VyZW1lbnRCdWNrZXQgOiBcIjEwXCIsXG59KTtcblxuLyoqXG4gKiBNZXRob2Qgd2hlcmUgdGhlcmUgaXMgZm9yIG5vIG1lYXN1cmFibGUuIEl0IGlzIHRvIHByb3ZpZGUgc2FtZSBhcGkgZm9yIG5vbiBtZWFzdXJhYmxlIGNhc2UuXG4gKlxuICogQGNsYXNzIE5vdE1lYXN1cmFibGVNZXRob2RcbiAqL1xudmFyIE5vdE1lYXN1cmFibGVNZXRob2QgPSBNZWFzdXJlbWVudE1ldGhvZC5leHRlbmQoe1xuICAvKipcbiAgICogQG1ldGhvZCBjYW5BcHBseU1ldGhvZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cbiAgY2FuQXBwbHlNZXRob2QgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvKipcbiAgICogY2FsbCB0aGUgaW5WaWV3Q2FsbGJhY2sgZHVyaW5nIGluaXRcbiAgICogQG1ldGhvZCBpbml0XG4gICAqL1xuICBpbml0IDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pc01lYXN1cmFibGUgPSBmYWxzZTtcbiAgICB0aGlzLm91dE9mVmlld0NhbGxiYWNrKHRydWUpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcHJvcGVydHkgbWVhc3VyZW1lbnRCdWNrZXRcbiAgICovXG4gIG1lYXN1cmVtZW50QnVja2V0IDogXCI1XCIsXG59KTtcblxuLyoqXG4gKiBNZXRob2QgZm9yIHZpZGVvIHZpZXdhYmlsaXR5LlxuICpcbiAqIEBjbGFzcyBWaWRlb01ldGhvZFxuICovXG52YXIgVmlkZW9NZXRob2QgPSBNZWFzdXJlbWVudE1ldGhvZC5leHRlbmQoe1xuICBpbml0IDogZnVuY3Rpb24oKSB7XG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGFkQ2xpY2tlZFxuICAgICAqL1xuICAgIHRoaXMuYWRDbGlja2VkID0gZmFsc2U7XG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGFkRXJyb3JlZFxuICAgICAqL1xuICAgIHRoaXMuYWRFcnJvcmVkID0gZmFsc2U7XG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IG1pblZvbHVtZVxuICAgICAqL1xuICAgIHRoaXMubWluVm9sdW1lID0gOTk5O1xuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSB0aW1lQXRNaW5Wb2x1bWVcbiAgICAgKi9cbiAgICB0aGlzLnRpbWVBdE1pblZvbHVtZSA9IDA7XG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IG1heFRpbWVBdE1pblZvbHVtZVxuICAgICAqL1xuICAgIHRoaXMubWF4VGltZUF0TWluVm9sdW1lID0gMDtcbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgY3VycmVudGx5QXRNaW5Wb2x1bWVcbiAgICAgKi9cbiAgICB0aGlzLmN1cnJlbnRseUF0TWluVm9sdW1lID0gZmFsc2U7XG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IG1heFZvbHVtZVxuICAgICAqL1xuICAgIHRoaXMubWF4Vm9sdW1lID0gMDtcbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgdGltZUF0TWF4Vm9sdW1lXG4gICAgICovXG4gICAgdGhpcy50aW1lQXRNYXhWb2x1bWUgPSAwO1xuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBtYXhUaW1lQXRNYXhWb2x1bWVcbiAgICAgKi9cbiAgICB0aGlzLm1heFRpbWVBdE1heFZvbHVtZSA9IDA7XG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGN1cnJlbnRseUF0TWF4Vm9sdW1lXG4gICAgICovXG4gICAgdGhpcy5jdXJyZW50bHlBdE1heFZvbHVtZSA9IGZhbHNlO1xuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBwbGF5ZXJXaWR0aFxuICAgICAqL1xuICAgIHRoaXMucGxheWVyV2lkdGggPSAwO1xuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBwbGF5ZXJIZWlnaHRcbiAgICAgKi9cbiAgICB0aGlzLnBsYXllckhlaWdodCA9IDA7XG5cbiAgICB0aGlzLnBsYXllclNpemVJc1ZhbGlkID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgYWRIYXNMb2FkZWRcbiAgICAgKi9cbiAgICB0aGlzLmFkSGFzTG9hZGVkID0gZmFsc2U7XG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGFkSGFzU3RhcnRlZFxuICAgICAqL1xuICAgIHRoaXMuYWRIYXNTdGFydGVkID0gZmFsc2U7XG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGFkSW1wcmVzc2lvbkZpcmVkXG4gICAgICovXG4gICAgdGhpcy5hZEltcHJlc3Npb25GaXJlZCA9IGZhbHNlO1xuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBhZFZpZGVvQ29tcGxldGVGaXJlZFxuICAgICAqL1xuICAgIHRoaXMuYWRWaWRlb0NvbXBsZXRlRmlyZWQgPSBmYWxzZTtcbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgYWRVc2VyQ2xvc2VGaXJlZFxuICAgICAqL1xuICAgIHRoaXMuYWRVc2VyQ2xvc2VGaXJlZCA9IGZhbHNlO1xuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBhZFNraXBwZWRGaXJlZFxuICAgICAqL1xuICAgIHRoaXMuYWRTa2lwcGVkRmlyZWQgPSBmYWxzZTtcbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgYWRTdG9wcGVkRmlyZWRcbiAgICAgKi9cbiAgICB0aGlzLmFkU3RvcHBlZEZpcmVkID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5hZFVuaXQpIHtcbiAgICAgIHRoaXMuc3Vic2NyaWJlVG9FdmVudHMoKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2Qgc3Vic2NyaWJlVG9FdmVudHNcbiAgICovXG4gIHN1YnNjcmliZVRvRXZlbnRzIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hZFVuaXQuc3Vic2NyaWJlKHRoaXMuYWRMb2FkZWRXcmFwcGVyLCBcIkFkTG9hZGVkXCIsIHRoaXMsIHRoaXMucGxheWVySWQpO1xuICAgIHRoaXMuYWRVbml0LnN1YnNjcmliZSh0aGlzLmFkU3RhcnRlZFBsYXlpbmcsIFwiQWRTdGFydGVkXCIsIHRoaXMsIHRoaXMucGxheWVySWQpO1xuICAgIHRoaXMuYWRVbml0LnN1YnNjcmliZSh0aGlzLmFkU3RhcnRlZFBsYXlpbmcsIFwiQWRWaWRlb1N0YXJ0XCIsIHRoaXMsIHRoaXMucGxheWVySWQpO1xuICAgIHRoaXMuYWRVbml0LnN1YnNjcmliZSh0aGlzLmFkSW1wcmVzc2lvbkhhbmRsZXIsIFwiQWRJbXByZXNzaW9uXCIsIHRoaXMsIHRoaXMucGxheWVySWQpO1xuICAgIC8vcmVzdW1lZFxuICAgIHRoaXMuYWRVbml0LnN1YnNjcmliZSh0aGlzLmFkU3RhcnRlZFBsYXlpbmcsIFwiQWRQbGF5aW5nXCIsIHRoaXMsIHRoaXMucGxheWVySWQpO1xuICAgIHRoaXMuYWRVbml0LnN1YnNjcmliZSh0aGlzLmFkU3RvcHBlZFBsYXlpbmcsIFwiQWRQYXVzZWRcIiwgdGhpcywgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5hZFVuaXQuc3Vic2NyaWJlKHRoaXMuYWRTdG9wcGVkSGFuZGxlciwgXCJBZFN0b3BwZWRcIiwgdGhpcywgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5hZFVuaXQuc3Vic2NyaWJlKHRoaXMuYWRWaWRlb0NvbXBsZXRlSGFuZGxlciwgXCJBZFZpZGVvQ29tcGxldGVcIiwgdGhpcywgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5hZFVuaXQuc3Vic2NyaWJlKHRoaXMuYWRVc2VyQ2xvc2VIYW5kbGVyLCBcIkFkVXNlckNsb3NlXCIsIHRoaXMsIHRoaXMucGxheWVySWQpO1xuICAgIHRoaXMuYWRVbml0LnN1YnNjcmliZSh0aGlzLmFkU2tpcHBlZEhhbmRsZXIsIFwiQWRTa2lwcGVkXCIsIHRoaXMsIHRoaXMucGxheWVySWQpO1xuICAgIHRoaXMuYWRVbml0LnN1YnNjcmliZSh0aGlzLnBsYXllckVycm9yLCBcIkFkRXJyb3JcIiwgdGhpcywgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5hZFVuaXQuc3Vic2NyaWJlKHRoaXMuYWRDbGlja2VkSGFuZGxlciwgXCJBZENsaWNrVGhydVwiLCB0aGlzLCB0aGlzLnBsYXllcklkKTtcblxuICAgIHRoaXMuYWRVbml0LnN1YnNjcmliZSh0aGlzLmFkU2l6ZUNoYW5nZUhhbmRsZXIsIFwiQWRTaXplQ2hhbmdlXCIsIHRoaXMsIHRoaXMucGxheWVySWQpO1xuICAgIHRoaXMuYWRVbml0LnN1YnNjcmliZSh0aGlzLmFkRXhwYW5kZWRDaGFuZ2VIYW5kbGVyLCBcIkFkRXhwYW5kZWRDaGFuZ2VcIiwgdGhpcywgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5hZFVuaXQuc3Vic2NyaWJlKHRoaXMuYWRWb2x1bWVDaGFuZ2VIYW5kbGVyLCBcIkFkVm9sdW1lQ2hhbmdlXCIsIHRoaXMsIHRoaXMucGxheWVySWQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIHVuc3Vic2NyaWJlVG9FdmVudHNcbiAgICovXG4gIHVuc3Vic2NyaWJlVG9FdmVudHMgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkVW5pdC51bnN1YnNjcmliZSh0aGlzLmFkTG9hZGVkV3JhcHBlciwgXCJBZExvYWRlZFwiLCB0aGlzLnBsYXllcklkKTtcbiAgICB0aGlzLmFkVW5pdC51bnN1YnNjcmliZSh0aGlzLmFkU3RhcnRlZFBsYXlpbmcsIFwiQWRTdGFydGVkXCIsIHRoaXMucGxheWVySWQpO1xuICAgIHRoaXMuYWRVbml0LnVuc3Vic2NyaWJlKHRoaXMuYWRTdGFydGVkUGxheWluZywgXCJBZFZpZGVvU3RhcnRcIiwgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5hZFVuaXQudW5zdWJzY3JpYmUodGhpcy5hZEltcHJlc3Npb25IYW5kbGVyLCBcIkFkSW1wcmVzc2lvblwiLCB0aGlzLnBsYXllcklkKTtcbiAgICAvL3Jlc3VtZWRcbiAgICB0aGlzLmFkVW5pdC51bnN1YnNjcmliZSh0aGlzLmFkU3RhcnRlZFBsYXlpbmcsIFwiQWRQbGF5aW5nXCIsIHRoaXMucGxheWVySWQpO1xuICAgIHRoaXMuYWRVbml0LnVuc3Vic2NyaWJlKHRoaXMuYWRTdG9wcGVkUGxheWluZywgXCJBZFBhdXNlZFwiLCB0aGlzLnBsYXllcklkKTtcbiAgICB0aGlzLmFkVW5pdC51bnN1YnNjcmliZSh0aGlzLmFkU3RvcHBlZEhhbmRsZXIsIFwiQWRTdG9wcGVkXCIsIHRoaXMucGxheWVySWQpO1xuICAgIHRoaXMuYWRVbml0LnVuc3Vic2NyaWJlKHRoaXMuYWRWaWRlb0NvbXBsZXRlSGFuZGxlciwgXCJBZFZpZGVvQ29tcGxldGVcIiwgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5hZFVuaXQudW5zdWJzY3JpYmUodGhpcy5hZFVzZXJDbG9zZUhhbmRsZXIsIFwiQWRVc2VyQ2xvc2VcIiwgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5hZFVuaXQudW5zdWJzY3JpYmUodGhpcy5hZFNraXBwZWRIYW5kbGVyLCBcIkFkU2tpcHBlZFwiLCB0aGlzLnBsYXllcklkKTtcbiAgICB0aGlzLmFkVW5pdC51bnN1YnNjcmliZSh0aGlzLnBsYXllckVycm9yLCBcIkFkRXJyb3JcIiwgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5hZFVuaXQudW5zdWJzY3JpYmUodGhpcy5hZENsaWNrZWRIYW5kbGVyLCBcIkFkQ2xpY2tUaHJ1XCIsIHRoaXMucGxheWVySWQpO1xuXG4gICAgdGhpcy5hZFVuaXQudW5zdWJzY3JpYmUodGhpcy5hZFNpemVDaGFuZ2VIYW5kbGVyLCBcIkFkU2l6ZUNoYW5nZVwiLCB0aGlzLnBsYXllcklkKTtcbiAgICB0aGlzLmFkVW5pdC51bnN1YnNjcmliZSh0aGlzLmFkRXhwYW5kZWRDaGFuZ2VIYW5kbGVyLCBcIkFkRXhwYW5kZWRDaGFuZ2VcIiwgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5hZFVuaXQudW5zdWJzY3JpYmUodGhpcy5hZFZvbHVtZUNoYW5nZUhhbmRsZXIsIFwiQWRWb2x1bWVDaGFuZ2VcIiwgdGhpcy5wbGF5ZXJJZCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgdXBkYXRlVGltZXN0YW1wc1xuICAgKi9cbiAgdXBkYXRlVGltZXN0YW1wcyA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3VycmVudFRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgaWYgKHRoaXMubGFzdFRpbWVzdGFtcCA+IDApIHtcbiAgICAgIHZhclxuICAgICAgICB0aW1lRGlmZiA9IHRoaXMuY3VycmVudFRpbWVzdGFtcCAtIHRoaXMubGFzdFRpbWVzdGFtcDtcblxuICAgICAgLy9jYWxjdWxhdGUgdm9sdW1lIHRpbWVzIG9ubHkgaWYgdGhlIGFkVW5pdCBoYXMgZ2V0QWRWb2x1bWUgYXBpICh2cGFpZCA+PSAyLjApXG4gICAgICBpZiAodGhpcy5hZFVuaXQgJiYgdGhpcy5hZFVuaXQuZ2V0QWRWb2x1bWUpIHtcbiAgICAgICAgLy91cGRhdGUgdGltZXMgb25seSBpZiB2b2x1bWUgaXMgYXQgbWF4L21pblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50bHlBdE1pblZvbHVtZSkge1xuICAgICAgICAgIHRoaXMudGltZUF0TWluVm9sdW1lICs9IHRpbWVEaWZmO1xuICAgICAgICAgIGlmICh0aGlzLnRpbWVBdE1pblZvbHVtZSA+IHRoaXMubWF4VGltZUF0TWluVm9sdW1lKSB7XG4gICAgICAgICAgICB0aGlzLm1heFRpbWVBdE1pblZvbHVtZSA9IHRoaXMudGltZUF0TWluVm9sdW1lO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRseUF0TWF4Vm9sdW1lKSB7XG4gICAgICAgICAgdGhpcy50aW1lQXRNYXhWb2x1bWUgKz0gdGltZURpZmY7XG4gICAgICAgICAgaWYgKHRoaXMudGltZUF0TWF4Vm9sdW1lID4gdGhpcy5tYXhUaW1lQXRNYXhWb2x1bWUpIHtcbiAgICAgICAgICAgIHRoaXMubWF4VGltZUF0TWF4Vm9sdW1lID0gdGhpcy50aW1lQXRNYXhWb2x1bWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jb25zdHJ1Y3Rvci5wYXJlbnQucHJvdG90eXBlLnVwZGF0ZVRpbWVzdGFtcHMuY2FsbCh0aGlzKTtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCByZXNldFZvbHVtZVRpbWVzdGFtcHNcbiAgICovXG4gIHJlc2V0Vm9sdW1lVGltZXN0YW1wcyA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGltZUF0TWluVm9sdW1lID0gdGhpcy50aW1lQXRNYXhWb2x1bWUgPSAwO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIHJlc2V0VGltZXN0YW1wc1xuICAgKi9cbiAgcmVzZXRUaW1lc3RhbXBzIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZXNldFZvbHVtZVRpbWVzdGFtcHMoKTtcbiAgICB0aGlzLmNvbnN0cnVjdG9yLnBhcmVudC5wcm90b3R5cGUucmVzZXRUaW1lc3RhbXBzLmNhbGwodGhpcyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgdXBkYXRlQWRWb2x1bWVcbiAgICovXG4gIHVwZGF0ZUFkVm9sdW1lIDogZnVuY3Rpb24oKSB7XG4gICAgLy9jYWxjdWxhdGUgdm9sdW1lIG9ubHkgaWYgdGhlIGFkVW5pdCBoYXMgZ2V0QWRWb2x1bWUgYXBpICh2cGFpZCA+PSAyLjApXG4gICAgaWYgKHRoaXMuYWRVbml0ICYmIHRoaXMuYWRVbml0LmdldEFkVm9sdW1lKSB7XG4gICAgICB2YXJcbiAgICAgICAgY3VyVm9sdW1lID0gdGhpcy5hZFVuaXQuZ2V0QWRWb2x1bWUoKTtcblxuICAgICAgLy9yZXNldCB0aW1lcyBvbmx5IGlmIHZvbHVtZSBjaGFuZ2VkXG4gICAgICAvL3RoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHdoZW4gdGltZXIgaXMgc3RhcnRlZFxuICAgICAgaWYgKGN1clZvbHVtZSA8IHRoaXMubWluVm9sdW1lKSB7XG4gICAgICAgIHRoaXMubWluVm9sdW1lID0gY3VyVm9sdW1lO1xuICAgICAgICB0aGlzLnJlc2V0Vm9sdW1lVGltZXN0YW1wcygpO1xuICAgICAgICB0aGlzLmN1cnJlbnRseUF0TWluVm9sdW1lID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGN1clZvbHVtZSAhPT0gdGhpcy5taW5Wb2x1bWUpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50bHlBdE1pblZvbHVtZSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGN1clZvbHVtZSA+IHRoaXMubWF4Vm9sdW1lKSB7XG4gICAgICAgIHRoaXMubWF4Vm9sdW1lID0gY3VyVm9sdW1lO1xuICAgICAgICB0aGlzLnJlc2V0Vm9sdW1lVGltZXN0YW1wcygpO1xuICAgICAgICB0aGlzLmN1cnJlbnRseUF0TWF4Vm9sdW1lID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYoY3VyVm9sdW1lICE9PSB0aGlzLm1heFZvbHVtZSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRseUF0TWF4Vm9sdW1lID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGFkTG9hZGVkV3JhcHBlclxuICAgKi9cbiAgYWRMb2FkZWRXcmFwcGVyIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hZEhhc0xvYWRlZCA9IHRydWU7XG4gICAgLy91cGRhdGUgcGxheWVyIHNpemUgd2hlbiBhZCBsb2FkZWRcbiAgICB0aGlzLnVwZGF0ZVBsYXllclNpemUoKTtcbiAgICB0aGlzLmFkTG9hZGVkKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBhIHRpbWVyIHdoZW4gYWQgaXMgcGxheWVkL3Jlc3VtZWQgd2l0aCAnVklERU9fUExBWV9EVVJBVElPTl9USFJFU0hPTEQnIHRpbWVvdXQuXG4gICAqIFxuICAgKiBAbWV0aG9kIGFkU3RhcnRlZFBsYXlpbmdcbiAgICovXG4gIGFkU3RhcnRlZFBsYXlpbmcgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkSGFzU3RhcnRlZCA9IHRydWU7XG5cbiAgICAvL3VwZGF0ZSB0aGUgdm9sdW1lIGlmIGl0IGNoYW5nZWRcbiAgICB0aGlzLnVwZGF0ZUFkVm9sdW1lKCk7XG4gICAgdGhpcy51cGRhdGVUaW1lc3RhbXBzKCk7XG4gICAgdGhpcy5hZFNpemVDaGFuZ2VIYW5kbGVyKCk7XG5cbiAgICB0aGlzLmlzQ3VycmVudGx5SW5WaWV3ID0gdHJ1ZTtcblxuICAgIGlmICghdGhpcy5zdG9wQ2FsbGJhY2tzKSB7XG4gICAgICB0aGlzLmluVmlld0NhbGxiYWNrKCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGFkSW1wcmVzc2lvbkhhbmRsZXJcbiAgICovXG4gIGFkSW1wcmVzc2lvbkhhbmRsZXIgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkSW1wcmVzc2lvbkZpcmVkID0gdHJ1ZTtcbiAgfSxcblxuICAvKipcbiAgICogU3RvcHMgdGhlIHRpbWVyIGZvciBhZCBwbGF5ZWQvcmVzdW1lZC5cbiAgICpcbiAgICogQG1ldGhvZCBhZFN0b3BwZWRQbGF5aW5nXG4gICAqL1xuICBhZFN0b3BwZWRQbGF5aW5nIDogZnVuY3Rpb24oYWRFbmRlZCkge1xuICAgIHRoaXMuY3VycmVudFRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgdGhpcy5yZXNldFRpbWVzdGFtcHMoKTtcblxuICAgIHRoaXMuaXNDdXJyZW50bHlJblZpZXcgPSBmYWxzZTtcblxuICAgIGlmICghdGhpcy5zdG9wQ2FsbGJhY2tzIHx8IGFkRW5kZWQpIHtcbiAgICAgIHRoaXMub3V0T2ZWaWV3Q2FsbGJhY2soYWRFbmRlZCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBFbmQgYWQgYW5kIG1ha2UgY2FsbGJhY2tzLlxuICAgKlxuICAgKiBAbWV0aG9kIGVuZEFkXG4gICAqL1xuICBlbmRBZCA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWRTdG9wcGVkUGxheWluZyh0cnVlKTtcblxuICAgIHRoaXMudW5zdWJzY3JpYmVUb0V2ZW50cygpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGFkU3RvcHBlZEhhbmRsZXJcbiAgICovXG4gIGFkU3RvcHBlZEhhbmRsZXIgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkU3RvcHBlZEZpcmVkID0gdHJ1ZTtcblxuICAgIHRoaXMuZW5kQWQoKTtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBhZFZpZGVvQ29tcGxldGVIYW5kbGVyXG4gICAqL1xuICBhZFZpZGVvQ29tcGxldGVIYW5kbGVyIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy51cGRhdGVBZFZvbHVtZSgpO1xuXG4gICAgdGhpcy5hZFZpZGVvQ29tcGxldGVGaXJlZCA9IHRydWU7XG5cbiAgICB0aGlzLmFkVmlkZW9Db21wbGV0ZSgpO1xuXG4gICAgdGhpcy5lbmRBZCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGFkVXNlckNsb3NlSGFuZGxlclxuICAgKi9cbiAgYWRVc2VyQ2xvc2VIYW5kbGVyIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hZFVzZXJDbG9zZUZpcmVkID0gdHJ1ZTtcblxuICAgIHRoaXMuZW5kQWQoKTtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBhZFNraXBwZWRIYW5kbGVyXG4gICAqL1xuICBhZFNraXBwZWRIYW5kbGVyIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hZFNraXBwZWRGaXJlZCA9IHRydWU7XG5cbiAgICB0aGlzLmVuZEFkKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFBsYXllciBlcnJvcmVkIG91dFxuICAgKlxuICAgKiBAbWV0aG9kIHBsYXllckVycm9yXG4gICAqL1xuICBwbGF5ZXJFcnJvciA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudXBkYXRlVGltZXN0YW1wcygpO1xuXG4gICAgLy9tYXJrIGFzIG5vdCBtZWFzdXJhYmxlIGlmIGFkIGltcHJlc3Npb24gaXMgbm90IGZpcmVkXG4gICAgdGhpcy5pc01lYXN1cmFibGUgPSB0aGlzLmFkSW1wcmVzc2lvbkZpcmVkO1xuICAgIC8vbWFyayBhcyBub3Qgdmlld2VkXG4gICAgdGhpcy5pc0N1cnJlbnRseUluVmlldyA9IGZhbHNlO1xuICAgIHRoaXMuaW5WaWV3ID0gZmFsc2U7XG4gICAgLy9zdG9wIGFsbCBjYWxsYmFja3MgYXMgdGhpcyB3aWxsIGJlIGZpcmVkIGFzIG5vdCBtZWFzdXJhYmxlXG4gICAgdGhpcy5zdG9wQ2FsbGJhY2tzID0gdHJ1ZTtcbiAgICB0aGlzLmFkRXJyb3JlZCA9IHRydWU7XG5cbiAgICB0aGlzLm91dE9mVmlld0NhbGxiYWNrKHRydWUpO1xuXG4gICAgdGhpcy51bnN1YnNjcmliZVRvRXZlbnRzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFkIHdhcyBjbGlja2VkXG4gICAqXG4gICAqIEBtZXRob2QgYWRDbGlja2VkSGFuZGxlclxuICAgKi9cbiAgYWRDbGlja2VkSGFuZGxlciA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudXBkYXRlVGltZXN0YW1wcygpO1xuXG4gICAgLy9jbGlja2luZyBhbiBhZCBpcyB0byBiZSBtYXJrZWQgYXMgdmlld2VkIGFzIHBlciBJQUJcbiAgICB0aGlzLmFkQ2xpY2tlZCA9IHRydWU7XG5cbiAgICBpZiAoIXRoaXMuc3RvcENhbGxiYWNrcykge1xuICAgICAgdGhpcy5pblZpZXdDYWxsYmFjayh0cnVlKTtcbiAgICB9XG5cbiAgICAvL3N0b3AgYWxsIGNhbGxiYWNrcyBhcyB0aGlzIHNob3VsZCBoYXZlIGZpcmVkIHRoZSBiZWFjb25cbiAgICB0aGlzLnN0b3BDYWxsYmFja3MgPSB0cnVlO1xuXG4gICAgdGhpcy51bnN1YnNjcmliZVRvRXZlbnRzKCk7XG4gIH0sXG5cbiAgdXBkYXRlUGxheWVyU2l6ZSA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaXplID0gZ2V0U2l6ZUZyb21FbGVtZW50KGFkRWxlbWVudCk7XG4gICAgdGhpcy5wbGF5ZXJXaWR0aCA9IHNpemUud2lkdGg7XG4gICAgdGhpcy5wbGF5ZXJIZWlnaHQgPSBzaXplLmhlaWdodDtcbiAgICB0aGlzLnBsYXllclNpemVJc1ZhbGlkID0gc2l6ZS52YWxpZDtcbiAgfSxcblxuICAvKipcbiAgICogQWQgd2FzIHJlc2l6ZWRcbiAgICpcbiAgICogQG1ldGhvZCBhZFNpemVDaGFuZ2VIYW5kbGVyXG4gICAqL1xuICBhZFNpemVDaGFuZ2VIYW5kbGVyIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy51cGRhdGVUaW1lc3RhbXBzKCk7XG5cbiAgICBzZXRBZFNpemUodGhpcy5hZFVuaXQuYWRXaWR0aCwgdGhpcy5hZFVuaXQuYWRIZWlnaHQpO1xuICAgIHRoaXMudXBkYXRlUGxheWVyU2l6ZSgpO1xuXG4gICAgaWYgKCF0aGlzLnN0b3BDYWxsYmFja3MpIHtcbiAgICAgIHRoaXMuYWRTaXplQ2hhbmdlZCgpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQWQgZXhwYW5kZWQgc3RhdGUgd2FzIGNoYW5nZWRcbiAgICpcbiAgICogQG1ldGhvZCBhZEV4cGFuZGVkQ2hhbmdlSGFuZGxlclxuICAgKi9cbiAgYWRFeHBhbmRlZENoYW5nZUhhbmRsZXIgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnVwZGF0ZVRpbWVzdGFtcHMoKTtcblxuICAgIHNldEFkU2l6ZSh0aGlzLmFkVW5pdC5hZFdpZHRoLCB0aGlzLmFkVW5pdC5hZEhlaWdodCk7XG5cbiAgICBpZiAoIXRoaXMuc3RvcENhbGxiYWNrcykge1xuICAgICAgdGhpcy5hZFNpemVDaGFuZ2VkKCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBZCB2b2x1bWUgd2FzIGNoYW5nZWRcbiAgICpcbiAgICogQG1ldGhvZCBhZFZvbHVtZUNoYW5nZUhhbmRsZXJcbiAgICovXG4gIGFkVm9sdW1lQ2hhbmdlSGFuZGxlciA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudXBkYXRlQWRWb2x1bWUoKTtcbiAgICB0aGlzLnVwZGF0ZVRpbWVzdGFtcHMoKTtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBtZXRWaWV3YWJsZVN0YW5kYXJkXG4gICAqL1xuICBtZXRWaWV3YWJsZVN0YW5kYXJkIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb25zdHJ1Y3Rvci5wYXJlbnQucHJvdG90eXBlLm1ldFZpZXdhYmxlU3RhbmRhcmQuY2FsbCh0aGlzKTtcbiAgICAvL2lmIGFkIGhhcyBub3QgbG9hZGVkIG9yIHN0cmF0ZWQgbWFyayBhcyBub3QgbWVhc3VyYWJsZVxuICAgIHRoaXMuaXNNZWFzdXJhYmxlID0gdGhpcy5hZEhhc0xvYWRlZCAmJiB0aGlzLmFkSGFzU3RhcnRlZCAmJiB0aGlzLmFkSW1wcmVzc2lvbkZpcmVkICYmIHRoaXMuaXNNZWFzdXJhYmxlO1xuICAgIC8vaWYgYWQgd2FzIG5vdCBtZWFzdXJhYmxlIG1hcmsgYXMgbm90IHZpZXdhYmxlIHRvb1xuICAgIHRoaXMuaW5WaWV3ID0gdGhpcy5pc01lYXN1cmFibGUgJiYgdGhpcy5pblZpZXc7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgY2xlYW51cFxuICAgKi9cbiAgY2xlYW51cCA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudW5zdWJzY3JpYmVUb0V2ZW50cygpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGdldFZpZGVvRXZlbnRCaXRzXG4gICAqL1xuICBnZXRWaWRlb0V2ZW50Qml0cyA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAodGhpcy5hZEhhc0xvYWRlZCAgICAgICAgICAgPDwgMCkgK1xuICAgICAgICAgICAodGhpcy5hZEhhc1N0YXJ0ZWQgICAgICAgICAgPDwgMSkgK1xuICAgICAgICAgICAodGhpcy5hZEltcHJlc3Npb25GaXJlZCAgICAgPDwgMikgK1xuICAgICAgICAgICAodGhpcy5hZFZpZGVvQ29tcGxldGVGaXJlZCAgPDwgMykgK1xuICAgICAgICAgICAodGhpcy5hZFVzZXJDbG9zZUZpcmVkICAgICAgPDwgNCkgK1xuICAgICAgICAgICAodGhpcy5hZFNraXBwZWRGaXJlZCAgICAgICAgPDwgNSkgK1xuICAgICAgICAgICAodGhpcy5hZFN0b3BwZWRGaXJlZCAgICAgICAgPDwgNik7XG4gIH0sXG59KTtcblxuZnVuY3Rpb24gVGltZXIodGltZW91dCwgY2FsbGJhY2spIHtcbiAgdGhpcy50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gIHRoaXMudGltZW91dFJlZiA9IDA7XG59XG5cblRpbWVyLnByb3RvdHlwZS5zdGFydFRpbWVyID0gZnVuY3Rpb24oZm9yY2VDYWxsYmFjaykge1xuICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgaWYgKGZvcmNlQ2FsbGJhY2spIHtcbiAgICB0aGlzLmNhbGxiYWNrKGZvcmNlQ2FsbGJhY2spO1xuICB9XG4gIGVsc2UgaWYgKCF0aGlzLnRpbWVvdXRSZWYpIHtcbiAgICB0aGlzLnRpbWVvdXRSZWYgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgdGhhdC5jYWxsYmFjayhmb3JjZUNhbGxiYWNrKTtcbiAgICB9LCB0aGlzLnRpbWVvdXQpO1xuICB9XG59O1xuXG5UaW1lci5wcm90b3R5cGUuc3RvcFRpbWVyID0gZnVuY3Rpb24oZm9yY2VDYWxsYmFjaykge1xuICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0UmVmKTtcbiAgdGhpcy50aW1lb3V0UmVmID0gMDtcblxuICBpZiAoZm9yY2VDYWxsYmFjaykge1xuICAgIHRoaXMuY2FsbGJhY2soZm9yY2VDYWxsYmFjayk7XG4gIH1cbn07XG5cbnZhciBtZXRob2RTZWxlY3Rpb25PcmRlciA9IFtcbiAgICBNcmFpZE1ldGhvZCxcbiAgICBJbnRlcnNlY3Rpb25PYnNlcnZlck1ldGhvZCxcbiAgICBBbXBNZXRob2QsXG4gICAgRGlyZWN0R2VvbWV0cmljTWV0aG9kLFxuICAgIEZyaWVuZGx5RnJhbWVHZW9tZXRyaWNNZXRob2QsXG4gICAgU2FmZUZyYW1lTWV0aG9kLFxuICAgIEZpcmVmb3hQYWludE1ldGhvZCxcbiAgICBQZXJmTWV0aG9kLFxuICAgIEZsYXNoTWVhc3VyZW1lbnRNZXRob2QsXG4gICAgTm90TWVhc3VyYWJsZU1ldGhvZFxuICBdO1xudmFyIHZpZXdhYmlsaXR5QmVhY29uVXJsID0gXCJcIjtcbnZhciB2aWV3cG9ydE1ldGhvZEluc3RhbmNlO1xudmFyIHZpZXdwb3J0TWV0aG9kSXNJbml0aWFsaXplZCA9IGZhbHNlO1xudmFyIHZpZGVvTWV0aG9kSW5zdGFuY2U7XG52YXIgaGFzRmlyZWRCZWFjb24gPSBmYWxzZTtcbnZhciBoYXNGaXJlZE1ldHJpY3NCZWFjb24gPSBmYWxzZTtcbnZhciB0aW1lcjtcbnZhciB2cGFpZFZlcnNpb24gPSBcIjJcIjtcbnZhciBlbGVtZW50RGV0ZWN0ZWQgPSBmYWxzZTtcblxuZnVuY3Rpb24gZ2V0QWRkaXRpb25hbERhdGEoKSB7XG4gIHZhciBhZGRpdGlvbmFsRGF0YSA9IFwidmQ9MVwiO1xuICBhZGRpdGlvbmFsRGF0YSArPSBcIjp2dj1cIiArIHZwYWlkVmVyc2lvbjtcbiAgYWRkaXRpb25hbERhdGEgKz0gXCI6Y2xrPVwiICsgKHZpZGVvTWV0aG9kSW5zdGFuY2UuYWRDbGlja2VkID8gXCIxXCIgOiBcIjBcIik7XG4gIGFkZGl0aW9uYWxEYXRhICs9IFwiOmVycj1cIiArICh2aWRlb01ldGhvZEluc3RhbmNlLmFkRXJyb3JlZCA/IFwiMVwiIDogXCIwXCIpO1xuICBhZGRpdGlvbmFsRGF0YSArPSBcIjp2ZT1cIiArIHZpZGVvTWV0aG9kSW5zdGFuY2UuZ2V0VmlkZW9FdmVudEJpdHMoKTtcbiAgYWRkaXRpb25hbERhdGEgKz0gXCI6ZWQ9XCIgKyAoZWxlbWVudERldGVjdGVkID8gXCIxXCIgOiBcIjBcIik7XG4gIC8vZGVidWcgYXZvYyB0byBjaGVjayBhIGRpZmZlcmV0IHdheSBvZiBkZXRlY3RpbmcgYXZvYyxcbiAgLy90aGlzIGlzIGZvciBub3QgbXV0ZWQgb25seSBvbiBjb21wbGV0aW9uXG4gIC8vYXZvYyBpbiBtZXRyaWNzIGJlYWNvbiBpcyBuZXZlciBtdXRlZFxuICBhZGRpdGlvbmFsRGF0YSArPSBcIjphdm9jPVwiICsgYXJjaGl2ZS5hdm9jX2RlYnVnO1xuICAvL3BsYXllciBzaXplIHdhcyB0YWtlbiBmcm9tIGEgdmFsaWQgcGxheWVyIGVsZW1lbnRcbiAgYWRkaXRpb25hbERhdGEgKz0gXCI6cHN2PVwiICsgKGVsZW1lbnREZXRlY3RlZCAmJiB2aWRlb01ldGhvZEluc3RhbmNlLnBsYXllclNpemVJc1ZhbGlkID8gXCIxXCIgOiBcIjBcIik7XG4gIC8vdmlkZW9TbG90Q2FuQXV0b1BsYXkgaXMgcGFzc2VkIHRvIGluaXQgb2YgdnBhaWQgd3JhcHBlclxuICBhZGRpdGlvbmFsRGF0YSArPSBcIjphcD1cIiArICh2aWRlb01ldGhvZEluc3RhbmNlLmFkVW5pdCAmJiB2aWRlb01ldGhvZEluc3RhbmNlLmFkVW5pdC5fdmlkZW9TbG90Q2FuQXV0b1BsYXkgPyBcIjFcIiA6IFwiMFwiKTtcbiAgcmV0dXJuIGFkZGl0aW9uYWxEYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRBZGRpdGlvbmFsVmlld2FibGVEYXRhKCkge1xuICByZXR1cm4gXCJwbHc9XCIgKyB2aWRlb01ldGhvZEluc3RhbmNlLnBsYXllcldpZHRoICtcbiAgICBcIiZwbGg9XCIgKyB2aWRlb01ldGhvZEluc3RhbmNlLnBsYXllckhlaWdodDtcbn1cblxuZnVuY3Rpb24gZ2V0QWRkaXRpb25hbE1ldHJpY3NEYXRhKCkge1xuICByZXR1cm4gXCJwbHc9XCIgKyB2aWRlb01ldGhvZEluc3RhbmNlLnBsYXllcldpZHRoICtcbiAgICBcIiZwbGg9XCIgKyB2aWRlb01ldGhvZEluc3RhbmNlLnBsYXllckhlaWdodCArXG4gICAgLy9kb250IHNlbnQgYXZvYyBpZiB2b2x1bWUgd2FzIG5vdCByZWNvcmRlZFxuICAgIChhcmNoaXZlLmF2b2MgPj0gMCA/IFwiJmF2b2M9XCIgKyBhcmNoaXZlLmF2b2MgOiBcIlwiKSArXG4gICAgXCImbWl2bD1cIiArIHZpZGVvTWV0aG9kSW5zdGFuY2UubWluVm9sdW1lICtcbiAgICBcIiZtaXZsdD1cIiArIHZpZGVvTWV0aG9kSW5zdGFuY2UubWF4VGltZUF0TWluVm9sdW1lICtcbiAgICBcIiZteHZsPVwiICsgdmlkZW9NZXRob2RJbnN0YW5jZS5tYXhWb2x1bWUgK1xuICAgIFwiJm14dmx0PVwiICsgdmlkZW9NZXRob2RJbnN0YW5jZS5tYXhUaW1lQXRNYXhWb2x1bWU7XG59XG5cbmZ1bmN0aW9uIGZpcmVCZWFjb24gKGZyb21VbmxvYWQpIHtcbiAgLy9kb250IGZpcmUgaWYgYWQgaGFzIG5vdCBsb2FkZWQgYW5kIG5vdCBzdGFydGVkXG4gIGlmICghaGFzRmlyZWRCZWFjb24pIHtcbiAgICB2aWRlb01ldGhvZEluc3RhbmNlLm1ldFZpZXdhYmxlU3RhbmRhcmQoKTtcbiAgICB2aWV3cG9ydE1ldGhvZEluc3RhbmNlLm1ldFZpZXdhYmxlU3RhbmRhcmQoKTtcblxuICAgIGZpcmVWaWV3YWJsZUJlYWNvbih2aWV3YWJpbGl0eUJlYWNvblVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgLy9tZWFzdXJlbWVudFR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgLy8xIC0gbm90IHZpZXdhYmxlIGJlYWNvbnMgYXJlIG5vdCBmaXJlZCBleHBsaWNpdGx5XG4gICAgICAgICAgICAgICAgICAgICAgIC8vMiAtIG5vdCB2aWV3YWJsZSBiZWFjb25zIGFyZSBmaXJlZCBleHBsaWNpdGx5XG4gICAgICAgICAgICAgICAgICAgICAgICcyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgLy9pblZpZXcgaXMgYSBjb21iaW5hdG9uIG9mIGluVmlldyBvZiB2aWRlbyBtZXRob2QgYW5kIHZpZXdwb3J0IG1ldGhvZFxuICAgICAgICAgICAgICAgICAgICAgICB2aWRlb01ldGhvZEluc3RhbmNlLmluVmlldyAmJiB2aWV3cG9ydE1ldGhvZEluc3RhbmNlLmluVmlldyxcbiAgICAgICAgICAgICAgICAgICAgICAgLy9pc01lYXN1cmFibGUgaXMgdHJ1ZSBpZiBib3RoIHZpZGVvIG1ldGhvZCBvciB2aWV3cG9ydCBtZXRob2QgaXMgcG9zc2libGUgYW5kIG5vdCBlcnJvcmVkIG91dFxuICAgICAgICAgICAgICAgICAgICAgICB2aWRlb01ldGhvZEluc3RhbmNlLmlzTWVhc3VyYWJsZSAmJiB2aWV3cG9ydE1ldGhvZEluc3RhbmNlLmlzTWVhc3VyYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgdmlld3BvcnRNZXRob2RJbnN0YW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICAgZ2V0QWRkaXRpb25hbFZpZXdhYmxlRGF0YSgpLFxuICAgICAgICAgICAgICAgICAgICAgICBnZXRBZGRpdGlvbmFsRGF0YSgpICsgXCI6ZnU9XCIgKyAoZnJvbVVubG9hZCA/IFwiMVwiIDogXCIwXCIpKTtcbiAgfVxuICBoYXNGaXJlZEJlYWNvbiA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIGZpcmVNZXRyaWNzQmVhY29uV3JhcHBlcigpIHtcbiAgaWYgKCFoYXNGaXJlZE1ldHJpY3NCZWFjb24pIHtcbiAgICBmaXJlTWV0cmljc0JlYWNvbihhcmNoaXZlLCB2aWV3YWJpbGl0eUJlYWNvblVybCwgdmlld3BvcnRNZXRob2RJbnN0YW5jZSwgZ2V0QWRkaXRpb25hbE1ldHJpY3NEYXRhKCksIGdldEFkZGl0aW9uYWxEYXRhKCkpO1xuICB9XG4gIGhhc0ZpcmVkTWV0cmljc0JlYWNvbiA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gIGZpcmVCZWFjb24odHJ1ZSk7XG4gIGZpcmVNZXRyaWNzQmVhY29uV3JhcHBlcigpO1xuICB2aWRlb01ldGhvZEluc3RhbmNlLmNsZWFudXAoKTtcbiAgdmlld3BvcnRNZXRob2RJbnN0YW5jZS5jbGVhbnVwKCk7XG59XG5cbmZ1bmN0aW9uIGNsZWFudXBBbGwoKSB7XG4gIGNsZWFudXAoKTtcbiAgdW5yZWdpc3Rlckxpc3RlbmVyKFVOTE9BRF9FVkVOVF9OQU1FLCB1bmxvYWRIYW5kbGVyKTtcbiAgdW5yZWdpc3Rlckxpc3RlbmVyKEJFRk9SRVVOTE9BRF9FVkVOVF9OQU1FLCBiZWZvcmVVbmxvYWRIYW5kbGVyKTtcbn1cblxuZnVuY3Rpb24gdW5sb2FkSGFuZGxlcigpIHtcbiAgY2xlYW51cCgpO1xuICB1bnJlZ2lzdGVyTGlzdGVuZXIoVU5MT0FEX0VWRU5UX05BTUUsIHVubG9hZEhhbmRsZXIpO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVVbmxvYWRIYW5kbGVyKCkge1xuICBjbGVhbnVwKCk7XG4gIHVucmVnaXN0ZXJMaXN0ZW5lcihCRUZPUkVVTkxPQURfRVZFTlRfTkFNRSwgYmVmb3JlVW5sb2FkSGFuZGxlcik7XG59XG5cbmZ1bmN0aW9uIGluVmlld0NhbGxiYWNrKGZvcmNlQmVhY29uKSB7XG4gIC8vd2hlbiBhZCBpcyBzdG9wcGVkIG9yIGVuZGVkLCBjb250YWluZXIgaWZyYW1lIHdpbGwgYmUgcmVtb3ZlZC5cbiAgLy91bmxvYWQgaGFuZGxlciBpcyBub3QgY2FsbGVkIGluIHRoaXMgY2FzZS4gU28gZm9yY2UgaXQuXG4gIGlmIChmb3JjZUJlYWNvbikge1xuICAgIGNsZWFudXBBbGwoKTtcbiAgfVxuICBlbHNlIGlmICh2aWRlb01ldGhvZEluc3RhbmNlLmlzQ3VycmVudGx5SW5WaWV3ICYmIHZpZXdwb3J0TWV0aG9kSW5zdGFuY2UuaXNDdXJyZW50bHlJblZpZXcpIHtcbiAgICB0aW1lci5zdGFydFRpbWVyKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gb3V0T2ZWaWV3Q2FsbGJhY2soZm9yY2VCZWFjb24pIHtcbiAgdGltZXIuc3RvcFRpbWVyKCk7XG5cbiAgLy93aGVuIGFkIGlzIHN0b3BwZWQgb3IgZW5kZWQsIGNvbnRhaW5lciBpZnJhbWUgd2lsbCBiZSByZW1vdmVkLlxuICAvL3VubG9hZCBoYW5kbGVyIGlzIG5vdCBjYWxsZWQgaW4gdGhpcyBjYXNlLiBTbyBmb3JjZSBpdC5cbiAgaWYgKGZvcmNlQmVhY29uKSB7XG4gICAgY2xlYW51cEFsbCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluaXQgKHBhcmFtcykge1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybjtcbiAgfVxuICB2aWV3YWJpbGl0eUJlYWNvblVybCA9IHBhcmFtcy5hZFBhcmFtcyAmJiBwYXJhbXMuYWRQYXJhbXMudmlld2FiaWxpdHlCZWFjb25Vcmw7XG4gIGlmICghdmlld2FiaWxpdHlCZWFjb25VcmwgfHwgdmlld2FiaWxpdHlCZWFjb25VcmwgPT09IFwiXCIpIHtcbiAgICAvLyBzaG9ydCB0aGUgaW5pdCBpZiB0aGVyZSB3YXMgbm8gdmlld2FiaWxpdHlCZWFjb25VcmwgZmV0Y2hlZFxuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChwYXJhbXMudnBhaWRWZXJzaW9uKSB7XG4gICAgdnBhaWRWZXJzaW9uID0gcGFyYW1zLnZwYWlkVmVyc2lvbjtcbiAgfVxuXG4gIGlmIChwYXJhbXMudmlkZW9TbG90ICYmICFzaXplSXNCZWxvd1RocmVzaG9sZChwYXJhbXMudmlkZW9TbG90KSkge1xuICAgIC8vc2V0IGJvdGggYWRFbGVtZW50IGFuZCBhZEVsZW1lbnRXcmFwcGVyIHRvIHZpZGVvU2xvdFxuICAgIC8vYWRFbGVtZW50V3JhcHBlciBpcyB1c2VkIGluIHZpZXdwb3J0IG1ldGhvZFxuICAgIGVsZW1lbnREZXRlY3RlZCA9IHNldHVwKHBhcmFtcy52aWRlb1Nsb3QsIHBhcmFtcy52aWRlb1Nsb3QpO1xuICB9XG4gIGVsc2UgaWYgKHBhcmFtcy5zbG90KSB7XG4gICAgZWxlbWVudERldGVjdGVkID0gc2V0dXAocGFyYW1zLnNsb3QpO1xuICB9XG4gIHNldEFkU2l6ZShwYXJhbXMuYWRXaWR0aCwgcGFyYW1zLmFkSGVpZ2h0KTtcblxuICB0aW1lciA9IG5ldyBUaW1lcihWSURFT19QTEFZX0RVUkFUSU9OX1RIUkVTSE9MRCwgZmlyZUJlYWNvbik7XG5cbiAgdmFyIG1ldGhvZENsYXNzO1xuICBpZiAoZWxlbWVudERldGVjdGVkKSB7XG4gICAgdmFyIGkgPSAwO1xuICAgIGZvcig7IGkgPCBtZXRob2RTZWxlY3Rpb25PcmRlci5sZW5ndGggJiYgIW1ldGhvZFNlbGVjdGlvbk9yZGVyW2ldLnByb3RvdHlwZS5jYW5BcHBseU1ldGhvZCgpOyBpKyspIHt9XG4gICAgbWV0aG9kQ2xhc3MgPSBtZXRob2RTZWxlY3Rpb25PcmRlcltpXTtcbiAgfVxuICBlbHNlIHtcbiAgICAvL2lmIG5vIGVsZW1lbnQgd2FzIGRldGVjdCBmb3IgcGxheWVyLCB0aGVuIG1hcmsgYXMgbm90IG1lYXN1cmFibGVcbiAgICBtZXRob2RDbGFzcyA9IE5vdE1lYXN1cmFibGVNZXRob2Q7XG4gIH1cbiAgdmlld3BvcnRNZXRob2RJbnN0YW5jZSA9IG5ldyBtZXRob2RDbGFzcyh7XG4gICAgYWRXaWR0aCA6IHdpZHRoLFxuICAgIGFkSGVpZ2h0IDogaGVpZ2h0LFxuICAgIGluVmlld0NhbGxiYWNrIDogaW5WaWV3Q2FsbGJhY2ssXG4gICAgb3V0T2ZWaWV3Q2FsbGJhY2sgOiBvdXRPZlZpZXdDYWxsYmFjayxcbiAgfSk7XG5cbiAgdmlkZW9NZXRob2RJbnN0YW5jZSA9IG5ldyBWaWRlb01ldGhvZCh7XG4gICAgYWRVbml0IDogcGFyYW1zLnZwYWlkSlNXcmFwcGVyLFxuICAgIHBsYXllcklkIDogcGFyYW1zLmFkUGFyYW1zLnBsYXllcklkLFxuICAgIGluVmlld0NhbGxiYWNrIDogaW5WaWV3Q2FsbGJhY2ssXG4gICAgb3V0T2ZWaWV3Q2FsbGJhY2sgOiBvdXRPZlZpZXdDYWxsYmFjayxcbiAgICBhZExvYWRlZCA6IGZ1bmN0aW9uKCkge1xuICAgICAgLy9jYWxsIGluaXQgb24gdmlld3BvcnRNZXRob2RJbnN0YW5jZSBvbmNlIHRoZSBhZCBoYXMgbG9hZGVkXG4gICAgICB2aWV3cG9ydE1ldGhvZEluc3RhbmNlLmluaXQoKTtcbiAgICAgIHZpZXdwb3J0TWV0aG9kSXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfSxcbiAgICBhZFNpemVDaGFuZ2VkIDogZnVuY3Rpb24oKSB7XG4gICAgICAvL2NhbGwgdGhpcyBvbmx5IGlmIHZpZXdwb3J0TWV0aG9kSW5zdGFuY2UgaXMgaW5pdGlhbGl6ZWRcbiAgICAgIGlmICh2aWV3cG9ydE1ldGhvZElzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgdmlld3BvcnRNZXRob2RJbnN0YW5jZS5yZXNldCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWRWaWRlb0NvbXBsZXRlIDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodmlkZW9NZXRob2RJbnN0YW5jZS5pc0N1cnJlbnRseUluVmlldyAmJiB2aWV3cG9ydE1ldGhvZEluc3RhbmNlLmlzQ3VycmVudGx5SW5WaWV3KSB7XG4gICAgICAgIGlmICh2aWRlb01ldGhvZEluc3RhbmNlLm1pblZvbHVtZSA+IDAgJiYgdmlkZW9NZXRob2RJbnN0YW5jZS5taW5Wb2x1bWUgIT09IDk5OSkge1xuICAgICAgICAgIGFyY2hpdmUuYXZvYyA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmlkZW9NZXRob2RJbnN0YW5jZS5taW5Wb2x1bWUgPT09IDk5OSkge1xuICAgICAgICAgIC8vbWFrZSBhdm9jIC0xIGlmIG1pblZvbHVlIHdhcyA5OTksIGllIG5vdCByZWNvcmRlZFxuICAgICAgICAgIGFyY2hpdmUuYXZvYyA9IC0xO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh2aWRlb01ldGhvZEluc3RhbmNlLmFkVW5pdCAmJiB2aWRlb01ldGhvZEluc3RhbmNlLmFkVW5pdC5nZXRBZFZvbHVtZSkge1xuICAgICAgICBhcmNoaXZlLmF2b2NfZGVidWcgPSB2aWRlb01ldGhvZEluc3RhbmNlLmFkVW5pdC5nZXRBZFZvbHVtZSgpID4gMCA/IFwiMVwiIDogXCIyXCI7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYXJjaGl2ZS5hdm9jX2RlYnVnID0gXCIwXCI7XG4gICAgICB9XG4gICAgfSxcbiAgfSk7XG4gIHZpZGVvTWV0aG9kSW5zdGFuY2UuaW5pdCgpO1xuXG4gIHJlZ2lzdGVyTGlzdGVuZXIoUkVTSVpFX0VWRU5UX05BTUUsIGZ1bmN0aW9uKCkge1xuICAgIHNldEFkU2l6ZSgpO1xuICAgIGlmICh2aWV3cG9ydE1ldGhvZElzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIHZpZXdwb3J0TWV0aG9kSW5zdGFuY2UucmVzZXQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJlZ2lzdGVyTGlzdGVuZXIoVU5MT0FEX0VWRU5UX05BTUUsIHVubG9hZEhhbmRsZXIpO1xuICByZWdpc3Rlckxpc3RlbmVyKEJFRk9SRVVOTE9BRF9FVkVOVF9OQU1FLCBiZWZvcmVVbmxvYWRIYW5kbGVyKTtcblxuICBzZXR1cFRyYWNrZXJzKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGluaXQ7IiwiLyplc2xpbnQtZGlzYWJsZSovXG4vKkNvcHlyaWdodCAoYykgMjAxMS0yMDE2IE1vYXQgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLiovXG52YXIgaW5pdE1vYXQgPSBmdW5jdGlvbiBpbml0TW9hdFRyYWNraW5nKGIsYyxnLHApe3ZhciBsPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIiksZj17ZXZlbnRzOltdLGFkZEV2ZW50OmZ1bmN0aW9uKGEpe2Quc2VuZEV2ZW50PyhmLmV2ZW50cyYmKGQuc2VuZEV2ZW50KGYuZXZlbnRzKSxmLmV2ZW50cz0hMSksZC5zZW5kRXZlbnQoYSkpOmYuZXZlbnRzLnB1c2goYSl9fSxhPWZ1bmN0aW9uKGEpe3JldHVybiBmdW5jdGlvbigpe3ZhciBkPS0xLGg7YiYmYi5nZXRBZFZvbHVtZSYmKGg9Yi5nZXRBZFZvbHVtZSgpKTtcIm51bWJlclwiPT10eXBlb2YgaCYmIWlzTmFOKGgpJiYwPD1oJiYoZD1oKTtmLmFkZEV2ZW50KHt0eXBlOmEsYWRWb2x1bWU6ZH0pO2lmKC0xIT09cS5pbmRleE9mKGEpJiZiJiZiLnVuc3Vic2NyaWJlJiYhbil7bj0hMDtmb3IodmFyIGMgaW4gZSlpZihlLmhhc093blByb3BlcnR5JiZlLmhhc093blByb3BlcnR5KGMpKXRyeXtiLnVuc3Vic2NyaWJlKGVbY10sYyl9Y2F0Y2goZyl7fX19fSxcbmQ9e2FkRGF0YTp7aWRzOmcsdnBhaWQ6YixidWlsZDpcImNjMDdhODAtY2xlYW5cIn0sZGlzcGF0Y2hFdmVudDpmLmFkZEV2ZW50fTtnPVwiX21vYXRBcGlcIitNYXRoLmZsb29yKDFFOCpNYXRoLnJhbmRvbSgpKTt2YXIgZT17QWRTdGFydGVkOmEoXCJBZFN0YXJ0ZWRcIiksQWRTdG9wcGVkOmEoXCJBZFN0b3BwZWRcIiksQWRTa2lwcGVkOmEoXCJBZFNraXBwZWRcIiksQWRMb2FkZWQ6YShcIkFkTG9hZGVkXCIpLEFkTGluZWFyQ2hhbmdlOmEoXCJBZExpbmVhckNoYW5nZVwiKSxBZFNpemVDaGFuZ2U6YShcIkFkU2l6ZUNoYW5nZVwiKSxBZEV4cGFuZGVkQ2hhbmdlOmEoXCJBZEV4cGFuZGVkQ2hhbmdlXCIpLEFkU2tpcHBhYmxlU3RhdGVDaGFuZ2U6YShcIkFkU2tpcHBhYmxlU3RhdGVDaGFuZ2VcIiksQWREdXJhdGlvbkNoYW5nZTphKFwiQWREdXJhdGlvbkNoYW5nZVwiKSxBZFJlbWFpbmluZ1RpbWVDaGFuZ2U6YShcIkFkUmVtYWluaW5nVGltZUNoYW5nZVwiKSxBZFZvbHVtZUNoYW5nZTphKFwiQWRWb2x1bWVDaGFuZ2VcIiksXG5BZEltcHJlc3Npb246YShcIkFkSW1wcmVzc2lvblwiKSxBZENsaWNrVGhydTphKFwiQWRDbGlja1RocnVcIiksQWRJbnRlcmFjdGlvbjphKFwiQWRJbnRlcmFjdGlvblwiKSxBZFZpZGVvU3RhcnQ6YShcIkFkVmlkZW9TdGFydFwiKSxBZFZpZGVvRmlyc3RRdWFydGlsZTphKFwiQWRWaWRlb0ZpcnN0UXVhcnRpbGVcIiksQWRWaWRlb01pZHBvaW50OmEoXCJBZFZpZGVvTWlkcG9pbnRcIiksQWRWaWRlb1RoaXJkUXVhcnRpbGU6YShcIkFkVmlkZW9UaGlyZFF1YXJ0aWxlXCIpLEFkVmlkZW9Db21wbGV0ZTphKFwiQWRWaWRlb0NvbXBsZXRlXCIpLEFkVXNlckFjY2VwdEludml0YXRpb246YShcIkFkVXNlckFjY2VwdEludml0YXRpb25cIiksQWRVc2VyTWluaW1pemU6YShcIkFkVXNlck1pbmltaXplXCIpLEFkVXNlckNsb3NlOmEoXCJBZFVzZXJDbG9zZVwiKSxBZFBhdXNlZDphKFwiQWRQYXVzZWRcIiksQWRQbGF5aW5nOmEoXCJBZFBsYXlpbmdcIiksQWRFcnJvcjphKFwiQWRFcnJvclwiKX0sbj0hMSxxPVtcIkFkU3RvcHBlZFwiLFwiQWRTa2lwcGVkXCIsXG5cIkFkVmlkZW9Db21wbGV0ZVwiXTsoZnVuY3Rpb24oKXtpZihiJiZiLnN1YnNjcmliZSlmb3IodmFyIGEgaW4gZSllLmhhc093blByb3BlcnR5JiZlLmhhc093blByb3BlcnR5KGEpJiZiLnN1YnNjcmliZShlW2FdLGEpfSkoKTt2YXIgayxtO3RyeXtrPWMub3duZXJEb2N1bWVudCxtPWsuZGVmYXVsdFZpZXd8fGsucGFyZW50V2luZG93fWNhdGNoKHIpe2s9ZG9jdW1lbnQsbT13aW5kb3d9bVtnXT1kO2wudHlwZT1cInRleHQvamF2YXNjcmlwdFwiO2MmJmMuaW5zZXJ0QmVmb3JlKGwsYy5jaGlsZE5vZGVzWzBdfHxudWxsKTtsLnNyYz1cImh0dHBzOi8vei5tb2F0YWRzLmNvbS9cIitwK1wiL21vYXR2aWRlby5qcyNcIitnO3JldHVybiBkfTtcblxuLyplc2xpbnQtZW5hYmxlKi9cblxubW9kdWxlLmV4cG9ydHMgPSBpbml0TW9hdDtcbiIsIi8qIVxuICogYXN5bmNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jYW9sYW4vYXN5bmNcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMC0yMDE0IENhb2xhbiBNY01haG9uXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBhc3luYyA9IHt9O1xuICAgIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICAgIGZ1bmN0aW9uIGlkZW50aXR5KHYpIHtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvQm9vbCh2KSB7XG4gICAgICAgIHJldHVybiAhIXY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG5vdElkKHYpIHtcbiAgICAgICAgcmV0dXJuICF2O1xuICAgIH1cblxuICAgIC8vIGdsb2JhbCBvbiB0aGUgc2VydmVyLCB3aW5kb3cgaW4gdGhlIGJyb3dzZXJcbiAgICB2YXIgcHJldmlvdXNfYXN5bmM7XG5cbiAgICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCAoYHNlbGZgKSBpbiB0aGUgYnJvd3NlciwgYGdsb2JhbGBcbiAgICAvLyBvbiB0aGUgc2VydmVyLCBvciBgdGhpc2AgaW4gc29tZSB2aXJ0dWFsIG1hY2hpbmVzLiBXZSB1c2UgYHNlbGZgXG4gICAgLy8gaW5zdGVhZCBvZiBgd2luZG93YCBmb3IgYFdlYldvcmtlcmAgc3VwcG9ydC5cbiAgICB2YXIgcm9vdCA9IHR5cGVvZiBzZWxmID09PSAnb2JqZWN0JyAmJiBzZWxmLnNlbGYgPT09IHNlbGYgJiYgc2VsZiB8fFxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcgJiYgZ2xvYmFsLmdsb2JhbCA9PT0gZ2xvYmFsICYmIGdsb2JhbCB8fFxuICAgICAgICAgICAgdGhpcztcblxuICAgIGlmIChyb290ICE9IG51bGwpIHtcbiAgICAgICAgcHJldmlvdXNfYXN5bmMgPSByb290LmFzeW5jO1xuICAgIH1cblxuICAgIGFzeW5jLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBwcmV2aW91c19hc3luYztcbiAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvbmx5X29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZm4gPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBjcm9zcy1icm93c2VyIGNvbXBhdGlibGl0eSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgdmFyIF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgICB2YXIgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIF90b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIC8vIFBvcnRlZCBmcm9tIHVuZGVyc2NvcmUuanMgaXNPYmplY3RcbiAgICB2YXIgX2lzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9pc0FycmF5TGlrZShhcnIpIHtcbiAgICAgICAgcmV0dXJuIF9pc0FycmF5KGFycikgfHwgKFxuICAgICAgICAgICAgLy8gaGFzIGEgcG9zaXRpdmUgaW50ZWdlciBsZW5ndGggcHJvcGVydHlcbiAgICAgICAgICAgIHR5cGVvZiBhcnIubGVuZ3RoID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICBhcnIubGVuZ3RoID49IDAgJiZcbiAgICAgICAgICAgIGFyci5sZW5ndGggJSAxID09PSAwXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FycmF5RWFjaChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFwKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoLFxuICAgICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JhbmdlKGNvdW50KSB7XG4gICAgICAgIHJldHVybiBfbWFwKEFycmF5KGNvdW50KSwgZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIGk7IH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZWR1Y2UoYXJyLCBpdGVyYXRvciwgbWVtbykge1xuICAgICAgICBfYXJyYXlFYWNoKGFyciwgZnVuY3Rpb24gKHgsIGksIGEpIHtcbiAgICAgICAgICAgIG1lbW8gPSBpdGVyYXRvcihtZW1vLCB4LCBpLCBhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mb3JFYWNoT2Yob2JqZWN0LCBpdGVyYXRvcikge1xuICAgICAgICBfYXJyYXlFYWNoKF9rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5kZXhPZihhcnIsIGl0ZW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICB2YXIgX2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBrZXlzID0gW107XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGspO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlzO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfa2V5SXRlcmF0b3IoY29sbCkge1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB2YXIgbGVuO1xuICAgICAgICB2YXIga2V5cztcbiAgICAgICAgaWYgKF9pc0FycmF5TGlrZShjb2xsKSkge1xuICAgICAgICAgICAgbGVuID0gY29sbC5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPCBsZW4gPyBpIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXlzID0gX2tleXMoY29sbCk7XG4gICAgICAgICAgICBsZW4gPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGtleXNbaV0gOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNpbWlsYXIgdG8gRVM2J3MgcmVzdCBwYXJhbSAoaHR0cDovL2FyaXlhLm9maWxhYnMuY29tLzIwMTMvMDMvZXM2LWFuZC1yZXN0LXBhcmFtZXRlci5odG1sKVxuICAgIC8vIFRoaXMgYWNjdW11bGF0ZXMgdGhlIGFyZ3VtZW50cyBwYXNzZWQgaW50byBhbiBhcnJheSwgYWZ0ZXIgYSBnaXZlbiBpbmRleC5cbiAgICAvLyBGcm9tIHVuZGVyc2NvcmUuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZS9wdWxsLzIxNDApLlxuICAgIGZ1bmN0aW9uIF9yZXN0UGFyYW0oZnVuYywgc3RhcnRJbmRleCkge1xuICAgICAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCA9PSBudWxsID8gZnVuYy5sZW5ndGggLSAxIDogK3N0YXJ0SW5kZXg7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChhcmd1bWVudHMubGVuZ3RoIC0gc3RhcnRJbmRleCwgMCk7XG4gICAgICAgICAgICB2YXIgcmVzdCA9IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXggKyBzdGFydEluZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAoc3RhcnRJbmRleCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJndW1lbnRzWzBdLCByZXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEN1cnJlbnRseSB1bnVzZWQgYnV0IGhhbmRsZSBjYXNlcyBvdXRzaWRlIG9mIHRoZSBzd2l0Y2ggc3RhdGVtZW50OlxuICAgICAgICAgICAgLy8gdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgICAgICAgICAvLyBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBzdGFydEluZGV4OyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyAgICAgYXJnc1tpbmRleF0gPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gYXJnc1tzdGFydEluZGV4XSA9IHJlc3Q7XG4gICAgICAgICAgICAvLyByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yKHZhbHVlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBleHBvcnRlZCBhc3luYyBtb2R1bGUgZnVuY3Rpb25zIC8vLy9cblxuICAgIC8vLy8gbmV4dFRpY2sgaW1wbGVtZW50YXRpb24gd2l0aCBicm93c2VyLWNvbXBhdGlibGUgZmFsbGJhY2sgLy8vL1xuXG4gICAgLy8gY2FwdHVyZSB0aGUgZ2xvYmFsIHJlZmVyZW5jZSB0byBndWFyZCBhZ2FpbnN0IGZha2VUaW1lciBtb2Nrc1xuICAgIHZhciBfc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXRJbW1lZGlhdGU7XG5cbiAgICB2YXIgX2RlbGF5ID0gX3NldEltbWVkaWF0ZSA/IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIC8vIG5vdCBhIGRpcmVjdCBhbGlhcyBmb3IgSUUxMCBjb21wYXRpYmlsaXR5XG4gICAgICAgIF9zZXRJbW1lZGlhdGUoZm4pO1xuICAgIH0gOiBmdW5jdGlvbihmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcHJvY2Vzcy5uZXh0VGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IHByb2Nlc3MubmV4dFRpY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBfZGVsYXk7XG4gICAgfVxuICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IF9zZXRJbW1lZGlhdGUgPyBfZGVsYXkgOiBhc3luYy5uZXh0VGljaztcblxuXG4gICAgYXN5bmMuZm9yRWFjaCA9XG4gICAgYXN5bmMuZWFjaCA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaFNlcmllcyA9XG4gICAgYXN5bmMuZWFjaFNlcmllcyA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG5cbiAgICBhc3luYy5mb3JFYWNoTGltaXQgPVxuICAgIGFzeW5jLmVhY2hMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIF9lYWNoT2ZMaW1pdChsaW1pdCkoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2YgPVxuICAgIGFzeW5jLmVhY2hPZiA9IGZ1bmN0aW9uIChvYmplY3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmplY3QgPSBvYmplY3QgfHwgW107XG5cbiAgICAgICAgdmFyIGl0ZXIgPSBfa2V5SXRlcmF0b3Iob2JqZWN0KTtcbiAgICAgICAgdmFyIGtleSwgY29tcGxldGVkID0gMDtcblxuICAgICAgICB3aGlsZSAoKGtleSA9IGl0ZXIoKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5LCBvbmx5X29uY2UoZG9uZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbXBsZXRlZCA9PT0gMCkgY2FsbGJhY2sobnVsbCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZG9uZShlcnIpIHtcbiAgICAgICAgICAgIGNvbXBsZXRlZC0tO1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBrZXkgaXMgbnVsbCBpbiBjYXNlIGl0ZXJhdG9yIGlzbid0IGV4aGF1c3RlZFxuICAgICAgICAgICAgLy8gYW5kIGRvbmUgcmVzb2x2ZWQgc3luY2hyb25vdXNseS5cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gbnVsbCAmJiBjb21wbGV0ZWQgPD0gMCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZlNlcmllcyA9XG4gICAgYXN5bmMuZWFjaE9mU2VyaWVzID0gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5X29uY2UoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoaXRlcmF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZXJhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpdGVyYXRlKCk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5mb3JFYWNoT2ZMaW1pdCA9XG4gICAgYXN5bmMuZWFjaE9mTGltaXQgPSBmdW5jdGlvbiAob2JqLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9lYWNoT2ZMaW1pdChsaW1pdCkob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZWFjaE9mTGltaXQobGltaXQpIHtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgICAgIGlmIChsaW1pdCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBydW5uaW5nID0gMDtcbiAgICAgICAgICAgIHZhciBlcnJvcmVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIChmdW5jdGlvbiByZXBsZW5pc2ggKCkge1xuICAgICAgICAgICAgICAgIGlmIChkb25lICYmIHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKHJ1bm5pbmcgPCBsaW1pdCAmJiAhZXJyb3JlZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5uaW5nIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBydW5uaW5nICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG9ialtrZXldLCBrZXksIG9ubHlfb25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxlbmlzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWwoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZiwgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1BhcmFsbGVsTGltaXQoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihfZWFjaE9mTGltaXQobGltaXQpLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvU2VyaWVzKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihhc3luYy5lYWNoT2ZTZXJpZXMsIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXN5bmNNYXAoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBhcnIgPSBhcnIgfHwgW107XG4gICAgICAgIHZhciByZXN1bHRzID0gX2lzQXJyYXlMaWtlKGFycikgPyBbXSA6IHt9O1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5tYXAgPSBkb1BhcmFsbGVsKF9hc3luY01hcCk7XG4gICAgYXN5bmMubWFwU2VyaWVzID0gZG9TZXJpZXMoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfYXN5bmNNYXApO1xuXG4gICAgLy8gcmVkdWNlIG9ubHkgaGFzIGEgc2VyaWVzIHZlcnNpb24sIGFzIGRvaW5nIHJlZHVjZSBpbiBwYXJhbGxlbCB3b24ndFxuICAgIC8vIHdvcmsgaW4gbWFueSBzaXR1YXRpb25zLlxuICAgIGFzeW5jLmluamVjdCA9XG4gICAgYXN5bmMuZm9sZGwgPVxuICAgIGFzeW5jLnJlZHVjZSA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBmdW5jdGlvbiAoeCwgaSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG1lbW8sIHgsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICBtZW1vID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbWVtbyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5mb2xkciA9XG4gICAgYXN5bmMucmVkdWNlUmlnaHQgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJldmVyc2VkID0gX21hcChhcnIsIGlkZW50aXR5KS5yZXZlcnNlKCk7XG4gICAgICAgIGFzeW5jLnJlZHVjZShyZXZlcnNlZCwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudHJhbnNmb3JtID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGl0ZXJhdG9yO1xuICAgICAgICAgICAgaXRlcmF0b3IgPSBtZW1vO1xuICAgICAgICAgICAgbWVtbyA9IF9pc0FycmF5KGFycikgPyBbXSA6IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgYXN5bmMuZWFjaE9mKGFyciwgZnVuY3Rpb24odiwgaywgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG1lbW8sIHYsIGssIGNiKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIG1lbW8pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2ZpbHRlcihlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtpbmRleDogaW5kZXgsIHZhbHVlOiB4fSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soX21hcChyZXN1bHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgICAgICAgICB9KSwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuc2VsZWN0ID1cbiAgICBhc3luYy5maWx0ZXIgPSBkb1BhcmFsbGVsKF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0TGltaXQgPVxuICAgIGFzeW5jLmZpbHRlckxpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0U2VyaWVzID1cbiAgICBhc3luYy5maWx0ZXJTZXJpZXMgPSBkb1NlcmllcyhfZmlsdGVyKTtcblxuICAgIGZ1bmN0aW9uIF9yZWplY3QoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBfZmlsdGVyKGVhY2hmbiwgYXJyLCBmdW5jdGlvbih2YWx1ZSwgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgY2IoIXYpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgYXN5bmMucmVqZWN0ID0gZG9QYXJhbGxlbChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RTZXJpZXMgPSBkb1NlcmllcyhfcmVqZWN0KTtcblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVUZXN0ZXIoZWFjaGZuLCBjaGVjaywgZ2V0UmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2IpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNiKSBjYihnZXRSZXN1bHQoZmFsc2UsIHZvaWQgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZWUoeCwgXywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNiKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2IgJiYgY2hlY2sodikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKGdldFJlc3VsdCh0cnVlLCB4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYiA9IGl0ZXJhdG9yID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGxpbWl0LCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3I7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IgPSBsaW1pdDtcbiAgICAgICAgICAgICAgICBlYWNoZm4oYXJyLCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMuYW55ID1cbiAgICBhc3luYy5zb21lID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuc29tZUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgdG9Cb29sLCBpZGVudGl0eSk7XG5cbiAgICBhc3luYy5hbGwgPVxuICAgIGFzeW5jLmV2ZXJ5ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIG5vdElkLCBub3RJZCk7XG5cbiAgICBhc3luYy5ldmVyeUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgbm90SWQsIG5vdElkKTtcblxuICAgIGZ1bmN0aW9uIF9maW5kR2V0UmVzdWx0KHYsIHgpIHtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIGFzeW5jLmRldGVjdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdFNlcmllcyA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mU2VyaWVzLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdExpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcblxuICAgIGFzeW5jLnNvcnRCeSA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5tYXAoYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uIChlcnIsIGNyaXRlcmlhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwge3ZhbHVlOiB4LCBjcml0ZXJpYTogY3JpdGVyaWF9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgX21hcChyZXN1bHRzLnNvcnQoY29tcGFyYXRvciksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBjb21wYXJhdG9yKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWEsIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgICAgICAgIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5hdXRvID0gZnVuY3Rpb24gKHRhc2tzLCBjb25jdXJyZW5jeSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIGNvbmN1cnJlbmN5IGlzIG9wdGlvbmFsLCBzaGlmdCB0aGUgYXJncy5cbiAgICAgICAgICAgIGNhbGxiYWNrID0gY29uY3VycmVuY3k7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIGtleXMgPSBfa2V5cyh0YXNrcyk7XG4gICAgICAgIHZhciByZW1haW5pbmdUYXNrcyA9IGtleXMubGVuZ3RoO1xuICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSByZW1haW5pbmdUYXNrcztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHRzID0ge307XG4gICAgICAgIHZhciBydW5uaW5nVGFza3MgPSAwO1xuXG4gICAgICAgIHZhciBoYXNFcnJvciA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoZm4pIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy51bnNoaWZ0KGZuKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgdmFyIGlkeCA9IF9pbmRleE9mKGxpc3RlbmVycywgZm4pO1xuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSBsaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gdGFza0NvbXBsZXRlKCkge1xuICAgICAgICAgICAgcmVtYWluaW5nVGFza3MtLTtcbiAgICAgICAgICAgIF9hcnJheUVhY2gobGlzdGVuZXJzLnNsaWNlKDApLCBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF9hcnJheUVhY2goa2V5cywgZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIGlmIChoYXNFcnJvcikgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHRhc2sgPSBfaXNBcnJheSh0YXNrc1trXSkgPyB0YXNrc1trXTogW3Rhc2tzW2tdXTtcbiAgICAgICAgICAgIHZhciB0YXNrQ2FsbGJhY2sgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIHJ1bm5pbmdUYXNrcy0tO1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzYWZlUmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBfZm9yRWFjaE9mKHJlc3VsdHMsIGZ1bmN0aW9uKHZhbCwgcmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNbcmtleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGhhc0Vycm9yID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHNhZmVSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUodGFza0NvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1aXJlcyA9IHRhc2suc2xpY2UoMCwgdGFzay5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgZGVhZC1sb2Nrc1xuICAgICAgICAgICAgdmFyIGxlbiA9IHJlcXVpcmVzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkZXA7XG4gICAgICAgICAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShkZXAgPSB0YXNrc1tyZXF1aXJlc1tsZW5dXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXMgbm9uZXhpc3RlbnQgZGVwZW5kZW5jeSBpbiAnICsgcmVxdWlyZXMuam9pbignLCAnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfaXNBcnJheShkZXApICYmIF9pbmRleE9mKGRlcCwgaykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBjeWNsaWMgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gcmVhZHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmdUYXNrcyA8IGNvbmN1cnJlbmN5ICYmIF9yZWR1Y2UocmVxdWlyZXMsIGZ1bmN0aW9uIChhLCB4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYSAmJiByZXN1bHRzLmhhc093blByb3BlcnR5KHgpKTtcbiAgICAgICAgICAgICAgICB9LCB0cnVlKSAmJiAhcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgcnVubmluZ1Rhc2tzKys7XG4gICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcigpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICBydW5uaW5nVGFza3MrKztcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuXG4gICAgYXN5bmMucmV0cnkgPSBmdW5jdGlvbih0aW1lcywgdGFzaywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIERFRkFVTFRfVElNRVMgPSA1O1xuICAgICAgICB2YXIgREVGQVVMVF9JTlRFUlZBTCA9IDA7XG5cbiAgICAgICAgdmFyIGF0dGVtcHRzID0gW107XG5cbiAgICAgICAgdmFyIG9wdHMgPSB7XG4gICAgICAgICAgICB0aW1lczogREVGQVVMVF9USU1FUyxcbiAgICAgICAgICAgIGludGVydmFsOiBERUZBVUxUX0lOVEVSVkFMXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gcGFyc2VUaW1lcyhhY2MsIHQpe1xuICAgICAgICAgICAgaWYodHlwZW9mIHQgPT09ICdudW1iZXInKXtcbiAgICAgICAgICAgICAgICBhY2MudGltZXMgPSBwYXJzZUludCh0LCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YgdCA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQudGltZXMsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgICAgIGFjYy5pbnRlcnZhbCA9IHBhcnNlSW50KHQuaW50ZXJ2YWwsIDEwKSB8fCBERUZBVUxUX0lOVEVSVkFMO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIGFyZ3VtZW50IHR5cGUgZm9yIFxcJ3RpbWVzXFwnOiAnICsgdHlwZW9mIHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGlmIChsZW5ndGggPCAxIHx8IGxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudHMgLSBtdXN0IGJlIGVpdGhlciAodGFzayksICh0YXNrLCBjYWxsYmFjayksICh0aW1lcywgdGFzaykgb3IgKHRpbWVzLCB0YXNrLCBjYWxsYmFjayknKTtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPD0gMiAmJiB0eXBlb2YgdGltZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdGFzaztcbiAgICAgICAgICAgIHRhc2sgPSB0aW1lcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRpbWVzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBwYXJzZVRpbWVzKG9wdHMsIHRpbWVzKTtcbiAgICAgICAgfVxuICAgICAgICBvcHRzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIG9wdHMudGFzayA9IHRhc2s7XG5cbiAgICAgICAgZnVuY3Rpb24gd3JhcHBlZFRhc2sod3JhcHBlZENhbGxiYWNrLCB3cmFwcGVkUmVzdWx0cykge1xuICAgICAgICAgICAgZnVuY3Rpb24gcmV0cnlBdHRlbXB0KHRhc2ssIGZpbmFsQXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICB0YXNrKGZ1bmN0aW9uKGVyciwgcmVzdWx0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKCFlcnIgfHwgZmluYWxBdHRlbXB0LCB7ZXJyOiBlcnIsIHJlc3VsdDogcmVzdWx0fSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHdyYXBwZWRSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUludGVydmFsKGludGVydmFsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWVzQ2FsbGJhY2spe1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdoaWxlIChvcHRzLnRpbWVzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZmluYWxBdHRlbXB0ID0gIShvcHRzLnRpbWVzLT0xKTtcbiAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5QXR0ZW1wdChvcHRzLnRhc2ssIGZpbmFsQXR0ZW1wdCkpO1xuICAgICAgICAgICAgICAgIGlmKCFmaW5hbEF0dGVtcHQgJiYgb3B0cy5pbnRlcnZhbCA+IDApe1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5SW50ZXJ2YWwob3B0cy5pbnRlcnZhbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXN5bmMuc2VyaWVzKGF0dGVtcHRzLCBmdW5jdGlvbihkb25lLCBkYXRhKXtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YVtkYXRhLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICh3cmFwcGVkQ2FsbGJhY2sgfHwgb3B0cy5jYWxsYmFjaykoZGF0YS5lcnIsIGRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgYSBjYWxsYmFjayBpcyBwYXNzZWQsIHJ1biB0aGlzIGFzIGEgY29udHJvbGwgZmxvd1xuICAgICAgICByZXR1cm4gb3B0cy5jYWxsYmFjayA/IHdyYXBwZWRUYXNrKCkgOiB3cmFwcGVkVGFzaztcbiAgICB9O1xuXG4gICAgYXN5bmMud2F0ZXJmYWxsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBpZiAoIV9pc0FycmF5KHRhc2tzKSkge1xuICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgdG8gd2F0ZXJmYWxsIG11c3QgYmUgYW4gYXJyYXkgb2YgZnVuY3Rpb25zJyk7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gd3JhcEl0ZXJhdG9yKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBbZXJyXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2god3JhcEl0ZXJhdG9yKG5leHQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5zdXJlQXN5bmMoaXRlcmF0b3IpLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHdyYXBJdGVyYXRvcihhc3luYy5pdGVyYXRvcih0YXNrcykpKCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9wYXJhbGxlbChlYWNoZm4sIHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIHZhciByZXN1bHRzID0gX2lzQXJyYXlMaWtlKHRhc2tzKSA/IFtdIDoge307XG5cbiAgICAgICAgZWFjaGZuKHRhc2tzLCBmdW5jdGlvbiAodGFzaywga2V5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdGFzayhfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0c1trZXldID0gYXJncztcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5wYXJhbGxlbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKGFzeW5jLmVhY2hPZiwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMucGFyYWxsZWxMaW1pdCA9IGZ1bmN0aW9uKHRhc2tzLCBsaW1pdCwgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKF9lYWNoT2ZMaW1pdChsaW1pdCksIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcmllcyA9IGZ1bmN0aW9uKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mU2VyaWVzLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5pdGVyYXRvciA9IGZ1bmN0aW9uICh0YXNrcykge1xuICAgICAgICBmdW5jdGlvbiBtYWtlQ2FsbGJhY2soaW5kZXgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZuKCkge1xuICAgICAgICAgICAgICAgIGlmICh0YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFza3NbaW5kZXhdLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmbi5uZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmbi5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoaW5kZXggPCB0YXNrcy5sZW5ndGggLSAxKSA/IG1ha2VDYWxsYmFjayhpbmRleCArIDEpOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBmbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFrZUNhbGxiYWNrKDApO1xuICAgIH07XG5cbiAgICBhc3luYy5hcHBseSA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChjYWxsQXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KFxuICAgICAgICAgICAgICAgIG51bGwsIGFyZ3MuY29uY2F0KGNhbGxBcmdzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBfY29uY2F0KGVhY2hmbiwgYXJyLCBmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNiKSB7XG4gICAgICAgICAgICBmbih4LCBmdW5jdGlvbiAoZXJyLCB5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh5IHx8IFtdKTtcbiAgICAgICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmNvbmNhdCA9IGRvUGFyYWxsZWwoX2NvbmNhdCk7XG4gICAgYXN5bmMuY29uY2F0U2VyaWVzID0gZG9TZXJpZXMoX2NvbmNhdCk7XG5cbiAgICBhc3luYy53aGlsc3QgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgaWYgKHRlc3QoKSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRlc3QuYXBwbHkodGhpcywgYXJncykpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgW251bGxdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmRvV2hpbHN0ID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2FsbHMgPSAwO1xuICAgICAgICByZXR1cm4gYXN5bmMud2hpbHN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICsrY2FsbHMgPD0gMSB8fCB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnVudGlsID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMud2hpbHN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvVW50aWwgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5kb1doaWxzdChpdGVyYXRvciwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kdXJpbmcgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcblxuICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKGNoZWNrKTtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY2hlY2sgPSBmdW5jdGlvbihlcnIsIHRydXRoKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHJ1dGgpIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGVzdChjaGVjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvRHVyaW5nID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2FsbHMgPSAwO1xuICAgICAgICBhc3luYy5kdXJpbmcoZnVuY3Rpb24obmV4dCkge1xuICAgICAgICAgICAgaWYgKGNhbGxzKysgPCAxKSB7XG4gICAgICAgICAgICAgICAgbmV4dChudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfcXVldWUod29ya2VyLCBjb25jdXJyZW5jeSwgcGF5bG9hZCkge1xuICAgICAgICBpZiAoY29uY3VycmVuY3kgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoY29uY3VycmVuY3kgPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uY3VycmVuY3kgbXVzdCBub3QgYmUgemVybycpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcG9zLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIV9pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRhdGEubGVuZ3RoID09PSAwICYmIHEuaWRsZSgpKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrIHx8IG5vb3BcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvcykge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX25leHQocSwgdGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHdvcmtlcnMgLT0gMTtcblxuICAgICAgICAgICAgICAgIHZhciByZW1vdmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgX2FycmF5RWFjaCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgX2FycmF5RWFjaCh3b3JrZXJzTGlzdCwgZnVuY3Rpb24gKHdvcmtlciwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXIgPT09IHRhc2sgJiYgIXJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJzTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0YXNrLmNhbGxiYWNrLmFwcGx5KHRhc2ssIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBxLnByb2Nlc3MoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd29ya2VycyA9IDA7XG4gICAgICAgIHZhciB3b3JrZXJzTGlzdCA9IFtdO1xuICAgICAgICB2YXIgcSA9IHtcbiAgICAgICAgICAgIHRhc2tzOiBbXSxcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5OiBjb25jdXJyZW5jeSxcbiAgICAgICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgICAgICBzYXR1cmF0ZWQ6IG5vb3AsXG4gICAgICAgICAgICBlbXB0eTogbm9vcCxcbiAgICAgICAgICAgIGRyYWluOiBub29wLFxuICAgICAgICAgICAgc3RhcnRlZDogZmFsc2UsXG4gICAgICAgICAgICBwYXVzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBmYWxzZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtpbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLmRyYWluID0gbm9vcDtcbiAgICAgICAgICAgICAgICBxLnRhc2tzID0gW107XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zaGlmdDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCB0cnVlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHdoaWxlKCFxLnBhdXNlZCAmJiB3b3JrZXJzIDwgcS5jb25jdXJyZW5jeSAmJiBxLnRhc2tzLmxlbmd0aCl7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhc2tzID0gcS5wYXlsb2FkID9cbiAgICAgICAgICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKDAsIHEucGF5bG9hZCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS50YXNrcy5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gX21hcCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlcnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgd29ya2Vyc0xpc3QucHVzaCh0YXNrc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYiA9IG9ubHlfb25jZShfbmV4dChxLCB0YXNrcykpO1xuICAgICAgICAgICAgICAgICAgICB3b3JrZXIoZGF0YSwgY2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3b3JrZXJzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdvcmtlcnNMaXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnNMaXN0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlkbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSBmYWxzZSkgeyByZXR1cm47IH1cbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bWVDb3VudCA9IE1hdGgubWluKHEuY29uY3VycmVuY3ksIHEudGFza3MubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGNhbGwgcS5wcm9jZXNzIG9uY2UgcGVyIGNvbmN1cnJlbnRcbiAgICAgICAgICAgICAgICAvLyB3b3JrZXIgdG8gcHJlc2VydmUgZnVsbCBjb25jdXJyZW5jeSBhZnRlciBwYXVzZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIHcgPSAxOyB3IDw9IHJlc3VtZUNvdW50OyB3KyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcTtcbiAgICB9XG5cbiAgICBhc3luYy5xdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG4gICAgICAgIHZhciBxID0gX3F1ZXVlKGZ1bmN0aW9uIChpdGVtcywgY2IpIHtcbiAgICAgICAgICAgIHdvcmtlcihpdGVtc1swXSwgY2IpO1xuICAgICAgICB9LCBjb25jdXJyZW5jeSwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLnByaW9yaXR5UXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIF9jb21wYXJlVGFza3MoYSwgYil7XG4gICAgICAgICAgICByZXR1cm4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfYmluYXJ5U2VhcmNoKHNlcXVlbmNlLCBpdGVtLCBjb21wYXJlKSB7XG4gICAgICAgICAgICB2YXIgYmVnID0gLTEsXG4gICAgICAgICAgICAgICAgZW5kID0gc2VxdWVuY2UubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHdoaWxlIChiZWcgPCBlbmQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWlkID0gYmVnICsgKChlbmQgLSBiZWcgKyAxKSA+Pj4gMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBhcmUoaXRlbSwgc2VxdWVuY2VbbWlkXSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBiZWcgPSBtaWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gbWlkIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmVnO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2FycmF5RWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiBwcmlvcml0eSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZShfYmluYXJ5U2VhcmNoKHEudGFza3MsIGl0ZW0sIF9jb21wYXJlVGFza3MpICsgMSwgMCwgaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IHdpdGggYSBub3JtYWwgcXVldWVcbiAgICAgICAgdmFyIHEgPSBhc3luYy5xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5KTtcblxuICAgICAgICAvLyBPdmVycmlkZSBwdXNoIHRvIGFjY2VwdCBzZWNvbmQgcGFyYW1ldGVyIHJlcHJlc2VudGluZyBwcmlvcml0eVxuICAgICAgICBxLnB1c2ggPSBmdW5jdGlvbiAoZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjayk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHVuc2hpZnQgZnVuY3Rpb25cbiAgICAgICAgZGVsZXRlIHEudW5zaGlmdDtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY2FyZ28gPSBmdW5jdGlvbiAod29ya2VyLCBwYXlsb2FkKSB7XG4gICAgICAgIHJldHVybiBfcXVldWUod29ya2VyLCAxLCBwYXlsb2FkKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2NvbnNvbGVfZm4obmFtZSkge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbnNvbGVbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hcnJheUVhY2goYXJncywgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlW25hbWVdKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmxvZyA9IF9jb25zb2xlX2ZuKCdsb2cnKTtcbiAgICBhc3luYy5kaXIgPSBfY29uc29sZV9mbignZGlyJyk7XG4gICAgLyphc3luYy5pbmZvID0gX2NvbnNvbGVfZm4oJ2luZm8nKTtcbiAgICBhc3luYy53YXJuID0gX2NvbnNvbGVfZm4oJ3dhcm4nKTtcbiAgICBhc3luYy5lcnJvciA9IF9jb25zb2xlX2ZuKCdlcnJvcicpOyovXG5cbiAgICBhc3luYy5tZW1vaXplID0gZnVuY3Rpb24gKGZuLCBoYXNoZXIpIHtcbiAgICAgICAgdmFyIG1lbW8gPSB7fTtcbiAgICAgICAgdmFyIHF1ZXVlcyA9IHt9O1xuICAgICAgICB2YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgICAgICAgaGFzaGVyID0gaGFzaGVyIHx8IGlkZW50aXR5O1xuICAgICAgICB2YXIgbWVtb2l6ZWQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIG1lbW9pemVkKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGhhcy5jYWxsKG1lbW8sIGtleSkpIHsgICBcbiAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBtZW1vW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaGFzLmNhbGwocXVldWVzLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0ucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XSA9IFtjYWxsYmFja107XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVtb1trZXldID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgdmFyIHEgPSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxW2ldLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBtZW1vaXplZC5tZW1vID0gbWVtbztcbiAgICAgICAgbWVtb2l6ZWQudW5tZW1vaXplZCA9IGZuO1xuICAgICAgICByZXR1cm4gbWVtb2l6ZWQ7XG4gICAgfTtcblxuICAgIGFzeW5jLnVubWVtb2l6ZSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChmbi51bm1lbW9pemVkIHx8IGZuKS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfdGltZXMobWFwcGVyKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY291bnQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgbWFwcGVyKF9yYW5nZShjb3VudCksIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMudGltZXMgPSBfdGltZXMoYXN5bmMubWFwKTtcbiAgICBhc3luYy50aW1lc1NlcmllcyA9IF90aW1lcyhhc3luYy5tYXBTZXJpZXMpO1xuICAgIGFzeW5jLnRpbWVzTGltaXQgPSBmdW5jdGlvbiAoY291bnQsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLm1hcExpbWl0KF9yYW5nZShjb3VudCksIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5zZXEgPSBmdW5jdGlvbiAoLyogZnVuY3Rpb25zLi4uICovKSB7XG4gICAgICAgIHZhciBmbnMgPSBhcmd1bWVudHM7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gbm9vcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXN5bmMucmVkdWNlKGZucywgYXJncywgZnVuY3Rpb24gKG5ld2FyZ3MsIGZuLCBjYikge1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIG5ld2FyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIG5leHRhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNiKGVyciwgbmV4dGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGF0LCBbZXJyXS5jb25jYXQocmVzdWx0cykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5jb21wb3NlID0gZnVuY3Rpb24gKC8qIGZ1bmN0aW9ucy4uLiAqLykge1xuICAgICAgICByZXR1cm4gYXN5bmMuc2VxLmFwcGx5KG51bGwsIEFycmF5LnByb3RvdHlwZS5yZXZlcnNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuXG4gICAgZnVuY3Rpb24gX2FwcGx5RWFjaChlYWNoZm4pIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24oZm5zLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZ28gPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWFjaGZuKGZucywgZnVuY3Rpb24gKGZuLCBfLCBjYikge1xuICAgICAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzLmNvbmNhdChbY2JdKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnby5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBnbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuYXBwbHlFYWNoID0gX2FwcGx5RWFjaChhc3luYy5lYWNoT2YpO1xuICAgIGFzeW5jLmFwcGx5RWFjaFNlcmllcyA9IF9hcHBseUVhY2goYXN5bmMuZWFjaE9mU2VyaWVzKTtcblxuXG4gICAgYXN5bmMuZm9yZXZlciA9IGZ1bmN0aW9uIChmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRvbmUgPSBvbmx5X29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIHZhciB0YXNrID0gZW5zdXJlQXN5bmMoZm4pO1xuICAgICAgICBmdW5jdGlvbiBuZXh0KGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YXNrKG5leHQpO1xuICAgICAgICB9XG4gICAgICAgIG5leHQoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZW5zdXJlQXN5bmMoZm4pIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICBhcmdzLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpbm5lckFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGlubmVyQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGlubmVyQXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgc3luYyA9IHRydWU7XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuZW5zdXJlQXN5bmMgPSBlbnN1cmVBc3luYztcblxuICAgIGFzeW5jLmNvbnN0YW50ID0gX3Jlc3RQYXJhbShmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbbnVsbF0uY29uY2F0KHZhbHVlcyk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFzeW5jLndyYXBTeW5jID1cbiAgICBhc3luYy5hc3luY2lmeSA9IGZ1bmN0aW9uIGFzeW5jaWZ5KGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIHJlc3VsdCBpcyBQcm9taXNlIG9iamVjdFxuICAgICAgICAgICAgaWYgKF9pc09iamVjdChyZXN1bHQpICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyci5tZXNzYWdlID8gZXJyIDogbmV3IEVycm9yKGVycikpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gTm9kZS5qc1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGFzeW5jO1xuICAgIH1cbiAgICAvLyBBTUQgLyBSZXF1aXJlSlNcbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXN5bmM7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBpbmNsdWRlZCBkaXJlY3RseSB2aWEgPHNjcmlwdD4gdGFnXG4gICAgZWxzZSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBhc3luYztcbiAgICB9XG5cbn0oKSk7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyoqXG4gKiBVQVBhcnNlci5qcyB2MC43LjEyXG4gKiBMaWdodHdlaWdodCBKYXZhU2NyaXB0LWJhc2VkIFVzZXItQWdlbnQgc3RyaW5nIHBhcnNlclxuICogaHR0cHM6Ly9naXRodWIuY29tL2ZhaXNhbG1hbi91YS1wYXJzZXItanNcbiAqXG4gKiBDb3B5cmlnaHQgwqkgMjAxMi0yMDE2IEZhaXNhbCBTYWxtYW4gPGZ5emxtYW5AZ21haWwuY29tPlxuICogRHVhbCBsaWNlbnNlZCB1bmRlciBHUEx2MiAmIE1JVFxuICovXG5cbihmdW5jdGlvbiAod2luZG93LCB1bmRlZmluZWQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ29uc3RhbnRzXG4gICAgLy8vLy8vLy8vLy8vL1xuXG5cbiAgICB2YXIgTElCVkVSU0lPTiAgPSAnMC43LjEyJyxcbiAgICAgICAgRU1QVFkgICAgICAgPSAnJyxcbiAgICAgICAgVU5LTk9XTiAgICAgPSAnPycsXG4gICAgICAgIEZVTkNfVFlQRSAgID0gJ2Z1bmN0aW9uJyxcbiAgICAgICAgVU5ERUZfVFlQRSAgPSAndW5kZWZpbmVkJyxcbiAgICAgICAgT0JKX1RZUEUgICAgPSAnb2JqZWN0JyxcbiAgICAgICAgU1RSX1RZUEUgICAgPSAnc3RyaW5nJyxcbiAgICAgICAgTUFKT1IgICAgICAgPSAnbWFqb3InLCAvLyBkZXByZWNhdGVkXG4gICAgICAgIE1PREVMICAgICAgID0gJ21vZGVsJyxcbiAgICAgICAgTkFNRSAgICAgICAgPSAnbmFtZScsXG4gICAgICAgIFRZUEUgICAgICAgID0gJ3R5cGUnLFxuICAgICAgICBWRU5ET1IgICAgICA9ICd2ZW5kb3InLFxuICAgICAgICBWRVJTSU9OICAgICA9ICd2ZXJzaW9uJyxcbiAgICAgICAgQVJDSElURUNUVVJFPSAnYXJjaGl0ZWN0dXJlJyxcbiAgICAgICAgQ09OU09MRSAgICAgPSAnY29uc29sZScsXG4gICAgICAgIE1PQklMRSAgICAgID0gJ21vYmlsZScsXG4gICAgICAgIFRBQkxFVCAgICAgID0gJ3RhYmxldCcsXG4gICAgICAgIFNNQVJUVFYgICAgID0gJ3NtYXJ0dHYnLFxuICAgICAgICBXRUFSQUJMRSAgICA9ICd3ZWFyYWJsZScsXG4gICAgICAgIEVNQkVEREVEICAgID0gJ2VtYmVkZGVkJztcblxuXG4gICAgLy8vLy8vLy8vLy9cbiAgICAvLyBIZWxwZXJcbiAgICAvLy8vLy8vLy8vXG5cblxuICAgIHZhciB1dGlsID0ge1xuICAgICAgICBleHRlbmQgOiBmdW5jdGlvbiAocmVnZXhlcywgZXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgdmFyIG1hcmdlZFJlZ2V4ZXMgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gcmVnZXhlcykge1xuICAgICAgICAgICAgICAgIGlmIChleHRlbnNpb25zW2ldICYmIGV4dGVuc2lvbnNbaV0ubGVuZ3RoICUgMiA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBtYXJnZWRSZWdleGVzW2ldID0gZXh0ZW5zaW9uc1tpXS5jb25jYXQocmVnZXhlc1tpXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2VkUmVnZXhlc1tpXSA9IHJlZ2V4ZXNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1hcmdlZFJlZ2V4ZXM7XG4gICAgICAgIH0sXG4gICAgICAgIGhhcyA6IGZ1bmN0aW9uIChzdHIxLCBzdHIyKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBzdHIxID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyMi50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc3RyMS50b0xvd2VyQ2FzZSgpKSAhPT0gLTE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxvd2VyaXplIDogZnVuY3Rpb24gKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIHN0ci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9LFxuICAgICAgICBtYWpvciA6IGZ1bmN0aW9uICh2ZXJzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mKHZlcnNpb24pID09PSBTVFJfVFlQRSA/IHZlcnNpb24ucmVwbGFjZSgvW15cXGRcXC5dL2csJycpLnNwbGl0KFwiLlwiKVswXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgdHJpbSA6IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL15bXFxzXFx1RkVGRlxceEEwXSt8W1xcc1xcdUZFRkZcXHhBMF0rJC9nLCAnJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBNYXAgaGVscGVyXG4gICAgLy8vLy8vLy8vLy8vLy9cblxuXG4gICAgdmFyIG1hcHBlciA9IHtcblxuICAgICAgICByZ3ggOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQsIGkgPSAwLCBqLCBrLCBwLCBxLCBtYXRjaGVzLCBtYXRjaCwgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGFsbCByZWdleGVzIG1hcHNcbiAgICAgICAgICAgIHdoaWxlIChpIDwgYXJncy5sZW5ndGggJiYgIW1hdGNoZXMpIHtcblxuICAgICAgICAgICAgICAgIHZhciByZWdleCA9IGFyZ3NbaV0sICAgICAgIC8vIGV2ZW4gc2VxdWVuY2UgKDAsMiw0LC4uKVxuICAgICAgICAgICAgICAgICAgICBwcm9wcyA9IGFyZ3NbaSArIDFdOyAgIC8vIG9kZCBzZXF1ZW5jZSAoMSwzLDUsLi4pXG5cbiAgICAgICAgICAgICAgICAvLyBjb25zdHJ1Y3Qgb2JqZWN0IGJhcmVib25lc1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSBVTkRFRl9UWVBFKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHAgaW4gcHJvcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcSA9IHByb3BzW3BdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcSA9PT0gT0JKX1RZUEUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3FbMF1dID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtxXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyB0cnkgbWF0Y2hpbmcgdWFzdHJpbmcgd2l0aCByZWdleGVzXG4gICAgICAgICAgICAgICAgaiA9IGsgPSAwO1xuICAgICAgICAgICAgICAgIHdoaWxlIChqIDwgcmVnZXgubGVuZ3RoICYmICFtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXMgPSByZWdleFtqKytdLmV4ZWModGhpcy5nZXRVQSgpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhbWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChwID0gMDsgcCA8IHByb3BzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBtYXRjaGVzWysra107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcSA9IHByb3BzW3BdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIGdpdmVuIHByb3BlcnR5IGlzIGFjdHVhbGx5IGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBxID09PSBPQkpfVFlQRSAmJiBxLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHEubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcVsxXSA9PSBGVU5DX1RZUEUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gbW9kaWZpZWQgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcVswXV0gPSBxWzFdLmNhbGwodGhpcywgbWF0Y2gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gZ2l2ZW4gdmFsdWUsIGlnbm9yZSByZWdleCBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtxWzBdXSA9IHFbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocS5sZW5ndGggPT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgd2hldGhlciBmdW5jdGlvbiBvciByZWdleFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBxWzFdID09PSBGVU5DX1RZUEUgJiYgIShxWzFdLmV4ZWMgJiYgcVsxXS50ZXN0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGwgZnVuY3Rpb24gKHVzdWFsbHkgc3RyaW5nIG1hcHBlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcVswXV0gPSBtYXRjaCA/IHFbMV0uY2FsbCh0aGlzLCBtYXRjaCwgcVsyXSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNhbml0aXplIG1hdGNoIHVzaW5nIGdpdmVuIHJlZ2V4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3FbMF1dID0gbWF0Y2ggPyBtYXRjaC5yZXBsYWNlKHFbMV0sIHFbMl0pIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHEubGVuZ3RoID09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcVswXV0gPSBtYXRjaCA/IHFbM10uY2FsbCh0aGlzLCBtYXRjaC5yZXBsYWNlKHFbMV0sIHFbMl0pKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtxXSA9IG1hdGNoID8gbWF0Y2ggOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RyIDogZnVuY3Rpb24gKHN0ciwgbWFwKSB7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gbWFwKSB7XG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgYXJyYXlcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1hcFtpXSA9PT0gT0JKX1RZUEUgJiYgbWFwW2ldLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYXBbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1dGlsLmhhcyhtYXBbaV1bal0sIHN0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGkgPT09IFVOS05PV04pID8gdW5kZWZpbmVkIDogaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXRpbC5oYXMobWFwW2ldLCBzdHIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoaSA9PT0gVU5LTk9XTikgPyB1bmRlZmluZWQgOiBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBTdHJpbmcgbWFwXG4gICAgLy8vLy8vLy8vLy8vLy9cblxuXG4gICAgdmFyIG1hcHMgPSB7XG5cbiAgICAgICAgYnJvd3NlciA6IHtcbiAgICAgICAgICAgIG9sZHNhZmFyaSA6IHtcbiAgICAgICAgICAgICAgICB2ZXJzaW9uIDoge1xuICAgICAgICAgICAgICAgICAgICAnMS4wJyAgIDogJy84JyxcbiAgICAgICAgICAgICAgICAgICAgJzEuMicgICA6ICcvMScsXG4gICAgICAgICAgICAgICAgICAgICcxLjMnICAgOiAnLzMnLFxuICAgICAgICAgICAgICAgICAgICAnMi4wJyAgIDogJy80MTInLFxuICAgICAgICAgICAgICAgICAgICAnMi4wLjInIDogJy80MTYnLFxuICAgICAgICAgICAgICAgICAgICAnMi4wLjMnIDogJy80MTcnLFxuICAgICAgICAgICAgICAgICAgICAnMi4wLjQnIDogJy80MTknLFxuICAgICAgICAgICAgICAgICAgICAnPycgICAgIDogJy8nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRldmljZSA6IHtcbiAgICAgICAgICAgIGFtYXpvbiA6IHtcbiAgICAgICAgICAgICAgICBtb2RlbCA6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0ZpcmUgUGhvbmUnIDogWydTRCcsICdLRiddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNwcmludCA6IHtcbiAgICAgICAgICAgICAgICBtb2RlbCA6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0V2byBTaGlmdCA0RycgOiAnNzM3M0tUJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdmVuZG9yIDoge1xuICAgICAgICAgICAgICAgICAgICAnSFRDJyAgICAgICA6ICdBUEEnLFxuICAgICAgICAgICAgICAgICAgICAnU3ByaW50JyAgICA6ICdTcHJpbnQnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9zIDoge1xuICAgICAgICAgICAgd2luZG93cyA6IHtcbiAgICAgICAgICAgICAgICB2ZXJzaW9uIDoge1xuICAgICAgICAgICAgICAgICAgICAnTUUnICAgICAgICA6ICc0LjkwJyxcbiAgICAgICAgICAgICAgICAgICAgJ05UIDMuMTEnICAgOiAnTlQzLjUxJyxcbiAgICAgICAgICAgICAgICAgICAgJ05UIDQuMCcgICAgOiAnTlQ0LjAnLFxuICAgICAgICAgICAgICAgICAgICAnMjAwMCcgICAgICA6ICdOVCA1LjAnLFxuICAgICAgICAgICAgICAgICAgICAnWFAnICAgICAgICA6IFsnTlQgNS4xJywgJ05UIDUuMiddLFxuICAgICAgICAgICAgICAgICAgICAnVmlzdGEnICAgICA6ICdOVCA2LjAnLFxuICAgICAgICAgICAgICAgICAgICAnNycgICAgICAgICA6ICdOVCA2LjEnLFxuICAgICAgICAgICAgICAgICAgICAnOCcgICAgICAgICA6ICdOVCA2LjInLFxuICAgICAgICAgICAgICAgICAgICAnOC4xJyAgICAgICA6ICdOVCA2LjMnLFxuICAgICAgICAgICAgICAgICAgICAnMTAnICAgICAgICA6IFsnTlQgNi40JywgJ05UIDEwLjAnXSxcbiAgICAgICAgICAgICAgICAgICAgJ1JUJyAgICAgICAgOiAnQVJNJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8vLy8vLy8vLy8vLy8vXG4gICAgLy8gUmVnZXggbWFwXG4gICAgLy8vLy8vLy8vLy8vL1xuXG5cbiAgICB2YXIgcmVnZXhlcyA9IHtcblxuICAgICAgICBicm93c2VyIDogW1tcblxuICAgICAgICAgICAgLy8gUHJlc3RvIGJhc2VkXG4gICAgICAgICAgICAvKG9wZXJhXFxzbWluaSlcXC8oW1xcd1xcLi1dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYSBNaW5pXG4gICAgICAgICAgICAvKG9wZXJhXFxzW21vYmlsZXRhYl0rKS4rdmVyc2lvblxcLyhbXFx3XFwuLV0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYSBNb2JpL1RhYmxldFxuICAgICAgICAgICAgLyhvcGVyYSkuK3ZlcnNpb25cXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYSA+IDkuODBcbiAgICAgICAgICAgIC8ob3BlcmEpW1xcL1xcc10rKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZXJhIDwgOS44MFxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC8ob3Bpb3MpW1xcL1xcc10rKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZXJhIG1pbmkgb24gaXBob25lID49IDguMFxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnT3BlcmEgTWluaSddLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvXFxzKG9wcilcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYSBXZWJraXRcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ09wZXJhJ10sIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC8vIE1peGVkXG4gICAgICAgICAgICAvKGtpbmRsZSlcXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtpbmRsZVxuICAgICAgICAgICAgLyhsdW5hc2NhcGV8bWF4dGhvbnxuZXRmcm9udHxqYXNtaW5lfGJsYXplcilbXFwvXFxzXT8oW1xcd1xcLl0rKSovaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTHVuYXNjYXBlL01heHRob24vTmV0ZnJvbnQvSmFzbWluZS9CbGF6ZXJcblxuICAgICAgICAgICAgLy8gVHJpZGVudCBiYXNlZFxuICAgICAgICAgICAgLyhhdmFudFxcc3xpZW1vYmlsZXxzbGltfGJhaWR1KSg/OmJyb3dzZXIpP1tcXC9cXHNdPyhbXFx3XFwuXSopL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEF2YW50L0lFTW9iaWxlL1NsaW1Ccm93c2VyL0JhaWR1XG4gICAgICAgICAgICAvKD86bXN8XFwoKShpZSlcXHMoW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5ldCBFeHBsb3JlclxuXG4gICAgICAgICAgICAvLyBXZWJraXQvS0hUTUwgYmFzZWRcbiAgICAgICAgICAgIC8ocmVrb25xKVxcLyhbXFx3XFwuXSspKi9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVrb25xXG4gICAgICAgICAgICAvKGNocm9taXVtfGZsb2NrfHJvY2ttZWx0fG1pZG9yaXxlcGlwaGFueXxzaWxrfHNreWZpcmV8b3ZpYnJvd3Nlcnxib2x0fGlyb258dml2YWxkaXxpcmlkaXVtfHBoYW50b21qcylcXC8oW1xcd1xcLi1dKykvaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaHJvbWl1bS9GbG9jay9Sb2NrTWVsdC9NaWRvcmkvRXBpcGhhbnkvU2lsay9Ta3lmaXJlL0JvbHQvSXJvbi9JcmlkaXVtL1BoYW50b21KU1xuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC8odHJpZGVudCkuK3J2WzpcXHNdKFtcXHdcXC5dKykuK2xpa2VcXHNnZWNrby9pICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElFMTFcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ0lFJ10sIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC8oZWRnZSlcXC8oKFxcZCspP1tcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1pY3Jvc29mdCBFZGdlXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLyh5YWJyb3dzZXIpXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBZYW5kZXhcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ1lhbmRleCddLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKGNvbW9kb19kcmFnb24pXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbW9kbyBEcmFnb25cbiAgICAgICAgICAgIF0sIFtbTkFNRSwgL18vZywgJyAnXSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLyhtaWNyb21lc3NlbmdlcilcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZUNoYXRcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ1dlQ2hhdCddLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAveGlhb21pXFwvbWl1aWJyb3dzZXJcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNSVVJIEJyb3dzZXJcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ01JVUkgQnJvd3NlciddXSwgW1xuXG4gICAgICAgICAgICAvXFxzd3ZcXCkuKyhjaHJvbWUpXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21lIFdlYlZpZXdcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgLyguKykvLCAnJDEgV2ViVmlldyddLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvYW5kcm9pZC4rc2Ftc3VuZ2Jyb3dzZXJcXC8oW1xcd1xcLl0rKS9pLFxuICAgICAgICAgICAgL2FuZHJvaWQuK3ZlcnNpb25cXC8oW1xcd1xcLl0rKVxccysoPzptb2JpbGVcXHM/c2FmYXJpfHNhZmFyaSkqL2kgICAgICAgIC8vIEFuZHJvaWQgQnJvd3NlclxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnQW5kcm9pZCBCcm93c2VyJ11dLCBbXG5cbiAgICAgICAgICAgIC8oY2hyb21lfG9tbml3ZWJ8YXJvcmF8W3RpemVub2thXXs1fVxccz9icm93c2VyKVxcL3Y/KFtcXHdcXC5dKykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21lL09tbmlXZWIvQXJvcmEvVGl6ZW4vTm9raWFcbiAgICAgICAgICAgIC8ocXFicm93c2VyKVtcXC9cXHNdPyhbXFx3XFwuXSspL2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUVFCcm93c2VyXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLyh1Y1xccz9icm93c2VyKVtcXC9cXHNdPyhbXFx3XFwuXSspL2ksXG4gICAgICAgICAgICAvdWN3ZWIuKyh1Y2Jyb3dzZXIpW1xcL1xcc10/KFtcXHdcXC5dKykvaSxcbiAgICAgICAgICAgIC9qdWMuKyh1Y3dlYilbXFwvXFxzXT8oW1xcd1xcLl0rKS9pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVDQnJvd3NlclxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnVUNCcm93c2VyJ10sIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC8oZG9sZmluKVxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRG9scGhpblxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnRG9scGhpbiddLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKCg/OmFuZHJvaWQuKyljcm1vfGNyaW9zKVxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9tZSBmb3IgQW5kcm9pZC9pT1NcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ0Nocm9tZSddLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvO2ZiYXZcXC8oW1xcd1xcLl0rKTsvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZhY2Vib29rIEFwcCBmb3IgaU9TXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdGYWNlYm9vayddXSwgW1xuXG4gICAgICAgICAgICAvZnhpb3NcXC8oW1xcd1xcLi1dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggZm9yIGlPU1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnRmlyZWZveCddXSwgW1xuXG4gICAgICAgICAgICAvdmVyc2lvblxcLyhbXFx3XFwuXSspLis/bW9iaWxlXFwvXFx3K1xccyhzYWZhcmkpL2kgICAgICAgICAgICAgICAgICAgICAgIC8vIE1vYmlsZSBTYWZhcmlcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ01vYmlsZSBTYWZhcmknXV0sIFtcblxuICAgICAgICAgICAgL3ZlcnNpb25cXC8oW1xcd1xcLl0rKS4rPyhtb2JpbGVcXHM/c2FmYXJpfHNhZmFyaSkvaSAgICAgICAgICAgICAgICAgICAgLy8gU2FmYXJpICYgU2FmYXJpIE1vYmlsZVxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIE5BTUVdLCBbXG5cbiAgICAgICAgICAgIC93ZWJraXQuKz8obW9iaWxlXFxzP3NhZmFyaXxzYWZhcmkpKFxcL1tcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgIC8vIFNhZmFyaSA8IDMuMFxuICAgICAgICAgICAgXSwgW05BTUUsIFtWRVJTSU9OLCBtYXBwZXIuc3RyLCBtYXBzLmJyb3dzZXIub2xkc2FmYXJpLnZlcnNpb25dXSwgW1xuXG4gICAgICAgICAgICAvKGtvbnF1ZXJvcilcXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtvbnF1ZXJvclxuICAgICAgICAgICAgLyh3ZWJraXR8a2h0bWwpXFwvKFtcXHdcXC5dKykvaVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC8vIEdlY2tvIGJhc2VkXG4gICAgICAgICAgICAvKG5hdmlnYXRvcnxuZXRzY2FwZSlcXC8oW1xcd1xcLi1dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5ldHNjYXBlXG4gICAgICAgICAgICBdLCBbW05BTUUsICdOZXRzY2FwZSddLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgLyhzd2lmdGZveCkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTd2lmdGZveFxuICAgICAgICAgICAgLyhpY2VkcmFnb258aWNld2Vhc2VsfGNhbWlub3xjaGltZXJhfGZlbm5lY3xtYWVtb1xcc2Jyb3dzZXJ8bWluaW1vfGNvbmtlcm9yKVtcXC9cXHNdPyhbXFx3XFwuXFwrXSspL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEljZURyYWdvbi9JY2V3ZWFzZWwvQ2FtaW5vL0NoaW1lcmEvRmVubmVjL01hZW1vL01pbmltby9Db25rZXJvclxuICAgICAgICAgICAgLyhmaXJlZm94fHNlYW1vbmtleXxrLW1lbGVvbnxpY2VjYXR8aWNlYXBlfGZpcmViaXJkfHBob2VuaXgpXFwvKFtcXHdcXC4tXSspL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmVmb3gvU2VhTW9ua2V5L0stTWVsZW9uL0ljZUNhdC9JY2VBcGUvRmlyZWJpcmQvUGhvZW5peFxuICAgICAgICAgICAgLyhtb3ppbGxhKVxcLyhbXFx3XFwuXSspLitydlxcOi4rZ2Vja29cXC9cXGQrL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNb3ppbGxhXG5cbiAgICAgICAgICAgIC8vIE90aGVyXG4gICAgICAgICAgICAvKHBvbGFyaXN8bHlueHxkaWxsb3xpY2FifGRvcmlzfGFtYXlhfHczbXxuZXRzdXJmfHNsZWlwbmlyKVtcXC9cXHNdPyhbXFx3XFwuXSspL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBvbGFyaXMvTHlueC9EaWxsby9pQ2FiL0RvcmlzL0FtYXlhL3czbS9OZXRTdXJmL1NsZWlwbmlyXG4gICAgICAgICAgICAvKGxpbmtzKVxcc1xcKChbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMaW5rc1xuICAgICAgICAgICAgLyhnb2Jyb3dzZXIpXFwvPyhbXFx3XFwuXSspKi9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb0Jyb3dzZXJcbiAgICAgICAgICAgIC8oaWNlXFxzP2Jyb3dzZXIpXFwvdj8oW1xcd1xcLl9dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElDRSBCcm93c2VyXG4gICAgICAgICAgICAvKG1vc2FpYylbXFwvXFxzXShbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNb3NhaWNcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXVxuXG4gICAgICAgICAgICAvKiAvLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIE1lZGlhIHBsYXllcnMgQkVHSU5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICAgICAsIFtcblxuICAgICAgICAgICAgLyhhcHBsZSg/OmNvcmVtZWRpYXwpKVxcLygoXFxkKylbXFx3XFwuX10rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJpYyBBcHBsZSBDb3JlTWVkaWFcbiAgICAgICAgICAgIC8oY29yZW1lZGlhKSB2KChcXGQrKVtcXHdcXC5fXSspL2lcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKGFxdWFsdW5nfGx5c3NuYXxic3BsYXllcilcXC8oKFxcZCspP1tcXHdcXC4tXSspL2kgICAgICAgICAgICAgICAgICAgICAvLyBBcXVhbHVuZy9MeXNzbmEvQlNQbGF5ZXJcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKGFyZXN8b3NzcHJveHkpXFxzKChcXGQrKVtcXHdcXC4tXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBcmVzL09TU1Byb3h5XG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLyhhdWRhY2lvdXN8YXVkaW11c2ljc3RyZWFtfGFtYXJva3xiYXNzfGNvcmV8ZGFsdmlrfGdub21lbXBsYXllcnxtdXNpYyBvbiBjb25zb2xlfG5zcGxheWVyfHBzcC1pbnRlcm5ldHJhZGlvcGxheWVyfHZpZGVvcylcXC8oKFxcZCspW1xcd1xcLi1dKykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXVkYWNpb3VzL0F1ZGlNdXNpY1N0cmVhbS9BbWFyb2svQkFTUy9PcGVuQ09SRS9EYWx2aWsvR25vbWVNcGxheWVyL01vQ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOU1BsYXllci9QU1AtSW50ZXJuZXRSYWRpb1BsYXllci9WaWRlb3NcbiAgICAgICAgICAgIC8oY2xlbWVudGluZXxtdXNpYyBwbGF5ZXIgZGFlbW9uKVxccygoXFxkKylbXFx3XFwuLV0rKS9pLCAgICAgICAgICAgICAgIC8vIENsZW1lbnRpbmUvTVBEXG4gICAgICAgICAgICAvKGxnIHBsYXllcnxuZXhwbGF5ZXIpXFxzKChcXGQrKVtcXGRcXC5dKykvaSxcbiAgICAgICAgICAgIC9wbGF5ZXJcXC8obmV4cGxheWVyfGxnIHBsYXllcilcXHMoKFxcZCspW1xcd1xcLi1dKykvaSAgICAgICAgICAgICAgICAgICAvLyBOZXhQbGF5ZXIvTEcgUGxheWVyXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC8obmV4cGxheWVyKVxccygoXFxkKylbXFx3XFwuLV0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5leHBsYXllclxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC8oZmxycClcXC8oKFxcZCspW1xcd1xcLi1dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsaXAgUGxheWVyXG4gICAgICAgICAgICBdLCBbW05BTUUsICdGbGlwIFBsYXllciddLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKGZzdHJlYW18bmF0aXZlaG9zdHxxdWVyeXNlZWtzcGlkZXJ8aWEtYXJjaGl2ZXJ8ZmFjZWJvb2tleHRlcm5hbGhpdCkvaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGU3RyZWFtL05hdGl2ZUhvc3QvUXVlcnlTZWVrU3BpZGVyL0lBIEFyY2hpdmVyL2ZhY2Vib29rZXh0ZXJuYWxoaXRcbiAgICAgICAgICAgIF0sIFtOQU1FXSwgW1xuXG4gICAgICAgICAgICAvKGdzdHJlYW1lcikgc291cGh0dHBzcmMgKD86XFwoW15cXCldK1xcKSl7MCwxfSBsaWJzb3VwXFwvKChcXGQrKVtcXHdcXC4tXSspL2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR3N0cmVhbWVyXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLyhodGMgc3RyZWFtaW5nIHBsYXllcilcXHNbXFx3X10rXFxzXFwvXFxzKChcXGQrKVtcXGRcXC5dKykvaSwgICAgICAgICAgICAgIC8vIEhUQyBTdHJlYW1pbmcgUGxheWVyXG4gICAgICAgICAgICAvKGphdmF8cHl0aG9uLXVybGxpYnxweXRob24tcmVxdWVzdHN8d2dldHxsaWJjdXJsKVxcLygoXFxkKylbXFx3XFwuLV9dKykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSmF2YS91cmxsaWIvcmVxdWVzdHMvd2dldC9jVVJMXG4gICAgICAgICAgICAvKGxhdmYpKChcXGQrKVtcXGRcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExhdmYgKEZGTVBFRylcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKGh0Y19vbmVfcylcXC8oKFxcZCspW1xcZFxcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIVEMgT25lIFNcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgL18vZywgJyAnXSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLyhtcGxheWVyKSg/Olxcc3xcXC8pKD86KD86c2hlcnB5YS0pezAsMX1zdm4pKD86LXxcXHMpKHJcXGQrKD86LVxcZCtbXFx3XFwuLV0rKXswLDF9KS9pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1QbGF5ZXIgU1ZOXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLyhtcGxheWVyKSg/Olxcc3xcXC98W3Vua293LV0rKSgoXFxkKylbXFx3XFwuLV0rKS9pICAgICAgICAgICAgICAgICAgICAgIC8vIE1QbGF5ZXJcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKG1wbGF5ZXIpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1QbGF5ZXIgKG5vIG90aGVyIGluZm8pXG4gICAgICAgICAgICAvKHlvdXJtdXplKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFlvdXJNdXplXG4gICAgICAgICAgICAvKG1lZGlhIHBsYXllciBjbGFzc2ljfG5lcm8gc2hvd3RpbWUpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1lZGlhIFBsYXllciBDbGFzc2ljL05lcm8gU2hvd1RpbWVcbiAgICAgICAgICAgIF0sIFtOQU1FXSwgW1xuXG4gICAgICAgICAgICAvKG5lcm8gKD86aG9tZXxzY291dCkpXFwvKChcXGQrKVtcXHdcXC4tXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOZXJvIEhvbWUvTmVybyBTY291dFxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC8obm9raWFcXGQrKVxcLygoXFxkKylbXFx3XFwuLV0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb2tpYVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC9cXHMoc29uZ2JpcmQpXFwvKChcXGQrKVtcXHdcXC4tXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTb25nYmlyZC9QaGlsaXBzLVNvbmdiaXJkXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLyh3aW5hbXApMyB2ZXJzaW9uICgoXFxkKylbXFx3XFwuLV0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaW5hbXBcbiAgICAgICAgICAgIC8od2luYW1wKVxccygoXFxkKylbXFx3XFwuLV0rKS9pLFxuICAgICAgICAgICAgLyh3aW5hbXApbXBlZ1xcLygoXFxkKylbXFx3XFwuLV0rKS9pXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLyhvY21zLWJvdHx0YXBpbnJhZGlvfHR1bmVpbiByYWRpb3x1bmtub3dufHdpbmFtcHxpbmxpZ2h0IHJhZGlvKS9pICAvLyBPQ01TLWJvdC90YXAgaW4gcmFkaW8vdHVuZWluL3Vua25vd24vd2luYW1wIChubyBvdGhlciBpbmZvKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbmxpZ2h0IHJhZGlvXG4gICAgICAgICAgICBdLCBbTkFNRV0sIFtcblxuICAgICAgICAgICAgLyhxdWlja3RpbWV8cm1hfHJhZGlvYXBwfHJhZGlvY2xpZW50YXBwbGljYXRpb258c291bmR0YXB8dG90ZW18c3RhZ2VmcmlnaHR8c3RyZWFtaXVtKVxcLygoXFxkKylbXFx3XFwuLV0rKS9pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFF1aWNrVGltZS9SZWFsTWVkaWEvUmFkaW9BcHAvUmFkaW9DbGllbnRBcHBsaWNhdGlvbi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU291bmRUYXAvVG90ZW0vU3RhZ2VmcmlnaHQvU3RyZWFtaXVtXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLyhzbXApKChcXGQrKVtcXGRcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTTVBcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKHZsYykgbWVkaWEgcGxheWVyIC0gdmVyc2lvbiAoKFxcZCspW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgIC8vIFZMQyBWaWRlb2xhblxuICAgICAgICAgICAgLyh2bGMpXFwvKChcXGQrKVtcXHdcXC4tXSspL2ksXG4gICAgICAgICAgICAvKHhibWN8Z3Zmc3x4aW5lfHhtbXN8aXJhcHApXFwvKChcXGQrKVtcXHdcXC4tXSspL2ksICAgICAgICAgICAgICAgICAgICAvLyBYQk1DL2d2ZnMvWGluZS9YTU1TL2lyYXBwXG4gICAgICAgICAgICAvKGZvb2JhcjIwMDApXFwvKChcXGQrKVtcXGRcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGb29iYXIyMDAwXG4gICAgICAgICAgICAvKGl0dW5lcylcXC8oKFxcZCspW1xcZFxcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpVHVuZXNcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKHdtcGxheWVyKVxcLygoXFxkKylbXFx3XFwuLV0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaW5kb3dzIE1lZGlhIFBsYXllclxuICAgICAgICAgICAgLyh3aW5kb3dzLW1lZGlhLXBsYXllcilcXC8oKFxcZCspW1xcd1xcLi1dKykvaVxuICAgICAgICAgICAgXSwgW1tOQU1FLCAvLS9nLCAnICddLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvd2luZG93c1xcLygoXFxkKylbXFx3XFwuLV0rKSB1cG5wXFwvW1xcZFxcLl0rIGRsbmFkb2NcXC9bXFxkXFwuXSsgKGhvbWUgbWVkaWEgc2VydmVyKS9pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdpbmRvd3MgTWVkaWEgU2VydmVyXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdXaW5kb3dzJ11dLCBbXG5cbiAgICAgICAgICAgIC8oY29tXFwucmlzZXVwcmFkaW9hbGFybSlcXC8oKFxcZCspW1xcZFxcLl0qKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSaXNlVVAgUmFkaW8gQWxhcm1cbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKHJhZC5pbylcXHMoKFxcZCspW1xcZFxcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSYWQuaW9cbiAgICAgICAgICAgIC8ocmFkaW8uKD86ZGV8YXR8ZnIpKVxccygoXFxkKylbXFxkXFwuXSspL2lcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ3JhZC5pbyddLCBWRVJTSU9OXVxuXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgICAgICAvLyBNZWRpYSBwbGF5ZXJzIEVORFxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8qL1xuXG4gICAgICAgIF0sXG5cbiAgICAgICAgY3B1IDogW1tcblxuICAgICAgICAgICAgLyg/OihhbWR8eCg/Oig/Ojg2fDY0KVtfLV0pP3x3b3d8d2luKTY0KVs7XFwpXS9pICAgICAgICAgICAgICAgICAgICAgLy8gQU1ENjRcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnYW1kNjQnXV0sIFtcblxuICAgICAgICAgICAgLyhpYTMyKD89OykpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJQTMyIChxdWlja3RpbWUpXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgdXRpbC5sb3dlcml6ZV1dLCBbXG5cbiAgICAgICAgICAgIC8oKD86aVszNDZdfHgpODYpWztcXCldL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElBMzJcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnaWEzMiddXSwgW1xuXG4gICAgICAgICAgICAvLyBQb2NrZXRQQyBtaXN0YWtlbmx5IGlkZW50aWZpZWQgYXMgUG93ZXJQQ1xuICAgICAgICAgICAgL3dpbmRvd3NcXHMoY2V8bW9iaWxlKTtcXHNwcGM7L2lcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnYXJtJ11dLCBbXG5cbiAgICAgICAgICAgIC8oKD86cHBjfHBvd2VycGMpKD86NjQpPykoPzpcXHNtYWN8O3xcXCkpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQb3dlclBDXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgL293ZXIvLCAnJywgdXRpbC5sb3dlcml6ZV1dLCBbXG5cbiAgICAgICAgICAgIC8oc3VuNFxcdylbO1xcKV0vaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTUEFSQ1xuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdzcGFyYyddXSwgW1xuXG4gICAgICAgICAgICAvKCg/OmF2cjMyfGlhNjQoPz07KSl8NjhrKD89XFwpKXxhcm0oPzo2NHwoPz12XFxkKzspKXwoPz1hdG1lbFxccylhdnJ8KD86aXJpeHxtaXBzfHNwYXJjKSg/OjY0KT8oPz07KXxwYS1yaXNjKS9pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElBNjQsIDY4SywgQVJNLzY0LCBBVlIvMzIsIElSSVgvNjQsIE1JUFMvNjQsIFNQQVJDLzY0LCBQQS1SSVNDXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgdXRpbC5sb3dlcml6ZV1dXG4gICAgICAgIF0sXG5cbiAgICAgICAgZGV2aWNlIDogW1tcblxuICAgICAgICAgICAgL1xcKChpcGFkfHBsYXlib29rKTtbXFx3XFxzXFwpOy1dKyhyaW18YXBwbGUpL2kgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaVBhZC9QbGF5Qm9va1xuICAgICAgICAgICAgXSwgW01PREVMLCBWRU5ET1IsIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvYXBwbGVjb3JlbWVkaWFcXC9bXFx3XFwuXSsgXFwoKGlwYWQpLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpUGFkXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdBcHBsZSddLCBbVFlQRSwgVEFCTEVUXV0sIFtcblxuICAgICAgICAgICAgLyhhcHBsZVxcc3swLDF9dHYpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXBwbGUgVFZcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsICdBcHBsZSBUViddLCBbVkVORE9SLCAnQXBwbGUnXV0sIFtcblxuICAgICAgICAgICAgLyhhcmNob3MpXFxzKGdhbWVwYWQyPykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXJjaG9zXG4gICAgICAgICAgICAvKGhwKS4rKHRvdWNocGFkKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhQIFRvdWNoUGFkXG4gICAgICAgICAgICAvKGhwKS4rKHRhYmxldCkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhQIFRhYmxldFxuICAgICAgICAgICAgLyhraW5kbGUpXFwvKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBLaW5kbGVcbiAgICAgICAgICAgIC9cXHMobm9vaylbXFx3XFxzXStidWlsZFxcLyhcXHcrKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb29rXG4gICAgICAgICAgICAvKGRlbGwpXFxzKHN0cmVhW2twclxcc1xcZF0qW1xcZGtvXSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEZWxsIFN0cmVha1xuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvKGtmW0Etel0rKVxcc2J1aWxkXFwvW1xcd1xcLl0rLipzaWxrXFwvL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS2luZGxlIEZpcmUgSERcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0FtYXpvbiddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8oc2R8a2YpWzAzNDloaWpvcnN0dXddK1xcc2J1aWxkXFwvW1xcd1xcLl0rLipzaWxrXFwvL2kgICAgICAgICAgICAgICAgICAvLyBGaXJlIFBob25lXG4gICAgICAgICAgICBdLCBbW01PREVMLCBtYXBwZXIuc3RyLCBtYXBzLmRldmljZS5hbWF6b24ubW9kZWxdLCBbVkVORE9SLCAnQW1hem9uJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvXFwoKGlwW2hvbmVkfFxcc1xcdypdKyk7LisoYXBwbGUpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlQb2QvaVBob25lXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFZFTkRPUiwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFwoKGlwW2hvbmVkfFxcc1xcdypdKyk7L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlQb2QvaVBob25lXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdBcHBsZSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLyhibGFja2JlcnJ5KVtcXHMtXT8oXFx3KykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsYWNrQmVycnlcbiAgICAgICAgICAgIC8oYmxhY2tiZXJyeXxiZW5xfHBhbG0oPz1cXC0pfHNvbnllcmljc3NvbnxhY2VyfGFzdXN8ZGVsbHxodWF3ZWl8bWVpenV8bW90b3JvbGF8cG9seXRyb24pW1xcc18tXT8oW1xcdy1dKykqL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJlblEvUGFsbS9Tb255LUVyaWNzc29uL0FjZXIvQXN1cy9EZWxsL0h1YXdlaS9NZWl6dS9Nb3Rvcm9sYS9Qb2x5dHJvblxuICAgICAgICAgICAgLyhocClcXHMoW1xcd1xcc10rXFx3KS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSFAgaVBBUVxuICAgICAgICAgICAgLyhhc3VzKS0/KFxcdyspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXN1c1xuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcKGJiMTA7XFxzKFxcdyspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCbGFja0JlcnJ5IDEwXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdCbGFja0JlcnJ5J10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBc3VzIFRhYmxldHNcbiAgICAgICAgICAgIC9hbmRyb2lkLisodHJhbnNmb1twcmltZVxcc117NCwxMH1cXHNcXHcrfGVlZXBjfHNsaWRlclxcc1xcdyt8bmV4dXMgN3xwYWRmb25lKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdBc3VzJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvKHNvbnkpXFxzKHRhYmxldFxcc1twc10pXFxzYnVpbGRcXC8vaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29ueVxuICAgICAgICAgICAgLyhzb255KT8oPzpzZ3AuKylcXHNidWlsZFxcLy9pXG4gICAgICAgICAgICBdLCBbW1ZFTkRPUiwgJ1NvbnknXSwgW01PREVMLCAnWHBlcmlhIFRhYmxldCddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8oPzpzb255KT8oPzooPzooPzpjfGQpXFxkezR9KXwoPzpzb1stbF0uKykpXFxzYnVpbGRcXC8vaVxuICAgICAgICAgICAgXSwgW1tWRU5ET1IsICdTb255J10sIFtNT0RFTCwgJ1hwZXJpYSBQaG9uZSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgL1xccyhvdXlhKVxccy9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE91eWFcbiAgICAgICAgICAgIC8obmludGVuZG8pXFxzKFt3aWRzM3VdKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5pbnRlbmRvXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBNT0RFTCwgW1RZUEUsIENPTlNPTEVdXSwgW1xuXG4gICAgICAgICAgICAvYW5kcm9pZC4rO1xccyhzaGllbGQpXFxzYnVpbGQvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTnZpZGlhXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdOdmlkaWEnXSwgW1RZUEUsIENPTlNPTEVdXSwgW1xuXG4gICAgICAgICAgICAvKHBsYXlzdGF0aW9uXFxzWzM0cG9ydGFibGV2aV0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQbGF5c3RhdGlvblxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnU29ueSddLCBbVFlQRSwgQ09OU09MRV1dLCBbXG5cbiAgICAgICAgICAgIC8oc3ByaW50XFxzKFxcdyspKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTcHJpbnQgUGhvbmVzXG4gICAgICAgICAgICBdLCBbW1ZFTkRPUiwgbWFwcGVyLnN0ciwgbWFwcy5kZXZpY2Uuc3ByaW50LnZlbmRvcl0sIFtNT0RFTCwgbWFwcGVyLnN0ciwgbWFwcy5kZXZpY2Uuc3ByaW50Lm1vZGVsXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8obGVub3ZvKVxccz8oUyg/OjUwMDB8NjAwMCkrKD86Wy1dW1xcdytdKSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMZW5vdm8gdGFibGV0c1xuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvKGh0YylbO19cXHMtXSsoW1xcd1xcc10rKD89XFwpKXxcXHcrKSovaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSFRDXG4gICAgICAgICAgICAvKHp0ZSktKFxcdyspKi9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBaVEVcbiAgICAgICAgICAgIC8oYWxjYXRlbHxnZWVrc3Bob25lfGh1YXdlaXxsZW5vdm98bmV4aWFufHBhbmFzb25pY3woPz07XFxzKXNvbnkpW19cXHMtXT8oW1xcdy1dKykqL2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxjYXRlbC9HZWVrc1Bob25lL0h1YXdlaS9MZW5vdm8vTmV4aWFuL1BhbmFzb25pYy9Tb255XG4gICAgICAgICAgICBdLCBbVkVORE9SLCBbTU9ERUwsIC9fL2csICcgJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvKG5leHVzXFxzOSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIVEMgTmV4dXMgOVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnSFRDJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvKG5leHVzXFxzNnApL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIdWF3ZWkgTmV4dXMgNlBcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0h1YXdlaSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLyhtaWNyb3NvZnQpO1xccyhsdW1pYVtcXHNcXHddKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaWNyb3NvZnQgTHVtaWFcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgL1tcXHNcXCg7XSh4Ym94KD86XFxzb25lKT8pW1xcc1xcKTtdL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1pY3Jvc29mdCBYYm94XG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdNaWNyb3NvZnQnXSwgW1RZUEUsIENPTlNPTEVdXSwgW1xuICAgICAgICAgICAgLyhraW5cXC5bb25ldHddezN9KS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWljcm9zb2Z0IEtpblxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgL1xcLi9nLCAnICddLCBbVkVORE9SLCAnTWljcm9zb2Z0J10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1vdG9yb2xhXG4gICAgICAgICAgICAvXFxzKG1pbGVzdG9uZXxkcm9pZCg/OlsyLTR4XXxcXHMoPzpiaW9uaWN8eDJ8cHJvfHJhenIpKT8oOj9cXHM0Zyk/KVtcXHdcXHNdK2J1aWxkXFwvL2ksXG4gICAgICAgICAgICAvbW90W1xccy1dPyhcXHcrKSovaSxcbiAgICAgICAgICAgIC8oWFRcXGR7Myw0fSkgYnVpbGRcXC8vaSxcbiAgICAgICAgICAgIC8obmV4dXNcXHM2KS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdNb3Rvcm9sYSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9hbmRyb2lkLitcXHMobXo2MFxcZHx4b29tW1xcczJdezAsMn0pXFxzYnVpbGRcXC8vaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnTW90b3JvbGEnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC9oYmJ0dlxcL1xcZCtcXC5cXGQrXFwuXFxkK1xccytcXChbXFx3XFxzXSo7XFxzKihcXHdbXjtdKik7KFteO10qKS9pICAgICAgICAgICAgLy8gSGJiVFYgZGV2aWNlc1xuICAgICAgICAgICAgXSwgW1tWRU5ET1IsIHV0aWwudHJpbV0sIFtNT0RFTCwgdXRpbC50cmltXSwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuXG4gICAgICAgICAgICAvaGJidHYuK21hcGxlOyhcXGQrKS9pXG4gICAgICAgICAgICBdLCBbW01PREVMLCAvXi8sICdTbWFydFRWJ10sIFtWRU5ET1IsICdTYW1zdW5nJ10sIFtUWVBFLCBTTUFSVFRWXV0sIFtcblxuICAgICAgICAgICAgL1xcKGR0dltcXCk7XS4rKGFxdW9zKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNoYXJwXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdTaGFycCddLCBbVFlQRSwgU01BUlRUVl1dLCBbXG5cbiAgICAgICAgICAgIC9hbmRyb2lkLisoKHNjaC1pWzg5XTBcXGR8c2h3LW0zODBzfGd0LXBcXGR7NH18Z3QtblxcZCt8c2doLXQ4WzU2XTl8bmV4dXMgMTApKS9pLFxuICAgICAgICAgICAgLygoU00tVFxcdyspKS9pXG4gICAgICAgICAgICBdLCBbW1ZFTkRPUiwgJ1NhbXN1bmcnXSwgTU9ERUwsIFtUWVBFLCBUQUJMRVRdXSwgWyAgICAgICAgICAgICAgICAgIC8vIFNhbXN1bmdcbiAgICAgICAgICAgIC9zbWFydC10di4rKHNhbXN1bmcpL2lcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIFtUWVBFLCBTTUFSVFRWXSwgTU9ERUxdLCBbXG4gICAgICAgICAgICAvKChzW2NncF1oLVxcdyt8Z3QtXFx3K3xnYWxheHlcXHNuZXh1c3xzbS1cXHdbXFx3XFxkXSspKS9pLFxuICAgICAgICAgICAgLyhzYW1bc3VuZ10qKVtcXHMtXSooXFx3Ky0/W1xcdy1dKikqL2ksXG4gICAgICAgICAgICAvc2VjLSgoc2doXFx3KykpL2lcbiAgICAgICAgICAgIF0sIFtbVkVORE9SLCAnU2Ftc3VuZyddLCBNT0RFTCwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC9zaWUtKFxcdyspKi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpZW1lbnNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1NpZW1lbnMnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8obWFlbW98bm9raWEpLioobjkwMHxsdW1pYVxcc1xcZCspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb2tpYVxuICAgICAgICAgICAgLyhub2tpYSlbXFxzXy1dPyhbXFx3LV0rKSovaVxuICAgICAgICAgICAgXSwgW1tWRU5ET1IsICdOb2tpYSddLCBNT0RFTCwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC9hbmRyb2lkXFxzM1xcLltcXHNcXHc7LV17MTB9KGFcXGR7M30pL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBY2VyXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdBY2VyJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvYW5kcm9pZFxcczNcXC5bXFxzXFx3Oy1dezEwfShsZz8pLShbMDZjdjldezMsNH0pL2kgICAgICAgICAgICAgICAgICAgICAvLyBMRyBUYWJsZXRcbiAgICAgICAgICAgIF0sIFtbVkVORE9SLCAnTEcnXSwgTU9ERUwsIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyhsZykgbmV0Y2FzdFxcLnR2L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTEcgU21hcnRUVlxuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC8obmV4dXNcXHNbNDVdKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExHXG4gICAgICAgICAgICAvbGdbZTtcXHNcXC8tXSsoXFx3KykqL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0xHJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvYW5kcm9pZC4rKGlkZWF0YWJbYS16MC05XFwtXFxzXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGVub3ZvXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdMZW5vdm8nXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC9saW51eDsuKygoam9sbGEpKTsvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSm9sbGFcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLygocGViYmxlKSlhcHBcXC9bXFxkXFwuXStcXHMvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGViYmxlXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBNT0RFTCwgW1RZUEUsIFdFQVJBQkxFXV0sIFtcblxuICAgICAgICAgICAgL2FuZHJvaWQuKztcXHMoZ2xhc3MpXFxzXFxkL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb29nbGUgR2xhc3NcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0dvb2dsZSddLCBbVFlQRSwgV0VBUkFCTEVdXSwgW1xuXG4gICAgICAgICAgICAvYW5kcm9pZC4rKFxcdyspXFxzK2J1aWxkXFwvaG1cXDEvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBYaWFvbWkgSG9uZ21pICdudW1lcmljJyBtb2RlbHNcbiAgICAgICAgICAgIC9hbmRyb2lkLisoaG1bXFxzXFwtX10qbm90ZT9bXFxzX10qKD86XFxkXFx3KT8pXFxzK2J1aWxkL2ksICAgICAgICAgICAgICAgLy8gWGlhb21pIEhvbmdtaVxuICAgICAgICAgICAgL2FuZHJvaWQuKyhtaVtcXHNcXC1fXSooPzpvbmV8b25lW1xcc19dcGx1c3xub3RlIGx0ZSk/W1xcc19dKig/OlxcZFxcdyk/KVxccytidWlsZC9pICAgIC8vIFhpYW9taSBNaVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgL18vZywgJyAnXSwgW1ZFTkRPUiwgJ1hpYW9taSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgL2FuZHJvaWQuK2EwMDAoMSlcXHMrYnVpbGQvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT25lUGx1c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnT25lUGx1cyddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgL1xccyh0YWJsZXQpWztcXC9dL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVuaWRlbnRpZmlhYmxlIFRhYmxldFxuICAgICAgICAgICAgL1xccyhtb2JpbGUpKD86WztcXC9dfFxcc3NhZmFyaSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVbmlkZW50aWZpYWJsZSBNb2JpbGVcbiAgICAgICAgICAgIF0sIFtbVFlQRSwgdXRpbC5sb3dlcml6ZV0sIFZFTkRPUiwgTU9ERUxdXG5cbiAgICAgICAgICAgIC8qLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIFRPRE86IG1vdmUgdG8gc3RyaW5nIG1hcFxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICAgICAvKEM2NjAzKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbnkgWHBlcmlhIFogQzY2MDNcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsICdYcGVyaWEgWiBDNjYwMyddLCBbVkVORE9SLCAnU29ueSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC8oQzY5MDMpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29ueSBYcGVyaWEgWiAxXG4gICAgICAgICAgICBdLCBbW01PREVMLCAnWHBlcmlhIFogMSddLCBbVkVORE9SLCAnU29ueSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLyhTTS1HOTAwW0Z8SF0pL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYW1zdW5nIEdhbGF4eSBTNVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgJ0dhbGF4eSBTNSddLCBbVkVORE9SLCAnU2Ftc3VuZyddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC8oU00tRzcxMDIpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2Ftc3VuZyBHYWxheHkgR3JhbmQgMlxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgJ0dhbGF4eSBHcmFuZCAyJ10sIFtWRU5ET1IsICdTYW1zdW5nJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgLyhTTS1HNTMwSCkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYW1zdW5nIEdhbGF4eSBHcmFuZCBQcmltZVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgJ0dhbGF4eSBHcmFuZCBQcmltZSddLCBbVkVORE9SLCAnU2Ftc3VuZyddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC8oU00tRzMxM0haKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2Ftc3VuZyBHYWxheHkgVlxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgJ0dhbGF4eSBWJ10sIFtWRU5ET1IsICdTYW1zdW5nJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgLyhTTS1UODA1KS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYW1zdW5nIEdhbGF4eSBUYWIgUyAxMC41XG4gICAgICAgICAgICBdLCBbW01PREVMLCAnR2FsYXh5IFRhYiBTIDEwLjUnXSwgW1ZFTkRPUiwgJ1NhbXN1bmcnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvKFNNLUc4MDBGKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhbXN1bmcgR2FsYXh5IFM1IE1pbmlcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsICdHYWxheHkgUzUgTWluaSddLCBbVkVORE9SLCAnU2Ftc3VuZyddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC8oU00tVDMxMSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2Ftc3VuZyBHYWxheHkgVGFiIDMgOC4wXG4gICAgICAgICAgICBdLCBbW01PREVMLCAnR2FsYXh5IFRhYiAzIDguMCddLCBbVkVORE9SLCAnU2Ftc3VuZyddLCBbVFlQRSwgVEFCTEVUXV0sIFtcblxuICAgICAgICAgICAgLyhSMTAwMSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcHBvIFIxMDAxXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdPUFBPJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgLyhYOTAwNikvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcHBvIEZpbmQgN2FcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsICdGaW5kIDdhJ10sIFtWRU5ET1IsICdPcHBvJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgLyhSMjAwMSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcHBvIFlPWU8gUjIwMDFcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsICdZb3lvIFIyMDAxJ10sIFtWRU5ET1IsICdPcHBvJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgLyhSODE1KS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcHBvIENsb3ZlciBSODE1XG4gICAgICAgICAgICBdLCBbW01PREVMLCAnQ2xvdmVyIFI4MTUnXSwgW1ZFTkRPUiwgJ09wcG8nXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAgLyhVNzA3KS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wcG8gRmluZCBXYXkgU1xuICAgICAgICAgICAgXSwgW1tNT0RFTCwgJ0ZpbmQgV2F5IFMnXSwgW1ZFTkRPUiwgJ09wcG8nXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8oVDNDKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWR2YW4gVmFuZHJvaWQgVDNDXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdBZHZhbiddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8oQURWQU4gVDFKXFwrKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkdmFuIFZhbmRyb2lkIFQxSitcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsICdWYW5kcm9pZCBUMUorJ10sIFtWRU5ET1IsICdBZHZhbiddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8oQURWQU4gUzRBKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWR2YW4gVmFuZHJvaWQgUzRBXG4gICAgICAgICAgICBdLCBbW01PREVMLCAnVmFuZHJvaWQgUzRBJ10sIFtWRU5ET1IsICdBZHZhbiddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLyhWOTcyTSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBaVEUgVjk3Mk1cbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1pURSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLyhpLW1vYmlsZSlcXHMoSVFcXHNbXFxkXFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaS1tb2JpbGUgSVFcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC8oSVE2LjMpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaS1tb2JpbGUgSVEgSVEgNi4zXG4gICAgICAgICAgICBdLCBbW01PREVMLCAnSVEgNi4zJ10sIFtWRU5ET1IsICdpLW1vYmlsZSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC8oaS1tb2JpbGUpXFxzKGktc3R5bGVcXHNbXFxkXFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGktbW9iaWxlIGktU1RZTEVcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC8oaS1TVFlMRTIuMSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaS1tb2JpbGUgaS1TVFlMRSAyLjFcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsICdpLVNUWUxFIDIuMSddLCBbVkVORE9SLCAnaS1tb2JpbGUnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8obW9iaWlzdGFyIHRvdWNoIExBSSA1MTIpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbW9iaWlzdGFyIHRvdWNoIExBSSA1MTJcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsICdUb3VjaCBMQUkgNTEyJ10sIFtWRU5ET1IsICdtb2JpaXN0YXInXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIEVORCBUT0RPXG4gICAgICAgICAgICAvLy8vLy8vLy8vLyovXG5cbiAgICAgICAgXSxcblxuICAgICAgICBlbmdpbmUgOiBbW1xuXG4gICAgICAgICAgICAvd2luZG93cy4rXFxzZWRnZVxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFZGdlSFRNTFxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnRWRnZUhUTUwnXV0sIFtcblxuICAgICAgICAgICAgLyhwcmVzdG8pXFwvKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmVzdG9cbiAgICAgICAgICAgIC8od2Via2l0fHRyaWRlbnR8bmV0ZnJvbnR8bmV0c3VyZnxhbWF5YXxseW54fHczbSlcXC8oW1xcd1xcLl0rKS9pLCAgICAgLy8gV2ViS2l0L1RyaWRlbnQvTmV0RnJvbnQvTmV0U3VyZi9BbWF5YS9MeW54L3czbVxuICAgICAgICAgICAgLyhraHRtbHx0YXNtYW58bGlua3MpW1xcL1xcc11cXCg/KFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtIVE1ML1Rhc21hbi9MaW5rc1xuICAgICAgICAgICAgLyhpY2FiKVtcXC9cXHNdKFsyM11cXC5bXFxkXFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlDYWJcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvcnZcXDooW1xcd1xcLl0rKS4qKGdlY2tvKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdlY2tvXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgTkFNRV1cbiAgICAgICAgXSxcblxuICAgICAgICBvcyA6IFtbXG5cbiAgICAgICAgICAgIC8vIFdpbmRvd3MgYmFzZWRcbiAgICAgICAgICAgIC9taWNyb3NvZnRcXHMod2luZG93cylcXHModmlzdGF8eHApL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaW5kb3dzIChpVHVuZXMpXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC8od2luZG93cylcXHNudFxcczZcXC4yO1xccyhhcm0pL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdpbmRvd3MgUlRcbiAgICAgICAgICAgIC8od2luZG93c1xcc3Bob25lKD86XFxzb3MpKilbXFxzXFwvXT8oW1xcZFxcLlxcc10rXFx3KSovaSwgICAgICAgICAgICAgICAgICAvLyBXaW5kb3dzIFBob25lXG4gICAgICAgICAgICAvKHdpbmRvd3NcXHNtb2JpbGV8d2luZG93cylbXFxzXFwvXT8oW250Y2VcXGRcXC5cXHNdK1xcdykvaVxuICAgICAgICAgICAgXSwgW05BTUUsIFtWRVJTSU9OLCBtYXBwZXIuc3RyLCBtYXBzLm9zLndpbmRvd3MudmVyc2lvbl1dLCBbXG4gICAgICAgICAgICAvKHdpbig/PTN8OXxuKXx3aW5cXHM5eFxccykoW250XFxkXFwuXSspL2lcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ1dpbmRvd3MnXSwgW1ZFUlNJT04sIG1hcHBlci5zdHIsIG1hcHMub3Mud2luZG93cy52ZXJzaW9uXV0sIFtcblxuICAgICAgICAgICAgLy8gTW9iaWxlL0VtYmVkZGVkIE9TXG4gICAgICAgICAgICAvXFwoKGJiKSgxMCk7L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCbGFja0JlcnJ5IDEwXG4gICAgICAgICAgICBdLCBbW05BTUUsICdCbGFja0JlcnJ5J10sIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKGJsYWNrYmVycnkpXFx3KlxcLz8oW1xcd1xcLl0rKSovaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCbGFja2JlcnJ5XG4gICAgICAgICAgICAvKHRpemVuKVtcXC9cXHNdKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaXplblxuICAgICAgICAgICAgLyhhbmRyb2lkfHdlYm9zfHBhbG1cXHNvc3xxbnh8YmFkYXxyaW1cXHN0YWJsZXRcXHNvc3xtZWVnb3xjb250aWtpKVtcXC9cXHMtXT8oW1xcd1xcLl0rKSovaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQW5kcm9pZC9XZWJPUy9QYWxtL1FOWC9CYWRhL1JJTS9NZWVHby9Db250aWtpXG4gICAgICAgICAgICAvbGludXg7Lisoc2FpbGZpc2gpOy9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhaWxmaXNoIE9TXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC8oc3ltYmlhblxccz9vc3xzeW1ib3N8czYwKD89OykpW1xcL1xccy1dPyhbXFx3XFwuXSspKi9pICAgICAgICAgICAgICAgICAvLyBTeW1iaWFuXG4gICAgICAgICAgICBdLCBbW05BTUUsICdTeW1iaWFuJ10sIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvXFwoKHNlcmllczQwKTsvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZXJpZXMgNDBcbiAgICAgICAgICAgIF0sIFtOQU1FXSwgW1xuICAgICAgICAgICAgL21vemlsbGEuK1xcKG1vYmlsZTsuK2dlY2tvLitmaXJlZm94L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveCBPU1xuICAgICAgICAgICAgXSwgW1tOQU1FLCAnRmlyZWZveCBPUyddLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvLyBDb25zb2xlXG4gICAgICAgICAgICAvKG5pbnRlbmRvfHBsYXlzdGF0aW9uKVxccyhbd2lkczM0cG9ydGFibGV2dV0rKS9pLCAgICAgICAgICAgICAgICAgICAvLyBOaW50ZW5kby9QbGF5c3RhdGlvblxuXG4gICAgICAgICAgICAvLyBHTlUvTGludXggYmFzZWRcbiAgICAgICAgICAgIC8obWludClbXFwvXFxzXFwoXT8oXFx3KykqL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1pbnRcbiAgICAgICAgICAgIC8obWFnZWlhfHZlY3RvcmxpbnV4KVs7XFxzXS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hZ2VpYS9WZWN0b3JMaW51eFxuICAgICAgICAgICAgLyhqb2xpfFtreGxuXT91YnVudHV8ZGViaWFufFtvcGVuXSpzdXNlfGdlbnRvb3woPz1cXHMpYXJjaHxzbGFja3dhcmV8ZmVkb3JhfG1hbmRyaXZhfGNlbnRvc3xwY2xpbnV4b3N8cmVkaGF0fHplbndhbGt8bGlucHVzKVtcXC9cXHMtXT8oPyFjaHJvbSkoW1xcd1xcLi1dKykqL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEpvbGkvVWJ1bnR1L0RlYmlhbi9TVVNFL0dlbnRvby9BcmNoL1NsYWNrd2FyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGZWRvcmEvTWFuZHJpdmEvQ2VudE9TL1BDTGludXhPUy9SZWRIYXQvWmVud2Fsay9MaW5wdXNcbiAgICAgICAgICAgIC8oaHVyZHxsaW51eClcXHM/KFtcXHdcXC5dKykqL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSHVyZC9MaW51eFxuICAgICAgICAgICAgLyhnbnUpXFxzPyhbXFx3XFwuXSspKi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHTlVcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKGNyb3MpXFxzW1xcd10rXFxzKFtcXHdcXC5dK1xcdykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9taXVtIE9TXG4gICAgICAgICAgICBdLCBbW05BTUUsICdDaHJvbWl1bSBPUyddLCBWRVJTSU9OXSxbXG5cbiAgICAgICAgICAgIC8vIFNvbGFyaXNcbiAgICAgICAgICAgIC8oc3Vub3MpXFxzPyhbXFx3XFwuXStcXGQpKi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbGFyaXNcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ1NvbGFyaXMnXSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLy8gQlNEIGJhc2VkXG4gICAgICAgICAgICAvXFxzKFtmcmVudG9wYy1dezAsNH1ic2R8ZHJhZ29uZmx5KVxccz8oW1xcd1xcLl0rKSovaSAgICAgICAgICAgICAgICAgICAvLyBGcmVlQlNEL05ldEJTRC9PcGVuQlNEL1BDLUJTRC9EcmFnb25GbHlcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSxbXG5cbiAgICAgICAgICAgIC8oaGFpa3UpXFxzKFxcdyspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhhaWt1XG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sW1xuXG4gICAgICAgICAgICAvKGlwW2hvbmVhZF0rKSg/Oi4qb3NcXHMoW1xcd10rKSpcXHNsaWtlXFxzbWFjfDtcXHNvcGVyYSkvaSAgICAgICAgICAgICAgLy8gaU9TXG4gICAgICAgICAgICBdLCBbW05BTUUsICdpT1MnXSwgW1ZFUlNJT04sIC9fL2csICcuJ11dLCBbXG5cbiAgICAgICAgICAgIC8obWFjXFxzb3NcXHN4KVxccz8oW1xcd1xcc1xcLl0rXFx3KSovaSxcbiAgICAgICAgICAgIC8obWFjaW50b3NofG1hYyg/PV9wb3dlcnBjKVxccykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hYyBPU1xuICAgICAgICAgICAgXSwgW1tOQU1FLCAnTWFjIE9TJ10sIFtWRVJTSU9OLCAvXy9nLCAnLiddXSwgW1xuXG4gICAgICAgICAgICAvLyBPdGhlclxuICAgICAgICAgICAgLygoPzpvcGVuKT9zb2xhcmlzKVtcXC9cXHMtXT8oW1xcd1xcLl0rKSovaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29sYXJpc1xuICAgICAgICAgICAgLyhhaXgpXFxzKChcXGQpKD89XFwufFxcKXxcXHMpW1xcd1xcLl0qKSovaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQUlYXG4gICAgICAgICAgICAvKHBsYW5cXHM5fG1pbml4fGJlb3N8b3NcXC8yfGFtaWdhb3N8bW9ycGhvc3xyaXNjXFxzb3N8b3BlbnZtcykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGxhbjkvTWluaXgvQmVPUy9PUzIvQW1pZ2FPUy9Nb3JwaE9TL1JJU0NPUy9PcGVuVk1TXG4gICAgICAgICAgICAvKHVuaXgpXFxzPyhbXFx3XFwuXSspKi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVOSVhcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXVxuICAgICAgICBdXG4gICAgfTtcblxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBDb25zdHJ1Y3RvclxuICAgIC8vLy8vLy8vLy8vLy8vLy9cblxuXG4gICAgdmFyIFVBUGFyc2VyID0gZnVuY3Rpb24gKHVhc3RyaW5nLCBleHRlbnNpb25zKSB7XG5cbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFVBUGFyc2VyKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBVQVBhcnNlcih1YXN0cmluZywgZXh0ZW5zaW9ucykuZ2V0UmVzdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdWEgPSB1YXN0cmluZyB8fCAoKHdpbmRvdyAmJiB3aW5kb3cubmF2aWdhdG9yICYmIHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KSA/IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50IDogRU1QVFkpO1xuICAgICAgICB2YXIgcmd4bWFwID0gZXh0ZW5zaW9ucyA/IHV0aWwuZXh0ZW5kKHJlZ2V4ZXMsIGV4dGVuc2lvbnMpIDogcmVnZXhlcztcblxuICAgICAgICB0aGlzLmdldEJyb3dzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYnJvd3NlciA9IG1hcHBlci5yZ3guYXBwbHkodGhpcywgcmd4bWFwLmJyb3dzZXIpO1xuICAgICAgICAgICAgYnJvd3Nlci5tYWpvciA9IHV0aWwubWFqb3IoYnJvd3Nlci52ZXJzaW9uKTtcbiAgICAgICAgICAgIHJldHVybiBicm93c2VyO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldENQVSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBwZXIucmd4LmFwcGx5KHRoaXMsIHJneG1hcC5jcHUpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldERldmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBwZXIucmd4LmFwcGx5KHRoaXMsIHJneG1hcC5kZXZpY2UpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldEVuZ2luZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBwZXIucmd4LmFwcGx5KHRoaXMsIHJneG1hcC5lbmdpbmUpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldE9TID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG1hcHBlci5yZ3guYXBwbHkodGhpcywgcmd4bWFwLm9zKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRSZXN1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdWEgICAgICA6IHRoaXMuZ2V0VUEoKSxcbiAgICAgICAgICAgICAgICBicm93c2VyIDogdGhpcy5nZXRCcm93c2VyKCksXG4gICAgICAgICAgICAgICAgZW5naW5lICA6IHRoaXMuZ2V0RW5naW5lKCksXG4gICAgICAgICAgICAgICAgb3MgICAgICA6IHRoaXMuZ2V0T1MoKSxcbiAgICAgICAgICAgICAgICBkZXZpY2UgIDogdGhpcy5nZXREZXZpY2UoKSxcbiAgICAgICAgICAgICAgICBjcHUgICAgIDogdGhpcy5nZXRDUFUoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRVQSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB1YTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZXRVQSA9IGZ1bmN0aW9uICh1YXN0cmluZykge1xuICAgICAgICAgICAgdWEgPSB1YXN0cmluZztcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgVUFQYXJzZXIuVkVSU0lPTiA9IExJQlZFUlNJT047XG4gICAgVUFQYXJzZXIuQlJPV1NFUiA9IHtcbiAgICAgICAgTkFNRSAgICA6IE5BTUUsXG4gICAgICAgIE1BSk9SICAgOiBNQUpPUiwgLy8gZGVwcmVjYXRlZFxuICAgICAgICBWRVJTSU9OIDogVkVSU0lPTlxuICAgIH07XG4gICAgVUFQYXJzZXIuQ1BVID0ge1xuICAgICAgICBBUkNISVRFQ1RVUkUgOiBBUkNISVRFQ1RVUkVcbiAgICB9O1xuICAgIFVBUGFyc2VyLkRFVklDRSA9IHtcbiAgICAgICAgTU9ERUwgICA6IE1PREVMLFxuICAgICAgICBWRU5ET1IgIDogVkVORE9SLFxuICAgICAgICBUWVBFICAgIDogVFlQRSxcbiAgICAgICAgQ09OU09MRSA6IENPTlNPTEUsXG4gICAgICAgIE1PQklMRSAgOiBNT0JJTEUsXG4gICAgICAgIFNNQVJUVFYgOiBTTUFSVFRWLFxuICAgICAgICBUQUJMRVQgIDogVEFCTEVULFxuICAgICAgICBXRUFSQUJMRTogV0VBUkFCTEUsXG4gICAgICAgIEVNQkVEREVEOiBFTUJFRERFRFxuICAgIH07XG4gICAgVUFQYXJzZXIuRU5HSU5FID0ge1xuICAgICAgICBOQU1FICAgIDogTkFNRSxcbiAgICAgICAgVkVSU0lPTiA6IFZFUlNJT05cbiAgICB9O1xuICAgIFVBUGFyc2VyLk9TID0ge1xuICAgICAgICBOQU1FICAgIDogTkFNRSxcbiAgICAgICAgVkVSU0lPTiA6IFZFUlNJT05cbiAgICB9O1xuXG5cbiAgICAvLy8vLy8vLy8vL1xuICAgIC8vIEV4cG9ydFxuICAgIC8vLy8vLy8vLy9cblxuXG4gICAgLy8gY2hlY2sganMgZW52aXJvbm1lbnRcbiAgICBpZiAodHlwZW9mKGV4cG9ydHMpICE9PSBVTkRFRl9UWVBFKSB7XG4gICAgICAgIC8vIG5vZGVqcyBlbnZcbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09IFVOREVGX1RZUEUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFVBUGFyc2VyO1xuICAgICAgICB9XG4gICAgICAgIGV4cG9ydHMuVUFQYXJzZXIgPSBVQVBhcnNlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXF1aXJlanMgZW52IChvcHRpb25hbClcbiAgICAgICAgaWYgKHR5cGVvZihkZWZpbmUpID09PSBGVU5DX1RZUEUgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVUFQYXJzZXI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGJyb3dzZXIgZW52XG4gICAgICAgICAgICB3aW5kb3cuVUFQYXJzZXIgPSBVQVBhcnNlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGpRdWVyeS9aZXB0byBzcGVjaWZpYyAob3B0aW9uYWwpXG4gICAgLy8gTm90ZTpcbiAgICAvLyAgIEluIEFNRCBlbnYgdGhlIGdsb2JhbCBzY29wZSBzaG91bGQgYmUga2VwdCBjbGVhbiwgYnV0IGpRdWVyeSBpcyBhbiBleGNlcHRpb24uXG4gICAgLy8gICBqUXVlcnkgYWx3YXlzIGV4cG9ydHMgdG8gZ2xvYmFsIHNjb3BlLCB1bmxlc3MgalF1ZXJ5Lm5vQ29uZmxpY3QodHJ1ZSkgaXMgdXNlZCxcbiAgICAvLyAgIGFuZCB3ZSBzaG91bGQgY2F0Y2ggdGhhdC5cbiAgICB2YXIgJCA9IHdpbmRvdy5qUXVlcnkgfHwgd2luZG93LlplcHRvO1xuICAgIGlmICh0eXBlb2YgJCAhPT0gVU5ERUZfVFlQRSkge1xuICAgICAgICB2YXIgcGFyc2VyID0gbmV3IFVBUGFyc2VyKCk7XG4gICAgICAgICQudWEgPSBwYXJzZXIuZ2V0UmVzdWx0KCk7XG4gICAgICAgICQudWEuZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VyLmdldFVBKCk7XG4gICAgICAgIH07XG4gICAgICAgICQudWEuc2V0ID0gZnVuY3Rpb24gKHVhc3RyaW5nKSB7XG4gICAgICAgICAgICBwYXJzZXIuc2V0VUEodWFzdHJpbmcpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHBhcnNlci5nZXRSZXN1bHQoKTtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgJC51YVtwcm9wXSA9IHJlc3VsdFtwcm9wXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbn0pKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnID8gd2luZG93IDogdGhpcyk7XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGREZWZhdWx0cyhhZFBhcmFtcywgY2IpIHtcbiAgLy8gRmlsbCBpbiBvcHRpb25hbCBBZFBhcmFtcyBmaWVsZHNcbiAgYWRQYXJhbXMucGl4ZWxzID0gYWRQYXJhbXMucGl4ZWxzIHx8IFtdO1xuICBhZFBhcmFtcy5zb3VyY2VzID0gYWRQYXJhbXMuc291cmNlcyB8fCBbXTtcbiAgYWRQYXJhbXMuZmVhdHVyZXMgPSBhZFBhcmFtcy5mZWF0dXJlcyB8fCBbXTtcbiAgYWRQYXJhbXMub3B0aW9ucyA9IGFkUGFyYW1zLm9wdGlvbnMgfHwge307XG4gIGFkUGFyYW1zLnZpZGVvQ2xpY2tzID0gYWRQYXJhbXMudmlkZW9DbGlja3MgfHwge307XG4gIGFkUGFyYW1zLnZpZGVvQ2xpY2tzLmNsaWNrVHJhY2tpbmcgPSBhZFBhcmFtcy52aWRlb0NsaWNrcy5jbGlja1RyYWNraW5nIHx8IFtdO1xuICAvLyBGb3Igd2hlbiB3ZSBhcmUgY29uc29sZSBpbnZlbnRvcnlcbiAgYWRQYXJhbXMubWV0YWRhdGEgPSBhZFBhcmFtcy5tZXRhZGF0YSB8fCB7fTtcbiAgYWRQYXJhbXMubWV0YWRhdGEuZGVtYW5kU291cmNlSWQgPSBhZFBhcmFtcy5tZXRhZGF0YS5kZW1hbmRTb3VyY2VJZCB8fCAwO1xuICBjYihudWxsLCBhZFBhcmFtcyk7XG59XG4iLCJpbXBvcnQge2dldFRydWVVcmxJbmZvfSBmcm9tICcuLi91dGlsL3VybCc7XG5pbXBvcnQge3ZwYWlkSlNXcmFwcGVyVmVyc2lvbn0gZnJvbSAnLi4vbWV0YWRhdGEuanNvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZE1ldGFkYXRhKGFkUGFyYW1zLCBjYWxsYmFjaykge1xuICBhZFBhcmFtcy5tZXRhZGF0YS5wcm90b2NvbCA9IGdldFRydWVVcmxJbmZvKCkudG9wVXJsLm1hdGNoKC9eKFxcdyspOi8pWzFdIHx8ICdodHRwcyc7XG4gIGFkUGFyYW1zLm1ldGFkYXRhLnZwYWlkSlNXcmFwcGVyVmVyc2lvbiA9IHZwYWlkSlNXcmFwcGVyVmVyc2lvbjtcbiAgY2FsbGJhY2sobnVsbCwgYWRQYXJhbXMpO1xufVxuIiwiaW1wb3J0IERpYWcgZnJvbSAnLi4vZGlhZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpcmVJbml0UGl4ZWxzKGFkUGFyYW1zLCBjYikge1xuICBjb25zdCBkaWFnID0gbmV3IERpYWcoYWRQYXJhbXMpO1xuICBkaWFnLmZpcmUoJ1ZJU1RBX0xPQURFRCcpO1xuICBjYihudWxsLCBhZFBhcmFtcyk7XG59XG4iLCJpbXBvcnQgYXN5bmMgZnJvbSAnYXN5bmMnO1xuXG5pbXBvcnQgZ2V0QWRQYXJhbXNGcm9tWG1sIGZyb20gJy4vcGFyc2VfeWFob29fYWRwYXJhbXMnO1xuaW1wb3J0IGFkZERlZmF1bHRzIGZyb20gJy4vYWRkX2RlZmF1bHRzJztcbmltcG9ydCBhZGRNZXRhZGF0YSBmcm9tICcuL2FkZF9tZXRhZGF0YSc7XG5pbXBvcnQgZmlyZUluaXRQaXhlbHMgZnJvbSAnLi9maXJlX2luaXRfcGl4ZWxzJztcbmltcG9ydCBwYXJzZVZhc3QgZnJvbSAnLi92YXN0X3BhcnNlcic7XG5pbXBvcnQgbWFwVmFzdFBpeGVsc1RvVnBhaWQgZnJvbSAnLi9tYXBfdmFzdF92cGFpZCc7XG5pbXBvcnQgcHJvY2Vzc0NsaWNrVHJhY2tpbmcgZnJvbSAnLi9wcm9jZXNzX2NsaWNrX3RyYWNraW5nJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VBZChhZFBhcmFtcywgY2FsbGJhY2spIHtcbiAgcGlwZWxpbmUoYWRQYXJhbXMsIFtcbiAgICBnZXRBZFBhcmFtc0Zyb21YbWwsXG4gICAgYWRkRGVmYXVsdHMsXG4gICAgYWRkTWV0YWRhdGEsXG4gICAgZmlyZUluaXRQaXhlbHMsXG4gICAgcGFyc2VWYXN0LFxuICAgIG1hcFZhc3RQaXhlbHNUb1ZwYWlkLFxuICAgIHByb2Nlc3NDbGlja1RyYWNraW5nXG4gIF0sIGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gcGlwZWxpbmUoYWRQYXJhbXMsIHN0ZXBzLCBjYWxsYmFjaykge1xuICBpZiAoc3RlcHNbMF0pIHtcbiAgICBzdGVwc1swXSA9IGFzeW5jLmFwcGx5KHN0ZXBzWzBdLCBhZFBhcmFtcyk7XG4gIH1cbiAgYXN5bmMud2F0ZXJmYWxsKHN0ZXBzLCBjYWxsYmFjayk7XG59XG4iLCJjb25zdCB2YXN0VG9WcGFpZE1hcCA9IHtcbiAgc2tpcDogJ0FkU2tpcHBlZCcsXG4gIGNyZWF0aXZlVmlldzogJ0FkU3RhcnRlZCcsXG4gIGltcHJlc3Npb246ICdBZEltcHJlc3Npb24nLFxuICBzdGFydDogJ0FkVmlkZW9TdGFydCcsXG4gIGZpcnN0UXVhcnRpbGU6ICdBZFZpZGVvRmlyc3RRdWFydGlsZScsXG4gIG1pZHBvaW50OiAnQWRWaWRlb01pZHBvaW50JyxcbiAgdGhpcmRRdWFydGlsZTogJ0FkVmlkZW9UaGlyZFF1YXJ0aWxlJyxcbiAgY29tcGxldGU6ICdBZFZpZGVvQ29tcGxldGUnLFxuICBhY2NlcHRJbnZpdGF0aW9uOiAnQWRVc2VyQWNjZXB0SW52aXRhdGlvbicsXG4gIGNvbGxhcHNlOiAnQWRVc2VyTWluaW1pemUnLFxuICBjbG9zZTogJ0FkVXNlckNsb3NlJyxcbiAgcGF1c2U6ICdBZFBhdXNlZCcsXG4gIHJlc3VtZTogJ0FkUGxheWluZycsXG4gIGVycm9yOiAnQWRFcnJvcidcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1hcFZhc3RQaXhlbHNUb1ZwYWlkKGFkUGFyYW1zLCBjYikge1xuICBhZFBhcmFtcy5waXhlbHMuZm9yRWFjaChwID0+IHtcbiAgICAvLyBQYXJzZSBwcm9ncmVzcyBwaXhlbHNcbiAgICBpZiAocC5ldmVudCA9PT0gJ3Byb2dyZXNzJyAmJiBwLm9mZnNldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwLm9mZnNldCA9IHBhcnNlVGltZShwLm9mZnNldCk7XG4gICAgfVxuICAgIC8vIE1hcCBWQVNUIGV2ZW50cyB0byBWUEFJRCBldmVudHNcbiAgICBjb25zdCBtYXBwaW5nID0gdmFzdFRvVnBhaWRNYXBbcC5ldmVudF07XG4gICAgaWYgKG1hcHBpbmcpIHtcbiAgICAgIHAuZXZlbnQgPSBtYXBwaW5nO1xuICAgIH1cbiAgfSk7XG5cbiAgY2IobnVsbCwgYWRQYXJhbXMpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVRpbWUodGltZVN0cmluZykge1xuICAvLyBNYXRjaCB0aGUgSEg6TU06U1MubW1tIGNhc2VcbiAgY29uc3QgZXhwbGljaXQgPSB0aW1lU3RyaW5nLm1hdGNoKC9eKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSkoLihcXGR7M30pKT8kLyk7XG4gIGlmIChleHBsaWNpdCkge1xuICAgIGNvbnNvbGUubG9nKGV4cGxpY2l0KTtcbiAgICBjb25zb2xlLmxvZyhwYXJzZUludChleHBsaWNpdFsxXSwgMTApKTtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ3RpbWUnLFxuICAgICAgb2Zmc2V0OlxuICAgICAgICAvLyBIb3Vyc1xuICAgICAgICAzNjAwICogcGFyc2VJbnQoZXhwbGljaXRbMV0sIDEwKSArXG4gICAgICAgIC8vIE1pbnV0ZXNcbiAgICAgICAgNjAgKiBwYXJzZUludChleHBsaWNpdFsyXSwgMTApICtcbiAgICAgICAgLy8gU2Vjb25kc1xuICAgICAgICBwYXJzZUludChleHBsaWNpdFszXSwgMTApICtcbiAgICAgICAgLy8gTWlsbGlzZWNvbmRzXG4gICAgICAgIChleHBsaWNpdFs1XSA/IHBhcnNlSW50KGV4cGxpY2l0WzVdLCAxMCkgLyAxMDAwLjAgOiAwKVxuICAgIH07XG4gIH1cbiAgLy8gTWF0Y2ggdGhlIG4lIGNhc2VcbiAgY29uc3QgcGVyY2VudGFnZSA9IHRpbWVTdHJpbmcubWF0Y2goL14oXFxkKyklJC8pO1xuICBpZiAocGVyY2VudGFnZSkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAncGVyY2VudGFnZScsXG4gICAgICBvZmZzZXQ6IHBhcnNlSW50KHBlcmNlbnRhZ2VbMV0sIDEwKVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG4iLCJpbXBvcnQge3BhcnNlWG1sfSBmcm9tICcuLi91dGlsL3htbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEFkUGFyYW1zRnJvbVhtbChlbmNvZGVkQWRQYXJhbWV0ZXJzLCBjYikge1xuICAvLyBEZWNvZGUgdGhlIGJhc2U2NCBlbmNvZGVkIHN0cmluZ1xuICB0cnkge1xuICAgIHZhciBqc29uQWRQYXJhbXMgPSBwYXJzZUpTT04oZW5jb2RlZEFkUGFyYW1ldGVycyk7XG4gICAgY2IobnVsbCwganNvbkFkUGFyYW1zKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgeG1sUGFyc2VkQWRQYXJhbXMgPSBwYXJzZUVuY29kZWRYTUwoZW5jb2RlZEFkUGFyYW1ldGVycyk7XG4gICAgICBjYihudWxsLCB4bWxQYXJzZWRBZFBhcmFtcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY2IoZSk7XG4gICAgfVxuICB9XG4gIHJldHVybjtcbn1cblxuZnVuY3Rpb24gcGFyc2VFbmNvZGVkWE1MKGVuY29kZWRBZFBhcmFtZXRlcnMpIHtcbiAgdmFyIGFkUGFyYW1zID0ge307XG5cbiAgbGV0IGJhc2U2NERlY29kZWRYbWw7XG4gIHRyeSB7XG4gICAgYmFzZTY0RGVjb2RlZFhtbCA9IHdpbmRvdy5hdG9iKGVuY29kZWRBZFBhcmFtZXRlcnMpOyAvLyBkZWNvZGUgdGhlIHN0cmluZ1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdYTUwgcGFyc2luZyBlcnJvcjogJyArIGUubWVzc2FnZSk7XG4gICAgLy8gY29uc29sZS5sb2coZW5jb2RlZEFkUGFyYW1ldGVycyk7XG4gIH1cblxuXG4gIC8vIFBhcnNpbmcgdGhlIGRlY29kZWQgeG1sXG4gIGxldCBhZFhNTDtcbiAgaWYgKGJhc2U2NERlY29kZWRYbWwgIT09IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgYWRYTUwgPSBwYXJzZVhtbChiYXNlNjREZWNvZGVkWG1sKTtcbiAgICAgIGlmIChhZFhNTC5nZXRFbGVtZW50c0J5VGFnTmFtZSgncGFyc2VyZXJyb3InKS5sZW5ndGggPiAwIHx8IGFkWE1MLnBhcnNlRXJyb3IgJiYgYWRYTUwucGFyc2VFcnJvci5lcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFkWE1MLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwYXJzZXJlcnJvcicpWzBdLm5vZGVWYWx1ZSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdYTUwgcGFyc2luZyBlcnJvcjogJyArIGUubWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIHJvb3ROb2RlID0gYWRYTUwuZG9jdW1lbnRFbGVtZW50Lm5vZGVOYW1lO1xuXG4gIGlmIChyb290Tm9kZSA9PT0gJ1lhaG9vVmlld2FiaWxpdHknKSB7XG4gICAgLy8gY2FsbGluZyBjYWxsKCkgb24gYSBudWxsIGFycmF5IGlzIGJhZFxuICAgIGNvbnN0IHZpZXdhYmxlSW1wcmVzc2lvbiA9IGFkWE1MLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdWaWV3YWJsZUltcHJlc3Npb24nKTtcbiAgICBmb3JFYWNoKHZpZXdhYmxlSW1wcmVzc2lvbiwgdmltcCA9PiB7XG4gICAgICBhZFBhcmFtcy52aWV3YWJpbGl0eUJlYWNvblVybCA9IHZpbXAudGV4dENvbnRlbnQ7XG4gICAgfSk7XG5cbiAgICAvLyBjYWxsaW5nIGNhbGwoKSBvbiBhIG51bGwgYXJyYXkgaXMgYmFkXG4gICAgYWRQYXJhbXMucGl4ZWxzID0gYWRQYXJhbXMucGl4ZWxzIHx8IFtdO1xuICAgIGNvbnN0IGltcHJlc3Npb25zID0gYWRYTUwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0ltcHJlc3Npb24nKTtcbiAgICBmb3JFYWNoKGltcHJlc3Npb25zLCBpbXAgPT4ge1xuICAgICAgYWRQYXJhbXMucGl4ZWxzLnB1c2goe1xuICAgICAgICBldmVudDogJ2ltcHJlc3Npb24nLFxuICAgICAgICB1cmw6IGltcC50ZXh0Q29udGVudFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhZFBhcmFtcy5zb3VyY2VzID0gYWRQYXJhbXMuc291cmNlcyB8fCBbXTtcbiAgICBjb25zdCBtZWRpYUZpbGVzID0gYWRYTUwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ01lZGlhRmlsZScpO1xuICAgIGZvckVhY2gobWVkaWFGaWxlcywgbWVkaWFGaWxlID0+IHtcbiAgICAgIGFkUGFyYW1zLnNvdXJjZXMucHVzaCh7XG4gICAgICAgIHVybDogbWVkaWFGaWxlLnRleHRDb250ZW50ICYmIG1lZGlhRmlsZS50ZXh0Q29udGVudC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyksXG4gICAgICAgIG1pbWV0eXBlOiBtZWRpYUZpbGUuZ2V0QXR0cmlidXRlKCd0eXBlJyksXG4gICAgICAgIGFwaUZyYW1ld29yazogbWVkaWFGaWxlLmdldEF0dHJpYnV0ZSgnYXBpRnJhbWV3b3JrJylcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uc3QgdmFzdEFkVGFnVVJJID0gYWRYTUwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1ZBU1RBZFRhZ1VSSScpO1xuICAgIGZvckVhY2godmFzdEFkVGFnVVJJLCB2YXN0VXJsID0+IHtcbiAgICAgIC8vIGNoZWNrIGZvciB2YXN0IHRhZ3MgaW4gdGhlIHBhcmFtXG4gICAgICBhZFBhcmFtcy5zb3VyY2VzLnB1c2goe1xuICAgICAgICB1cmw6IHZhc3RVcmwudGV4dENvbnRlbnQgJiYgdmFzdFVybC50ZXh0Q29udGVudC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyksXG4gICAgICAgIG1pbWV0eXBlOiAnYXBwbGljYXRpb24veG1sJ1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCB0cmFja2luZ0V2ZW50cyA9IGFkWE1MLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdUcmFja2luZycpO1xuICAgIGZvckVhY2godHJhY2tpbmdFdmVudHMsIGV2ZW50ID0+IHtcbiAgICAgIC8vIHRoZXNlIGFyZSBtYXBwZWQgdG8gVlBBSUQgaW4gcHJvY2Vzc0FkUGFyYW1zXG4gICAgICBhZFBhcmFtcy5waXhlbHMucHVzaCh7XG4gICAgICAgIGV2ZW50OiBldmVudC5nZXRBdHRyaWJ1dGUoJ2V2ZW50JyksXG4gICAgICAgIHVybDogZXZlbnQudGV4dENvbnRlbnRcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZXJyb3JFdmVudHMgPSBhZFhNTC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnRXJyb3InKTtcbiAgICBhZFBhcmFtcy5lcnJvciA9IGFkUGFyYW1zLmVycm9yIHx8IFtdO1xuICAgIGZvckVhY2goZXJyb3JFdmVudHMsIGV2ZW50ID0+IHtcbiAgICAgIGFkUGFyYW1zLmVycm9yLnB1c2goe1xuICAgICAgICBldmVudDogZXZlbnQuZ2V0QXR0cmlidXRlKCdldmVudCcpLFxuICAgICAgICB1cmw6IGV2ZW50LnRleHRDb250ZW50XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGFkUGFyYW1zLnZpZGVvQ2xpY2tzID0gYWRQYXJhbXMudmlkZW9DbGlja3MgfHwge307XG4gICAgYWRQYXJhbXMudmlkZW9DbGlja3MuY2xpY2tUcmFja2luZyA9IGFkUGFyYW1zLnZpZGVvQ2xpY2tzLmNsaWNrVHJhY2tpbmcgfHwgW107XG4gICAgY29uc3QgdmlkZW9DbGlja3MgPSBhZFhNTC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnQ2xpY2tUcmFja2luZycpO1xuICAgIGZvckVhY2godmlkZW9DbGlja3MsIGNsaWNrID0+IHtcbiAgICAgIGFkUGFyYW1zLnZpZGVvQ2xpY2tzLmNsaWNrVHJhY2tpbmcucHVzaChjbGljay50ZXh0Q29udGVudCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBjbGlja1Rocm91Z2ggPSBhZFhNTC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnQ2xpY2tUaHJvdWdoJylbMF07XG4gICAgaWYgKGNsaWNrVGhyb3VnaCkge1xuICAgICAgYWRQYXJhbXMudmlkZW9DbGlja3MuY2xpY2tUaHJvdWdoID0gY2xpY2tUaHJvdWdoLnRleHRDb250ZW50O1xuICAgIH1cblxuICAgIGFkUGFyYW1zLm1ldGFkYXRhID0gYWRQYXJhbXMubWV0YWRhdGEgfHwge307XG4gICAgY29uc3QgbW9hdFBhcmFtcyA9IGdldE1vYXRQYXJhbUZyb21BZFBhcmFtcyhhZFhNTCk7XG4gICAgaWYgKG1vYXRQYXJhbXMpIHtcbiAgICAgIGZvckVhY2gobW9hdFBhcmFtcywgbW9hdFBhcmFtID0+IHtcbiAgICAgICAgdmFyIHByb3BOYW1lID0gbW9hdFBhcmFtLm5vZGVOYW1lO1xuICAgICAgICB2YXIgcHJvcFZhbHVlID0gbW9hdFBhcmFtLnRleHRDb250ZW50O1xuICAgICAgICBpZiAocHJvcE5hbWUgJiYgcHJvcFZhbHVlKSB7XG4gICAgICAgICAgYWRQYXJhbXMubWV0YWRhdGFbcHJvcE5hbWVdID0gcHJvcFZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFkUGFyYW1zO1xufVxuXG5mdW5jdGlvbiBwYXJzZUpTT04oYWRQYXJhbWV0ZXJzKSB7XG4gIHZhciBhZFBhcmFtcyA9IHt9O1xuXG4gIHRyeSB7XG4gICAgdmFyIHBhcnNlZFBhcmFtcyA9IEpTT04ucGFyc2UoYWRQYXJhbWV0ZXJzKTtcbiAgICBpZiAocGFyc2VkUGFyYW1zKSB7XG4gICAgICBjb25zdCB2aWV3YWJsZUltcHJlc3Npb24gPSBwYXJzZWRQYXJhbXMudmlld2FibGVJbXByZXNzaW9uO1xuICAgICAgZm9yRWFjaEpzb24odmlld2FibGVJbXByZXNzaW9uLCB2aW1wID0+IHtcbiAgICAgICAgYWRQYXJhbXMudmlld2FiaWxpdHlCZWFjb25VcmwgPSB2aW1wO1xuICAgICAgfSk7XG5cblxuICAgICAgLy8gY2FsbGluZyBjYWxsKCkgb24gYSBudWxsIGFycmF5IGlzIGJhZFxuICAgICAgYWRQYXJhbXMucGl4ZWxzID0gYWRQYXJhbXMucGl4ZWxzIHx8IFtdO1xuICAgICAgY29uc3QgaW1wcmVzc2lvbnMgPSBwYXJzZWRQYXJhbXMuaW1wcmVzc2lvbjtcbiAgICAgIGFkUGFyYW1zLnBpeGVscyA9IGFkUGFyYW1zLnBpeGVscy5jb25jYXQoXG4gICAgICAgIGFycmF5ZnkoaW1wcmVzc2lvbnMpLm1hcChmdW5jdGlvbihpbXApIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXZlbnQ6ICdpbXByZXNzaW9uJyxcbiAgICAgICAgICAgIHVybDogaW1wXG4gICAgICAgICAgfTtcbiAgICAgICAgfSlcbiAgICAgICk7XG5cblxuICAgICAgYWRQYXJhbXMuc291cmNlcyA9IGFkUGFyYW1zLnNvdXJjZXMgfHwgW107XG4gICAgICBjb25zdCBtZWRpYUZpbGVzID0gcGFyc2VkUGFyYW1zLm1lZGlhRmlsZXM7XG4gICAgICBhZFBhcmFtcy5zb3VyY2VzID0gYWRQYXJhbXMuc291cmNlcy5jb25jYXQoXG4gICAgICAgIGFycmF5ZnkobWVkaWFGaWxlcykubWFwKGZ1bmN0aW9uKG1lZGlhRmlsZSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB1cmw6IG1lZGlhRmlsZS52YWx1ZSAmJiBtZWRpYUZpbGUudmFsdWUucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxuICAgICAgICAgICAgbWltZXR5cGU6IG1lZGlhRmlsZS50eXBlLFxuICAgICAgICAgICAgYXBpRnJhbWV3b3JrOiBtZWRpYUZpbGUuYXBpRnJhbWV3b3JrXG4gICAgICAgICAgfTtcbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IHZhc3RBZFRhZ1VSSSA9IHBhcnNlZFBhcmFtcy52YXN0QWRUYWdVUkk7XG4gICAgICBhZFBhcmFtcy5zb3VyY2VzID0gYWRQYXJhbXMuc291cmNlcy5jb25jYXQoXG4gICAgICAgIGFycmF5ZnkodmFzdEFkVGFnVVJJKS5tYXAoZnVuY3Rpb24odmFzdFVybCkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB1cmw6IHZhc3RVcmwgJiYgdmFzdFVybC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyksXG4gICAgICAgICAgICBtaW1ldHlwZTogJ2FwcGxpY2F0aW9uL3htbCdcbiAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgdHJhY2tpbmdFdmVudHMgPSBwYXJzZWRQYXJhbXMudHJhY2tpbmdFdmVudHM7XG4gICAgICBhZFBhcmFtcy5waXhlbHMgPSBhZFBhcmFtcy5waXhlbHMuY29uY2F0KFxuICAgICAgICBhcnJheWZ5KHRyYWNraW5nRXZlbnRzKS5tYXAoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LmV2ZW50VHlwZSxcbiAgICAgICAgICAgIHVybDogZXZlbnQudmFsdWVcbiAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgZXJyb3JFdmVudHMgPSBwYXJzZWRQYXJhbXMuZXJyb3I7XG4gICAgICBhZFBhcmFtcy5lcnJvciA9IGFkUGFyYW1zLmVycm9yIHx8IFtdO1xuICAgICAgYWRQYXJhbXMuZXJyb3IgPSBhZFBhcmFtcy5lcnJvci5jb25jYXQoXG4gICAgICAgIGFycmF5ZnkoZXJyb3JFdmVudHMpLm1hcChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBldmVudDogJ2Vycm9yJyxcbiAgICAgICAgICAgIHVybDogZXZlbnRcbiAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgYWRQYXJhbXMudmlkZW9DbGlja3MgPSBhZFBhcmFtcy52aWRlb0NsaWNrcyB8fCB7fTtcbiAgICAgIGFkUGFyYW1zLnZpZGVvQ2xpY2tzLmNsaWNrVHJhY2tpbmcgPSBhZFBhcmFtcy52aWRlb0NsaWNrcy5jbGlja1RyYWNraW5nIHx8IFtdO1xuXG4gICAgICBjb25zdCB2aWRlb0NsaWNrcyA9IHBhcnNlZFBhcmFtcy52aWRlb0NsaWNrcy5jbGlja1RyYWNraW5nO1xuICAgICAgYWRQYXJhbXMudmlkZW9DbGlja3MuY2xpY2tUcmFja2luZyA9IGFkUGFyYW1zLnZpZGVvQ2xpY2tzLmNsaWNrVHJhY2tpbmcuY29uY2F0KFxuICAgICAgICBhcnJheWZ5KHZpZGVvQ2xpY2tzKS5tYXAoZnVuY3Rpb24oY2xpY2spIHtcbiAgICAgICAgICByZXR1cm4gY2xpY2s7XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBjb25zdCBjbGlja1Rocm91Z2hzID0gcGFyc2VkUGFyYW1zLnZpZGVvQ2xpY2tzLmNsaWNrVGhyb3VnaDtcbiAgICAgIGZvckVhY2hKc29uKGNsaWNrVGhyb3VnaHMsIGNsaWNrVGhyb3VnaCA9PiB7XG4gICAgICAgIGFkUGFyYW1zLnZpZGVvQ2xpY2tzLmNsaWNrVGhyb3VnaCA9IGNsaWNrVGhyb3VnaDtcbiAgICAgIH0pO1xuXG4gICAgICBhZFBhcmFtcy5tZXRhZGF0YSA9IGFkUGFyYW1zLm1ldGFkYXRhIHx8IHt9O1xuICAgICAgY29uc3QgbW9hdFBhcmFtcyA9IHBhcnNlZFBhcmFtcy5tb2F0UGFyYW1zO1xuICAgICAgaWYgKG1vYXRQYXJhbXMpIHtcbiAgICAgICAgZm9yICh2YXIgcGFyYW1LZXkgaW4gbW9hdFBhcmFtcykge1xuICAgICAgICAgIHZhciBwcm9wTmFtZSA9IHBhcmFtS2V5O1xuICAgICAgICAgIHZhciBwcm9wVmFsdWUgPSBtb2F0UGFyYW1zW3BhcmFtS2V5XTtcbiAgICAgICAgICBpZiAocHJvcE5hbWUgJiYgcHJvcFZhbHVlKSB7XG4gICAgICAgICAgICBhZFBhcmFtcy5tZXRhZGF0YVtwcm9wTmFtZV0gPSBwcm9wVmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdKU09OIHBhcnNpbmcgZXJyb3I6ICcgKyBlLm1lc3NhZ2UpO1xuICB9XG5cbiAgcmV0dXJuIGFkUGFyYW1zO1xufVxuXG5mdW5jdGlvbiBnZXRNb2F0UGFyYW1Gcm9tQWRQYXJhbXMoYWRYTUwpIHtcbiAgdmFyIG1vYXRQYXJhbXMgPSBhZFhNTC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnTU9BVHBhcmFtcycpWzBdO1xuICBpZiAobW9hdFBhcmFtcykge1xuICAgIHJldHVybiBtb2F0UGFyYW1zLmNoaWxkTm9kZXM7XG4gIH1cbn1cbmZ1bmN0aW9uIGZvckVhY2goY29sbGVjdGlvbiwgZnVuYykge1xuICBjb2xsZWN0aW9uID0gY29sbGVjdGlvbiB8fCBbXTtcbiAgW10uZm9yRWFjaC5jYWxsKGNvbGxlY3Rpb24sIGZ1bmMpO1xufVxuXG5mdW5jdGlvbiBmb3JFYWNoSnNvbih2YWx1ZSwgZnVuYykge1xuICAvKiBDaGVjayBpZiB0aGUgdmFsdWUgaXMgbnVsbCwgZnVydGhlciBjaGVjayBpZiB0aGUgdmFsdWUgaXMgYW4gYXJyYXkgKi9cbiAgaWYgKHZhbHVlKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgdmFsdWUgPSBbdmFsdWVdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YWx1ZSA9IFtdO1xuICB9XG4gIHZhbHVlLmZvckVhY2goZnVuYyk7XG59XG5cbmZ1bmN0aW9uIGFycmF5ZnkodmFsdWUpIHtcbiAgLyogQ2hlY2sgaWYgdGhlIHZhbHVlIGlzIG51bGwsIGZ1cnRoZXIgY2hlY2sgaWYgdGhlIHZhbHVlIGlzIGFuIGFycmF5ICovXG4gIGlmICh2YWx1ZSkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHZhbHVlID0gW3ZhbHVlXTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFsdWUgPSBbXTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwcm9jZXNzQ2xpY2tUcmFja2luZyhhZFBhcmFtcywgY2IpIHtcbiAgYWRQYXJhbXMudmlkZW9DbGlja3MuY2xpY2tUcmFja2luZy5mb3JFYWNoKHVybCA9PiBhZFBhcmFtcy5waXhlbHMucHVzaCh7XG4gICAgZXZlbnQ6ICdBZENsaWNrVGhydScsXG4gICAgdXJsOiB1cmxcbiAgfSkpO1xuICBjYihudWxsLCBhZFBhcmFtcyk7XG59XG4iLCJpbXBvcnQgRGlhZyBmcm9tICcuLi9kaWFnJztcbmltcG9ydCAqIGFzIE1hY3JvcyBmcm9tICcuLi9tYWNyb3MnO1xuXG5jb25zdCBNQVhfUkVDVVJTSVZFX0RFUFRIID0gNTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VWYXN0KHBhcnNlZEFkUGFyYW1zLCBjYikge1xuICBjb25zdCB2YXN0VXJpID0gcG9wVmFzdFVybChwYXJzZWRBZFBhcmFtcyk7XG4gIHBhcnNlZEFkUGFyYW1zLmRlYnVnRGF0YSA9IHt2YXN0VXJpOiB2YXN0VXJpfTtcbiAgcGFyc2VkQWRQYXJhbXMudmFzdFhtbHMgPSBbXTtcbiAgLy8gcmVjdXJzaXZlbHkgcGFyc2UgdW50aWwgd2UgZmluZCBhIG1lZGlhZmlsZSBvciBoaXQgZGVwdGhcbiAgaWYgKHZhc3RVcmkpIHtcbiAgICBmZXRjaEFuZFBhcnNlVmFzdFVybCh2YXN0VXJpLCBwYXJzZWRBZFBhcmFtcywgY2IsIDApO1xuICB9IGVsc2Uge1xuICAgIGNiKG51bGwsIHBhcnNlZEFkUGFyYW1zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmZXRjaEFuZFBhcnNlVmFzdFVybCh1cmwsIGFkUGFyYW1zLCBjYiwgZGVwdGgpIHtcbiAgY29uc3QgZGlhZyA9IG5ldyBEaWFnKGFkUGFyYW1zKTtcbiAgaWYgKGRlcHRoID49IE1BWF9SRUNVUlNJVkVfREVQVEgpIHtcbiAgICBjb25zb2xlLmxvZygncmVjdXJzaXZlIGRlcHRoIHJlYWNoZWQnKTtcbiAgICBkaWFnLmZpcmUoJ1ZBU1RfTUFYX0RFUFRIJywgKCkgPT4ge1xuICAgICAgY2IobmV3IEVycm9yKCdtYXggVkFTVCB1bndyYXBwaW5nIGRlcHRoIHJlYWNoZWQnKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgcmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICAvLyA0ID09PSBET05FXG4gICAgaWYgKDQgIT09IHJlcS5yZWFkeVN0YXRlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKDIwMCAhPT0gcmVxLnN0YXR1cykge1xuICAgICAgZGlhZy5maXJlKCdWQVNUX05PVF9GT1VORCcsICgpID0+IHtcbiAgICAgICAgY2IobmV3IEVycm9yKCdwYXJzZVZhc3QgZXJyb3I6IHJlc3BvbnNlIHN0YXR1czogJytyZXEuc3RhdHVzKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXJlcS5yZXNwb25zZVhNTCkgeyAvLyBkdW5ubyBpZiB0aGlzIGlzIHBvc3NpYmxlXG4gICAgICBkaWFnLmZpcmUoJ1ZBU1RfUEFSU0VSX0VSUk9SJywgKCkgPT4ge1xuICAgICAgICBjYihuZXcgRXJyb3IoJ3BhcnNlVmFzdCBlcnJvcjogbWlzc2luZyByZXNwb25zZVhNTCcpKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIHVwb24gaGl0dGluZyBhIEluTGluZSBhZFxuICAgIGFkUGFyYW1zLnZhc3RYbWxzLnB1c2gocmVxLnJlc3BvbnNlWE1MKTtcblxuICAgIHN3aXRjaCAoZ2V0QWRUeXBlKHJlcS5yZXNwb25zZVhNTCkpIHtcbiAgICAgIGNhc2UgJ1dyYXBwZXInOlxuICAgICAgICAvLyByZWN1cnNlXG4gICAgICAgIGNvbnN0IHZhc3RBZFRhZ1VSSSA9IGdldFZhc3RBZFRhZ1VyaShyZXEucmVzcG9uc2VYTUwpO1xuICAgICAgICBpZiAodmFzdEFkVGFnVVJJKSB7XG4gICAgICAgICAgZmV0Y2hBbmRQYXJzZVZhc3RVcmwodmFzdEFkVGFnVVJJLCBhZFBhcmFtcywgY2IsIGRlcHRoICsgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlhZy5maXJlKCdWQVNUX1dSQVBQRVJfVVJJX01JU1NJTkcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjYihuZXcgRXJyb3IoJ1ZBU1RBZFRhZyBVUkkgbm90IGZvdW5kJykpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdJbkxpbmUnOlxuICAgICAgICAvLyBmb3VuZCBhIHNvdXJjZSwgdXBkYXRlIGFkUGFyYW1zLCBjYWxsIGNhbGxiYWNrXG4gICAgICAgIGxldCBwb3N0UHJvY2VzcztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwb3N0UHJvY2VzcyA9IHByb2Nlc3NBZFBhcmFtcyhhZFBhcmFtcyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjYihuZXcgRXJyb3IoJ2FkZEFkUGFyYW1zIGVycm9yOiAnICsgZS5tZXNzYWdlKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNiKG51bGwsIHBvc3RQcm9jZXNzKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGRpYWcuZmlyZSgnVkFTVF9NSVNTSU5HX0FEX1RZUEUnLCAoKSA9PiB7XG4gICAgICAgICAgY2IobmV3IEVycm9yKCd2YXN0IGVycm9yOiBubyBhZCB0eXBlIGZvdW5kJykpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9O1xuICAvLyBkb24ndCBuZWVkIHRvIHBhc3MgaXQgQWRQYXJhbXMgYXQgdGhpcyBzdGVwLCBwYWdlVXJsIG5vbi1kZXBlbmRlbnRcbiAgdXJsID0gTWFjcm9zLmV4cGFuZCh1cmwsIG51bGwsIFtNYWNyb3MucGFnZVVybF0pO1xuICByZXEub3BlbignR0VUJywgdXJsKTtcbiAgcmVxLnNlbmQoKTtcbn1cblxuZnVuY3Rpb24gZ2V0VmFzdEFkVGFnVXJpKHhtbCkge1xuICBjb25zdCB0YWcgPSB4bWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1ZBU1RBZFRhZ1VSSScpWzBdO1xuICBpZiAodGFnKSB7XG4gICAgcmV0dXJuIHRhZy50ZXh0Q29udGVudDtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0QWRUeXBlKHhtbCkge1xuICBjb25zdCBhZFhtbCA9IHhtbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnQWQnKVswXTtcbiAgaWYgKGFkWG1sKSB7XG4gICAgLy8gSW5MaW5lIG9yIFdyYXBwZXJcbiAgICByZXR1cm4gYWRYbWwuZmlyc3RFbGVtZW50Q2hpbGQudGFnTmFtZTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jKSB7XG4gIGNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uIHx8IFtdO1xuICBbXS5mb3JFYWNoLmNhbGwoY29sbGVjdGlvbiwgZnVuYyk7XG59XG5cbi8vIHN0b3JlcyB0aGUgcmVsZXZhbnQgZmllbGRzIGZyb20gWE1MIHRvIG91ciBhZFBhcmFtc1xuZnVuY3Rpb24gcGFyc2VWYXN0WG1sKGFkUGFyYW1zLCByZXNwb25zZVhNTCkge1xuICBjb25zdCBkaWFnID0gbmV3IERpYWcoYWRQYXJhbXMpO1xuICAvLyBpcyB0aGlzIHNhbml0eSBjaGVjayBuZWVkZWQ/XG4gIGNvbnN0IGFkWE1MID0gcmVzcG9uc2VYTUwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0FkJylbMF07XG4gIGlmICghYWRYTUwgfHwgYWRYTUwuY2hpbGRFbGVtZW50Q291bnQgIT09IDEgfHwgYWRYTUwgPT09ICdudWxsJykge1xuICAgIGRpYWcuZmlyZSgnVkFTVF9NQUxGT1JNRUQnKTtcbiAgICB0aHJvdyBFcnJvcigncGFyc2VWYXN0WG1sIGVycm9yOiBpbnZhbGlkIFZBU1QgZm9ybWF0Jyk7XG4gIH1cblxuICAvLyBjYWxsaW5nIGNhbGwoKSBvbiBhIG51bGwgYXJyYXkgaXMgYmFkXG4gIGNvbnN0IGltcHJlc3Npb25zID0gYWRYTUwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0ltcHJlc3Npb24nKTtcbiAgZm9yRWFjaChpbXByZXNzaW9ucywgaW1wID0+IHtcbiAgICBhZFBhcmFtcy5waXhlbHMucHVzaCh7XG4gICAgICBldmVudDogJ2ltcHJlc3Npb24nLFxuICAgICAgdXJsOiBpbXAudGV4dENvbnRlbnRcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3QgbWVkaWFGaWxlcyA9IGFkWE1MLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdNZWRpYUZpbGUnKTtcbiAgZm9yRWFjaChtZWRpYUZpbGVzLCBtZWRpYUZpbGUgPT4ge1xuICAgIGFkUGFyYW1zLnNvdXJjZXMucHVzaCh7XG4gICAgICB1cmw6IG1lZGlhRmlsZS50ZXh0Q29udGVudCAmJiBtZWRpYUZpbGUudGV4dENvbnRlbnQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxuICAgICAgbWltZXR5cGU6IG1lZGlhRmlsZS5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSxcbiAgICAgIGFwaUZyYW1ld29yazogbWVkaWFGaWxlLmdldEF0dHJpYnV0ZSgnYXBpRnJhbWV3b3JrJylcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3QgdHJhY2tpbmdFdmVudHMgPSBhZFhNTC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnVHJhY2tpbmcnKTtcbiAgZm9yRWFjaCh0cmFja2luZ0V2ZW50cywgZXZlbnQgPT4ge1xuICAgIC8vIHRoZXNlIGFyZSBtYXBwZWQgdG8gVlBBSUQgaW4gcHJvY2Vzc0FkUGFyYW1zXG4gICAgYWRQYXJhbXMucGl4ZWxzLnB1c2goe1xuICAgICAgZXZlbnQ6IGV2ZW50LmdldEF0dHJpYnV0ZSgnZXZlbnQnKSxcbiAgICAgIHVybDogZXZlbnQudGV4dENvbnRlbnRcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3QgdmlkZW9DbGlja3MgPSBhZFhNTC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnQ2xpY2tUcmFja2luZycpO1xuICBmb3JFYWNoKHZpZGVvQ2xpY2tzLCBjbGljayA9PiB7XG4gICAgYWRQYXJhbXMudmlkZW9DbGlja3MuY2xpY2tUcmFja2luZy5wdXNoKGNsaWNrLnRleHRDb250ZW50KTtcbiAgfSk7XG5cbiAgY29uc3QgY2xpY2tUaHJvdWdoID0gYWRYTUwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0NsaWNrVGhyb3VnaCcpWzBdO1xuICBpZiAoY2xpY2tUaHJvdWdoKSB7XG4gICAgYWRQYXJhbXMudmlkZW9DbGlja3MuY2xpY2tUaHJvdWdoID0gY2xpY2tUaHJvdWdoLnRleHRDb250ZW50O1xuICB9XG5cbiAgY29uc3QgdGhpcmRQYXJ0eUFkUGFyYW1zID0gYWRYTUwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0FkUGFyYW1ldGVycycpWzBdO1xuICBpZiAodGhpcmRQYXJ0eUFkUGFyYW1zKSB7XG4gICAgYWRQYXJhbXMudGhpcmRQYXJ0eUFkUGFyYW1zID0gdGhpcmRQYXJ0eUFkUGFyYW1zLnRleHRDb250ZW50O1xuICB9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NBZFBhcmFtcyhhZFBhcmFtcykge1xuICAvLyBwYXJzZSBmaWVsZHMgb3V0IG9mIGVhY2ggWE1MIGVuY291bnRlcmVkXG4gIGFkUGFyYW1zLnZhc3RYbWxzLmZvckVhY2goaXRlbSA9PiBwYXJzZVZhc3RYbWwoYWRQYXJhbXMsIGl0ZW0pKTtcbiAgcmV0dXJuIGFkUGFyYW1zO1xufVxuXG4vLyBwb3BzIHNvIGl0IHdvbid0IGJlIGEgdmlkZW8gc291cmNlXG5mdW5jdGlvbiBwb3BWYXN0VXJsKGFkUGFyYW1zKSB7XG4gIGNvbnN0IHNvdXJjZXMgPSBhZFBhcmFtcy5zb3VyY2VzO1xuICBsZXQgdmFzdFVSTCA9IG51bGw7XG4gIGlmIChzb3VyY2VzKSB7XG4gICAgYWRQYXJhbXMuc291cmNlcyA9IHNvdXJjZXMuZmlsdGVyKHNvdXJjZSA9PiB7XG4gICAgICBpZiAoJ2FwcGxpY2F0aW9uL3htbCcgPT09IHNvdXJjZS5taW1ldHlwZSkge1xuICAgICAgICB2YXN0VVJMID0gc291cmNlLnVybDtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdmFzdFVSTDtcbn1cbiIsImxldCBlbnZDb25maWc7XG4vKmVzbGludC1kaXNhYmxlKi9cbmlmIChwcm9jZXNzLmVudi5WSVNUQV9FTlYgPT09ICdwcm9kJykge1xuLyplc2xpbnQtZW5hYmxlKi9cbiAgZW52Q29uZmlnID0gcmVxdWlyZSgnLi4vY29uZi9wcm9kJyk7XG59IGVsc2Uge1xuICBlbnZDb25maWcgPSByZXF1aXJlKCcuLi9jb25mL2RldicpO1xufVxuXG5sZXQgYmFzZUNvbmZpZyA9IHtcbiAgYWRQbGF5YmFja1RpbWVvdXQ6IDEwMDAgKiA2MCAqIDEwLCAvLyAxMCBtaW51dGVzXG4gIHZwYWlkQ3JlYXRpdmVNZXRob2RUaW1lb3V0OiAyMDAwMCwgLy8gMjAgc2Vjb25kc1xuICBzY291dFdhdGNoU2hvdWxkRmlyZToge1xuICAgIEFkSW1wcmVzc2lvbjogdHJ1ZSxcbiAgICBBZFZpZGVvU3RhcnQ6IHRydWUsXG4gICAgQWRWaWRlb0ZpcnN0UXVhcnRpbGU6IHRydWUsXG4gICAgQWRWaWRlb01pZHBvaW50OiB0cnVlLFxuICAgIEFkVmlkZW9UaGlyZFF1YXJ0aWxlOiB0cnVlLFxuICAgIEFkVmlkZW9Db21wbGV0ZTogdHJ1ZSxcbiAgICBBZFN0b3BwZWQ6IHRydWUsXG4gICAgQWRFcnJvcjogdHJ1ZSxcbiAgICBBZENsaWNrVGhydTogdHJ1ZSxcbiAgICBBZFNpemVDaGFuZ2U6IHRydWUsXG4gICAgQWREdXJhdGlvbkNoYW5nZTogdHJ1ZVxuICB9XG59O1xuXG5mb3IgKGxldCBrIGluIGVudkNvbmZpZykge1xuICBiYXNlQ29uZmlnW2tdID0gZW52Q29uZmlnW2tdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlQ29uZmlnO1xuIiwiaW1wb3J0IGZpcmUgZnJvbSAnLi91dGlsL2ZpcmUnO1xudmFyIHBhcnNlciA9IHJlcXVpcmUoJ3VhLXBhcnNlci1qcycpO1xuXG5cbmNvbnN0IGRpYWdDb2RlcyA9IHtcbiAgJ1ZBU1RfTk9UX0ZPVU5EJzogMjAwMDEsXG4gICdWQVNUX1BBUlNFUl9FUlJPUic6IDIwMDAyLFxuICAnVkFTVF9XUkFQUEVSX1VSSV9NSVNTSU5HJzogMjAwMDMsXG4gICdWQVNUX01BTEZPUk1FRCc6IDIwMDA0LFxuICAnVkFTVF9OT19BRCc6IDIwMDA1LFxuICAnVkFTVF9NQVhfREVQVEgnOiAyMDAwNixcbiAgJ1ZBU1RfTUlTU0lOR19BRF9UWVBFJzogMjAwMDcsXG5cbiAgLy8gVlBBSUQgZXJyb3IgY2FzZXNcbiAgJ1ZQQUlEX0hBTkRTSEFLRV9GQUlMJzogMjAwMTAsXG4gICdWUEFJRF9MT0FEX0VSUk9SJzogMjAwMTEsXG4gICdWUEFJRF9MT0FEX1RJTUVPVVQnOiAyMDAxMixcbiAgJ1ZQQUlEX1ZJVEFMX01FVEhPRF9USU1FT1VUJzogMjAwMTMsXG4gICdWUEFJRF9QUk9UT0NPTF9OT1RfU1VQUE9SVEVEJzogMjAwMTQsXG4gICdWUEFJRF9JTlRFUk5BTF9FUlJPUic6IDIwMDE1LFxuICAnTk9fVklERU9fU0xPVCc6IDIwMjAxLFxuICAnVlBBSURfTk9OVklUQUxfTUVUSE9EX1RJTUVPVVQnOiAyMDIwMixcbiAgJ1ZQQUlEX1NUQVRFX0lOQ09OU0lTVEVOQ1knOiAyMDIwMyxcbiAgJ0FEX0RVUkFUSU9OX05PVF9TVVBQT1JURUQnOiAyMDIwNCxcbiAgJ1ZJREVPX1NMT1RfRVJST1InOiAyMDIwNSxcbiAgJ1NVQlNDUklCRVJfRVJST1InOiAyMDIwNixcbiAgJ1ZJU1RBX1VOQ0FVR0hUX0VSUk9SJzogMjAyMDcsXG4gICdOT19DT01QQVRJQkxFX1ZJREVPJzogMjAyMDgsXG4gICdQVUJMSVNIRVJfVU5DQVVHSFRfRVJST1InIDogMjAyMDksXG4gIC8vIExPQURFRCBhbmQgSU1QIGFyZSB1c2VkIGluIGNyZWF0aXZlIHRocm90dGxpbmdcbiAgJ1ZJU1RBX0xPQURFRCc6IDYwMDAwLFxuICAnVklTVEFfSU1QJzogNjAwMDFcbn07XG5cbmNvbnN0IGV2ZW50TmFtZU1hcCA9IHtcbiAgQWRJbXByZXNzaW9uOiAnVklTVEFfSU1QJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlhZyB7XG4gIGNvbnN0cnVjdG9yKGFkUGFyYW1zKSB7XG4gICAgdGhpcy5hZFBhcmFtcyA9IGFkUGFyYW1zO1xuICB9XG5cbiAgX2dldFVybEZvck5hbWUobmFtZSwgZGV0YWlscykge1xuICAgIHZhciBjb2RlID0gJ0pTLScgKyBkaWFnQ29kZXNbbmFtZV07XG4gICAgaWYgKHRoaXMuYWRQYXJhbXMuYnJvd3NlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgdXNlckFnZW50ID0gdGhpcy5fZ2V0VXNlckFnZW50KCk7XG4gICAgICAgIHRoaXMuYWRQYXJhbXMuYnJvd3NlciA9IHRoaXMuX2dldEJyb3dzZXJGcm9tVXNlckFnZW50KHVzZXJBZ2VudCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGVtcHR5XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBiYXNlVXJsID0gdGhpcy5hZFBhcmFtcy5lcnJvclswXS51cmwgfHwgJyc7XG4gICAgaWYgKHRoaXMuYWRQYXJhbXMgJiYgdGhpcy5hZFBhcmFtcy5icm93c2VyKSB7XG4gICAgICBjb2RlID0gY29kZSArICcsJyArICdyYjonICsgdGhpcy5hZFBhcmFtcy5icm93c2VyO1xuICAgIH1cbiAgICBpZiAodGhpcy5hZFBhcmFtcyAmJiB0aGlzLmFkUGFyYW1zLnNlbGVjdGVkRmlsZVR5cGUpIHtcbiAgICAgIGNvZGUgPSBjb2RlICsgJywnICsgJ3JtOicgKyB0aGlzLmFkUGFyYW1zLnNlbGVjdGVkRmlsZVR5cGU7XG4gICAgfVxuICAgIHJldHVybiBiYXNlVXJsLnJlcGxhY2UoLygjI3xcXFspRVJST1JDT0RFKCMjfFxcXSkvZ2ksIGNvZGUpO1xuICB9XG5cbiAgZ2V0VXJsQnlFdmVudChldmVudCkge1xuICAgIGNvbnN0IG5hbWUgPSBldmVudE5hbWVNYXBbZXZlbnRdO1xuICAgIHJldHVybiBuYW1lICYmIHRoaXMuX2dldFVybEZvck5hbWUobmFtZSk7XG4gIH1cblxuICBmaXJlKG5hbWUsIGNiLCBkZXRhaWxzKSB7XG4gICAgZmlyZSh0aGlzLl9nZXRVcmxGb3JOYW1lKG5hbWUsIGRldGFpbHMpLCBjYik7XG4gIH1cblxuICBfZ2V0VXNlckFnZW50KCkge1xuICAgIHJldHVybiBuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgfVxuXG4gIF9nZXRCcm93c2VyRnJvbVVzZXJBZ2VudCh1c2VyQWdlbnQpIHtcbiAgICB2YXIgYWdlbnQgPSBwYXJzZXIodXNlckFnZW50KTtcbiAgICByZXR1cm4gYWdlbnQgJiYgYWdlbnQuYnJvd3NlciAmJiAoYWdlbnQuYnJvd3Nlci5uYW1lICsgYWdlbnQuYnJvd3Nlci5tYWpvcik7XG4gIH1cbn1cbiIsImltcG9ydCBmaXJlIGZyb20gJy4uL3V0aWwvZmlyZSc7XG5pbXBvcnQgYXN5bmMgZnJvbSAnYXN5bmMnO1xuaW1wb3J0IGdldFBpeGVsUHJvdmlkZXJzIGZyb20gJy4vcHJvdmlkZXJzL2luZGV4LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRIYW5kbGVyIHtcbiAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgdGhpcy5waXhlbFByb3ZpZGVycyA9IGdldFBpeGVsUHJvdmlkZXJzKHBhcmFtcyk7XG4gICAgdGhpcy5kaWFnID0gbnVsbDtcblxuICAgIC8vIG1hcHMgZnJvbSBldmVudHMgdG8gYXJyYXlzIG9mIHN1YnNjcmliZXJzXG4gICAgdGhpcy5pbnRlcm5hbFN1YnNjcmliZXJzID0ge307XG4gICAgdGhpcy5leHRlcm5hbFN1YnNjcmliZXJzID0ge307XG4gIH1cblxuICBpbml0KHBhcmFtcykge1xuICAgIGZvciAobGV0IGtleSBpbiB0aGlzLnBpeGVsUHJvdmlkZXJzKSB7XG4gICAgICB0aGlzLnBpeGVsUHJvdmlkZXJzW2tleV0uaW5pdChwYXJhbXMpO1xuICAgIH1cbiAgICB0aGlzLmRpYWcgPSBwYXJhbXMuZGlhZztcbiAgfVxuXG4gIGFkZEV4dGVybmFsU3Vic2NyaWJlcihjYiwgZXZlbnQsIGNvbnRleHQpIHtcbiAgICBjb25zdCBldmVudFN1YnNjcmliZXJzID0gdGhpcy5leHRlcm5hbFN1YnNjcmliZXJzW2V2ZW50XSB8fCBbXTtcbiAgICBldmVudFN1YnNjcmliZXJzLnB1c2goe1xuICAgICAgY2FsbGJhY2s6IGNiLFxuICAgICAgY29udGV4dDogY29udGV4dFxuICAgIH0pO1xuICAgIHRoaXMuZXh0ZXJuYWxTdWJzY3JpYmVyc1tldmVudF0gPSBldmVudFN1YnNjcmliZXJzO1xuICB9XG5cbiAgYWRkSW50ZXJuYWxTdWJzY3JpYmVyKGNiLCBldmVudCwgY29udGV4dCkge1xuICAgIGNvbnN0IGV2ZW50U3Vic2NyaWJlcnMgPSB0aGlzLmludGVybmFsU3Vic2NyaWJlcnNbZXZlbnRdIHx8IFtdO1xuICAgIGV2ZW50U3Vic2NyaWJlcnMucHVzaCh7XG4gICAgICBjYWxsYmFjazogY2IsXG4gICAgICBjb250ZXh0OiBjb250ZXh0XG4gICAgfSk7XG4gICAgdGhpcy5pbnRlcm5hbFN1YnNjcmliZXJzW2V2ZW50XSA9IGV2ZW50U3Vic2NyaWJlcnM7XG4gIH1cblxuICByZW1vdmVTdWJzY3JpYmVyKGNiLCBldmVudCkge1xuICAgIHJlbW92ZUNhbGxiYWNrKHRoaXMuaW50ZXJuYWxTdWJzY3JpYmVycywgY2IsIGV2ZW50KTtcbiAgICByZW1vdmVDYWxsYmFjayh0aGlzLmV4dGVybmFsU3Vic2NyaWJlcnMsIGNiLCBldmVudCk7XG4gIH1cblxuICBmaXJlKGV2ZW50LCBwYXJhbXMsIHBsYXliYWNrSW5mbywgY2FsbGJhY2spIHtcbiAgICBjb25zdCB1cmlzID0gT2JqZWN0LmtleXModGhpcy5waXhlbFByb3ZpZGVycylcbiAgICAgIC5yZWR1Y2UoKHVyaXMsIHByb3ZpZGVyKSA9PiB1cmlzLmNvbmNhdCh0aGlzLnBpeGVsUHJvdmlkZXJzW3Byb3ZpZGVyXS5nZXRVcmlzKGV2ZW50LCBwbGF5YmFja0luZm8pKSwgW10pO1xuXG4gICAgYXN5bmMuZWFjaCh1cmlzLCAodXJpLCBkb25lKSA9PiB7XG4gICAgICBmaXJlKHVyaSwgZG9uZSk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZmlyZUV2ZW50KHRoaXMuaW50ZXJuYWxTdWJzY3JpYmVycywgZXZlbnQsIHBhcmFtcyk7XG4gICAgICAgIGZpcmVFdmVudCh0aGlzLmV4dGVybmFsU3Vic2NyaWJlcnMsIGV2ZW50LCBwYXJhbXMpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZXZlbnQgIT09ICdBZEVycm9yJykge1xuICAgICAgICAgIHZhciBkZXRhaWxzO1xuICAgICAgICAgIHZhciBzdGFjaztcbiAgICAgICAgICBpZiAoZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgZGV0YWlscyA9IGUubWVzc2FnZTtcbiAgICAgICAgICAgIHN0YWNrID0gZS5zdGFjay50b1N0cmluZygpLnNwbGl0KC9cXHJcXG58XFxuLyk7XG4gICAgICAgICAgICBpZiAoISFzdGFjayAmJiBzdGFjay5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgIGRldGFpbHMgKz0gJyAnICsgd2luZG93LmJ0b2EoJ3N0YWNrMTogJyArIHN0YWNrWzFdICsgJ3N0YWNrbjogJyAgKyBzdGFja1tzdGFjay5sZW5ndGggLSAxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZGlhZyAmJiB0aGlzLmRpYWcuZmlyZSgnU1VCU0NSSUJFUl9FUlJPUicsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmlyZShcbiAgICAgICAgICAgICAgJ0FkRXJyb3InLFxuICAgICAgICAgICAgICBbYEVycm9yIG9jY3VycmVkIHdoZW4gZmlyaW5nICR7ZXZlbnR9IGV2ZW50IGhhbmRsZXJzOiAke2UubWVzc2FnZX1gXSxcbiAgICAgICAgICAgICAgcGxheWJhY2tJbmZvXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0sIGV2ZW50ICsgJyBldmVudCBoYW5kbGVyczogJyArIGRldGFpbHMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRQcm92aWRlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMucGl4ZWxQcm92aWRlcnM7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlQ2FsbGJhY2soc3Vic2NyaWJlcnNNYXAsIGNiLCBldmVudCkge1xuICBjb25zdCBzdWJzY3JpYmVycyA9IHN1YnNjcmliZXJzTWFwW2V2ZW50XTtcbiAgaWYgKHN1YnNjcmliZXJzKSB7XG4gICAgc3Vic2NyaWJlcnNNYXBbZXZlbnRdID0gc3Vic2NyaWJlcnMuZmlsdGVyKHMgPT4gcy5jYWxsYmFjayAhPT0gY2IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpcmVFdmVudChzdWJzY3JpYmVyc01hcCwgZXZlbnQsIHBhcmFtcykge1xuICBjb25zdCBzdWJzY3JpYmVycyA9IHN1YnNjcmliZXJzTWFwW2V2ZW50XTtcbiAgaWYgKHBhcmFtcykge1xuICAgIGlmICghQXJyYXkgfHwgIUFycmF5LmlzQXJyYXkgfHwgIUFycmF5LmlzQXJyYXkocGFyYW1zKSkge1xuICAgICAgcGFyYW1zID0gW3BhcmFtc107XG4gICAgfVxuICB9XG4gIHN1YnNjcmliZXJzICYmIHN1YnNjcmliZXJzLmZvckVhY2gocyA9PiBzLmNhbGxiYWNrLmFwcGx5KHMuY29udGV4dCB8fCBudWxsLCBwYXJhbXMpKTtcbn1cbiIsIi8vIFRoaXMgY29udGFpbnMgYWxsIHRoZSBpbXByZXNzaW9uIGFuZCBldmVudCBwaXhlbHMgZW5jb3VudGVyZWQgZHVyaW5nIHBhcnNpbmcuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZFBhcmFtc1Byb3ZpZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gbWFwIG9mIGV2ZW50cyB0byBhcnJheXMgb2YgcGl4ZWxzXG4gICAgdGhpcy5ldmVudFBpeGVsTWFwID0ge307XG4gICAgdGhpcy5hZFBhcmFtcyA9IG51bGw7XG4gIH1cblxuICBpbml0KHBhcmFtcykge1xuICAgIHRoaXMuYWRQYXJhbXMgPSBwYXJhbXMuYWRQYXJhbXM7XG4gICAgdGhpcy5hZFBhcmFtcy5waXhlbHMuZm9yRWFjaChwaXhlbCA9PiB7XG4gICAgICBjb25zdCBldmVudE5hbWUgPSBwaXhlbC5ldmVudDtcbiAgICAgIGNvbnN0IHVybCA9IHBpeGVsLnVybDtcblxuICAgICAgLy8gcHJvZ3Jlc3MgZXZlbnRzIGFyZSBkZWFsdCB3aXRoIGVsc2V3aGVyZVxuICAgICAgaWYgKGV2ZW50TmFtZSAmJiB1cmwgJiYgZXZlbnROYW1lICE9PSAncHJvZ3Jlc3MnKSB7XG4gICAgICAgIHRoaXMuZXZlbnRQaXhlbE1hcFtldmVudE5hbWVdID0gdGhpcy5ldmVudFBpeGVsTWFwW2V2ZW50TmFtZV0gfHwgW107XG4gICAgICAgIHRoaXMuZXZlbnRQaXhlbE1hcFtldmVudE5hbWVdLnB1c2godXJsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldFVyaXMoZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5ldmVudFBpeGVsTWFwW2V2ZW50XSB8fCBbXTtcbiAgfVxufVxuIiwiaW1wb3J0IERpYWcgZnJvbSAnLi4vLi4vZGlhZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpYWdQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZGlhZyA9IG51bGw7XG4gIH1cblxuICBpbml0KHBhcmFtcykge1xuICAgIHRoaXMuZGlhZyA9IG5ldyBEaWFnKHBhcmFtcy5hZFBhcmFtcyk7XG4gIH1cblxuICBnZXRVcmlzKGV2ZW50LCBwbGF5YmFja0luZm8pIHtcbiAgICBpZiAodGhpcy5kaWFnKSB7IC8vIEZvciBlcnJvcnMgYmVmb3JlIHdlIHBhcnNlIGFkcGFyYW1zLCB3ZSB3b24ndCBpbml0LlxuICAgICAgY29uc3QgdXJsID0gdGhpcy5kaWFnLmdldFVybEJ5RXZlbnQoZXZlbnQpO1xuICAgICAgcmV0dXJuIHVybCA/IFt1cmxdIDogW107XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxufVxuIiwiaW1wb3J0IEFkUGFyYW1zUHJvdmlkZXIgZnJvbSAnLi9hZF9wYXJhbXMnO1xuaW1wb3J0IERpYWdQcm92aWRlciBmcm9tICcuL2RpYWcnO1xuaW1wb3J0IE1vYXRQcm92aWRlciBmcm9tICcuL21vYXQnO1xuaW1wb3J0IFBpcEJveVByb3ZpZGVyIGZyb20gJy4vcGlwX2JveSc7XG5pbXBvcnQgSW5zaWRlVmlkZW9Qcm92aWRlciBmcm9tICcuL2luc2lkZS12aWRlbyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFBpeGVsUHJvdmlkZXJzKHBhcmFtcykge1xuICByZXR1cm4ge1xuICAgIEFkUGFyYW1zUHJvdmlkZXIgOiBuZXcgQWRQYXJhbXNQcm92aWRlcihwYXJhbXMpLFxuICAgIFBpcEJveVByb3ZpZGVyIDogbmV3IFBpcEJveVByb3ZpZGVyKHBhcmFtcyksXG4gICAgTW9hdFByb3ZpZGVyIDogbmV3IE1vYXRQcm92aWRlcihwYXJhbXMpLFxuICAgIERpYWdQcm92aWRlciA6IG5ldyBEaWFnUHJvdmlkZXIocGFyYW1zKSxcbiAgICBJbnNpZGVWaWRlb1Byb3ZpZGVyIDogbmV3IEluc2lkZVZpZGVvUHJvdmlkZXIocGFyYW1zKVxuICB9O1xufVxuIiwiLyplc2xpbnQtZGlzYWJsZSovXG5cbmltcG9ydCBpbml0SW5zaWRlVHJhY2tpbmcgZnJvbSAnLi4vLi4vLi4vbGliL2luc2lkZS12aWRlbyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5zaWRlVmlkZW8ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmFkUGFyYW1zID0gbnVsbDtcbiAgfVxuXG4gIC8vYWRFbGVtZW50LGFkV2lkdGgsYWRXSGVpZ2h0LGFkVW5pdCx2aWV3YWJpbGl0eUJlYWNvblVybFxuICBpbml0KHBhcmFtcykge1xuICAgIHRoaXMuYWRQYXJhbXMgPSBwYXJhbXMuYWRQYXJhbXM7XG4gICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmFkUGFyYW1zLm1ldGFkYXRhO1xuICAgIGlmKHRoaXMuYWRQYXJhbXMpIHtcblxuICAgICAgICBpZiAocGFyYW1zLnZwYWlkSlNXcmFwcGVyICYmIHBhcmFtcy52cGFpZEpTV3JhcHBlci52aWRlb1Nsb3QpIHtcbiAgICAgICAgICBwYXJhbXMuYWRXSGVpZ2h0ID0gcGFyYW1zLnZwYWlkSlNXcmFwcGVyLnZpZGVvU2xvdC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgcGFyYW1zLmFkV2lkdGggPSBwYXJhbXMudnBhaWRKU1dyYXBwZXIudmlkZW9TbG90Lm9mZnNldFdpZHRoO1xuICAgICAgICAgIHBhcmFtcy52aWRlb1Nsb3QgPSBwYXJhbXMudnBhaWRKU1dyYXBwZXIudmlkZW9TbG90O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5zbG90KSB7XG4gICAgICAgICAgICAvLyB2cGFpZCwgY29udGFpbmVyLCBhZElkcywgcGFydG5lckNvZGVcbiAgICAgICAgICAgIGluaXRJbnNpZGVUcmFja2luZyhwYXJhbXMpO1xuICAgICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0VXJpcyhldmVudCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuIiwiLyplc2xpbnQtZGlzYWJsZSovXG5cbmltcG9ydCBpbml0TW9hdFRyYWNraW5nIGZyb20gJy4uLy4uLy4uL2xpYi9tb2F0JztcblxuY29uc3QgcGFydG5lckNvZGUgPSAneWFob292cGFpZHR3b2ludDIxNTgzMTgyNTAzNyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vYXQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmFkUGFyYW1zID0gbnVsbDtcbiAgfVxuXG4gIGluaXQocGFyYW1zKSB7XG4gICAgdGhpcy5hZFBhcmFtcyA9IHBhcmFtcy5hZFBhcmFtcztcbiAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMuYWRQYXJhbXMubWV0YWRhdGE7XG4gICAgaWYodGhpcy5hZFBhcmFtcyAmJiB0aGlzLmFkUGFyYW1zLm1ldGFkYXRhKSB7XG4gICAgICAgIGNvbnN0IGlkcyA9IHtcbiAgICAgICAgICAgIGxldmVsMTogJ1lhaG9vIScsXG4gICAgICAgICAgICBsZXZlbDI6IG1ldGFkYXRhLmNhbXBhaWduSUQsXG4gICAgICAgICAgICBsZXZlbDM6IG1ldGFkYXRhLmxpbmVJdGVtSUQsXG4gICAgICAgICAgICBsZXZlbDQ6IG1ldGFkYXRhLmNyZWF0aXZlSUQsXG4gICAgICAgICAgICBzbGljZXIxOm1ldGFkYXRhLnB1Ymxpc2hlcklELFxuICAgICAgICAgICAgc2xpY2VyMjogbWV0YWRhdGEuc2l0ZVBsYWNlbWVudElELFxuICAgICAgICAgICAgc2FtcGxpbmc6ICcxLjAnLFxuICAgICAgICAgICAgdmlld01vZGU6ICdub3JtYWwnLFxuICAgICAgICAgICAgek1vYXRBdWN0aW9uSUQ6IG1ldGFkYXRhLmF1Y3Rpb25JRCxcbiAgICAgICAgICAgIHpNb2F0QWRSZXFEb21haW46IG1ldGFkYXRhLmFkUmVxdWVzdERvbWFpbk5hbWVcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocGFyYW1zLnNsb3QpIHtcbiAgICAgICAgICAgIC8vIHZwYWlkLCBjb250YWluZXIsIGFkSWRzLCBwYXJ0bmVyQ29kZVxuICAgICAgICAgICAgaW5pdE1vYXRUcmFja2luZyhwYXJhbXMudnBhaWRKU1dyYXBwZXIsIHBhcmFtcy5zbG90LCBpZHMsIHBhcnRuZXJDb2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFVyaXMoZXZlbnQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFBpcEJveVByb3ZpZGVyIHtcbiAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgdGhpcy5waXBCb3kgPSBwYXJhbXMucGlwQm95O1xuICB9XG5cbiAgaW5pdCgpIHt9XG5cbiAgZ2V0VXJpcyhldmVudCwgcGxheWJhY2tJbmZvKSB7XG4gICAgLy8gY29uc3QgdXJsID0gdGhpcy5waXBCb3kuZ2V0VXJsQnlFdmVudChldmVudCk7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG4iLCJpbXBvcnQge2dldFRydWVVcmxJbmZvfSBmcm9tICcuL3V0aWwvdXJsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZCh1cmwsIGFkUGFyYW1zLCBtYWNyb3MpIHtcbiAgbWFjcm9zLmZvckVhY2gobWFjcm8gPT4ge1xuICAgIGxldCByZXBsYWNlbWVudDtcbiAgICB0cnkge1xuICAgICAgcmVwbGFjZW1lbnQgPSBtYWNyby5yZXBsYWNlbWVudChhZFBhcmFtcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmVwbGFjZW1lbnQgPSAndW5kZWZpbmVkJztcbiAgICB9XG4gICAgdXJsID0gdXJsLnJlcGxhY2UobWFjcm8ucmVnZXgsIHJlcGxhY2VtZW50KTtcbiAgfSk7XG4gIHJldHVybiB1cmw7XG59XG5cbmV4cG9ydCBjb25zdCBhZFJlcXVlc3REb21haW5OYW1lID0ge1xuICByZWdleDogLyMjQURfUkVRVUVTVF9ET01BSU5fTkFNRSMjL2dpLFxuICByZXBsYWNlbWVudDogZnVuY3Rpb24oYWRQYXJhbXMpIHtcbiAgICByZXR1cm4gU3RyaW5nKGFkUGFyYW1zLm1ldGFkYXRhLmFkUmVxdWVzdERvbWFpbk5hbWUpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgY3JlYXRpdmVJZCA9IHtcbiAgcmVnZXg6IC8oIyN8XFxbKUNSRUFUSVZFX0lEKCMjfFxcXSkvZ2ksXG4gIHJlcGxhY2VtZW50OiBmdW5jdGlvbihhZFBhcmFtcykge1xuICAgIHJldHVybiBTdHJpbmcoYWRQYXJhbXMubWV0YWRhdGEuY3JlYXRpdmVJZCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGl2ZUlkSGFja2VyID0ge1xuICByZWdleDogLygjI3xcXFspQ1JFQVRJVkVfSURfSEFDS0VSKCMjfFxcXSkvZ2ksXG4gIHJlcGxhY2VtZW50OiBmdW5jdGlvbihhZFBhcmFtcykge1xuICAgIHJldHVybiBTdHJpbmcoYWRQYXJhbXMubWV0YWRhdGEuY3JlYXRpdmVJZCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBkZW1hbmRTb3VyY2VJZCA9IHtcbiAgcmVnZXg6IC8oXFxbKWRlbWFuZF9zb3VyY2VfaWQoXFxdKS9naSxcbiAgcmVwbGFjZW1lbnQ6IGZ1bmN0aW9uKGFkUGFyYW1zKSB7XG4gICAgcmV0dXJuIFN0cmluZyhhZFBhcmFtcy5tZXRhZGF0YS5kZW1hbmRTb3VyY2VJZCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCB2cGFpZEpTV3JhcHBlclZlcnNpb24gPSB7XG4gIHJlZ2V4OiAvKCMjfFxcWylWSVNUQV9WRVJTSU9OKCMjfFxcXSkvZ2ksXG4gIHJlcGxhY2VtZW50OiBmdW5jdGlvbihhZFBhcmFtcykge1xuICAgIHJldHVybiBTdHJpbmcoYWRQYXJhbXMubWV0YWRhdGEudnBhaWRKU1dyYXBwZXJWZXJzaW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGluc2VydGlvbk9yZGVySWQgPSB7XG4gIHJlZ2V4OiAvKCMjfFxcWylJT19JRCgjI3xcXF0pL2dpLFxuICByZXBsYWNlbWVudDogZnVuY3Rpb24oYWRQYXJhbXMpIHtcbiAgICByZXR1cm4gU3RyaW5nKGFkUGFyYW1zLm1ldGFkYXRhLmluc2VydGlvbk9yZGVySWQpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgbGluZUl0ZW1JZCA9IHtcbiAgcmVnZXg6IC8oIyN8XFxbKUxJTkVfSVRFTV9JRCgjI3xcXF0pL2dpLFxuICByZXBsYWNlbWVudDogZnVuY3Rpb24oYWRQYXJhbXMpIHtcbiAgICByZXR1cm4gU3RyaW5nKGFkUGFyYW1zLm1ldGFkYXRhLmxpbmVJdGVtSWQpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc2l0ZVBsYWNlbWVudElkID0ge1xuICByZWdleDogLygjI3xcXFspKFNJVEVfUExBQ0VNRU5UX0lEfFNJVEVfSUR8U0lURV9QTEFDRU1FTlQpKCMjfFxcXSkvZ2ksXG4gIHJlcGxhY2VtZW50OiBmdW5jdGlvbihhZFBhcmFtcykge1xuICAgIHJldHVybiBTdHJpbmcoYWRQYXJhbXMubWV0YWRhdGEuc2l0ZVBsYWNlbWVudElkKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHBhZ2VVcmwgPSB7XG4gIHJlZ2V4OiAvKCMjfFxcWylQQUdFX1VSTCgjI3xcXF0pL2dpLFxuICByZXBsYWNlbWVudDogZnVuY3Rpb24oYWRQYXJhbXMpIHtcbiAgICByZXR1cm4gU3RyaW5nKGdldFRydWVVcmxJbmZvKCkudG9wVXJsKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHByb3RvY29sID0ge1xuICByZWdleDogLygjI3xcXFspUFJPVE9DT0woIyN8XFxdKS9naSxcbiAgcmVwbGFjZW1lbnQ6IGZ1bmN0aW9uKGFkUGFyYW1zKSB7XG4gICAgcmV0dXJuIFN0cmluZyhhZFBhcmFtcy5tZXRhZGF0YS5wcm90b2NvbCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBwdWJsaXNoZXIgPSB7XG4gIHJlZ2V4OiAvKCMjfFxcWykoUFVCTElTSEVSfFBVQkxJU0hFUl9JRCkoIyN8XFxdKS9naSxcbiAgcmVwbGFjZW1lbnQ6IGZ1bmN0aW9uKGFkUGFyYW1zKSB7XG4gICAgcmV0dXJuIFN0cmluZyhhZFBhcmFtcy5tZXRhZGF0YS5wdWJsaXNoZXJJZCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCB0aW1lU3RhbXAgPSB7XG4gIHJlZ2V4OiAvKCMjfCV8XFxbKVRJTUVTVEFNUCgjI3wlfFxcXSkvZ2ksXG4gIHJlcGxhY2VtZW50OiBmdW5jdGlvbihhZFBhcmFtcykge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLnRvVVRDU3RyaW5nKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCB4dHJhID0ge1xuICByZWdleDogLygjI3xcXFspWFRSQSgjI3xcXF0pL2dpLFxuICByZXBsYWNlbWVudDogZnVuY3Rpb24oYWRQYXJhbXMpIHtcbiAgICByZXR1cm4gU3RyaW5nKGFkUGFyYW1zLm1ldGFkYXRhLnh0cmEpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgeHRyYUhhY2tlciA9IHtcbiAgcmVnZXg6IC8oIyN8XFxbKVhUUkFfSEFDS0VSKCMjfFxcXSkvZ2ksXG4gIHJlcGxhY2VtZW50OiBmdW5jdGlvbihhZFBhcmFtcykge1xuICAgIHJldHVybiBTdHJpbmcoYWRQYXJhbXMubWV0YWRhdGEueHRyYSk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwidnBhaWRKU1dyYXBwZXJWZXJzaW9uXCI6IFwiVklTVEFfMV8yX1ZFUlNJT05cIlxufVxuIiwiaW1wb3J0IENsb2NrIGZyb20gJy4vdXRpbC9jbG9jayc7XG4vLyBpbXBvcnQgZmlyZSBmcm9tICcuL3V0aWwvZmlyZSc7XG5pbXBvcnQgKiBhcyBNYWNyb3MgZnJvbSAnLi9tYWNyb3MnO1xuaW1wb3J0IHt2cGFpZEpTV3JhcHBlclZlcnNpb259IGZyb20gJy4vbWV0YWRhdGEuanNvbic7XG5cbi8vIDF4eDogVlBBSUQgZXZlbnRzXG5jb25zdCBldmVudE1hcHBpbmcgPSB7XG4gIEFkTG9hZGVkOiAgICAgICAgICAgICAgIHtjb2RlOiAnMTAxJywgb25seU9uRGVidWc6IGZhbHNlLCBmaXJlT25jZTogZmFsc2V9LFxuICBBZFN0YXJ0ZWQ6ICAgICAgICAgICAgICB7Y29kZTogJzEwMicsIG9ubHlPbkRlYnVnOiBmYWxzZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWRTdG9wcGVkOiAgICAgICAgICAgICAge2NvZGU6ICcxMDMnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWRTa2lwcGVkOiAgICAgICAgICAgICAge2NvZGU6ICcxMDQnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWRTa2lwcGFibGVTdGF0ZUNoYW5nZToge2NvZGU6ICcxMDUnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWRTaXplQ2hhbmdlOiAgICAgICAgICAge2NvZGU6ICcxMDYnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWRMaW5lYXJDaGFuZ2U6ICAgICAgICAge2NvZGU6ICcxMDcnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWREdXJhdGlvbkNoYW5nZTogICAgICAge2NvZGU6ICcxMDgnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWRFeHBhbmRlZENoYW5nZTogICAgICAge2NvZGU6ICcxMDknLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWRSZW1haW5pbmdUaW1lQ2hhbmdlOiAge2NvZGU6ICcxMTAnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IHRydWV9LFxuICBBZFZvbHVtZUNoYW5nZTogICAgICAgICB7Y29kZTogJzExMScsIG9ubHlPbkRlYnVnOiB0cnVlLCBmaXJlT25jZTogZmFsc2V9LFxuICBBZEltcHJlc3Npb246ICAgICAgICAgICB7Y29kZTogJzExMicsIG9ubHlPbkRlYnVnOiBmYWxzZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWRDbGlja1RocnU6ICAgICAgICAgICAge2NvZGU6ICcxMTQnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWRJbnRlcmFjdGlvbjogICAgICAgICAge2NvZGU6ICcxMTUnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWRMb2c6ICAgICAgICAgICAgICAgICAge2NvZGU6ICcxMTgnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgQWRFcnJvcjogICAgICAgICAgICAgICAge2NvZGU6ICcxMTknLCBvbmx5T25EZWJ1ZzogZmFsc2UsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIEFkVmlkZW9TdGFydDogICAgICAgICAgIHtjb2RlOiAnMTIwJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIEFkVmlkZW9GaXJzdFF1YXJ0aWxlOiAgIHtjb2RlOiAnMTIxJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIEFkVmlkZW9NaWRwb2ludDogICAgICAgIHtjb2RlOiAnMTIyJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIEFkVmlkZW9UaGlyZFF1YXJ0aWxlOiAgIHtjb2RlOiAnMTIzJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIEFkVmlkZW9Db21wbGV0ZTogICAgICAgIHtjb2RlOiAnMTI0Jywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIEFkVXNlckFjY2VwdEludml0YXRpb246IHtjb2RlOiAnMTMwJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIEFkVXNlck1pbmltaXplOiAgICAgICAgIHtjb2RlOiAnMTMxJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIEFkVXNlckNsb3NlOiAgICAgICAgICAgIHtjb2RlOiAnMTMyJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIEFkUGF1c2VkOiAgICAgICAgICAgICAgIHtjb2RlOiAnMTQwJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIEFkUGxheWluZzogICAgICAgICAgICAgIHtjb2RlOiAnMTQxJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX1cbn07XG5cbi8vIDJ4eDogVlBBSUQgbWV0aG9kIGNhbGxzXG5jb25zdCBtZXRob2RNYXBwaW5nID0ge1xuICBzdWJzY3JpYmU6ICAgICAgICAgICAgICB7Y29kZTogJzIwMCcsIG9ubHlPbkRlYnVnOiB0cnVlLCBmaXJlT25jZTogdHJ1ZX0sXG4gIGhhbmRzaGFrZVZlcnNpb246ICAgICAgIHtjb2RlOiAnMjAxJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIGluaXRBZDogICAgICAgICAgICAgICAgIHtjb2RlOiAnMjAyJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIHJlc2l6ZUFkOiAgICAgICAgICAgICAgIHtjb2RlOiAnMjAzJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX0sXG4gIHN0YXJ0QWQ6ICAgICAgICAgICAgICAgIHtjb2RlOiAnMjA0Jywgb25seU9uRGVidWc6IGZhbHNlLCBmaXJlT25jZTogZmFsc2V9LFxuICBzdG9wQWQ6ICAgICAgICAgICAgICAgICB7Y29kZTogJzIwNScsIG9ubHlPbkRlYnVnOiB0cnVlLCBmaXJlT25jZTogZmFsc2V9LFxuICBwYXVzZUFkOiAgICAgICAgICAgICAgICB7Y29kZTogJzIwNicsIG9ubHlPbkRlYnVnOiB0cnVlLCBmaXJlT25jZTogZmFsc2V9LFxuICByZXN1bWVBZDogICAgICAgICAgICAgICB7Y29kZTogJzIwNycsIG9ubHlPbkRlYnVnOiB0cnVlLCBmaXJlT25jZTogZmFsc2V9LFxuICBleHBhbmRBZDogICAgICAgICAgICAgICB7Y29kZTogJzIwOCcsIG9ubHlPbkRlYnVnOiB0cnVlLCBmaXJlT25jZTogZmFsc2V9LFxuICBjb2xsYXBzZUFkOiAgICAgICAgICAgICB7Y29kZTogJzIwOScsIG9ubHlPbkRlYnVnOiB0cnVlLCBmaXJlT25jZTogZmFsc2V9LFxuICBza2lwQWQ6ICAgICAgICAgICAgICAgICB7Y29kZTogJzIxMCcsIG9ubHlPbkRlYnVnOiB0cnVlLCBmaXJlT25jZTogZmFsc2V9XG59O1xuXG4vLyAzeHg6IEJyb3dzZXIvVmlzdGEgYmVoYXZpb3JcbmNvbnN0IGJlaGF2aW9yTWFwcGluZyA9IHtcbiAgbG9hZGVkRmlsZTogICAgICAgICAgICAge2NvZGU6ICczMDAnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgZ2V0VlBBSURBZENhbGxlZDogICAgICAge2NvZGU6ICczMDEnLCBvbmx5T25EZWJ1ZzogdHJ1ZSwgZmlyZU9uY2U6IGZhbHNlfSxcbiAgaW5zdGFudGlhdGVkVmlzdGE6ICAgIHtjb2RlOiAnMzAyJywgb25seU9uRGVidWc6IHRydWUsIGZpcmVPbmNlOiBmYWxzZX1cbn07XG5cbi8vIDR4eDogRXJyb3JzXG5jb25zdCBlcnJvck1hcHBpbmcgPSB7XG4gIGFkUGxheWJhY2tUaW1lZE91dDogICAgIHtjb2RlOiAnNDAxJywgb25seU9uRGVidWc6IGZhbHNlLCBmaXJlT25jZTogZmFsc2V9XG59O1xuXG5jb25zdCBiYXNlVXJsID0gJ1twcm90b2NvbF06Ly9waXBib3kuYnRybGwuY29tL1BpeC0xeDEuZ2lmPycgK1xuICAncF9pZD1bcHVibGlzaGVyX2lkXSZzcF9pZD1bc2l0ZV9wbGFjZW1lbnRfaWRdJmxpX2lkPVtsaW5lX2l0ZW1faWRdJmNfaWQ9W2NyZWF0aXZlX2lkX2hhY2tlcl0nICtcbiAgJyZ4dHJhPVt4dHJhX2hhY2tlcl0mdmVyc2lvbj1bdnBhaWRKU1dyYXBwZXJfdmVyc2lvbl0nO1xuXG5jb25zdCBtYWNyb0xpc3QgPSBbXG4gIE1hY3Jvcy5jcmVhdGl2ZUlkSGFja2VyLFxuICBNYWNyb3MudnBhaWRKU1dyYXBwZXJWZXJzaW9uLFxuICBNYWNyb3MubGluZUl0ZW1JZCxcbiAgTWFjcm9zLnByb3RvY29sLFxuICBNYWNyb3MucHVibGlzaGVyLFxuICBNYWNyb3Muc2l0ZVBsYWNlbWVudElkLFxuICBNYWNyb3MueHRyYUhhY2tlclxuXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGlwQm95IHtcbiAgY29uc3RydWN0b3IocXVlcnlQYXJhbXMpIHtcbiAgICBjb25zdCBhZFBhcmFtcyA9IHt9O1xuICAgIGFkUGFyYW1zLm1ldGFkYXRhID0gcXVlcnlQYXJhbXM7XG4gICAgYWRQYXJhbXMubWV0YWRhdGEudnBhaWRKU1dyYXBwZXJWZXJzaW9uID0gdnBhaWRKU1dyYXBwZXJWZXJzaW9uO1xuXG4gICAgdGhpcy5maXJlZFBpeGVscyA9IHt9O1xuICAgIHRoaXMuY2xvY2sgPSBuZXcgQ2xvY2soKTtcbiAgICB0aGlzLmNvdW50ID0gMDtcbiAgICB0aGlzLmRlYnVnID0gISFhZFBhcmFtcy5tZXRhZGF0YS5kZWJ1ZztcbiAgICB0aGlzLmFkUGFyYW1zID0gYWRQYXJhbXM7XG4gIH1cblxuICBfbG9nRmlyZShwaXhlbCkge1xuICAgIHRoaXMuZmlyZWRQaXhlbHNbcGl4ZWwuY29kZV0gPSB0cnVlO1xuICAgIHRoaXMuY291bnQrKztcbiAgfVxuXG4gIF9jYW5GaXJlUGl4ZWwocGl4ZWwpIHtcbiAgICBpZiAoIXBpeGVsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIE9ubHkgZmlyZSBkZWJ1ZyBwaXhlbHMgaWYgd2UncmUgaW4gZGVidWcgbW9kZVxuICAgIGlmICghdGhpcy5kZWJ1ZyAmJiBwaXhlbC5vbmx5T25EZWJ1Zykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBBdm9pZCBmaXJpbmcgc29tZSBwaXhlbHMgbW9yZSB0aGFuIG9uY2VcbiAgICBpZiAocGl4ZWwuZmlyZU9uY2UgJiYgdGhpcy5maXJlZFBpeGVsc1twaXhlbC5jb2RlXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIF9nZXRVcmxGcm9tTWFwKG5hbWUsIG1hcCkge1xuICAgIGNvbnN0IHBpeGVsID0gbWFwW25hbWVdO1xuICAgIGlmICh0aGlzLl9jYW5GaXJlUGl4ZWwocGl4ZWwpKSB7XG4gICAgICBjb25zdCB1cmwgPSBnZXRVcmwocGl4ZWwsIHRoaXMuY291bnQsIHRoaXMuY2xvY2suZ2V0Q3VycmVudFRpbWUoKSwgdGhpcy5hZFBhcmFtcyk7XG4gICAgICB0aGlzLl9sb2dGaXJlKHBpeGVsKTtcbiAgICAgIHJldHVybiB1cmw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9maXJlVXJsRnJvbU1hcChuYW1lLCBtYXApIHtcbiAgICBjb25zdCB1cmwgPSB0aGlzLl9nZXRVcmxGcm9tTWFwKG5hbWUsIG1hcCk7XG4gICAgaWYgKHVybCkge1xuICAgICAgLy8gZmlyZSh1cmwpO1xuICAgICAgY29uc29sZS5sb2codXJsKTtcbiAgICB9XG4gIH1cbiBpbml0KHBhcmFtcykge1xuICAgdGhpcy5hZFBhcmFtcyA9IHBhcmFtcztcbiAgIHRoaXMuZGVidWcgPSB0aGlzLmFkUGFyYW1zLmZlYXR1cmVzLnNvbWUoZnVuY3Rpb24oZikge1xuICAgICByZXR1cm4gZiA9PT0gJ2RlYnVnJztcbiAgIH0pIHx8IHRoaXMuZGVidWc7XG4gfVxuXG4gIGdldFVybEJ5RXZlbnQobmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcmxGcm9tTWFwKG5hbWUsIGV2ZW50TWFwcGluZyk7XG4gIH1cblxuICBmaXJlTWV0aG9kKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fZmlyZVVybEZyb21NYXAobmFtZSwgbWV0aG9kTWFwcGluZyk7XG4gIH1cblxuICBmaXJlQmVoYXZpb3IobmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9maXJlVXJsRnJvbU1hcChuYW1lLCBiZWhhdmlvck1hcHBpbmcpO1xuICB9XG5cbiAgZmlyZUVycm9yKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fZmlyZVVybEZyb21NYXAobmFtZSwgZXJyb3JNYXBwaW5nKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRVcmwocGl4ZWwsIGNvdW50LCBjdXJyZW50VGltZSwgYWRQYXJhbXMpIHtcbiAgcmV0dXJuIE1hY3Jvcy5leHBhbmQoYmFzZVVybCwgYWRQYXJhbXMsIG1hY3JvTGlzdCkgKyAnJmNvdW50PScgKyBjb3VudFxuICAgICsgJyZ0aW1lPScgKyBjdXJyZW50VGltZS50b0ZpeGVkKDMpICsgJyZjb2RlPScgKyBwaXhlbC5jb2RlO1xufVxuIiwiaW1wb3J0IGZpcmUgZnJvbSAnLi91dGlsL2ZpcmUnO1xuaW1wb3J0IGFzeW5jIGZyb20gJ2FzeW5jJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvZ3Jlc3NFdmVudHMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICAgIHRoaXMucGVyY2VudGFnZUxpc3RlbmVycyA9IFtdO1xuICAgIHRoaXMudXJpcyA9IFtdO1xuICAgIHRoaXMucGVyY2VudGFnZVVyaXMgPSBbXTtcbiAgfVxuXG4gIGFkZExpc3RlbmVyKGNiLCBvZmZzZXQsIGNvbnRleHQpIHtcbiAgICBhZGRTb3J0ZWQodGhpcy5saXN0ZW5lcnMsIHtcbiAgICAgIGNhbGxiYWNrOiBjYixcbiAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICBvZmZzZXQ6IG9mZnNldFxuICAgIH0pO1xuICB9XG5cbiAgYWRkTGlzdGVuZXJQZXJjZW50YWdlKGNiLCBvZmZzZXQsIGNvbnRleHQpIHtcbiAgICBhZGRTb3J0ZWQodGhpcy5wZXJjZW50YWdlTGlzdGVuZXJzLCB7XG4gICAgICBjYWxsYmFjazogY2IsXG4gICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgb2Zmc2V0OiBvZmZzZXRcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFVSSSh1cmksIG9mZnNldCkge1xuICAgIGFkZFNvcnRlZCh0aGlzLnVyaXMsIHtcbiAgICAgIHVyaTogdXJpLFxuICAgICAgb2Zmc2V0OiBvZmZzZXRcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFVSSVBlcmNlbnRhZ2UodXJpLCBvZmZzZXQpIHtcbiAgICBhZGRTb3J0ZWQodGhpcy5wZXJjZW50YWdlVXJpcywge1xuICAgICAgdXJpOiB1cmksXG4gICAgICBvZmZzZXQ6IG9mZnNldFxuICAgIH0pO1xuICB9XG5cbiAgY2hlY2tBbmRGaXJlKHRpbWUsIGR1cmF0aW9uLCAgcGFyYW1zLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSAodGltZSAvIGR1cmF0aW9uKSAqIDEwMDtcbiAgICBhc3luYy5zZXJpZXMoW1xuICAgICAgYXN5bmMuYXBwbHkoY2hlY2tBbmRGaXJlLCB0aGlzLnBlcmNlbnRhZ2VVcmlzLCBwZXJjZW50YWdlKSxcbiAgICAgIGFzeW5jLmFwcGx5KGNoZWNrQW5kRmlyZSwgdGhpcy51cmlzLCB0aW1lKVxuICAgIF0sICgpID0+IHtcbiAgICAgIGNoZWNrQW5kQ2FsbCh0aGlzLnBlcmNlbnRhZ2VMaXN0ZW5lcnMsIHBlcmNlbnRhZ2UsIHBhcmFtcyk7XG4gICAgICBjaGVja0FuZENhbGwodGhpcy5saXN0ZW5lcnMsIHRpbWUsIHBhcmFtcyk7XG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFNvcnRlZChhcnIsIGl0ZW0pIHtcbiAgbGV0IGxlZnQgPSAwO1xuICBsZXQgcmlnaHQgPSBhcnIubGVuZ3RoO1xuICB3aGlsZSAobGVmdCAhPT0gcmlnaHQpIHtcbiAgICBsZXQgbWlkZGxlID0gTWF0aC5mbG9vcigocmlnaHQgLSBsZWZ0KSAvIDIpICsgbGVmdDtcbiAgICBpZiAoaXRlbS5vZmZzZXQgPiBhcnJbbWlkZGxlXS5vZmZzZXQpIHtcbiAgICAgIHJpZ2h0ID0gbWlkZGxlO1xuICAgIH0gZWxzZSBpZiAoaXRlbS5vZmZzZXQgPT09IGFyclttaWRkbGVdLm9mZnNldCkge1xuICAgICAgbGVmdCA9IG1pZGRsZTtcbiAgICAgIGJyZWFrO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZWZ0ID0gbWlkZGxlICsgMTtcbiAgICB9XG4gIH1cbiAgYXJyLnNwbGljZShsZWZ0LCAwLCBpdGVtKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tBbmRGaXJlKGFyciwgb2Zmc2V0LCBjYWxsYmFjaykge1xuICBhc3luYy53aGlsc3QoKCkgPT4ge1xuICAgIHJldHVybiBhcnIubGVuZ3RoID4gMCAmJiBhcnJbYXJyLmxlbmd0aCAtIDFdLm9mZnNldCA8PSBvZmZzZXQ7XG4gIH0sXG4gIGRvbmUgPT4ge1xuICAgIGNvbnN0IHVyaSA9IGFyci5wb3AoKTtcbiAgICBmaXJlKHVyaS51cmksIGRvbmUpO1xuICB9LFxuICBjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrQW5kQ2FsbChhcnIsIG9mZnNldCwgcGFyYW1zKSB7XG4gIGxldCBsaXN0ZW5lcjtcbiAgLy8gR28gdGhyb3VnaCB0aGUgc29ydGVkIGFycmF5IHVudGlsIHdlJ3ZlIHBhc3NlZCBvZmZzZXRcbiAgd2hpbGUgKGFyci5sZW5ndGggPiAwICYmIGFyclthcnIubGVuZ3RoIC0gMV0ub2Zmc2V0IDw9IG9mZnNldCkge1xuICAgIGxpc3RlbmVyID0gYXJyLnBvcCgpO1xuICAgIGxpc3RlbmVyLmNhbGxiYWNrLmFwcGx5KGxpc3RlbmVyLmNvbnRleHQgfHwgbnVsbCwgcGFyYW1zKTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xvY2sge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0YXJ0VGltZSA9IGdldFRpbWUoKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgdGhlIHRpbWUgaW4gc2Vjb25kc1xuICBnZXRDdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gKGdldFRpbWUoKSAtIHRoaXMuc3RhcnRUaW1lKSAvIDEwMDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VGltZSgpIHtcbiAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmlyZSh1cmksIGNhbGxiYWNrKSB7XG4gIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuXG4gIGNvbnN0IGltYWdlQ0IgPSAoKSA9PiB7XG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKTtcbiAgfTtcblxuICBpbWcub25sb2FkID0gaW1hZ2VDQjtcbiAgaW1nLm9uZXJyb3IgPSBpbWFnZUNCO1xuXG4gIGltZy5zcmMgPSB1cmk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVF1ZXJ5UGFyYW1zKHVybCkge1xuICBjb25zdCBxdWVyeVBhcmFtcyA9IHt9O1xuICBjb25zdCBwcm90b2NvbE1hdGNoID0gdXJsICYmIHVybC5tYXRjaCgvXlxccyooXFx3Kyk6Lyk7XG4gIGlmIChwcm90b2NvbE1hdGNoICYmIHByb3RvY29sTWF0Y2hbMV0pIHtcbiAgICBxdWVyeVBhcmFtcy5wcm90b2NvbCA9IHByb3RvY29sTWF0Y2hbMV07XG4gIH0gZWxzZSB7XG4gICAgcXVlcnlQYXJhbXMucHJvdG9jb2wgPSAnaHR0cHMnO1xuICB9XG4gIGNvbnN0IHBhcmFtcyA9IHVybCAmJiB1cmwuc3BsaXQoJz8nKVsxXTtcbiAgaWYgKHBhcmFtcykge1xuICAgIGNvbnN0IHBhcmFtc0xpc3QgPSBwYXJhbXMuc3BsaXQoJyYnKTtcbiAgICBwYXJhbXNMaXN0LmZvckVhY2gocGFyYW0gPT4ge1xuICAgICAgY29uc3Qga3YgPSBwYXJhbS5zcGxpdCgnPScpO1xuICAgICAgc3dpdGNoIChrdlswXSkge1xuICAgICAgICAvLyBwdWJsaXNoZXIgaWRcbiAgICAgICAgY2FzZSAncCc6XG4gICAgICAgICAgcXVlcnlQYXJhbXMucHVibGlzaGVySWQgPSBrdlsxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gU1BJRFxuICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICBxdWVyeVBhcmFtcy5zaXRlUGxhY2VtZW50SWQgPSBrdlsxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gTGluZSBJdGVtIElEXG4gICAgICAgIGNhc2UgJ2wnOlxuICAgICAgICAgIHF1ZXJ5UGFyYW1zLmxpbmVJdGVtSWQgPSBrdlsxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gRGVtYW5kIFNvdXJjZSBJRFxuICAgICAgICBjYXNlICdkcyc6XG4gICAgICAgICAgcXVlcnlQYXJhbXMuZGVtYW5kU291cmNlSWQgPSBrdlsxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gQ3JlYXRpdmUgSURcbiAgICAgICAgY2FzZSAnaWMnOlxuICAgICAgICAgIHF1ZXJ5UGFyYW1zLmNyZWF0aXZlSWQgPSBrdlsxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gWHRyYSwgd2lsbCBiZSBhdWN0aW9uSWQgZm9yIFJUQkQgcmVzcG9uc2VzXG4gICAgICAgIGNhc2UgJ3gnOlxuICAgICAgICAgIHF1ZXJ5UGFyYW1zLnh0cmEgPSBrdlsxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gQXVjdGlvbiBJRFxuICAgICAgICBjYXNlICdhdSc6XG4gICAgICAgICAgcXVlcnlQYXJhbXMuYXVjdGlvbklkID0ga3ZbMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIGRlYnVnXG4gICAgICAgIGNhc2UgJ2RlYnVnJzpcbiAgICAgICAgICBxdWVyeVBhcmFtcy5kZWJ1ZyA9IGt2WzFdID09PSAneSc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcXVlcnlQYXJhbXM7XG59XG4iLCIvLyBHZXRUcnVlVXJsSW5mbyBsb2dpYyB0YWtlbiBmcm9tIFNjb3V0XG4vLyBEZXRlY3Rpb24gb2YgdG9wLWxldmVsIFVSTCwgZ2l2ZW4gdGhlIHBvc3NpYmxlIG5lc3RlZCBmcmFtZSBzY2VuYXJpb3MgdGhhdCBtYXkgb2NjdXIgaW4gdGhlIHdpbGRcbmV4cG9ydCBmdW5jdGlvbiBnZXRUcnVlVXJsSW5mbygpIHtcbiAgdmFyIGN1cnJlbnRVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcblxuICAvLyBCaW5hcnkgc3RyaW5nIHRvIGluZGljYXRlIHdoZXRoZXIgb3Igbm90IHdlJ3JlIGluc2lkZSBvZiBhbiBpZnJhbWVcbiAgdmFyIGluSWZyYW1lID0gJzAnO1xuXG4gIC8vIElmIHdlJ3JlIG5vdCB3aXRoaW4gYW4gaWZyYW1lLCB0aGUgcGFyZW50IHdpbGwgYmUgYW4gZW1wdHkgc3RyaW5nXG4gIHZhciBwYXJlbnRVcmwgPSAnJztcblxuICAvLyBIZXJlLCB0aGUgdG9wIFVSTCBpcyB0aGUgVVJMIGF0IHRoZSBoaWdoZXN0IGxldmVsIGF0IHdoaWNoIHdlIGNhbiBkZXRlY3QuXG4gIC8vIFRoZSB0b3AgVVJMIHNob3VsZCBhbHdheXMgaGF2ZSBhIHZhbHVlXG4gIHZhciB0b3BVcmwgPSAnJztcblxuICAvLyBUaGUgbWV0aG9kIGJ5IHdoaWNoIHdlIGRldGVjdGVkIHRoZXNlIGRvbWFpbnNcbiAgdmFyIGRldGVjdGlvbk1ldGhvZCA9ICcnO1xuXG4gIC8vIEFtcGVyc2FuZC1kZWxpbWl0ZWQgc3RyaW5nIG9mIGRvbWFpbnMsIHdoZXJlIHRoZSBmaXJzdCBpdGVtIGlzIHRoZSBjdXJyZW50IHBhZ2UgVVJMXG4gIC8vIGFuZCB0aGUgbGFzdCBpcyB0aGUgdG9wLW1vc3QgZG9tYWluIHdlJ3JlIGFibGUgdG8gZGV0ZWN0XG4gIHZhciBkb21haW5DaGFpblN0cmluZyA9ICcnO1xuXG4gIHZhciBhbmNlc3Rvck9yaWdpbnM7XG4gIHZhciBhbmNlc3Rvck9yaWdpbnNBcnJheTtcbiAgdmFyIGFuY2VzdG9yT3JpZ2luc1N0cmluZztcbiAgdmFyIGk7XG5cbiAgdmFyIGFuY2VzdG9yT3JpZ2luc1N1cHBvcnRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgYW5jZXN0b3JPcmlnaW5zID0gd2luZG93LmxvY2F0aW9uLmFuY2VzdG9yT3JpZ2lucztcbiAgICAgIGlmICh0eXBlb2YgYW5jZXN0b3JPcmlnaW5zICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIHZhciBpc1RvcFNhbWVEb21haW4gPSBmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHRvcFVybCA9IHdpbmRvdy50b3AubG9jYXRpb24uaHJlZjtcbiAgICAgIGlmICh0eXBlb2YgdG9wVXJsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIC8vIEZpcnN0LCBjaGVjayB0byBzZWUgaWYgd2UncmUgYWN0dWFsbHkgaW4gYW4gaWZyYW1lLiBJZiB3ZSBhcmUsIHRoZXJlJ3Mgbm8gcGFyZW50L3RvcCBVUkwgdG8gZ3JhYlxuICBpZiAod2luZG93LnNlbGYgPT09IHdpbmRvdy50b3ApIHtcbiAgICB0b3BVcmwgPSBjdXJyZW50VXJsO1xuICAgIGRvbWFpbkNoYWluU3RyaW5nID0gdG9wVXJsO1xuICAgIGRldGVjdGlvbk1ldGhvZCA9ICdub0ZyYW1lcyc7XG4gIH0gZWxzZSB7XG4gICAgaW5JZnJhbWUgPSAnMSc7XG5cbiAgICAgIC8vIDEpIENoZWNrIHRvIHNlZSBpZiB0aGUgdG9wIGRvbWFpbiBpcyB0aGUgc2FtZSBhcyB0aGUgY2hpbGRcbiAgICAgIC8vIFRoaXMgd2lsbCBvbmx5IGJlIHRoZSBjYXNlIHdoZW4gdGhlIHRvcCBkb21haW4gbWF0Y2hlcyB0aGUgY2hpbGQgZG9tYWluIGluIHByb3RvY29sLCBob3N0IGFuZCBwb3J0XG4gICAgaWYgKGlzVG9wU2FtZURvbWFpbigpKSB7XG4gICAgICBwYXJlbnRVcmwgPSB3aW5kb3cucGFyZW50LmxvY2F0aW9uLmhyZWY7XG4gICAgICB0b3BVcmwgPSB3aW5kb3cudG9wLmxvY2F0aW9uLmhyZWY7XG4gICAgICBkb21haW5DaGFpblN0cmluZyA9IGN1cnJlbnRVcmwgKyAnfHwnICsgcGFyZW50VXJsICsgJ3x8JyArIHRvcFVybDtcbiAgICAgIGRldGVjdGlvbk1ldGhvZCA9ICdzYW1lRG9tYWluJztcblxuICAgIC8vIDEpIGFuY2VzdG9yT3JpZ2luc1xuICAgIH0gZWxzZSBpZiAoYW5jZXN0b3JPcmlnaW5zU3VwcG9ydGVkKCkpIHtcbiAgICAgIGFuY2VzdG9yT3JpZ2lucyA9IHdpbmRvdy5sb2NhdGlvbi5hbmNlc3Rvck9yaWdpbnM7XG4gICAgICBhbmNlc3Rvck9yaWdpbnNBcnJheSA9IFtdO1xuICAgICAgZm9yIChpID0gMDsgaSA8IGFuY2VzdG9yT3JpZ2lucy5sZW5ndGg7IGkgPSBpICsgMSkge1xuICAgICAgICBhbmNlc3Rvck9yaWdpbnNBcnJheVtpXSA9IGFuY2VzdG9yT3JpZ2luc1tpXTtcbiAgICAgIH1cblxuICAgICAgLy8gR3JhYiBlYWNoIFVSTCBpbiB0aGUgZG9tYWluIGNoYWluIGFuZCBmb3JtYXQgaW4gYW4gYW1wZXJzYW5kLWRlbGltaXRlZCBzdHJpbmdcbiAgICAgIGFuY2VzdG9yT3JpZ2luc1N0cmluZyA9IGFuY2VzdG9yT3JpZ2luc0FycmF5LmpvaW4oJ3x8Jyk7XG4gICAgICBkb21haW5DaGFpblN0cmluZyA9IGN1cnJlbnRVcmwgKyAnfHwnICsgYW5jZXN0b3JPcmlnaW5zU3RyaW5nO1xuXG4gICAgICAvLyBXZSBhbHNvIG5lZWQgdG8gZ3JhYiB0aGUgcGFyZW50IFVSTCwgYW5kIHRvcC1sZXZlbCBVUkwsIHRvIHBhc3MgYXMgc2VwYXJhdGUgcGFyYW1ldGVyc1xuICAgICAgIC8vIEZpcnN0IGVsZW1lbnQgaXMgcGFyZW50XG4gICAgICBwYXJlbnRVcmwgPSBhbmNlc3Rvck9yaWdpbnNBcnJheVswXTtcblxuICAgICAgLy8gTGFzdCBlbGVtZW50IGlzIHRvcC1sZXZlbCBVUkxcbiAgICAgIHRvcFVybCA9IGFuY2VzdG9yT3JpZ2luc0FycmF5W2FuY2VzdG9yT3JpZ2luc0FycmF5Lmxlbmd0aCAtIDFdO1xuICAgICAgZGV0ZWN0aW9uTWV0aG9kID0gJ2FuY2VzdG9yT3JpZ2lucyc7XG5cbiAgICAgIC8vIDMpIElmIG5laXRoZXIgb2YgdGhlIGFib3ZlIGRldGVjdGlvbiBtZXRob2RzIHdvcmsgY29ycmVjdGx5LCBncmFiIHRoZSByZWZlcmVyIFVSTCxcbiAgICAgIC8vIHdoaWNoIHNob3VsZCBiZSB0aGUgVVJMIG9mIHRoZSBwYXJlbnQgKHJldHJpZXZhYmxlIGluIGNyb3NzLWRvbWFpbiBzZXR0aW5ncylcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50VXJsID0gZG9jdW1lbnQucmVmZXJyZXI7XG4gICAgICAvLyBJZiB3ZSBoYXZlIGEgcmVmZXJlciBVUkwsIHVzZSB0aGF0IGFzIHRoZSB0b3AgVVJMIGluIHRoaXMgY2FzZS5cbiAgICAgIC8vIE90aGVyd2lzZSwgdGhlcmUgbWF5IG5vdCBiZSBhIHJlZmVyZXIgdW5kZXIgY2VydGFpbiBjb25kaXRpb25zIGFuZCB3ZSBuZWVkIHRvIHVzZSB0aGUgY3VycmVudCBVUkxcbiAgICAgIGlmIChwYXJlbnRVcmwgIT09ICcnKSB7XG4gICAgICAgIHRvcFVybCA9IHBhcmVudFVybDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvcFVybCA9IGN1cnJlbnRVcmw7XG4gICAgICB9XG4gICAgICBkb21haW5DaGFpblN0cmluZyA9IGN1cnJlbnRVcmwgKyAnfHwnICsgcGFyZW50VXJsO1xuICAgICAgZGV0ZWN0aW9uTWV0aG9kID0gJ3JlZmVyZXInO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFmdGVyIGRldGVjdGlvbiwgZW5jb2RlIG91ciBkb21haW4gY2hhaW4gc3RyaW5nIGFuZCByZXR1cm4gZXZlcnl0aGluZy5cbiAgcmV0dXJuIHtcbiAgICBpbklmcmFtZTogaW5JZnJhbWUsXG4gICAgY3VycmVudFVybDogY3VycmVudFVybCxcbiAgICBwYXJlbnRVcmw6IHBhcmVudFVybCxcbiAgICB0b3BVcmw6IHRvcFVybCxcbiAgICBkZXRlY3Rpb25NZXRob2Q6IGRldGVjdGlvbk1ldGhvZCxcbiAgICBkb21haW5DaGFpblN0cmluZzogZG9tYWluQ2hhaW5TdHJpbmcsXG4gICAgZW5jb2RlZERvbWFpbkNoYWluU3RyaW5nOiBlbmNvZGVVUklDb21wb25lbnQoZG9tYWluQ2hhaW5TdHJpbmcpXG4gIH07XG59XG5cbi8vIHJldHVybnMgdGhlIFZpc3RhIHVybCBsb2FkZWQgaW4gdGhlIERPTVxuZXhwb3J0IGZ1bmN0aW9uIGdldFZwYWlkSlNXcmFwcGVyVXJsKCkge1xuICB2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKSB8fCBbXTtcbiAgdmFyIHZwYWlkSlNXcmFwcGVyVXJsID0gbnVsbDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNyYyA9IHNjcmlwdHNbaV0uZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICBpZiAoc3JjICYmIHNyYy5tYXRjaCgvXFwvdmlzdGFcXC5qcy8pKSB7XG4gICAgICB2cGFpZEpTV3JhcHBlclVybCA9IHNyYztcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB2cGFpZEpTV3JhcHBlclVybDtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBwYXJzZVhtbCh4bWwpIHtcbiAgLy8gY3Jvc3MgYnJvd3NlciB4bWwgcGFyc2luZyBzaGltXG4gIGlmICh0eXBlb2Ygd2luZG93LkRPTVBhcnNlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gKG5ldyB3aW5kb3cuRE9NUGFyc2VyKCkpLnBhcnNlRnJvbVN0cmluZyh4bWwsICd0ZXh0L3htbCcpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cuQWN0aXZlWE9iamVjdCAhPT0gJ3VuZGVmaW5lZCcgJiYgbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MRE9NJykpIHtcbiAgICBjb25zdCB4bWxEb2MgPSBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxET00nKTtcbiAgICB4bWxEb2MuYXN5bmMgPSAnZmFsc2UnO1xuICAgIHhtbERvYy5sb2FkWE1MKHhtbCk7XG4gICAgcmV0dXJuIHhtbERvYztcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIFhNTCBwYXJzZXIgZm91bmQnKTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgRGlhZyBmcm9tICcuL2RpYWcnO1xuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuL2V2ZW50L2V2ZW50X2hhbmRsZXInO1xuaW1wb3J0IHtnZXRWcGFpZEpTV3JhcHBlclVybH0gZnJvbSAnLi91dGlsL3VybCc7XG5pbXBvcnQgcGFyc2VBZCBmcm9tICcuL2FkX3BhcnNlci9pbmRleC5qcyc7XG5pbXBvcnQgcGFyc2VRdWVyeVBhcmFtcyBmcm9tICcuL3V0aWwvcXVlcnlfcGFyYW1zJztcbmltcG9ydCBQaXBCb3kgZnJvbSAnLi9waXBfYm95JztcbmltcG9ydCBQcm9ncmVzc0V2ZW50cyBmcm9tICcuL3Byb2dyZXNzX2V2ZW50cyc7XG5pbXBvcnQgVnBhaWRIYW5kbGVyIGZyb20gJy4vdnBhaWRfaGFuZGxlcic7XG5cbi8vIGltcG9ydCBXYXRjaCBmcm9tICcuL3dhdGNoJztcblxuLy8gY29uc29sZSBzaGltIGZvciBJRTlcbi8qZXNsaW50LWRpc2FibGUqL1xuaWYgKHR5cGVvZiBjb25zb2xlID09PSAndW5kZWZpbmVkJykge1xuICBjb25zb2xlID0ge1xuICAgIGxvZzogZnVuY3Rpb24oKSB7fVxuICB9O1xufVxuLyplc2xpbnQtZW5hYmxlKi9cblxuY29uc3QgdnBhaWRKU1dyYXBwZXJVcmwgPSBnZXRWcGFpZEpTV3JhcHBlclVybCgpO1xuY29uc3QgcXVlcnlQYXJhbXMgPSBwYXJzZVF1ZXJ5UGFyYW1zKHZwYWlkSlNXcmFwcGVyVXJsKTtcbmNvbnN0IHBpcEJveSA9IG5ldyBQaXBCb3kocXVlcnlQYXJhbXMpO1xuXG4vLyBGaXJlICdWaXN0YSBKYXZhU2NyaXB0IGZpbGUgbG9hZGVkJyAoMzAwKSBwaXhlbFxucGlwQm95LmZpcmVCZWhhdmlvcignbG9hZGVkRmlsZScpO1xuLy8gZmlyZVVzZXJNYXBwaW5nUGl4ZWxzKHF1ZXJ5UGFyYW1zKTtcblxuY2xhc3MgVmlzdGEge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnZpZGVvU2xvdCA9IG51bGw7XG4gICAgdGhpcy5kZWJ1ZyA9IHF1ZXJ5UGFyYW1zLmRlYnVnIHx8IGZhbHNlO1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnN0b3BBZENhbGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuZXJyb3JUaW1lb3V0ID0gbnVsbDtcbiAgICB0aGlzLnByb2dyZXNzRXZlbnRzID0gbmV3IFByb2dyZXNzRXZlbnRzKCk7XG4gICAgdGhpcy5ldmVudEhhbmRsZXIgPSBuZXcgRXZlbnRIYW5kbGVyKHtwaXBCb3k6IHBpcEJveX0pO1xuICAgIHRoaXMudnBhaWRIYW5kbGVyID0gbmV3IFZwYWlkSGFuZGxlcih0aGlzLmV2ZW50SGFuZGxlcik7XG4gICAgdGhpcy5kaWFnID0gbnVsbDtcbiAgICB0aGlzLnByb3BzID0gbnVsbDtcbiAgICB0aGlzLndhdGNoID0gbnVsbDtcblxuICAgIHRoaXMuZXZlbnRIYW5kbGVyLmFkZEludGVybmFsU3Vic2NyaWJlcihlID0+IHtcbiAgICAgIHRoaXMuX3dhdGNoTG9nKHtlcnJvcjogZX0pO1xuICAgICAgdGhpcy5fY2xlYW5VcCgpO1xuICAgIH0sICdBZEVycm9yJyk7XG5cbiAgICB3aW5kb3cub25lcnJvciA9IChtZXNzYWdlLCB1cmwsIGxpbmUsIGNvbCwgZSkgPT4ge1xuICAgICAgaWYgKHZwYWlkSlNXcmFwcGVyVXJsID09PSB1cmwpIHtcbiAgICAgICAgdGhpcy5kaWFnICYmIHRoaXMuZGlhZy5maXJlKCdWSVNUQV9VTkNBVUdIVF9FUlJPUicsICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9hZEVycm9yKCdWaXN0YSBlcnJvciBvY2N1cnJlZDogJyArIG1lc3NhZ2UpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGlhZyAmJiB0aGlzLmRpYWcuZmlyZSgnUFVCTElTSEVSX1VOQ0FVR0hUX0VSUk9SJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIFN0YXRlcyBmb3Igc2tpcCBwcmV2ZW50aW9uXG4gICAgbGV0IE5PUk1BTCA9IDA7IC8vIE5vcm1hbCB2aWRlbyBwbGF5YmFja1xuICAgIGxldCBTRUVLSU5HID0gMTsgLy8gUGxheWhlYWQgaXMgYmVpbmcgbW92ZWQgYnkgYSAzcmQgcGFydHlcbiAgICBsZXQgRklYSU5HX1BMQVlIRUFEID0gMjsgLy8gV2UncmUgbW92aW5nIHRoZSBwbGF5aGVhZCBiYWNrXG5cbiAgICBsZXQgc2Vla2luZ1N0YXRlID0gTk9STUFMO1xuICAgIGxldCBmaXJlZFN0YXJ0ID0gZmFsc2U7XG4gICAgbGV0IGZpcmVkSW1wcmVzc2lvbiA9IGZhbHNlO1xuXG4gICAgdGhpcy5zbG90TGlzdGVuZXJzID0ge1xuICAgICAgdGltZXVwZGF0ZTogKCkgPT4ge1xuICAgICAgICBpZiAoc2Vla2luZ1N0YXRlID09PSBOT1JNQUwpIHtcbiAgICAgICAgICBpZiAoIWZpcmVkSW1wcmVzc2lvbiAmJiB0aGlzLnZpZGVvU2xvdC5jdXJyZW50VGltZSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbGxFdmVudCgnQWRJbXByZXNzaW9uJyk7XG4gICAgICAgICAgICBmaXJlZEltcHJlc3Npb24gPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9jYWxsRXZlbnQoJ0FkUmVtYWluaW5nVGltZUNoYW5nZScpO1xuICAgICAgICAgIHRoaXMucHJvZ3Jlc3NFdmVudHMuY2hlY2tBbmRGaXJlKHRoaXMudmlkZW9TbG90LmN1cnJlbnRUaW1lLCB0aGlzLnZpZGVvU2xvdC5kdXJhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBwbGF5OiAoKSA9PiB7XG4gICAgICAgIGlmIChzZWVraW5nU3RhdGUgPT09IFNFRUtJTkcpIHtcbiAgICAgICAgICB0aGlzLnZpZGVvU2xvdC5jdXJyZW50VGltZSA9IDAuMDtcbiAgICAgICAgICBzZWVraW5nU3RhdGUgPSBGSVhJTkdfUExBWUhFQUQ7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBwbGF5aW5nOiAoKSA9PiB7XG4gICAgICAgIGlmICghZmlyZWRTdGFydCkge1xuICAgICAgICAgIGlmICh0aGlzLnZpZGVvU2xvdC5zcmMgIT09IHVuZGVmaW5lZCAmJiB0aGlzLmRpYWcgJiYgdGhpcy5kaWFnLmFkUGFyYW1zKSB7XG4gICAgICAgICAgICB0aGlzLmRpYWcuYWRQYXJhbXMuc2VsZWN0ZWRGaWxlVHlwZSA9IHRoaXMuX2dldE1lZGlhRmlsZVR5cGUodGhpcy52aWRlb1Nsb3Quc3JjKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fY2FsbEV2ZW50KCdBZFN0YXJ0ZWQnKTtcbiAgICAgICAgICBmaXJlZFN0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNlZWtpbmc6ICgpID0+IHtcbiAgICAgICAgaWYgKHNlZWtpbmdTdGF0ZSA9PT0gTk9STUFMKSB7XG4gICAgICAgICAgc2Vla2luZ1N0YXRlID0gU0VFS0lORztcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNlZWtlZDogKCkgPT4ge1xuICAgICAgICAvLyBDaGFuZ2luZyB0aGUgY3VycmVudCB0aW1lIGJhY2sgdG8gdGhlIG9sZCBvbmUgdHJpZ2dlcnMgYSBzZWVraW5nIGV2ZW50LCBkZWFsIHdpdGggaXQgaGVyZVxuICAgICAgICBpZiAoc2Vla2luZ1N0YXRlID09PSBGSVhJTkdfUExBWUhFQUQpIHtcbiAgICAgICAgICBzZWVraW5nU3RhdGUgPSBOT1JNQUw7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBlbmRlZDogKCkgPT4ge1xuICAgICAgICBpZiAoc2Vla2luZ1N0YXRlID09PSBOT1JNQUwpIHtcbiAgICAgICAgICAvLyBDYXRjaCBwcm9ncmVzcyBwaXhlbHMgYmV0d2VlbiB0aGUgbGFzdCB0aW1ldXBkYXRlIGV2ZW50IGFuZCB0aGUgZW5kIG9mIHRoZSB2aWRlb1xuICAgICAgICAgIHRoaXMucHJvZ3Jlc3NFdmVudHMuY2hlY2tBbmRGaXJlKHRoaXMudmlkZW9TbG90LmN1cnJlbnRUaW1lLCB0aGlzLnZpZGVvU2xvdC5kdXJhdGlvbiwgW10sICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2NhbGxFdmVudCgnQWRWaWRlb0NvbXBsZXRlJywgW10sICgpID0+IHtcbiAgICAgICAgICAgICAgLy8gQWZ0ZXIgd2UgZmluaXNoIHBlcmZvcm1pbmcgQWRWaWRlb0NvbXBsZXRlIGNhbGxiYWNrcywgbWFrZSB0aGlzIGNoZWNrXG4gICAgICAgICAgICAgIGlmICghdGhpcy5zdG9wQWRDYWxsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGVhblVwKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FsbEV2ZW50KCdBZFN0b3BwZWQnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBsb2Fkc3RhcnQ6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQgJiYgdGhpcy52aWRlb1Nsb3QubmV0d29ya1N0YXRlID09PSBIVE1MTWVkaWFFbGVtZW50Lk5FVFdPUktfTk9fU09VUkNFKSB7XG4gICAgICAgICAgdGhpcy5fYWRFcnJvcignTm8gdmFsaWQgdmlkZW8gc291cmNlcyBmb3VuZCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGxvYWRlZG1ldGFkYXRhOiAoKSA9PiB7XG4gICAgICAgIC8vIFdlIGp1c3QgZ290IGR1cmF0aW9uIGRhdGEgZnJvbSB0aGUgdmlkZW8sIGxldCB0aGUgcGxheWVyIGtub3dcbiAgICAgICAgdGhpcy5fY2FsbEV2ZW50KCdBZER1cmF0aW9uQ2hhbmdlJyk7XG4gICAgICB9LFxuICAgICAgY2FucGxheTogKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnY2FucGxheSBoYXBwZW5lZCEnKTtcbiAgICAgIH0sXG4gICAgICBjbGljazogKCkgPT4geyB0aGlzLl9vbkNsaWNrKCk7IH0sXG4gICAgICBjb250ZXh0bWVudTogZXZlbnQgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuZGlhZyAmJiB0aGlzLmRpYWcuZmlyZSgnVklERU9fU0xPVF9FUlJPUicsICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9hZEVycm9yKCdFcnJvciBvY2N1cnJlZCB3aGVuIHBsYXlpbmcgdmlkZW8gd2l0aCBjb2RlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKHRoaXMudmlkZW9TbG90LmVycm9yICYmIHRoaXMudmlkZW9TbG90LmVycm9yLmNvZGUpKTtcbiAgICAgICAgfSwgdGhpcy52aWRlb1Nsb3QuZXJyb3IgJiYgdGhpcy52aWRlb1Nsb3QuZXJyb3IuY29kZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIF93YXRjaExvZyhtZXNzYWdlKSB7XG4gICAgaWYgKHRoaXMuZGVidWcgJiYgdGhpcy53YXRjaCkge1xuICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICAvLyB0aGlzLndhdGNoLmxvZyhtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBfY2FsbEV2ZW50KGUsIHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICBjb25zb2xlLmxvZygnY2FsbGluZyBldmVudCAnICsgZSk7XG4gICAgaWYgKGNvbmZpZy5zY291dFdhdGNoU2hvdWxkRmlyZVtlXSkge1xuICAgICAgdGhpcy5fd2F0Y2hMb2coe2V2ZW50OiBlfSk7XG4gICAgfVxuICAgIHRoaXMuZXZlbnRIYW5kbGVyLmZpcmUoZSwgcGFyYW1zLCB7XG4gICAgICBhZFRpbWU6IHRoaXMudmlkZW9TbG90ICYmIHRoaXMudmlkZW9TbG90LmN1cnJlbnRUaW1lLFxuICAgICAgYWREdXJhdGlvbjogdGhpcy52aWRlb1Nsb3QgJiYgdGhpcy52aWRlb1Nsb3QuZHVyYXRpb25cbiAgICB9LCBjYWxsYmFjayk7XG4gIH1cblxuICBfdHJhY2tNZXRob2QobWV0aG9kKSB7XG4gICAgcGlwQm95LmZpcmVNZXRob2QobWV0aG9kKTtcbiAgfVxuXG4gIF9hZEVycm9yKG1lc3NhZ2UpIHtcbiAgICB0aGlzLl9jYWxsRXZlbnQoJ0FkRXJyb3InLCBbbWVzc2FnZV0pO1xuICB9XG5cbiAgX3NldFRyYWNraW5nUGl4ZWxzKHBpeGVscykge1xuICAgIHBpeGVscy5mb3JFYWNoKHBpeGVsID0+IHtcbiAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IHBpeGVsLmV2ZW50O1xuICAgICAgY29uc3QgdXJsID0gcGl4ZWwudXJsO1xuICAgICAgaWYgKCFldmVudE5hbWUgfHwgIXVybCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoZXZlbnROYW1lID09PSAncHJvZ3Jlc3MnICYmIHBpeGVsLm9mZnNldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHBpeGVsLm9mZnNldDtcbiAgICAgICAgc3dpdGNoIChvZmZzZXQudHlwZSkge1xuICAgICAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgICAgICAgdGhpcy5wcm9ncmVzc0V2ZW50cy5hZGRVUkkodXJsLCBvZmZzZXQub2Zmc2V0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgICAgICAgdGhpcy5wcm9ncmVzc0V2ZW50cy5hZGRVUklQZXJjZW50YWdlKHVybCwgb2Zmc2V0Lm9mZnNldCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX3NldFBsYXliYWNrRXZlbnRzKCkge1xuICAgIGNvbnN0IHBsYXliYWNrRXZlbnRzID0ge1xuICAgICAgQWRWaWRlb1N0YXJ0OiAwLFxuICAgICAgQWRWaWRlb0ZpcnN0UXVhcnRpbGU6IDI1LFxuICAgICAgQWRWaWRlb01pZHBvaW50OiA1MCxcbiAgICAgIEFkVmlkZW9UaGlyZFF1YXJ0aWxlOiA3NVxuICAgIH07XG4gICAgZm9yIChsZXQgZSBpbiBwbGF5YmFja0V2ZW50cykge1xuICAgICAgdGhpcy5wcm9ncmVzc0V2ZW50cy5hZGRMaXN0ZW5lclBlcmNlbnRhZ2UoKChldmVudCkgPT4ge1xuICAgICAgICByZXR1cm4gKCkgPT4geyB0aGlzLl9jYWxsRXZlbnQoZXZlbnQpOyB9O1xuICAgICAgfSkoZSksIHBsYXliYWNrRXZlbnRzW2VdKTtcbiAgICB9XG4gIH1cblxuICBfc2V0VmlkZW9Tb3VyY2VzKHZpZGVvcywgZGVidWdEYXRhKSB7XG4gICAgY29uc29sZS5sb2coJ3NldHRpbmcgc291cmNlcycpO1xuICAgIGlmICh2aWRlb3MpIHtcbiAgICAgIGxldCBzZWxlY3RlZFZpZGVvID0gbnVsbDtcbiAgICAgIHZpZGVvcy5zb21lKHZpZGVvID0+IHtcbiAgICAgICAgY29uc3QgY2FuUGxheSA9IHRoaXMudmlkZW9TbG90LmNhblBsYXlUeXBlKHZpZGVvLm1pbWV0eXBlKTtcbiAgICAgICAgaWYgKGNhblBsYXkgPT09ICdwcm9iYWJseScpIHtcbiAgICAgICAgICBzZWxlY3RlZFZpZGVvID0gdmlkZW87XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhblBsYXkgPT09ICdtYXliZScgJiYgIXNlbGVjdGVkVmlkZW8pIHtcbiAgICAgICAgICBzZWxlY3RlZFZpZGVvID0gdmlkZW87XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKHNlbGVjdGVkVmlkZW8pIHtcbiAgICAgICAgdGhpcy52aWRlb1Nsb3Quc3JjID0gc2VsZWN0ZWRWaWRlby51cmw7XG4gICAgICAgIHJldHVybiBzZWxlY3RlZFZpZGVvLnVybDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3dhdGNoTG9nKHtcbiAgICAgICAgICBmb3VuZE5vQ29tcGF0aWJsZTogdmlkZW9zLmxlbmd0aCxcbiAgICAgICAgICBzb3VyY2VzOiB2aWRlb3MubWFwKHZpZCA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdmlkLm1pbWV0eXBlICsgJzonICsgdmlkLnVybCAmJiB2aWQudXJsLnNsaWNlKDAsIDI1NSkgKyAnOicgKyB2aWQuYXBpRnJhbWV3b3JrO1xuICAgICAgICAgIH0pLmpvaW4oKSxcbiAgICAgICAgICBvZ1VyaTogZGVidWdEYXRhICYmIGRlYnVnRGF0YS52YXN0VXJpICYmIGRlYnVnRGF0YS52YXN0VXJpLnNsaWNlKDAsIDI1NSlcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2FkRXJyb3IoJ05PX0NPTVBBVElCTEVfVklERU8nKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYWRFcnJvcignTm8gdmlkZW9zJyk7XG4gICAgfVxuICB9XG5cbiAgX2dldE1lZGlhRmlsZVR5cGUodXJsKSB7XG4gICAgLy8gdGhpcyByZW1vdmVzIHRoZSBhbmNob3IgYXQgdGhlIGVuZCwgaWYgdGhlcmUgaXMgb25lXG4gICAgdXJsID0gdXJsLnN1YnN0cmluZygwLCAodXJsLmluZGV4T2YoJyMnKSA9PT0gLTEpID8gdXJsLmxlbmd0aCA6IHVybC5pbmRleE9mKCcjJykpO1xuICAgIC8vIHRoaXMgcmVtb3ZlcyB0aGUgcXVlcnkgYWZ0ZXIgdGhlIGZpbGUgbmFtZSwgaWYgdGhlcmUgaXMgb25lXG4gICAgdXJsID0gdXJsLnN1YnN0cmluZygwLCAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEpID8gdXJsLmxlbmd0aCA6IHVybC5pbmRleE9mKCc/JykpO1xuICAgIC8vIHRoaXMgcmVtb3ZlcyBldmVyeXRoaW5nIGJlZm9yZSB0aGUgbGFzdCBzbGFzaCBpbiB0aGUgcGF0aFxuICAgIHVybCA9IHVybC5zdWJzdHJpbmcodXJsLmxhc3RJbmRleE9mKCcvJykgKyAxLCB1cmwubGVuZ3RoKTtcbiAgICAvLyB0aGlzIHJldHVybiB0aGUgdHlwZSBvZiB0aGUgZmlsZVxuICAgIHZhciB0eXBlID0gdXJsLnN1YnN0cmluZyh1cmwubGFzdEluZGV4T2YoJy4nKSArIDEsIHVybC5sZW5ndGgpO1xuICAgIGlmICh1cmwgIT09IHR5cGUgJiYgdHlwZS5sZW5ndGggPCA1KSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG4gIH1cblxuICAvLyB2aWRlb1dpZHRoIC8gdmlkZW9IZWlnaHQgYXJlICd0cnVlJyB2aWRlbyBzaXplLCBub3Qgc2V0dGFibGVcbiAgLy8gd2lkdGggLyBoZWlnaHQgY29udHJvbCB3aGF0IHdlIHNlZSwgYXJlIHNldHRhYmxlXG5cbiAgX3NldEFkU2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgaWYgKHRoaXMudmlkZW9TbG90KSB7XG4gICAgICB0aGlzLnZpZGVvU2xvdC53aWR0aCA9IHdpZHRoO1xuICAgICAgdGhpcy52aWRlb1Nsb3QuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgdGhpcy5fY2FsbEV2ZW50KCdBZFNpemVDaGFuZ2UnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ05vIHZpZGVvU2xvdCcpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkNsaWNrKCkge1xuICAgIGlmICghdGhpcy52aWRlb1Nsb3QucGF1c2VkKSB7XG4gICAgICBjb25zb2xlLmxvZygnY2xpY2tlZCEnKTtcbiAgICAgIGNvbnN0IHVybCA9IHRoaXMucHJvcHMuYWRQYXJhbWV0ZXJzLnZpZGVvQ2xpY2tzLmNsaWNrVGhyb3VnaDtcbiAgICAgIHRoaXMuX2NhbGxFdmVudCgnQWRDbGlja1RocnUnLCBbdXJsIHx8IG51bGwsICcnLCBmYWxzZV0pO1xuICAgICAgd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudmlkZW9TbG90LnBsYXkoKTtcbiAgICB9XG4gIH1cblxuICBfY2xlYW5VcCgpIHtcbiAgICBpZiAodGhpcy52aWRlb1Nsb3QpIHtcbiAgICAgIGZvciAobGV0IGV2IGluIHRoaXMuc2xvdExpc3RlbmVycykge1xuICAgICAgICB0aGlzLnZpZGVvU2xvdC5yZW1vdmVFdmVudExpc3RlbmVyICYmIHRoaXMudmlkZW9TbG90LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXYsIHRoaXMuc2xvdExpc3RlbmVyc1tldl0sIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuZXJyb3JUaW1lb3V0KSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuZXJyb3JUaW1lb3V0KTtcbiAgICB9XG4gICAgdGhpcy5wcm9ncmVzc0V2ZW50cyA9IG5ldyBQcm9ncmVzc0V2ZW50cygpO1xuICB9XG5cbiAgX3JlYWRGZWF0dXJlcyhkYXRhKSB7XG4gICAgZGF0YS5mZWF0dXJlcy5mb3JFYWNoKGYgPT4ge1xuICAgICAgc3dpdGNoIChmKSB7XG4gICAgICAgIGNhc2UgJ2RlYnVnJzpcbiAgICAgICAgICB0aGlzLmRlYnVnID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGluaXRBZCh3aWR0aCwgaGVpZ2h0LCB2aWV3TW9kZSwgZGVzaXJlZEJpdHJhdGUsIGNyZWF0aXZlRGF0YSwgZW52aXJvbm1lbnRWYXJzKSB7XG4gICAgdGhpcy5fdHJhY2tNZXRob2QoJ2luaXRBZCcpO1xuICAgICAvLyBjb25zb2xlLmxvZygnaW5pdEFkICcgKyB3aWR0aCArICd4JyArIGhlaWdodCArICcgJyArIHZpZXdNb2RlICsgJyAnICsgZGVzaXJlZEJpdHJhdGUgK1xuICAgICAvLyAnICcgKyBjcmVhdGl2ZURhdGEpO1xuXG4gICAgLy8gZG9uJ3QgdXNlIHNsaWNlIG9uIGFyZ3VtZW50cywgbWVzc2VzIHdpdGggb3B0aW1pemF0aW9uXG4gICAgY29uc3QgdnBhaWRBcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAvLyBpIGlzIGFsd2F5cyB2YWxpZCBpbmRleCBpbiB0aGUgYXJndW1lbnRzIG9iamVjdFxuICAgICAgdnBhaWRBcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGNvbnN0IGFmdGVyUGFyc2UgPSAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICB0aGlzLmRpYWcgPSBuZXcgRGlhZyhkYXRhKTtcblxuICAgICAgaWYgKGVycikge1xuICAgICAgICB0aGlzLl9hZEVycm9yKGVyci5tZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb3BzID0gZ2V0RGVmYXVsdFByb3BzKCk7XG4gICAgICB0aGlzLnByb3BzLndpZHRoID0gd2lkdGg7XG4gICAgICB0aGlzLnByb3BzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgIHRoaXMucHJvcHMudmlld01vZGUgPSB2aWV3TW9kZTtcbiAgICAgIHRoaXMucHJvcHMuZGVzaXJlZEJpdHJhdGUgPSBkZXNpcmVkQml0cmF0ZTtcblxuICAgICAgdGhpcy52aWRlb1Nsb3QgPSBlbnZpcm9ubWVudFZhcnMudmlkZW9TbG90O1xuICAgICAgdGhpcy5fdmlkZW9TbG90Q2FuQXV0b1BsYXkgPSBlbnZpcm9ubWVudFZhcnMudmlkZW9TbG90Q2FuQXV0b1BsYXk7XG5cbiAgICAgIGlmICghdGhpcy52aWRlb1Nsb3QpIHtcbiAgICAgICAgdGhpcy5kaWFnLmZpcmUoJ05PX1ZJREVPX1NMT1QnLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fYWRFcnJvcignTm8gdmlkZW8gc2xvdCEnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnZpZGVvU2xvdC52b2x1bWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMudmlkZW9TbG90LnZvbHVtZSA9IHRoaXMudmlkZW9TbG90Lm11dGVkID8gMCA6IDE7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnZpZGVvU2xvdC5zdHlsZSkge1xuICAgICAgICB0aGlzLnZpZGVvU2xvdC5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNsb3QgPSBlbnZpcm9ubWVudFZhcnMuc2xvdDtcbiAgICAgIGlmIChzbG90KSB7XG4gICAgICAgIHNsb3Quc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICBzbG90LnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgICAgICBzbG90LnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICAgICAgc2xvdC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHNsb3Quc3R5bGVbJ3otaW5kZXgnXSA9ICcxMDAnO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnZpZGVvU2xvdC5hdXRvcGxheSA9IGZhbHNlO1xuICAgICAgdGhpcy5fcmVhZEZlYXR1cmVzKGRhdGEpO1xuICAgICAgdGhpcy5wcm9wcy5hZFBhcmFtZXRlcnMgPSBkYXRhO1xuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAvLyBvdGhlcndpc2UgLmhlaWdodCBhbmQgLndpZHRoIGFyZSAwLCBldmVuIHRob3VnaCB2aXN1YWxseSB0aGV5IGFyZSBub3RcbiAgICAgIHRoaXMudmlkZW9TbG90LndpZHRoID0gdGhpcy5wcm9wcy53aWR0aDtcbiAgICAgIHRoaXMudmlkZW9TbG90LmhlaWdodCA9IHRoaXMucHJvcHMuaGVpZ2h0O1xuXG4gICAgICAvLyB0aGlzLndhdGNoID0gbmV3IFdhdGNoKGRhdGEpO1xuXG4gICAgICBwaXBCb3kuaW5pdChkYXRhKTtcblxuICAgICAgdGhpcy5ldmVudEhhbmRsZXIuaW5pdCh7XG4gICAgICAgIGFkUGFyYW1zOiBkYXRhLFxuICAgICAgICB2cGFpZEpTV3JhcHBlcjogdGhpcyxcbiAgICAgICAgc2xvdDogc2xvdCxcbiAgICAgICAgZGlhZzogdGhpcy5kaWFnXG4gICAgICB9KTtcblxuICAgICAgaWYgKHRoaXMucHJvcHMuYWRQYXJhbWV0ZXJzLnBpeGVscykgeyB0aGlzLl9zZXRUcmFja2luZ1BpeGVscyh0aGlzLnByb3BzLmFkUGFyYW1ldGVycy5waXhlbHMpOyB9XG4gICAgICB0aGlzLl9zZXRQbGF5YmFja0V2ZW50cygpO1xuXG4gICAgICBpZiAodGhpcy5wcm9wcy5hZFBhcmFtZXRlcnMuc291cmNlcykge1xuICAgICAgICBjb25zdCB2cGFpZFNvdXJjZSA9IGdldFZQQUlEU291cmNlKHRoaXMucHJvcHMuYWRQYXJhbWV0ZXJzLnNvdXJjZXMpO1xuICAgICAgICBpZiAodnBhaWRTb3VyY2UgIT09IG51bGwpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZwYWlkQXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgLy8gaSBpcyBhbHdheXMgdmFsaWQgaW5kZXggaW4gdGhlIGFyZ3VtZW50cyBvYmplY3RcbiAgICAgICAgICAgIGlmICh2cGFpZEFyZ3NbaV0gPT09IGNyZWF0aXZlRGF0YSkge1xuICAgICAgICAgICAgICB2cGFpZEFyZ3NbaV0gPSB7QWRQYXJhbWV0ZXJzOiB0aGlzLnByb3BzLmFkUGFyYW1ldGVycy50aGlyZFBhcnR5QWRQYXJhbXN9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnZwYWlkSGFuZGxlci5sb2FkVlBBSURBZCh2cGFpZFNvdXJjZSwgdGhpcy52aWRlb1Nsb3QsIHRoaXMucHJvcHMsIHRoaXMuZGVidWcsIHRoaXMud2F0Y2gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaWFnLCB0aGlzLnByb2dyZXNzRXZlbnRzLCB2cGFpZEFyZ3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgdG8gdmlkZW9TbG90XG4gICAgICAgICAgZm9yIChsZXQgZXYgaW4gdGhpcy5zbG90TGlzdGVuZXJzKSB7XG4gICAgICAgICAgICB0aGlzLnZpZGVvU2xvdC5hZGRFdmVudExpc3RlbmVyKGV2LCB0aGlzLnNsb3RMaXN0ZW5lcnNbZXZdLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzbG90KSB7XG4gICAgICAgICAgICBzbG90LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4geyB0aGlzLl9vbkNsaWNrKCk7IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB1cmwgPSB0aGlzLl9zZXRWaWRlb1NvdXJjZXModGhpcy5wcm9wcy5hZFBhcmFtZXRlcnMuc291cmNlcywgdGhpcy5wcm9wcy5hZFBhcmFtZXRlcnMuZGVidWdEYXRhKTtcbiAgICAgICAgICBpZiAoIXVybCkge1xuICAgICAgICAgICAgdGhpcy5kaWFnLmZpcmUoJ05PX0NPTVBBVElCTEVfVklERU8nLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuX2FkRXJyb3IoJ05PX0NPTVBBVElCTEVfVklERU8nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnZpZGVvU2xvdC5sb2FkKCk7XG4gICAgICAgICAgdGhpcy5fY2FsbEV2ZW50KCdBZExvYWRlZCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxldCBhZFBhcmFtcztcbiAgICBpZiAodHlwZW9mIGNyZWF0aXZlRGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIFNvbWUgcGxheWVycyBwYXNzIGluIGEgc3RyaW5nXG4gICAgICBhZFBhcmFtcyA9IGNyZWF0aXZlRGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIFZQQUlEIHNwZWMgc2F5cyB0byBleHBlY3QgYW4gb2JqZWN0IHdpdGggdGhlIGBBZFBhcmFtZXRlcnNgIGtleVxuICAgICAgYWRQYXJhbXMgPSBjcmVhdGl2ZURhdGEuQWRQYXJhbWV0ZXJzO1xuICAgIH1cblxuICAgIHBhcnNlQWQoYWRQYXJhbXMsIGFmdGVyUGFyc2UpO1xuICB9XG5cbiAgaGFuZHNoYWtlVmVyc2lvbih2ZXJzaW9uKSB7XG4gICAgdGhpcy5fdHJhY2tNZXRob2QoJ2hhbmRzaGFrZVZlcnNpb24nKTtcbiAgICBjb25zb2xlLmxvZygnaGFuZHNoYWtlIGNhbGxlZCcpO1xuICAgIHJldHVybiAnMi4wJztcbiAgfVxuXG4gIHN0YXJ0QWQoKSB7XG4gICAgdGhpcy5fdHJhY2tNZXRob2QoJ3N0YXJ0QWQnKTtcbiAgICB0aGlzLl93YXRjaExvZyh7dnBhaWQ6ICdzdGFydEFkJ30pO1xuICAgIGlmICh0aGlzLnZwYWlkSGFuZGxlci5oYXNBZCgpKSB7XG4gICAgICB0aGlzLnZwYWlkSGFuZGxlci5zdGFydEFkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMudmlkZW9TbG90LnBsYXkoKTtcbiAgICB0aGlzLmVycm9yVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcGlwQm95LmZpcmVFcnJvcignYWRQbGF5YmFja1RpbWVkT3V0Jyk7XG4gICAgICB0aGlzLl9hZEVycm9yKCdBZCBwbGF5YmFjayB0aW1lZCBvdXQnKTtcbiAgICB9LCBjb25maWcuYWRQbGF5YmFja1RpbWVvdXQpO1xuICB9XG5cbiAgc3RvcEFkKCkge1xuICAgIHRoaXMuX3RyYWNrTWV0aG9kKCdzdG9wQWQnKTtcbiAgICB0aGlzLl93YXRjaExvZyh7dnBhaWQ6ICdzdG9wQWQnfSk7XG4gICAgaWYgKHRoaXMudnBhaWRIYW5kbGVyLmhhc0FkKCkpIHtcbiAgICAgIHRoaXMudnBhaWRIYW5kbGVyLnN0b3BBZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnZpZGVvU2xvdCAmJiB0aGlzLnZpZGVvU2xvdC5wYXVzZSgpO1xuICAgIHRoaXMuX2NsZWFuVXAoKTtcbiAgICB0aGlzLnByb2dyZXNzRXZlbnRzID0gbmV3IFByb2dyZXNzRXZlbnRzKCk7XG4gICAgdGhpcy5zdG9wQWRDYWxsZWQgPSB0cnVlO1xuICAgIHRoaXMuX2NhbGxFdmVudCgnQWRTdG9wcGVkJyk7XG4gIH1cblxuICBzZXRBZFZvbHVtZSh2KSB7XG4gICAgdGhpcy5fd2F0Y2hMb2coe3ZwYWlkOiAnc2V0QWRWb2x1bWUnfSk7XG4gICAgaWYgKHYgPj0gMCAmJiB2IDw9IDEgJiYgdGhpcy52aWRlb1Nsb3QpIHtcbiAgICAgIHRoaXMucHJvcHMuYWRWb2x1bWUgPSB2O1xuICAgICAgaWYgKHRoaXMudnBhaWRIYW5kbGVyLmhhc0FkKCkpIHtcbiAgICAgICAgdGhpcy52cGFpZEhhbmRsZXIuc2V0QWRWb2x1bWUodik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnZpZGVvU2xvdC52b2x1bWUgPT09IDAgJiYgdiA+IDApIHtcbiAgICAgICAgdGhpcy5fY2FsbEV2ZW50KCd1bm11dGUnKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy52aWRlb1Nsb3Qudm9sdW1lID4gMCAmJiB2ID09PSAwKSB7XG4gICAgICAgIHRoaXMuX2NhbGxFdmVudCgnbXV0ZScpO1xuICAgICAgfVxuICAgICAgdGhpcy52aWRlb1Nsb3Qudm9sdW1lID0gdjtcbiAgICAgIHRoaXMuX2NhbGxFdmVudCgnQWRWb2x1bWVDaGFuZ2UnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0ludmFsaWQgdm9sdW1lICcsIHYpO1xuICAgIH1cbiAgfVxuXG4gIGdldEFkVm9sdW1lKCkge1xuICAgIGlmICh0aGlzLnZwYWlkSGFuZGxlci5oYXNBZCgpKSB7XG4gICAgICByZXR1cm4gdGhpcy52cGFpZEhhbmRsZXIuZ2V0QWRWb2x1bWUoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMudmlkZW9TbG90KSB7XG4gICAgICByZXR1cm4gdGhpcy52aWRlb1Nsb3Qudm9sdW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnTm8gdmlkZW9TbG90Jyk7XG4gICAgfVxuICB9XG5cbiAgcmVzaXplQWQod2lkdGgsIGhlaWdodCwgdmlld01vZGUpIHtcbiAgICBjb25zb2xlLmxvZygncmVzaXplQWQgJyArIHdpZHRoICsgJ3gnICsgaGVpZ2h0ICsgJyAnICsgdmlld01vZGUpO1xuICAgIHRoaXMuX3dhdGNoTG9nKHtcbiAgICAgIHZwYWlkOiAncmVzaXplQWQnLFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICB2aWV3TW9kZTogdmlld01vZGVcbiAgICB9KTtcbiAgICB0aGlzLl90cmFja01ldGhvZCgncmVzaXplQWQnKTtcblxuICAgIHRoaXMucHJvcHMudmlld01vZGUgPSB2aWV3TW9kZTtcbiAgICBpZiAodmlld01vZGUgIT09ICdmdWxsc2NyZWVuJykge1xuICAgICAgdGhpcy5wcm9wcy53aWR0aCA9IHdpZHRoO1xuICAgICAgdGhpcy5wcm9wcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICAgIGlmICh0aGlzLnZwYWlkSGFuZGxlci5oYXNBZCgpKSB7XG4gICAgICB0aGlzLnZwYWlkSGFuZGxlci5yZXNpemVBZCh3aWR0aCwgaGVpZ2h0LCB2aWV3TW9kZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLnZpZXdNb2RlICE9PSAnZnVsbHNjcmVlbicgJiYgdmlld01vZGUgPT09ICdmdWxsc2NyZWVuJykge1xuICAgICAgdGhpcy5fY2FsbEV2ZW50KCdmdWxsc2NyZWVuJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnZpZXdNb2RlID09PSAnZnVsbHNjcmVlbicgJiYgdmlld01vZGUgIT09ICdmdWxsc2NyZWVuJykge1xuICAgICAgdGhpcy5fY2FsbEV2ZW50KCdleGl0RnVsbHNjcmVlbicpO1xuICAgIH1cbiAgICB0aGlzLl9zZXRBZFNpemUod2lkdGgsIGhlaWdodCk7XG4gIH1cblxuICBwYXVzZUFkKCkge1xuICAgIHRoaXMuX3RyYWNrTWV0aG9kKCdwYXVzZUFkJyk7XG4gICAgdGhpcy5fd2F0Y2hMb2coe3ZwYWlkOiAncGF1c2VBZCd9KTtcbiAgICBpZiAodGhpcy52cGFpZEhhbmRsZXIuaGFzQWQoKSkge1xuICAgICAgdGhpcy52cGFpZEhhbmRsZXIucGF1c2VBZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZpZGVvU2xvdC5wYXVzZSgpO1xuICAgICAgdGhpcy5fY2FsbEV2ZW50KCdBZFBhdXNlZCcpO1xuICAgIH1cbiAgfVxuXG4gIHJlc3VtZUFkKCkge1xuICAgIHRoaXMuX3RyYWNrTWV0aG9kKCdyZXN1bWVBZCcpO1xuICAgIHRoaXMuX3dhdGNoTG9nKHt2cGFpZDogJ3Jlc3VtZUFkJ30pO1xuICAgIGlmICh0aGlzLnZwYWlkSGFuZGxlci5oYXNBZCgpKSB7XG4gICAgICB0aGlzLnZwYWlkSGFuZGxlci5yZXN1bWVBZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZpZGVvU2xvdC5wbGF5KCk7XG4gICAgICB0aGlzLl9jYWxsRXZlbnQoJ0FkUGxheWluZycpO1xuICAgIH1cbiAgfVxuXG4gIGV4cGFuZEFkKCkge1xuICAgIHRoaXMuX3RyYWNrTWV0aG9kKCdleHBhbmRBZCcpO1xuICAgIHRoaXMuX3dhdGNoTG9nKHt2cGFpZDogJ2V4cGFuZEFkJ30pO1xuICAgIGlmICh0aGlzLnZwYWlkSGFuZGxlci5oYXNBZCgpKSB7XG4gICAgICB0aGlzLnZwYWlkSGFuZGxlci5leHBhbmRBZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jYWxsRXZlbnQoJ0FkRXhwYW5kZWRDaGFuZ2UnKTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5hZEV4cGFuZGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGdldEFkRXhwYW5kZWQoKSB7XG4gICAgdGhpcy5fd2F0Y2hMb2coe3ZwYWlkOiAnZ2V0QWRFeHBhbmRlZCd9KTtcbiAgICByZXR1cm4gdGhpcy52cGFpZEhhbmRsZXIuaGFzQWQoKSA/IHRoaXMudnBhaWRIYW5kbGVyLmdldEFkRXhwYW5kZWQoKVxuICAgICAgOiB0aGlzLnByb3BzLmFkRXhwYW5kZWQ7XG4gIH1cblxuICBnZXRBZFNraXBwYWJsZVN0YXRlKCkge1xuICAgIHRoaXMuX3dhdGNoTG9nKHt2cGFpZDogJ2dldEFkU2tpcHBhYmxlU3RhdGUnfSk7XG4gICAgcmV0dXJuIHRoaXMudnBhaWRIYW5kbGVyLmhhc0FkKCkgPyB0aGlzLnZwYWlkSGFuZGxlci5nZXRBZFNraXBwYWJsZVN0YXRlKClcbiAgICAgIDogdGhpcy5wcm9wcy5hZFNraXBwYWJsZVN0YXRlO1xuICB9XG5cbiAgY29sbGFwc2VBZCgpIHtcbiAgICB0aGlzLl90cmFja01ldGhvZCgnY29sbGFwc2VBZCcpO1xuICAgIHRoaXMuX3dhdGNoTG9nKHt2cGFpZDogJ2NvbGxhcHNlQWQnfSk7XG4gICAgaWYgKHRoaXMudnBhaWRIYW5kbGVyLmhhc0FkKCkpIHtcbiAgICAgIHRoaXMudnBhaWRIYW5kbGVyLmNvbGxhcHNlQWQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2FsbEV2ZW50KCdBZEV4cGFuZGVkQ2hhbmdlJyk7XG4gICAgfVxuICAgIHRoaXMucHJvcHMuYWRFeHBhbmRlZCA9IGZhbHNlO1xuICB9XG5cbiAgc2tpcEFkKCkge1xuICAgIHRoaXMuX3RyYWNrTWV0aG9kKCdza2lwQWQnKTtcbiAgICB0aGlzLl93YXRjaExvZyh7dnBhaWQ6ICdza2lwQWQnfSk7XG4gICAgaWYgKHRoaXMudnBhaWRIYW5kbGVyLmhhc0FkKCkpIHtcbiAgICAgIHRoaXMudnBhaWRIYW5kbGVyLnNraXBBZCgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5hZFNraXBwYWJsZVN0YXRlKSB7XG4gICAgICB0aGlzLl9jYWxsRXZlbnQoJ0FkU2tpcHBlZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnQWQgaXMgbm90IHNraXBwYWJsZS4nKTtcbiAgICB9XG4gIH1cblxuICBzdWJzY3JpYmUoY2FsbGJhY2ssIGV2ZW50TmFtZSwgY29udGV4dCkge1xuICAgIHRoaXMuX3RyYWNrTWV0aG9kKCdzdWJzY3JpYmUnKTtcbiAgICB0aGlzLmV2ZW50SGFuZGxlci5hZGRFeHRlcm5hbFN1YnNjcmliZXIoY2FsbGJhY2ssIGV2ZW50TmFtZSwgY29udGV4dCk7XG4gICAgY29uc29sZS5sb2coJ1N1YnNjcmliZSAnICsgZXZlbnROYW1lKTtcbiAgfVxuXG4gIHVuc3Vic2NyaWJlKGNhbGxiYWNrLCBldmVudE5hbWUpIHtcbiAgICB0aGlzLmV2ZW50SGFuZGxlci5yZW1vdmVTdWJzY3JpYmVyKGNhbGxiYWNrLCBldmVudE5hbWUpO1xuICAgIHRoaXMuX3dhdGNoTG9nKHt2cGFpZDogJ3Vuc3Vic2NyaWJlJ30pO1xuICB9XG5cbiAgZ2V0QWRXaWR0aCgpIHtcbiAgICB0aGlzLl93YXRjaExvZyh7dnBhaWQ6ICdnZXRBZFdpZHRoJ30pO1xuICAgIGlmICh0aGlzLnZwYWlkSGFuZGxlci5oYXNBZCgpKSB7XG4gICAgICByZXR1cm4gdGhpcy52cGFpZEhhbmRsZXIuZ2V0QWRXaWR0aCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy52aWRlb1Nsb3QpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLndpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnTm8gdmlkZW9TbG90Jyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0QWRIZWlnaHQoKSB7XG4gICAgdGhpcy5fd2F0Y2hMb2coe3ZwYWlkOiAnZ2V0QWRIZWlnaHQnfSk7XG4gICAgaWYgKHRoaXMudnBhaWRIYW5kbGVyLmhhc0FkKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZwYWlkSGFuZGxlci5nZXRBZEhlaWdodCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy52aWRlb1Nsb3QpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmhlaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ05vIHZpZGVvU2xvdCcpO1xuICAgIH1cbiAgfVxuXG4gIGdldEFkUmVtYWluaW5nVGltZSgpIHtcbiAgICAvLyBkb24ndCB3YXRjaExvZyB0aGlzIGJlY2F1c2UgaXQncyB0b28gdmVyYm9zZVxuICAgIC8vIFJldHVybiAtMiBpZiBkdXJhdGlvbiBpbmZvcm1hdGlvbiBpc24ndCBhdmFpbGFibGUgKGZyb20gVlBBSUQgMi4wIHNwZWMsIDMuMi42KVxuICAgIHJldHVybiAhdGhpcy52aWRlb1Nsb3QgfHwgaXNOYU4odGhpcy52aWRlb1Nsb3QuZHVyYXRpb24pID8gLTJcbiAgICAgIDogdGhpcy52aWRlb1Nsb3QuZHVyYXRpb24gLSB0aGlzLnZpZGVvU2xvdC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldEFkRHVyYXRpb24oKSB7XG4gICAgdGhpcy5fd2F0Y2hMb2coe3ZwYWlkOiAnZ2V0QWREdXJhdGlvbid9KTtcbiAgICAvLyBSZXR1cm4gLTIgaWYgZHVyYXRpb24gaW5mb3JtYXRpb24gaXNuJ3QgYXZhaWxhYmxlIChmcm9tIFZQQUlEIDIuMCBzcGVjLCAzLjIuNylcbiAgICByZXR1cm4gIXRoaXMudmlkZW9TbG90IHx8IGlzTmFOKHRoaXMudmlkZW9TbG90LmR1cmF0aW9uKSA/IC0yIDogdGhpcy52aWRlb1Nsb3QuZHVyYXRpb247XG4gIH1cblxuICBnZXRBZENvbXBhbmlvbnMoKSB7XG4gICAgdGhpcy5fd2F0Y2hMb2coe3ZwYWlkOiAnZ2V0QWRDb21wYW5pb25zJ30pO1xuICAgIHJldHVybiB0aGlzLnByb3BzLmFkQ29tcGFuaW9ucztcbiAgfVxuXG4gIGdldEFkSWNvbnMoKSB7XG4gICAgdGhpcy5fd2F0Y2hMb2coe3ZwYWlkOiAnZ2V0QWRJY29ucyd9KTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5hZEljb25zO1xuICB9XG5cbiAgZ2V0QWRMaW5lYXIoKSB7XG4gICAgdGhpcy5fd2F0Y2hMb2coe3ZwYWlkOiAnZ2V0QWRMaW5lYXInfSk7XG4gICAgaWYgKHRoaXMudnBhaWRIYW5kbGVyLmhhc0FkKCkpIHtcbiAgICAgIHRoaXMucHJvcHMuYWRMaW5lYXIgPSB0aGlzLnZwYWlkSGFuZGxlci5nZXRBZExpbmVhcigpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm9wcy5hZExpbmVhcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRWUEFJRFNvdXJjZShzb3VyY2VzKSB7XG4gIGxldCB1cmwgPSBudWxsO1xuICBpZiAoc291cmNlcykge1xuICAgIHNvdXJjZXMuc29tZShzb3VyY2UgPT4ge1xuICAgICAgaWYgKFsnYXBwbGljYXRpb24vamF2YXNjcmlwdCcsICdhcHBsaWNhdGlvbi94LWphdmFzY3JpcHQnXS5pbmRleE9mKHNvdXJjZS5taW1ldHlwZSkgPiAtMSAmJlxuICAgICAgICAgIHNvdXJjZS5hcGlGcmFtZXdvcmsgPT09ICdWUEFJRCcpIHtcbiAgICAgICAgdXJsID0gc291cmNlLnVybDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHVybDtcbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICByZXR1cm4ge1xuICAgIGFkRXhwYW5kZWQ6IGZhbHNlLFxuICAgIGFkTGluZWFyOiB0cnVlLFxuICAgIGFkU2tpcHBhYmxlU3RhdGU6IGZhbHNlLFxuICAgIGFkQ29tcGFuaW9uczogJycsXG4gICAgYWRJY29uczogZmFsc2UsXG4gICAgYWRWb2x1bWU6IDFcbiAgfTtcbn1cblxuLyplc2xpbnQtZGlzYWJsZSAqL1xuY29uc3QgZ2V0VlBBSURBZCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBoID0gbmV3IFZpc3RhKCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBwaXBCb3kuZmlyZUJlaGF2aW9yKCdnZXRWUEFJREFkQ2FsbGVkJyk7XG4gICAgcmV0dXJuIGg7XG4gIH07XG59KCk7XG4vKmVzbGludC1lbmFibGUgKi9cblxuaWYgKHR5cGVvZiBURVNUICE9PSAndW5kZWZpbmVkJyAmJiBURVNUKSB7XG4gIGdldFZQQUlEQWQuVmlzdGEgPSBWaXN0YTtcbn1cblxubW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PT0gJ3VuZGVmaW5lZCcgPyB7fSA6IG1vZHVsZTtcbm1vZHVsZS5leHBvcnRzID0gZ2V0VlBBSURBZDtcblxucGlwQm95LmZpcmVCZWhhdmlvcignaW5zdGFudGlhdGVkVmlzdGEnKTtcbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuXG5jb25zdCBWUEFJRE1ldGhvZHMgPSBbXG4gICdoYW5kc2hha2VWZXJzaW9uJyxcbiAgJ2luaXRBZCcsXG4gICdzdGFydEFkJyxcbiAgJ3N0b3BBZCcsXG4gICdza2lwQWQnLFxuICAncmVzaXplQWQnLFxuICAncGF1c2VBZCcsXG4gICdyZXN1bWVBZCcsXG4gICdleHBhbmRBZCcsXG4gICdjb2xsYXBzZUFkJyxcbiAgJ3N1YnNjcmliZScsXG4gICd1bnN1YnNjcmliZSdcbl07XG5cbmNvbnN0IGVjaG9lZEV2ZW50cyA9IFtcbiAgJ0FkU2tpcHBlZCcsXG4gICdBZExpbmVhckNoYW5nZScsXG4gICdBZEV4cGFuZGVkQ2hhbmdlJyxcbiAgJ0FkU2tpcHBhYmxlU3RhdGVDaGFuZ2UnLFxuICAnQWREdXJhdGlvbkNoYW5nZScsXG4gICdBZFJlbWFpbmluZ1RpbWVDaGFuZ2UnLFxuICAnQWRWb2x1bWVDaGFuZ2UnLFxuICAnQWRJbXByZXNzaW9uJyxcbiAgJ0FkSW50ZXJhY3Rpb24nLFxuICAnQWRWaWRlb1N0YXJ0JyxcbiAgJ0FkVmlkZW9GaXJzdFF1YXJ0aWxlJyxcbiAgJ0FkVmlkZW9NaWRwb2ludCcsXG4gICdBZFZpZGVvVGhpcmRRdWFydGlsZScsXG4gICdBZFVzZXJBY2NlcHRJbnZpdGF0aW9uJyxcbiAgJ0FkVXNlck1pbmltaXplJyxcbiAgJ0FkVXNlckNsb3NlJ1xuXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVnBhaWRIYW5kbGVyIHtcbiAgY29uc3RydWN0b3IoZXZlbnRIYW5kbGVyKSB7XG4gICAgdGhpcy5ldmVudEhhbmRsZXIgPSBldmVudEhhbmRsZXI7XG4gICAgdGhpcy5pRnJhbWU7XG4gICAgdGhpcy5hZFVuaXQ7XG4gICAgdGhpcy5hZER1cmF0aW9uO1xuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuXG4gICAgLy8gZnJvbSBIb3Jpem9uXG4gICAgdGhpcy52aWRlb1Nsb3QgPSBudWxsO1xuICAgIHRoaXMud2F0Y2ggPSBudWxsO1xuICAgIHRoaXMuZGVidWcgPSBudWxsO1xuICAgIHRoaXMucHJvcHMgPSBudWxsO1xuICAgIHRoaXMuZGlhZyA9IG51bGw7XG4gICAgdGhpcy5wcm9ncmVzc0V2ZW50cyA9IG51bGw7XG5cbiAgICAvLyBpZHMgZm9yIHRpbWVvdXRzIG9uIGFzeW5jIGZ1bmN0aW9uc1xuICAgIHRoaXMudGltZW91dHMgPSB7XG4gICAgICBsb2FkOiBudWxsLFxuICAgICAgaGFuZHNoYWtlOiBudWxsLFxuICAgICAgaW5pdEFkOiBudWxsLFxuICAgICAgc3RhcnRBZDogbnVsbCxcbiAgICAgIHBhdXNlQWQ6IG51bGwsXG4gICAgICByZXN1bWVBZDogbnVsbCxcbiAgICAgIHN0b3BBZDogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLmFkUGxheWluZ1N0YXRlID0gbnVsbDtcblxuICAgIC8qIEFkIEV2ZW50IENhbGxiYWNrc1xuICAgICAqIFRoZXNlIGFyZSBzdWJzY3JpYmVkIHRvIHRoZWlyIHJlc3BlY3RpdmUgZXZlbnRzXG4gICAgICogd2hpY2ggYXJlIGZpcmVkIGJ5IHRoZSBhZFVuaXQuXG4gICAgICpcbiAgICAgKiBNYW55IHNpbXBseSBoYXZlIEhvcml6b24gZWNobyB0aGUgZXZlbnQgYmFja1xuICAgICAqIHVwIHRvIHRoZSB2aWRlbyBwbGF5ZXIuXG4gICAgICpcbiAgICAgKiB0aGVyZSBhcmUgdGltZW91dHMgYXNzb2NpYXRlZCB3aXRoIEFkTG9hZGVkLFxuICAgICAqIEFkU3RhcnRlZCwgQWRTdG9wcGVkIHRoYXQgbXVzdCBiZSBjbGVhcmVkIGluXG4gICAgICogdGhlaXIgcmVzcGVjdGl2ZSBjYWxsYmFja3MuXG4gICAgICpcbiAgICAgKiBXaGVuIHRoZSAzcmQgcGFydHkgVlBBSUQgdW5pdCdzIHN0YXRlIG9mIHRoZSB2aWRlb1xuICAgICAqIHBsYXllciBpcyBpbmNvbnNpc3RlbnQgd2l0aCBIb3Jpem9ucywgd2UgZmlyZSBhIGRpYWcuXG4gICAgICovXG4gICAgdGhpcy5hZEV2ZW50Q0JzID0ge1xuICAgICAgLy8gbm9uIHN0YW5kYXJkIGV2ZW50c1xuICAgICAgQWRMb2FkZWQ6ICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dHMuaW5pdEFkKTtcbiAgICAgICAgdGhpcy5fY2FsbEV2ZW50KCdBZExvYWRlZCcpO1xuICAgICAgfSxcbiAgICAgIEFkU3RhcnRlZDogKCkgPT4ge1xuICAgICAgICAvLyBzZXQgYSBzdGF0ZVxuICAgICAgICB0aGlzLmFkUGxheWluZ1N0YXRlID0gJ0FkUGxheWluZyc7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRzLnN0YXJ0QWQpO1xuICAgICAgICBpZiAodGhpcy52aWRlb1Nsb3QucGF1c2VkKSB7XG4gICAgICAgICAgdGhpcy5kaWFnLmZpcmUoJ1ZQQUlEX1NUQVRFX0lOQ09OU0lTVEVOQ1knKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWREdXJhdGlvbiA9IHRoaXMuYWRVbml0LmdldEFkRHVyYXRpb24oKTtcbiAgICAgICAgaWYgKHRoaXMuYWREdXJhdGlvbiA+PSAwKSB7XG4gICAgICAgICAgdGhpcy5fcHJvZ3Jlc3NFdmVudENyb24oKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFkRHVyYXRpb24gPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5kaWFnLmZpcmUoJ0FEX0RVUkFUSU9OX05PVF9TVVBQT1JURUQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NhbGxFdmVudCgnQWRTdGFydGVkJyk7XG4gICAgICB9LFxuICAgICAgQWRTdG9wcGVkOiAoKSA9PiB7XG4gICAgICAgIC8vIHJlc2V0IHRoZSBzdGF0ZVxuICAgICAgICB0aGlzLmFkUGxheWluZ1N0YXRlID0gJ0FkU3RvcHBlZCc7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRzLnN0b3BBZCk7XG4gICAgICAgIC8vIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5pRnJhbWUpO1xuICAgICAgICBpZiAoIXRoaXMuc3RvcHBlZCkge1xuICAgICAgICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5fY2FsbEV2ZW50KCdBZFN0b3BwZWQnKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIEFkTG9nOiBmdW5jdGlvbihpZCkge1xuICAgICAgICB0aGlzLl9jYWxsRXZlbnQoJ0FkTG9nJywgaWQpO1xuICAgICAgfSxcbiAgICAgIEFkU2l6ZUNoYW5nZTogKCkgPT4ge1xuICAgICAgICAvLyByZXNpemVBZCBkZWZpbmVzIHRoZSBtYXggc2l6ZSwgbm90IHRoZSBleGFjdCBzaXplXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnZpZXdNb2RlICE9PSAnZnVsbHNjcmVlbidcbiAgICAgICAgICAgICYmICh0aGlzLnByb3BzLndpZHRoID4gdGhpcy52aWRlb1Nsb3Qud2lkdGhcbiAgICAgICAgICAgIHx8IHRoaXMucHJvcHMuaGVpZ2h0ID4gdGhpcy52aWRlb1Nsb3QuaGVpZ2h0KSkge1xuICAgICAgICAgIHRoaXMuZGlhZy5maXJlKCdWUEFJRF9TVEFURV9JTkNPTlNJU1RFTkNZJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY2FsbEV2ZW50KCdBZFNpemVDaGFuZ2UnKTtcbiAgICAgIH0sXG4gICAgICBBZFBhdXNlZDogKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0cy5wYXVzZUFkKTtcbiAgICAgICAgaWYgKCF0aGlzLnZpZGVvU2xvdC5wYXVzZWQpIHtcbiAgICAgICAgICB0aGlzLmRpYWcuZmlyZSgnVlBBSURfU1RBVEVfSU5DT05TSVNURU5DWScpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NhbGxFdmVudCgnQWRQYXVzZWQnKTtcbiAgICAgIH0sXG4gICAgICBBZFBsYXlpbmc6ICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dHMucmVzdW1lQWQpO1xuICAgICAgICBpZiAodGhpcy52aWRlb1Nsb3QucGF1c2VkKSB7XG4gICAgICAgICAgdGhpcy5kaWFnLmZpcmUoJ1ZQQUlEX1NUQVRFX0lOQ09OU0lTVEVOQ1knKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jYWxsRXZlbnQoJ0FkUGxheWluZycpO1xuICAgICAgfSxcbiAgICAgIEFkVm9sdW1lQ2hhbmdlOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmFkVm9sdW1lICE9PSB0aGlzLmFkVW5pdC5nZXRBZFZvbHVtZSgpKSB7XG4gICAgICAgICAgdGhpcy5kaWFnLmZpcmUoJ1ZQQUlEX1NUQVRFX0lOQ09OU0lTVEVOQ1knKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jYWxsRXZlbnQoJ0FkVm9sdW1lQ2hhbmdlJyk7XG4gICAgICB9LFxuICAgICAgQWREdXJhdGlvbkNoYW5nZTogKCkgPT4ge1xuICAgICAgICB0aGlzLmFkRHVyYXRpb24gPSB0aGlzLmFkVW5pdC5nZXRBZER1cmF0aW9uKCk7XG4gICAgICAgIHRoaXMuX2NhbGxFdmVudCgnQWREdXJhdGlvbkNoYW5nZScpO1xuICAgICAgfSxcbiAgICAgIEFkQ2xpY2tUaHJ1OiAodXJsLCB0cmFja2luZ0lkLCBwbGF5ZXJIYW5kbGVzKSA9PiB7XG4gICAgICAgIGlmICghdXJsKSB7XG4gICAgICAgICAgdXJsID0gdGhpcy5wcm9wcy5hZFBhcmFtZXRlcnMudmlkZW9DbGlja3MuY2xpY2tUaHJvdWdoO1xuICAgICAgICAgIHBsYXllckhhbmRsZXMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NhbGxFdmVudCgnQWRDbGlja1RocnUnLCBbdXJsIHx8IG51bGwsIHRyYWNraW5nSWQgfHwgJycsIHBsYXllckhhbmRsZXNdKTtcbiAgICAgIH0sXG4gICAgICBBZFZpZGVvQ29tcGxldGU6ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9ncmVzc0V2ZW50cy5jaGVja0FuZEZpcmUodGhpcy5hZER1cmF0aW9uIC0gdGhpcy5hZFVuaXQuZ2V0QWRSZW1haW5pbmdUaW1lKCksIHRoaXMuYWREdXJhdGlvbik7XG4gICAgICAgIHRoaXMuX2NhbGxFdmVudCgnQWRWaWRlb0NvbXBsZXRlJyk7XG4gICAgICB9LFxuICAgICAgQWRFcnJvcjogbWVzc2FnZSA9PiB7XG4gICAgICAgIHRoaXMuZGlhZy5maXJlKCdWUEFJRF9JTlRFUk5BTF9FUlJPUicsICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9jYWxsRXZlbnQoJ0FkRXJyb3InLCBtZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGVjaG9lZEV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIHRoaXMuYWRFdmVudENCc1tldmVudF0gPSAoKSA9PiB0aGlzLl9jYWxsRXZlbnQoZXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgX3dhdGNoTG9nKG1lc3NhZ2UpIHtcbiAgICBpZiAodGhpcy5kZWJ1ZyAmJiB0aGlzLndhdGNoKSB7XG4gICAgICB0aGlzLndhdGNoLmxvZyhtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBfY2FsbEV2ZW50KGUsIHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICBjb25zb2xlLmxvZygnY2FsbGluZyAzcmQgcGFydHkgdnBhaWQgZXZlbnQgJyArIGUpO1xuICAgIHRoaXMuX3dhdGNoTG9nKHtldmVudDogZX0pO1xuICAgIHRoaXMuZXZlbnRIYW5kbGVyLmZpcmUoZSwgcGFyYW1zLCB7XG4gICAgICBhZFRpbWU6IHRoaXMudmlkZW9TbG90ICYmIHRoaXMudmlkZW9TbG90LmN1cnJlbnRUaW1lLFxuICAgICAgYWREdXJhdGlvbjogdGhpcy52aWRlb1Nsb3QgJiYgdGhpcy52aWRlb1Nsb3QuZHVyYXRpb25cbiAgICB9LCBjYWxsYmFjayk7XG4gIH1cblxuICBfcHJvZ3Jlc3NFdmVudENyb24oKSB7XG4gICAgLy8gY2hlY2tzIGF0IDQgSGVydHpcbiAgICBjb25zdCBjcm9uSWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiBmaXJlUHJvZ3Jlc3MoKSB7XG4gICAgICBjb25zdCBjdXJyZW50VGltZSA9IHRoaXMuYWREdXJhdGlvbiAtIHRoaXMuYWRVbml0LmdldEFkUmVtYWluaW5nVGltZSgpO1xuICAgICAgdGhpcy5wcm9ncmVzc0V2ZW50cy5jaGVja0FuZEZpcmUoY3VycmVudFRpbWUsIHRoaXMuYWREdXJhdGlvbik7XG4gICAgICBpZiAoY3VycmVudFRpbWUgPj0gdGhpcy5hZER1cmF0aW9uKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoY3JvbklkKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcyksIDI1MCk7XG4gIH1cblxuICBfYWRFcnJvcihtZXNzYWdlKSB7XG4gICAgY29uc29sZS5sb2coJzNyZCBwYXJ0eSB2cGFpZCBlcnJvciAnICsgbWVzc2FnZSk7XG4gICAgdGhpcy5fd2F0Y2hMb2coe2Vycm9yOiBtZXNzYWdlfSk7XG4gICAgdGhpcy5fY2FsbEV2ZW50KCdBZEVycm9yJywgW21lc3NhZ2VdKTtcbiAgfVxuXG4gIF9maXJlRGlhZ0Vycm9yKG5hbWUpIHtcbiAgICB0aGlzLmRpYWcuZmlyZShuYW1lLCAoKSA9PiB0aGlzLl9hZEVycm9yKG5hbWUpKTtcbiAgfVxuXG4gIF9zdWJzY3JpYmVBZEV2ZW50cyhhZFVuaXQpIHtcbiAgICBmb3IgKGxldCBldmVudCBpbiB0aGlzLmFkRXZlbnRDQnMpIHtcbiAgICAgIHRoaXMuYWRVbml0LnN1YnNjcmliZSh0aGlzLmFkRXZlbnRDQnNbZXZlbnRdLCBldmVudCwgdGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyogbG9hZFZQQUlEQWQgaXMgdGhlIG1haW4gVlBBSURIYW5kbGVyIGZ1bmN0aW9uIGNhbGxlZCBieSBIb3Jpem9uXG4gICAqIHBhcmFtczogc291cmNlIFVybCwgYm9vbGVhbiBmb3IgZGVidWcsIHNjb3V0V2F0Y2ggb2JqZWN0LCBhcnJheSBvZlxuICAgKiB0aGUgaW5pdEFkKCkgcGFyYW1zIHBhc3NlZCB0byBIb3Jpem9uIGl0c2VsZiAodGhhdCBhcmUgcGFzc2VkIHRocm91Z2hcbiAgICogdG8gdGhlIDNyZCBwYXJ0eSBpbml0QWQgY2FsbClcbiAgICovXG4gIGxvYWRWUEFJREFkKHNvdXJjZVVybCwgdmlkU2xvdCwgdnBhaWRKU1dyYXBwZXJQcm9wcywgaXNEZWJ1ZyxcbiAgICAgICAgICAgICAgc2NvdXRXYXRjaCwgdnBhaWRKU1dyYXBwZXJEaWFnLCB2cGFpZEpTV3JhcHBlclByb2dFdmVudHMsIHZwYWlkSlNXcmFwcGVySW5pdEFkQXJncykge1xuICAgIHRoaXMudmlkZW9TbG90ID0gdmlkU2xvdDtcbiAgICB0aGlzLnByb3BzID0gdnBhaWRKU1dyYXBwZXJQcm9wcztcbiAgICB0aGlzLmRlYnVnID0gaXNEZWJ1ZztcbiAgICB0aGlzLndhdGNoID0gc2NvdXRXYXRjaDtcbiAgICB0aGlzLmRpYWcgPSB2cGFpZEpTV3JhcHBlckRpYWc7XG4gICAgdGhpcy5wcm9ncmVzc0V2ZW50cyA9IHZwYWlkSlNXcmFwcGVyUHJvZ0V2ZW50cztcblxuICAgIC8vIGxvYWQgM3JkIHBhcnR5IHZwYWlkIGludG8gY2xlYW4gaUZyYW1lXG4gICAgLy8gdGhpcy5pRnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAvLyB0aGlzLmlGcmFtZS5pZCA9ICczcmQtcGFydHktdnBhaWQtZnJhbWUnO1xuICAgIC8vIHRoaXMuaUZyYW1lLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnYm9yZGVyOjAgbm9uZScpO1xuICAgIC8vIHRoaXMuaUZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0OmZhbHNlJztcbiAgICAvLyB0aGlzLmlGcmFtZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgLy8gY29uc3QgaUZyYW1lRG9jID0gdGhpcy5pRnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICB0aGlzLnRpbWVvdXRzLmxvYWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX2ZpcmVEaWFnRXJyb3IoJ1ZQQUlEX0xPQURfVElNRU9VVCcpO1xuICAgIH0sIGNvbmZpZy52cGFpZENyZWF0aXZlTWV0aG9kVGltZW91dCk7XG5cbiAgICAvLyBtYWluIGxvZ2ljIG9uY2UgM3JkIHBhcnR5IHNvdXJjZSBsb2Fkc1xuICAgIHNjcmlwdC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0cy5sb2FkKTtcbiAgICAgIGNvbnN0IGdldFZQQUlEQWQgPSB3aW5kb3cuZ2V0VlBBSURBZDtcbiAgICAgIGlmIChnZXRWUEFJREFkICYmIHR5cGVvZiBnZXRWUEFJREFkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuYWRVbml0ID0gZ2V0VlBBSURBZCgpO1xuICAgICAgICB0aGlzLnRpbWVvdXRzLmhhbmRzaGFrZSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZGlhZy5maXJlKCdWUEFJRF9WSVRBTF9NRVRIT0RfVElNRU9VVCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2FkRXJyb3IoJ2hhbmRzaGFrZSB0aW1lZCBvdXQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgY29uZmlnLnZwYWlkQ3JlYXRpdmVNZXRob2RUaW1lb3V0KTtcbiAgICAgICAgbGV0IHZwYWlkVmVyc2lvbiA9IHRoaXMuYWRVbml0LmhhbmRzaGFrZVZlcnNpb24oJzIuMCcpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0cy5oYW5kc2hha2UpO1xuXG4gICAgICAgIGlmICghaW1wbGVtZW50c1ZQQUlEU3BlYyh0aGlzLmFkVW5pdCkpIHtcbiAgICAgICAgICB0aGlzLmZpcmVEaWFnRXJyb3IoJ1ZQQUlEX1BST1RPQ09MX05PVF9TVVBQT1JURUQnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWFjY2VwdGFibGVWUEFJRFZlcnNpb24odnBhaWRWZXJzaW9uKSkge1xuICAgICAgICAgIHRoaXMuZmlyZURpYWdFcnJvcignVlBBSURfSEFORFNIQUtFX0ZBSUwnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zdWJzY3JpYmVBZEV2ZW50cyh0aGlzLmFkVW5pdCk7XG4gICAgICAgIHRoaXMudGltZW91dHMuaW5pdEFkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kaWFnLmZpcmUoJ1ZQQUlEX1ZJVEFMX01FVEhPRF9USU1FT1VUJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fYWRFcnJvcignaW5pdEFkIHRpbWVkIG91dCcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBjb25maWcudnBhaWRDcmVhdGl2ZU1ldGhvZFRpbWVvdXQpO1xuICAgICAgICB0aGlzLmFkVW5pdC5pbml0QWQuYXBwbHkodGhpcy5hZFVuaXQsIHZwYWlkSlNXcmFwcGVySW5pdEFkQXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZpcmVEaWFnRXJyb3IoJ1ZQQUlEX1BST1RPQ09MX05PVF9TVVBQT1JURUQnKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2NyaXB0Lm9uZXJyb3IgPSBldmVudCA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0cy5sb2FkKTtcbiAgICAgIHRoaXMuZmlyZURpYWdFcnJvcignVlBBSURfTE9BRF9FUlJPUicpO1xuICAgIH07XG5cbiAgICBzY3JpcHQuc3JjID0gc291cmNlVXJsO1xuICAgIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG5cbiAgICAgIC8vIGlGcmFtZURvYy5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgLy8gfTtcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgfVxuXG4gIGhhc0FkKCkge1xuICAgIHJldHVybiAhIXRoaXMuYWRVbml0O1xuICB9XG4gIC8vIFBhc3N0aHJvdWdoIEZ1bmN0aW9uc1xuICBzdGFydEFkKCkge1xuICAgIGlmICh0aGlzLmFkUGxheWluZ1N0YXRlID09PSAnQWRQbGF5aW5nJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0cy5zdGFydEFkKTtcbiAgICB0aGlzLnRpbWVvdXRzLnN0YXJ0QWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuZGlhZy5maXJlKCdWUEFJRF9WSVRBTF9NRVRIT0RfVElNRU9VVCcsICgpID0+IHtcbiAgICAgICAgdGhpcy5fYWRFcnJvcignc3RhcnRBZCB0aW1lZCBvdXQnKTtcbiAgICAgIH0pO1xuICAgIH0sIGNvbmZpZy52cGFpZENyZWF0aXZlTWV0aG9kVGltZW91dCk7XG4gICAgdGhpcy5hZFVuaXQuc3RhcnRBZCgpO1xuICB9XG5cbiAgcmVzaXplQWQod2lkdGgsIGhlaWdodCwgdmlld01vZGUpIHtcbiAgICB0aGlzLmFkVW5pdC5yZXNpemVBZCh3aWR0aCwgaGVpZ2h0LCB2aWV3TW9kZSk7XG4gIH1cblxuICBzdG9wQWQoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dHMuc3RvcEFkKTtcbiAgICB0aGlzLnRpbWVvdXRzLnN0b3BBZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5kaWFnLmZpcmUoJ1ZQQUlEX1ZJVEFMX01FVEhPRF9USU1FT1VUJywgKCkgPT4ge1xuICAgICAgICB0aGlzLl9hZEVycm9yKCdzdG9wQWQgdGltZWQgb3V0Jyk7XG4gICAgICB9KTtcbiAgICB9LCBjb25maWcudnBhaWRDcmVhdGl2ZU1ldGhvZFRpbWVvdXQpO1xuICAgIHRoaXMuYWRVbml0LnN0b3BBZCgpO1xuICB9XG5cbiAgcGF1c2VBZCgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0cy5wYXVzZUFkKTtcbiAgICB0aGlzLnRpbWVvdXRzLnBhdXNlQWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuZGlhZy5maXJlKCdWUEFJRF9OT05WSVRBTF9NRVRIT0RfVElNRU9VVCcpO1xuICAgICAgY29uc29sZS5sb2coJ3BhdXNlQWQgdGltZWQgb3V0Jyk7XG4gICAgfSwgY29uZmlnLnZwYWlkQ3JlYXRpdmVNZXRob2RUaW1lb3V0KTtcbiAgICB0aGlzLmFkVW5pdC5wYXVzZUFkKCk7XG4gIH1cblxuICByZXN1bWVBZCgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0cy5yZXN1bWVBZCk7XG4gICAgdGhpcy50aW1lb3V0cy5yZXN1bWVBZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5kaWFnLmZpcmUoJ1ZQQUlEX05PTlZJVEFMX01FVEhPRF9USU1FT1VUJyk7XG4gICAgICBjb25zb2xlLmxvZygncmVzdW1lQWQgdGltZWQgb3V0Jyk7XG4gICAgfSwgY29uZmlnLnZwYWlkQ3JlYXRpdmVNZXRob2RUaW1lb3V0KTtcbiAgICB0aGlzLmFkVW5pdC5yZXN1bWVBZCgpO1xuICB9XG5cbiAgZXhwYW5kQWQoKSB7XG4gICAgdGhpcy5hZFVuaXQuZXhwYW5kQWQoKTtcbiAgfVxuXG4gIGNvbGxhcHNlQWQoKSB7XG4gICAgdGhpcy5hZFVuaXQuY29sbGFwc2VBZCgpO1xuICB9XG5cbiAgc2tpcEFkKCkge1xuICAgIHRoaXMuYWRVbml0LnNraXBBZCgpO1xuICB9XG5cbiAgLy8gZ2V0dGVycyBhbmQgc2V0dGVyc1xuICBnZXRBZExpbmVhcigpIHtcbiAgICByZXR1cm4gdGhpcy5hZFVuaXQuZ2V0QWRMaW5lYXIoKTtcbiAgfVxuXG4gIGdldEFkV2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRVbml0LmdldEFkV2lkdGgoKTtcbiAgfVxuXG4gIGdldEFkSGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLmFkVW5pdC5nZXRBZEhlaWdodCgpO1xuICB9XG5cbiAgZ2V0QWRFeHBhbmRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5hZFVuaXQuZ2V0QWRFeHBhbmRlZCgpO1xuICB9XG5cbiAgZ2V0QWRTa2lwcGFibGVTdGF0ZSgpIHtcbiAgICB0aGlzLnByb3BzLmFkU2tpcHBhYmxlU3RhdGUgPSB0aGlzLmFkVW5pdC5nZXRBZFNraXBwYWJsZVN0YXRlKCk7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuYWRTa2lwcGFibGVTdGF0ZTtcbiAgfVxuICAvLyBTaW5jZSAzcmQgcGFydHkgYWQgdW5pdHMgbWF5IHVzZSBhIGRpZmZlcmVudCB2aWRlb3Nsb3QsXG4gIC8vIHdlIG1heSBvYnNlcnZlIGRpc2NyZXBhbmNpZXMgd2l0aCByZW1haW5pbmd0aW1lIGFuZCBkdXJhdGlvblxuICBnZXRBZFJlbWFpbmluZ1RpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRVbml0LmdldEFkUmVtYWluaW5nVGltZSgpO1xuICB9XG5cbiAgZ2V0QWREdXJhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5hZFVuaXQuZ2V0QWREdXJhdGlvbigpO1xuICB9XG4gIHNldEFkVm9sdW1lKHYpIHtcbiAgICB0aGlzLmFkVW5pdC5zZXRBZFZvbHVtZSh2KTtcbiAgfVxuXG4gIGdldEFkVm9sdW1lKCkge1xuICAgIHJldHVybiB0aGlzLmFkVW5pdC5nZXRBZFZvbHVtZSgpO1xuICB9XG5cbiAgLy8gd2UgZG9uJ3Qgc3VwcG9ydCBhZENvbXBhbmlvbnMgYW5kIGFkSWNvbnMgYXRtLFxuICAvLyBzbyBJIGRvbid0IHBhc3MgdGhlc2UgdXAgdG8gSG9yaXpvblxuICBnZXRBZENvbXBhbmlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRVbml0LmdldEFkQ29tcGFuaW9ucygpO1xuICB9XG5cbiAgZ2V0QWRJY29ucygpIHtcbiAgICByZXR1cm4gdGhpcy5hZFVuaXQuZ2V0QWRJY29ucygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFjY2VwdGFibGVWUEFJRFZlcnNpb24odmVyc2lvbikge1xuICByZXR1cm4gdmVyc2lvbiAmJiBwYXJzZUZsb2F0KHZlcnNpb24pID49IDIuMDtcbn1cblxuZnVuY3Rpb24gaW1wbGVtZW50c1ZQQUlEU3BlYyhhZFVuaXQpIHtcbiAgcmV0dXJuIFZQQUlETWV0aG9kcy5ldmVyeShjdXJyZW50ID0+IHtcbiAgICBjb25zdCBtZXRob2QgPSBhZFVuaXRbY3VycmVudF07XG4gICAgcmV0dXJuIG1ldGhvZCAmJiB0eXBlb2YgbWV0aG9kID09PSAnZnVuY3Rpb24nO1xuICB9KTtcbn1cbiJdfQ==
