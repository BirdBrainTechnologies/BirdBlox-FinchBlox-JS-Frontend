/**
 * Created by Tom on 6/2/2017.
 */

/**
 * @classdesc Execution status of a running block
 * @class
 * @augments ExecutionStatus
 */
function ExecutionStatusRunning(){

}
ExecutionStatusRunning.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusRunning.constructor = ExecutionStatus;
/**
 * @inheritDoc
 */
ExecutionStatus.isRunning = function(){
	return true;
};