function Hummingbird(name){
	this.name=name;
}
Hummingbird.prototype.promptRename=function(){
	var thisHB=this;
	HtmlServer.showDialog("Rename","Enter new name",this.name,function(cancelled,result){
		if(!cancelled) {
			result = result.trim();
			if (result.length > 30) {
				result = result.substring(0, 30);
			}
			result = result.trim();
			if (result.length > 0) {
				thisHB.rename(result);
			}
		}
	});
};
Hummingbird.prototype.rename=function(newName){
	var request="hummingbird/"+HtmlServer.encodeHtml(this.name)+"/rename/"+HtmlServer.encodeHtml(newName);
	HtmlServer.sendRequestWithCallback(request);
	this.name=newName;
};
Hummingbird.prototype.disconnect=function(){
	HummingbirdManager.disconnectHB(this);
};
Hummingbird.prototype.connect=function(){
	HummingbirdManager.connectHB(this);
};