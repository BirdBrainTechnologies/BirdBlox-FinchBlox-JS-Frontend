/**
 * Created by Tom on 6/21/2017.
 */
function DialogManager() {
	let DM = DialogManager;
	DM.repeatDialogDelay = 500;
	DM.lastDialogDisplayTime = null;

	DM.dialogVisible = false;
	DM.choiceCallback = null;
	DM.promptCallback = null;
}
DialogManager.checkDialogDelay = function() {
	let DM = DialogManager;
	let now = new Date().getTime();
	return DM.lastDialogDisplayTime == null || now - DM.repeatDialogDelay >= DM.lastDialogDisplayTime;
};
DialogManager.updateDialogDelay = function() {
	let DM = DialogManager;
	DM.lastDialogDisplayTime = new Date().getTime();
};
DialogManager.showChoiceDialog = function(title,question,option1,option2,swapIfMouse,callbackFn,callbackErr) {
	const DM = DialogManager;
	if(DM.dialogVisible) {
		if (callbackErr != null) callbackErr();
		return;
	}
	TouchReceiver.touchInterrupt();
	DM.dialogVisible = true;
	if(DebugOptions.shouldUseJSDialogs()){ //Kept for debugging on a PC
		let result = confirm(question);
		DM.dialogVisible = false;
		if(swapIfMouse){
			result=!result;
		}
		if(result){
			callbackFn("1");
		}
		else{
			callbackFn("2");
		}
	}
	else {
		const HS = HtmlServer;
		const request = new HttpRequestBuilder("tablet/choice");
		request.addParam("title", title);
		request.addParam("question", question);
		request.addParam("button1", option1);
		if(option2 != null) {
			request.addParam("button2", option2);
		}
		const onDialogPresented = function () {
			DM.choiceCallback = callbackFn;
		};
		const onDialogFail = function () {
			DM.dialogVisible = false;
			if (callbackErr != null) {
				callbackErr();
			}
		};
		HS.sendRequestWithCallback(request.toString(), onDialogPresented, onDialogFail);
	}
};
DialogManager.choiceDialogResponded = function(cancelled, firstSelected){
	const DM = DialogManager;
	DM.dialogVisible = false;
	if(DM.choiceCallback != null){
		let resp;
		if(cancelled) {
			resp = "3";
		} else if(firstSelected){
			resp = "1";
		} else {
			resp = "2";
		}
		DM.choiceCallback(resp);
	}
	DM.choiceCallback = null;
};
DialogManager.showPromptDialog=function(title,question,prefill,shouldPrefill,callbackFn,callbackErr){
	const DM = DialogManager;
	if(DM.dialogVisible) {
		if (callbackErr != null) callbackErr();
		return;
	}
	TouchReceiver.touchInterrupt();
	DM.dialogVisible = true;
	if(DebugOptions.shouldUseJSDialogs()){ //Kept for debugging on a PC
		const newText = prompt(question);
		DM.dialogVisible=false;
		callbackFn(newText == null,newText);
	}
	else{
		const HS=HtmlServer;
		const request = new HttpRequestBuilder("tablet/dialog");
		request.addParam("title", title);
		request.addParam("question", question);
		if(shouldPrefill) {
			request.addParam("prefill", prefill);
		} else {
			request.addParam("placeholder", prefill);
		}
		request.addParam("selectAll", "true");
		const onDialogPresented=function(result){
			DM.promptCallback = callbackFn;
		};
		const onDialogFail=function(){
			DM.dialogVisible=false;
			if(callbackErr!=null) {
				callbackErr();
			}
		};
		HS.sendRequestWithCallback(request.toString(),onDialogPresented,onDialogPresented);
	}
};
DialogManager.showAlertDialog = function(title,message,button,callbackFn,callbackErr){
	if(DebugOptions.shouldUseJSDialogs()) {
		if (callbackFn != null) callbackFn();
		return;
	}
	DialogManager.showChoiceDialog(title, message, button, null, true, callbackFn, callbackErr);
};
DialogManager.promptDialogResponded = function(cancelled, response){
	const DM = DialogManager;
	DM.dialogVisible = false;
	if(DM.promptCallback != null){
		DM.promptCallback(cancelled, response);
	}
	DM.promptCallback = null;
};