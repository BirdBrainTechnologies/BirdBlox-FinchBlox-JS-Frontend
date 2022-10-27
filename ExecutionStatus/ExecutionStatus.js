/**
 * An abstract class for executing Blocks/Stacks/Slots/BlockSlots to convey their execution status.
 * @constructor
 */
function ExecutionStatus() {
  DebugOptions.markAbstract();
}

/**
 * Is the block/stack/slot currently running?
 * @return {boolean}
 */
ExecutionStatus.prototype.isRunning = function() {
  return false;
};

/**
 * Has the block/stack/slot encountered an error?
 * @return {boolean}
 */

ExecutionStatus.prototype.hasError = function() {
  return false;
};

/**
 * What is the result of execution.
 * @return {Data}
 */
ExecutionStatus.prototype.getResult = function() {
  return null;
};
