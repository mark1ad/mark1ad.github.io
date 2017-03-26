$(function() {
  console.log('checkers connected');

  controller.makeBoard();
  controller.placePieces();

  view.showNumPieces(12, 12);
  view.showScore(0, 0);

  controller.takeTurn(red);
});

//***************************************
//* Constants
//***************************************
const black = 'Black';
const red = 'Red';
const blank = '';

//***************************************
// model - where the data lives
//
// The playable sqaures are indexed starting at 1. From the outside
// it appears to be 0 based.
//****************************************
var model = {
  outOfPlay: 'x', // marks a square that is not playable
  // board is 10x10. The squares on the edges are dummy squares to make
  // life easier in other operations
  board: [],
  selectedPiece: [],

  //***************************************
  // Set up data objects - used once after page first loads
  //***************************************

  // makeRow - creates an array to store data for
  // one row of the board
  makeRow: function(row, initialValue) {
    console.log('model.makeRow()');

    this.board[row] = [];
    this.board[row].length = 10;
    this.board[row].fill(initialValue, blank, 10);
  },

  // initialize - creates the array to store state of the board in
  initialize: function() {
    console.log('model.initialize()');

    // make edge row and fill it with 'R'
    this.makeRow(0, this.outOfPlay);


    // make inside rows
    for (var row = 1; row < 9; row++) {
      this.makeRow( row, blank);
      // make edges occupied
      this.board[row][0] = this.outOfPlay;
      this.board[row][9] = this.outOfPlay;
    }

    // make last row, which is an occupied edge row
    this.makeRow(9, this.outOfPlay);
  },

  //*****************************
  // Update game state
  //******************************
  placePiece: function(color, rowIndex, colIndex) {
    console.log('model.placePiece()');

    // increment indexes because of edge rows
    rowIndex++;
    colIndex++;
    this.board[rowIndex][colIndex] = color;
  },

  setSelectedPiece: function(row, column) {
    this.selectedPiece = [ row + 1, column + 1 ];
  },

  getSelectedPiece: function() {
    return [ this.selectedPiece[0] - 1, this.selectedPiece[1] - 1];
  },

  movePiece: function(row, column) {
    console.log('model.movePiece(' + row + ', ' + column + ')');
    row++;
    column++;

    var player = this.board[this.selectedPiece[0]][this.selectedPiece[1]];
    this.board[this.selectedPiece[0]][this.selectedPiece[1]] = blank;
    this.board[row][column] = player;

    this.selectedPiece = [];
  },

  //**********************************
  // Get playable squares/pieces
  //**********************************

  // getValidPieces - returns an array of arrays. Inner arrays are the
  // coordinates of pieces that can be moved. [col, row]
  getValidPieces: function(player){
    // get direction pieces are moving. Red moves from 8 towards 0 so direction
    // is negative. Black is the opposite.
    var direction = player === red ? -1 : 1;

    var pieces = [];

    for (var row = 1; row <= 8; row++) {
      for (var col = 1; col <= 8; col++ ) {
        if (this.board[row][col] === player) {
          if (this.board[row + direction][col - 1] === blank
            || this.board[row + direction][col + 1] === blank) {
              // piece can be played
              pieces.push( [col - 1, row - 1]);
            }
          }
        }
    }

    return pieces;
  },

  // getMoveToSquares - returns an array or arrays. Inner arrays are the
  // coordinates of sqaures that a piece can move to. [row, column]
  getMoveToSquares: function(player) {
    console.log('getMoveToSquares() ' + player);

    var squares = [];
    var direction = player === red ? -1 : 1;

    var row = this.selectedPiece[0] + direction;

    // check if forward left space is empty
    var column = this.selectedPiece[1] - 1;
    if (this.board[row][column] === blank) {
      squares.push([row - 1, column - 1]);
    }

    // check if forward right space is empty
    var column = this.selectedPiece[1] + 1;
    if (this.board[row][column] === blank) {
      squares.push( [ row -1, column -1]);
    }

    return squares;
  },


  //***********************************
  // debug methods
  //**********************************
  // TODO: this function is for debugging, remove when done.
  printBoard: function() {

    for (var i = 0; i < this.board.length; i++) {
      console.log(this.board[i]);
    }
  },


}

