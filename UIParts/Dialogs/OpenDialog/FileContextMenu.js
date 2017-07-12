/**
 * Created by Tom on 7/10/2017.
 */
function FileContextMenu(dialog, file, x1, x2, y1, y2){
	this.file=file;
	this.dialog = dialog;
	this.x1=x1;
	this.y1=y1;
	this.x2=x2;
	this.y2=y2;
	this.showMenu();
}
FileContextMenu.setGraphics=function(){
	const FCM=FileContextMenu;
	FCM.bnMargin=Button.defaultMargin;
	FCM.bgColor=Colors.lightGray;
	FCM.blockShift=20;
	FCM.width = 110;
};
FileContextMenu.prototype.showMenu=function(){
	const FCM=FileContextMenu;
	this.group=GuiElements.create.group(0,0);
	const layer = GuiElements.layers.overlayOverlay;
	const scrollLayer = GuiElements.layers.overlayOverlayScroll;
	const overlayType = Overlay.types.inputPad;
	this.bubbleOverlay=new BubbleOverlay(overlayType, FCM.bgColor,FCM.bnMargin,this.group,this,null,layer);
	this.menuBnList = new SmoothMenuBnList(this.bubbleOverlay, this.group, 0, 0, FCM.width, scrollLayer);
	this.menuBnList.markAsOverlayPart(this.bubbleOverlay);
	this.addOptions();
	const height = this.menuBnList.previewHeight();
	this.bubbleOverlay.display(this.x1,this.x2,this.y1,this.y2,FCM.width,height);
	this.menuBnList.show();
};
FileContextMenu.prototype.addOptions=function(){
	this.menuBnList.addOption("Duplicate", function(){
		const dialog = this.dialog;
		SaveManager.userDuplicateFile(this.file, function(){
			dialog.reloadDialog();
		});
		this.close();
	}.bind(this), VectorPaths.copy);
	/*this.menuBnList.addOption("Share", function(){
		SaveManager.userExportFile(this.file);
		this.close();
	}.bind(this), VectorPaths.share);*/
	this.menuBnList.addOption("Delete", function(){
		const dialog = this.dialog;
		SaveManager.userDeleteFile(false, this.file, function(){
			dialog.reloadDialog();
		});
		this.close();
	}.bind(this), VectorPaths.trash);
};
FileContextMenu.prototype.close=function(){
	this.bubbleOverlay.hide();
	this.menuBnList.hide()
};