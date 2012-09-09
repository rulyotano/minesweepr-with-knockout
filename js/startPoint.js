function startPoint()
{
    var viewModel = new mainViewModel();

    //var cell = viewModel.board.getCell(4,4);
    //cell.value("asdasd");
    ko.applyBindings(viewModel);
    viewModel.board.rows[4].cells[4].value('unDiscovered');
}
$(document).ready(startPoint);

