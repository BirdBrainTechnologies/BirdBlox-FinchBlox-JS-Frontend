/**
 * Execution status of a block with an error
 * @constructor
 */
function ExecutionStatusError() {

}
ExecutionStatusError.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusError.constructor = ExecutionStatusError;

/**
 * @inheritDoc
 * @return {boolean}
 */
ExecutionStatusError.prototype.hasError = function() {
	return true;
};