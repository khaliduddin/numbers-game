import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Check, X, Edit } from "lucide-react";
import { unifiedProfileService } from "@/lib/unifiedProfileService";

interface ProfileFieldProps {
  label: string;
  value: string;
  placeholder: string;
  isEditing: boolean;
  editedValue: string;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (value: string) => void;
  type?: string;
  formatDisplayValue?: (value: string) => string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  placeholder,
  isEditing,
  editedValue,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  onChange,
  type = "text",
  formatDisplayValue,
}) => {
  const displayValue = formatDisplayValue ? formatDisplayValue(value) : value;

  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-sm font-medium w-24">{label}:</span>
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editedValue}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-sm max-w-[250px]"
            placeholder={placeholder}
            type={type}
            disabled={isSaving}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onSave}
            disabled={isSaving}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm text-muted-foreground">
            {displayValue || "Not set"}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onEdit}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

interface UsernameFieldProps {
  username: string;
  editedUsername: string;
  isEditing: boolean;
  isSaving: boolean;
  saveError: string | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (value: string) => void;
}

const UsernameField: React.FC<UsernameFieldProps> = ({
  username,
  editedUsername,
  isEditing,
  isSaving,
  saveError,
  onEdit,
  onCancel,
  onSave,
  onChange,
}) => {
  return (
    <div>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            value={editedUsername}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-lg font-bold max-w-[200px]"
            placeholder="Username"
            disabled={isSaving}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onSave}
            disabled={isSaving}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {username}
          </h1>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}
      {saveError && (
        <div className="text-red-500 text-sm mt-1">{saveError}</div>
      )}
    </div>
  );
};

