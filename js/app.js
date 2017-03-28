$(function() {
  console.log('checkers connected');

  controller.setUpGame();
  model.printBoard();

  view.showNumPieces(12, 12);
  view.showScore(0, 0);

  // controller.takeTurn(red);
  controller.newGame();
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
  piecesLeft: {
  },

  //***************************************
  // Set up data objects - used once after page first loads
  //***************************************

  // makeRow - creates an array to store data for
  // one row of the board
  makeRow: function(row, initialValue) {
    console.log('model.makeRow()');

    this.board[row] = [];
    this.board[row].length = 8;
    this.board[row].fill(initialValue, blank, 8);
  },

  // initialize - creates the array to store state of the board in
  initialize: function() {
    console.log('model.initialize()');
    this.piecesLeft[red] = 12;
    this.piecesLeft[black] = 12;
    for (var row = 0; row < 8; row++) {
      this.makeRow( row, blank);
    }
  },


  //*****************************
  // Update game state
  //******************************
  placePiece: function(color, rowIndex, colIndex) {
    console.log('model.placePiece( ' + rowIndex + ', ' + colIndex + ')');

    // increment indexes because of edge rows
    this.board[rowIndex][colIndex] = color;
  },

  setSelectedPiece: function(row, column) {
    console.log('model.setSelectedPiece(' + row + ', ' + column + ')');
    this.selectedPiece = [ row, column ];
  },

  getSelectedPiece: function() {
    return [ this.selectedPiece[0], this.selectedPiece[1]];
  },

  // movePiece - moves a piece in the model. If the move was a jump remove the
  // jumped piece.
  // Returns an array with the coordinates of the jumped piece. If not a jump
  // return an empty array
  movePiece: function(row, column) {
    console.log('model.movePiece(' + row + ', ' + column + ')');

    var player = this.board[this.selectedPiece[0]][this.selectedPiece[1]];
    var direction = player === red ? -1 : 1;
    var jumpedPiece = [];

    // remove from current position
    this.board[this.selectedPiece[0]][this.selectedPiece[1]] = blank;
    // place on new position
    this.board[row][column] = player;

    // take care of a jumped piece
      var distanceMoved = Math.abs(this.selectedPiece[1] - column);
      if (distanceMoved === 2) {
        var opponent = player === red ? black : red;
        this.piecesLeft[opponent]--;
        // we've got a jumped
        if (column < this.selectedPiece[1]) {
          // jumped left remove from board
          jumpedPiece = [(this.selectedPiece[0] + direction),
            (this.selectedPiece[1] - 1)];
          this.board[jumpedPiece[0]][jumpedPiece[1]] = blank;
        }
        else {
          // jump right removed from board
          jumpedPiece = [(this.selectedPiece[0] + direction),
            (this.selectedPiece[1] + 1)];
          this.board[jumpedPiece[0]][jumpedPiece[1]] = blank;
        }
      }

    this.selectedPiece = [];

    return jumpedPiece;
  },

  //**********************************
  // Get playable squares/pieces
  //**********************************

  // pieceCanMove - returns an array of squares that piece can move to. array
  // is empty if there are no squares available
  pieceCanMove: function(direction, row, column) {
    console.log('pieceCanMove( ' + direction + ', ' + row + ', ' + column +')');
    var newRow = row + direction;
    var availableSquares = [];
    // var moveLeft = true;
    // var moveRight = true;

    if (newRow < 0 || newRow > 7) {
      // moving forward will take piece off the board
      return false;
    }

    //check moving left
    var newCol = column - 1;
    if (newCol >= 0) {
      // can move left
      if (this.board[newRow][newCol] === blank) {
        // sqaure is empty
        availableSquares.push( [newRow, newCol]);
      }
    }

    // check moving right
    newCol = column + 1;
    if (newCol < 8) {
      // piece can move right
      if (this.board[newRow][newCol] === blank) {
        // right square is empty
        availableSquares.push( [newRow, newCol]);
      }
    }
    return availableSquares;
  },

  // getValidPieces - returns an array of arrays. Inner arrays are the
    // coordinates of pieces that can be moved. [col, row]
  getValidPieces: function(player){
    // get direction pieces are moving. Red moves from 8 towards 0 so direction
    // is negative. Black is the opposite.
    var direction = player === red ? -1 : 1;

    var pieces = [];

    // check each row
    for (var row = 0; row < 8; row++) {
      // check each sqaure in row
      for (var col = 0; col < 8; col++ ) {
        // check if player is on this square
        if (this.board[row][col] === player) {
          // check if player can move
          var moveSquares = this.pieceCanMove(direction, row, col);
          var jumpSquares = this.getJumpToSquares(player, row, col);
          if (moveSquares.length > 0 || jumpSquares.length > 0) {
            pieces.push( [row, col]);
          }
        }
      }
    }

    return pieces;
  },

  // getMoveToSquares - returns an array or arrays. Inner arrays are the
  // coordinates of sqaures that a piece can move to. [row, column]
  getMoveToSquares: function(player) {
    console.log('model.getMoveToSquares() ' + player);

    var squares;
    var direction = player === red ? -1 : 1;

    squares = this.pieceCanMove(direction,
      this.selectedPiece[0],
      this.selectedPiece[1]);

    return squares;
  },

  // getJumpToSquares - Gets the squares that the selected piece can jump to.
  // Returns an array of array. Inner arrays are the squares to jump to.
  getJumpToSquares: function(player, row, col) {
    console.log('model.getJumpToSquares(' + player + ')');

    var direction = player === red ? -1 : 1;
    var squares = [];
    var opponent = player === red ? black : red;

    if ((row + direction) > 7 || (row + direction) < 0) {
      // landing square is off the end of the board
      return squares;
    }

    // check jumping left
    if ((col - 2 ) >= 0) {
      var jumpedSquare = this.board[row + direction][col - 1];
      var landingSquare = this.board[row + 2 * direction][col - 2];
      if (jumpedSquare === opponent && landingSquare === blank ) {
        // we have a jump
        squares.push([row + 2 * direction, col - 2]);
    }
  }

    // check jumping right
    if ((col + 2) <= 7) {
      jumpedSquare = this.board[row + direction][col + 1];
      landingSquare = this.board[row + 2 * direction][col + 2];
      if (jumpedSquare === opponent && landingSquare === blank) {
        // we have a jump
        squares.push([row + 2 * direction, col + 2]);
      }
    }

    return squares;
  },

  //***************************
  // Misc. methods
  //**************************
  getNumPieces: function() {
    return [ this.piecesLeft[red], this.piecesLeft[black]];
  },

  // getWinner - returns the winning player. Returns blank if no winner
  getWinner: function() {
    if (this.piecesLeft[red] <= 0) {
      // black won
      return black;
    }

    if (this.piecesLeft[black] <= 0) {
      // red won
      return red;
    }

    // no winner yet
    return blank;
  },


  //***********************************
  // debug methods
  //**********************************
  // TODO: this function is for debugging, remove when done.
  printBoard: function() {
    console.log('red pieces: ' + this.piecesLeft[red]);
    console.log('black pieces: ' + this.piecesLeft[black]);
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

    // clear board
    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        view.placePiece(blank, row, col);
        model.placePiece(blank, row, col);
      }
    }

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

  setUpGame: function() {
    this.makeBoard();
    this.placePieces();
  },

  //*******************************
  // Set up new game methods
  //*******************************

  newGame: function() {
    console.log('controller.newGame()');

    view.removeAllHandlers();
    this.placePieces();
    this.takeTurn(red);
  },

  //**********************************
  // Start playing
  //***********************************

  // takeTurn - called at start of a players turn. Updates info area.
  // Add handlers to playable pieces
  takeTurn: function(player) {
    console.log('>>>>>> takeTurn() ' + player);

    // show whose turn it is
    var str = "It's " + player + "'s turn.";
    view.showTurn(str);

    // add handlers to playable pieces
    var validSquares = model.getValidPieces(player);
    for (var i = 0; i < validSquares.length; i++) {
      view.addSelectPieceHandler(validSquares[i][0], validSquares[i][1]);
    }
  },

  // pieceSelected - handler for when a player selects a piece.
  // Tells model which piece has been selected. Adds handlers to squares
  // that piece can move to.
  pieceSelected: function(row,  column) {
    console.log('>>>>>>>controller.pieceSelected() row '  + row + ' column ' + column);

    model.setSelectedPiece(row, column);

    var moveToSquares = model.getMoveToSquares(this.currentPlayer);
    for (var i = 0; i < moveToSquares.length; i++) {
      view.addSelectedSquareHandler(moveToSquares[i][0], moveToSquares[i][1]);
    }

    var jumpToSquares = model.getJumpToSquares(this.currentPlayer, row, column);
    for (var i = 0; i < jumpToSquares.length; i++) {
      view.addSelectedSquareHandler(jumpToSquares[i][0], jumpToSquares[i][1]);
    }
  },

  // squareSelected - handler for when a player selects a square to move to.
  // Tells model where to move piece to. Starts opponents turn.
  squareSelected: function(row, column) {
    console.log('>>>>>>> controller.squareSelected(' + row + ', ' + column + ')');


    // move piece in view
    var oldPosition = model.getSelectedPiece();
    view.removePiece( oldPosition[0], oldPosition[1]);
    view.placePiece(this.currentPlayer, row, column);

    // move piece in model
    var pieceJumped = model.movePiece(row, column);

    if (pieceJumped.length === 2) {
      // piece was jumped remove it from display
      view.removePiece(pieceJumped[0], pieceJumped[1]);
      view.removePiece(pieceJumped[0], pieceJumped[1]);
    }

    var numPieces = model.getNumPieces();
    view.showNumPieces(numPieces[0], numPieces[1]);

    var winner = model.getWinner();
    if (winner !== blank) {
      view.showWinner(winner);
      view.showTurn("");
      view.removeAllHandlers();
      this.setUpGame();
      return;
      }

    this.currentPlayer = this.currentPlayer === red ? black : red;
    this.takeTurn( this.currentPlayer);
  }
}

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

    $('#new-game').on('click', this.newGameHandler);

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

  // new game button
  newGameHandler: function() {
    console.log('view.newGameHandler()');
    controller.newGame();
  },

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
