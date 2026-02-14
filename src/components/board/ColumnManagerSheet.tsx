import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTaskStore } from '@/stores/taskStore';
import { AVAILABLE_COLUMN_COLORS, getColumnColorStyle, type Column } from '@/types/task';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2, Plus, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ColumnManagerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColumnManagerSheet({ open, onOpenChange }: ColumnManagerSheetProps) {
  const { columns, addColumn, renameColumn, updateColumnColor, removeColumn, reorderColumns } = useWorkspaceStore();
  const tasks = useTaskStore((s) => s.tasks);
  const migrateTasksToColumn = useTaskStore((s) => s.migrateTasksToColumn);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; taskCount: number } | null>(null);
  const [migrateTo, setMigrateTo] = useState<string>('');

  const getTaskCount = useCallback(
    (columnId: string) => tasks.filter((t) => t.status === columnId).length,
    [tasks],
  );

  // --- Inline rename ---
  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      renameColumn(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditValue('');
  };

  // --- Add column ---
  const handleAddColumn = () => {
    const title = newColumnTitle.trim();
    if (!title) return;
    addColumn(title);
    setNewColumnTitle('');
    toast.success(`Column "${title}" added`);
  };

  // --- Delete column ---
  const initiateDelete = (id: string) => {
    const col = columns.find((c) => c.id === id);
    if (!col) return;
    const count = getTaskCount(id);
    setDeleteTarget({ id, title: col.title, taskCount: count });
    // Default migration target: first column that isn't the one being deleted
    const defaultTarget = columns.find((c) => c.id !== id);
    setMigrateTo(defaultTarget?.id ?? '');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    // Migrate tasks if there are any and a target is selected
    if (deleteTarget.taskCount > 0 && migrateTo) {
      migrateTasksToColumn(deleteTarget.id, migrateTo);
    }
    removeColumn(deleteTarget.id);
    toast.success(`Column "${deleteTarget.title}" removed`);
    setDeleteTarget(null);
    setMigrateTo('');
  };

  // --- Reorder via drag & drop ---
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const col = columns.find((c) => c.id === event.active.id);
    if (col) setActiveColumn(col);
  }, [columns]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveColumn(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = columns.findIndex((c) => c.id === active.id);
    const toIndex = columns.findIndex((c) => c.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderColumns(fromIndex, toIndex);
    }
  }, [columns, reorderColumns]);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Manage Columns</SheetTitle>
            <SheetDescription>
              Add, rename, reorder, or remove board columns. Drag to reorder.
            </SheetDescription>
          </SheetHeader>

          {/* Column list with DnD reorder */}
          <div className="flex-1 overflow-y-auto mt-4 -mx-2 px-2 space-y-1">
            <DndContext
              sensors={dndSensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {columns.map((col) => {
                  const count = getTaskCount(col.id);
                  const isEditing = editingId === col.id;

                  return (
                    <SortableColumnRow
                      key={col.id}
                      col={col}
                      count={count}
                      isEditing={isEditing}
                      editValue={editValue}
                      onEditValueChange={setEditValue}
                      onStartRename={() => startRename(col.id, col.title)}
                      onCommitRename={commitRename}
                      onCancelRename={cancelRename}
                      onColorChange={(color) => updateColumnColor(col.id, color)}
                      onDelete={() => initiateDelete(col.id)}
                      canDelete={columns.length > 1}
                    />
                  );
                })}
              </SortableContext>

              <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
                {activeColumn && (
                  <ColumnRowOverlay
                    col={activeColumn}
                    count={getTaskCount(activeColumn.id)}
                  />
                )}
              </DragOverlay>
            </DndContext>
          </div>

          {/* Add new column */}
          <div className="border-t border-border pt-4 mt-4">
            <form
              onSubmit={(e) => { e.preventDefault(); handleAddColumn(); }}
              className="flex items-center gap-2"
            >
              <Input
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="New column name…"
                className="flex-1 h-9"
              />
              <Button type="submit" size="sm" disabled={!newColumnTitle.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}" column?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.taskCount
                ? `This column has ${deleteTarget.taskCount} task${deleteTarget.taskCount > 1 ? 's' : ''}. Choose where to move them before deleting.`
                : 'This column has no tasks and will be removed immediately.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteTarget && deleteTarget.taskCount > 0 && (
            <div className="py-2">
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Move tasks to:
              </label>
              <Select value={migrateTo} onValueChange={setMigrateTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column…" />
                </SelectTrigger>
                <SelectContent>
                  {columns
                    .filter((c) => c.id !== deleteTarget.id)
                    .map((c) => {
                      const cs = getColumnColorStyle(c.color);
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <div className={cn('w-2 h-2 rounded-full', cs.dot)} />
                            {c.title}
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTarget?.taskCount ? !migrateTo : false}
            >
              Delete Column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ---------- Sortable column row ----------

interface SortableColumnRowProps {
  col: Column;
  count: number;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (v: string) => void;
  onStartRename: () => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onColorChange: (color: string) => void;
  onDelete: () => void;
  canDelete: boolean;
}

function SortableColumnRow({
  col, count, isEditing, editValue, onEditValueChange,
  onStartRename, onCommitRename, onCancelRename,
  onColorChange, onDelete, canDelete,
}: SortableColumnRowProps) {
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: col.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group',
        isDragging && 'ring-2 ring-primary/30',
      )}
    >
      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="p-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Color dot */}
      <ColorPicker value={col.color} onChange={onColorChange} />

      {/* Title / rename */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <form
            onSubmit={(e) => { e.preventDefault(); onCommitRename(); }}
            className="flex items-center gap-1"
          >
            <Input
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              className="h-7 text-sm"
              autoFocus
              onBlur={onCommitRename}
              onKeyDown={(e) => e.key === 'Escape' && onCancelRename()}
            />
          </form>
        ) : (
          <button
            className="flex items-center gap-1.5 text-sm font-medium text-foreground truncate w-full text-left group/title hover:underline"
            onClick={onStartRename}
            title="Click to rename"
          >
            <span className="truncate">{col.title}</span>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
          </button>
        )}
      </div>

      {/* Task count badge */}
      <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0 tabular-nums">
        {count}
      </span>

      {/* Delete */}
      <button
        onClick={onDelete}
        disabled={!canDelete}
        className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors shrink-0"
        aria-label={`Delete column ${col.title}`}
        title={!canDelete ? 'Must have at least one column' : `Delete "${col.title}"`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ColumnRowOverlay({ col, count }: { col: Column; count: number }) {
  const cs = getColumnColorStyle(col.color);
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border border-primary/30 bg-card shadow-lg ring-2 ring-primary/20">
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className={cn('w-5 h-5 rounded-full shrink-0', cs.dot)} />
      <span className="text-sm font-medium text-foreground truncate flex-1">{col.title}</span>
      <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0 tabular-nums">
        {count}
      </span>
    </div>
  );
}

// ---------- Color picker popover ----------

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const currentStyle = getColumnColorStyle(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn('w-5 h-5 rounded-full border-2 border-background ring-1 ring-border shrink-0 transition-transform hover:scale-110', currentStyle.dot)}
          aria-label="Change column color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start" side="bottom">
        <div className="grid grid-cols-3 gap-1.5">
          {AVAILABLE_COLUMN_COLORS.map((c) => {
            const s = getColumnColorStyle(c.token);
            const isActive = c.token === value;
            return (
              <button
                key={c.token}
                onClick={() => { onChange(c.token); setOpen(false); }}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  isActive ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-muted',
                )}
                title={c.label}
              >
                <div className={cn('w-3 h-3 rounded-full shrink-0', s.dot)} />
                {c.label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
