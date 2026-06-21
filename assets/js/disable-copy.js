(function() {
  var protectedSelector = '.page-content, section.main, .post';
  var allowedSelector = [
    'input',
    'textarea',
    'select',
    'button',
    '[contenteditable=""]',
    '[contenteditable="true"]',
    '.allow-copy'
  ].join(',');

  function closest(element, selector) {
    while (element && element.nodeType === 1) {
      if (element.matches(selector)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  function shouldBlock(target) {
    if (!target || target.nodeType !== 1) {
      return false;
    }
    if (closest(target, allowedSelector)) {
      return false;
    }
    return !!closest(target, protectedSelector);
  }

  function selectionIsProtected() {
    var selection = window.getSelection ? window.getSelection() : null;
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    var node = selection.anchorNode || selection.focusNode;
    var element = node && node.nodeType === 1 ? node : node && node.parentElement;
    return shouldBlock(element);
  }

  function blockIfProtected(event) {
    if (shouldBlock(event.target) || selectionIsProtected()) {
      event.preventDefault();
    }
  }

  document.documentElement.classList.add('copy-protected');

  var style = document.createElement('style');
  style.textContent = [
    '.copy-protected .page-content{user-select:none;-webkit-user-select:none;}',
    '.copy-protected input,.copy-protected textarea,.copy-protected select,.copy-protected button,.copy-protected .allow-copy{user-select:text;-webkit-user-select:text;}',
    '.copy-protected img{-webkit-user-drag:none;}'
  ].join('');
  document.head.appendChild(style);

  ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'].forEach(function(type) {
    document.addEventListener(type, blockIfProtected, true);
  });

  document.addEventListener('keydown', function(event) {
    var key = event.key ? event.key.toLowerCase() : '';
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'x', 's', 'u', 'p'].indexOf(key) >= 0) {
      if (shouldBlock(event.target) || closest(document.activeElement, protectedSelector) || selectionIsProtected()) {
        event.preventDefault();
      }
    }
  }, true);
})();
