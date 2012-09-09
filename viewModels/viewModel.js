function mainViewModel()
{
    this.testText = ko.observable("red");
    this.width = 10;
    this.height = 10;
    this.board = new tableViewModel(this.width , this.height);
}

var interpretations = { 0:"unDiscovered", 1: "discoveredAndEmpty", 2:"discoveredAndNumber", 3: "markedAsMine", 4:"exploitedMine", 5:"mine"  };


function cellViewModel()
{
    this.value = ko.observable(interpretations[4])  //undiscovered by default
};

function rowViewModel (width)
{
    this.cells = new Array(width);
    for (var i = 0 ; i < width; i++)
        this.cells[i] = new cellViewModel();
};

function tableViewModel (height, width)
{
    this.rows = new Array(height);
    for(var i = 0; i < height; i ++)
        this.rows[i] = new rowViewModel(width);

    var trows = this.rows;
    this.getCell = function(i,j)
    {
        return trows[i].cells[j];
    };

};


