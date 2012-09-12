var interpretations = { 0:"unDiscovered", 1: "discoveredAndEmpty", 2:"discoveredAndNumber", 3: "markedAsMine", 4:"exploitedMine", 5:"mine", 6:"markedAsMineButEmpty"  };

function mainViewModel()
{
    var tthis = this;
    var timerid = null;


    this.allConfigs = [
        new gameConfigViewModel("Beginner",9,9,10),
        new gameConfigViewModel("Intermediate",16,16,40),
        new gameConfigViewModel("Advanced",16,30,99)

    ];

    this.selectedConfig =ko.observable(this.allConfigs[0]);

    this.messageViewModel = new messageViewModel();

    //Width
    this.width = this.selectedConfig().boardWidth();

    //Heigth
    this.height = this.selectedConfig().boardHeight();

    //lost win
    this.isLost = ko.observable(false);
    this.isWin = ko.observable(false);

    //Mines
    var tmines = this.selectedConfig().mines();
    this.mines =ko.observable(tmines);

    //if user is playing ot not
    this.isPlaying = false;

    //if users can play - if is restarted
    this.canPlay = true;

    //time that left
    this.elapsedTime = ko.observable(0);

    this.minesDiscovered = ko.observable(0);

    //mines that left
    this.minesThatLeft = ko.dependentObservable(function(){ return tthis.mines() - tthis.minesDiscovered() });

    this.freeSpaces = (this.width * this.height) - this.mines();


    this.createBoardState = function()
    {
        //board state
        tthis.boardState = new Array(this.height);
        //initializa board state
        for (var i = 0; i < this.height; i++)
        {
            this.boardState[i] = new Array(this.width);
            for (var j = 0; j < this.width; j++)
                this.boardState[i][j] = 0;
        }
    }

    this.createBoardState();


    this.board = new boradViewModel(this.height, this.width , this);

    //subscriptions
    this.selectedConfig.subscribe(
        function(newValue){
            global_onChangeConfig(newValue);
    });

    //methods
    this.changeGameConfig = function(newConfig)
    {
        if (tthis.isPlaying)
            tthis.resetGame();
        var oldHeight = tthis.height;
        var oldWidth = tthis.width;
        var currentHeight = newConfig.boardHeight();
        var currentWidth = newConfig.boardWidth();
        var rowsToAdd = currentHeight - oldHeight;
        var columnsToAdd = currentWidth - oldWidth;

        if (rowsToAdd ==0 && columnsToAdd==0)
            return;

        tthis.board.updateBoard(rowsToAdd, columnsToAdd);

        tthis.height = currentHeight;
        tthis.width = currentWidth;
        tthis.mines(newConfig.mines());
        this.freeSpaces = (this.width * this.height) - this.mines();
        tthis.createBoardState();
    }
    this.pclearBoards = function (){
        for (var i = 0; i < tthis.height; i++)
        {
            for (var j = 0; j < tthis.width; j++)
            {
                tthis.boardState[i][j] = 0;
                tthis.board.getCell(i,j).value(interpretations[0]);    //undiscovered
                tthis.board.getCell(i,j).minesAround(null);
            }
        }
    };

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
        {
            for (var j = 0; j < tthis.width; j++)
            {
                //if there is mine
                if (tthis.boardState[i][j] == -1)
                {
                    //increment 1 in all arround
                    var cells = tthis.board.getCellsAround(i,j);
                    for (var k = 0; k < cells.length; k++)
                    {
                        cell = cells[k];
                        if (tthis.boardState[cell.x][cell.y] > -1)
                            tthis.boardState[cell.x][cell.y]++;
                    }
                }
            }
        }
       //only for test
//        for (var i = 0; i < tthis.height; i++)
//            for (var j = 0; j < tthis.width; j++)
//                tthis.board.getCell(i,j).minesAround(tthis.boardState[i][j]);
    };

    this.onTimeTick = function(){
        tthis.elapsedTime(tthis.elapsedTime() + 1);
        timerid = setTimeout("global_timerTick()",1000);
    };

    this.resetGame = function(){
        tthis.isPlaying = false;

        //clear boards
        tthis.pclearBoards();

        //reset variables
        tthis.elapsedTime(0);
        tthis.minesDiscovered(0);

        //stop the timer
        clearTimeout(timerid);
        tthis.canPlay = true;
        this.freeSpaces = (this.width * this.height) - this.mines();
        tthis.isWin(false);
        tthis.isLost(false);
    };

    this.startGame = function(initialX, initialY){
        if (!tthis.isPlaying)
        {
            this.isPlaying = true;
            this.generateMines(initialX, initialY);
            tthis.onTimeTick();
        }
    };
        
    this.explodeMine = function(X,Y)
    {
        //user is not playing
        tthis.isPlaying = false;
        
        //stop the timer
        clearTimeout(timerid);
        
        //cant play
        tthis.canPlay = false;
        
        //set the mine that explode
        tthis.board.getCell(X,Y).value(interpretations[4]);
        
        //discover all other mines
        for (var i = 0; i<tthis.height; i++)
            for (var j = 0; j < tthis.width; j++)
            {
                if (tthis.boardState[i][j] == -1 && tthis.board.getCell(i,j).value() == interpretations[0]) //if the mine is undiscovered
                    tthis.board.getCell(i,j).value(interpretations[5]);     //discover mine
                else if (tthis.board.getCell(i,j).value() == interpretations[3] && tthis.boardState[i][j] != -1)    //if is marked as mine, but was empty
                    tthis.board.getCell(i,j).value(interpretations[6]);

            }

        //Notification mesaje
        tthis.isLost(true);
        tthis.messageViewModel.standardMesage("You lose :-(","Lose");
    };

    this.win = function()
    {
        //stop the timer
        clearTimeout(timerid);
        tthis.canPlay = false;
        tthis.isPlaying = false;
        tthis.isWin(true);
        tthis.messageViewModel.standardMesage("You win in "+tthis.elapsedTime()+" seconds", "Winer!!!!!");
    };

    this.markUnmarkMine = function(X,Y)
    {
        var cell = tthis.board.getCell(X,Y);

        //check if is playing
        if (!tthis.isPlaying)
            return;

        if (cell.value() == interpretations[3])
        {
            cell.value(interpretations[0]);        //unmark mine
            tthis.minesDiscovered(tthis.minesDiscovered() - 1)  //mines discovered --
        }
        else if (cell.value() == interpretations[0])
        {
            cell.value(interpretations[3]);        //mark as mine
            tthis.minesDiscovered(tthis.minesDiscovered() + 1)  //mines discovered ++
        }
    };

    this.discoverCell = function(X,Y){
        //if cannot play, return
        if (!tthis.canPlay)
            return;
        //if is not playing then start the game
        if (!tthis.isPlaying)
        {
            tthis.startGame(X,Y);
        }
        //discover the cell
        if(tthis.board.getCell(X,Y).value() == interpretations[0])  //if cell is undiscovered
        {
            //if is a mine
            if (tthis.boardState[X][Y] == -1)
            {
                tthis.explodeMine(X,Y);
                return;
            }
            //else
            //if is a number
            else if (tthis.boardState[X][Y] > 0)
            {
                tthis.board.getCell(X,Y).minesAround(tthis.boardState[X][Y]);
                tthis.board.getCell(X,Y).value(interpretations[2]);
            }
            //if is 0
            else if (tthis.boardState[X][Y] == 0)
            {
                tthis.board.getCell(X,Y).value(interpretations[1]);

                //recusively discover all 0-mines places around
                var cells = tthis.board.getCellsAround(X,Y);
                for (var k = 0; k < cells.length; k++)
                {
                    cell = cells[k];
                    //if the cell around is not discovered, then discover it
                    if (cell.value() == interpretations[0])
                        tthis.discoverCell(cell.x, cell.y);
                }
            }
            tthis.freeSpaces--;
            if(tthis.freeSpaces == 0)
                tthis.win();
        }
    };

    this.discoverAround = function(X,Y)
    {
        var cell = tthis.board.getCell(X,Y);

        //if the cell is not e number, then return
        if (cell.minesAround()== null || cell.minesAround() <= 0)
            return;

        //var mines around
        var minesAround = cell.minesAround();

        //mines marked to check
        var minesMarkedAround = 0;

        var cells = tthis.board.getCellsAround(X,Y);
        for (var i = 0; i < cells.length; i++)
            if (cells[i].value() == interpretations[3])
                minesMarkedAround++;

        //if minesAround is not equals to the marked then is an user error
        if (minesAround != minesMarkedAround)
            return;

        for (var i = 0; i < cells.length; i++)
            if (cells[i].value() == interpretations[0])     //if each cell around is undiscovered then discover it
                tthis.discoverCell(cells[i].x, cells[i].y);
    }
}

