# jQuery Form Placeholder
[HTML5 `placeholder` attribute](http://www.w3.org/TR/html5/common-input-element-attributes.html#the-placeholder-attribute) enabler in old browsers.

## Requirements
* [jQuery](http://jquery.com) 1.3 or later

## Author
* Milly (http://d.hatena.ne.jp/MillyC/)

## Lisence
* CC BY-SA (http://creativecommons.org/licenses/by-sa/3.0/)

## Usage

Options:
* `enabled`  {Boolean} - enabled placeholder (Default: auto)
* `elements` {String}  - form elements selector (Default: ':text,:password,textarea')
* `attr`     {String}  - placehold message attribute (Default: 'placeholder')
* `color`    {String}  - placehold color (Default: 'silver')
* `cssClass` {String}  - placehold class (Default: 'placeholder')
* `message`  {String}  - placehold message (Default: '')

HTML Example:
	<form>
	  <input type="text" name="name" placeholder="Your name" />
	  <input type="text" name="email" placeholder="Your e-mail" />
	</form>

Script Example:
	// Setup placeholder
	$('form').placehold();
	// Disable placeholder
	$('form').placehold({enabled:false});
	// Set placehold color and message
	$(':text[name=email]').placehold({ color: '#ff8888', message: 'Your e-mail' });
	// Set global options
	$.fn.placehold.conf.color = '#ff8888';
	// Get Placeholder instance, and clear placehold message
	$('#email').data('placehold').clear();
