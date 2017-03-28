$(function() {
  console.log('checkers connected');

  controller.makeBoard();
  controller.placePieces();
  model.printBoard();

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
