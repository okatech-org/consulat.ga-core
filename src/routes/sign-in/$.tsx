import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, Loader2, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IDNSignInButton } from "@/components/auth/IDNSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/sign-in/$")({
	component: SignInPage,
});

type SignInStep = "email" | "password" | "otp-code";

function SignInPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [step, setStep] = useState<SignInStep>("email");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [otpCode, setOtpCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [otpSent, setOtpSent] = useState(false);
	const otpInputRef = useRef<HTMLInputElement>(null);

	// Auto-focus OTP input when step changes
	useEffect(() => {
		if (step === "otp-code" && otpInputRef.current) {
			otpInputRef.current.focus();
		}
	}, [step]);

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
				setStep("otp-code");
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
			} else {
				navigate({ to: "/post-login-redirect" });
			}
		} catch {
			setError(t("errors.auth.otp.invalidCode"));
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const result = await authClient.signIn.email({
				email,
				password,
			});

			if (result.error) {
				setError(result.error.message || t("errors.auth.signInFailed"));
			} else {
				navigate({ to: "/post-login-redirect" });
			}
		} catch {
			setError(t("errors.auth.signInFailed"));
		} finally {
			setLoading(false);
		}
	};

	const handleBack = () => {
		setStep("email");
		setError(null);
		setOtpCode("");
		setPassword("");
		setOtpSent(false);
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
			{/* Background Image with Gradient Overlay */}
			<div className="absolute inset-0 z-0">
				<img
					src="/hero-background.png"
					alt="Gabon cityscape"
					className="h-full w-full object-cover opacity-50"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
				<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
			</div>

			<div className="relative z-10 w-full max-w-md px-4">
				<div className="mb-8 text-center space-y-2">
					<h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
						{t("errors.auth.welcomeBack")}
					</h1>
					<p className="text-white/80 text-lg">
						{t("errors.auth.accessAccount")}
					</p>
				</div>

				<div className="w-full">
					<div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-xl w-full mx-auto p-6 space-y-4">
						{error && (
							<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{error}
							</div>
						)}

						{/* Step 1: Email */}
						{step === "email" && (
							<>
								<div className="space-y-2">
									<Label
										htmlFor="sign-in-email"
										className="text-foreground font-medium"
									>
										{t("common.email")}
									</Label>
									<Input
										id="sign-in-email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="email@example.com"
										required
										autoComplete="email"
										className="border-border focus:ring-2 focus:ring-primary/20"
										onKeyDown={(e) => {
											if (e.key === "Enter" && email) {
												e.preventDefault();
												handleSendOtp();
											}
										}}
									/>
								</div>

								{/* Primary: OTP sign-in */}
								<Button
									type="button"
									className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
									disabled={loading || !email}
									onClick={handleSendOtp}
								>
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									<Mail className="mr-2 h-4 w-4" />
									{t("errors.auth.otp.sendCode")}
								</Button>

								{/* Separator */}
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

								{/* Secondary: Password sign-in */}
								<Button
									type="button"
									variant="outline"
									className="w-full"
									disabled={!email}
									onClick={() => {
										if (email) setStep("password");
									}}
								>
									<KeyRound className="mr-2 h-4 w-4" />
									{t("errors.auth.otp.signInWithPassword")}
								</Button>

								<IDNSignInButton />

								<div className="text-center text-sm text-muted-foreground">
									{t("errors.auth.noAccount")}{" "}
									<a
										href="/sign-up"
										className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline"
									>
										{t("errors.auth.createAccount")}
									</a>
								</div>
							</>
						)}

						{/* Step 2a: Password */}
						{step === "password" && (
							<form onSubmit={handlePasswordSignIn} className="space-y-4">
								<button
									type="button"
									onClick={handleBack}
									className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									<ArrowLeft className="mr-1 h-4 w-4" />
									{email}
								</button>

								<div className="space-y-2">
									<Label
										htmlFor="sign-in-password"
										className="text-foreground font-medium"
									>
										{t("common.password")}
									</Label>
									<Input
										id="sign-in-password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										autoComplete="current-password"
										autoFocus
										className="border-border focus:ring-2 focus:ring-primary/20"
									/>
								</div>

								<Button
									type="submit"
									className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
									disabled={loading}
								>
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{t("header.nav.signIn")}
								</Button>
							</form>
						)}

						{/* Step 2b: OTP Code */}
						{step === "otp-code" && (
							<form onSubmit={handleVerifyOtp} className="space-y-4">
								<button
									type="button"
									onClick={handleBack}
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
										htmlFor="sign-in-otp"
										className="text-foreground font-medium"
									>
										{t("errors.auth.otp.codeLabel")}
									</Label>
									<Input
										ref={otpInputRef}
										id="sign-in-otp"
										type="text"
										inputMode="numeric"
										pattern="[0-9]*"
										maxLength={6}
										value={otpCode}
										onChange={(e) =>
											setOtpCode(e.target.value.replace(/\D/g, ""))
										}
										placeholder="000000"
										required
										autoComplete="one-time-code"
										className="border-border focus:ring-2 focus:ring-primary/20 text-center text-2xl tracking-[0.5em] font-mono"
									/>
								</div>

								<Button
									type="submit"
									className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
									disabled={loading || otpCode.length !== 6}
								>
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{t("header.nav.signIn")}
								</Button>

								<button
									type="button"
									onClick={handleSendOtp}
									disabled={loading}
									className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
								>
									{t("errors.auth.otp.resendCode")}
								</button>
							</form>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="mt-8 text-center text-sm text-muted-foreground/60">
					<p>
						&copy; {new Date().getFullYear()} Consulat.ga - République Gabonaise
					</p>
				</div>
			</div>
		</div>
	);
}
