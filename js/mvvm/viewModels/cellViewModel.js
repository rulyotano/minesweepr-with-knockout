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
    //methods

    self.onMouseUp=function(viewmodel, evnt)
    {


        if (evnt.button == 1 || evnt.button == 0)       //left
        {
            self.model.discoverCell(self.x, self.y);     //discover that cell
        }
        else if (evnt.button == 2) //right
        {
            self.model.markUnmarkMine(self.x, self.y);
//            evnt.currentTarget.unbind("mouseup");
        }
    };

    self.discoverCellsAround= function(viewmodel,evnt)
    {
        self.model.discoverAround(self.x, self.y);
    };
    self.onContextMenu = function(viewmodel,evnt)
    {
        evnt.preventDefault();
        return false;
    }
}