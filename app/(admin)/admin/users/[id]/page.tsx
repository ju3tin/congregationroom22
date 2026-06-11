"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUser, getUser, deleteUser } from "@/app/actions/users";
import { toast } from "sonner";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user" | "moderator",
    isActive: true,
    password: "", // optional for update
  });

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getUser(userId);
        if (!user) {
          toast.error("User not found");
          router.push("/admin/users");
          return;
        }

        setForm({
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive ?? true,
          password: "",
        });
      } catch (error) {
        toast.error("Failed to load user");
      } finally {
        setInitialLoading(false);
      }
    }

    fetchUser();
  }, [userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("role", form.role);
    fd.append("isActive", form.isActive.toString());
    
    if (form.password) {
      fd.append("password", form.password);
    }

    const result = await updateUser(userId, fd);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("User updated successfully");
      router.push("/admin/users");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setLoading(true);
    const result = await deleteUser(userId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("User deleted successfully");
      router.push("/admin/users");
    }
    setLoading(false);
  };

  if (initialLoading) return <div className="p-8 text-center">Loading user...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold">Edit User</h1>
        </div>

        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {showDeleteConfirm ? "Confirm Delete" : "Delete User"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>New Password (leave blank to keep current)</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(value: "admin" | "user" | "moderator") => setForm({ ...form, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <Label>Account is Active</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/users">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
