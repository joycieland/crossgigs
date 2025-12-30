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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: activeJobs, isLoading: jobsLoading, refetch: refetchJobs } = trpc.jobs.getByStatus.useQuery({ status: "active" });
  const { data: completedJobs, refetch: refetchCompleted } = trpc.jobs.getByStatus.useQuery({ status: "completed" });
  const { data: walletInfo, isLoading: walletLoading } = trpc.wallet.getAgentWallet.useQuery();

  const completeJobMutation = trpc.jobs.complete.useMutation({
    onSuccess: (data) => {
      toast.success("Payment sent successfully!", {
        description: `Transaction: ${data.transactionHash.slice(0, 10)}...`,
      });
      setIsDialogOpen(false);
      setWalletAddress("");
      setSelectedJob(null);
      refetchJobs();
      refetchCompleted();
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
                FreelanceChain
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Blockchain-powered gig marketplace</p>
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
                        size="lg"
                      >
                        Mark as Done
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
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium mb-1">Paid to:</p>
                          <p className="font-mono break-all">{job.completedBy}</p>
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
            <DialogTitle>Complete Job & Receive Payment</DialogTitle>
            <DialogDescription>
              Enter your wallet address to receive {selectedJobData?.paymentAmount} USDC on base-sepolia
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
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setWalletAddress("");
                setSelectedJob(null);
              }}
              disabled={completeJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={!walletAddress || completeJobMutation.isPending}
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
