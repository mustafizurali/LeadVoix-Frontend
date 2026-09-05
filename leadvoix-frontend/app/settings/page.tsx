"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import { tokenStorage } from "@/lib/api/tokenStorage";

const EMAIL_NOTIFICATIONS_KEY =
  "leadvoix_email_notifications";

const TASK_REMINDERS_KEY =
  "leadvoix_task_reminders";

const THEME_KEY =
  "leadvoix_theme";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [taskReminders, setTaskReminders] =
    useState(true);

  const [theme, setTheme] =
    useState("system");

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    const savedEmailNotifications =
      localStorage.getItem(
        EMAIL_NOTIFICATIONS_KEY
      );

    const savedTaskReminders =
      localStorage.getItem(
        TASK_REMINDERS_KEY
      );

    const savedTheme =
      localStorage.getItem(THEME_KEY);

    if (savedEmailNotifications !== null) {
      setEmailNotifications(
        savedEmailNotifications === "true"
      );
    }

    if (savedTaskReminders !== null) {
      setTaskReminders(
        savedTaskReminders === "true"
      );
    }

    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      EMAIL_NOTIFICATIONS_KEY,
      String(emailNotifications)
    );

    localStorage.setItem(
      TASK_REMINDERS_KEY,
      String(taskReminders)
    );

    localStorage.setItem(
      THEME_KEY,
      theme
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleLogout = () => {
    tokenStorage.removeToken();

    window.location.href = "/login";
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Settings
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your application preferences.
          </p>
        </div>

        {/* Preferences */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Preferences
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Control how LeadVoix OS keeps you informed.
            </p>
          </div>

          <div className="space-y-5">
            {/* Email Notifications */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-900">
                  Email Notifications
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Receive important CRM notifications by email.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEmailNotifications(
                    (current) => !current
                  )
                }
                aria-pressed={emailNotifications}
                className={`relative h-6 w-11 rounded-full transition ${
                  emailNotifications
                    ? "bg-blue-600"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    emailNotifications
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Task Reminders */}
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
              <div>
                <h3 className="font-medium text-slate-900">
                  Task Reminders
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enable reminders for upcoming tasks.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setTaskReminders(
                    (current) => !current
                  )
                }
                aria-pressed={taskReminders}
                className={`relative h-6 w-11 rounded-full transition ${
                  taskReminders
                    ? "bg-blue-600"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    taskReminders
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Appearance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose your preferred application theme.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Theme
            </label>

            <select
              value={theme}
              onChange={(event) =>
                setTheme(event.target.value)
              }
              className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="system">
                System
              </option>

              <option value="light">
                Light
              </option>

              <option value="dark">
                Dark
              </option>
            </select>

            <p className="mt-2 text-xs text-slate-500">
              Theme preference is saved locally in this beta version.
            </p>
          </div>
        </section>

        {/* Account */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Account
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your current session.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white hover:bg-red-700"
          >
            Logout
          </button>
        </section>

        {/* Save */}
        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="text-sm font-medium text-green-600">
              Settings saved successfully.
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}