document.addEventListener('DOMContentLoaded', function() {

  new Typed('#typed6', {
    strings: [
      'Some <i>strings</i> with',
      'Some <strong>HTML</strong>',
      'Chars &times; &copy;'
    ],
    typeSpeed: 80,
    backSpeed: 0,
    loop: true
  });
});

function prettyLog(str) {
  console.log('%c ' + str, 'color: green; font-weight: bold;');
}

function toggleLoop(typed) {
  if (typed.loop) {
    typed.loop = false;
  } else {
    typed.loop = true;
  }
}
