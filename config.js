
var wordList = 'eng1000'
var contentWidth = 50
var wordCount = 10
var decimalCount = 1
var smoothCaret = 60

var infoDisplay = {
  'Position': false,
  'Duration': true,
  'Characters': false,
  'Words': false,
  'Smart_Words': true,
  'WPM': true,
  'Smart_WPM': false,
  'CPM': false,
  'Accuracy': true,
  'Errors': false,
  'Error_Words': false,
  'Error_Letters': false,
}

var correct = 'textCorrect', incorrect = 'textIncorrect', corrected='none';

var stats = {
  'Error_Words': [],
  'Error_Letters': [],
  'Tests': 0,
  'Highest_WPM': 0,
  'Time_Typing': [],
}