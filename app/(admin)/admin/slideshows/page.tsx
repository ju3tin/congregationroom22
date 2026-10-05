import Link from "next/link";

import { Plus, Edit, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  getSlideshows,
  deleteSlideshow,
} from "@/app/actions/slideshows";

import DeleteSlideshowButton from "@/components/DeleteSlideshowButton";

export default async function AdminSlideshowsPage() {
  const slideshows = await getSlideshows();

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Slideshows
          </h1>

          <p className="text-muted-foreground">
            Manage your presentation slideshows
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/slideshows/new">
            <Plus className="mr-2 h-4 w-4" />
            New Slideshow
          </Link>
        </Button>
      </div>

      {/* Slideshows */}
      <div className="grid gap-6">
        {slideshows.length > 0 ? (
          slideshows.map((show: any) => (
            <Card
              key={show._id}
              className="p-6"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Information */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold">
                      {show.title}
                    </h3>

                    {show.featured && (
                      <Badge>
                        Featured
                      </Badge>
                    )}

                    {show.isPublic ? (
                      <Badge variant="outline">
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Private
                      </Badge>
                    )}
                  </div>

                  {show.description && (
                    <p className="text-muted-foreground mt-1">
                      {show.description}
                    </p>
                  )}

                  <div className="mt-3 text-sm text-muted-foreground">
                    {show.slides?.length || 0} slides •{" "}
                    {show.theme || "Default"} theme
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {/* View */}
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link
                      href={`/slideshows/${show.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>

                  {/* Edit */}
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link
                      href={`/admin/slideshows/${show._id}`}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>

                  {/* Delete */}
                  <DeleteSlideshowButton
                    action={async () => {
                      "use server";

                      await deleteSlideshow(show._id);
                    }}
                  />
                </div>
              </div>
            </Card>
          ))
        ) : (
          /* Empty state */
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No slideshows yet.
            </p>

            <Button
              asChild
              className="mt-4"
            >
              <Link href="/admin/slideshows/new">
                Create your first slideshow
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}