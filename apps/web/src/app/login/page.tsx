import { PageHeader } from "@/components/ui/page-header";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <PageHeader title="Login" description="Dummy login page for initial UI validation." />
      <form className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="user@example.com" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2" type="password" placeholder="********" />
        </div>
        <button className="rounded-lg bg-steel-700 px-4 py-2 text-sm font-medium text-white" type="button">
          Sign in
        </button>
      </form>
    </section>
  );
}