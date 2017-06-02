/**
 * Created by Tom on 6/2/2017.
 */

/**
 * @classdesc Execution status of a completed block
 * @class
 * @augments ExecutionStatus
 * @param {Data!} result - The error that occurred
 */
function ExecutionStatusResult(result){
	/** @type {Data!} */
	this.result = result;
}
ExecutionStatusResult.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusResult.constructor = ExecutionStatusResult;
/**
 * @inheritDoc
 */
ExecutionStatusResult.prototype.getResultData = function(){
	return this.result;
};