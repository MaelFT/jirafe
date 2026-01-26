'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store';

export default function NewWorkspacePage() {
  const router = useRouter();
  const { setCurrentWorkspace } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('🏢');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const avatarOptions = ['🏢', '🏭', '🏗️', '🏛️', '🏪', '🏬', '🚀', '⚡', '🎯', '💼', '🎨', '💻'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, avatar }),
      });

      const { data } = await response.json();

      if (!response.ok) {
        setError(data?.error || 'Error creating workspace');
        setLoading(false);
        return;
      }

      // Set as active workspace
      setCurrentWorkspace(data);
      
      // Redirect to app
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('Connection error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create a Workspace</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Create a new space for your team or project
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace Information</CardTitle>
            <CardDescription>
              Give your workspace a name and identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar */}
              <div className="space-y-2">
                <Label>Workspace Icon</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                      {avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-wrap gap-2">
                    {avatarOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatar(emoji)}
                        className={`p-2 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                          avatar === emoji
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="My Company, Project X, Design Team..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this workspace..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Link href="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading || !name.trim()}>
                  {loading ? 'Creating...' : 'Create Workspace'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
