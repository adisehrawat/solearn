import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { BountyAccount } from '@/types/program';

interface BountyEditFormProps {
  bounty: BountyAccount;
  onSubmit: (data: {
    newTitle: string;
    newDescription: string;
    newDeadline: string;
    newSkills: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function BountyEditForm({ bounty, onSubmit, onCancel, isLoading }: BountyEditFormProps) {
  const [formData, setFormData] = useState({
    newTitle: bounty.title,
    newDescription: bounty.description,
    newDeadline: bounty.deadline.toISOString().split('T')[0], // Format as YYYY-MM-DD
    newSkills: [...bounty.skills]
  });
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.newSkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        newSkills: [...prev.newSkills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      newSkills: prev.newSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newSkills.length === 0) {
      alert('Please add at least one required skill');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Bounty</CardTitle>
        <CardDescription>
          Update the details of your bounty. Note: You cannot change the reward amount after creation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newTitle">Title</Label>
            <Input
              id="newTitle"
              value={formData.newTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, newTitle: e.target.value }))}
              placeholder="Enter bounty title"
              required
            />
          </div>

          <div>
            <Label htmlFor="newDescription">Description</Label>
            <Textarea
              id="newDescription"
              value={formData.newDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, newDescription: e.target.value }))}
              placeholder="Describe the bounty requirements..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="newDeadline">Deadline</Label>
            <Input
              id="newDeadline"
              type="date"
              value={formData.newDeadline}
              onChange={(e) => setFormData(prev => ({ ...prev, newDeadline: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <Label>Required Skills</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <Button
                type="button"
                onClick={handleAddSkill}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.newSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {formData.newSkills.length === 0 && (
              <p className="text-sm text-red-500 mt-1">At least one skill is required</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || formData.newSkills.length === 0}
              className="flex-1"
            >
              {isLoading ? 'Updating...' : 'Update Bounty'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
