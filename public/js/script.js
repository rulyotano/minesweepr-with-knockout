var viewModel = null;
Array.prototype.remove = function(index){
    return this.slice(0, index).concat(this.slice(index + 1, this.length));
};

function startPoint()
{
    var viewModel = new mainViewModel();

    //var cell = viewModel.board.getCell(4,4);
    //cell.value("asdasd");
    ko.applyBindings(viewModel);
}

$(document).ready(startPoint);

