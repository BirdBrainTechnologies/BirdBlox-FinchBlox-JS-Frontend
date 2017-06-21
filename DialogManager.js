/**
 * Created by Tom on 6/21/2017.
 */
function DialogManager(){
	let DM = DialogManager;
	DM.dialogVisible = false;
	DM.repeatDialogDelay=500;
	DM.lastDialogDisplayTime=null;
}
DialogManager.checkDialogDelay=function(){
	let DM = DialogManager;
	let now=new Date().getTime();
	return DM.lastDialogDisplayTime==null || now - CM.repeatDialogDelay >= CM.lastDialogDisplayTime;
};
DialogManager.updateDialogDelay=function(){
	let DM = DialogManager;
	var now=new Date().getTime();
	CM.lastDialogDisplayTime=now;
};
