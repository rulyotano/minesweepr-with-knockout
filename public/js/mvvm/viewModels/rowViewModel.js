/**
 * Created by Raul on 5/19/2014.
 */
function rowViewModel (width,rowNumber, model)
{
    var self = this;
    self.width = width;
    self.rowNumber = rowNumber;
    self.model = model;
    self.cells = ko.observableArray();
    for (var i = 0 ; i < width; i++)
        self.cells.push(new cellViewModel(self.rowNumber, i, model));

    self.updateRow = function(columnsToAdd)
    {
        var futureWidth = self.width + columnsToAdd;

        //add rows
        if (columnsToAdd < 0)
        {
            var columnsToRemove = Math.abs(columnsToAdd);
            for (var x = columnsToRemove; x > 0; x--)
                self.cells.pop();
        }
        else
        {
            for (var x = self.width; x < futureWidth; x++)
                self.cells.push( new cellViewModel(self.rowNumber, x, self.model));
        }

        self.width = futureWidth;
    }
}