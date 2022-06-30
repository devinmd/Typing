
var wordsList;
var sentenceArr = [];
var sentenceStr = "";
var startTime = 0;
var errors = 0;
var errorIndex = [];
var letters = []
var avgWordLength;

var wordTimes = []
var wordIntervals = []

var info = {}

var wpm

var nextElem

var currentWord = 0
var currentLetter = 0

var errorWords = []

var wpmPerWordObj = {}

var infoInterval;

var oldInput = ''

function init() {

  document.getElementById('changeWordList').value = wordList

  document.getElementById('wordCountSlider').value = wordCount / 5
  document.getElementById('wordCountDisplay').innerHTML = '(' + wordCount + ")"

  document.getElementById('contentWidthSlider').value = (contentWidth - 5) / 10
  updateContentWidth(document.getElementById('contentWidthSlider'))

  document.getElementById('smoothCaretSlider').value = (smoothCaret / 30)
  changeSmoothCaret(document.getElementById('smoothCaretSlider'))

  document.getElementById('decimalAmountSlider').value = decimalCount
  document.getElementById('decimalAmountDisplay').innerHTML = '(' + decimalCount + ")"


  // show content after margins are completed
  document.getElementById('content').style.display = 'block'

  // get words list
  let request = new XMLHttpRequest();
  request.open("GET", 'assets/' + wordList + ".txt", false);
  request.send(null);
  wordsList = request.responseText.split("\n");

  // create info toggles
  for (let i = 0; i < Object.keys(infoDisplay).length; i++) {
    mainDiv = document.getElementById('infoToggles')

    let checkbox = document.createElement('input')

    checkbox.oninput = function () {
      toggleInfo(this, Object.keys(infoDisplay)[i])
    };

    checkbox.type = 'checkbox'

    if (infoDisplay[Object.keys(infoDisplay)[i]] == true) {
      // check box if is true in the info obj
      checkbox.checked = true
    }
    checkbox.style.cursor = 'pointer'

    p = document.createElement('p')
    p.innerHTML = Object.keys(infoDisplay)[i].replaceAll('_', ' ')
    p.onclick = function () {
      checkbox.checked = !checkbox.checked
    };
    p.style.cursor = 'pointer'

    div = document.createElement('div')

    div.append(checkbox)
    div.append(p)

    mainDiv.append(div)

  }

  startTest();
  doInfo()
}

function startTest() {

  // starts a new test
  // reset things
  document.getElementById("typingInput").value = "";
  document.getElementById('words').innerHTML = ''
  input = "";
  wordTimes = []
  errorWords = []
  wordIntervals = [0]
  sentenceArr = [];
  sentenceStr = "";
  letters = []
  errorIndex = [];
  errors = 0;
  startTime = 0;
  oldInput = ''
  wpmPerWordObj = {}
  currentWord = 0
  currentLetter = 0

  document.getElementById('caret').style.visibility = 'visible'

  document.getElementById('typingInput').focus()

  for (let i = 0; i < wordCount; i++) {
    // generate words
    let newWord = wordsList[Math.floor(Math.random() * wordsList.length)]
    sentenceArr.push(newWord);
  }
  sentenceStr = sentenceArr.join(" ");

  // create the words for user to see on screen
  for (let w = 0; w < sentenceArr.length; w++) {
    wordDiv = document.createElement('div')

    // do spaces
    if (w != 0) {
      var letter = document.createElement("p");
      letter.classList.add("letter");
      letter.innerHTML = ' '
      wordDiv.append(letter);
    }

    // create word div
    wordDiv.className = 'word'
    for (let l = 0; l < sentenceArr[w].length; l++) {
      // letter paragraph element
      var letter = document.createElement("p");
      letter.classList.add("letter");
      letter.innerHTML = sentenceArr[w].charAt(l);
      wordDiv.append(letter);
    }

    // push to word list
    document.getElementById("words").append(wordDiv);
  }

  avgWordLength = sentenceStr.length / wordCount
  doInfo()
  doCaret()
}

