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
	var variable = XmlWriter.createElement(xmlDoc, "variable");
	XmlWriter.setAttribute(variable, "name", this.name);
	variable.appendChild(this.data.createXml(xmlDoc));
	return variable;
};
Variable.importXml=function(variableNode){
	var name=XmlWriter.getAttribute(variableNode,"name");
	if(name!=null){
		var dataNode=XmlWriter.findSubElement(variableNode,"data");
		var data=new NumData(0);
		if(dataNode!=null){
			var newData=Data.importXml(dataNode);
			if(newData!=null){
				data=newData;
			}
		}
		return new Variable(name,data);
	}
};
Variable.prototype.rename=function(){
	var callbackFn=function(cancelled,response){
		if(!cancelled&&CodeManager.checkVarName(response)){
			callbackFn.variable.name=response;
			CodeManager.renameVariable(callbackFn.variable);
		}
	};
	callbackFn.variable=this;
	HtmlServer.showDialog("Rename variable","Enter variable name",this.name,callbackFn);
};
Variable.prototype.delete=function(){
	if(CodeManager.checkVariableUsed(this)) {
		var callbackFn = function (response) {
			if (response == "2") {
				callbackFn.variable.remove();
				CodeManager.deleteVariable(callbackFn.variable);
			}
		};
		callbackFn.variable = this;
		var question = "Are you sure you would like to delete the variable \"" + this.name + "\"? ";
		question += "This will delete all copies of this block.";
		HtmlServer.showChoiceDialog("Delete variable", question, "Don't delete", "Delete", true, callbackFn);
	}
	else{
		this.remove();
		CodeManager.deleteVariable(this);
	}
};