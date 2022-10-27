/**
 * Execution status of a running block
 * @constructor
 */
function ExecutionStatusRunning() {

}
ExecutionStatusRunning.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusRunning.constructor = ExecutionStatus;

/**
 * @inheritDoc
 * @return {boolean}
 */
ExecutionStatusRunning.prototype.isRunning = function() {
  return true;
};
