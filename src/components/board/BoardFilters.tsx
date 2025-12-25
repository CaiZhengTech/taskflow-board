import { useState } from 'react';
import { TaskPriority } from '@/types/task';
import { useTaskStore } from '@/stores/taskStore';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function BoardFilters() {
  const { filters, setFilters, clearFilters } = useTaskStore();
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setFilters({ search: value });
  };

  const hasActiveFilters = filters.priority || filters.dueDate || filters.search;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="pl-9 h-8"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn('gap-1.5', hasActiveFilters && 'border-primary')}>
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                !
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Priority</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.priority === 'high'}
            onCheckedChange={(checked) => setFilters({ priority: checked ? 'high' : null })}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-priority-high" />
              High
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.priority === 'medium'}
            onCheckedChange={(checked) => setFilters({ priority: checked ? 'medium' : null })}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-priority-medium" />
              Medium
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.priority === 'low'}
            onCheckedChange={(checked) => setFilters({ priority: checked ? 'low' : null })}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-priority-low" />
              Low
            </span>
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Due Date</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.dueDate === 'overdue'}
            onCheckedChange={(checked) => setFilters({ dueDate: checked ? 'overdue' : null })}
          >
            Overdue
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.dueDate === 'this_week'}
            onCheckedChange={(checked) => setFilters({ dueDate: checked ? 'this_week' : null })}
          >
            This week
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
