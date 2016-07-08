function Variable(name, data){
	this.name=name;
	this.data=data;
	if(this.data==null){
		this.data=new NumData(0);
	}
	CodeManager.addVariable(this);
}
Variable.prototype.getName=function(){
	return this.name;
};
Variable.prototype.changeName=function(newName){
	if(this.name!=this.newName){
		this.name=newName;
	}
};
Variable.prototype.getData=function(){
	return this.data;
};
Variable.prototype.setData=function(data){
	this.data=data;
};
Variable.prototype.remove=function(){
	this.data=null;
	CodeManager.removeVariable(this);
};
Variable.prototype.createXml=function(xmlDoc) {
	var variable =XmlWriter.createElement(xmlDoc,"variable");
	XmlWriter.setAttribute(variable,"name", this.name);
	variable.appendChild(this.data.createXml(xmlDoc));
	return variable;
};