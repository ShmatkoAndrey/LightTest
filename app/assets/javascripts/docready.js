$(document).ready(function(){
    updatePostsSize();
});

$( window ).resize(function() {
    updatePostsSize();
});

function updatePostsSize() { // Растягивает блок posts до конца экрана 
    var h = 20;
    if ($('#login').length == 0) {

        h += $('#send-post').height();
        h += $('#logout').height();
        h += 20;
    }
    else {
        h += $('#login').height();
    }
    $('#posts').css('height', $(window).height() - h);
}