//***************************************
// Controller - where the brains live
//***************************************
var controller = {
  currentPlayer: red,

  //******************************
  // initialize game after page loads
  //******************************

  // makeboard - initialize data and view
  makeBoard: function() {
    console.log('controller.makeBoard()');

    view.makeBoard();
    model.initialize();
  },

  //  placePieces - place pieces for start of game
  placePieces: function() {
    console.log('controler.placePieces()');

    // place black pieces
    for (var row = 0; row < 3; row++) {
      for(var col = 0; col < 8; col++) {
        if ((row % 2  + col) % 2 !== 0) {
          view.placePiece(black, row, col);
          model.placePiece(black, row, col);
        }
      }
    }

    // place red pieces
    for (var row = 5; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        if ((row % 2 + col) % 2 !== 0) {
          view.placePiece(red, row, col);
          model.placePiece(red, row, col);
        }
      }
    }
  },

  //**********************************
  // Start playing
  //***********************************

  // takeTurn - called at start of a players turn. Updates info area.
  // Add handlers to playable pieces
  takeTurn: function(player) {
    console.log('takeTurn() ' + player);

    // show whose turn it is
    var str = "It's " + player + "'s turn.";
    view.showTurn(str);

    // add handlers to playable pieces
    var validSquares = model.getValidPieces(player);
    for (var i = 0; i < validSquares.length; i++) {
      view.addSelectPieceHandler(validSquares[i][1], validSquares[i][0]);
    }
  },

  // pieceSelected - handler for when a player selects a piece.
  // Tells model which piece has been selected. Adds handlers to squares
  // that piece can move to.
  pieceSelected: function(row,  column) {
    console.log('pieceSelected() row '  + row + ' column ' + column);

    model.setSelectedPiece(row, column);

    var moveToSquares = model.getMoveToSquares(this.currentPlayer);
    for (var i = 0; i < moveToSquares.length; i++) {
      view.addSelectedSquareHandler(moveToSquares[i][0], moveToSquares[i][1]);
    }

    // this.currentPlayer = this.currentPlayer === red ? black : red;
    // this.takeTurn( this.currentPlayer);
  },

  // squareSelected - handler for when a player selects a square to move to.
  // Tells model where to move piece to. Starts opponents turn.
  squareSelected: function(row, column) {
    console.log('controller.squareSelected(' + row + ', ' + column + ')');


    // move piece in view
    var oldPosition = model.getSelectedPiece();
    view.removePiece( oldPosition[0], oldPosition[1]);
    view.placePiece(this.currentPlayer, row, column);

    // move piece in model
    model.movePiece(row, column);
  }
}

//***************************************
// view - where the display lives
//***************************************

var beginnerMode = true; // only for use in view object. Do not use anywhere
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
      $row = $('<div>');
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
    console.log('view.placePiece()');

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
    console.log('view.addHandler()');

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
  removeAllHandlers: function(handler) {
    var $rows = $('#board').children();
    for (var i = 0; i < $rows.length; i++) {
      var $curRow = $rows.eq(i);
      $curRow.children().removeClass('highlight');
      $curRow.children().off('click', this.pieceSelectedHandler);
    }
  },

  // add click handler to square
  // if in beginner mode highlight square
  addSelectPieceHandler: function(row, column) {
    console.log('view.addSelectPieceHandler() column ' + column + ' row ' + row);

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
    view.removeAllHandlers(this.pieceSelectedHandler);
    controller.pieceSelected($row, $column);
  },

  // squareSelectedHandler - called when a square has been selected.
  // Removes handlers from all squares. Tells controller which square was
  // selected
  squareSelectedHandler: function() {
    console.log('view.squareSelectedHandler()');

    var $row = parseInt( $(this).attr('row'));
    var $column = parseInt( $(this).attr('column'))
    view.removeAllHandlers(this.squareSelectedHandler);
    controller.squareSelected($row, $column);
  },

}
