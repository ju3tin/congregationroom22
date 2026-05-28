"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Check } from "lucide-react";
import { updateSiteSettings } from "../pages/actions";

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

export function SiteSettingsForm({ settings }: { settings: Settings }) {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateSiteSettings(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="siteName">Site Name</Label>
        <Input
          id="siteName"
          name="siteName"
          defaultValue={settings.siteName || ""}
          placeholder="My Event Platform"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="siteDescription">Site Description</Label>
        <Textarea
          id="siteDescription"
          name="siteDescription"
          defaultValue={settings.siteDescription || ""}
          placeholder="Your premier destination for live events"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="heroTitle">Hero Title</Label>
        <Input
          id="heroTitle"
          name="heroTitle"
          defaultValue={settings.heroTitle || ""}
          placeholder="Experience Live Music"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
        <Textarea
          id="heroSubtitle"
          name="heroSubtitle"
          defaultValue={settings.heroSubtitle || ""}
          placeholder="Discover amazing concerts and events"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          defaultValue={settings.contactEmail || ""}
          placeholder="contact@example.com"
        />
      </div>

      <div className="pt-4 border-t space-y-4">
        <h4 className="font-medium">Social Links</h4>
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter/X</Label>
          <Input
            id="twitter"
            name="twitter"
            defaultValue={settings.socialLinks?.twitter || ""}
            placeholder="https://twitter.com/yourhandle"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            name="instagram"
            defaultValue={settings.socialLinks?.instagram || ""}
            placeholder="https://instagram.com/yourhandle"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            name="facebook"
            defaultValue={settings.socialLinks?.facebook || ""}
            placeholder="https://facebook.com/yourpage"
          />
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading}>
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Settings"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
