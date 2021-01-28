/**
 * The Language class controls all text displayed by the frontend. On startup,
 *  the frontend provides the system language. This language will be used if
 *  available. Otherwise, English is used.
 */
function Language() {};

Language.lang = "en"; //The current language. English by default.
Language.langs = ["ar", "ca", "da", "de", "en", "es", "fi", "fr", "he", "ko", "nl", "pt", "sv", "zhs", "zht"];
//Language.rtlLangs = [];
Language.rtlLangs = ["ar", "he"];
Language.isRTL = false;

//The char below forces the chars following it to be displayed ltr. Useful for
// correctly displaying negative numbers and parentheses. The char itself is invisible.
Language.forceLTR = String.fromCharCode(8206);

Language.names = {
  "ar":"العربية",  //Arabic
  "ca":"Català", //Catalan
  "da":"Dansk",  //Danish
  "de":"Deutsch",  //German
  "en":"English",  //English
  "es":"Español",  //Spanish
  "fi":"suomi",  //Finnish - language names not capitalized in Finnish
  "fr":"Français",  //French
  "he":"עברית",  //Hebrew
  "ja":"日本語",  //Japanese
  "ko":"한국어",  //Korean
  "nl":"Nederlands",  //Dutch
  "pt":"Português",  //Portuguese
  "sv":"svenska",  //Swedish - language names not capitalized in Swedish
  "zhs":"简体中文",  //Simplified Chinese (zh-Hans)
  "zht":"繁體中文"  //Traditional Chinese (zh-Hant)
}
/**
 * Set the language to a given language if available. Used when a system Language
 *  is returned by the backend.
 * @param {string} lang - Language code of the language requested.
 */
Language.setLanguage = function(lang) {
    const code = lang.substring(0, 2);
    if (Language.langs.indexOf(code) != -1) {
      Language.lang = code;
    } else if (code == "zh") {
      if (lang.substring(0, 7) == "zh-Hans") { //iOS Simplified Chinese
        Language.lang = "zhs";
      } else if (lang.substring(0, 7) == "zh-Hant") { //iOS Traditional Chinese
        Language.lang = "zht";
      } else if (lang.substring(0, 5) == "zh_CN") { //Android Simplified Chinese
        Language.lang = "zhs";
      } else if (lang.substring(0, 5) == "zh_TW") { //Android Traditional Chinese
        Language.lang = "zht";
      } else {
        Language.lang = "zhs";
      }
    } else {
      Language.lang = "en";
    }
}
/**
 * Get the translation for the given key.
 * @param {string} str - The language dictionary key.
 * @return {string} - The text entry for the given key in the current language.
 */
Language.getStr = function(str) {
    let translatedStr = eval("Language." + Language.lang + "." + str);
    if (translatedStr == null && !DebugOptions.enabled) {
      translatedStr = eval("Language.en." + str);
    }
    if (translatedStr != null) {
        return translatedStr;
    } else {
        //console.log("Translation? " + str);
        return "Translation required";
    }
}
