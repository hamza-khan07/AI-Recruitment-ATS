"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/authClient";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Mail, Phone, Globe, Building2, Pencil, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Company = {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  address?: string;
  logo?: string;
  size?: string;
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
            size: body.size,
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
            size: body.size,
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
      size: company.size,
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
            size: body.size,
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
      <div className="space-y-6">
        <Card className="overflow-hidden border-none shadow-sm">
          <CardContent className="relative pt-8 pb-6 px-6 sm:px-10">
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
              <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-xl border-4 border-slate-100 bg-white shadow-md overflow-hidden flex-shrink-0">
                {company.logo ? (
                  <img src={company.logo} alt="Company Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
                    <Building2 className="h-10 w-10 opacity-50" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{company.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1 text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Verified Company Profile</span>
                </div>
              </div>
              <Button onClick={handleEdit} variant="outline" className="gap-2 mt-2">
                <Pencil className="h-4 w-4" /> Edit Profile
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">About Us</h3>
                  <div className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm bg-slate-50 p-5 rounded-xl border border-slate-100">
                    {company.description || "No description provided."}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                  <ul className="space-y-4">
                    {company.email && (
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                        <span className="break-all">{company.email}</span>
                      </li>
                    )}
                    {company.phone && (
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                        <span>{company.phone}</span>
                      </li>
                    )}
                    {company.website && (
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <Globe className="h-5 w-5 text-slate-400 shrink-0" />
                        <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </li>
                    )}
                    {company.address && (
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                        <span>{company.address}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {company.size && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Details</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-slate-700">{company.size} Employees</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm text-slate-600 mb-1 block">Company Website</label>
          <input className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={company.website ?? ""} onChange={(e) => handleChange("website", e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-600 mb-1 block">Company Size</label>
          <Select onValueChange={(val) => handleChange("size", val)} value={company.size || ""}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="501-1000">501-1000 employees</SelectItem>
              <SelectItem value="1000+">1000+ employees</SelectItem>
            </SelectContent>
          </Select>
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
