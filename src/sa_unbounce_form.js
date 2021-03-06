"use strict";

function saunbounce() {
    function request(options) {
	/*
	 * options: {
	 *   type[str]: POST | GET,
	 *   url[str]: devbed url,
	 *   data[obj]: data for payload,
	 *   encoded[enum]: 'devbed', 'partners',
	 *   success[fn]: success callback function
	 *   error[fn]: error callback function
	 * }
	 */
	if (!options.url || !options.type) return;

	const http = new XMLHttpRequest();
	http.open(options.type, options.url, true);

	http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
	if (options.encoded === 'devbed') {
	    http.setRequestHeader("Authorization", 'Basic ' + btoa('saguest:9y4vu'));
	} else if (options.encoded === 'partners') {
	    http.setRequestHeader('X-API-KEY', '589374c5ebbcf9403e58c145207799c87aec278b');
	}

	http.onreadystatechange = function () {
	    if (http.readyState === 4 && http.status === 200) {
		if (typeof options.success === 'function') {
		    options.success(JSON.parse(http.response));
		}
	    } else {
		if (typeof options.error === 'function') {
		    options.error(http);
		}
	    }
	};

	http.send(options.data || null);
    }

    function populateFields(data) {
	this.marketData = data.data;

	var filterOptions = [
	    { target: 'size_of_organization',	filter: 'sizes' },
	    { target: 'industry',		filter: 'segments' },
	    { target: 'software_features',	filter: 'modules' },
	];

	for (var i = 0; i < filterOptions.length; i++) {
	    var elm = document.getElementById(filterOptions[i].target);
	    if (elm) {
		if (elm.nodeName.toLowerCase() === 'select') {
		    addOptionsToSelect(this.marketData.filters[filterOptions[i].filter].options, elm);
		}
	    } else {
		// check for container groups (i.e. radios and checkboxes)
		var containerElm = document.getElementById('container_' + filterOptions[i].target);
		if (containerElm) {
		    var addOptionsToGroupBound = addOptionsToGroup.bind(this);
		    if (containerElm.classList.contains('radio-group')) {
			addOptionsToGroupBound('radio', this.marketData.filters[filterOptions[i].filter].options,
					   containerElm.querySelector('#group_' + filterOptions[i].target));
		    } else if (containerElm.classList.contains('checkbox-group')) {
			addOptionsToGroupBound('checkbox', this.marketData.filters[filterOptions[i].filter].options,
					   containerElm.querySelector('#group_' + filterOptions[i].target));
		    }
		}
	    }
	}

	function addOptionsToGroup(type, options, parent) {
	    if (!options || !parent || !type) return;

	    if (type === 'checkbox' && parent.id.indexOf('software_features') === -1) {
		alert('Currently only Software Features (modules) support checkbox groups. Please change ' +
		      parent.id.replace('group_', '') + ' to either a select or radio group.');
		return;
	    }

	    for (var i = 0; i < options.length; i++) {
		var option = document.createElement('div'),
		    input = document.createElement('input'),
		    label = document.createElement('label');
		option.classList.add('option');
		option.style.position = 'relative';

		input.type = type;
		input.id = parent.id + '_' + type +'_' + i;
		input.value = options[i].id;
		if (type === 'radio') {
		    input.addEventListener('change', (radioClick).bind(this));
		} else if (type === 'checkbox') {
		    input.addEventListener('change', (checkboxClick).bind(this));
		}

		label.innerHTML = options[i].label;
		label.setAttribute('for', input.id);

		option.appendChild(input);
		option.appendChild(label);
		parent.appendChild(option);
	    }
	}

	function addOptionsToSelect(options, select) {
	    if (!options || !select) return;

	    for (var i = 0; i < options.length; i++) {
		var option = document.createElement('option');
		option.text = options[i].label;
		option.value = options[i].id;
		select.add(option);
	    }
	}

	function checkboxClick(event) {
	    var parent = event.target.parentNode.parentNode,
		id = parent.id.replace('group_', '');

	    this[id] = this[id] || [];

	    if (event.target.checked) {
		this[id].push(event.target.value);
	    } else {
		this[id].splice(this[id].indexOf(event.target.value), 1);
	    }
	}

	function radioClick(event) {
	    // Uncheck all other radios
	    if (event.target.checked) { // For multiple fires
		var parent = event.target.parentNode.parentNode,
		    children = parent.querySelectorAll('.option > input[type=radio]');

		this[parent.id.replace('group_', '')] = event.target.value;

		for (var i = 0; i < children.length; i++) {
		    if (children[i].id !== event.target.id) {
			children[i].checked = false;
		    }
		}
	    }
	}
    }

    function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
	});
	return vars;
    }


    function initialPageValidation() {
	var urlVars = getUrlVars();
	this.formElms = this.formElms || {};
	this.formElms.fname	= document.getElementById('first_name');
	this.formElms.lname	= document.getElementById('last_name');
	this.formElms.email	= document.getElementById('email');
	this.formElms.size	= document.getElementById('size_of_organization');
	this.formElms.industry	= document.getElementById('industry');
	this.formElms.features	= document.getElementById('software_features');
	this.formElms.phone	= document.getElementById('phone_number');
	this.formElms.company	= document.getElementById('company_name');
	this.formElms.formType	= document.getElementById('form_type');
	this.formElms.leadType	= document.getElementById('lead_type');
	this.clickIds = {
	    parnter_id:		urlVars['partner_id'],
	    utm_gclid:		urlVars['gclid'],
	    utm_msclkid:	urlVars['msclkid'],
	    utm_campaign:	urlVars['utm_campaign'],
	    ga_source:		urlVars['utm_source'],
	    ga_medium:		urlVars['utm_medium'],
	    gwo_variation:	urlVars['gwo_variation'],
	};

	if (!this.clickIds.gclid && !this.clickIds.msclkid) {
	    // Since we didn't find the clickids in the url, we might be in an iframe
	    // Post a message asking the parent window for click ids
	    var that = this;
	    window.parent.postMessage({
		message: 'return-url-vars'
	    }, '*');
	    window.addEventListener('message', function(event) {
		console.log('child frame received this message: ', event);
		if (event.data.partner_id)	{ that.clickIds.partner_id	= event.data.partner_id }
		if (event.data.utm_gclid)	{ that.clickIds.utm_gclid	= event.data.utm_gclid }
		if (event.data.utm_msclkid)	{ that.clickIds.utm_msclkid	= event.data.utm_msclkid }
		if (event.data.utm_campaign)	{ that.clickIds.utm_campaign	= event.data.utm_campaign }
		if (event.data.ga_source)	{ that.clickIds.ga_source	= event.data.ga_source }
		if (event.data.ga_medium)	{ that.clickIds.ga_medium	= event.data.ga_medium }
		if (event.data.gwo_variation)	{ that.clickIds.gwo_variation	= event.data.gwo_variation }

	    }, false);
	}


	if (!this.formElms.fname || !this.formElms.lname || !this.formElms.email) {
	    alert('First name, last name and email are all required');
	    return false;
	}
	if (!this.formElms.size) {
	    var size = document.getElementById('container_size_of_organization');
	    if (!size || size.classList.contains('checkbox-group')) {
		alert('The size_of_organization field is required and only supports select dropdowns or radio group types. If you do not want the user to be presented with the option, please add it as a hidden field with a valid default value.');
		return false;
	    }
	}
	if (!this.formElms.industry) {
	    var industry = document.getElementById('container_' + 'industry');
	    if (!industry || industry.classList.contains('checkbox-group')) {
		alert('The industry field is required and only supports select dropdowns or radio group types. If you do not want the user to be presented with the option, please add it as a hidden field with a valid default value.');
		return false;
	    }
	}
	if (!this.formElms.features) {
	    var features = document.getElementById('container_' + 'software_features');
	    if (!features) {
		alert('The features field is required, please add it to the form. If you do not want the user to be presented with the option, please add it as a hidden field with a valid default value.');
		return false;
	    }
	}

	return true;
    }

    function processForm() {
	var form = document.querySelector('form');
	var errorDisplay = document.querySelector('.lp-form-errors');

	function isHidden(el) {
	    var style = window.getComputedStyle(el);
	    return (style.display === 'none')
	}

	if (!form || !isHidden(errorDisplay)) return false;

	if (!this.marketData['industry_id']) {
	    throw new Error('No industry id specified for this form');
	};

	var apiData = {
	    'market_id': this.marketData['industry_id'] * 1,
	    'type': this.formElms.formType ? this.formElms.formType.value : 'multiquote',
	    'segment_id': this.formElms.industry ? (this.formElms.industry.value * 1) : (this.industry * 1),
	    'modules': (this.formElms.features && this.formElms.features.value)
	    	? [ this.formElms.features.value ]
	    	: this['software_features'],
	    'size_id': this.formElms.size ? (this.formElms.size.value * 1) : (this['size_of_organization'] * 1),
	};
	for (var i = 0; i < form.length; i++) {
	    switch (form[i].id) {
	    case 'first_name':
		apiData.f_name = form[i].value;
		break;
	    case 'last_name':
		apiData.l_name = form[i].value;
		break;
	    case 'email':
		apiData.email = form[i].value;
		break;
	    case 'phone_number':
		apiData.phone = form[i].value;
		break;
	    case 'company_name':
		apiData.company = form[i].value;
		break;
	    default:
		break;
	    }
	}

	if (this.clickIds.partner_id)		{ apiData.partner_id	= this.clickIds.partner_id; }
	if (this.clickIds.utm_gclid)		{ apiData.utm_gclid	= this.clickIds.utm_gclid; }
	if (this.clickIds.utm_msclkid)		{ apiData.utm_msclkid	= this.clickIds.utm_msclkid; }
	if (this.clickIds.utm_campaign)		{ apiData.utm_campaign	= this.clickIds.utm_campaign; }
	if (this.clickIds.ga_source)		{ apiData.ga_source	= this.clickIds.ga_source; }
	if (this.clickIds.ga_medium)		{ apiData.ga_medium	= this.clickIds.ga_medium; }
	if (this.clickIds.gwo_variation)	{ apiData.gwo_variation = this.clickIds.gwo_variation; }

	request({
	    url: 'https://api.softwareadvice.com/v0/conversions',
	    type: 'POST',
	    encoded: 'partners',
	    data: JSON.stringify(apiData),
	    success: function(res) {
		//
	    },
	    error: function(err) {
		handleErrors({
		    message: 'Could not save conversion',
		    dataSent: apiData,
		    error: err
		});
	    }
	});

	return true;
    }

    const validate = initialPageValidation.bind(this);
    if (validate()) {
	var industryId = document.querySelector('#Industry_Id');

	if (industryId) {
	    request({
		url: 'https://products-api.softwareadvice.com/v0/categories/by_uri/'+industryId.value+'/us',
		type: 'GET',
		success: (populateFields).bind(this)
	    });
	}

	var submitBtnId = document.querySelector('#submit_id');
	if (submitBtnId && submitBtnId.value) {
	    var submitBtn = document.querySelector(submitBtnId.value);
	    var that = this;
	    submitBtn.addEventListener('click', function(e) {
		e.preventDefault();
		window.setTimeout((processForm).bind(that), 0); // Wait for the event loop to clear before proceeding
	    });
	}
    }
}

function handleErrors(error) {
    console.log('error caught!');
    console.error(error);
}

try {
    const init = saunbounce.bind({});
    init();
    // saunbounce();
} catch (error) {
    handleErrors(error)
}

