/**
 * Created by Tom on 6/23/2017.
 */
function Timer(interval, callbackFn){
	this.interval = interval;
	this.callbackFn = callbackFn;
	this.updateTimer = null;
}
Timer.prototype.start = function(){
	if(this.updateTimer == null) {
		this.updateTimer = self.setInterval(this.tick.bind(this), this.interval);
	}
};
Timer.prototype.stop = function(){
	if(this.updateTimer != null){
		this.updateTimer = window.clearInterval(this.updateTimer);
		this.updateTimer = null;
	}
};
Timer.prototype.tick = function(){
	if(this.callbackFn != null) this.callbackFn();
};
Timer.prototype.isRunning = function(){
	return this.updateTimer != null;
};