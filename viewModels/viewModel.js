function mainViewModel()
{
    var tthis = this;
    var timerid = null;
    var directionsX = [-1, 0, 1, 0,-1, 1, 1,-1];
    var directionsY = [ 0, 1, 0,-1, 1, 1,-1,-1];
    //directions: up-right-down-left-(up&right)-(down&right)-(down&left)-(up&left)

    this.testText = ko.observable("red");
    this.width = 10;
    this.height = 10;

    //mines
    this.mines = ko.observable(10);

    //if user is playing ot not
    this.isPlaying = false;

    //time that left
    this.elapsedTime = ko.observable(0);

    this.minesDiscovered = ko.observable(0);

    //mines that left
    this.minesThatLeft = ko.dependentObservable(function(){ return tthis.mines() - tthis.minesDiscovered() });

    //board state
    this.boardState = new Array(this.height);
    //initializa board state
    for (var i = 0; i < this.height; i++)
    {
        this.boardState[i] = new Array(this.width);
        for (var j = 0; j < this.width; j++)
            this.boardState[i][j] = 0;
    }

    this.board = new boradViewModel(this.width , this.height, this);


    //methods
    this.pclearBoards = function (){
        for (var i = 0; i < this.height; i++)
        {
            for (var j = 0; j < this.width; j++)
            {
                this.boardState[i][j] = 0;
                this.board.getCell(i,j).value(interpretations[0]);    //undiscovered
                this.board.getCell(i,j).minesAround(null);
            }
        }
    }

    this.generateMines = function(initialX, initialY)
    {
        var unlocatedmines = tthis.mines();
        var indexArray = new Array(tthis.height * tthis.width);

        //array to store indexs
        var indexCount = 0;
        //saves index into indexArray
        for (var i = 0; i < tthis.height; i++)
            for (var j = 0; j < tthis.width; j++)
            {
                indexArray[indexCount] = [i,j];
                indexCount++;
            }

        while (unlocatedmines > 0)
        {
            //genrate rnd index
            var rndIndex = Math.floor(Math.random()* (indexArray.length -1));

            if (indexArray[rndIndex][0] == initialX && indexArray[rndIndex][1] == initialY)
            {
                //no pongas minas donde se hizo click
                indexArray = indexArray.remove(rndIndex);
                continue;
            }

            //put the mine
            tthis.boardState[indexArray[rndIndex][0]][indexArray[rndIndex][1]] = -1;

            //remove index
            indexArray = indexArray.remove(rndIndex);
            unlocatedmines--;
        }

        //now calcualte the numbers
        for (var i = 0; i < tthis.height; i++)
            for (var j = 0; j < tthis.width; j++)
            {
                //if there is mine
                if (tthis.boardState[i][j] == -1)
                {
                    //increment 1 in all arround
                    for (var d =0; d<8; d++)
                    {
                        var currentX = i + directionsX[d];
                        var currentY = j + directionsY[d];
                        if (currentX>=0 && currentX < tthis.height && currentY>=0 && currentY < tthis.width && tthis.boardState[currentX][currentY]>-1)
                            tthis.boardState[currentX][currentY]++;
                    }
                }
            }
       //only for test
        for (var i = 0; i < tthis.height; i++)
            for (var j = 0; j < tthis.width; j++)
                tthis.board.getCell(i,j).minesAround(tthis.boardState[i][j]);
    }

    this.onTimeTick = function(){
        tthis.elapsedTime(tthis.elapsedTime() + 1);
        timerid = setTimeout("global_timerTick()",1000);
    }

    this.resetGame = function(){
        this.isPlaying = false;
        this.pclearBoards();
        tthis.elapsedTime(0);
        tthis.minesDiscovered(0);
        window.clearTimeout(timerid);
    }

    this.startGame = function(initialX, initialY){
        if (!tthis.isPlaying)
        {
            this.isPlaying = true;
            this.generateMines(initialX, initialY);
            tthis.onTimeTick();
        }
    }

    this.discoverCell = function(X,Y){
        if (!tthis.isPlaying)
        {
            tthis.startGame(X,Y);
        }
    }
}

//needed for the global timer
function global_timerTick()
{
    viewModel.onTimeTick();
}

var interpretations = { 0:"unDiscovered", 1: "discoveredAndEmpty", 2:"discoveredAndNumber", 3: "markedAsMine", 4:"exploitedMine", 5:"mine"  };

//view model for cells
function cellViewModel(x,y,model)
{
    var tthis = this;

    this.x = x;
    this.y = y;
    this.model = model
    this.value = ko.observable(interpretations[0])  //undiscovered by default
    this.minesAround = ko.observable();
    //methods
    this.onMouseDown= function(viewmodel,evnt)
    {

    }

    this.onMouseUp=function(viewmodel, evnt)
    {
        if (evnt.button == 1 || evnt.button == 0)       //left
        {
            tthis.model.discoverCell(tthis.x, tthis.y);
            //alert(tthis.x + " " + tthis.y + " "+tthis.board);
        }
        else if (evnt.button == 2) //right
        {
            tthis.value(interpretations[2]);
        }
    }

    this.onDoubleClick= function(viewmodel,evnt)
    {
        alert("DobleClick");
    }
};

//viewModel for rows
function rowViewModel (width,rowNumber, model)
{
    var tthis = this;
    this.rowNumber = rowNumber;
    this.model = model;
    this.cells = new Array(width);
    for (var i = 0 ; i < width; i++)
        this.cells[i] = new cellViewModel(this.rowNumber, i, model);
};

//view model for board
function boradViewModel (height, width, model)
{
    var tthis = this;
    this.model = model;
    this.rows = new Array(height);
    for(var i = 0; i < height; i ++)
        this.rows[i] = new rowViewModel(width, i, this.model);

    var trows = this.rows;
    this.getCell = function(i,j)
    {
        return trows[i].cells[j];
    };

};


