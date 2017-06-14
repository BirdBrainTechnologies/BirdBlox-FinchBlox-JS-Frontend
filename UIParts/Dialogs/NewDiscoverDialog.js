/**
 * Created by Tom on 6/14/2017.
 */

function DiscoverDialog(){

	RowDialog.call(this, true, title, this.files.length, 0, 0);
	this.addCenteredButton("Cancel", this.closeDialog.bind(this));
}