function typed() {
  if (input.length <= sentenceStr.length - 1) {
    // function calls when user types a character
    input = document.getElementById("typingInput").value;

    d = new Date();

    if (input[input.length - 1] != sentenceStr[input.length - 1]) {
      if (!errorIndex.includes(input.length - 1)) {
        errors += 1;
        errorIndex.push(input.length - 1);
        if (!errorWords.includes(sentenceArr[currentWord]) && currentLetter != (sentenceArr[currentWord].length + 1) && sentenceStr.split('')[input.length - 1] != ' ') {
          // doesnt count error word if you get a space or first letter of whole sentenceStr wrong, still counts as regular error
          stats['Error_Words'].push(sentenceArr[currentWord])
          errorWords.push(sentenceArr[currentWord])
        }
        if (sentenceStr.split('')[input.length - 1] != ' ') {
          stats["Error_Letters"].push(sentenceStr.split('')[input.length - 1])
        }
      }
    }

    // change current letter
    if (startTime != 0) {
      if (oldInput.length > input.length) {
        // deleted a character
        currentLetter -= 1
      } else {
        currentLetter += 1;
      }
      if (sentenceArr[currentWord].length == currentLetter - 1 || currentWord == 0 && sentenceArr[currentWord].length == currentLetter) {
        currentWord += 1
        currentLetter = 0

        // time at each word
        wordIntervals.push(d.getTime() - startTime)

        // time for each word
        wordTimes.push(wordIntervals[wordIntervals.length - 1] - wordIntervals[wordIntervals.length - 2])

        // create object with a word to wpm pair
        wpmPerWordObj[sentenceArr[currentWord - 1]] = (60 / wordTimes[wordTimes.length - 1] * 1000)
      }

      if (currentLetter < 0) {
        // going back in words because of deleted characters
        currentWord -= 1
        // set current letter to the last letter in that word
        currentLetter = (document.getElementsByClassName('word')[currentWord].querySelectorAll('.letter').length) - 1
      }
    }

    // start test timer on first character
    if (input.length == 1 && startTime == 0) {
      startTime = d.getTime();
      currentLetter += 1;
      infoInterval = setInterval(updateInfo, 100);
    }

    // move caret
    doCaret()

    // handle errors
    letters = document.getElementById("words").querySelectorAll('.letter')
    for (let i = 0; i < sentenceStr.length; i++) {
      // cycle through the sentenceStr comparing letters

      // target text
      let goalChar = sentenceStr.charAt(i);

      // user text
      let currChar = input.charAt(i);

      if (currChar == goalChar) {
        letters[i].className = 'letter'
        letters[i].classList.add(correct);
        if (errorIndex.includes(i) && corrected != "none") {
          // if you fix a letter
          // remove from errors list
          letters[i].classList.add(corrected);
        }
      } else if (currChar == "" || currChar == null) {
        // not at that letter yet
        letters[i].className = 'letter'

        if (errorIndex.includes(i) && corrected != 'none') {
          // if you get letter incorrect then delete it
          letters[i].classList.add(corrected);
        }
      } else {
        // incorrect letter
        letters[i].className = 'letter'
        letters[i].classList.add(incorrect);
        if (goalChar == ' ') {
          // if the character is a space, highlight so you can see it
          letters[i].classList.add('underlineIncorrect')
        }
      }
    }

    // create info obj
    createInfo()

    if (sentenceStr.length <= input.length) {
      // end test
      // clear words
      clearInterval(infoInterval)
      document.getElementById('caret').style.visibility = 'hidden'
      document.getElementById('words').innerHTML = ''
      document.getElementById('infoDisplay').innerHTML =
        '<span style="font-size: 36px; color: #c7c7c7;">' +
        handleDecimals(info['wpm']) +
        "</span><span style='font-size: 26px; color: #a2a2a2;'>" +
        'wpm' +
        "</span><br><span style='font-size: 30px; color: #c7c7c7;'>" +
        handleDecimals(info['accuracy']) +
        "</span><span style='font-size: 22px; color: #a2a2a2;'>%</span><br><span style='font-size:20px;'>duration</span> <span style='font-size: 24px; color: #c7c7c7;'>" + handleDecimals(info['duration'] / 1000) + "</span><span style='font-size:20px;'>s</span><br>"

      // wpm per word
      for (let i = 0; i < Object.keys(wpmPerWordObj).length; i++) {
        p = document.createElement('p')
        p.innerHTML = Object.keys(wpmPerWordObj)[i]
        p.className = 'postTest'
        p.onmouseover = function () {
          this.innerHTML = handleDecimals(wpmPerWordObj[Object.keys(wpmPerWordObj)[i]]) + "wpm"
        }
        p.onmouseleave = function () {
          this.innerHTML = Object.keys(wpmPerWordObj)[i]
        }
        document.getElementById('infoDisplay').append(p)
      }


    }

    oldInput = input


  }

}


