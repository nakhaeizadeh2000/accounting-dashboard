const { TestContext } = require('./test/context/test-context');

async function testRedis() {
  const testContext = new TestContext();
  
  try {
    await testContext.initialize();
    console.log('Test context initialized');
    
    await testContext.testRedis();
    
    await testContext.flushRedis();
    
  } finally {
    await testContext.cleanup();
  }
}

testRedis().catch(console.error);