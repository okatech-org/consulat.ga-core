/**
 * InlineAuth — Embedded sign-in / sign-up form for registration wizards.
 *
 * Replaces the old Clerk <SignUp>/<SignIn> embeds so users never leave the
 * multi-step registration flow.  When authentication succeeds the parent's
 * useConvexAuth() will flip isAuthenticated → true and the wizard auto-advances.
 *
 * Supports both email+password and email OTP (code by email) sign-in.
 */

import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IDNSignInButton } from "@/components/auth/IDNSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-up" | "sign-in";
type SignInStep = "form" | "otp-code";

interface InlineAuthProps {
	/** Which form to show first */
	defaultMode?: AuthMode;
}

export function InlineAuth({ defaultMode = "sign-up" }: InlineAuthProps) {
	const { t } = useTranslation();
	const [mode, setMode] = useState<AuthMode>(defaultMode);
	const [signInStep, setSignInStep] = useState<SignInStep>("form");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [otpCode, setOtpCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [otpSent, setOtpSent] = useState(false);
	const otpInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (signInStep === "otp-code" && otpInputRef.current) {
			otpInputRef.current.focus();
		}
	}, [signInStep]);

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			if (mode === "sign-up") {
				const result = await authClient.signUp.email({
					email,
					password,
					name,
				});
				if (result.error) {
					setError(result.error.message || t("errors.auth.signUpFailed"));
				}
			} else {
				const result = await authClient.signIn.email({
					email,
					password,
				});
				if (result.error) {
					setError(result.error.message || t("errors.auth.signInFailed"));
				}
			}
		} catch {
			setError(
				mode === "sign-up"
					? t("errors.auth.signUpFailed")
					: t("errors.auth.signInFailed"),
			);
		} finally {
			setLoading(false);
		}
	};

	const handleSendOtp = async () => {
		if (!email) return;
		setError(null);
		setLoading(true);

		try {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
			});
			if (result.error) {
				setError(result.error.message || t("errors.auth.otp.sendFailed"));
			} else {
				setOtpSent(true);
				setSignInStep("otp-code");
			}
		} catch {
			setError(t("errors.auth.otp.sendFailed"));
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!otpCode || !email) return;
		setError(null);
		setLoading(true);

		try {
			const result = await authClient.signIn.emailOtp({
				email,
				otp: otpCode,
			});
			if (result.error) {
				setError(result.error.message || t("errors.auth.otp.invalidCode"));
			}
		} catch {
			setError(t("errors.auth.otp.invalidCode"));
		} finally {
			setLoading(false);
		}
	};

	const toggleMode = () => {
		setMode(mode === "sign-up" ? "sign-in" : "sign-up");
		setError(null);
		setSignInStep("form");
		setOtpSent(false);
		setOtpCode("");
	};

	// OTP code input step
	if (mode === "sign-in" && signInStep === "otp-code") {
		return (
			<div className="w-full max-w-md mx-auto">
				<form
					onSubmit={handleVerifyOtp}
					className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm p-6 space-y-4"
				>
					{error && (
						<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{error}
						</div>
					)}

					<button
						type="button"
						onClick={() => {
							setSignInStep("form");
							setOtpSent(false);
							setOtpCode("");
							setError(null);
						}}
						className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="mr-1 h-4 w-4" />
						{email}
					</button>

					{otpSent && (
						<div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm text-foreground">
							<Mail className="inline mr-1.5 h-4 w-4 text-primary" />
							{t("errors.auth.otp.codeSent")} <strong>{email}</strong>
						</div>
					)}

					<div className="space-y-2">
						<Label
							htmlFor="inline-auth-otp"
							className="text-foreground font-medium"
						>
							{t("errors.auth.otp.codeLabel")}
						</Label>
						<Input
							ref={otpInputRef}
							id="inline-auth-otp"
							type="text"
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={6}
							value={otpCode}
							onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
							placeholder="000000"
							required
							autoComplete="one-time-code"
							className="text-center text-2xl tracking-[0.5em] font-mono"
						/>
					</div>

					<Button
						type="submit"
						className="w-full bg-[#009639] hover:bg-[#007a2f] text-white font-medium"
						disabled={loading || otpCode.length !== 6}
					>
						{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{t("header.nav.signIn")}
					</Button>

					<button
						type="button"
						onClick={handleSendOtp}
						disabled={loading}
						className="w-full text-center text-sm text-muted-foreground hover:text-[#009639] transition-colors disabled:opacity-50"
					>
						{t("errors.auth.otp.resendCode")}
					</button>
				</form>
			</div>
		);
	}

	// Default form (sign-up with name/email/password, or sign-in with email/password)
	return (
		<div className="w-full max-w-md mx-auto">
			<form
				onSubmit={handlePasswordSubmit}
				className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm p-6 space-y-4"
			>
				{error && (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{error}
					</div>
				)}

				{/* Name field — sign-up only */}
				{mode === "sign-up" && (
					<div className="space-y-2">
						<Label
							htmlFor="inline-auth-name"
							className="text-foreground font-medium"
						>
							{t("common.name")}
						</Label>
						<Input
							id="inline-auth-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t(
								"register.inline.namePlaceholder",
								"Prénom et Nom",
							)}
							required
							autoComplete="name"
						/>
					</div>
				)}

				{/* Email */}
				<div className="space-y-2">
					<Label
						htmlFor="inline-auth-email"
						className="text-foreground font-medium"
					>
						{t("common.email")}
					</Label>
					<Input
						id="inline-auth-email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="email@example.com"
						required
						autoComplete="email"
					/>
				</div>

				{/* Password */}
				<div className="space-y-2">
					<Label
						htmlFor="inline-auth-password"
						className="text-foreground font-medium"
					>
						{t("common.password")}
					</Label>
					<Input
						id="inline-auth-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						autoComplete={
							mode === "sign-up" ? "new-password" : "current-password"
						}
					/>
				</div>

				{/* Submit */}
				<Button
					type="submit"
					className="w-full bg-[#009639] hover:bg-[#007a2f] text-white font-medium"
					disabled={loading}
				>
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{mode === "sign-up"
						? t("errors.auth.createAccount")
						: t("header.nav.signIn")}
				</Button>

				{/* OTP sign-in option — sign-in mode only */}
				{mode === "sign-in" && (
					<>
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border/50" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card/80 px-2 text-muted-foreground">
									{t("errors.auth.orDivider")}
								</span>
							</div>
						</div>

						<Button
							type="button"
							variant="outline"
							className="w-full"
							disabled={!email || loading}
							onClick={handleSendOtp}
						>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							<Mail className="mr-2 h-4 w-4" />
							{t("errors.auth.otp.sendCode")}
						</Button>
					</>
				)}

				<IDNSignInButton
					callbackURL={window.location.pathname + window.location.search}
				/>

				{/* Toggle mode */}
				<div className="text-center text-sm text-muted-foreground">
					{mode === "sign-up"
						? t("errors.auth.alreadyHaveAccount")
						: t("errors.auth.noAccount")}{" "}
					<button
						type="button"
						onClick={toggleMode}
						className="text-[#009639] hover:text-[#007a2f] font-medium underline-offset-4 hover:underline"
					>
						{mode === "sign-up"
							? t("header.nav.signIn")
							: t("errors.auth.createAccount")}
					</button>
				</div>
			</form>
		</div>
	);
}
