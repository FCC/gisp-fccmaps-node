jQuery('document').ready(function() {
   jQuery('a[rel*=lightbox]').lightBox();

});

function setCookie(c_name,value,expiredays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : ";expires="+exdate.toUTCString());
}

function saveFilledData() {
	setCookie('formValues',jQuery('#signupForm').serialize());
}

