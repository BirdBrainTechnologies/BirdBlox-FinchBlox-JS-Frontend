/* This file contains the implementations for Blocks in the operators category. */
function B_Add(x, y) {
	ReporterBlock.call(this, x, y, "operators");
	this.addPart(new NumSlot(this, "NumS_1", 0));
	this.addPart(new LabelText(this, "+"));
	this.addPart(new NumSlot(this, "NumS_2", 0));
}
B_Add.prototype = Object.create(ReporterBlock.prototype);
B_Add.prototype.constructor = B_Add;
/* Returns the sum of the Slots. Result is valid only if both inputs are. */
B_Add.prototype.startAction = function() {
	const data1 = this.slots[0].getData();
	const data2 = this.slots[1].getData();
	const isValid = data1.isValid && data2.isValid;
	const val = data1.getValue() + data2.getValue();
	return new ExecutionStatusResult(new NumData(val, isValid));
};



function B_Subtract(x, y) {
	ReporterBlock.call(this, x, y, "operators");
	this.addPart(new NumSlot(this, "NumS_1", 0));
	this.addPart(new LabelText(this, String.fromCharCode(8211)));
	this.addPart(new NumSlot(this, "NumS_2", 0));
}
B_Subtract.prototype = Object.create(ReporterBlock.prototype);
B_Subtract.prototype.constructor = B_Subtract;
/* Sets the result to the difference between the Slots. Result is valid only if both inputs are. */
B_Subtract.prototype.startAction = function() {
	const data1 = this.slots[0].getData();
	const data2 = this.slots[1].getData();
	const isValid = data1.isValid && data2.isValid;
	const val = data1.getValue() - data2.getValue();
	return new ExecutionStatusResult(new NumData(val, isValid));
};



function B_Multiply(x, y) {
	ReporterBlock.call(this, x, y, "operators");
	this.addPart(new NumSlot(this, "NumS_1", 0));
	this.addPart(new LabelText(this, "*"));
	this.addPart(new NumSlot(this, "NumS_2", 0));
}
B_Multiply.prototype = Object.create(ReporterBlock.prototype);
B_Multiply.prototype.constructor = B_Multiply;
/* Sets the result to the product of the Slots. Result is valid only if both inputs are. */
B_Multiply.prototype.startAction = function() {
	const data1 = this.slots[0].getData();
	const data2 = this.slots[1].getData();
	const isValid = data1.isValid && data2.isValid;
	const val = data1.getValue() * data2.getValue();
	return new ExecutionStatusResult(new NumData(val, isValid));
};



function B_Divide(x, y) {
	ReporterBlock.call(this, x, y, "operators");
	this.addPart(new NumSlot(this, "NumS_1", 0));
	this.addPart(new LabelText(this, "/"));
	this.addPart(new NumSlot(this, "NumS_2", 1));
}
B_Divide.prototype = Object.create(ReporterBlock.prototype);
B_Divide.prototype.constructor = B_Divide;
/* Sets the result to the quotient of the Slots. Result is valid only if both inputs are and Slot2 != 0. */
B_Divide.prototype.startAction = function() {
	const data1 = this.slots[0].getData();
	const data2 = this.slots[1].getData();
	const val1 = data1.getValue();
	const val2 = data2.getValue();
	let isValid = data1.isValid && data2.isValid;
	let val = val1 / val2;
	if (val2 === 0) {
		val = 0; // Return invalid 0 if told to divide by 0.
		isValid = false;
	}
	return new ExecutionStatusResult(new NumData(val, isValid));
};



function B_Mod(x, y) {
	ReporterBlock.call(this, x, y, "operators");
	this.addPart(new NumSlot(this, "NumS_1", 17));
	//this.addPart(new LabelText(this, Language.getStr("mod")));
	this.addPart(new NumSlot(this, "NumS_2", 10));
	this.parseTranslation(Language.getStr("block_mod"));
}
B_Mod.prototype = Object.create(ReporterBlock.prototype);
B_Mod.prototype.constructor = B_Mod;
/* Sets the result to the first Slot mod the second Slot. Valid if Slots are valid and second isn't 0. */
B_Mod.prototype.startAction = function() {
	const data1 = this.slots[0].getData();
	const data2 = this.slots[1].getData();
	const val1 = data1.getValue();
	const val2 = data2.getValue();
	let isValid = data1.isValid && data2.isValid;
	let result = ((val1 % val2) + val2) % val2;
	if (val2 === 0) {
		result = 0;
		isValid = false;
	}
	return new ExecutionStatusResult(new NumData(result, isValid));
};



