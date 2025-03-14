import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Wallet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  tournamentName?: string;
  entryFee?: number;
  onPaymentComplete?: () => void;
}

const PaymentModal = ({
  isOpen = true,
  onClose = () => {},
  tournamentName = "Weekly Pro Tournament",
  entryFee = 10,
  onPaymentComplete = () => {},
}: PaymentModalProps) => {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [walletBalance, setWalletBalance] = useState<number>(25.75); // Mock wallet balance

  const handlePayment = () => {
    setPaymentStatus("processing");

    // Simulate payment processing
    setTimeout(() => {
      if (walletBalance >= entryFee) {
        setWalletBalance((prev) => prev - entryFee);
        setPaymentStatus("success");

        // After showing success state, complete the payment process
        setTimeout(() => {
          onPaymentComplete();
          onClose();
        }, 2000);
      } else {
        setPaymentStatus("error");
      }
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Tournament Entry Payment
          </DialogTitle>
          <DialogDescription>
            Complete your payment to join the {tournamentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tournament Details */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tournament</span>
                <span className="font-semibold">{tournamentName}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">Entry Fee</span>
                <span className="font-semibold text-primary">
                  {entryFee} USDC
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Your Wallet</span>
              </div>
              <span className="font-semibold">
                {walletBalance.toFixed(2)} USDC
              </span>
            </div>

            {walletBalance < entryFee && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Insufficient balance. Please add funds to your wallet.
                </span>
              </div>
            )}
          </div>

          {/* Payment Status */}
          {paymentStatus === "processing" && (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-center">Processing your payment...</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="flex flex-col items-center justify-center py-4 space-y-2 text-green-500">
              <CheckCircle className="h-8 w-8" />
              <p className="text-sm text-center">
                Payment successful! You're now registered for the tournament.
              </p>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="flex flex-col items-center justify-center py-4 space-y-2 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm text-center">
                Payment failed. Please check your wallet balance and try again.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {paymentStatus === "idle" && (
            <Button
              onClick={handlePayment}
              disabled={walletBalance < entryFee}
              className="w-full"
            >
              Pay {entryFee} USDC
            </Button>
          )}

          {paymentStatus === "error" && (
            <Button
              onClick={() => setPaymentStatus("idle")}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          )}

          {(paymentStatus === "processing" || paymentStatus === "success") && (
            <Button disabled className="w-full">
              {paymentStatus === "processing"
                ? "Processing..."
                : "Payment Complete"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