function global_onChangeConfig(newConfig)
{
    viewModel.changeGameConfig(newConfig);
}

//needed for the global timer
function global_timerTick()
{
    //global view model
    viewModel.onTimeTick();
}

//View Models
function gameConfigViewModel(name, height, width, mines)
{
    this.gameName = ko.observable(name);
    this.boardHeight = ko.observable(height);
    this.boardWidth = ko.observable(width);
    this.mines = ko.observable(mines);
}

function messageViewModel()
{
    var tthis = this
    this.message = ko.observable();
    this.header = ko.observable();
    this.standardMesage = function (messageText, messageHeader)
    {
        tthis.message(messageText);
        tthis.header(messageHeader);
        $("#dialog").dialog({modal:true});
    }
}

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

    this.onMouseUp=function(viewmodel, evnt)
    {


        if (evnt.button == 1 || evnt.button == 0)       //left
        {
            tthis.model.discoverCell(tthis.x, tthis.y);     //discover that cell
        }
        else if (evnt.button == 2) //right
        {
            tthis.model.markUnmarkMine(tthis.x, tthis.y);
//            evnt.currentTarget.unbind("mouseup");
        }
    };

    this.discoverCellsAround= function(viewmodel,evnt)
    {
        tthis.model.discoverAround(tthis.x, tthis.y);
    };
    this.onContextMenu = function(viewmodel,evnt)
    {
        evnt.preventDefault();
        return false;
    }
}

