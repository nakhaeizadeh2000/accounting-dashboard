/**
 * Nuclear Redis error suppression
 * This completely prevents Redis socket errors from being emitted
 */

// Override all possible error emission paths before anything else loads
const originalProcessEmit = process.emit;
const originalEventEmitterEmit = require('events').EventEmitter.prototype.emit;

// Completely block Redis errors at the source
function suppressRedisError(error) {
  if (!error) return false;
  
  return (
    (error.constructor && error.constructor.name === 'SocketClosedUnexpectedlyError') ||
    (error.name && (error.name === 'SocketClosedUnexpectedlyError' || error.name === 'ClientClosedError')) ||
    (error.message && (
      error.message.includes('Socket closed unexpectedly') ||
      error.message.includes('Connection is closed') ||
      error.message.includes('The client is closed') ||
      error.message.includes('SocketClosedUnexpectedlyError') ||
      error.message.includes('@redis/client')
    )) ||
    (error.stack && (
      error.stack.includes('@redis/client') ||
      error.stack.includes('Socket closed unexpectedly')
    ))
  );
}

// Override process.emit globally
process.emit = function(event, ...args) {
  if ((event === 'uncaughtException' || event === 'unhandledRejection') && 
      args[0] && suppressRedisError(args[0])) {
    // Completely prevent Redis errors from being emitted
    return true;
  }
  return originalProcessEmit.apply(this, [event, ...args]);
};

// Override EventEmitter.emit to catch errors from Redis clients
require('events').EventEmitter.prototype.emit = function(event, ...args) {
  if (event === 'error' && args[0] && suppressRedisError(args[0])) {
    // Completely suppress Redis socket errors
    return true;
  }
  return originalEventEmitterEmit.apply(this, [event, ...args]);
};

// Prevent any existing error listeners
const originalAddListener = process.addListener;
const originalOn = process.on;

process.addListener = process.on = function(event, listener) {
  if (event === 'uncaughtException' || event === 'unhandledRejection') {
    const wrappedListener = function(...args) {
      if (args[0] && suppressRedisError(args[0])) {
        return; // Don't call the original listener for Redis errors
      }
      return listener.apply(this, args);
    };
    return originalOn.call(this, event, wrappedListener);
  }
  return originalOn.call(this, event, listener);
};

console.log('🛡️ Redis error suppressor activated');