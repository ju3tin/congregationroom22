import Link from "next/link";
import dbConnect from "@/lib/db";
import { Page } from "@/models";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye } from "lucide-react";

interface PageDoc {
  _id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  updatedAt: string;
}

async function getPages(): Promise<PageDoc[]> {
  await dbConnect();
  const pages = await Page.find().sort({ updatedAt: -1 }).lean();
  return JSON.parse(JSON.stringify(pages));
}

export default async function AdminPagesPage() {
  const pages = await getPages();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground">Manage static content pages</p>
        </div>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No pages yet. Create your first page.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page._id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                  <TableCell>
                    <Badge variant={page.isPublished ? "default" : "secondary"}>
                      {page.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {page.isPublished && (
                        <Link href={`/pages/${page.slug}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/pages/${page._id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
