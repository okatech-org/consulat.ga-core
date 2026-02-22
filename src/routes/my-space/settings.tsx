import { api } from "@convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import {
	Bell,
	Check,
	Globe,
	KeyRound,
	Loader2,
	LogOut,
	Mail,
	Moon,
	Palette,
	Shield,
	User,
} from "lucide-react";

import { motion } from "motion/react";
import { useTheme } from "next-themes";
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
import { type ConsularTheme, useConsularTheme } from "@/hooks/useConsularTheme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-space/settings")({
	component: SettingsPage,
});

/* -------------------------------------------------- */
/*  Theme preview thumbnails                          */
/* -------------------------------------------------- */

function ThemePreview({
	themeId,
	label,
	description,
	isActive,
	onClick,
}: {
	themeId: ConsularTheme;
	label: string;
	description: string;
	isActive: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer w-full text-left",
				isActive
					? "border-primary bg-primary/5 ring-2 ring-primary/20"
					: "border-border hover:border-muted-foreground/30 hover:bg-muted/30",
			)}
		>
			{/* Mini preview card */}
			<div
				className={cn(
					"w-16 h-12 rounded-lg overflow-hidden relative shrink-0",
					themeId === "default"
						? "bg-card border border-border"
						: "bg-[oklch(0.92_0.005_250)]",
				)}
			>
				{themeId === "default" ? (
					<div className="p-1.5 space-y-1">
						<div className="h-1.5 w-5 bg-primary/20 rounded" />
						<div className="h-2.5 bg-muted rounded border border-border" />
						<div className="flex gap-0.5">
							<div className="h-2 flex-1 bg-muted rounded border border-border" />
							<div className="h-2 flex-1 bg-muted rounded border border-border" />
						</div>
					</div>
				) : (
					<div className="p-1.5 space-y-1">
						<div className="h-1.5 w-5 bg-primary/20 rounded" />
						<div
							className="h-2.5 rounded"
							style={{
								background: "oklch(0.92 0.005 250)",
								boxShadow:
									"2px 2px 4px oklch(0.7 0.01 250 / 0.35), -2px -2px 4px oklch(1 0 0 / 0.7)",
							}}
						/>
						<div className="flex gap-0.5">
							<div
								className="h-2 flex-1 rounded"
								style={{
									background: "oklch(0.92 0.005 250)",
									boxShadow:
										"2px 2px 4px oklch(0.7 0.01 250 / 0.35), -2px -2px 4px oklch(1 0 0 / 0.7)",
								}}
							/>
							<div
								className="h-2 flex-1 rounded"
								style={{
									background: "oklch(0.92 0.005 250)",
									boxShadow:
										"2px 2px 4px oklch(0.7 0.01 250 / 0.35), -2px -2px 4px oklch(1 0 0 / 0.7)",
								}}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Label + description */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold">{label}</p>
				<p className="text-xs text-muted-foreground leading-tight truncate">
					{description}
				</p>
			</div>

			{/* Active indicator dot */}
			{isActive && <div className="w-3 h-3 rounded-full bg-primary shrink-0" />}
		</button>
	);
}

/* -------------------------------------------------- */
/*  Settings Page                                     */
/* -------------------------------------------------- */

