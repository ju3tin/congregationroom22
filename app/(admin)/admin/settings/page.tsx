"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteSettingsForm } from "./settings-form";
import Editor from "@/components/Editor1";

interface Settings {
  siteName?: string;
  siteDescription?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  contactEmail?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch settings on client side
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          setDescription(data.siteDescription || "");
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Configure your site appearance and content</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic site information</CardDescription>
          </CardHeader>
          <CardContent>
            <SiteSettingsForm settings={settings} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Homepage Hero</CardTitle>
            <CardDescription>Customize the main homepage banner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Editor content={description} onChange={setDescription} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
