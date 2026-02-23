"use client";

import type React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Copy, Eye, EyeOff, Check, UserPen } from "lucide-react";
import * as actions from "@/app/actions/profile-actions";

const LABELS: Record<string, string> = {
  fullName: "Full Name",
  email: "Email Address",
  phone: "Phone Number",
  country: "Country",
  address: "Street Address",
  city: "City",
  zipcode: "Zip Code",
};

export default function ProfileClient({ initialUser }: { initialUser: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [avatar, setAvatar] = useState<string>(initialUser?.avatar || "");

  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [accountStatus, setAccountStatus] = useState(
    initialUser?.accountstatus || "Activated",
  );

  const [formData, setFormData] = useState(initialUser || {});

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [twoFAEnabled, setTwoFAEnabled] = useState(
    !!initialUser?.twoFactorEnabled,
  );
  const [show2FA, setShow2FA] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [otp, setOtp] = useState("");

  const [showEmailPrefs, setShowEmailPrefs] = useState(false);
  const [emailPrefs, setEmailPrefs] = useState(
    initialUser?.emailPreferences || { security: true, marketing: false },
  );

  const copy2fskey = () => {
    navigator.clipboard.writeText(manualKey);
    toast.success("Til ID copied to clipboard");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p: any) => ({ ...p, [name]: value }));
  };

  const handleAvatarUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Avatar must be less than 5MB");
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
      setFormData((p: any) => ({ ...p, avatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const saveChanges = async () => {
    setLoading(true);
    const res = await actions.updateProfileAction(formData);
    setLoading(false);
    if (!res.success) return toast.error("Failed to update profile");

    toast.success("Profile updated successfully");
    if (res.profileStatus) {
      window.dispatchEvent(new Event("profile-updated"));
      localStorage.setItem("profileStatus", "true");
    } else {
      localStorage.setItem("profileStatus", "false");
    }
    setIsEditing(false);
  };

  const toggleAccountStatus = async () => {
    const res = await actions.toggleAccountStatusAction();
    if (!res.success) return toast.error("Failed to update account status");
    setAccountStatus(res.status);
    setShowDeactivate(false);
    toast.success(
      res.status === "Activated"
        ? "Account activated successfully"
        : "Account deactivated successfully",
    );
  };

  const deleteAccount = async () => {
    await actions.deleteAccountAction();
    window.location.href = "/login";
  };

  const changePassword = async () => {
    const res = await actions.changePasswordAction({
      currentPassword,
      newPassword,
    });
    if (!res.success) return toast.error(res.message || "Error");
    toast.success("Password changed successfully");
    setShowChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  const start2FA = async () => {
    const res = await actions.setup2FAAction();
    if (!res.success) return toast.error("Error setting up 2FA");
    setQrCode(res.qrCode!);
    setManualKey(res.manualKey!);
    setShow2FA(true);
  };

  const verify2FA = async () => {
    const res = await actions.verify2FAAction(otp);
    if (!res.success) return toast.error(res.message || "Invalid OTP");
    toast.success("Two-factor authentication enabled");
    setTwoFAEnabled(true);
    setShow2FA(false);
    setOtp("");
  };

  const disable2FA = async () => {
    const res = await actions.disable2FAAction({ currentPassword, otp });
    if (!res.success) return toast.error(res.message || "Error");
    toast.success("Two-factor authentication disabled");
    setTwoFAEnabled(false);
    setShowDisable2FA(false);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold pro-head">Profile Settings</h1>
          <p className="text-foreground/70 pro-desc">
            Manage your account information and preferences
          </p>
        </div>
        <Button
          onClick={() => (isEditing ? saveChanges() : setIsEditing(true))}
          disabled={loading}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <Card className="glass border-primary/20 p-8 card-profile">
        <h3 className="text-lg font-bold mb-6">Personal Information</h3>
        <div className="flex justify-center">
          <label className="cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarUpload}
              disabled={!isEditing}
            />
            <div className="w-28 h-28 rounded-full border-2 p-1.5 border-gray-200 overflow-hidden flex items-center justify-center bg-white relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className={
                    !isEditing ? "opacity-30 rounded-full" : "rounded-full"
                  }
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  Upload Avatar
                </span>
              )}
            </div>
            <i className="edit-avatar-icon">
              <UserPen />
            </i>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {["fullName", "email", "phone", "country"].map((field) => (
            <div key={field} className="space-y-2">
              <Label>{LABELS[field]}</Label>
              <Input
                name={field}
                value={(formData as any)[field] || ""}
                onChange={handleInputChange}
                placeholder={LABELS[field]}
                disabled={
                  !isEditing || field === "email" || field === "country"
                }
                className={
                  !isEditing || field === "email" || field === "country"
                    ? "bg-muted/30 cursor-not-allowed input"
                    : "input"
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass border-primary/20 p-8 card-profile">
        <h3 className="text-lg font-bold mb-6">Shipping Address</h3>
        <div className="space-y-6">
          <Input
            name="address"
            value={formData.address || ""}
            placeholder={LABELS["address"]}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={
              !isEditing ? "bg-muted/30 cursor-not-allowed input" : "input"
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["city", "zipcode"].map((field) => (
              <Input
                key={field}
                name={field}
                placeholder={LABELS[field]}
                value={(formData as any)[field] || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={
                  !isEditing ? "bg-muted/30 cursor-not-allowed input" : "input"
                }
              />
            ))}
          </div>
        </div>

        <div className="flex w-full lg:flex-row md:flex-row sm:flex-row flex-col gap-2 items-end justify-end">

        <Button
          onClick={() => (isEditing ? saveChanges() : setIsEditing(true))}
          disabled={loading}
          variant={isEditing ? "default" : "outline"}
          className={`${isEditing ? "flex" : "hidden"} w-full lg:w-fit md:w-fit sm:w-fit`}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
        <Button
          onClick={() => (setIsEditing(false))}
          disabled={loading}
          variant={isEditing ? "default" : "outline"}
          className={`${isEditing ? "flex" : "hidden"} w-full lg:w-fit md:w-fit sm:w-fit bg-destructive`}
        >
          Cancel
        </Button>
        </div>
      </Card>

      <Card className="glass border-primary/20 p-8 card-profile">
        <h3 className="text-lg font-bold mb-6">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-semibold text-sm">Change Password</p>
              <p className="text-xs text-foreground/60">
                Update your password regularly for security
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowChangePassword(true)}
            >
              Change
            </Button>
          </div>
          <div className="flex justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-semibold text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-foreground/60">
                Add an extra layer of security
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                twoFAEnabled ? setShowDisable2FA(true) : start2FA()
              }
            >
              {twoFAEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
          <div className="flex justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-semibold text-sm">Email Preferences</p>
              <p className="text-xs text-foreground/60">
                Manage notification and marketing emails
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEmailPrefs(true)}
            >
              Manage
            </Button>
          </div>
        </div>
      </Card>

      <Card className="glass border-destructive/20 bg-destructive/5 p-8 card-profile">
        <h3 className="text-lg font-bold mb-4 text-destructive">Danger Zone</h3>
        <Button
          variant="outline"
          className="w-full hover:bg-destructive"
          onClick={() => setShowDelete(true)}
        >
          Delete Account Permanently
        </Button>
      </Card>

      {showChangePassword && (
        <ConfirmModal
          title="Change Password"
          message={
            (
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ) as any
          }
          onConfirm={changePassword}
          onCancel={() => setShowChangePassword(false)}
        />
      )}

      {show2FA && (
        <ConfirmModal
          title="Enable Two-Factor Authentication"
          message={
            (
              <div className="space-y-4">
                <img
                  src={qrCode}
                  alt="2FA QR code"
                  className="mx-auto w-40"
                />
                <span className="flex items-center gap-2">
                  <Input readOnly value={manualKey} />
                  <Button onClick={copy2fskey}>
                    {isCopied ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </span>
                <Input
                  placeholder="6-digit OTP"
                  value={otp}
                  type="number"
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            ) as any
          }
          onConfirm={verify2FA}
          onCancel={() => setShow2FA(false)}
        />
      )}

      {showDisable2FA && (
        <ConfirmModal
          title="Disable Two-Factor Authentication"
          message={
            (
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="Account password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            ) as any
          }
          onConfirm={disable2FA}
          onCancel={() => setShowDisable2FA(false)}
        />
      )}

      {showEmailPrefs && (
        <ConfirmModal
          title="Email Preferences"
          message={
            (
              <div className="space-y-4 text-sm text-left">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailPrefs.security}
                    onChange={(e) =>
                      setEmailPrefs((p: any) => ({
                        ...p,
                        security: e.target.checked,
                      }))
                    }
                  />{" "}
                  Security emails
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailPrefs.marketing}
                    onChange={(e) =>
                      setEmailPrefs((p: any) => ({
                        ...p,
                        marketing: e.target.checked,
                      }))
                    }
                  />{" "}
                  Marketing emails
                </label>
              </div>
            ) as any
          }
          onConfirm={async () => {
            await actions.updateEmailPrefsAction(emailPrefs);
            toast.success("Email preferences updated");
            setShowEmailPrefs(false);
          }}
          onCancel={() => setShowEmailPrefs(false)}
        />
      )}

      {showDelete && (
        <ConfirmModal
          title="Delete Account"
          message="This action is permanent."
          onConfirm={deleteAccount}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
