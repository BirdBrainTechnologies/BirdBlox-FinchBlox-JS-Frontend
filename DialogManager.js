/**
 * Sends requests to show dialogs and keeps track of open dialogs
 */
function DialogManager() {
  let DM = DialogManager;
  /* A dialog generated through Block execution must wait this amount before showing another dialog to give
   * the user a chance to stop the program */
  DM.repeatDialogDelay = 500;
  DM.lastDialogDisplayTime = null;

  DM.dialogVisible = false;
  // The functions to call when a dialog finished
  DM.choiceCallback = null;
  DM.promptCallback = null;
}

/**
 * Checks if enough time has passed since the last dialog was closed to show another dialog.  Only affects dialogs
 * generated using Blocks
 * @return {boolean}
 */
DialogManager.checkDialogDelay = function() {
  let DM = DialogManager;
  let now = new Date().getTime();
  if (DM.dialogVisible) {
    return false;
  }
  return DM.lastDialogDisplayTime == null || now - DM.repeatDialogDelay >= DM.lastDialogDisplayTime;
};

/**
 * Sets the time a dialog was last closed to now
 */
DialogManager.updateDialogDelay = function() {
  let DM = DialogManager;
  DM.lastDialogDisplayTime = new Date().getTime();
};

/**
 * Shows a dialog with two options
 * @param {string} title - The text at the top of the dialog
 * @param {string} question - The text in the body of the dialog
 * @param {string} option1 - The text on the first button
 * @param {string|null} [option2] - The text on the second button. There will be only one button if left null
 * @param swapIfMouse - Whether the result should be inverted when using the js prompt function for debugging
 * @param callbackFn - type (boolean, string) -> (), the function to call with the result of "1", "2", or "cancelled"
 * @param callbackErr - type () -> (), the function to call if showing the dialog fails
 */
DialogManager.showChoiceDialog = function(title, question, option1, option2, swapIfMouse, callbackFn, callbackErr) {
  const DM = DialogManager;
  if (DM.dialogVisible) {
    // If there's already a dialog, call the fail function
    if (callbackErr != null) callbackErr();
    return;
  }
  TouchReceiver.touchInterrupt();
  DM.dialogVisible = true;
  if (DebugOptions.shouldUseJSDialogs()) { //Kept for debugging on a PC
    let result = confirm(question);
    DM.dialogVisible = false;
    if (swapIfMouse) {
      result = !result;
    }
    if (result) {
      callbackFn("1");
    } else {
      callbackFn("2");
    }
  } else {
    const HS = HtmlServer;
    const request = new HttpRequestBuilder("tablet/choice");
    request.addParam("title", title);
    request.addParam("question", question);
    request.addParam("button1", option1);
    if (option2 != null) {
      request.addParam("button2", option2);
    }
    const onDialogPresented = function() {
      DM.choiceCallback = callbackFn;
    };
    const onDialogFail = function() {
      DM.dialogVisible = false;
      if (callbackErr != null) {
        callbackErr();
      }
    };
    HS.sendRequestWithCallback(request.toString(), onDialogPresented, onDialogFail);
  }
};

/**
 * Calls the callback with the result
 * @param {boolean} [cancelled] - Whether the user closed the dialog without answering
 * @param {boolean} [firstSelected] - Whether the user selected the first option
 */
DialogManager.choiceDialogResponded = function(cancelled, firstSelected) {
  const DM = DialogManager;
  DM.dialogVisible = false;
  if (DM.choiceCallback != null) {
    let resp;
    if (cancelled) {
      resp = "cancelled";
    } else if (firstSelected) {
      resp = "1";
    } else {
      resp = "2";
    }
    DM.choiceCallback(resp);
  }
  DM.choiceCallback = null;
};

/**
 * Shows a prompt dialog that the user can enter text into
 * @param {string} title - The text to show in the top of the dialog
 * @param {string} question - The text to show in the body of the dialog
 * @param {string} prefill - (possibly "") The text that should already be in the dialog
 * @param {boolean} shouldPrefill - Whether the prefill text should be gray, uneditable hint text, or prefilled,
 *                                  selected text
 * @param {function} [callbackFn] - type (boolean, string) -> (), Called with the user's response
 * @param {function} [callbackErr] - type () -> (), Called if showing the dialog causes an error
 */
DialogManager.showPromptDialog = function(title, question, prefill, shouldPrefill, callbackFn, callbackErr) {
  const DM = DialogManager;
  if (DM.dialogVisible) {
    // Dialog is already visible so we throw an error.
    if (callbackErr != null) callbackErr();
    return;
  }
  TouchReceiver.touchInterrupt();
  DM.dialogVisible = true;
  if (DebugOptions.shouldUseJSDialogs()) { //Kept for debugging on a PC
    const newText = prompt(question);
    DM.dialogVisible = false;
    callbackFn(newText == null, newText);
  } else {
    const HS = HtmlServer;
    const request = new HttpRequestBuilder("tablet/dialog");
    request.addParam("title", title);
    request.addParam("question", question);
    if (shouldPrefill) {
      request.addParam("prefill", prefill);
    } else {
      request.addParam("placeholder", prefill);
    }
    request.addParam("selectAll", "true");
    request.addParam("okText", Language.getStr("OK"));
    request.addParam("cancelText", Language.getStr("Cancel"));
    const onDialogPresented = function(result) {
      DM.promptCallback = callbackFn;
    };
    const onDialogFail = function() {
      DM.dialogVisible = false;
      if (callbackErr != null) {
        callbackErr();
      }
    };
    HS.sendRequestWithCallback(request.toString(), onDialogPresented, onDialogPresented);
  }
};

/**
 * Calls the callback for prompt dialogs with the result
 * @param {boolean} cancelled - Whether the closed the dialog without responding
 * @param {string} [response] - The user's response to the prompt
 */
DialogManager.promptDialogResponded = function(cancelled, response) {
  const DM = DialogManager;
  DM.dialogVisible = false;
  DM.updateDialogDelay(); // Tell DialogManager to reset the dialog delay clock.
  if (DM.promptCallback != null) {
    DM.promptCallback(cancelled, response);
  }
  DM.promptCallback = null;
};

/**
 * Shows a dialog with a single button to alert the user of something
 * @param {string} title - The text at the top of the dialog
 * @param {string} message - The text in the body of the dialog
 * @param {string} button - The text on the dismiss button
 * @param {function} [callbackFn] - type () -> (), called when the dialog is dismissed
 * @param {function} [callbackErr] - type () -> (), called if displaying the dialog fails
 */
DialogManager.showAlertDialog = function(title, message, button, callbackFn, callbackErr) {
  if (DebugOptions.shouldUseJSDialogs()) {
    alert(message);
    if (callbackFn != null) callbackFn();
    return;
  }
  DialogManager.showChoiceDialog(title, message, button, null, true, callbackFn, callbackErr);
};
