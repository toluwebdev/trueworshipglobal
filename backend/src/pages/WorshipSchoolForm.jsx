import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import ImageUpload from "../components/ImageUpload";
import { Button, ErrorMessage, Input, PageHeader, Textarea } from "../components/ui";

const empty = {
  title: "",
  description: "",
  imageUrl: "",
  registerUrl: "",
  date: "",
  time: "",
  location: "",
};

function toDateInputValue(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function WorshipSchoolForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.worshipSchool
      .get(id)
      .then((item) => {
        setForm({
          title: item.title || "",
          description: item.description || "",
          imageUrl: item.imageUrl || "",
          registerUrl: item.registerUrl || "",
          date: toDateInputValue(item.date),
          time: item.time || "",
          location: item.location || "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, date: new Date(form.date).toISOString() };
      if (isEdit) {
        await api.worshipSchool.update(id, payload);
      } else {
        await api.worshipSchool.create(payload);
      }
      navigate("/worship-school");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-white/60">Loading…</p>;
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title={isEdit ? "Edit class" : "New class"} />
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Title" name="title" value={form.title} onChange={onChange} required />
        <Textarea
          label="Description"
          name="description"
          value={form.description}
          onChange={onChange}
          rows={6}
          required
        />
        <ImageUpload
          label="Class image"
          value={form.imageUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
          type="worship-school"
          required
        />
        <Input
          label="Enrollment URL"
          name="registerUrl"
          value={form.registerUrl}
          onChange={onChange}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={onChange}
            required
          />
          <Input label="Time" name="time" value={form.time} onChange={onChange} required />
        </div>
        <Input label="Location" name="location" value={form.location} onChange={onChange} required />
        <ErrorMessage message={error} />
        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create class"}
          </Button>
          <Link to="/worship-school">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
