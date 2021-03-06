"use strict";

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

window.addEventListener('message', function(event) {
    if (event.data.message === 'return-url-vars') {
	var urlVars = getUrlVars();
	var urlData = {};
	if (urlVars['partner_id'])	{ urlData.partner_id	= urlVars['partner_id']; }
	if (urlVars['gclid'])		{ urlData.utm_gclid	= urlVars['gclid']; }
	if (urlVars['msclkid'])		{ urlData.utm_msclkid	= urlVars['msclkid']; }
	if (urlVars['utm_campaign'])	{ urlData.utm_campaign	= urlVars['utm_campaign']; }
	if (urlVars['utm_source'])	{ urlData.ga_source	= urlVars['utm_source']; }
	if (urlVars['utm_medium'])	{ urlData.ga_medium	= urlVars['utm_medium']; }
	if (urlVars['gwo_variation'])	{ urlData.gwo_variation = urlVars['gwo_variation']; }

	return event.source.postMessage(urlData, event.origin);
    }
    return;
}, false);

