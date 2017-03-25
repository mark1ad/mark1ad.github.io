$(function() {
  console.log('checkers connected');

  controller.makeBoard();
  controller.placePieces();
});

// model - where the data lives
var model = {
  // board is 10x10. The squares on the edges are dummy squares to make
  // life easier in other operations
  // R - square occupied by red
  // B - square occupied by black
  // empty string - square unoccupied
  constR: 'R',
  constB: 'B',
  constEmpty: '',
  board: [],

  makeRow: function(row, initialValue) {
    console.log('model.makeRow()');

    this.board[row] = [];
    this.board[row].length = 10;
    this.board[row].fill(initialValue, 0, 10);
  },

  initialize: function() {
    console.log('model.initialize()');

    // make edge row and fill it with 'R'
    this.makeRow(0, this.constR);

    // make inside rows
    for (var row = 1; row < 9; row++) {
      this.makeRow( row, this.constEmpty);
      // make edges occupied
      this.board[row][0] = this.constR;
      this.board[row][9] = this.constR;
    }

    // make last row, which is an occupied edge row
    this.makeRow(9, this.constR);
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
  }
}

// Controller - where the brains live
var controller = {
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
          view.placePiece('B', row, col);
          model.placePiece('B', row, col);
        }
      }
    }

    // place red pieces
    for (var row = 5; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        if ((row % 2 + col) % 2 !== 0) {
          view.placePiece('R', row, col);
          model.placePiece('B', row, col);
        }
      }
    }
  },
}

// view - where the display lives
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
}
