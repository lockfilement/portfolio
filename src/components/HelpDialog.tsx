import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HelpDialog = ({ open, onOpenChange }: HelpDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-0 text-foreground max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium">About</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-xs text-muted-foreground">
          <p>
            A minimalist personal portfolio showcasing my work and interests.
          </p>
          <div className="space-y-1">
            <p className="text-foreground/80">Features:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Discord status integration</li>
              <li>Music player with current rotation</li>
              <li>Project showcase</li>
            </ul>
          </div>
          <p className="text-muted-foreground/60 pt-2 border-t border-border/30">
            Built with React & TypeScript
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
