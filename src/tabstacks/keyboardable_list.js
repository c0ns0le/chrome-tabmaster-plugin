/**
 * KeyboardableList
 * Takes an element and adds directional key listeners to the items within it.
 * Only items that can have focus will have listeners added to them.
 * The parent element will be treated with ARIA role='menu', selectable items will be treated with role='menuitem'
 * @type {{init: KeyboardableList.init, focusOn: KeyboardableList.focusOn, setDropmenu: KeyboardableList.setDropmenu, generate: KeyboardableList.generate}}
 */
var KeyboardableList = {

  init: function (menuElement) {

    var _self = this;

    this.opts = {
      menuContainer: ["li", "div", "span"],
      tab_mode: -1 // 0 = wrap, 1 = nowrap  -1=do nothing
    };

    this.KEYMAP = Object.freeze({
      'TAB': 9,
      'RETURN': 13,
      'ESC': 27,
      'SPACE': 32,
      'PAGEUP': 33,
      'PAGEDOWN': 34,
      'END': 35,
      'HOME': 36,
      'LEFT': 37,
      'UP': 38,
      'RIGHT': 39,
      'DOWN': 40
    });

    this.DIRECTION = Object.freeze({
      'NEXT' :    1,
      'PREVIOUS': 2,
      'INTO':     3,
      'BACK' :    4
    });

    this.SELECTABLEITEMS = "a[href]:not([disabled]):not([tabindex='-1']),\
        input:not([type='hidden']):not([disabled]):not([tabindex='-1']),\
        button:not([disabled]):not([tabindex='-1']),\
        select:not([disabled]):not([tabindex='-1']),\
        textarea:not([disabled]):not([tabindex='-1']),\
        iframe:not([tabindex='-1']),\
        [tabindex]:not([tabindex='-1']),\
        [contentEditable=true]:not([tabindex='-1'])";


    this.menuElement = menuElement;
    this.menuElement.setAttribute('role', 'menu');

    this.menulistitems = [].slice.call( this.menuElement.querySelectorAll( _self.SELECTABLEITEMS) );

    // .Commented out for now -- but the proper treatment for menus is to add role='presentation' attribute to the menu item container
    // menulistitems.forEach(function(listitem, listitemindex) {
    //   listitem.setAttribute("role", "presentation");
    // });

    this.menulistitems.forEach(function(menuitem){

      menuitem.setAttribute("role", "menuitem");

      menuitem.addEventListener('keydown', function(kevt){

        switch(kevt.keyCode || kevt.which) {

          case _self.KEYMAP['DOWN']:
          //case _self.KEYMAP['RIGHT']:     //right or down arrow -- focus next menu item in order
            _self.focusOn(_self.DIRECTION['NEXT'], menuitem, kevt);

            break;

          case _self.KEYMAP['UP']:        //up arrow -- move focus to previous node
          //case _self.KEYMAP['LEFT']:      //left arrow -- move focus to previous node
            _self.focusOn(_self.DIRECTION['PREVIOUS'], menuitem, kevt);

            break;

          /* Iterate over all the interactive and focusable elements in the menu */
          case _self.KEYMAP.TAB:

            var elems = [].slice.call(_self.menuElement.querySelectorAll( _self.SELECTABLEITEMS )) || [ _self.menuElement ];

            // remove non-visible but selectable elements
            elems = elems.filter(function(el){ return !!( el.offsetWidth || el.offsetHeight || el.getClientRects().length ); });

            // Catch SHIFT+TAB when on the first element
            if(kevt.shiftKey && document.activeElement == elems[0]){ //first element

              switch(_self.opts.tab_mode){

                case 0:
                  elems[elems.length-1].focus();
                  kevt.preventDefault();
                  break;

                case 1:
                  _self.dropMenu.toggle();
                  break;

                default:
                  break;
              }

            }
            // Catch TAB when on last element, loop to top
            else if ( document.activeElement == elems[elems.length-1] && !kevt.shiftKey) { //last

              switch(_self.opts.tab_mode){

                case 0:
                  elems[0].focus();
                  kevt.preventDefault();
                  break;

                case 1:
                  _self.dropMenu.toggle();
                  break;

                default:
                  break;

              }
            }
            break;
        }
      });

    });

    return this;
  },

  focusOn: function(direction, menuitem, event){
    var _self = this;

    if(menuitem === document.activeElement) {

      var l = this.menulistitems.length;
      var p = this.menulistitems.indexOf(menuitem);

      switch (direction) {

        case _self.DIRECTION['PREVIOUS']:
          if (_self.opts.tab_mode === 0 && p === 0) {
            this.menulistitems[l - 1].focus();
            if(event)
              event.preventDefault();
          }
          else if(p !== 0) {
            this.menulistitems[p - 1].focus();
            if(event)
              event.preventDefault();
          }
          break;

        case _self.DIRECTION['NEXT']:

          if (_self.opts.tab_mode === 0 && p === l - 1) {
            this.menulistitems[0].focus();
            if(event)
              event.preventDefault();
          }
          else if(p !== l - 1) {
            this.menulistitems[p + 1].focus();
            if(event)
              event.preventDefault();
          }
          break;
      }
    }
  },

  focusNext: function(){
    var active = this.menulistitems.indexOf( document.activeElement );

    if(active > -1)
      this.focusOn(this.DIRECTION.NEXT, this.menulistitems[active], null);

    else if(this.menulistitems.length > 0)
      this.focusOn(this.DIRECTION.NEXT, this.menulistitems[0], null);

    else
      throw new Error("KeyboardableList.focusNext called but there is no list element in focus");
  },
  focusPrevious: function(){
    var active = this.menulistitems.indexOf( document.activeElement );

    if(active > -1)
      this.focusOn(this.DIRECTION.PREVIOUS, this.menulistitems[active], null);

    else if(this.menulistitems.length > 0)
      this.focusOn(this.DIRECTION.PREVIOUS, this.menulistitems[0], null);

    else
      throw new Error("KeyboardableList.focusNext called but there is no list element in focus");
  },
  /**
   * Add reference to the parent dropmenu -- to close it upon certain actions
   * @param dropMenu
   */
  setDropmenu: function(dropMenu){
    this.dropMenu = dropMenu;
  },

  getMenuListItems: function(){
    return this.menulistitems;
  },

  generate: function(menuElement){
    return Object.create(KeyboardableList).init(menuElement);
  }
};
