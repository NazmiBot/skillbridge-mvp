import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <Link href="/" className="text-lg font-bold tracking-tight">
          <span className="text-white">Skill</span>
          <span className="text-blue-400">Bridge</span>
        </Link>
        <p className="text-sm text-zinc-500">
          Career blueprints, engineered.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-600">
          <Link href="/privacy" className="transition hover:text-zinc-400">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-zinc-400">
            Terms of Service
          </Link>
          <a href="mailto:support@tryskillbridge.com" className="transition hover:text-zinc-400">
            Contact
          </a>
        </div>
        <p className="text-xs text-zinc-700">
          © {new Date().getFullYear()} SkillBridge. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
