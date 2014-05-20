/**
 * Created by Raul on 5/19/2014.
 */
function gameConfigViewModel(name, height, width, mines)
{
    var self = this;
    self.gameName = ko.observable(name);
    self.boardHeight = ko.observable(height);
    self.boardWidth = ko.observable(width);
    self.mines = ko.observable(mines);
}