function B_Round(x, y) {
	ReporterBlock.call(this, x, y, "operators");
	//this.addPart(new LabelText(this, Language.getStr("round")));
	this.addPart(new NumSlot(this, "NumS_1", 0.5));
	this.parseTranslation(Language.getStr("block_round"));
}
B_Round.prototype = Object.create(ReporterBlock.prototype);
B_Round.prototype.constructor = B_Round;
/* Sets the result to the rounded value of the Slot. Is valid only if Slot is. */
B_Round.prototype.startAction = function() {
	const data1 = this.slots[0].getData();
	const isValid = data1.isValid;
	const val = data1.getValueWithC(false, true); // Integer
	return new ExecutionStatusResult(new NumData(val, isValid));
};



function B_PickRandom(x, y) {
	ReporterBlock.call(this, x, y, "operators");
	//this.addPart(new LabelText(this, Language.getStr("pick_random")));
	this.addPart(new NumSlot(this, "NumS_min", 1));
	//this.addPart(new LabelText(this, Language.getStr("to")));
	this.addPart(new NumSlot(this, "NumS_max", 10));
	this.parseTranslation(Language.getStr("block_pick_random"));
}
/* Picks a random integer if both Slots are integers. Otherwise it selects a random float. Is valid if both are. */
B_PickRandom.prototype = Object.create(ReporterBlock.prototype);
B_PickRandom.prototype.constructor = B_PickRandom;
B_PickRandom.prototype.startAction = function() {
	const data1 = this.slots[0].getData();
	const data2 = this.slots[1].getData();
	const isValid = data1.isValid && data2.isValid;
	const val1 = data1.getValue();
	const val2 = data2.getValue();
	const integer = Number.isInteger(val1) && Number.isInteger(val2);
	let min = val1;
	let max = val2;
	let rVal;
	if (min > max) {
		min = val2;
		max = val1;
	}
	if (integer) {
		rVal = Math.floor(Math.random() * (max - min + 1)) + min;
	} else {
		rVal = Math.random() * (max - min) + min;
	}
	return new ExecutionStatusResult(new NumData(rVal, isValid));
};



function B_LessThan(x, y) {
	PredicateBlock.call(this, x, y, "operators");
	this.addPart(new NumSlot(this, "NumS_1", 0));
	this.addPart(new LabelText(this, "<"));
	this.addPart(new NumSlot(this, "NumS_2", 0));
}
B_LessThan.prototype = Object.create(PredicateBlock.prototype);
B_LessThan.prototype.constructor = B_LessThan;
/* Result is a valid boolean indicating is Slot1 < Slot2. */
B_LessThan.prototype.startAction = function() {
	const val1 = this.slots[0].getData().getValue();
	const val2 = this.slots[1].getData().getValue();
	return new ExecutionStatusResult(new BoolData(val1 < val2));
};



function B_EqualTo(x, y) { // needs to work with strings
	PredicateBlock.call(this, x, y, "operators");
	this.addPart(new NumOrStringSlot(this, "RndS_item1", new NumData(0)));
	this.addPart(new LabelText(this, "="));
	this.addPart(new NumOrStringSlot(this, "RndS_item2", new NumData(0)));
}
B_EqualTo.prototype = Object.create(PredicateBlock.prototype);
B_EqualTo.prototype.constructor = B_EqualTo;
/* Compares data of any type to determine equality. Result is always valid. */
B_EqualTo.prototype.startAction = function() {
	const data1 = this.slots[0].getData();
	const data2 = this.slots[1].getData();
	return new ExecutionStatusResult(new BoolData(Data.checkEquality(data1, data2)));
};



function B_GreaterThan(x, y) {
	PredicateBlock.call(this, x, y, "operators");
	this.addPart(new NumSlot(this, "NumS_1", 0));
	this.addPart(new LabelText(this, ">"));
	this.addPart(new NumSlot(this, "NumS_2", 0));
}
B_GreaterThan.prototype = Object.create(PredicateBlock.prototype);
B_GreaterThan.prototype.constructor = B_GreaterThan;
/* Result is a valid boolean indicating is Slot1 > Slot2. */
B_GreaterThan.prototype.startAction = function() {
	const val1 = this.slots[0].getData().getValue();
	const val2 = this.slots[1].getData().getValue();
	return new ExecutionStatusResult(new BoolData(val1 > val2));
};



