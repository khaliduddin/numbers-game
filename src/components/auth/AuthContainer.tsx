import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import WalletConnect from "./WalletConnect";
import { Wallet, Mail, User } from "lucide-react";

interface AuthContainerProps {
  onLogin?: (values: { email: string; password: string }) => void;
  onSignup?: (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  onWalletConnect?: (walletAddress: string) => void;
  defaultTab?: "login" | "signup" | "wallet";
}

const AuthContainer = ({
  onLogin = () => {},
  onSignup = () => {},
  onWalletConnect = () => {},
  defaultTab = "login",
}: AuthContainerProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleLogin = (values: { email: string; password: string }) => {
    onLogin(values);
  };

  const handleSignup = (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    onSignup(values);
  };

  const handleWalletConnect = (address: string) => {
    if (address) {
      setIsWalletConnected(true);
      setWalletAddress(address);
    } else {
      setIsWalletConnected(false);
      setWalletAddress("");
    }
    onWalletConnect(address);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
          Web3 Number Game
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 sm:mb-6">
            <TabsTrigger
              value="login"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Login</span>
              <span className="xs:hidden">Log</span>
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Sign Up</span>
              <span className="xs:hidden">Sign</span>
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Wallet</span>
              <span className="xs:hidden">Wallet</span>
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="p-0">
              <TabsContent value="login" className="mt-0">
                <LoginForm
                  onSubmit={handleLogin}
                  onSignUpClick={() => setActiveTab("signup")}
                  onForgotPassword={() =>
                    console.log("Forgot password clicked")
                  }
                />
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <SignupForm
                  onSubmit={handleSignup}
                  onLoginClick={() => setActiveTab("login")}
                />
              </TabsContent>

              <TabsContent value="wallet" className="mt-0">
                <div className="p-4 sm:p-6">
                  <WalletConnect
                    onConnect={handleWalletConnect}
                    isConnected={isWalletConnected}
                    walletAddress={walletAddress}
                  />

                  {isWalletConnected && (
                    <div className="mt-4 sm:mt-6 text-center">
                      <p className="text-xs sm:text-sm text-gray-600">
                        You can now participate in tournaments and track your
                        on-chain stats.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthContainer;
