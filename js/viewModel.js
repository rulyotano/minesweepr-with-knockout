var viewModel={
    testText : ko.observable("red")
}


var interpretations = { 0:"unDiscovered", 1: "discoveredAndMine", 2:"discoveredAndNumber", 3: "markedAsMine", 4:"exploitedMine", 5:"mine"  }

var cellViewModel=
{
    value : ko.observable(interpretations[0])  //undiscovered by default
}

var rowViewModel = function(width)
{
    this.cells = new Array(width)
    for (i = 0 ; i < width; i++)
        this.cells[i] = new cellViewModel();
    return this
}