function B_And(x, y) {
	PredicateBlock.call(this, x, y, "operators");
	this.addPart(new BoolSlot(this, "BoolS_1"));
	//this.addPart(new LabelText(this, Language.getStr("and")));
	this.addPart(new BoolSlot(this, "BoolS_2"));
	this.parseTranslation(Language.getStr("block_and"));
}
B_And.prototype = Object.create(PredicateBlock.prototype);
B_And.prototype.constructor = B_And;
/* Result is true if both are true. Always valid. */
B_And.prototype.startAction = function() {
	const val1 = this.slots[0].getData().getValue();
	const val2 = this.slots[1].getData().getValue();
	return new ExecutionStatusResult(new BoolData(val1 && val2));
};



function B_Or(x, y) {
	PredicateBlock.call(this, x, y, "operators");
	this.addPart(new BoolSlot(this, "BoolS_1"));
	//this.addPart(new LabelText(this, Language.getStr("or")));
	this.addPart(new BoolSlot(this, "BoolS_2"));
	this.parseTranslation(Language.getStr("block_or"));
}
B_Or.prototype = Object.create(PredicateBlock.prototype);
B_Or.prototype.constructor = B_Or;
/* Result is true if either is true. Always valid. */
B_Or.prototype.startAction = function() {
	const val1 = this.slots[0].getData().getValue();
	const val2 = this.slots[1].getData().getValue();
	return new ExecutionStatusResult(new BoolData(val1 || val2));
};



function B_Not(x, y) {
	PredicateBlock.call(this, x, y, "operators");
	//this.addPart(new LabelText(this, Language.getStr("not")));
	this.addPart(new BoolSlot(this, "BoolS_1"));
	this.parseTranslation(Language.getStr("block_not"));
}
B_Not.prototype = Object.create(PredicateBlock.prototype);
B_Not.prototype.constructor = B_Not;
/* Result is true if Slot is false. Always valid. */
B_Not.prototype.startAction = function() {
	const val1 = this.slots[0].getData().getValue();
	return new ExecutionStatusResult(new BoolData(!val1));
};



function B_True(x, y) {
	PredicateBlock.call(this, x, y, "operators");
	this.addPart(new LabelText(this, Language.getStr("true")));
}
B_True.prototype = Object.create(PredicateBlock.prototype);
B_True.prototype.constructor = B_True;
/* Result is true. */
B_True.prototype.startAction = function() {
	return new ExecutionStatusResult(new BoolData(true));
};



function B_False(x, y) {
	PredicateBlock.call(this, x, y, "operators");
	this.addPart(new LabelText(this, Language.getStr("false")));
}
B_False.prototype = Object.create(PredicateBlock.prototype);
B_False.prototype.constructor = B_False;
/* Result is false. */
B_False.prototype.startAction = function() {
	return new ExecutionStatusResult(new BoolData(false));
};



function B_LetterOf(x, y) {
	ReporterBlock.call(this, x, y, "operators");
	//this.addPart(new LabelText(this, Language.getStr("letter")));
	const nS = new NumSlot(this, "NumS_idx", 1, true, true);
	nS.addLimits(1);
	this.addPart(nS);
	//this.addPart(new LabelText(this, Language.getStr("of")));
	//this.addPart(new StringSlot(this, "StrS_text", Language.getStr("world")));
	this.addPart(new StringSlot(this, "StrS_text", ""));
	this.parseTranslation(Language.getStr("block_letter"));
}
B_LetterOf.prototype = Object.create(ReporterBlock.prototype);
B_LetterOf.prototype.constructor = B_LetterOf;
/* Result is nth letter of word. Makes n and integer in range. Always valid. */
B_LetterOf.prototype.startAction = function() {
	const word = this.slots[1].getData().getValue();
	const index = this.slots[0].getData().getValueInR(1, word.length, true, true);
	if (word.length > 0) {
		return new ExecutionStatusResult(new StringData(word.substring(index - 1, index)));
	} else {
		return new ExecutionStatusResult(new StringData("")); // Letter of empty string is empty string.
	}
};



function B_LengthOf(x, y) {
	ReporterBlock.call(this, x, y, "operators");
	//this.addPart(new LabelText(this, Language.getStr("length") + " " + Language.getStr("of")));
	//this.addPart(new StringSlot(this, "StrS_text", Language.getStr("world")));
	this.addPart(new StringSlot(this, "StrS_text", ""));
	this.parseTranslation(Language.getStr("block_length"));
}
B_LengthOf.prototype = Object.create(ReporterBlock.prototype);
B_LengthOf.prototype.constructor = B_LengthOf;
/* Result is length of word. Always valid. */
B_LengthOf.prototype.startAction = function() {
	const word = this.slots[0].getData().getValue();
	return new ExecutionStatusResult(new NumData(word.length));
};



