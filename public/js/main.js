$(function() {
    $('#getKey').click(function(e) {
        $.get('/users/apikey', function(data) {
            $('#api').html(data);
        });
    });
});
