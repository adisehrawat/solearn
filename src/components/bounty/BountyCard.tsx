// React import not needed with new JSX transform
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BountyAccount } from '@/types/program';
import { Calendar, DollarSign, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BountyCardProps {
  bounty: BountyAccount;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  isDeleting?: boolean;
}

export function BountyCard({ bounty, showActions = false, onEdit, onDelete, isEditing = false, isDeleting = false }: BountyCardProps) {
  const formatDeadline = (deadline: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(deadline);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg line-clamp-2">{bounty.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2">
                {bounty.description}
              </CardDescription>
            </div>
            <Badge
              variant={bounty.status === 'active' ? 'default' : 'secondary'}
            >
              {bounty.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">{bounty.reward} SOL</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDeadline(bounty.deadline)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{bounty.submissionCount} submissions</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {bounty.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {bounty.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{bounty.skills.length - 3} more
                </Badge>
              )}
            </div>

            <div className="flex space-x-2">
              <Button asChild size="sm" className="flex-1">
                <Link to={`/bounty/${bounty.id}`}>View Details</Link>
              </Button>
              {showActions && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onEdit}
                    disabled={isEditing || isDeleting}
                  >
                    {isEditing ? 'Editing...' : 'Edit'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={onDelete}
                    disabled={isEditing || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}