function B_join(x, y) {
	ReporterBlock.call(this, x, y, "operators", Block.returnTypes.string);
	//this.addPart(new LabelText(this, Language.getStr("join")));
	//this.addPart(new StringSlot(this, "StrS_1", Language.getStr("hello ")));
	//this.addPart(new LabelText(this, Language.getStr("and")));
	//this.addPart(new StringSlot(this, "StrS_2", Language.getStr("world")));
	this.addPart(new StringSlot(this, "StrS_1", ""));
	this.addPart(new StringSlot(this, "StrS_2", ""));
	this.parseTranslation(Language.getStr("block_join"));
}
B_join.prototype = Object.create(ReporterBlock.prototype);
B_join.prototype.constructor = B_join;
/* Result is Slots concatenated. Always valid. */
B_join.prototype.startAction = function() {
	const word1 = this.slots[0].getData().getValue();
	const word2 = this.slots[1].getData().getValue();
	return new ExecutionStatusResult(new StringData(word1 + word2));
};



function B_Split(x, y) {
	ReporterBlock.call(this, x, y, "operators", Block.returnTypes.list);
	//this.addPart(new LabelText(this, Language.getStr("split")));
	//this.addPart(new StringSlot(this, "StrS_1", Language.getStr("hello")+" "+Language.getStr("world")));
	this.addPart(new StringSlot(this, "StrS_1", ""));
	//this.addPart(new LabelText(this, Language.getStr("by")));

	const inputType = EditableSlot.inputTypes.any;
	const snapType = Slot.snapTypes.numStrBool;
	const data = new SelectionData(Language.getStr("whitespace"), "whitespace");
	const dS = new DropSlot(this, "DS_separator", inputType, snapType, data);
	//dS.addEnterText(Language.getStr("Edit_Text"));
	dS.addEnterText(Language.getStr("Edit_text"));
	dS.addOption(new SelectionData(Language.getStr("letter"), "letter"));
	dS.addOption(new SelectionData(Language.getStr("whitespace"), "whitespace"));
	this.addPart(dS);
	this.parseTranslation(Language.getStr("block_split"));
}
B_Split.prototype = Object.create(ReporterBlock.prototype);
B_Split.prototype.constructor = B_Split;
/* Returns a list made from splitting the string by the provided character. */
B_Split.prototype.startAction = function() {
	const string1 = this.slots[0].getData().getValue();
	const splitD = this.slots[1].getData();
	let resultArray;
	if (splitD.type === Data.types.string) {
		const splitStr = splitD.getValue();
		resultArray = string1.split(splitStr);
	} else if (splitD.type === Data.types.selection) {
		const selection = splitD.getValue();
		if (selection === "letter") {
			resultArray = string1.split("");
		} else if (selection === "whitespace") {
			resultArray = string1.split(/\s+/);
		}
	} else {
		resultArray = [];
	}
	const dataArray = new Array(resultArray.length);
	for (let i = 0; i < resultArray.length; i++) {
		dataArray[i] = new StringData(resultArray[i]);
	}
	return new ExecutionStatusResult(new ListData(dataArray));
};