//viewModel for rows
function rowViewModel (width,rowNumber, model)
{
    var tthis = this;
    this.width = width;
    this.rowNumber = rowNumber;
    this.model = model;
    this.cells = ko.observableArray();
    for (var i = 0 ; i < width; i++)
        this.cells.push(new cellViewModel(this.rowNumber, i, model));

    this.updateRow = function(columnsToAdd)
    {
        var futureWidth = tthis.width + columnsToAdd;

        //add rows
        if (columnsToAdd < 0)
        {
            var columnsToRemove = Math.abs(columnsToAdd);
            for (var x = columnsToRemove; x > 0; x--)
                tthis.cells.pop();
        }
        else
        {
            for (var x = tthis.width; x < futureWidth; x++)
                tthis.cells.push( new cellViewModel(tthis.rowNumber, x, tthis.model));
        }

        tthis.width = futureWidth;
    }
}

//view model for board
function boradViewModel (height, width, model)
{
    var tthis = this;

    this.height = height;
    this.width = width;

    var directionsX = [-1, 0, 1, 0,-1, 1, 1,-1];
    var directionsY = [ 0, 1, 0,-1, 1, 1,-1,-1];
    //directions: up-right-down-left-(up&right)-(down&right)-(down&left)-(up&left)

    this.model = model;
    this.rows = ko.observableArray();
    for(var i = 0; i < height; i ++)
        this.rows.push(new rowViewModel(width, i, this.model));


    this.getCell = function(i,j)
    {
        return tthis.rows()[i].cells()[j];
    };

    this.getCellsAround = function(X,Y)
    {
        var result = []
        for (var d =0; d<8; d++)
        {
            var currentX = X + directionsX[d];
            var currentY = Y + directionsY[d];
            if (currentX>=0 && currentX < tthis.height && currentY>=0 && currentY < tthis.width)
                result.push(tthis.getCell(currentX, currentY));
        }
        return result;
    };

    this.updateBoard = function(rowsToAdd, columsToAdd)
    {
        var oldHeight = tthis.height;

        tthis.height = tthis.height + rowsToAdd;
        tthis.width = tthis.width + columsToAdd;

        //add columns
        for(var x = 0; x < oldHeight; x++)
        {
            tthis.rows()[x].updateRow(columsToAdd);
        }

        //add rows
        if (rowsToAdd < 0)
        {
            var rowsToRemove = Math.abs(rowsToAdd);
            for (var x = rowsToRemove; x > 0; x--)
                tthis.rows.pop();
        }
        else
        {
            for (var x = oldHeight; x < tthis.height; x++)
                tthis.rows.push( new rowViewModel(tthis.width, x, tthis.model));
        }

    };

}


