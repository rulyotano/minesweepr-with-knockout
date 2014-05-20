/**
 * Created by Raul on 5/19/2014.
 */
function boardViewModel (height, width, model)
{
    var self = this;

    self.height = height;
    self.width = width;

    var directionsX = [-1, 0, 1, 0,-1, 1, 1,-1];
    var directionsY = [ 0, 1, 0,-1, 1, 1,-1,-1];
    //directions: up-right-down-left-(up&right)-(down&right)-(down&left)-(up&left)

    self.model = model;
    self.rows = ko.observableArray();
    for(var i = 0; i < height; i ++)
        self.rows.push(new rowViewModel(width, i, self.model));


    self.getCell = function(i,j)
    {
        return self.rows()[i].cells()[j];
    };

    self.getCellsAround = function(X,Y)
    {
        var result = [];
        for (var d =0; d<8; d++)
        {
            var currentX = X + directionsX[d];
            var currentY = Y + directionsY[d];
            if (currentX>=0 && currentX < self.height && currentY>=0 && currentY < self.width)
                result.push(self.getCell(currentX, currentY));
        }
        return result;
    };

    self.updateBoard = function(rowsToAdd, columsToAdd)
    {
        var oldHeight = self.height;

        self.height = self.height + rowsToAdd;
        self.width = self.width + columsToAdd;

        //add columns
        for(var x = 0; x < oldHeight; x++)
        {
            self.rows()[x].updateRow(columsToAdd);
        }

        //add rows
        if (rowsToAdd < 0)
        {
            var rowsToRemove = Math.abs(rowsToAdd);
            for (var x = rowsToRemove; x > 0; x--)
                self.rows.pop();
        }
        else
        {
            for (var x = oldHeight; x < self.height; x++)
                self.rows.push( new rowViewModel(self.width, x, self.model));
        }
    };

}