"use strict";

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

window.addEventListener('message', function(event) {
    if (event.data.message === 'return-click-ids') {
	var urlVars = getUrlVars();
	if (urlVars['gclid']) {
	    return event.source.postMessage({ gclid: urlVars['gclid'] }, event.origin);
	} else if (urlVars['msclkid']) {
	    return event.source.postMessage({ gclid: urlVars['msclkid'] }, event.origin);
	}
    }
    return;
}, false);
