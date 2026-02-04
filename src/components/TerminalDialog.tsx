import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface TerminalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TerminalLine {
  type: 'input' | 'output';
  content: string;
}

const TerminalDialog = ({ open, onOpenChange }: TerminalDialogProps) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'Welcome to beirùt\'s terminal. Type "help" for commands.' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const command = cmd.toLowerCase().trim();
    let response: string;

    switch (command) {
      case 'help':
        response = `Available commands:
  1. server  - Discord server invite
  2. about   - About me
  3. webinfo - Website information
  4. discord - My Discord username
  5. clear   - Clear terminal`;
        break;
      case 'server':
        response = '🎮 Discord Server: discord.gg/dolares';
        break;
      case 'about':
        response = `👤 About Me:
  Name: Fernando
  Age: 18
  Profession: Graphic Design / Web Development`;
        break;
      case 'webinfo':
        response = `🌐 Website Info:
  Inspiration: cursi.ng
  Created by: beirùt`;
        break;
      case 'discord':
        response = '💬 Discord: lockfile';
        break;
      case 'clear':
        setHistory([{ type: 'output', content: 'Terminal cleared. Type "help" for commands.' }]);
        setInput('');
        return;
      default:
        response = `Command not found: "${command}". Type "help" for available commands.`;
    }

    setHistory(prev => [
      ...prev,
      { type: 'input', content: `> ${cmd}` },
      { type: 'output', content: response },
    ]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      handleCommand(input);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-0 text-foreground max-w-md p-0 overflow-hidden">
        <div className="bg-background/80 px-3 py-2 border-b border-border/30 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-muted-foreground font-mono">terminal</span>
        </div>
        <div 
          ref={containerRef}
          className="p-3 font-mono text-xs max-h-64 overflow-y-auto space-y-1"
        >
          {history.map((line, index) => (
            <div 
              key={index} 
              className={line.type === 'input' ? 'text-primary' : 'text-muted-foreground whitespace-pre-wrap'}
            >
              {line.content}
            </div>
          ))}
          <div className="flex items-center gap-1">
            <span className="text-primary">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-foreground font-mono"
              placeholder="type a command..."
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TerminalDialog;
