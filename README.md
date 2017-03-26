# mark1ad.github.io

This project is using MVC. The model object contains all of the data. The view
object will  do all the changes to the html. The controller object is the brains
of the operation.

Each row of the board is in its own div to make layout easier.

The model and controller objects are pure vanilla javascript.
The view object uses vanilla javascript and jQuery.

The board in the model object is 10x10 instead of 8x8. The outer edges will
be marked as occupied. This eliminates the need for special processing of the
board's edge squares.

The squares in the html board will have row and column attributes so we don't
need to work to figure out which square we're on.

Beginner mode is handled completely in the view object. It doesn't affect game
play, only how the board is presented.