function doCaret() {
  if (document.getElementsByClassName('word')[currentWord] != null) {
    let elemRect = document.getElementById('words').children[currentWord].children[currentLetter].getBoundingClientRect()

    offsetY = window.scrollY + elemRect.top;
    offsetX = window.scrollX + elemRect.left;

    document.getElementById('caret').style.top = (offsetY - 3) + "px"
    document.getElementById('caret').style.left = offsetX + "px"

  }
}


function toggleInfo(box, type) {
  infoDisplay[type] = box.checked
  doInfo()
}

function toggle(id) {
  document.getElementById('settings').style.display = 'none'
  document.getElementById('typing').style.display = 'none'
  document.getElementById('stats').style.display = 'none'

  document.getElementById(id).style.display = 'block'
  if(id != 'typing'){
    clearInterval(infoInterval)
  }
}

function updateInfo() {
  createInfo()
  doInfo()
}

function focused(p) {
  if (document.getElementById('caret') != null) {
    if (p == 'in') {
      document.getElementById('caret').style.visibility = 'visible'
    } else {
      document.getElementById('caret').style.visibility = 'hidden'
    }
  }
}


function updateDecimalAmount(range) {
  if (range == 6) {
    // all decimals
    decimalCount = -1
    document.getElementById('decimalAmountDisplay').innerHTML = '(all)'
  } else if (range == 0) {
    document.getElementById('decimalAmountDisplay').innerHTML = '(none)'
    decimalCount = range
  } else {
    document.getElementById('decimalAmountDisplay').innerHTML = '(' + range + ")"
    decimalCount = range
  }
  doInfo()
}

function updateContentWidth(range) {
  let temp = (range.value * 10) + 5
  document.getElementById('contentWidthDisplay').innerHTML = '(' + temp + "%)"
  document.getElementById('content').style.marginLeft = (100 - temp) / 2 + '%'
  document.getElementById('content').style.marginRight = (100 - temp) / 2 + '%'
  //document.getElementById('content').style.width = range.value + "%"
}

function handleDecimals(num) {
  if (decimalCount == 0) {
    return (Math.floor(num))
  } else if (decimalCount == -1) {
    return (num)
  } else {
    let temp = ("1".padEnd(decimalCount, '0') + "0")
    return (Math.floor(num * temp) / temp)
  }
}


function changeWordList(select) {
  if (select.value != wordList) {
    // if is different than the current word list
    let request = new XMLHttpRequest();
    request.open("GET", 'assets/' + select.value + ".txt", false);
    request.send(null);
    wordsList = request.responseText.split("\r\n");
  }
}



function createInfo() {
  d = new Date();
  info['duration'] = (d.getTime() - startTime)
  info['wpm'] = (currentWord * 60) / info['duration'] * 1000
  info['smartwpm'] = ((input.length / avgWordLength) * 60) / info['duration'] * 1000
  info['cpm'] = (input.length * 60) / info['duration'] * 1000
  info['accuracy'] = (input.length - errors) / (input.length / 100);
}

