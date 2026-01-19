'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Check, Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import type { WorkspaceWithMembers } from '@/lib/supabase';

export default function WorkspaceSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceWithMembers | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('🏢');
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const avatarOptions = ['🏢', '🏭', '🏗️', '🏛️', '🏪', '🏬', '🚀', '⚡', '🎯', '💼', '🎨', '💻'];

  useEffect(() => {
    loadWorkspace();
  }, []);

  async function loadWorkspace() {
    try {
      const response = await fetch(`/api/workspaces/${params.id}`);
      if (response.ok) {
        const { data } = await response.json();
        setWorkspace(data);
        setName(data.name);
        setDescription(data.description || '');
        setAvatar(data.avatar);
      }
    } catch (error) {
      console.error('Error loading workspace:', error);
    }
  }

  async function handleUpdateInfo(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/workspaces/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, avatar }),
      });

      if (!response.ok) {
        const { error: err } = await response.json();
        setError(err || 'Erreur lors de la mise à jour');
        setLoading(false);
        return;
      }

      setSuccess('Informations mises à jour !');
      loadWorkspace();
      setLoading(false);
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setLoading(false);
    }
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/workspaces/${params.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: 'member' }),
      });

      if (!response.ok) {
        const { error: err } = await response.json();
        setError(err || 'Erreur lors de l\'invitation');
        setLoading(false);
        return;
      }

      setSuccess('Membre invité avec succès !');
      setInviteEmail('');
      loadWorkspace();
      setLoading(false);
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setLoading(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm('Retirer ce membre du workspace ?')) return;

    try {
      const response = await fetch(`/api/workspaces/${params.id}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Membre retiré');
        loadWorkspace();
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-slate-500">Chargement...</div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const config = {
      owner: { label: 'Propriétaire', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
      admin: { label: 'Admin', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
      member: { label: 'Membre', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
    };
    const conf = config[role as keyof typeof config] || config.member;
    return <Badge className={conf.color}>{conf.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Paramètres de l'espace</h1>
            <p className="text-slate-600 dark:text-slate-400">
              {workspace.name}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-start gap-2">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Informations */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'espace</CardTitle>
            <CardDescription>
              Modifiez le nom, l'icône et la description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateInfo} className="space-y-6">
              {/* Avatar */}
              <div className="space-y-2">
                <Label>Icône</Label>
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

              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Membres */}
        <Card>
          <CardHeader>
            <CardTitle>Membres ({workspace.members?.length || 0})</CardTitle>
            <CardDescription>
              Gérez les personnes qui ont accès à cet espace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Inviter */}
            <form onSubmit={handleInviteMember} className="flex gap-2">
              <Input
                type="email"
                placeholder="email@exemple.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                <UserPlus className="h-4 w-4 mr-2" />
                Inviter
              </Button>
            </form>

            {/* Liste */}
            <div className="space-y-2">
              {workspace.members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        {member.user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.user.name}</div>
                      <div className="text-sm text-slate-500">{member.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(member.role)}
                    {member.role !== 'owner' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


