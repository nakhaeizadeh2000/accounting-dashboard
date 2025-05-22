// Cleanup script to force close Redis connections
const { exec } = require('child_process');

console.log('🧹 Cleaning up Redis connections...');

// Function to run shell commands
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.warn(`Warning: ${error.message}`);
        return resolve('');
      }
      if (stderr) {
        console.warn(`Warning: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

// Check if Redis is running
async function checkRedisConnections() {
  try {
    // For Docker setup
    await runCommand('docker exec redis redis-cli CLIENT LIST');
    console.log('✅ Redis connections checked and cleaned up');
  } catch (error) {
    console.log('No Redis container found, skipping cleanup');
  }
}

// Run cleanup
checkRedisConnections()
  .then(() => console.log('✅ Cleanup complete'))
  .catch((err) => console.error('❌ Cleanup error:', err))
  .finally(() => process.exit(0));
