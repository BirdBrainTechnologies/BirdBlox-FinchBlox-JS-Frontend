/**
 * Created by Tom on 7/3/2017.
 */
function InputDialog(textSummary, acceptsEmptyString){
	InputSystem.call(this);
	this.textSummary = textSummary;
	this.acceptsEmptyString = acceptsEmptyString;
}
InputDialog.prototype.show = function(slotShape, updateFn, finishFn, data){
	InputSystem.prototype.show.call(this, slotShape, updateFn, finishFn, data);
	const oldVal = data.asString().getValue();
	const shouldPrefill = data.type === Data.types.string;
	DialogManager.showPromptDialog("Edit text",this.textSummary,oldVal,shouldPrefill,function(cancelled,response){
		if(!cancelled && (response !== "" || this.acceptsEmptyString)){
			this.currentData = new StringData(response);
			this.cancelled = false;
		} else {
			this.cancelled = true;
		}
		InputSystem.prototype.close.call(this);
	}.bind(this));
};