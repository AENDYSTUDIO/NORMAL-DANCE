import { redis } from "../../../../TELEGRAM 07.10/libs/redis";
import { qstashService } from "../../../lib/qstash-service";

export async function GET(request: Request) {
  try {
    // Test Redis connection
    const testKey = `test:${Date.now()}`;
    const testValue = { message: "Hello from Redis!", timestamp: new Date().toISOString() };
    
    // Set and get a value from Redis
    await redis.set(testKey, testValue, { ex: 300 }); // 5 minutes TTL
    const retrievedValue = await redis.get(testKey);
    
    // Test QStash by publishing a test message
    const qstashResult = await qstashService.publish('test-queue', {
      test: true,
      message: 'Test message from integration test',
      timestamp: Date.now(),
    });

    return Response.json({
      success: true,
      redisTest: {
        success: retrievedValue !== null,
        testKey,
        testValue,
        retrievedValue,
      },
      qstashTest: qstashResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Integration test error:", error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}