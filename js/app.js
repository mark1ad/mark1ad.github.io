$(function() {
  console.log('checkers connected');

  controller.makeBoard();
  controller.placePieces();

  view.showNumPieces(12, 12);
  view.showScore(0, 0);

  controller.takeTurn(red);
});

const black = 'Black';
const red = 'Red';
const blank = '';

// model - where the data lives
var model = {
  outOfPlay: 'x', // marks a square that is not playable
  // board is 10x10. The squares on the edges are dummy squares to make
  // life easier in other operations
  board: [],

  makeRow: function(row, initialValue) {
    console.log('model.makeRow()');

    this.board[row] = [];
    this.board[row].length = 10;
    this.board[row].fill(initialValue, blank, 10);
  },

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

  placePiece: function(color, rowIndex, colIndex) {
    console.log('model.placePiece()');

    // increment indexes because of edge rows
    rowIndex++;
    colIndex++;
    this.board[rowIndex][colIndex] = color;
  },

  // TODO: this function is for debugging, remove when done.
  printBoard: function() {

    for (var i = 0; i < this.board.length; i++) {
      console.log(this.board[i]);
    }
  },

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
  }
}

// Controller - where the brains live
var controller = {
  currentPlayer: red,

  makeBoard: function() {
    console.log('controller.makeBoard()');

    view.makeBoard();
    model.initialize();
  },

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

  takeTurn: function(player) {
    console.log('takeTurn() ' + player);

    // show whose turn it is
    var str = "It's " + player + "'s turn.";
    view.showTurn(str);

    // add handlers to playable pieces
    var validSquares = model.getValidPieces(player);
    for (var i = 0; i < validSquares.length; i++) {
      view.addHandlerToSquare(validSquares[i][1], validSquares[i][0]);
    }
  },

  squareSelected: function(row,  column) {
    console.log('squareSelected() row '  + row + ' column ' + column);

    this.currentPlayer = this.currentPlayer === red ? black : red;
    this.takeTurn( this.currentPlayer);
  }
}

// view - where the display lives

var beginnerMode = true; // only for use in view object. Do not use anywhere
                        // else
var view = {

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

  placePiece: function(color, rowIndex, colIndex) {
    console.log('view.placePiece()');

    var $row = $('#board').children().eq(rowIndex);
    var $square = $row.children().eq(colIndex);
    $square.text(color);
  },

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

  squareSelectedHandler: function() {
    console.log('view.squareSelectedHandler()');

    var $row = $(this).attr('row');
    var $column = $(this).attr('column');

    // remove handlers and highlight class
    var $rows = $('#board').children();
    for (var i = 0; i < $rows.length; i++) {
      var $curRow = $rows.eq(i);
      $curRow.children().removeClass('highlight');
      $curRow.children().off('click', this.squareSelectedHandler);
    }

    controller.squareSelected($row, $column);
  },

  // add click handler to square
  // if in beginner mode highlight square
  addHandlerToSquare: function(row, column) {
    console.log('view.addHandlerToSquare() column ' + column + ' row ' + row);

    // get row
    var $rowSelected = $('div#board > div').eq(row);

    // get square
    var $square = $rowSelected.children().eq(column);

    // highlight square, add highlight class
    if (beginnerMode) {
      $square.addClass('highlight');
    }

    // add handler
    $square.on('click', this.squareSelectedHandler);
  },

}
