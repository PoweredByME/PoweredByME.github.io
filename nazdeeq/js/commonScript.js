/*
    All the common code is in here.
    Like the code related to navbar,
    footer and functions like the
    smoothScrolling() and onScrollAction()
*/


////////////////////////////////////////////////
// This function triggers the events when the
// view is scrolled.
// Input : 
//      - element : jQuery element e.g. $(".something").
//      - offset : some ratio of the window height e.g. $(window).height() / 2.5;
//      - globalvariable_r : a global variable flag to save the state of the trigger e.g. var aboutUsDivImageAnimeTrigger_flag = { flag: false };
//      - callback : the function is called which the function triggers e.g. function(){ //code }
////////////////////////////////////////////////
function onScrollAction(element, offset, globalvariable_r, callback) {
    if (!element.length) { return; }
    var top = element.offset().top - $(window).scrollTop();
    var trigger_offset = $(window).innerHeight() - offset;
    if (top <= trigger_offset && globalvariable_r.flag == false) {
        callback();
        globalvariable_r.flag = true;
        //console.log( element.attr("class") +" lepos = " + top + " " + trigger_offset + " " + globalvariable_r.flag);
    } else if (top > trigger_offset && globalvariable_r.flag == true) {
        callback();
        globalvariable_r.flag = false;
        //console.log( element.attr("class") +" lepos = " + top + " " + trigger_offset + " " + globalvariable_r.flag);
    }
}


////////////////////////////////////////////////
/////   The function for smooth scrolling.
/////   BORROWED FROM INTERNET.
////////////////////////////////////////////////
function smoothScroolling() {
    // Select all links with hashes
    $('a[href*="#"]')
        // Remove links that don't actually link to anything
        .not('[href="#"]')
        .not('[href="#0"]')
        .click(function(event) {
            // On-page links
            if (
                location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
                location.hostname == this.hostname
            ) {
                // Figure out element to scroll to
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                // Does a scroll target exist?
                if (target.length) {
                    // Only prevent default if animation is actually gonna happen
                    event.preventDefault();
                    $('html, body').animate({
                        scrollTop: target.offset().top
                    }, 1000, function() {
                        // Callback after animation
                        // Must change focus!
                        var $target = $(target);
                        $target.focus();
                        if ($target.is(":focus")) { // Checking if the target was focused
                            return false;
                        } else {
                            $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                            $target.focus(); // Set focus again
                        };
                    });
                }
            }
        });

}

smoothScroolling();