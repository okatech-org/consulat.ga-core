import { createFileRoute } from "@tanstack/react-router";
import { Check, KeyRound, Loader2, LogOut, Mail, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard/settings/")({
	component: SettingsPage,
});

function SettingsPage() {
	const { t, i18n } = useTranslation();

	const [showLogoutDialog, setShowLogoutDialog] = useState(false);

	// ── Session data ──
	const { data: session } = authClient.useSession();

	// ── Password change state ──
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [passwordSuccess, setPasswordSuccess] = useState(false);

	// ── OTP reset state ──
	const [resetStep, setResetStep] = useState<"idle" | "otp_sent" | "done">(
		"idle",
	);
	const [resetOtp, setResetOtp] = useState("");
	const [resetNewPassword, setResetNewPassword] = useState("");
	const [resetLoading, setResetLoading] = useState(false);
	const [resetError, setResetError] = useState<string | null>(null);
	const [resetSuccess, setResetSuccess] = useState(false);

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setPasswordError(null);
		setPasswordSuccess(false);

		if (newPassword !== confirmPassword) {
			setPasswordError(t("settings.security.passwordMismatch"));
			return;
		}
		if (newPassword.length < 8) {
			setPasswordError(t("settings.security.passwordTooShort"));
			return;
		}

		setPasswordLoading(true);
		try {
			const result = await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions,
			});
			if (result.error) {
				const msg = result.error.message || "";
				if (msg.includes("CREDENTIAL_ACCOUNT_NOT_FOUND")) {
					setPasswordError(t("settings.security.noCredentialAccount"));
				} else {
					setPasswordError(msg || t("settings.security.changeFailed"));
				}
			} else {
				setPasswordSuccess(true);
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
				setTimeout(() => setPasswordSuccess(false), 4000);
			}
		} catch {
			setPasswordError(t("settings.security.changeFailed"));
		} finally {
			setPasswordLoading(false);
		}
	};

	const handleSendResetOtp = async () => {
		const email = session?.user?.email;
		if (!email) return;
		setResetError(null);
		setResetLoading(true);
		try {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "forget-password",
			});
			if (result.error) {
				setResetError(
					result.error.message || t("settings.security.changeFailed"),
				);
			} else {
				setResetStep("otp_sent");
			}
		} catch {
			setResetError(t("settings.security.changeFailed"));
		} finally {
			setResetLoading(false);
		}
	};

	const handleResetWithOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		const email = session?.user?.email;
		if (!email) return;
		if (resetNewPassword.length < 8) {
			setResetError(t("settings.security.passwordTooShort"));
			return;
		}
		setResetError(null);
		setResetLoading(true);
		try {
			const result = await authClient.emailOtp.resetPassword({
				email,
				otp: resetOtp,
				password: resetNewPassword,
			});
			if (result.error) {
				setResetError(
					result.error.message || t("settings.security.changeFailed"),
				);
			} else {
				setResetSuccess(true);
				setResetStep("done");
				setResetOtp("");
				setResetNewPassword("");
				setTimeout(() => {
					setResetSuccess(false);
					setResetStep("idle");
				}, 4000);
			}
		} catch {
			setResetError(t("settings.security.changeFailed"));
		} finally {
			setResetLoading(false);
		}
	};

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{t("superadmin.settings.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("superadmin.settings.description")}
					</p>
				</div>
			</div>

			<Tabs defaultValue="general" className="space-y-4">
				<TabsList>
					<TabsTrigger value="general">
						{t("superadmin.settings.tabs.general")}
					</TabsTrigger>
					<TabsTrigger value="notifications">
						{t("superadmin.settings.tabs.notifications")}
					</TabsTrigger>
					<TabsTrigger value="security">
						{t("superadmin.settings.tabs.security")}
					</TabsTrigger>
				</TabsList>
				<TabsContent value="general" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>{t("superadmin.settings.general.title")}</CardTitle>
							<CardDescription>
								{t("superadmin.settings.general.description")}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-2">
								<Label htmlFor="siteName">Site Name</Label>
								<Input id="siteName" defaultValue="Consulat.ga" />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="adminEmail">Admin Email</Label>
								<Input
									id="adminEmail"
									type="email"
									defaultValue="admin@consulat.ga"
								/>
							</div>
							<Button>{t("superadmin.common.save")}</Button>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="notifications">
					<Card>
						<CardHeader>
							<CardTitle>
								{t("superadmin.settings.notifications.title")}
							</CardTitle>
							<CardDescription>
								{t("superadmin.settings.notifications.description")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{t("superadmin.common.comingSoon")}
							</p>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="security" className="space-y-4">
					{/* Account Info */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="size-5" />
								{t("settings.security.accountInfo")}
							</CardTitle>
							<CardDescription>
								{t("settings.security.accountInfoDesc")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
										{t("common.name")}
									</p>
									<p className="text-sm font-medium">
										{session?.user?.name || "—"}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
										{t("common.email")}
									</p>
									<p className="text-sm font-medium">
										{session?.user?.email || "—"}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
										{t("settings.security.memberSince")}
									</p>
									<p className="text-sm font-medium">
										{session?.user?.createdAt
											? new Date(session.user.createdAt).toLocaleDateString(
													i18n.language,
													{
														year: "numeric",
														month: "long",
														day: "numeric",
													},
												)
											: "—"}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Change Password */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<KeyRound className="size-5" />
								{t("settings.security.changePassword")}
							</CardTitle>
							<CardDescription>
								{t("settings.security.changePasswordDesc")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleChangePassword}
								className="space-y-4 max-w-md"
							>
								{passwordError && (
									<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
										{passwordError}
									</div>
								)}
								{passwordSuccess && (
									<div className="rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-sm text-primary flex items-center gap-2">
										<Check className="size-4" />
										{t("settings.security.changeSuccess")}
									</div>
								)}

								<div className="space-y-2">
									<Label htmlFor="dash-current-password">
										{t("settings.security.currentPassword")}
									</Label>
									<Input
										id="dash-current-password"
										type="password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										autoComplete="current-password"
										placeholder={t(
											"settings.security.currentPasswordPlaceholder",
										)}
									/>
									<p className="text-xs text-muted-foreground">
										{t("settings.security.currentPasswordHint")}
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="dash-new-password">
										{t("settings.security.newPassword")}
									</Label>
									<Input
										id="dash-new-password"
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
										autoComplete="new-password"
										minLength={8}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="dash-confirm-password">
										{t("settings.security.confirmPassword")}
									</Label>
									<Input
										id="dash-confirm-password"
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										autoComplete="new-password"
									/>
								</div>

								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="dash-revoke-sessions">
											{t("settings.security.revokeOtherSessions")}
										</Label>
										<p className="text-xs text-muted-foreground">
											{t("settings.security.revokeOtherSessionsDesc")}
										</p>
									</div>
									<Switch
										id="dash-revoke-sessions"
										checked={revokeOtherSessions}
										onCheckedChange={setRevokeOtherSessions}
									/>
								</div>

								<Button
									type="submit"
									disabled={passwordLoading || !newPassword || !confirmPassword}
								>
									{passwordLoading && (
										<Loader2 className="mr-2 size-4 animate-spin" />
									)}
									{t("settings.security.updatePassword")}
								</Button>
							</form>

							{/* Separator + OTP reset alternative */}
							<div className="relative my-6">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-card px-2 text-muted-foreground">
										{t("settings.security.orResetViaEmail")}
									</span>
								</div>
							</div>

							<div className="max-w-md space-y-3">
								{resetError && (
									<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
										{resetError}
									</div>
								)}
								{resetSuccess && (
									<div className="rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-sm text-primary flex items-center gap-2">
										<Check className="size-4" />
										{t("settings.security.resetSuccess")}
									</div>
								)}

								{resetStep === "idle" && (
									<Button
										variant="outline"
										onClick={handleSendResetOtp}
										disabled={resetLoading || !session?.user?.email}
									>
										{resetLoading ? (
											<Loader2 className="mr-2 size-4 animate-spin" />
										) : (
											<Mail className="mr-2 size-4" />
										)}
										{t("settings.security.sendResetCode")}
									</Button>
								)}

								{resetStep === "otp_sent" && (
									<form onSubmit={handleResetWithOtp} className="space-y-3">
										<p className="text-sm text-muted-foreground">
											{t("settings.security.otpSentTo", {
												email: session?.user?.email,
											})}
										</p>
										<div className="space-y-2">
											<Label>{t("settings.security.otpCode")}</Label>
											<Input
												value={resetOtp}
												onChange={(e) => setResetOtp(e.target.value)}
												placeholder="123456"
												required
												autoComplete="one-time-code"
											/>
										</div>
										<div className="space-y-2">
											<Label>{t("settings.security.newPassword")}</Label>
											<Input
												type="password"
												value={resetNewPassword}
												onChange={(e) => setResetNewPassword(e.target.value)}
												required
												minLength={8}
												autoComplete="new-password"
											/>
										</div>
										<div className="flex gap-2">
											<Button
												type="submit"
												disabled={
													resetLoading || !resetOtp || !resetNewPassword
												}
											>
												{resetLoading && (
													<Loader2 className="mr-2 size-4 animate-spin" />
												)}
												{t("settings.security.resetPassword")}
											</Button>
											<Button
												type="button"
												variant="ghost"
												onClick={() => {
													setResetStep("idle");
													setResetError(null);
												}}
											>
												{t("common.cancel")}
											</Button>
										</div>
									</form>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Account / Logout */}
			<Card className="border-destructive/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LogOut className="h-5 w-5" />
						{t("settings.account.title")}
					</CardTitle>
					<CardDescription>{t("settings.account.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="destructive"
						onClick={() => setShowLogoutDialog(true)}
					>
						<LogOut className="mr-2 h-4 w-4" />
						{t("common.logout")}
					</Button>
				</CardContent>
			</Card>

			<AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("common.logoutConfirmTitle")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t(
								"common.logoutConfirmDescription",
								"Vous allez être déconnecté de votre session. Vous devrez vous reconnecter pour accéder à votre espace.",
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => authClient.signOut()}
						>
							{t("common.logout")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
