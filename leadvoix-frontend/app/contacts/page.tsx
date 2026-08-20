"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";

import ContactToolbar from "@/modules/contacts/components/ContactToolbar";
import ContactTable from "@/modules/contacts/components/ContactTable";
import CreateContactModal from "@/modules/contacts/components/CreateContactModal";
import EditContactModal from "@/modules/contacts/components/EditContactModal";

import { deleteContact } from "@/modules/contacts/api/contactApi";
import { Contact } from "@/modules/contacts/types/contact.types";

export default function ContactsPage() {
  const queryClient = useQueryClient();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedContact, setSelectedContact] =
    useState<Contact | null>(null);

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedContact(null);
  };

  const handleDeleteContact = async (
    contact: Contact
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${contact.first_name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteContact(contact.id);

      await queryClient.invalidateQueries({
        queryKey: ["contacts"],
      });

      alert("Contact deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete contact.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Contacts
          </h1>

          <p className="mt-2 text-slate-500">
            Manage all your contacts.
          </p>
        </div>

        <ContactToolbar
          search={search}
          onSearchChange={setSearch}
          onCreateContact={() => setOpenCreate(true)}
        />

        <ContactTable
          search={search}
          onEditContact={handleEditContact}
          onDeleteContact={handleDeleteContact}
        />
      </div>

      <CreateContactModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />

      <EditContactModal
        open={openEdit}
        onClose={handleCloseEdit}
        contact={selectedContact}
      />
    </DashboardLayout>
  );
}