'use client';
import { useState } from 'react';
import Editor from '@/components/Editor';

export default function ProductForm() {
  const [description, setDescription] = useState('');

  const handleSave = () => {
    console.log("HTML Content:", description);
    // Save to MongoDB
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Product / Event</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Description</label>
        <Editor content={description} onChange={setDescription} />
      </div>

      <button
        onClick={handleSave}
        className="bg-black text-white px-8 py-3 rounded-xl"
      >
        Save Product
      </button>
    </div>
  );
}
