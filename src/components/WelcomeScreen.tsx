import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserPlus, Zap } from "lucide-react";

interface WelcomeScreenProps {
  onGuestLogin: () => void;
  onSignInClick: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGuestLogin,
  onSignInClick,
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-primary/10 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-primary">
              Welcome to Web3 Number Game
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Test your mental math skills and compete with players worldwide
            </p>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex flex-col space-y-3">
              <Button
                onClick={onGuestLogin}
                variant="outline"
                className="h-14 border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
              >
                <Zap className="mr-2 h-5 w-5" />
                Play as Guest
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Quick start without registration
              </p>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-3 text-sm text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={onSignInClick}
                className="h-14 bg-primary hover:bg-primary/90"
              >
                <User className="mr-2 h-5 w-5" />
                Sign In / Register
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Track your progress and compete in tournaments
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
