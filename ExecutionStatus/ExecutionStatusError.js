/**
 * Created by Tom on 6/2/2017.
 */

/**
 * @classdesc Execution status of a block with an error
 * @class
 * @augments ExecutionStatus
 * @param {string} error - The description of the error that occurred
 */
function ExecutionStatusError(error){
	/** @type {string} */
	this.error = error;
}
ExecutionStatusError.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusError.constructor = ExecutionStatusError;
/**
 * @inheritDoc
 */
ExecutionStatusError.prototype.hasError = function(){
	return true;
};
/**
 * @inheritDoc
 */
ExecutionStatusError.prototype.getError = function(){
	return this.error;
};