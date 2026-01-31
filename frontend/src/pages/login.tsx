import { useRouter } from "next/router";
import { useState } from "react";
import { login } from "../api/auth.api";
import { setTokens } from "../utils/authStorage";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [twoFactorCode, setTwoFactorCode] = useState<string>("");
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setError(null);
			setSubmitting(true);
			const res = await login({
				email: email.trim(),
				password,
				twoFactorCode: twoFactorCode.trim() || undefined,
			});
			setTokens({ accessToken: res.tokens.accessToken, refreshToken: res.tokens.refreshToken });

			const role = (res.user?.role || "").toUpperCase();
			if (role === "DOCTOR") {
				await router.replace("/doctor/dashboard");
				return;
			}
			await router.replace("/patient/dashboard");
		} catch (err: any) {
			setError(err?.message || "Login failed");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
				<div className="rounded-2xl border bg-white p-6 shadow-sm">
					<div className="text-center">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
							M
						</div>
						<h1 className="mt-4 text-2xl font-semibold">Sign in</h1>
						<p className="mt-1 text-sm text-gray-600">Use your email and password.</p>
					</div>

					{error && (
						<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
							<p className="text-sm font-medium text-red-700">{error}</p>
						</div>
					)}

					<form onSubmit={onSubmit} className="mt-6 space-y-4">
						<div>
							<label className="text-sm font-medium text-gray-700">Email</label>
							<input
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
								placeholder="you@example.com"
							/>
						</div>

						<div>
							<label className="text-sm font-medium text-gray-700">Password</label>
							<input
								type="password"
								autoComplete="current-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
								placeholder="••••••••"
							/>
						</div>

						<div>
							<label className="text-sm font-medium text-gray-700">2FA Code (optional)</label>
							<input
								type="text"
								inputMode="numeric"
								value={twoFactorCode}
								onChange={(e) => setTwoFactorCode(e.target.value)}
								className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
								placeholder="123456"
							/>
						</div>

						<button
							type="submit"
							disabled={submitting}
							className={
								submitting
									? "w-full rounded-xl bg-blue-300 px-4 py-2 text-sm font-semibold text-white"
									: "w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
							}
						>
							{submitting ? "Signing in…" : "Sign in"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
