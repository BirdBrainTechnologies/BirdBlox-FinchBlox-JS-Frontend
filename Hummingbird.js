function Hummingbird(name){
	this.name=name;
}
Hummingbird.prototype.promptRename=function(callbackFn){
	var thisHB=this;
	HtmlServer.showDialog("Rename","Enter new name",this.name,function(cancelled,result){
		if(!cancelled) {
			result = result.trim();
			if (result.length > 30) {
				result = result.substring(0, 30);
			}
			result = result.trim();
			if (result.length > 0) {
				thisHB.rename(result,callbackFn);
			}
		}
	});
};
Hummingbird.prototype.disconnect=function(callbackFn,removeFromManager){
	if(removeFromManager==null){
		removeFromManager=true;
	}
	var request="hummingbird/disconnect?name="+HtmlServer.encodeHtml(this.name);
	HtmlServer.sendRequestWithCallback(request,callbackFn,callbackFn);
	if(removeFromManager) {
		HummingbirdManager.removeHB(this);
	}
	HummingbirdManager.updateSelectableHBs();
};
Hummingbird.prototype.connect=function(callbackFn,addToManager){
	if(addToManager==null){
		addToManager=true;
	}
	var request="hummingbird/connect?name="+HtmlServer.encodeHtml(this.name);
	HtmlServer.sendRequestWithCallback(request,callbackFn,callbackFn);
	if(addToManager) {
		HummingbirdManager.connectedHBs.push(this);
	}
	HummingbirdManager.updateSelectableHBs();
};