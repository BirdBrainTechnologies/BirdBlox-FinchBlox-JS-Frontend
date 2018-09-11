/**
 * Provides a menu choosing the language used.
 * @param {Button} button
 * @constructor
 */
function LanguageMenu(button, parentMenu) {
  this.isSubMenu = true;
  this.parentMenu = parentMenu;
	Menu.call(this, button);
}
LanguageMenu.prototype = Object.create(Menu.prototype);
LanguageMenu.prototype.constructor = LanguageMenu;

/**
 * @inheritDoc
 */
LanguageMenu.prototype.loadOptions = function() {
  const langMenu = this;
  Language.langs.forEach( function(lang) {
    langMenu.addOption(lang, function() {
      sessionStorage.setItem("language", lang);
      window.location.reload(false);
    });
  });
};

/**
 * Recomputes the Menu's location based on the location of the Button
 */
LanguageMenu.prototype.move = function() {
	this.x = this.button.x + this.button.width + Menu.bnMargin + this.parentMenu.x;
	this.y = this.button.y + this.button.height + this.parentMenu.y;
	GuiElements.move.group(this.group, this.x, this.y);
	if (this.menuBnList != null) {
		this.menuBnList.updatePosition();
	}
};
