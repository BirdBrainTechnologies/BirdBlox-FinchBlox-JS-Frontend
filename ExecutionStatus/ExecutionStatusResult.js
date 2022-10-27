/**
 * Execution status of a completed block that returns a value
 * @param {Data} result - The data from execution
 * @constructor
 */
function ExecutionStatusResult(result) {
  this.result = result;
}
ExecutionStatusResult.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusResult.constructor = ExecutionStatusResult;

/**
 * @inheritDoc
 * @return {Data}
 */
ExecutionStatusResult.prototype.getResult = function() {
  return this.result;
};
