/**

	General Tasks

*/




/*
 * Params:
 * 	str: 			(string)	string to have validated
 * 	spacesAllowed:	(bool)		are spaces allowed in the string
 */
G_ValidateAlphaNumeric = function(str, spacesAllowed) {
	
	if(spacesAllowed == true)
		var regex = /^([a-zA-Z0-9 ]+)$/;
	else
		var regex = /^([a-zA-Z0-9]+)$/;
	
	return regex.test(str);
}




/**
 * Replaces a substring within a string with another string
 * @param string haystack			string to search needle with
 * @param string needle				the substring we are searching for
 * @param string str				the replacement string for the needle
 */
G_ReplaceStr = function(haystack, needle, str) {
	return (haystack == undefined || haystack == '') ? false : haystack.split(needle).join(str);
}



G_DecodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
	  str = str.replace(/\\/g, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();

