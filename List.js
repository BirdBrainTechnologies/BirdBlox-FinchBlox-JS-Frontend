function List(name,data){
	this.name=name;
	if(data!=null){
		this.data=data;
	}
	else{
		this.data=new ListData();
	}
	CodeManager.addList(this);
}
List.prototype.getName=function(){
	return this.name;
};
List.prototype.changeName=function(newName){
	if(this.name!=this.newName){
		this.name=newName;
	}
};
List.prototype.getData=function(){
	return this.data;
};
List.prototype.setData=function(data){
	this.data=data;
};
List.prototype.remove=function(){
	this.data=null;
	CodeManager.removeList(this);
};
List.prototype.getIndex=function(indexData){
	var listData=this.data;
	var array=listData.getValue();
	if(array.length==0){
		return null;
	}
	if(indexData==null){
		return null;
	}
	var indexV=indexData.getValue();
	var min=0;
	var max=array.length;
	if(indexData.type==Data.types.selection){
		if(indexV=="last"){
			return array.length-1;
		}
		else if(indexV=="random"){
			return Math.floor(Math.random() * array.length);
		}
		else{
			return null;
		}
	}
	else if(indexData.type==Data.types.num){
		if(!indexData.isValid){
			return null;
		}
		return indexData.getValueInR(min,max,true,true)-1;
	}
	else{
		return null;
	}
};