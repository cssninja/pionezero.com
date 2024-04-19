// Disables prettyPhoto if screen small
$(window).resize(function() {

if ((Modernizr.mq('only screen and (max-width: 600px)') || Modernizr.mq('only screen and (max-height: 520px)')) && mediaQuery == 'desk') {

$("a[rel^='prettyPhoto']").unbind('click.prettyphoto');
mediaQuery = 'mobile';

} else if (!Modernizr.mq('only screen and (max-width: 600px)') && !Modernizr.mq('only screen and (max-height: 520px)') && mediaQuery == 'mobile') {
$("a[rel^='prettyPhoto']").prettyPhoto(prettyPhotoSettings);
mediaQuery = 'desk';
}

});