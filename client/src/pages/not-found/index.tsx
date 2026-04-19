import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <h1 className="font-editorial text-5xl font-medium text-ink">404</h1>
      <p className="mt-4 text-charcoal">Page not found.</p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-terracotta px-5 py-2.5 text-sm font-medium text-ivory shadow-[0_0_0_1px_#c96442] transition hover:brightness-[0.95]"
      >
        Back home
      </Link>
    </div>
  );
}