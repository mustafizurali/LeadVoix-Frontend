"use client";
export default function ActivityFeed() {
  const activities = [
    {
      id: 1,
      title: "New lead added",
      description: "John Doe from Tesla",
      time: "5 minutes ago",
    },
    {
      id: 2,
      title: "Deal moved",
      description: "Amazon Deal → Proposal",
      time: "20 minutes ago",
    },
    {
      id: 3,
      title: "Task completed",
      description: "Follow up with Google",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold">
          Recent Activity
        </h2>
      </div>

      <div className="divide-y">
        {activities.map((activity) => (
          <div key={activity.id} className="p-5">
            <h3 className="font-semibold">
              {activity.title}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {activity.description}
            </p>

            <span className="text-xs text-slate-400">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}