function B_IsAType(x, y) {
	PredicateBlock.call(this, x, y, "operators");
	//this.addPart(new LabelText(this, Language.getStr("is")));
	this.addPart(new RectSlot(this, "RectS_item", Slot.snapTypes.any, Slot.outputTypes.any, new NumData(5)));
	//this.addPart(new LabelText(this, Language.getStr("a")));
	const dS = new DropSlot(this, "DS_type", null, null, new SelectionData(Language.getStr("number"), "number"));
	dS.addOption(new SelectionData(Language.getStr("number"), "number"));
	dS.addOption(new SelectionData(Language.getStr("text"), "text"));
	dS.addOption(new SelectionData(Language.getStr("boolean"), "boolean"));
	dS.addOption(new SelectionData(Language.getStr("list"), "list"));
	dS.addOption(new SelectionData(Language.getStr("invalid_number"), "invalid_num"));
	this.addPart(dS);
	//this.addPart(new LabelText(this, "?"));
	this.parseTranslation(Language.getStr("block_validate"));
}
B_IsAType.prototype = Object.create(PredicateBlock.prototype);
B_IsAType.prototype.constructor = B_IsAType;
/* Returns whether the data is of the selected type */
B_IsAType.prototype.startAction = function() {
	const data = this.slots[0].getData();
	const selectionD = this.slots[1].getData();
	const selection = selectionD.getValue();
	const types = Data.types;
	if (selection === "number") {
		if (data.type === types.num && data.isValid) {
			return new ExecutionStatusResult(new BoolData(true));
		} else if (data.type === types.string && data.isNumber()) {
			return new ExecutionStatusResult(new BoolData(true));
		} else {
			return new ExecutionStatusResult(new BoolData(false));
		}
	} else if (selection === "text") {
		return new ExecutionStatusResult(new BoolData(data.type === types.string && !data.isNumber()));
	} else if (selection === "boolean") {
		return new ExecutionStatusResult(new BoolData(data.type === types.bool));
	} else if (selection === "list") {
		return new ExecutionStatusResult(new BoolData(data.type === types.list));
	} else if (selection === "invalid_num") {
		const invalidNumStr = (new NumData(0 / 0).asString().getValue()); // "not a valid number"
		if (data.type === types.num && !data.isValid) {
			return new ExecutionStatusResult(new BoolData(true));
		} else if (data.type === types.string && data.getValue() === invalidNumStr) {
			return new ExecutionStatusResult(new BoolData(true));
		} else {
			return new ExecutionStatusResult(new BoolData(false));
		}
	} else {
		return new ExecutionStatusResult(new BoolData(false));
	}
};



function B_mathOfNumber(x, y) {
	ReporterBlock.call(this, x, y, "operators");
	const dS = new DropSlot(this, "DS_operation", null, null, new SelectionData("sqrt", "sqrt"));
	dS.addOption(new SelectionData("sin", "sin"));
	dS.addOption(new SelectionData("cos", "cos"));
	dS.addOption(new SelectionData("tan", "tan"));

	dS.addOption(new SelectionData("asin", "asin"));
	dS.addOption(new SelectionData("acos", "acos"));
	dS.addOption(new SelectionData("atan", "atan"));

	dS.addOption(new SelectionData("ln", "ln"));
	dS.addOption(new SelectionData("e^", "e^"));
	dS.addOption(new SelectionData("ceiling", "ceiling"));

	dS.addOption(new SelectionData("log", "log"));
	dS.addOption(new SelectionData("10^", "10^"));
	dS.addOption(new SelectionData("floor", "floor"));

	dS.addOption(new SelectionData("abs", "abs"));
	dS.addOption(new SelectionData("sqrt", "sqrt"));

	this.addPart(dS);
	//this.addPart(new LabelText(this, Language.getStr("of")));
	this.addPart(new NumSlot(this, "NumS_val", 10));
}
B_mathOfNumber.prototype = Object.create(ReporterBlock.prototype);
B_mathOfNumber.prototype.constructor = B_mathOfNumber;
/* Applies selected operation to input */
B_mathOfNumber.prototype.startAction = function() {
	const operator = this.slots[0].getData().getValue();
	const data = this.slots[1].getData();
	let value = data.getValue();
	let isValid = data.isValid;
	if (operator === "sin") {
		value = Math.sin(value / 180 * Math.PI);
	} else if (operator === "cos") {
		value = Math.cos(value / 180 * Math.PI);
	} else if (operator === "tan") {
		value = Math.tan(value / 180 * Math.PI);
		if (Math.abs(value) > 1000000000) {
			value = 1 / 0;
		}
	} else if (operator === "asin") {
		value = Math.asin(value) / Math.PI * 180;
	} else if (operator === "acos") {
		value = Math.acos(value) / Math.PI * 180;
	} else if (operator === "atan") {
		value = Math.atan(value) / Math.PI * 180;
	} else if (operator === "ln") {
		value = Math.log(value);
	} else if (operator === "log") {
		try {
			value = Math.log10(value);
		} catch (e) {
			value = Math.log(10) / Math.log(value);
		}
	} else if (operator === "e^") {
		value = Math.exp(value);
	} else if (operator === "10^") {
		value = Math.pow(10, value);
	} else if (operator === "ceiling") {
		value = Math.ceil(value);
	} else if (operator === "floor") {
		value = Math.floor(value);
	} else if (operator === "abs") {
		value = Math.abs(value);
	} else if (operator === "sqrt") {
		value = Math.sqrt(value);
	}
	if (!isFinite(value) || isNaN(value)) {
		value = 0;
		isValid = false;
	}
	return new ExecutionStatusResult(new NumData(value, isValid));
};
