define(['require', 'jquery' ,'./chat'], function (require, $, SocketChat) {
    $('#login_form').submit(function (e) {
        var userdata = {
            'username': $('#username').val()
        };
        
        var opts = {
            div: $('#main-chat'),
            success: function (success) {
                $('#overlay').addClass('hidden');
                $('#chat').removeClass('hidden');
            },
            room: $('#first-room').val()
        };
        var chat = new SocketChat.SocketChat(userdata, opts);
        e.preventDefault();
        return false;
    });

});