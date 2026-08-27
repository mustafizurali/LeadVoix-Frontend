"use client";

import { FormEvent, useState } from "react";

import { createDeal, updateDeal } from "../api/dealApi";
import { Deal, DealPayload } from "../types/deal.types";
import { usePipelineStages } from "../../pipelines/hooks/usePipelineStages";
import { usePipelines } from "../../pipelines/hooks/usePipelines";
import { useLeads } from "../../leads/hooks/useLeads";
import { useContacts } from "../../contacts/hooks/useContacts";
import { useCompanies } from "../../companies/hooks/useCompanies";

interface DealFormProps {
  deal?: Deal | null;
  onSuccess?: () => void;
}

type DealFormState = {
  title: string;
  amount: string;
  currency: string;
  status: string;
  expected_close_date: string;
  description: string;
  pipeline_id: string;
  stage_id: string;
  lead_id: string;
  contact_id: string;
  company_id: string;
  owner_id: string;
};

const getInitialForm = (deal?: Deal | null): DealFormState => ({
  title: deal?.title ?? "",
  amount: String(deal?.amount ?? 0),
  currency: deal?.currency ?? "USD",
  status: deal?.status ?? "OPEN",
  expected_close_date: deal?.expected_close_date ?? "",
  description: deal?.description ?? "",
  pipeline_id: String(deal?.pipeline_id ?? ""),
  stage_id: String(deal?.stage_id ?? ""),
  lead_id: String(deal?.lead_id ?? ""),
  contact_id: String(deal?.contact_id ?? ""),
  company_id: String(deal?.company_id ?? ""),
  owner_id: String(deal?.owner_id ?? ""),
});

const optionalNumber = (value: string) => {
  if (!value.trim()) {
    return undefined;
  }

  return Number(value);
};

export default function DealForm({ deal, onSuccess }: DealFormProps) {
  const [form, setForm] = useState<DealFormState>(() => getInitialForm(deal));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { data: pipelinesData } = usePipelines();
  const { data: leadsData } = useLeads({
  page: 1,
  limit: 100,
  });
  const { data: contactsData } = useContacts({
  page: 1,
  limit: 100,
  });
  const { data: companiesData } = useCompanies({
  page: 1,
  limit: 100,
  });
  const { data: stagesData } = usePipelineStages(Number(form.pipeline_id));

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "pipeline_id" ? { stage_id: "" } : {}),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Deal title is required.");
      return;
    }

    const payload: DealPayload = {
      title: form.title.trim(),
      amount: Number(form.amount) || 0,
      currency: form.currency.trim().toUpperCase(),
      status: form.status,
      expected_close_date: form.expected_close_date || undefined,
      description: form.description.trim() || undefined,
      pipeline_id: optionalNumber(form.pipeline_id),
      stage_id: optionalNumber(form.stage_id),
      lead_id: optionalNumber(form.lead_id),
      contact_id: optionalNumber(form.contact_id),
      company_id: optionalNumber(form.company_id),
      owner_id: optionalNumber(form.owner_id),
    };

    try {
      setIsSubmitting(true);
      if (deal) {
        await updateDeal(deal.id, payload);
      } else {
        await createDeal(payload);
      }

      setForm(getInitialForm());
      onSuccess?.();
    } catch (requestError) {
      console.error(requestError);
      setError(`Failed to ${deal ? "update" : "create"} deal. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Deal title" name="title" value={form.title} onChange={handleChange} required />
        <Field label="Amount" name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} required />
        <Field label="Currency" name="currency" value={form.currency} onChange={handleChange} required />
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          Status
          <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="OPEN">Open</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
        </label>
        <Field label="Expected close date" name="expected_close_date" type="date" value={form.expected_close_date} onChange={handleChange} />
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          Pipeline
          <select
            name="pipeline_id"
            value={form.pipeline_id}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select pipeline</option>
            {pipelinesData?.items.map((pipeline) => (
              <option key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          Stage
          <select
            name="stage_id"
            value={form.stage_id}
            onChange={handleChange}
            disabled={!form.pipeline_id}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">Select stage</option>
            {stagesData?.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
  Lead
  <select
    name="lead_id"
    value={form.lead_id}
    onChange={handleChange}
    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  >
    <option value="">Select lead</option>

    {leadsData?.items.map((lead) => (
      <option key={lead.id} value={lead.id}>
        {lead.first_name} {lead.last_name ?? ""} 
      </option>
    ))}
   </select>
   </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
  Contact

  <select
    name="contact_id"
    value={form.contact_id}
    onChange={handleChange}
    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  >
    <option value="">Select contact</option>

    {contactsData?.items.map((contact) => (
      <option key={contact.id} value={contact.id}>
        {contact.first_name} {contact.last_name ?? ""}
      </option>
    ))}
  </select>
 </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
  Company
  <select
    name="company_id"
    value={form.company_id}
    onChange={handleChange}
    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  >
    <option value="">Select company</option>
    {companiesData?.items.map((company) => (
      <option key={company.id} value={company.id}>
        {company.name}
      </option>
    ))}
  </select>
</label>
        <Field label="Owner ID" name="owner_id" type="number" min="1" value={form.owner_id} onChange={handleChange} />
      </div>

      <label className="block space-y-1.5 text-sm font-medium text-slate-700">
        Description
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </label>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
        {isSubmitting ? (deal ? "Updating..." : "Creating...") : deal ? "Update Deal" : "Create Deal"}
      </button>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: keyof DealFormState;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  min?: string;
  step?: string;
  required?: boolean;
}

function Field({ label, name, value, onChange, type = "text", min, step, required = false }: FieldProps) {
  return (
    <label className="space-y-1.5 text-sm font-medium text-slate-700">
      {label}
      <input name={name} type={type} min={min} step={step} required={required} value={value} onChange={onChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
    </label>
  );
}