function doInfo() {
  // show info

  infoString = ''

  // position
  if (infoDisplay['Position']) {
    infoString += "<p>Position: " + (currentWord + 1) + ":" + (currentLetter + 1) + "</p>"
  }
  // duration
  if (infoDisplay["Duration"]) {
    if (isNaN(info['duration'])) {
      info['duration'] = 0
    }
    infoString += "<p>Duration: " + handleDecimals(info['duration'] / 1000) + 's</p>'
  }
  // words
  if (infoDisplay["Words"]) {
    if (sentenceStr.length == input.length) {
      currentWord = wordCount
    }
    infoString += "<p>Words: " + (currentWord) + "/" + wordCount + " (" + handleDecimals((wordCount - (wordCount - currentWord)) / (wordCount / 100)) + "%)</p>"
  }
  // smart words
  if (infoDisplay["Smart_Words"]) {
    infoString += "<p>Smart Words: " + handleDecimals(input.length / avgWordLength) + "/" + wordCount + " ("
    infoString += handleDecimals((wordCount - (wordCount - input.length / avgWordLength)) / wordCount * 100) + "%) (avg: " + handleDecimals(avgWordLength) + ")"
  }
  // characters
  if (infoDisplay["Characters"]) {
    infoString += "<p>Characters: " + input.length + "/" + sentenceStr.length + " ("
    infoString += handleDecimals((sentenceStr.length - (sentenceStr.length - input.length)) / (sentenceStr.length / 100)) + "%)</p>"
  }
  // wpm
  if (infoDisplay["WPM"]) {
    if (isNaN(info['wpm'])) {
      info['wpm'] = 0
    }
    infoString += "<p>WPM: " + handleDecimals(info['wpm']) + "</p>"
  }
  // smart wpm
  if (infoDisplay["Smart_WPM"]) {
    if (isNaN(info['smartwpm'])) {
      info['smartwpm'] = 0
    }
    infoString += "<p>Smart WPM: " + handleDecimals(info['smartwpm']) + "</p>"
  }
  // cpm
  if (infoDisplay["CPM"]) {
    infoString += "<p>CPM: " + handleDecimals(info["cpm"]) + "</p>"
  }

  // accuracy
  if (infoDisplay["Accuracy"]) {
    if (isNaN(info['accuracy'])) {
      info['accuracy'] = 0
    }
    infoString += "<p>Accuracy: " + handleDecimals(info['accuracy']) + "%</p>"
  }
  if (infoDisplay['Errors']) {
    infoString += "<p>Errors: " + errors + "</p>"

  }
  // error words
  if (infoDisplay['Error_Words']) {
    infoString += '<p>Error Words: ' + stats['Error_Words'].join(', ') + "</p>"
  }
  // error letters
  if (infoDisplay['Error_Letters']) {
    infoString += '<p>Error Letters: ' + stats['Error_Letters'].join(', ') + "</p>"
  }

  document.getElementById('infoDisplay').innerHTML = infoString
}

function updateWordCount(range) {
  wordCount = range.value * 5;
  document.getElementById('wordCountDisplay').innerHTML = '(' + range.value * 5 + ')';
}

// keypresses
onkeydown = onkeyup = function (e) {
  if (e.type == 'keydown') {
    if (e.code == 'ShiftLeft') {
      startTest()
    }
  }
  if (e.code == 'Digit1') {
    startTest()
    toggle('typing')
  }
  if (e.code == 'Digit2') {
    toggle('settings')
  } if (e.code == 'Digit3') {
    toggle('stats')
  }
}


function changeSmoothCaret(range) {
  document.getElementById('caret').style.transition = range.value * 30 + "ms"
  if (range.value == 0) {
    document.getElementById('smoothCaretDisplay').innerHTML = '(off)'

  } else {
    document.getElementById('smoothCaretDisplay').innerHTML = '(' + range.value * 30 + "ms)"
  }
}
