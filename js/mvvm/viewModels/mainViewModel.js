var interpretations = { 0:"unDiscovered", 1: "discoveredAndEmpty", 2:"discoveredAndNumber", 3: "markedAsMine", 4:"exploitedMine", 5:"mine", 6:"markedAsMineButEmpty"  };

function mainViewModel()
{
    var self = this;
    self.timer_id = null;

    self.constructor =function(){
        self.registerEvents();
    };

    /**Method for register listeners to events*/
    self.registerEvents = function()
    {
        self.selectedConfig.subscribe(self.changeGameConfig);
    };


    self.allConfigs = [
        new gameConfigViewModel("Beginner",9,9,10),
        new gameConfigViewModel("Intermediate",16,16,40),
        new gameConfigViewModel("Advanced",16,30,99)

    ];

    self.selectedConfig =ko.observable(self.allConfigs[0]);

    self.messageViewModel = new messageViewModel();

    //Width
    self.width = self.selectedConfig().boardWidth();

    //Heigth
    self.height = self.selectedConfig().boardHeight();

    //lost win
    self.isLost = ko.observable(false);
    self.isWin = ko.observable(false);

    //Mines
    var tmines = self.selectedConfig().mines();
    self.mines =ko.observable(tmines);

    //if user is playing ot not
    self.isPlaying = false;

    //if users can play - if is restarted
    self.canPlay = true;

    //time that left
    self.elapsedTime = ko.observable(0);

    self.minesDiscovered = ko.observable(0);

    //mines that left
    self.minesThatLeft = ko.dependentObservable(function(){ return self.mines() - self.minesDiscovered() });

    self.freeSpaces = (self.width * self.height) - self.mines();


    self.createBoardState = function()
    {
        //board state
        self.boardState = new Array(self.height);
        //initializa board state
        for (var i = 0; i < self.height; i++)
        {
            self.boardState[i] = new Array(self.width);
            for (var j = 0; j < self.width; j++)
                self.boardState[i][j] = 0;
        }
    };

    self.createBoardState();


    self.board = new boardViewModel(self.height, self.width , self);

    //methods
    self.changeGameConfig = function(newConfig)
    {
        if (self.isPlaying)
            self.resetGame();
        var oldHeight = self.height;
        var oldWidth = self.width;
        var currentHeight = newConfig.boardHeight();
        var currentWidth = newConfig.boardWidth();
        var rowsToAdd = currentHeight - oldHeight;
        var columnsToAdd = currentWidth - oldWidth;

        if (rowsToAdd ==0 && columnsToAdd==0)
            return;

        self.board.updateBoard(rowsToAdd, columnsToAdd);

        self.height = currentHeight;
        self.width = currentWidth;
        self.mines(newConfig.mines());
        self.freeSpaces = (self.width * self.height) - self.mines();
        self.createBoardState();
    };

    self.pclearBoards = function (){
        for (var i = 0; i < self.height; i++)
        {
            for (var j = 0; j < self.width; j++)
            {
                self.boardState[i][j] = 0;
                self.board.getCell(i,j).value(interpretations[0]);    //undiscovered
                self.board.getCell(i,j).minesAround(null);
            }
        }
    };

    self.generateMines = function(initialX, initialY)
    {
        var unlocatedmines = self.mines();
        var indexArray = new Array(self.height * self.width);

        //array to store indexs
        var indexCount = 0;
        //saves index into indexArray
        for (var i = 0; i < self.height; i++)
            for (var j = 0; j < self.width; j++)
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
            self.boardState[indexArray[rndIndex][0]][indexArray[rndIndex][1]] = -1;

            //remove index
            indexArray = indexArray.remove(rndIndex);
            unlocatedmines--;
        }

        //now calcualte the numbers
        for (var i = 0; i < self.height; i++)
        {
            for (var j = 0; j < self.width; j++)
            {
                //if there is mine
                if (self.boardState[i][j] == -1)
                {
                    //increment 1 in all arround
                    var cells = self.board.getCellsAround(i,j);
                    for (var k = 0; k < cells.length; k++)
                    {
                        cell = cells[k];
                        if (self.boardState[cell.x][cell.y] > -1)
                            self.boardState[cell.x][cell.y]++;
                    }
                }
            }
        }
       //only for test
//        for (var i = 0; i < self.height; i++)
//            for (var j = 0; j < self.width; j++)
//                self.board.getCell(i,j).minesAround(self.boardState[i][j]);
    };

    self.onTimeTick = function(){
        self.elapsedTime(self.elapsedTime() + 1);
        self.timer_id = setTimeout(self.onTimeTick,1000);
    };

    self.resetGame = function(){
        self.isPlaying = false;

        //clear boards
        self.pclearBoards();

        //reset variables
        self.elapsedTime(0);
        self.minesDiscovered(0);

        //stop the timer
        clearTimeout(self.timer_id);
        self.canPlay = true;
        self.freeSpaces = (self.width * self.height) - self.mines();
        self.isWin(false);
        self.isLost(false);
    };

    self.startGame = function(initialX, initialY){
        if (!self.isPlaying)
        {
            self.isPlaying = true;
            self.generateMines(initialX, initialY);
            self.onTimeTick();
        }
    };

    self.explodeMine = function(X,Y)
    {
        //user is not playing
        self.isPlaying = false;
        
        //stop the timer
        clearTimeout(self.timer_id);
        
        //cant play
        self.canPlay = false;
        
        //set the mine that explode
        self.board.getCell(X,Y).value(interpretations[4]);
        
        //discover all other mines
        for (var i = 0; i<self.height; i++)
            for (var j = 0; j < self.width; j++)
            {
                if (self.boardState[i][j] == -1 && self.board.getCell(i,j).value() == interpretations[0]) //if the mine is undiscovered
                    self.board.getCell(i,j).value(interpretations[5]);     //discover mine
                else if (self.board.getCell(i,j).value() == interpretations[3] && self.boardState[i][j] != -1)    //if is marked as mine, but was empty
                    self.board.getCell(i,j).value(interpretations[6]);

            }

        //Notification mesaje
        self.isLost(true);
        self.messageViewModel.standardMessage("You lose :-(","Lose");
    };

    self.win = function()
    {
        //stop the timer
        clearTimeout(self.timer_id);
        self.canPlay = false;
        self.isPlaying = false;
        self.isWin(true);
        self.messageViewModel.standardMessage("You win in "+self.elapsedTime()+" seconds", "Winer!!!!!");
    };

    self.markUnmarkMine = function(X,Y)
    {
        var cell = self.board.getCell(X,Y);

        //check if is playing
        if (!self.isPlaying)
            return;

        if (cell.value() == interpretations[3])
        {
            cell.value(interpretations[0]);        //unmark mine
            self.minesDiscovered(self.minesDiscovered() - 1);  //mines discovered --
        }
        else if (cell.value() == interpretations[0])
        {
            cell.value(interpretations[3]);        //mark as mine
            self.minesDiscovered(self.minesDiscovered() + 1);  //mines discovered ++
        }
    };

    self.discoverCell = function(X,Y){
        //if cannot play, return
        if (!self.canPlay)
            return;
        //if is not playing then start the game
        if (!self.isPlaying)
        {
            self.startGame(X,Y);
        }
        //discover the cell
        if(self.board.getCell(X,Y).value() == interpretations[0])  //if cell is undiscovered
        {
            //if is a mine
            if (self.boardState[X][Y] == -1)
            {
                self.explodeMine(X,Y);
                return;
            }
            //else
            //if is a number
            else if (self.boardState[X][Y] > 0)
            {
                self.board.getCell(X,Y).minesAround(self.boardState[X][Y]);
                self.board.getCell(X,Y).value(interpretations[2]);
            }
            //if is 0
            else if (self.boardState[X][Y] == 0)
            {
                self.board.getCell(X,Y).value(interpretations[1]);

                //recusively discover all 0-mines places around
                var cells = self.board.getCellsAround(X,Y);
                for (var k = 0; k < cells.length; k++)
                {
                    var cell = cells[k];
                    //if the cell around is not discovered, then discover it
                    if (cell.value() == interpretations[0])
                        self.discoverCell(cell.x, cell.y);
                }
            }
            self.freeSpaces--;
            if(self.freeSpaces == 0)
                self.win();
        }
    };

    self.discoverAround = function(X,Y)
    {
        var cell = self.board.getCell(X,Y);

        //if the cell is not e number, then return
        if (cell.minesAround()== null || cell.minesAround() <= 0)
            return;

        //var mines around
        var minesAround = cell.minesAround();

        //mines marked to check
        var minesMarkedAround = 0;

        var cells = self.board.getCellsAround(X,Y);
        for (var i = 0; i < cells.length; i++)
            if (cells[i].value() == interpretations[3])
                minesMarkedAround++;

        //if minesAround is not equals to the marked then is an user error
        if (minesAround != minesMarkedAround)
            return;

        for (var i = 0; i < cells.length; i++)
            if (cells[i].value() == interpretations[0])     //if each cell around is undiscovered then discover it
                self.discoverCell(cells[i].x, cells[i].y);
    };

    self.constructor();
}