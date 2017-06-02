/**
 * Created by Tom on 6/2/2017.
 */

/**
 * @constructor
 * @classdesc An abstract class for executing Blocks/Stacks/Slots/BlockSlots to convey their execution status.
 * @abstract
 */
function ExecutionStatus(){
	DebugOptions.throw("Abstract class may not be constructed");
}
/**
 * Is the block/stack/slot currently running?
 * @returns {boolean}
 */
ExecutionStatus.prototype.isRunning = function(){
	return false;
};
/**
 * Has the block/stack/slot encountered an error?
 * @returns {boolean}
 */
ExecutionStatus.prototype.hasError = function(){
	return false;
};
/**
 * What is the error?  Non-null iff hasError()
 * @returns {null|string}
 */
ExecutionStatus.prototype.getError = function(){
	return null;
};
/**
 * What is the result of execution.
 * @returns {Data}
 */
ExecutionStatus.prototype.getResultData = function(){
	return null;
};