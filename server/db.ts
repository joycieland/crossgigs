import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, jobs, InsertJob, transactions, InsertTransaction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Job queries
export async function getAllJobs() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get jobs: database not available");
    return [];
  }
  return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
}

export async function getJobsByStatus(status: "active" | "completed") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get jobs: database not available");
    return [];
  }
  
  // For completed jobs, join with transactions to get transaction hash
  if (status === "completed") {
    const results = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        category: jobs.category,
        requiredSkills: jobs.requiredSkills,
        paymentAmount: jobs.paymentAmount,
        status: jobs.status,
        completedBy: jobs.completedBy,
        completedAt: jobs.completedAt,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        transactionHash: transactions.transactionHash,
      })
      .from(jobs)
      .leftJoin(transactions, eq(jobs.id, transactions.jobId))
      .where(eq(jobs.status, status))
      .orderBy(desc(jobs.createdAt));
    return results;
  }
  
  return await db.select().from(jobs).where(eq(jobs.status, status)).orderBy(desc(jobs.createdAt));
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get job: database not available");
    return undefined;
  }
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createJob(job: InsertJob) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create job: database not available");
    return undefined;
  }
  await db.insert(jobs).values(job);
  return true;
}

export async function completeJob(jobId: number, walletAddress: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot complete job: database not available");
    return false;
  }
  await db.update(jobs)
    .set({ 
      status: "completed", 
      completedBy: walletAddress,
      completedAt: new Date()
    })
    .where(eq(jobs.id, jobId));
  return true;
}

// Transaction queries
export async function createTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create transaction: database not available");
    return undefined;
  }
  await db.insert(transactions).values(transaction);
  return true;
}

export async function getTransactionsByJobId(jobId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get transactions: database not available");
    return [];
  }
  return await db.select().from(transactions).where(eq(transactions.jobId, jobId));
}
