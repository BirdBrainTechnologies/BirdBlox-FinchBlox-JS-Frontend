function HummingbirdMenu(button){
	Menu.call(this,button,true,HummingbirdMenu.width);
	this.addAlternateFn(HummingbirdManager.showConnectMultipleDialog);
	//this.currentHB="";
}
HummingbirdMenu.prototype = Object.create(Menu.prototype);
HummingbirdMenu.prototype.constructor = ViewMenu;
HummingbirdMenu.setGraphics=function(){
	HummingbirdMenu.width=150;
};
HummingbirdMenu.prototype.loadOptions=function(){
	var connectedHBs=HummingbirdManager.getConnectedHBs();
	if(connectedHBs.length>0){
		var currentHB=connectedHBs[0];
		this.addOption(currentHB.name,function(){},false);
		this.addOption("Rename", function(){
			currentHB.promptRename();
		});
		this.addOption("Disconnect", function(){
			currentHB.disconnect();
		});
	}
	this.addOption("Connect", HummingbirdManager.showConnectOneDialog);
	this.addOption("Connect Multiple", HummingbirdManager.showConnectMultipleDialog);
	HtmlServer.sendRequestWithCallback("hummingbird/discover");
};
HummingbirdMenu.prototype.previewOpen=function(){
	return (HummingbirdManager.getConnectedHBs().length<=1);
};