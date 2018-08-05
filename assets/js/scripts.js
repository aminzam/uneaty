/* css class name for the background images */
var backgroundClassName = 'fullback';
/* duration in ms for background fade animation */
var backgroundFadeDuration = 400;
/* background parallax effect speed; a speed equal to 1 is behaves like normal scrolling */
var parallaxSpeed = 0.4;

$(document).ready(function () {
    /* initialiing the dynamic content */
    init();

    /* binding functions to page events */
    $(window).bind({
        //after all page elements has been loaded
        load: function () {
            //site pre loader
            $('#preloader').fadeOut(400, function () {
                // stuff after loading has completed
            });

            //binding waypoints to sections for background swapping
            $('section').waypoint(function (direction) {
                if (direction === 'down') {
                    checkBackgroundSwap($(this), direction);
                }
            }, {
                offset: '60%'
            }).waypoint(function (direction) {
                if (direction === 'up') {
                    checkBackgroundSwap($(this), direction);
                }
            }, {
                offset: '5%'
            });

            //binding waypoints to animated objects
            $('.animation').waypoint(function () {
                var $animation = $(this).data('animation-effect'),
                    $delay = $(this).data('animation-delay'),
                    $duration = $(this).data('animation-duration');
                if (typeof $delay !== "undefined") {
                    $(this).css('animation-delay', $delay);
                    $(this).css('-webkit-animation-delay', $delay);
                }
                if (typeof $duration !== "undefined") {
                    $(this).css('animation-duration', $duration);
                    $(this).css('-webkit-animation-duration', $duration);
                }
                $(this).addClass($animation);
                $(this).addClass('animated');
            }, {
                offset: '70%'
            });
        },
        //whenever window is resized
        resize: function () {
            //resize background images based on current window size
            $('.' + backgroundClassName + ' img').each(function () {
                resizeImage($(this));
                //reseting offset values
                $(this).css('top', '0').attr('data-offset', 0);
            });
            //update menu marker position
            if (!onSmallScreen()) {
                //check if the menu is visibile in large view
                if ($('#sidebar').is(':hidden'))
                    $('#sidebar').css('display', 'block');
                updateMarker($("li.active > a"));
            } else {
                //hide the menu on small view
                hideMenu();
            }
        },
        //whenever the page is scrolled
        scroll: function () {
            //perform parallax scrolling effect on the background
            parallaxBackground();
        }
    });

    /* activate scrollspy menu */
    $(document.body).scrollspy({
        target: '#leftCol',
        offset: 350
    });

    /* scrolling with smooth animation */
    $('a[href*=#]:not([href=#]):not([href="#mainCarousel"]):not(.popup-modal)').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').stop().animate({
                    scrollTop: target.offset().top - 100
                }, 1000, 'easeInQuart');
                return false;
            }
        }
    });

    /* gallery filtering (jquery.mixitup library) */
    $('#filtercontainer').mixItUp();

    /* enabling bootstrap tooltips */
    $('*[data-toggle="tooltip"]').tooltip();
});

/* hide/show scroll top button */
$(window).scroll(function () {
    var scroll = $(window).scrollTop();

    if (scroll > 100)
        $('#scroll-top').fadeIn();
    else
        $('#scroll-top').fadeOut();
});

/* this function shows/hides submenus */
$('#leftCol').on('activate.bs.scrollspy', function () {
    var currentItems = $("li.active > a", this);
    var currentParent = currentItems.eq(0); /* current parent of the active menu item */
    var currentChild = currentItems.eq(1); /* current subitem of the active menu item */

    /* on small view skip the rest of this function */
    if (onSmallScreen())
        return;

    /* foreach collapse submenu see if it should be hidden or visible */
    $('.collapse').each(function () {
        var isCurrent = false;
        /* detecting the current active submenu based on item href */
        if (currentChild.length && $(this).has('a[href="' + currentChild.attr('href') + '"]').length)
            isCurrent = true;
        /* detecting the current active submenu based on parent item href */
        if ($(this).closest('li').children('a').attr('href') == currentParent.attr('href'))
            isCurrent = true;
        if (isCurrent) {
            if ($(this).is(':hidden')) // if the submenu is active and hidden, show it
                $(this).stop().slideDown(400);
        } else {
            if ($(this).is(':visible')) // if the submenu is not active and visible, hide it
                $(this).stop().slideUp(400);
        }
    });

    // update marker position
    if (currentChild.length)
        updateMarker(currentChild);
    else
        updateMarker(currentParent);
});

/* this function updates marker position */
function updateMarker(item) {
    if (typeof item !== "undefined" && typeof item.offset() !== "undefined") {
        /* wait for other animations to complete */
        $('.collapse:animated').promise().done(function () {
            $('#marker').stop().animate({
                top: item.offset().top - $('#sidebar').offset().top // find the item position relative to the window top
            });
        });
    }
}

/* toggle the menu on click */
$('#sidebar-toggler').click(function () {
    toggleMenu();
});

/* close the menu after clicking on menu items */
$('#sidebar a').click(function () {
    toggleMenu();
});

/* close the menu if user clicks outside the menu */
$('html').click(function () {
    if (onSmallScreen())
        if ($('#sidebar').is(':visible'))
            hideMenu();
});

