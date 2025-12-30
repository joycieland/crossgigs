import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

function createTestContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("jobs router", () => {
  let testJobId: number | undefined;

  beforeAll(async () => {
    // Get the first active job for testing
    const activeJobs = await db.getJobsByStatus("active");
    if (activeJobs.length > 0) {
      testJobId = activeJobs[0]?.id;
    }
  });

  it("should list all jobs", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const jobs = await caller.jobs.list();

    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
    
    // Verify job structure
    const firstJob = jobs[0];
    expect(firstJob).toHaveProperty("id");
    expect(firstJob).toHaveProperty("title");
    expect(firstJob).toHaveProperty("description");
    expect(firstJob).toHaveProperty("category");
    expect(firstJob).toHaveProperty("requiredSkills");
    expect(firstJob).toHaveProperty("paymentAmount");
    expect(firstJob).toHaveProperty("status");
  });

  it("should get active jobs", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const activeJobs = await caller.jobs.getByStatus({ status: "active" });

    expect(Array.isArray(activeJobs)).toBe(true);
    
    // All returned jobs should have active status
    activeJobs.forEach(job => {
      expect(job.status).toBe("active");
    });
  });

  it("should get completed jobs", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const completedJobs = await caller.jobs.getByStatus({ status: "completed" });

    expect(Array.isArray(completedJobs)).toBe(true);
    
    // All returned jobs should have completed status
    completedJobs.forEach(job => {
      expect(job.status).toBe("completed");
    });
  });

  it("should reject invalid wallet address", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    if (!testJobId) {
      console.log("No test job available, skipping test");
      return;
    }

    await expect(
      caller.jobs.complete({
        jobId: testJobId,
        walletAddress: "invalid-address",
      })
    ).rejects.toThrow("Invalid Ethereum wallet address");
  });

  it("should reject non-existent job", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.jobs.complete({
        jobId: 999999,
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
      })
    ).rejects.toThrow("Job not found");
  });

  it("should validate job data structure", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const jobs = await caller.jobs.list();
    
    if (jobs.length > 0) {
      const job = jobs[0];
      
      // Verify required skills is valid JSON
      expect(() => JSON.parse(job.requiredSkills)).not.toThrow();
      
      const skills = JSON.parse(job.requiredSkills);
      expect(Array.isArray(skills)).toBe(true);
      
      // Verify payment amount is a valid number string
      expect(parseFloat(job.paymentAmount)).toBeGreaterThan(0);
    }
  });
});
