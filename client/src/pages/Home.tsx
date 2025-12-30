import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Coins, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Home() {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionDescription, setSubmissionDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: activeJobs, isLoading: jobsLoading, refetch: refetchJobs } = trpc.jobs.getByStatus.useQuery({ status: "active" });
  const { data: completedJobs, refetch: refetchCompleted } = trpc.jobs.getByStatus.useQuery({ status: "completed" });
  const { data: walletInfo, isLoading: walletLoading, refetch: refetchWallet } = trpc.wallet.getAgentWallet.useQuery();

  const completeJobMutation = trpc.jobs.complete.useMutation({
    onSuccess: (data) => {
      const explorerUrl = `https://sepolia.basescan.org/tx/${data.transactionHash}`;
      toast.success("Payment sent successfully!", {
        description: (
          <a 
            href={explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-primary flex items-center gap-1"
          >
            View transaction: {data.transactionHash.slice(0, 10)}...
            <ExternalLink className="h-3 w-3" />
          </a>
        ),
      });
      setIsDialogOpen(false);
      setWalletAddress("");
      setSubmissionUrl("");
      setSubmissionDescription("");
      setSelectedJob(null);
      refetchJobs();
      refetchCompleted();
      // Refresh wallet balance to show updated amount
      refetchWallet();
    },
    onError: (error) => {
      toast.error("Payment failed", {
        description: error.message,
      });
    },
  });

  const handleDoneClick = (jobId: number) => {
    setSelectedJob(jobId);
    setIsDialogOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedJob || !walletAddress) return;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      toast.error("Invalid wallet address", {
        description: "Please enter a valid Ethereum address",
      });
      return;
    }

    completeJobMutation.mutate({
      jobId: selectedJob,
      walletAddress: walletAddress,
      submissionUrl: submissionUrl || undefined,
      submissionDescription: submissionDescription || undefined,
    });
  };

  const selectedJobData = activeJobs?.find(job => job.id === selectedJob);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Crossgigs
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Agent-verified gig marketplace</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-12">
        {/* Community Pool Section */}
        <Card className="mb-12 border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Community Pool</CardTitle>
                <CardDescription>Agent wallet funding available gigs</CardDescription>
            <p className="text-xs text-muted-foreground mt-1">Powered by Crossmint</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {walletLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading wallet information...</span>
              </div>
            ) : walletInfo ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                    <p className="text-3xl font-bold text-foreground flex items-center gap-2">
                      <Coins className="h-7 w-7 text-primary" />
                      {walletInfo.balance} {walletInfo.symbol}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {walletInfo.chain}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Wallet Address</p>
                  <p className="text-sm font-mono break-all text-foreground">{walletInfo.address}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Wallet information unavailable</p>
            )}
          </CardContent>
        </Card>

        {/* Active Jobs Section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Available Gigs</h2>
            <p className="text-muted-foreground">Complete jobs and receive instant USDC payments</p>
          </div>

          {jobsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activeJobs && activeJobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeJobs.map((job) => {
                const skills = JSON.parse(job.requiredSkills) as string[];
                return (
                  <Card key={job.id} className="flex flex-col hover:shadow-xl transition-shadow border-border/50">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {job.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <Coins className="h-4 w-4" />
                          <span>{job.paymentAmount} USDC</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <CardDescription className="text-sm mb-4 line-clamp-3">
                        {job.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => handleDoneClick(job.id)}
                        className="w-full"
                        variant="default"
                      >
                        Submit Work
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No active gigs available at the moment</p>
            </Card>
          )}
        </section>

        {/* Completed Jobs Section */}
        {completedJobs && completedJobs.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                Completed Gigs
              </h2>
              <p className="text-muted-foreground">Successfully completed and paid</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedJobs.map((job) => {
                const skills = JSON.parse(job.requiredSkills) as string[];
                const jobWithTx = job as typeof job & { transactionHash?: string | null };
                return (
                  <Card key={job.id} className="flex flex-col opacity-75 border-border/50">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {job.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <Coins className="h-4 w-4" />
                          <span>{job.paymentAmount} USDC</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <CardDescription className="text-sm mb-4 line-clamp-2">
                        {job.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      {job.completedBy && (
                        <div className="text-xs text-muted-foreground space-y-2">
                          {(job as any).submissionUrl && (
                            <div className="mb-3 p-3 rounded-md bg-accent/30 border border-border/50">
                              <p className="font-medium mb-2 text-foreground">📦 Deliverable:</p>
                              <a
                                href={(job as any).submissionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 break-all text-xs"
                              >
                                {(job as any).submissionUrl}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                              {(job as any).submissionDescription && (
                                <p className="mt-2 text-xs text-muted-foreground italic">
                                  "{(job as any).submissionDescription}"
                                </p>
                              )}
                            </div>
                          )}
                          <div>
                            <p className="font-medium mb-1">Paid to:</p>
                            <p className="font-mono break-all">{job.completedBy}</p>
                          </div>
                          {jobWithTx.transactionHash && (
                            <div>
                              <p className="font-medium mb-1">Transaction:</p>
                              <a
                                href={`https://sepolia.basescan.org/tx/${jobWithTx.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-primary hover:underline flex items-center gap-1 break-all"
                              >
                                {jobWithTx.transactionHash.slice(0, 10)}...{jobWithTx.transactionHash.slice(-8)}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Badge variant="default" className="w-full justify-center py-2">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Completed
                      </Badge>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Payment Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Work & Receive Payment</DialogTitle>
            <DialogDescription>
              Provide your deliverable details and wallet address to receive {selectedJobData?.paymentAmount} USDC
            </DialogDescription>
          </DialogHeader>
          
          {selectedJobData && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-accent/50">
                <p className="text-sm font-medium mb-1">{selectedJobData.title}</p>
                <p className="text-2xl font-bold text-primary flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  {selectedJobData.paymentAmount} USDC
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliverable">Deliverable Link</Label>
                  <Input
                    id="deliverable"
                    placeholder="https://github.com/user/repo or https://figma.com/..."
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to your work (GitHub repo, deployed site, Figma design, etc.)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Brief Description</Label>
                  <textarea
                    id="description"
                    placeholder="Describe what you delivered..."
                    value={submissionDescription}
                    onChange={(e) => setSubmissionDescription(e.target.value)}
                    className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Brief explanation of your work
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet">Your Wallet Address</Label>
                  <Input
                    id="wallet"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your Ethereum wallet address to receive payment
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setWalletAddress("");
                setSubmissionUrl("");
                setSubmissionDescription("");
                setSelectedJob(null);
              }}
              disabled={completeJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={!walletAddress || !submissionUrl || completeJobMutation.isPending}
            >
              {completeJobMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm & Receive Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
