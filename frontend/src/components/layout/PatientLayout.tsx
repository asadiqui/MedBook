import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentUser, type CurrentUser } from "../../api/auth.api";
import { clearTokens, getAccessToken } from "../../utils/authStorage";

function Icon({ name, className = "" }: { name: string; className?: string }) {
	const common = `h-5 w-5 ${className}`;
	switch (name) {
		case "dashboard":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-11h7V4h-7v5Z"
						fill="currentColor"
					/>
				</svg>
			);
		case "find-doctor":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M10 4a6 6 0 1 0 3.75 10.68l4.79 4.79a1 1 0 0 0 1.42-1.42l-4.79-4.79A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
						fill="currentColor"
					/>
				</svg>
			);
		case "appointments":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v14A2.5 2.5 0 0 1 19.5 23h-15A2.5 2.5 0 0 1 2 20.5v-14A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm13 8H4v10.5c0 .276.224.5.5.5h15a.5.5 0 0 0 .5-.5V10Z"
						fill="currentColor"
					/>
					<path
						d="M12 12a1 1 0 0 1 1 1v2.586l1.293 1.293a1 1 0 1 1-1.414 1.414l-1.586-1.586A1 1 0 0 1 11 16v-3a1 1 0 0 1 1-1Z"
						fill="currentColor"
					/>
				</svg>
			);
		case "messages":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v10h1.5H6v1.385L7.846 16H20V6H4Z"
						fill="currentColor"
					/>
				</svg>
			);
		case "prescriptions":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M6 2h9a4 4 0 0 1 0 8H8v12H6V2Zm2 2v4h7a2 2 0 0 0 0-4H8Z"
						fill="currentColor"
					/>
					<path d="M14 13h8v2h-8v-2Zm3-3h2v8h-2V10Z" fill="currentColor" />
				</svg>
			);
		case "settings":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M19.14 12.936c.04-.303.06-.616.06-.936s-.02-.633-.06-.936l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.55 7.55 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.41l-.36 2.54c-.58.23-1.13.54-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.72 7.5a.5.5 0 0 0 .12.64l2.03 1.58c-.04.303-.06.616-.06.936s.02.633.06.936l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.49.4 1.04.71 1.62.94l.36 2.54c.06.24.26.41.49.41h3.8c.24 0 .45-.17.49-.41l.36-2.54c.58-.23 1.13-.54 1.62-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"
						fill="currentColor"
					/>
				</svg>
			);
		default:
			return null;
	}
}

function SidebarLink({
	href,
	label,
	icon,
	active,
}: {
	href: string;
	label: string;
	icon: string;
	active: boolean;
}) {
	return (
		<Link
			href={href}
			className={
				active
					? "flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700"
					: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
			}
		>
			<Icon name={icon} className={active ? "text-blue-700" : "text-gray-500"} />
			{label}
		</Link>
	);
}

export default function PatientLayout({
	children,
	title,
	subtitle,
	headerRight,
}: {
	children: ReactNode;
	title?: string;
	subtitle?: string;
	headerRight?: ReactNode;
}) {
	const router = useRouter();
	const [me, setMe] = useState<CurrentUser | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);

	useEffect(() => {
		const token = getAccessToken();
		setAccessToken(token);
		if (!token) {
			setMe(null);
			return;
		}
		getCurrentUser({ accessToken: token })
			.then((u) => setMe(u))
			.catch(() => setMe(null));
	}, []);

	const displayName = useMemo(() => {
		const first = (me?.firstName || "").trim();
		const last = (me?.lastName || "").trim();
		const full = `${first} ${last}`.trim();
		return full || "Patient";
	}, [me?.firstName, me?.lastName]);

	const onLogout = () => {
		clearTokens();
		window.location.href = "/login";
	};

	const path = router.pathname;
	const active = (href: string) => path === href;

	return (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<div className="flex min-h-screen">
				<aside className="hidden w-72 shrink-0 border-r bg-white md:flex md:flex-col">
					<div className="p-6">
						<div className="flex items-center gap-2 text-lg font-bold">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
								<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
									<path
										d="M12 5v14M5 12h14"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
									/>
								</svg>
							</div>
							<span>Sa7ti</span>
						</div>
					</div>
					<div className="mx-6 border-t" />

					<nav className="px-3 pt-4">
						<ul className="space-y-1.5">
							<li>
								<SidebarLink
									href="/patient/dashboard"
									label="Dashboard"
									icon="dashboard"
									active={active("/patient/dashboard")}
								/>
							</li>
							<li>
								<SidebarLink
									href="/patient/find-doctor"
									label="Find Doctor"
									icon="find-doctor"
									active={active("/patient/find-doctor")}
								/>
							</li>
							<li>
								<SidebarLink
									href="/patient/my-bookings"
									label="My Appointments"
									icon="appointments"
									active={active("/patient/my-bookings")}
								/>
							</li>
							<li>
								<SidebarLink
									href="/patient/messages"
									label="Messages"
									icon="messages"
									active={active("/patient/messages")}
								/>
							</li>
							<li>
								<SidebarLink
									href="/patient/prescriptions"
									label="Prescriptions"
									icon="prescriptions"
									active={active("/patient/prescriptions")}
								/>
							</li>
							<li>
								<SidebarLink
									href="/patient/settings"
									label="Settings"
									icon="settings"
									active={active("/patient/settings")}
								/>
							</li>
						</ul>
					</nav>

					<div className="mt-auto p-4">
						<button
							type="button"
							onClick={onLogout}
							className="flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
						>
							<svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-500" fill="none" aria-hidden="true">
								<path
									d="M10 7V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<path
									d="M15 12H3m0 0 3-3M3 12l3 3"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							Logout
						</button>
					</div>
				</aside>

				<div className="flex min-w-0 flex-1 flex-col">
					<header className="border-b bg-white px-6 py-4">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="min-w-0">
								{title ? <h1 className="text-lg font-semibold">{title}</h1> : null}
								{subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
							</div>

							<div className="flex flex-1 items-center justify-end gap-3">
								{headerRight ? <div className="shrink-0">{headerRight}</div> : null}

								<button
									type="button"
									className="rounded-full border bg-white p-2 text-gray-600 hover:bg-gray-50"
									aria-label="Notifications"
									disabled
								>
									<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
										<path
											d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Zm-2 1H7v-6a5 5 0 1 1 10 0v6Z"
											fill="currentColor"
										/>
									</svg>
								</button>

								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-bold text-blue-700">
										{displayName.slice(0, 1).toUpperCase()}
									</div>
									<div className="hidden md:block">
										<div className="text-sm font-semibold text-gray-900">{displayName}</div>
										<div className="text-xs text-gray-500">PATIENT</div>
									</div>
								</div>
							</div>
						</div>
					</header>

					<main className="flex-1 px-6 py-6">{children}</main>
				</div>
			</div>
		</div>
	);
}