interface ProfileFormProps {
  user: {
    id: string;
    username: string;
    email?: string;
    telegramId?: string;
    walletAddress?: string;
    phoneNumber?: string;
    referralCode?: string;
  };
  onSaveProfile: (updatedUser: any) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSaveProfile }) => {
  // State for editing fields
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingTelegramId, setIsEditingTelegramId] = useState(false);
  const [isEditingWalletAddress, setIsEditingWalletAddress] = useState(false);
  const [isEditingPhoneNumber, setIsEditingPhoneNumber] = useState(false);

  // State for edited values
  const [editedUsername, setEditedUsername] = useState(user.username || "");
  const [editedEmail, setEditedEmail] = useState(user.email || "");
  const [editedTelegramId, setEditedTelegramId] = useState(
    user.telegramId || "",
  );
  const [editedWalletAddress, setEditedWalletAddress] = useState(
    user.walletAddress || "",
  );
  const [editedPhoneNumber, setEditedPhoneNumber] = useState(
    user.phoneNumber || "",
  );

  // State for saving status
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Handle saving username
  const handleSaveUsername = async () => {
    if (!editedUsername.trim()) {
      setSaveError("Username cannot be empty");
      return;
    }

    if (editedUsername === user.username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // Check if username is unique in Supabase
      try {
        const isUnique = await unifiedProfileService.isUsernameUnique(
          editedUsername,
          user.id,
        );

        if (!isUnique) {
          setSaveError("Username is already taken. Please choose another.");
          setIsSaving(false);
          return;
        }
      } catch (err) {
        console.error("Error checking username uniqueness:", err);
        // Continue without uniqueness check if there's an error with Supabase
      }

      const updatedUser = {
        ...user,
        username: editedUsername,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${editedUsername}`,
      };

      onSaveProfile(updatedUser);
      setIsEditingUsername(false);
    } catch (err) {
      console.error("Error in handleSaveUsername:", err);
      setSaveError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving email
  const handleSaveEmail = async () => {
    if (editedEmail === user.email) {
      setIsEditingEmail(false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const updatedUser = {
        ...user,
        email: editedEmail,
      };

      onSaveProfile(updatedUser);
      setIsEditingEmail(false);
    } catch (err) {
      console.error("Error in handleSaveEmail:", err);
      setSaveError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving telegram ID
  const handleSaveTelegramId = async () => {
    if (editedTelegramId === user.telegramId) {
      setIsEditingTelegramId(false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const updatedUser = {
        ...user,
        telegramId: editedTelegramId,
      };

      onSaveProfile(updatedUser);
      setIsEditingTelegramId(false);
    } catch (err) {
      console.error("Error in handleSaveTelegramId:", err);
      setSaveError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving wallet address
  const handleSaveWalletAddress = async () => {
    if (editedWalletAddress === user.walletAddress) {
      setIsEditingWalletAddress(false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const updatedUser = {
        ...user,
        walletAddress: editedWalletAddress,
      };

      onSaveProfile(updatedUser);
      setIsEditingWalletAddress(false);
    } catch (err) {
      console.error("Error in handleSaveWalletAddress:", err);
      setSaveError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving phone number
  const handleSavePhoneNumber = async () => {
    if (editedPhoneNumber === user.phoneNumber) {
      setIsEditingPhoneNumber(false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const updatedUser = {
        ...user,
        phoneNumber: editedPhoneNumber,
      };

      onSaveProfile(updatedUser);
      setIsEditingPhoneNumber(false);
    } catch (err) {
      console.error("Error in handleSavePhoneNumber:", err);
      setSaveError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 text-center md:text-left">
      <div className="flex flex-col md:flex-row md:items-center gap-1 sm:gap-2 md:gap-4 justify-center md:justify-start">
        <UsernameField
          username={user.username}
          editedUsername={editedUsername}
          isEditing={isEditingUsername}
          isSaving={isSaving}
          saveError={saveError}
          onEdit={() => setIsEditingUsername(true)}
          onCancel={() => {
            setIsEditingUsername(false);
            setEditedUsername(user.username || "");
            setSaveError(null);
          }}
          onSave={handleSaveUsername}
          onChange={setEditedUsername}
        />
      </div>

      {/* Email Field */}
      <ProfileField
        label="Email"
        value={user.email || ""}
        placeholder="Email address"
        isEditing={isEditingEmail}
        editedValue={editedEmail}
        isSaving={isSaving}
        type="email"
        onEdit={() => setIsEditingEmail(true)}
        onCancel={() => {
          setIsEditingEmail(false);
          setEditedEmail(user.email || "");
          setSaveError(null);
        }}
        onSave={handleSaveEmail}
        onChange={setEditedEmail}
      />

      {/* Telegram ID Field */}
      <ProfileField
        label="Telegram ID"
        value={user.telegramId || ""}
        placeholder="Telegram username"
        isEditing={isEditingTelegramId}
        editedValue={editedTelegramId}
        isSaving={isSaving}
        onEdit={() => setIsEditingTelegramId(true)}
        onCancel={() => {
          setIsEditingTelegramId(false);
          setEditedTelegramId(user.telegramId || "");
          setSaveError(null);
        }}
        onSave={handleSaveTelegramId}
        onChange={setEditedTelegramId}
      />

      {/* Wallet Address Field */}
      <ProfileField
        label="Wallet"
        value={user.walletAddress || ""}
        placeholder="Wallet address"
        isEditing={isEditingWalletAddress}
        editedValue={editedWalletAddress}
        isSaving={isSaving}
        onEdit={() => setIsEditingWalletAddress(true)}
        onCancel={() => {
          setIsEditingWalletAddress(false);
          setEditedWalletAddress(user.walletAddress || "");
          setSaveError(null);
        }}
        onSave={handleSaveWalletAddress}
        onChange={setEditedWalletAddress}
        formatDisplayValue={formatWalletAddress}
      />

      {/* Phone Number Field */}
      <ProfileField
        label="Phone"
        value={user.phoneNumber || ""}
        placeholder="Phone number"
        isEditing={isEditingPhoneNumber}
        editedValue={editedPhoneNumber}
        isSaving={isSaving}
        type="tel"
        onEdit={() => setIsEditingPhoneNumber(true)}
        onCancel={() => {
          setIsEditingPhoneNumber(false);
          setEditedPhoneNumber(user.phoneNumber || "");
          setSaveError(null);
        }}
        onSave={handleSavePhoneNumber}
        onChange={setEditedPhoneNumber}
      />

      {/* Referral Code Display */}
      {user.referralCode && (
        <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Your Referral Link:</span>
            <div className="flex items-center gap-2">
              <code className="bg-background px-2 py-1 rounded text-sm font-mono overflow-x-auto max-w-[200px] whitespace-nowrap">
                {`https://numbergame.com/join?ref=${user.referralCode}`}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://numbergame.com/join?ref=${user.referralCode}` ||
                      "",
                  );
                  // You could add a toast notification here
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Share this link with friends to earn rewards when they join!
            </p>
          </div>
        </div>
      )}

      {!user.referralCode && (user.email || user.telegramId) && (
        <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20">
          <p className="text-xs text-muted-foreground">
            Your referral code will be generated after your profile is saved.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
