import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as crossmint from "./crossmint";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  jobs: router({
    list: publicProcedure.query(async () => {
      return await db.getAllJobs();
    }),
    getByStatus: publicProcedure
      .input(z.object({ status: z.enum(["active", "completed"]) }))
      .query(async ({ input }) => {
        return await db.getJobsByStatus(input.status);
      }),
    complete: publicProcedure
      .input(
        z.object({
          jobId: z.number(),
          walletAddress: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Validate wallet address
        if (!crossmint.isValidEthereumAddress(input.walletAddress)) {
          throw new Error("Invalid Ethereum wallet address");
        }

        // Get job details
        const job = await db.getJobById(input.jobId);
        if (!job) {
          throw new Error("Job not found");
        }
        if (job.status === "completed") {
          throw new Error("Job already completed");
        }

        // Get agent wallet (using owner email)
        const agentEmail = "joyce@paella.dev";
        const agentWallet = await crossmint.getOrCreateWallet(agentEmail);

        // Transfer USDC
        const transferResult = await crossmint.transferUSDC(
          agentEmail,
          input.walletAddress,
          job.paymentAmount
        );

        // Mark job as completed
        await db.completeJob(input.jobId, input.walletAddress);

        // Record transaction
        await db.createTransaction({
          jobId: input.jobId,
          fromAddress: agentWallet.address,
          toAddress: input.walletAddress,
          amount: job.paymentAmount,
          transactionHash: transferResult.hash,
          explorerLink: transferResult.explorerLink,
          status: "completed",
        });

        return {
          success: true,
          transactionHash: transferResult.hash,
          explorerLink: transferResult.explorerLink,
        };
      }),
  }),

  wallet: router({
    getAgentWallet: publicProcedure.query(async () => {
      // Use a valid email address for the agent wallet
      const agentEmail = "joyce@paella.dev";
      const wallet = await crossmint.getOrCreateWallet(agentEmail);
      const balance = await crossmint.getWalletBalance(agentEmail);

      return {
        address: wallet.address,
        chain: wallet.chain,
        balance: balance.usdc?.balance || "0",
        symbol: balance.usdc?.symbol || "USDC",
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
