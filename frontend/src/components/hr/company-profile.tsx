"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/authClient";
import { api } from "@/lib/api";

type Company = {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  address?: string;
  logo?: string; // base64 or data URL
};

const STORAGE_KEY = "hr_company_profile";

function validateEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export default function CompanyProfile() {
  const [company, setCompany] = useState<Company>({});
  const [editing, setEditing] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getAuthToken();
      if (!token) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Company;
            setCompany(parsed);
            if (parsed.name || parsed.email) setEditing(false);
          }
        } catch {
          // ignore
        }
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get("/api/v1/companies/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const body = response.data?.data ?? response.data;
        if (body && (body.name || body.email)) {
          setCompany({
            name: body.name,
            email: body.email,
            phone: body.phone,
            website: body.websiteUrl ?? body.website,
            description: body.description,
            address: body.address,
            logo: body.logo ?? body.logoUrl,
          });
          setEditing(false);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            name: body.name,
            email: body.email,
            phone: body.phone,
            website: body.websiteUrl ?? body.website,
            description: body.description,
            address: body.address,
            logo: body.logo ?? body.logoUrl,
          }));
        } else {
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw) as Company;
              setCompany(parsed);
              if (parsed.name || parsed.email) setEditing(false);
            }
          } catch {
            // ignore
          }
        }
      } catch {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Company;
            setCompany(parsed);
            if (parsed.name || parsed.email) setEditing(false);
          }
        } catch {
          // ignore
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field: keyof Company, value: string) => {
    setCompany((c) => ({ ...c, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleLogo = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleChange("logo", String(reader.result ?? ""));
    };
    setFileName(file.name);
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!company.name || company.name.trim().length < 2) e.name = "Company name is required";
    if (!company.email || !validateEmail(company.email)) e.email = "Valid company email is required";
    if (!company.phone || company.phone.trim().length < 6) e.phone = "Valid phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const token = getAuthToken();
    const payload = {
      name: company.name?.trim(),
      email: company.email?.trim(),
      phone: company.phone?.trim(),
      website: company.website?.trim(),
      description: company.description?.trim(),
      address: company.address?.trim(),
      logo: company.logo,
    };

    try {
      setIsLoading(true);
      setStatusMessage(null);

      if (token) {
        const response = await api.post("/api/v1/companies/profile", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const body = response.data?.data ?? response.data;
        if (body) {
          setCompany({
            name: body.name,
            email: body.email,
            phone: body.phone,
            website: body.websiteUrl ?? body.website,
            description: body.description,
            address: body.address,
            logo: body.logo ?? body.logoUrl,
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
          setEditing(false);
          setStatusMessage("Company information saved successfully.");
          return;
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setEditing(false);
      setStatusMessage("Company information saved locally.");
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setStatusMessage("Saved locally because the server was unavailable.");
      setEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setStatusMessage(null);
  };

  if (!editing && company && (company.name || company.email)) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{company.name}</h2>
            {company.website ? (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-sky-600 hover:underline"
              >
                {company.website}
              </a>
            ) : null}
          </div>

          <div>
            {company.logo ? (
              <img src={company.logo} alt="logo" className="h-24 w-24 rounded-md object-cover" />
            ) : (
              <div className="h-24 w-24 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">No Image</div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm text-slate-800">{company.email}</p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <p className="text-xs text-slate-500">Address</p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{company.address}</p>

            <p className="mt-3 text-xs text-slate-500">Phone</p>
            <p className="text-sm text-slate-800">{company.phone}</p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <p className="text-xs text-slate-500">Description</p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{company.description}</p>
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={handleEdit}>Edit</Button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm text-slate-600">Company Name</label>
          <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={company.name ?? ""} onChange={(e) => handleChange("name", e.target.value)} />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className="text-sm text-slate-600">Company Email</label>
          <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={company.email ?? ""} onChange={(e) => handleChange("email", e.target.value)} />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label className="text-sm text-slate-600">Company Phone</label>
          <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={company.phone ?? ""} onChange={(e) => handleChange("phone", e.target.value)} />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm text-slate-600">Company Website</label>
          <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={company.website ?? ""} onChange={(e) => handleChange("website", e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-600">Upload Company Logo</label>
          <div className="mt-2 flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogo(f); }} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">Choose file</button>
            <span className="text-sm text-slate-600">{fileName || "No file chosen"}</span>
            {company.logo && <img src={company.logo} alt="logo" className="h-12 w-12 rounded-md object-cover" />}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm text-slate-600">Company Description</label>
        <textarea className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={company.description ?? ""} onChange={(e) => handleChange("description", e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-slate-600">Company Address</label>
        <textarea className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={company.address ?? ""} onChange={(e) => handleChange("address", e.target.value)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
        <Button variant="ghost" onClick={() => { localStorage.removeItem(STORAGE_KEY); setCompany({}); setFileName(""); setStatusMessage(null); }}>Clear</Button>
      </div>

      {statusMessage ? <p className="text-sm text-slate-600">{statusMessage}</p> : null}
    </form>
  );
}
