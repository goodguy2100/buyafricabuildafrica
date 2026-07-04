import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Search } from "lucide-react";
import {
  listOpportunities,
  listGalleryMedia,
  addGalleryMedia,
  updateGalleryMedia,
  deleteGalleryMedia,
  type GalleryMedia,
  type Opportunity,
} from "@/lib/admin.functions";
import { Switch } from "@/components/ui/switch";
import { LoadingBlock, EmptyState } from "./shared";

const TABS = [
  { key: "galleries", label: "Event Galleries" },
  { key: "library", label: "Content Library" },
] as const;

export function GallerySection() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("galleries");
  return (
    <div>
      <div className="mb-5 inline-flex rounded-xl border border-baba-blue/15 bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === t.key ? "baba-cta text-white" : "text-baba-slate/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "galleries" ? <GalleriesTab /> : <LibraryTab />}
    </div>
  );
}

function GalleriesTab() {
  const oppsFn = useServerFn(listOpportunities);
  const opps = useQuery({ queryKey: ["admin-opportunities"], queryFn: () => oppsFn() });
  const [selected, setSelected] = useState<Opportunity | null>(null);

  const completedEvents = (opps.data ?? []).filter((o) => o.kind === "event" && o.completed);

  if (opps.isLoading) return <LoadingBlock />;

  if (selected) {
    return <EventGallery event={selected} onBack={() => setSelected(null)} />;
  }

  return completedEvents.length === 0 ? (
    <EmptyState>
      No completed events yet. Mark an event as completed in the Opportunities tab to build its
      gallery.
    </EmptyState>
  ) : (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {completedEvents.map((e) => (
        <button
          key={e.id}
          onClick={() => setSelected(e)}
          className="rounded-2xl border border-baba-blue/10 bg-card p-5 text-left hover:border-baba-blue/30"
        >
          <h3 className="font-display text-lg font-bold text-baba-slate">{e.title}</h3>
          <p className="mt-1 text-xs text-baba-slate/50">
            {e.event_date ? new Date(e.event_date).toLocaleDateString() : "—"}
          </p>
          <p className="mt-3 text-sm font-semibold text-baba-blue">Manage gallery →</p>
        </button>
      ))}
    </div>
  );
}

function EventGallery({ event, onBack }: { event: Opportunity; onBack: () => void }) {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listGalleryMedia);
  const addFn = useServerFn(addGalleryMedia);
  const updateFn = useServerFn(updateGalleryMedia);
  const deleteFn = useServerFn(deleteGalleryMedia);

  const q = useQuery({
    queryKey: ["gallery", event.id],
    queryFn: () => listFn({ data: { opportunity_id: event.id } }),
  });

  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["gallery", event.id] });

  const addMut = useMutation({
    mutationFn: () =>
      addFn({
        data: {
          opportunity_id: event.id,
          media_url: url,
          caption,
          media_type: mediaType,
          published: false,
        },
      }),
    onSuccess: () => {
      toast.success("Media added");
      setUrl("");
      setCaption("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pubMut = useMutation({
    mutationFn: (v: { id: string; published: boolean }) => updateFn({ data: v }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Media deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const media = q.data ?? [];

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm font-semibold text-baba-blue">
        ← Back to galleries
      </button>
      <h2 className="font-display text-xl font-extrabold text-baba-blue">{event.title} — gallery</h2>

      <div className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl border border-baba-blue/10 bg-card p-4">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-baba-slate/60">Media URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="w-64 rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-baba-slate/60">Caption</span>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-48 rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-baba-slate/60">Type</span>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as any)}
            className="rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </label>
        <button
          disabled={!url || addMut.isPending}
          onClick={() => addMut.mutate()}
          className="flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {addMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add media
        </button>
      </div>

      {q.isLoading ? (
        <LoadingBlock />
      ) : media.length === 0 ? (
        <div className="mt-4">
          <EmptyState>No media yet. Add photos or videos above.</EmptyState>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {media.map((m) => (
            <MediaCard
              key={m.id}
              m={m}
              onTogglePublish={(pub) => pubMut.mutate({ id: m.id, published: pub })}
              onDelete={() => delMut.mutate(m.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaCard({
  m,
  onTogglePublish,
  onDelete,
}: {
  m: GalleryMedia;
  onTogglePublish: (pub: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-baba-blue/10 bg-card">
      {m.media_type === "video" ? (
        <video src={m.media_url} className="h-32 w-full object-cover" controls />
      ) : (
        <img src={m.media_url} alt={m.caption ?? ""} className="h-32 w-full object-cover" />
      )}
      <div className="p-3">
        <p className="truncate text-sm text-baba-slate">{m.caption || "Untitled"}</p>
        <div className="mt-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs text-baba-slate/60">
            <Switch checked={m.published} onCheckedChange={onTogglePublish} /> Published
          </label>
          <button onClick={onDelete} className="text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LibraryTab() {
  const listFn = useServerFn(listGalleryMedia);
  const q = useQuery({ queryKey: ["gallery-all"], queryFn: () => listFn({ data: {} }) });
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const media = (q.data ?? []).filter((m) => {
    if (type !== "all" && m.media_type !== type) return false;
    if (search && !`${m.title ?? ""} ${m.caption ?? ""}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  if (q.isLoading) return <LoadingBlock />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-baba-slate/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title/caption…"
            className="rounded-lg border border-baba-blue/15 bg-card py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
        >
          <option value="all">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>
      {media.length === 0 ? (
        <EmptyState>No media in the library.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {media.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-xl border border-baba-blue/10 bg-card">
              {m.media_type === "video" ? (
                <video src={m.media_url} className="h-28 w-full object-cover" />
              ) : (
                <img src={m.media_url} alt={m.caption ?? ""} className="h-28 w-full object-cover" />
              )}
              <p className="truncate p-2 text-xs text-baba-slate/70">{m.caption || "Untitled"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
