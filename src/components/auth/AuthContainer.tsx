import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import WalletConnect from "./WalletConnect";
import { Wallet, Mail, User, ArrowLeft, Zap } from "lucide-react";

interface AuthContainerProps {
  onLogin?: (values: { email: string; password: string }) => void;
  onSignup?: (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  onWalletConnect?: (walletAddress: string) => void;
  onGuestLogin?: () => void;
  onBackToWelcome?: () => void;
  defaultTab?: "login" | "signup" | "wallet";
  showWelcomeTitle?: boolean;
}

const AuthContainer = ({
  onLogin = () => {},
  onSignup = () => {},
  onWalletConnect = () => {},
  onGuestLogin = () => {},
  onBackToWelcome = () => {},
  defaultTab = "login",
  showWelcomeTitle = false,
}: AuthContainerProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleLogin = (values: { email: string; password: string }) => {
    // After successful login, remove showAuth flag to prevent login loop
    localStorage.removeItem("showAuth");
    // Call the onLogin handler passed from parent
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
    try {
      if (address) {
        setIsWalletConnected(true);
        setWalletAddress(address);
      } else {
        setIsWalletConnected(false);
        setWalletAddress("");
      }
      // Call the callback synchronously to avoid Promise issues
      onWalletConnect(address);
      return undefined;
    } catch (error) {
      console.error("Error in handleWalletConnect:", error);
      return undefined;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        {showWelcomeTitle ? (
          <CardHeader className="text-center pb-2 px-0">
            <CardTitle className="text-2xl font-bold text-primary">
              Welcome to Web3 Number Game
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Test your mental math skills and compete with players worldwide
            </p>
          </CardHeader>
        ) : (
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToWelcome}
              className="flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-center flex-1">
              Web3 Number Game
            </h1>
            <div className="w-12"></div> {/* Spacer for balance */}
          </div>
        )}

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
                <div className="p-4 sm:p-6">
                  {showWelcomeTitle && (
                    <div className="mb-4">
                      <Button
                        onClick={onGuestLogin}
                        variant="outline"
                        className="w-full h-14 border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all mb-2"
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        Play as Guest
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mb-4">
                        Quick start without registration
                      </p>

                      <div className="relative flex items-center py-2 mb-4">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-3 text-sm text-gray-500">
                          or
                        </span>
                        <div className="flex-grow border-t border-gray-300"></div>
                      </div>
                    </div>
                  )}
                  <LoginForm
                    onSubmit={handleLogin}
                    onSignUpClick={() => setActiveTab("signup")}
                    onForgotPassword={() =>
                      console.log("Forgot password clicked")
                    }
                  />
                </div>
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
