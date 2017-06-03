/**
 * Created by Tom on 6/2/2017.
 */

/**
 * @classdesc Execution status of a block that is done but does not return a value
 * @class
 * @augments ExecutionStatus
 */
function ExecutionStatusDone(){

}
ExecutionStatusDone.prototype = Object.create(ExecutionStatus.prototype);
ExecutionStatusDone.constructor = ExecutionStatusDone;