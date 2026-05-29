'use client';
import { useEffect, useState } from 'react';

interface TimelineEvent {
  _id?: string;
  headline: string;
  text: string;
  start_date: { year: string; month?: string; day?: string };
  end_date?: { year?: string; month?: string; day?: string };
  media?: { url: string; caption?: string; credit?: string };
  group: string;
}

export default function AdminTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [formData, setFormData] = useState<TimelineEvent>({
    headline: '',
    text: '',
    start_date: { year: '', month: '', day: '' },
    group: 'Milestone'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch all events
  const fetchEvents = async () => {
    const res = await fetch('/api/admin/timeline');
    const data = await res.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingId 
      ? `/api/admin/timeline/${editingId}` 
      : '/api/admin/timeline';

    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    fetchEvents();
    resetForm();
  };

  const editEvent = (event: TimelineEvent) => {
    setFormData(event);
    setEditingId(event._id!);
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/admin/timeline/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  const resetForm = () => {
    setFormData({
      headline: '',
      text: '',
      start_date: { year: '', month: '', day: '' },
      group: 'Milestone'
    });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Manage Timeline Events</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-2xl mb-12">
          <h2 className="text-2xl mb-6">{editingId ? 'Edit Event' : 'Add New Event'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Headline"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="p-4 bg-gray-800 rounded-xl"
              required
            />

            <select
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              className="p-4 bg-gray-800 rounded-xl"
            >
              <option value="Milestone">Milestone</option>
              <option value="Event">Event</option>
              <option value="Broadcast">Broadcast</option>
              <option value="Achievement">Achievement</option>
            </select>

            <input
              type="number"
              placeholder="Start Year (e.g. 2010)"
              value={formData.start_date.year}
              onChange={(e) => setFormData({ ...formData, start_date: { ...formData.start_date, year: e.target.value } })}
              className="p-4 bg-gray-800 rounded-xl"
              required
            />

            <input
              type="text"
              placeholder="Start Month (01-12)"
              value={formData.start_date.month || ''}
              onChange={(e) => setFormData({ ...formData, start_date: { ...formData.start_date, month: e.target.value } })}
              className="p-4 bg-gray-800 rounded-xl"
            />
          </div>

          <textarea
            placeholder="Description / Text"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            className="w-full mt-6 p-4 bg-gray-800 rounded-xl h-32"
            required
          />

          <input
            type="text"
            placeholder="Image URL (optional)"
            value={formData.media?.url || ''}
            onChange={(e) => setFormData({ ...formData, media: { ...formData.media, url: e.target.value } })}
            className="w-full mt-6 p-4 bg-gray-800 rounded-xl"
          />

          <div className="flex gap-4 mt-8">
            <button type="submit" className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl font-bold">
              {editingId ? 'Update Event' : 'Add Event'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="bg-gray-600 px-8 py-4 rounded-xl">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List of Events */}
        <h2 className="text-2xl mb-6">Existing Events</h2>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="bg-gray-900 p-6 rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl">{event.headline}</h3>
                <p className="text-gray-400">{event.start_date.year} • {event.group}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => editEvent(event)} className="bg-blue-600 px-5 py-2 rounded-xl">Edit</button>
                <button onClick={() => deleteEvent(event._id!)} className="bg-red-600 px-5 py-2 rounded-xl">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
