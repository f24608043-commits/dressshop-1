'use client';

import React, { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blog');
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      try {
        const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setBlogs(blogs.filter((blog) => blog.id !== id));
        }
      } catch (error) {
        console.error('Failed to delete blog:', error);
      }
    }
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    try {
      const isExisting = blogs.some(b => b.id === editingBlog.id);
      const url = isExisting ? `/api/blog/${editingBlog.id}` : '/api/blog';
      const method = isExisting ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBlog),
      });

      if (res.ok) {
        const savedBlog = await res.json();
        if (isExisting) {
          setBlogs(blogs.map((b) => (b.id === editingBlog.id ? savedBlog : b)));
        } else {
          setBlogs([savedBlog, ...blogs]);
        }
        setIsEditing(false);
        setEditingBlog(null);
      }
    } catch (error) {
      console.error('Failed to save blog:', error);
    }
  };

  const handleTogglePublish = async (id: string) => {
    const blog = blogs.find(b => b.id === id);
    if (!blog) return;

    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...blog, published: !blog.published }),
      });

      if (res.ok) {
        setBlogs(blogs.map((b) => (b.id === id ? { ...b, published: !b.published } : b)));
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Blog Management</h1>
          <p className="text-xs text-gray-500 mt-1">Create, edit, and manage blog posts.</p>
        </div>
        <button
          onClick={() => {
            setEditingBlog({
              id: '',
              title: '',
              slug: '',
              excerpt: '',
              content: '',
              imageUrl: '',
              published: false,
              createdAt: new Date().toISOString(),
            });
            setIsEditing(true);
          }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow"
        >
          + New Blog Post
        </button>
      </div>

      {isEditing && editingBlog && (
        <div className="bg-gray-50 p-6 rounded-xl space-y-4">
          <h2 className="font-bold text-sm text-gray-900 border-b border-gray-200 pb-2">
            {editingBlog.title ? 'Edit Blog Post' : 'New Blog Post'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Title *</label>
              <input
                type="text"
                value={editingBlog.title}
                onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Slug *</label>
              <input
                type="text"
                value={editingBlog.slug}
                onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Excerpt *</label>
              <textarea
                value={editingBlog.excerpt}
                onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Content *</label>
              <textarea
                value={editingBlog.content}
                onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={10}
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Image URL</label>
              <input
                type="text"
                value={editingBlog.imageUrl}
                onChange={(e) => setEditingBlog({ ...editingBlog, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={editingBlog.published}
                onChange={(e) => setEditingBlog({ ...editingBlog, published: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="published" className="font-bold text-gray-700">
                Published
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingBlog(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold text-xs rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 font-bold text-gray-700">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{blog.title}</td>
                <td className="p-3 font-mono text-gray-600">{blog.slug}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleTogglePublish(blog.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      blog.published ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {blog.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="p-3 text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No blog posts found.</p>
        </div>
      )}
    </div>
  );
}
