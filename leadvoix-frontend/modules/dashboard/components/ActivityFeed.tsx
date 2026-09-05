"use client";

export default function ActivityFeed() {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold">
          Recent Activity
        </h2>
      </div>

      <div className="p-6">
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="font-medium text-slate-700">
            No recent activity
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Recent CRM activity will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}