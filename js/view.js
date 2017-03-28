console.log('view.js connected');
//***************************************
// view - where the display lives
//***************************************

var beginnerMode = false; // only for use in view object. Do not use anywhere
                        // else
var view = {
  //******************************
  // initialize board elements after page loads
  //******************************

  // makes the board in the html
  makeBoard: function() {
    console.log('view.makeBoard()');

    for (var rowNum = 0; rowNum < 8; rowNum++) {
      // make a row
      $row = $('<div>').addClass('row');
      $('#board').append($row);

      for (var colNum = 0; colNum < 8; colNum++) {
        // make a square
        var $square = $('<div>').addClass('board-square');

        // set class for playable squares
        if (((rowNum + 1 % 2) + colNum) % 2 === 0) {
          $square.addClass('playable-square')
        }

        // set row and column attributes on square
        $square.attr('column', colNum);
        $square.attr('row', rowNum);

        $row.append($square);
      }
    }
  },

  //*****************************
  //
  //****************************

  // placePiece - places a piece on the board
  placePiece: function(color, rowIndex, colIndex) {
    console.log('view.placePiece( ' + color + ', ' + rowIndex + ', ' + colIndex + ')');

    var $row = $('#board').children().eq(rowIndex);
    var $square = $row.children().eq(colIndex);
    $square.text(color);
  },

  removePiece: function(rowIndex, colIndex) {
    console.log('view.removePiece(' + rowIndex + ', ' + colIndex + ')');
    var $row = $('#board').children().eq(rowIndex);
    var $square = $row.children().eq(colIndex);
    $square.text('');
  },

  //****************************
  // Information area methods
  //****************************

  showWinner: function(winner) {
    console.log('view.showWinner()');

    var str = "Winner: " + winner + "!";
    $('#winner').text(str);
  },

  showTurn: function(turn) {
    console.log('showTurn() ' + turn);

    $('#turn').text(turn);
  },

  showNumPieces: function(red, black) {
    console.log('showNumPieces() red ' + red + ' black ' + black);

    str = "Pieces left:<br/>Red: " + red
      + "<br/>Black: " + black;
    $('#pieces-left').html(str);
  },

  showScore: function(red, black) {
    console.log('showScore() red ' + red + ' black ' + black);

    var str = "Score:<br/>Red: " + red
      + "<br/>Black: " + black;
    $('#score').html(str);
  },

  //*******************************
  // Event handlers
  //*******************************

  // add handler to square
  addHandler: function(handler, row, column) {
    console.log('view.addHandler( ' + handler.name + ', ' + row + ', ' + column + ')');

    // get row
    var $rowSelected = $('div#board > div').eq(row);

    // get square
    var $square = $rowSelected.children().eq(column);

    // highlight square, add highlight class
    if (beginnerMode) {
      $square.addClass('highlight');
    }

    // add handler
    $square.on('click', handler);
  },

  // remove handlers
  removeAllHandlers: function() {
    console.log('view.removeAllHandlers()');
    var $rows = $('#board').children();
    for (var i = 0; i < $rows.length; i++) {
      var $curRow = $rows.eq(i);
      $curRow.children().removeClass('highlight');
      $curRow.children().off();
    }
  },

  // add click handler to square
  // if in beginner mode highlight square
  addSelectPieceHandler: function(row, column) {
    console.log('view.addSelectPieceHandler() row ' + row + ' column ' + column);

    this.addHandler(this.pieceSelectedHandler, row, column);
  },

  addSelectedSquareHandler: function(row, column) {
    console.log('view.addSelectedSquareHandler( ' + row + ', ' + column + ')');
    this.addHandler(this.squareSelectedHandler, row, column);
  },

  // pieceSelectedHandler - called when a piece has been selected.
  // Removes handlers from all squares. Tells controller which piece was
  // selected
  pieceSelectedHandler: function() {
    console.log('view.pieceSelectedHandler()');

    var $row = parseInt( $(this).attr('row'));
    var $column = parseInt( $(this).attr('column'));
    view.removeAllHandlers();
    $(this).addClass('highlight');
    controller.pieceSelected($row, $column);
  },

  // squareSelectedHandler - called when a square has been selected.
  // Removes handlers from all squares. Tells controller which square was
  // selected
  squareSelectedHandler: function() {
    console.log('view.squareSelectedHandler()');

    var $row = parseInt( $(this).attr('row'));
    var $column = parseInt( $(this).attr('column'))
    view.removeAllHandlers();
    controller.squareSelected($row, $column);
  },

}
