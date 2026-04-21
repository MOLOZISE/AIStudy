'use client';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Company Community</h1>
        <p className="text-lg text-slate-600 mb-8">
          A safe space for real and anonymous workplace discussions
        </p>
        <div className="space-x-4">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Sign In
          </button>
          <button className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300">
            Sign Up
          </button>
        </div>
      </div>
    </main>
  );
}