function SettingsPage() {
	const { t, i18n } = useTranslation();
	const { theme, setTheme } = useTheme();
	const { consularTheme, setConsularTheme } = useConsularTheme();

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

	// ── Convex queries & mutations ──
	const preferences = useQuery(api.functions.userPreferences.getMyPreferences);
	const updatePreferences = useMutation(
		api.functions.userPreferences.updateMyPreferences,
	);

	const handlePrefToggle = (
		key:
			| "emailNotifications"
			| "pushNotifications"
			| "smsNotifications"
			| "shareAnalytics",
		value: boolean,
	) => {
		updatePreferences({ [key]: value });
	};

	const handleLanguageChange = (lang: "fr" | "en") => {
		updatePreferences({ language: lang });
		i18n.changeLanguage(lang);
	};

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
		<div className="space-y-6 p-1">
			{/* Page title */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
			>
				<h1 className="text-2xl font-bold">
					{t("mySpace.screens.settings.heading")}
				</h1>
				<p className="text-muted-foreground text-sm mt-1">
					{t("mySpace.screens.settings.subtitle")}
				</p>
			</motion.div>

			{/* Account Info */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
			>
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
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
			</motion.div>

			{/* Change Password */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.05 }}
			>
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
								<Label htmlFor="current-password">
									{t("settings.security.currentPassword")}
								</Label>
								<Input
									id="current-password"
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
								<Label htmlFor="new-password">
									{t("settings.security.newPassword")}
								</Label>
								<Input
									id="new-password"
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
									autoComplete="new-password"
									minLength={8}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirm-password">
									{t("settings.security.confirmPassword")}
								</Label>
								<Input
									id="confirm-password"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									autoComplete="new-password"
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="revoke-sessions">
										{t("settings.security.revokeOtherSessions")}
									</Label>
									<p className="text-xs text-muted-foreground">
										{t("settings.security.revokeOtherSessionsDesc")}
									</p>
								</div>
								<Switch
									id="revoke-sessions"
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
											disabled={resetLoading || !resetOtp || !resetNewPassword}
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
			</motion.div>

			{/* Notifications Settings */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.1 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bell className="size-5" />
							{t("settings.notifications.title")}
						</CardTitle>
						<CardDescription>
							{t("settings.notifications.description")}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>{t("settings.notifications.email")}</Label>
								<p className="text-sm text-muted-foreground">
									{t("settings.notifications.emailDesc")}
								</p>
							</div>
							<Switch
								checked={preferences?.emailNotifications ?? true}
								onCheckedChange={(checked) =>
									handlePrefToggle("emailNotifications", checked)
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>{t("settings.notifications.push")}</Label>
								<p className="text-sm text-muted-foreground">
									{t("settings.notifications.pushDesc")}
								</p>
							</div>
							<Switch
								checked={preferences?.pushNotifications ?? true}
								onCheckedChange={(checked) =>
									handlePrefToggle("pushNotifications", checked)
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>{t("settings.notifications.sms")}</Label>
								<p className="text-sm text-muted-foreground">
									{t("settings.notifications.smsDesc")}
								</p>
							</div>
							<Switch
								checked={preferences?.smsNotifications ?? false}
								onCheckedChange={(checked) =>
									handlePrefToggle("smsNotifications", checked)
								}
							/>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Display Settings — Dark Mode */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.15 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Moon className="size-5" />
							{t("settings.display.title")}
						</CardTitle>
						<CardDescription>
							{t("settings.display.description")}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>{t("settings.display.darkMode")}</Label>
								<p className="text-sm text-muted-foreground">
									{t("settings.display.darkModeDesc")}
								</p>
							</div>
							<Switch
								checked={theme === "dark"}
								onCheckedChange={(checked) =>
									setTheme(checked ? "dark" : "light")
								}
							/>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Consular Theme Selector */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.2 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Palette className="size-5" />
							{t("settings.consularTheme.title")}
						</CardTitle>
						<CardDescription>
							{t("settings.consularTheme.description")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<ThemePreview
								themeId="default"
								label={t("settings.consularTheme.default")}
								description={t("settings.consularTheme.defaultDesc")}
								isActive={consularTheme === "default"}
								onClick={() => setConsularTheme("default")}
							/>
							<ThemePreview
								themeId="homeomorphism"
								label={t("settings.consularTheme.homeomorphism")}
								description={t("settings.consularTheme.homeomorphismDesc")}
								isActive={consularTheme === "homeomorphism"}
								onClick={() => setConsularTheme("homeomorphism")}
							/>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Language Settings */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.25 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Globe className="size-5" />
							{t("settings.language.title")}
						</CardTitle>
						<CardDescription>
							{t("settings.language.description")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex gap-2">
							<Button
								variant={
									(preferences?.language ?? i18n.language) === "fr"
										? "default"
										: "outline"
								}
								size="sm"
								onClick={() => handleLanguageChange("fr")}
							>
								🇫🇷 {t("nav.language.fr")}
							</Button>
							<Button
								variant={
									(preferences?.language ?? i18n.language) === "en"
										? "default"
										: "outline"
								}
								size="sm"
								onClick={() => handleLanguageChange("en")}
							>
								🇬🇧 {t("nav.language.en")}
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Privacy Settings */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.3 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="size-5" />
							{t("settings.privacy.title")}
						</CardTitle>
						<CardDescription>
							{t("settings.privacy.description")}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>{t("settings.privacy.analytics")}</Label>
								<p className="text-sm text-muted-foreground">
									{t("settings.privacy.analyticsDesc")}
								</p>
							</div>
							<Switch
								checked={preferences?.shareAnalytics ?? true}
								onCheckedChange={(checked) =>
									handlePrefToggle("shareAnalytics", checked)
								}
							/>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Account / Logout */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.35 }}
			>
				<Card className="border-destructive/20">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<LogOut className="size-5" />
							{t("settings.account.title")}
						</CardTitle>
						<CardDescription>
							{t("settings.account.description")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="destructive"
							onClick={() => setShowLogoutDialog(true)}
						>
							<LogOut className="mr-2 size-4" />
							{t("common.logout")}
						</Button>
					</CardContent>
				</Card>
			</motion.div>

			<AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("common.logoutConfirmTitle")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("common.logoutConfirmDescription")}
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
