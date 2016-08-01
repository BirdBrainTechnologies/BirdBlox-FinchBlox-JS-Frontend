function HummingbirdMenu(button){
	Menu.call(this,button,true);
	//this.currentHB="";
}
HummingbirdMenu.prototype = Object.create(Menu.prototype);
HummingbirdMenu.prototype.constructor = ViewMenu;
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
};
HummingbirdMenu.prototype.previewOpen=function(){
	return (HummingbirdManager.getConnectedHBs().length<=1);
};