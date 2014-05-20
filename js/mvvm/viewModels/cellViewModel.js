/**
 * Created by Raul on 5/19/2014.
 */
function cellViewModel(x,y,model)
{
    var self = this;

    self.x = x;
    self.y = y;
    self.model = model;
    self.value = ko.observable(interpretations[0]);  //undiscovered by default
    self.minesAround = ko.observable();
    self.rightButtonClicked = false;
    self.leftButtonClicked = false;
    self.alreadyHandledButtonEvents = false;
    //methods

    self.onMouseUp=function(viewmodel, evnt){
        if (!self.alreadyHandledButtonEvents)
        {
            if (evnt.button == 1 || evnt.button == 0)       //left
            {
                self.model.discoverCell(self.x, self.y);     //discover that cell
            }
            else if (evnt.button == 2) //right
            {
                self.model.markUnmarkMine(self.x, self.y);
            }
        }
        self.resetButtonsStatus();
    };
    self.onMouseDown=function(viewmodel, evnt){
        if (evnt.button == 1 || evnt.button == 0)       //left
        {
            if (self.rightButtonClicked)
            {
                //both buttons pressed
                self.alreadyHandledButtonEvents = true;
                self.discoverCellsAround();
            }
            else
                self.leftButtonClicked = true;
        }
        else if (evnt.button == 2) //right
        {
            if (self.leftButtonClicked)
            {
                //both buttons pressed
                self.alreadyHandledButtonEvents = true;
                self.discoverCellsAround();
                evnt.preventDefault();
                return false;
            }
            else
                self.rightButtonClicked = true;
        }
    };

    self.resetButtonsStatus = function(){
        self.rightButtonClicked = false;
        self.leftButtonClicked = false;
        self.alreadyHandledButtonEvents = false;
    };
    self.discoverCellsAround= function(viewmodel,evnt){
        self.model.discoverAround(self.x, self.y);
    };
}