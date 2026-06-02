import dbConnect from "@/lib/db";
import { SiteSettings } from "@/models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteSettingsForm } from "./settings-form";

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

async function getSettings(): Promise<Settings> {
  await dbConnect();
  const settings = await SiteSettings.findOne().lean();
  return settings ? JSON.parse(JSON.stringify(settings)) : {};
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

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
            <p className="text-sm text-muted-foreground">
              The hero section settings are included in the main settings form.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
