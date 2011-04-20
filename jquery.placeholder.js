/*!
 * jQuery Form Placeholder
 *
 * @require jQuery 1.3+
 * @author  Milly (http://d.hatena.ne.jp/MillyC/)
 * @license CC BY-SA (http://creativecommons.org/licenses/by-sa/3.0/)
 */

/**
 * Options:
 *   enabled  {Boolean} - enabled placeholder (Default: auto)
 *   elements {String}  - form elements selector
 *                        (Default: ':text,:password,textarea')
 *   attr     {String}  - placehold message attribute (Default: 'placeholder')
 *   color    {String}  - placehold color (Default: 'silver')
 *   cssClass {String}  - placehold class (Default: 'placeholder')
 *   message  {String}  - placehold message (Default: '')
 *
 * HTML Example:
 *   <form>
 *     <input type="text" name="name" placeholder="Your name" />
 *     <input type="text" name="email" placeholder="Your e-mail" />
 *   </form>
 *
 * Script Example:
 *   // Setup placeholder
 *   $('form').placehold();
 *   // Disable placeholder
 *   $('form').placehold({enabled:false});
 *   // Set placehold color and message
 *   $(':text[name=email]').placehold({ color: '#ff8888', message: 'Your e-mail' });
 *   // Set global options
 *   $.fn.placehold.conf.color = '#ff8888';
 *   // Get Placeholder instance, and clear placehold message
 *   $('#email').data('placehold').clear();
 */

;(function($, undefined){

  // constants {{{1

  var $F = $.fn,
      $NOP = function() {},
      ID = 'placehold',
      ID_EMPTY = ID + '-empty',
      ID_COLOR = ID + '-original-color',
      ID_PASSWD = ID + '-password-clone';

  // extend jQuery {{{1

  /**
   * placeholder attribute support flag
   */
  $.support.placeholder = 'placeholder' in $('<input/>')[0];

  /**
   * .placehold()
   * @param conf {Object} options [Optional]
   * @return {jQuery} current selection
   */
  var $P = $F.placehold = function(conf) {
    conf = $.extend({}, $P.conf, conf);

    if (conf.enabled)
      $P.override();

    $.each($.unique(this.map(function() {
      return this.elements ? $.makeArray($(this).find(conf.elements)) : this;
    })), function() {
      var el = $(this),
          instance = el.data(ID);
      if (instance) {
        instance.destroy();
        el.removeData(ID);
      }
      if (conf.enabled)
        el.data(ID, new Placeholder(el, $(this.form), conf));
    });

    return this;
  }

  $.extend($P, {

    /**
     * default options
     */
    conf: {
      enabled  : !$.support.placeholder,
      elements : ':text,:password,textarea',
      attr     : 'placeholder',
      color    : 'silver',
      cssClass : 'placeholder',
      message  : ''
    },

    /**
     * override methods
     */
    overrides: {

      /**
       * exteded .val()
       */
      val: function(v) {
        if (!arguments.length) {
          if (this.data(ID_EMPTY)) return '';
          return this.val__placehold();
        }
        $F.val__placehold.call(this, v);
        return this.each(function() {
          var el = $(this);
          $(el.data(ID_PASSWD) || []).triggerHandler('focus.' + ID);
          el.triggerHandler('blur.' + ID);
        });
      },

      /**
       * alias for original .val()
       */
      val__placehold: $F.val

    },

    /**
     * override jQuery methods
     */
    override: function() {
      $F.extend($P.overrides);
      $P.override = $NOP;
    }

  });

  // class Placeholder {{{1

  function Placeholder(_input, _form, _conf) {
    var self = this;

    // private methods {{{2

    function initialize() {
      _input
        .data(ID_COLOR, _input.css('color'))
        .bind('blur.' + ID, onBlur)
        .bind('focus.' + ID, onFocus);
      _form
        .bind('submit.' + ID, onSubmit)
        .bind('reset.' + ID, onReset);
      self.reset();
    }

    function createPasswordClone(el) {
      var el = $(el),
          cl = $($('<b>').append(el.clone()).html()
                 .replace(/\stype="?password\b"?/i, ' type="text"'));
      el.hide()
        .attr('disabled', 'disabled')
        .data(ID_EMPTY, true)
        .data(ID_PASSWD, cl[0]);
      addPlaceholdAttr(cl);
      return cl
        .data(ID_PASSWD, el[0])
        .bind('focus.' + ID, onFocusPasswordClone)
        .insertAfter(el);
    }

    function removePasswordClone(cl) {
      var cl = $(cl),
          el = $(cl.data(ID_PASSWD));
      cl.remove();
      return el
        .removeData(ID_PASSWD)
        .removeAttr('disabled')
        .show();
    }

    function getPlaceholdText(el) {
      var msg = _conf.attr && $(el).attr(_conf.attr) || _conf.message || '';
      return String(msg).replace(/[\r\n]/g, '');
    }

    function addPlaceholdAttr(el) {
      $(el)
        .data(ID_EMPTY, true)
        .val__placehold(getPlaceholdText(el))
        .addClass(_conf.cssClass || '')
        .css(_conf.color ? {color: _conf.color} : {});
    }

    function removePlaceholdAttr(el) {
      $(el)
        .removeData(ID_EMPTY)
        .removeClass(_conf.cssClass || '')
        .css(_conf.color ? {color: el.data(ID_COLOR)} : {});
    }

    function checkPrevented(event, done, prevent) {
      if (event && event.target) {
        setTimeout(function() {
          ((event.isDefaultPrevented() ? prevent : done) || $NOP)();
        }, 200);
      }
    }

    function onFocusPasswordClone(event) {
      var el = removePasswordClone(this);
      checkPrevented(event, function() { el.focus() });
    }

    function onFocus(event) {
      var el = $(this);
      if (el.data(ID_EMPTY))
        el.val__placehold('');
      removePlaceholdAttr(el);
    }

    function onBlur(event) {
      var el = $(this);
      if (el.val__placehold()) {
        if (!el.data(ID_EMPTY))
          removePlaceholdAttr(el);
      } else if (el.is(':password')) {
        var cl = $(el.data(ID_PASSWD) || createPasswordClone(el));
        checkPrevented(event, function() { cl.blur() });
      } else {
        addPlaceholdAttr(el);
      }
    }

    function onSubmit(event) {
      self.clear();
      checkPrevented(event, null, function() { self.reset() });
    }

    function onReset(event) {
      checkPrevented(event, function() { self.reset() });
    }

    // public methods {{{2

    $.extend(self, {

      getConf: function() {
        return _conf;
      },

      /**
       * clear placeholder values to empty
       * return {Placeholder} instance of Placeholder class
       */
      clear: function() {
        _input.each(onFocus);
        return self;
      },

      /**
       * reset placeholder values to placehold message
       * return {Placeholder} instance of Placeholder class
       */
      reset: function() {
        _input.each(onBlur);
        if (_input[0] == document.activeElement)
          _input.focus();
        return self;
      },

      /**
       * destroy instance
       * return {Placeholder} instance of Placeholder class
       */
      destroy: function() {
        _input.add(_form).unbind('.' + ID);
        self.clear();
        _input = _form = $([]);
        return self;
      }

    });

    // }}}2

    initialize();
  }

  // }}}1

})(jQuery);
