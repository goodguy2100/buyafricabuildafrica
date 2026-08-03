import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { messageMembers } from "@/lib/admin.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function MessageMembersDialog({
  open,
  ids,
  names,
  onClose,
}: {
  open: boolean;
  ids: string[];
  names: string[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const sendFn = useServerFn(messageMembers);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [messageType, setMessageType] = useState<"text" | "popup" | "email" | "all">("text");

  const mutation = useMutation({
    mutationFn: () => sendFn({ data: { ids, title, body, message_type: messageType } }),
    onSuccess: () => {
      toast.success(`Message sent to ${ids.length} member${ids.length === 1 ? "" : "s"}`);
      setTitle("");
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Message {ids.length} member{ids.length === 1 ? "" : "s"}</DialogTitle>
          <DialogDescription>
            {names.slice(0, 4).join(", ")}
            {names.length > 4 ? ` +${names.length - 4} more` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-baba-slate/50">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
              placeholder="Subject of your message"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-baba-slate/50">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
              placeholder="Write your message…"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-baba-slate/50">
              Delivery
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as typeof messageType)}
              className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
            >
              <option value="text">Text announcement</option>
              <option value="popup">Pop-up alert</option>
              <option value="email">Email</option>
              <option value="all">All of the above</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="rounded-lg border-2 border-baba-blue/15 px-4 py-2 text-sm font-semibold text-baba-blue"
            >
              Cancel
            </button>
            <button
              disabled={!title || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
