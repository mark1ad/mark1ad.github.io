# mark1ad.github.io

This project is using MVC. The model object contains all of the data. The view
object will  do all the changes to the html. The controller object is the brains
of the operation.

Each row of the board will is in its own div to make layout easier.

The model and controller objects are pure vanilla javascript.
The view object uses vanilla javascript and jQuery.

The board in the model object is 10x10 instead of 8x8. The outer row will
marked as occupied. This eliminates the need for special processing of edge
pieces.

The squares in the html board will have x and y attributes so we don't need
to work to figure out which square we're on.

To Do: using a mix of x,y and col,row. Need to clean up to use one or the other.