/* fix for menu close by click on small screens */
$('#sidecontainer').click(function (event) {
    if (onSmallScreen())
        event.stopPropagation();
});

/* this function toggles the menu visibility on small screens */
function toggleMenu() {
    if (onSmallScreen()) { // only if small
        $('#sidebar ul').css('display', 'block');
        if ($('#sidebar').is(':hidden'))
            showMenu();
        else
            hideMenu();
    }
}

/* this function displays the small menu with animation */
function showMenu() {
    //$('#sidebar').stop().slideDown();
    $('#sidebar')
        .css('opacity', 0)
        .slideDown('slow')
        .animate({
            opacity: 1
        }, {
            queue: false,
            duration: 'slow'
        });
}

/* hides the drop down menu */
function hideMenu() {
    $('#sidebar').stop().slideUp();
}

/* smooth scrolling for scroll to top button */
$('#scroll-top').click(function () {
    $('html,body').animate({
        scrollTop: 0
    }, 1000, 'easeInQuart');
});


/* detect small screen */
function onSmallScreen() {
    return $('#sidebar-toggler').is(':visible');
}

/* initializing dynamic page content */
function init() {
    //adding background iamges
    var container = $('<div/>', {
        'class': backgroundClassName
    });
    var images = [];
    $("[data-bg]").each(function () {
        if ($.inArray($(this).attr('data-bg'), images) < 0)
            images.unshift($(this).attr('data-bg'));
    });

    $.each(images, function (index, value) {
        var img = $('<img/>', {
            src: value,
            'data-active': ((index == images.length - 1) ? 'true' : 'false'),
            'data-offset': -1,
            'data-scroll': -1
        });
        img.load(function () {
            resizeImage($(this), ((index == images.length - 1) ? 'inline' : 'none'));
        });
        img.appendTo(container);
    });

    //adding the background dotted layer
    $('<div/>', {
        'class': 'back-overlay'
    }).appendTo(container);
    container.appendTo(document.body);

    //adding menu marker
    $('<a/>').appendTo($('<li/>', {
        id: 'marker'
    }).prependTo($('#sidebar')));
}

/* this function returns the ucrrent active background */
function getCurrentBackground() {
    return $('.' + backgroundClassName + ' img[data-active="true"]');
}


/* gets the image by its source */
function getImageBySrc(src) {
    var res = $('img[src$="' + src + '"]');
    return res;
}

/* this function checks to see if a background swap is required */
function checkBackgroundSwap($this, direction) {
    var $image = getCurrentBackground();
    var $window = $(window);
    //if the current background is different than this background
    if (typeof ($image.attr('src')) === "undefined" || ($image.attr('src') != $this.attr('data-bg'))) {
        var $newBack = getImageBySrc($this.attr('data-bg'));
        $('.' + backgroundClassName + ' img').attr('data-active', 'false');
        $newBack.attr('data-scroll', $window.scrollTop());
        if (direction === 'down') {
            $newBack.data('offset', 0);
            $image.data('offset', parseInt($image.css('top')));
        }
        if (direction === 'up') { }
        $newBack.attr('data-active', 'true');
        swapBackground();
        resizeBackground();
    }
}

/* calculates background offset for parallax effect */
function calcOffset($image) {
    return Math.min(0, -(($(window).scrollTop() - $image.attr('data-scroll')) * parallaxSpeed) + $image.data('offset'));
}

/* this function fades in the current active background */
function swapBackground() {
    var $image = getCurrentBackground();
    var $otherImages = $('.' + backgroundClassName + ' img[data-active="false"]');
    //calculating background offset
    var offset = calcOffset($image);
    //reordering layers of background and dotted layer
    $('.back-overlay').css('z-index', '-900');
    $image.css('z-index', '-950');
    $otherImages.css('z-index', '-990');
    //fade animations
    $otherImages.fadeOut(backgroundFadeDuration);
    $image.css('top', offset).fadeIn(backgroundFadeDuration);
}

/* performs parrallax background effect based on current scroll position */
function parallaxBackground() {
    var $image = getCurrentBackground();
    var $window = $(window);
    var offset = calcOffset($image);
    if (($image.height() + offset >= $window.height()))
        $image.css({
            top: offset
        });
}

/* calculates full-screen image size based on window ratio */
function getImageSize(src) {
    var $window = $(window);
    var image = new Image();
    var width = 0,
        height = 0;
    image.src = src;

    var imageWidth = image.width,
        imageHeight = image.height,
        imageRatio = imageWidth / imageHeight;

    var winWidth = $window.width(),
        winHeight = $window.height(),
        winRatio = winWidth / winHeight;

    if (winRatio > imageRatio) {
        width = winWidth;
        height = Math.round(winWidth / imageRatio);
    } else {
        width = Math.round(winHeight * imageRatio);
        height = winHeight;
    }

    return [width, height];
}

/* resizes the input image */
function resizeImage($img, displayValue) {
    var wh = getImageSize($img.attr('src'));
    if (typeof displayValue === "undefined")
        displayValue = "inline";
    $img.css({
        width: wh[0],
        height: wh[1],
        display: displayValue
    });
}

/* resizes the current background */
function resizeBackground() {
    var $back = getCurrentBackground();
    resizeImage($back);
}