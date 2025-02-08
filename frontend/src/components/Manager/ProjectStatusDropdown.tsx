import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

const StatusButton = ({ status, className = '', disabled }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Completed':
        return {
          icon: CheckCircle,
          baseStyle: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
        };
      case 'In Progress':
        return {
          icon: Clock,
          baseStyle: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
        };
      default:
        return {
          icon: AlertCircle,
          baseStyle: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`inline-flex  items-center gap-1.5 px-3 py-1 rounded-full border ${config.baseStyle} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{status}</span>
    </div>
  );
};

const ProjectStatusDropdown = ({ status, onStatusChange, className = '' }) => {
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending':
        return ['In Progress'];
      case 'In Progress':
        return ['Completed'];
      case 'Completed':
        return [];
      default:
        return [];
    }
  };

  const availableStatuses = getAvailableStatuses(status);

  const handleStatusSelect = (newStatus) => {
    if (newStatus !== status && availableStatuses.includes(newStatus)) {
      setPendingStatus(newStatus);
      setIsDialogOpen(true);
    }
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleConfirm = () => {
    onStatusChange(pendingStatus);
    setIsDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={stopPropagation}>
          <Button
            variant="ghost"
            className={`p-0 hover:bg-transparent ${className}`}
            disabled={availableStatuses.length === 0}
          >
            <StatusButton status={status} disabled={availableStatuses.length === 0} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-48 p-1 bg-white rounded-lg shadow-lg border"
          onClick={stopPropagation}
        >
          {availableStatuses.map((statusOption) => (
            <Button
              key={statusOption}
              variant="ghost"
              className="w-full justify-start px-2 py-1.5 hover:bg-gray-50"
              onClick={() => handleStatusSelect(statusOption)}
            >
              <StatusButton status={statusOption} />
            </Button>
          ))}
          {availableStatuses.length === 0 && (
            <div className="px-2 py-1.5 text-sm text-gray-500">
              No status changes available
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to change the status to{" "}
            <span className="font-semibold">{pendingStatus}</span>?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm Change
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectStatusDropdown;