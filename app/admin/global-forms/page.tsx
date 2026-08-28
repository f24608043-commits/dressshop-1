'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ChildOptionInput {
  title: string;
  price: number;
  imageUrl?: string;
  description?: string;
  enabled: boolean;
}

interface ParentOptionInput {
  title: string;
  price: number;
  imageUrl?: string;
  description?: string;
  enabled: boolean;
  inputType: 'RADIO' | 'CHECKBOX';
  childOptions: ChildOptionInput[];
}

export default function AdminGlobalFormsPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<ParentOptionInput[]>([
    {
      title: 'Stitching Style',
      price: 0,
      enabled: true,
      inputType: 'RADIO',
      childOptions: [
        { title: 'Ready To Wear', price: 24, description: 'Standard sizing', enabled: true },
        { title: 'Made To Measure', price: 36, description: 'Custom fitted', enabled: true },
      ],
    },
  ]);
  const [status, setStatus] = useState<string | null>(null);

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/global-forms');
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const addParentOption = () => {
    setOptions([
      ...options,
      {
        title: '',
        price: 0,
        enabled: true,
        inputType: 'RADIO',
        childOptions: [],
      },
    ]);
  };

  const updateParentOption = (index: number, field: keyof ParentOptionInput, val: any) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: val };
    setOptions(updated);
  };

  const removeParentOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const addChildOption = (parentIndex: number) => {
    const updated = [...options];
    updated[parentIndex].childOptions.push({
      title: '',
      price: 0,
      imageUrl: '',
      description: '',
      enabled: true,
    });
    setOptions(updated);
  };

  const updateChildOption = (parentIndex: number, childIndex: number, field: keyof ChildOptionInput, val: any) => {
    const updated = [...options];
    updated[parentIndex].childOptions[childIndex] = {
      ...updated[parentIndex].childOptions[childIndex],
      [field]: val,
    };
    setOptions(updated);
  };

  const removeChildOption = (parentIndex: number, childIndex: number) => {
    const updated = [...options];
    updated[parentIndex].childOptions = updated[parentIndex].childOptions.filter((_, cI) => cI !== childIndex);
    setOptions(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!name.trim()) {
      setStatus('❌ Global Form Title is required.');
      return;
    }

    try {
      const res = await fetch('/api/global-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          active: true,
          options,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`✅ Global Form "${data.name}" created successfully!`);
        setName('');
        setDescription('');
        setOptions([]);
        fetchForms();
      } else {
        setStatus(`❌ ${data.error || 'Failed to create global form'}`);
      }
    } catch {
      setStatus('❌ Network error creating form.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this global form?')) return;
    await fetch(`/api/global-forms/${id}`, { method: 'DELETE' });
    fetchForms();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Global Product Form Builder</h1>
        <p className="text-xs text-gray-500 mt-1">
          Create reusable global forms with parent-child options, fixed price add-ons, image previews, and show/hide rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Creator (7 cols) */}
        <form onSubmit={handleCreate} className="lg:col-span-7 bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6 text-xs">
          <h2 className="font-serif font-bold text-gray-900 text-sm border-b pb-2">
            Create Global Customization Form
          </h2>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-gray-800 block mb-1">Global Form Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Bridal Dress Customization Configurator"
                className="w-full px-3 py-2 border border-gray-300 rounded font-semibold text-gray-900"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Reusable tailoring and add-on options for bridal couture"
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-600"
              />
            </div>
          </div>

          {/* Options & Child Options List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <label className="font-serif font-bold text-sm text-gray-900">
                Form Option Groups ({options.length})
              </label>
              <button
                type="button"
                onClick={addParentOption}
                className="px-3 py-1 bg-[#580520] text-amber-200 text-xs font-bold rounded hover:bg-[#7b113a]"
              >
                + Add Parent Option
              </button>
            </div>

            {options.map((parent, pI) => (
              <div key={pI} className="bg-amber-50/40 p-4 rounded-md border border-amber-200 space-y-3">
                
                {/* Parent Row */}
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between border-b border-amber-200/60 pb-2">
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Option Title (e.g. Stitching Style)"
                        value={parent.title}
                        onChange={(e) => updateParentOption(pI, 'title', e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded font-bold text-gray-900"
                      />
                      <select
                        value={parent.inputType}
                        onChange={(e) => updateParentOption(pI, 'inputType', e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded font-bold text-gray-800 bg-white"
                      >
                        <option value="RADIO">Radio Buttons</option>
                        <option value="CHECKBOX">Checkboxes</option>
                      </select>
                    </div>

                    <div className="flex gap-2 items-center text-[11px]">
                      <input
                        type="number"
                        placeholder="Fixed Price ($)"
                        value={parent.price}
                        onChange={(e) => updateParentOption(pI, 'price', Number(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded font-bold"
                      />
                      <label className="flex items-center gap-1 font-bold text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parent.enabled}
                          onChange={(e) => updateParentOption(pI, 'enabled', e.target.checked)}
                          className="w-3.5 h-3.5 text-[#580520]"
                        />
                        Enabled
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeParentOption(pI)}
                    className="text-xs text-red-600 hover:underline font-bold shrink-0"
                  >
                    ✕ Delete Group
                  </button>
                </div>

                {/* Child Options List */}
                <div className="pl-3 border-l-2 border-amber-500 space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-gray-800 uppercase tracking-wider">
                      └── Child Options ({parent.childOptions.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => addChildOption(pI)}
                      className="text-[11px] font-bold text-[#580520] hover:underline"
                    >
                      + Add Child Option
                    </button>
                  </div>

                  {parent.childOptions.map((child, cI) => (
                    <div key={cI} className="bg-white p-3 rounded border border-gray-200 space-y-2">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Child Title (e.g. Ready To Wear)"
                          value={child.title}
                          onChange={(e) => updateChildOption(pI, cI, 'title', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded font-bold text-gray-900"
                        />
                        <input
                          type="number"
                          placeholder="Price ($)"
                          value={child.price}
                          onChange={(e) => updateChildOption(pI, cI, 'price', Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded font-bold text-right"
                        />
                        <button
                          type="button"
                          onClick={() => removeChildOption(pI, cI)}
                          className="text-red-500 font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Image Link (optional URL)"
                          value={child.imageUrl || ''}
                          onChange={(e) => updateChildOption(pI, cI, 'imageUrl', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-gray-600"
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={child.description || ''}
                          onChange={(e) => updateChildOption(pI, cI, 'description', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-gray-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#580520] hover:bg-[#7b113a] text-amber-200 font-serif font-bold text-sm uppercase tracking-wider rounded"
          >
            Save Global Form Definition ➔
          </button>

          {status && <p className="font-bold text-center p-2.5 bg-gray-100 rounded text-xs">{status}</p>}
        </form>

        {/* Existing Global Forms Display (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-serif font-bold text-gray-900 text-sm border-b pb-2">
            Configured Global Forms ({forms.length})
          </h2>

          {forms.map((form) => (
            <div key={form.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-serif font-bold text-gray-900 text-sm">⚙️ {form.name}</h3>
                  {form.description && <p className="text-[11px] text-gray-500">{form.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(form.id)}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  Delete
                </button>
              </div>

              {/* Display Hierarchy */}
              <div className="space-y-3 text-xs">
                {form.options?.map((opt: any) => (
                  <div key={opt.id} className="bg-gray-50 p-2.5 rounded border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-gray-900">
                      <span>{opt.title} ({opt.inputType})</span>
                      <span className="text-[#580520]">
                        {opt.price > 0 ? `+$${opt.price}` : 'FREE'}
                      </span>
                    </div>

                    {opt.childOptions && opt.childOptions.length > 0 && (
                      <div className="pl-3 border-l-2 border-[#580520] space-y-1 pt-1">
                        {opt.childOptions.map((c: any) => (
                          <div key={c.id} className="flex items-center justify-between text-[11px] text-gray-700">
                            <span className="flex items-center gap-1.5">
                              {c.imageUrl && (
                                <span className="relative w-5 h-5 rounded overflow-hidden inline-block shrink-0">
                                  <Image src={c.imageUrl} alt={c.title} fill className="object-cover" />
                                </span>
                              )}
                              <span>{c.title}</span>
                            </span>
                            <span className="font-bold text-[#580520]">+${c.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {forms.length === 0 && (
            <div className="text-center py-12 text-xs text-gray-400">
              No global forms created yet. Use the builder on the left to create reusable options.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
