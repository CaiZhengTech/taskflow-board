import { BOARD_PRESETS } from '@/stores/workspaceStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Layers, Code, Megaphone, FileText, LayoutGrid } from 'lucide-react';

const presetIcons: Record<string, typeof Code> = {
  sdlc: Code,
  marketing: Megaphone,
  content: FileText,
  kanban: LayoutGrid,
};

interface BoardPresetsProps {
  activePreset: string | null;
  onSelectPreset: (presetId: string) => void;
}

export function BoardPresets({ activePreset, onSelectPreset }: BoardPresetsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          Templates
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Board Templates</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {BOARD_PRESETS.map((preset) => {
          const Icon = presetIcons[preset.id] || LayoutGrid;
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{preset.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{preset.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {preset.labels.slice(0, 3).map((label) => (
                      <span
                        key={label}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
