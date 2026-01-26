'use client';

import { useEffect, useState } from 'react';
import { type CardWithDetails, type User, type Comment, type Tag, type Subtask, type CardActivity } from '@/lib/types';
import { useStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Edit2, Check, X, Clock, Plus, Tag as TagIcon, Calendar, CheckSquare, Square, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardDetailModalProps {
  cardId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const priorityConfig = {
  P0: { label: 'P0 - Critical', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400' },
  P1: { label: 'P1 - High', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400' },
  P2: { label: 'P2 - Medium', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400' },
  P3: { label: 'P3 - Low', color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400' },
};

export function CardDetailModal({
  cardId,
  open,
  onOpenChange,
  onUpdate,
}: CardDetailModalProps) {
  const { currentUser } = useStore();
  const [card, setCard] = useState<CardWithDetails | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P3');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [activities, setActivities] = useState<Array<CardActivity & { user: User | null }>>([]);
  
  // Pattern: Optimistic UI - flag pour éviter l'écrasement des changements locaux
  const [isLocallyEditing, setIsLocallyEditing] = useState(false);

  useEffect(() => {
    if (open && cardId) {
      loadCard();
      loadUsers();
    }
  }, [open, cardId]);

  // Pattern: Single Source of Truth - ne réinitialiser que si pas d'édition locale en cours
  useEffect(() => {
    if (card && !isLocallyEditing) {
      setTitle(card.title);
      setDescription(card.description || '');
      setPriority(card.priority);
      setAssigneeId(card.assignee_id);
      setDueDate(card.due_date || null);
      setSubtasks(card.subtasks || []);
      setActivities(card.activities || []);
    }
  }, [card]);

  async function loadCard() {
    if (!cardId) return;

    try {
      const response = await fetch(`/api/cards/${cardId}/details`);
      const { data } = await response.json();

      if (data) {
        setCard(data);
      }
    } catch (error) {
      console.error('Error loading card:', error);
    }
  }

  async function loadAvailableTags() {
    if (!card) return;
    
    try {
      // Récupérer le board_id depuis la colonne
      const columnResponse = await fetch(`/api/boards?column_id=${card.column_id}`);
      const { data: boardData } = await columnResponse.json();

      if (boardData && boardData.length > 0) {
        const boardId = boardData[0].id;
        const tagsResponse = await fetch(`/api/tags?board_id=${boardId}`);
        const { data: tags } = await tagsResponse.json();
        
        setAvailableTags(tags || []);
      }
    } catch (error) {
      console.error('Error loading available tags:', error);
    }
  }

  useEffect(() => {
    if (card) {
      loadAvailableTags();
    }
  }, [card]);

  async function loadUsers() {
    try {
      const response = await fetch('/api/users');
      const { data } = await response.json();
      if (data) setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async function createActivity(actionType: string, fieldName?: string, oldValue?: string, newValue?: string) {
    if (!cardId || !currentUser) return;

    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: cardId,
          user_id: currentUser.id,
          action_type: actionType,
          field_name: fieldName || null,
          old_value: oldValue || null,
          new_value: newValue || null,
        }),
      });
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  }

  // Pattern: Optimistic UI Update - mise à jour immédiate de l'UI, sync serveur après
  async function updateCard() {
    if (!cardId || !title.trim() || !card) return;

    const updates: any = {};
    if (title !== card.title) {
      updates.title = title;
      await createActivity('updated', 'title', card.title, title);
    }
    if (description !== (card.description || '')) {
      updates.description = description;
      await createActivity('updated', 'description', card.description || '', description);
    }
    if (priority !== card.priority) {
      updates.priority = priority;
      await createActivity('updated', 'priority', card.priority, priority);
    }
    if (assigneeId !== card.assignee_id) {
      updates.assignee_id = assigneeId;
      const oldAssignee = users.find(u => u.id === card.assignee_id);
      const newAssignee = users.find(u => u.id === assigneeId);
      await createActivity('updated', 'assignee', oldAssignee?.name || 'Unassigned', newAssignee?.name || 'Unassigned');
    }
    if (dueDate !== card.due_date) {
      updates.due_date = dueDate;
      await createActivity('updated', 'due_date', card.due_date || '', dueDate || '');
    }

    if (Object.keys(updates).length > 0) {
      try {
        // Pattern: Optimistic Update - mettre à jour l'état local immédiatement
        setCard({ ...card, ...updates });
        
        // Envoyer au serveur
        await fetch(`/api/cards/${cardId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        
        // Pattern: Optimistic UI - recharger le board pour voir les changements
        onUpdate();
        
        // Signaler la fin de l'édition locale après un court délai
        setTimeout(() => setIsLocallyEditing(false), 300);
      } catch (error) {
        console.error('Error updating card:', error);
        // En cas d'erreur, recharger depuis le serveur
        loadCard();
        onUpdate(); // Recharger le board même en cas d'erreur
      }
    }
  }

  async function deleteCard() {
    if (!cardId) return;
    try {
      await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      });
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  }

  async function addComment() {
    if (!cardId || !newComment.trim() || !currentUser) return;

    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: cardId,
          author_id: currentUser.id,
          text: newComment,
        }),
      });

      setNewComment('');
      loadCard();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  async function updateComment(commentId: string) {
    if (!editingCommentText.trim()) return;

    try {
      await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editingCommentText,
        }),
      });

      setEditingCommentId(null);
      setEditingCommentText('');
      loadCard();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  }

  async function deleteComment(commentId: string) {
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      loadCard();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

  function canEditComment(comment: Comment & { author: User }) {
    if (!currentUser || comment.author_id !== currentUser.id) return false;
    const createdAt = new Date(comment.created_at);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    return createdAt > tenMinutesAgo;
  }

  async function createTag() {
    if (!card || !newTagName.trim()) return;

    try {
      // Récupérer le board_id depuis la colonne
      const columnResponse = await fetch(`/api/boards?column_id=${card.column_id}`);
      const { data: boardData } = await columnResponse.json();

      if (boardData && boardData.length > 0) {
        const boardId = boardData[0].id;
        
        // Créer le tag
        const tagResponse = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newTagName.trim(),
            color: newTagColor,
            board_id: boardId,
          }),
        });
        const { data: tag } = await tagResponse.json();

        if (tag) {
          // Associer le tag à la carte
          await fetch('/api/card-tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              card_id: card.id,
              tag_id: tag.id,
            }),
          });
          
          setNewTagName('');
          loadCard();
          loadAvailableTags();
        }
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  }

  async function addExistingTag(tagId: string) {
    if (!cardId || !tagId) return;
    try {
      await fetch('/api/card-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: cardId,
          tag_id: tagId,
        }),
      });
      await loadCard();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  }

  async function removeTag(tagId: string) {
    if (!cardId) return;
    try {
      await fetch(`/api/card-tags?card_id=${cardId}&tag_id=${tagId}`, {
        method: 'DELETE',
      });
      loadCard();
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  }

  async function addSubtask() {
    if (!cardId || !newSubtaskTitle.trim()) return;

    try {
      const maxPosition = subtasks.length > 0 ? Math.max(...subtasks.map(s => s.position)) : 0;
      
      await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: cardId,
          title: newSubtaskTitle.trim(),
          completed: false,
          position: maxPosition + 1,
        }),
      });

      setNewSubtaskTitle('');
      loadCard();
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  }

  async function toggleSubtask(subtaskId: string, completed: boolean) {
    try {
      await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      
      loadCard();
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  }

  async function deleteSubtask(subtaskId: string) {
    try {
      await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'DELETE',
      });
      loadCard();
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  }

  // Fonction pour fermer la modal en sauvegardant les changements en attente
  async function handleClose(isOpen: boolean) {
    // Si on ferme la modal (isOpen = false)
    if (!isOpen) {
      // Si des changements sont en attente, sauvegarder d'abord
      if (card && isLocallyEditing) {
        await updateCard();
      } else if (card) {
        // Même si pas d'édition locale, recharger le board pour être sûr
        onUpdate();
      }
    }
    
    onOpenChange(isOpen);
  }

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
          <DialogDescription>
            Edit card information, manage tags, and add comments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-title">Title</Label>
              <Input
                id="card-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={updateCard}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-description">Description</Label>
              <Textarea
                id="card-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={updateCard}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value: any) => {
                    setIsLocallyEditing(true);
                    setPriority(value);
                    setTimeout(updateCard, 100);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {priority && (
                        <Badge
                          variant="outline"
                          className={cn('text-xs', priorityConfig[priority].color)}
                        >
                          {priorityConfig[priority].label}
                        </Badge>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', config.color)}
                        >
                          {config.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select
                  value={assigneeId || 'unassigned'}
                  onValueChange={(value) => {
                    setIsLocallyEditing(true);
                    setAssigneeId(value === 'unassigned' ? null : value);
                    setTimeout(updateCard, 100);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {assigneeId ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">
                              {users.find((u) => u.id === assigneeId)?.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span>{users.find((u) => u.id === assigneeId)?.name}</span>
                        </div>
                      ) : (
                        'Unassigned'
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">
                              {user.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-due-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </Label>
              <Input
                id="card-due-date"
                type="datetime-local"
                value={dueDate ? new Date(dueDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  setIsLocallyEditing(true);
                  setDueDate(e.target.value ? new Date(e.target.value).toISOString() : null);
                  setTimeout(updateCard, 100);
                }}
              />
              {dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  {new Date(dueDate) < new Date() ? (
                    <Badge variant="destructive" className="text-xs">
                      Overdue
                    </Badge>
                  ) : new Date(dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 ? (
                    <Badge className="bg-yellow-500 text-xs">
                      Due Soon
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Upcoming
                    </Badge>
                  )}
                  <span className="text-muted-foreground">
                    {new Date(dueDate).toLocaleDateString('fr-FR', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Tags
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {card.tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs flex items-center gap-1"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="ml-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Add Tag</Label>
              <div className="flex gap-2">
                <Select value="" onValueChange={addExistingTag}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select existing tag..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags
                      .filter(tag => !card.tags?.some(t => t.id === tag.id))
                      .map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="new-tag-name" className="text-xs">Or create new</Label>
                  <Input
                    id="new-tag-name"
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagName.trim()) createTag();
                    }}
                  />
                </div>
                <div className="w-20">
                  <Label htmlFor="new-tag-color" className="text-xs">Color</Label>
                  <Input
                    id="new-tag-color"
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="h-10 px-1"
                  />
                </div>
                <Button onClick={createTag} disabled={!newTagName.trim()} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Subtasks
                {subtasks.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {subtasks.filter(s => s.completed).length}/{subtasks.length}
                  </Badge>
                )}
              </h3>
            </div>

            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <button
                    onClick={() => toggleSubtask(subtask.id, !subtask.completed)}
                    className="flex-shrink-0"
                  >
                    {subtask.completed ? (
                      <CheckSquare className="h-4 w-4 text-green-500" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <span className={cn(
                    'flex-1 text-sm',
                    subtask.completed && 'line-through text-muted-foreground'
                  )}>
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => deleteSubtask(subtask.id)}
                    className="flex-shrink-0 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSubtaskTitle.trim()) addSubtask();
                }}
              />
              <Button onClick={addSubtask} disabled={!newSubtaskTitle.trim()} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Comments</h3>

            <div className="space-y-3">
              {card.comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="text-xs">
                      {comment.author.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.author.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                      {comment.created_at !== comment.updated_at && (
                        <span className="text-xs text-slate-400">(edited)</span>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateComment(comment.id);
                            if (e.key === 'Escape') setEditingCommentId(null);
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateComment(comment.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCommentId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {comment.text}
                      </p>
                    )}
                  </div>
                  {canEditComment(comment) && editingCommentId !== comment.id && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingCommentText(comment.text);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-600"
                        onClick={() => deleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Avatar className="h-8 w-8 mt-2">
                <AvatarFallback className="text-xs">
                  {currentUser?.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addComment();
                    }
                  }}
                />
                <Button onClick={addComment} disabled={!newComment.trim()}>
                  Comment
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <History className="h-4 w-4" />
              Activity
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 text-sm">
                    <Avatar className="h-6 w-6 mt-0.5">
                      <AvatarFallback className="text-xs">
                        {activity.user?.avatar || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {activity.user?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString('fr-FR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {activity.action_type === 'created' && 'created this card'}
                        {activity.action_type === 'updated' && activity.field_name && (
                          <>
                            changed <span className="font-medium">{activity.field_name}</span>
                            {activity.old_value && activity.new_value && (
                              <>
                                {' '}from <span className="font-medium">{activity.old_value}</span> to{' '}
                                <span className="font-medium">{activity.new_value}</span>
                              </>
                            )}
                          </>
                        )}
                        {activity.action_type === 'moved' && (
                          <>
                            moved card from <span className="font-medium">{activity.old_value}</span> to{' '}
                            <span className="font-medium">{activity.new_value}</span>
                          </>
                        )}
                        {activity.action_type === 'commented' && 'added a comment'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="destructive"
              onClick={deleteCard}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Card
            </Button>
            <Button variant="outline" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
