/**
 * Created by Raul on 5/19/2014.
 */
function messageViewModel()
{
    var self = this;
    self.message = ko.observable();
    self.header = ko.observable();
    self.standardMessage = function (messageText, messageHeader)
    {
        self.message(messageText);
        self.header(messageHeader);
        $("#dialog").dialog({modal:true});
    }
}