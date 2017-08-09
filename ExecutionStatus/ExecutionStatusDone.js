/**
 * Execution status of a block that is done but does not return a value
 * @constructor
 */
function ExecutionStatusDone() {

}
ExecutionStatusDone.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusDone.constructor = ExecutionStatusDone;