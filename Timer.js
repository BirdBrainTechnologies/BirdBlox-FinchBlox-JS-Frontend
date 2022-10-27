/**
 * Represents a timer that fires a function regularly.  The timer doesn't start until start() is called.
 * @param {number} interval - Time between tics in milliseconds
 * @param {function} callbackFn - The function to call each tick
 * @constructor
 */
function Timer(interval, callbackFn) {
  this.interval = interval;
  this.callbackFn = callbackFn;
  this.updateTimer = null;
}

/**
 * Starts the timer
 */
Timer.prototype.start = function() {
  if (this.updateTimer == null) {
    this.updateTimer = self.setInterval(this.tick.bind(this), this.interval);
  }
};

/**
 * Stops the timer
 */
Timer.prototype.stop = function() {
  if (this.updateTimer != null) {
    this.updateTimer = window.clearInterval(this.updateTimer);
    this.updateTimer = null;
  }
};

/**
 * Called each tick
 */
Timer.prototype.tick = function() {
  if (this.callbackFn != null) this.callbackFn();
};

/**
 * Returns whether the timer is running
 * @return {boolean}
 */
Timer.prototype.isRunning = function() {
  return this.updateTimer != null;
};
