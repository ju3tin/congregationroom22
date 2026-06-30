import Link from "next/link";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSlideshows, deleteSlideshow } from "@/app/actions/slideshows";

export default async function AdminSlideshowsPage() {
  const slideshows = await getSlideshows();

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Slideshows</h1>
          <p className="text-muted-foreground">Manage your presentation slideshows</p>
        </div>
        <Button asChild>
          <Link href="/admin/slideshows/new">
            <Plus className="mr-2 h-4 w-4" />
            New Slideshow
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {slideshows.length > 0 ? (
          slideshows.map((show: any) => (
            <Card key={show._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{show.title}</h3>
                    {show.featured && <Badge>Featured</Badge>}
                    {show.isPublic ? (
                      <Badge variant="outline">Public</Badge>
                    ) : (
                      <Badge variant="secondary">Private</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">{show.description}</p>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {show.slides.length} slides • {show.theme} theme
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/slideshows/${show.slug}`} target="_blank">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/slideshows/${show._id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>

                  <form action={async () => {
                    "use server";
                    await deleteSlideshow(show._id);
                  }}>
                    <Button 
                      type="submit" 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => {
                        if (!confirm("Delete this slideshow?")) e.preventDefault();
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No slideshows yet.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/slideshows/new">Create your first slideshow</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
