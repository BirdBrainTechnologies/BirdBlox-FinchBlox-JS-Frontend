/**
 * Created by Tom on 7/3/2017.
 */
function InputDialog(textSummary){
	InputSystem.call(this);
	this.textSummary = textSummary;
}
InputDialog.prototype.show = function(slotShape, updateFn, finishFn, data){
	InputSystem.prototype.show.call(this, slotShape, updateFn, finishFn, data);
	const oldVal = data.asString().getValue();
	HtmlServer.showDialog("Edit text",this.textSummary,oldVal,function(cancelled,response){
		if(!cancelled){
			this.currentData = new StringData(response);
		}
		InputSystem.prototype.close.call(this);
	}.bind(this));
};