/*
    This file contains css related to 
    index.html, signup.html, login.html
*/

/* use this function to set the explore and popular lists of search bar
function search_bar_set_explore_popular_list(explore, popular)
*/

// This function gets called when the window gets loaded
function windowOnLoad() {
    $(".the-body").removeClass("body-no-scroll");
    $(".button-collapse").sideNav();
    $(".dash-status").each(function(i, ele) {
        var content = $(this).html().trim().toUpperCase().replace(/\s/g, '');
        if (content == "PENDING") {
            $(this).addClass("orange-text");
        } else if (content == "COMPLETED") {
            $(this).addClass("green-text");
        } else if (content == "INPROGRESS") {
            $(this).addClass("blue-text");
        }
    });

    seachBarInit();
    windowOnScroll();
    windowOnResize();
}

// This function gets called when the window gets resized
function windowOnResize() {

}


var hw_flag = { flag: false };
var op_flag = { flag: false };
var vid_flag = { flag: false };
// This function gets called when the window gets scrolled
function windowOnScroll() {
    var offset = $(window).innerHeight();
    onScrollAction($(".hw-content-row"), offset * 0.2, hw_flag, function() {
        $(".hw-col").toggleClass("show");
        $(".hw-heading").toggleClass("show");
    });

    onScrollAction($(".op-content-row"), offset * 0.1, op_flag, function() {
        $(".op-col").toggleClass("show");
        $(".op-heading").toggleClass("show");
    });

    onScrollAction($(".vid-div"), offset * 0.4, vid_flag, function() {
        $(".vid-div").toggleClass("show");
        $(".vid-div-btn").toggleClass("show");
    });
}

function onSignUpLoad() {
    var interests_list = [
        "Baby",
        "Home Appliance",
        "Arts",
        "Crafts & Sewing",
        "Cars & Automotive",
        "Beauty & Personal Care",
        "Books",
        "Cellphones & accessories",
        "Clothing & Fashion",
        "Jewelry",
        "Collectible & Fine Art",
        "Computers & Laptops",
        "Electronics & Gadgets",
        "Gardens & Outdoor",
        "Handmade",
        "Health & Household",
        "Home & Kitchen",
        "Luggage & Travel Gears",
        "Luxury Products",
        "Musical Instruments",
        "Office Products",
        "Pets Supplies",
        "Sports & Outdoors",
        "Tools & Home Improvement",
        "Toys & Games",
        "Video Games"
    ]
    var sdp = $(".s-dropdown");
    interests_list.forEach(function(val, index) {
        sdp.append("<option value=" + index + ">" + val + "</option>")
    })


    $('select').material_select();
    $('.select-dropdown').addClass('ak-field-select');
    $('.caret').addClass("hide");

    $('select').on('change', function() {
        var s = "";
        var num = 1;
        $(this).val().forEach(function(val, index) {
            var color = "orange";
            if (num > 1) {
                color = "pink";
                num = 0;
            }
            s = s + '<div class="chip site-theme-' + color + ' site-theme-white-text" style = "font-weight:400;border-radius:3px;;">' + interests_list[val] + '</div>'
            num++;
        })
        $('.interests-chip-div').empty();
        $('.interests-chip-div').append(s);
        $('.select-dropdown').val("Choose your Interests");
    })
}

var sb_explore = [];
var sb_popular = [];

// use this function to set the explore and popular lists of search bar
function search_bar_set_explore_popular_list(explore, popular) {
    sb_explore = explore;
    sb_popular = popular;
    $(".search-sugg-large").html(getSearchLinksString(sb_explore, sb_popular));
    $(".search-sugg-small").html(getSearchLinksString(sb_explore, sb_popular));
}

// When the search bar is typed on this function will be called with the string being input in the 
// search input
function onSearch(search_str) {
    console.log(search_str);
    // ---- Code
}

function seachBarInit() {
    search_bar_set_explore_popular_list(sb_explore, sb_popular);
    $(".myhideclass ").hide();
    $(".myhideclass ").removeClass("hide");
    var sil_ele = $(".search-in-large");
    var sis_ele = $(".search-in-small");

    sil_ele.focus(function() {
        $(".search-sugg-large").show(500)
    });
    sil_ele.focusout(function() {
        $(".search-sugg-large").hide(500)
    });

    sis_ele.focus(function() {
        $(".search-sugg-small").show(500)
    });
    sis_ele.focusout(function() {
        $(".search-sugg-small").hide(500)
    });

    sil_ele.keyup(function() {
        var search = (sil_ele.val());
        onSearch(search);
    });

    sis_ele.keyup(function() {
        var search = (sis_ele.val());
        onSearch(search);
    });

}



function getSearchLinksString(explore_links, popular_searches) {
    var links_starting_row = '<div class="row" style="margin-bottom : 0px;"><div class="col l2 left-align"> <p class="site-theme-light-grey-text fw-400">Explore Amazon</p>  </div></div><div style="margin-left: auto;margin-bottom: 12px;" class="row left-align sugg-links"><a class="btn btn-options default-sugg-btn z-depth-0" >All</a>';
    var explore_buttons = "";
    for (i in explore_links) {
        var temp_button = '<a class="btn btn-options white site-theme-grey-text z-depth-0 sugg-btn" href="' + explore_links[i].link + '">' + explore_links[i].name + '</a>';
        explore_buttons += temp_button;
    }
    links_starting_row += explore_buttons;
    links_starting_row += '</div>';
    var search_links = "";
    var searches_starting_row = '<div class="row" style="margin-bottom:0px"> <div class = "col l2 left-align" ><p class = "site-theme-light-grey-text fw-400" style = "margin-top: 0px;" > Popular Searches </p> </div> </div> <div class = "row left-align sugg-div" > ';

    for (i in popular_searches) {
        var temp_searches = '<a class="btn-options site-theme-pink-text" style="margin-right:16px" href="' + popular_searches[i].link + '">' + popular_searches[i].name + '</a>';
        search_links += temp_searches;
    }
    searches_starting_row += search_links;
    searches_starting_row += '</div>';

    var final_string = links_starting_row + searches_starting_row;
    return final_string;


}


function iAmazonBanner(banner_data_list) {
    s = "";
    banner_data_list.forEach(function(obj, i) {
        s += iAmazonBanner_template(obj);
    });

    return s;
}

function iAmazonBanner_template(items_list) {
    var s = '<div class="i-amazon-banner site-theme-white"><div class="container"><div class="row"><div class="col l3 m4" style="display:flex;align-items:center"><p class="site-theme-grey-text fw-600">Interesting finds on Amazon</p></div>';
    items_list.forEach(function(obj, i) {
        s += '<div class="col l1 m1"><a href="' + obj.href + '"><img style="height:42px;margin-top:4px; margin-bottom:4px" src="' + obj.img + '"></a></div>';
    });
    s += '<div class="col l3 m3" style="display:flex;align-items:center"><a style="margin-left:auto" target="_blank" href="https://www.amazon.com/"><img style="height:36px;margin-top:10px; margin-bottom:10px" src="assets/img/alogo.png"></a></div></div></div></div>';
    return s;
}