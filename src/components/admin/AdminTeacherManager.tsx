"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Avatar } from "@/components/Avatar";
import { Button, Input, Label, ErrorText, Card, Badge } from "@/components/ui";

export type AdminTeacher = {
  id: string;
  name: string;
  department: string;
  isFaculty: boolean;
  photoUrl: string | null;
  active: boolean;
  reviewCount: number;
};

function AddTeacherForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isFaculty, setIsFaculty] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, department, isFaculty, photoUrl: photoUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setName("");
      setDepartment("");
      setPhotoUrl("");
      setIsFaculty(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-navy-900">Add a teacher</h2>
      <form onSubmit={submit} className="mt-3 flex flex-wrap items-end gap-3">
        <div className="flex-1 basis-40">
          <Label htmlFor="new-name">Name</Label>
          <Input id="new-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex-1 basis-40">
          <Label htmlFor="new-dept">Subject / role</Label>
          <Input
            id="new-dept"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div className="flex-1 basis-48">
          <Label htmlFor="new-photo">Photo URL (optional)</Label>
          <Input
            id="new-photo"
            type="url"
            placeholder="https://..."
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-1.5 pb-2 text-sm text-navy-700">
          <input
            type="checkbox"
            checked={isFaculty}
            onChange={(e) => setIsFaculty(e.target.checked)}
            className="h-4 w-4 rounded border-navy-200 text-navy-800 focus:ring-surf-400"
          />
          Classroom teacher
        </label>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add teacher"}
        </Button>
      </form>
      <p className="mt-2 text-xs text-navy-300">
        Uncheck for staff who don&apos;t assign homework (admins, coaches, counselors, etc.) — they
        won&apos;t get a workload rating.
      </p>
      <ErrorText>{error}</ErrorText>
    </Card>
  );
}

function TeacherRow({ teacher }: { teacher: AdminTeacher }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(teacher.name);
  const [department, setDepartment] = useState(teacher.department);
  const [photoUrl, setPhotoUrl] = useState(teacher.photoUrl ?? "");
  const [isFaculty, setIsFaculty] = useState(teacher.isFaculty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/teachers/${teacher.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, department, photoUrl, isFaculty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive() {
    setLoading(true);
    const res = await fetch(`/api/teachers/${teacher.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !teacher.active }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  if (editing) {
    return (
      <Card className="space-y-2 p-3">
        <div className="flex flex-wrap gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 basis-40" />
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="flex-1 basis-40"
          />
          <Input
            type="url"
            placeholder="Photo URL"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="flex-1 basis-48"
          />
        </div>
        <label className="flex items-center gap-1.5 text-sm text-navy-700">
          <input
            type="checkbox"
            checked={isFaculty}
            onChange={(e) => setIsFaculty(e.target.checked)}
            className="h-4 w-4 rounded border-navy-200 text-navy-800 focus:ring-surf-400"
          />
          Classroom teacher (gets a workload rating)
        </label>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2">
          <Button onClick={save} disabled={loading} className="text-xs">
            Save
          </Button>
          <Button variant="ghost" onClick={() => setEditing(false)} className="text-xs">
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="flex items-center gap-3">
        <Avatar name={teacher.name} photoUrl={teacher.photoUrl} size="sm" />
        <div>
          <p className="flex flex-wrap items-center gap-1.5 font-medium text-navy-900">
            {teacher.name}
            {!teacher.active && <Badge tone="neutral">The Fallen</Badge>}
            {!teacher.isFaculty && <Badge tone="neutral">Staff</Badge>}
          </p>
          <p className="text-sm text-navy-500">
            {teacher.department} · {teacher.reviewCount} review{teacher.reviewCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setEditing(true)} className="text-xs">
          Edit
        </Button>
        <Button
          variant={teacher.active ? "danger" : "secondary"}
          onClick={toggleActive}
          disabled={loading}
          className="text-xs"
        >
          {teacher.active ? "Move to The Fallen" : "Restore"}
        </Button>
      </div>
    </Card>
  );
}

export function AdminTeacherManager({ teachers }: { teachers: AdminTeacher[] }) {
  return (
    <div className="space-y-4">
      <AddTeacherForm />
      <div className="space-y-1.5">
        {teachers.map((t) => (
          <TeacherRow key={t.id} teacher={t} />
        ))}
      </div>
    </div>
  );
}
