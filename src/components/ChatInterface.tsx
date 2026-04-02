import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import type { SoulInteraction } from "@/lib/contracts/SoulPets";

interface ChatInterfaceProps {
  tokenId: string;
  history: SoulInteraction[];
  isChatting: boolean;
  onSendMessage: (tokenId: string, message: string) => Promise<any>;
  lastResponse?: string | null;
}

export function ChatInterface({ tokenId, history, isChatting, onSendMessage, lastResponse }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const canSend = message.length >= 5 && message.length <= 500 && !isChatting;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isChatting]);

  const handleSend = async () => {
    if (!canSend) return;
    const msg = message;
    setMessage("");
    await onSendMessage(tokenId, msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canSend) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="soul-card flex flex-col h-[500px]">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          💬 Soul-Link Chat
        </h3>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 && !isChatting && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Start chatting with your pet to build your soul bond!
          </div>
        )}

        {history.map((interaction, i) => (
          <div key={i} className="space-y-2">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm">
                {interaction.message}
              </div>
            </div>
            {/* Pet response */}
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-bl-sm bg-secondary text-secondary-foreground text-sm">
                {interaction.response}
              </div>
            </div>
          </div>
        ))}

        {isChatting && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl rounded-bl-sm bg-secondary text-muted-foreground text-sm flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Pet is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message to your pet..."
              maxLength={500}
              rows={2}
              className="resize-none bg-muted border-border text-foreground placeholder:text-muted-foreground pr-16"
            />
            <span className={`absolute bottom-2 right-3 text-xs ${message.length < 5 ? "text-destructive" : "text-muted-foreground"}`}>
              {message.length}/500
            </span>
          </div>
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className="self-end bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10"
          >
            {isChatting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {message.length > 0 && message.length < 5 && (
          <p className="text-xs text-destructive mt-1">
            Need {5 - message.length} more character{5 - message.length > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
