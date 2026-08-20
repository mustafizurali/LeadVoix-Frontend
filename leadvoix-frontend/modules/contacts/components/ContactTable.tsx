"use client";

import { Contact } from "../types/contact.types";
import { useContacts } from "../hooks/useContacts";

interface ContactTableProps {
  search: string;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
}

export default function ContactTable({
  search,
  onEditContact,
  onDeleteContact,
}: ContactTableProps) {
  const {
    data,
    isLoading,
    error,
  } = useContacts({
    search,
  });

  const contacts = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        Loading contacts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-6 text-red-500 shadow-sm">
        Failed to load contacts.
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        No contacts found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-xl font-semibold">
          Contacts
        </h2>

        <span className="text-sm text-slate-500">
            Total: {contacts.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Name
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Email
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Phone
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Company
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Status
              </th>

              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((contact: Contact) => (
              <tr
                key={contact.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="font-medium">
                    {contact.first_name} {contact.last_name ?? ""}
                  </div>
                </td>

                <td className="px-6 py-4">
                  {contact.email ?? "-"}
                </td>

                <td className="px-6 py-4">
                  {contact.phone ?? "-"}
                </td>

                <td className="px-6 py-4">
                  {contact.company ?? "-"}
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    {contact.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEditContact(contact)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white transition hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDeleteContact(contact)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t px-6 py-4">
        <p className="text-sm text-slate-500">
          Page 1 of 1
        </p>

        <p className="text-sm text-slate-500">
          Total Contacts: {contacts.length}
        </p>
      </div>
    </div>
  );
}