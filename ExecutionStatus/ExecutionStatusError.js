/**
 * Created by Tom on 6/2/2017.
 */

/**
 * @classdesc Execution status of a block with an error
 * @class
 * @augments ExecutionStatus
 */
function ExecutionStatusError(){

}
ExecutionStatusError.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusError.constructor = ExecutionStatusError;
/**
 * @inheritDoc
 */
ExecutionStatusError.prototype.hasError = function(){
	return true;
};