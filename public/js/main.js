$(function() {
    console.log("HERE")
    $('#getKey').click(function(e) {
        console.log("HER")
        $.get('/users/apikey', function(data) {
            $('#results').html(data);
        });
    });
});
