import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Search, Upload, Images } from "lucide-react";
import {
  listOpportunities,
  listGalleryMedia,
  addGalleryMedia,
  updateGalleryMedia,
  deleteGalleryMedia,
  type GalleryMedia,
  type Opportunity,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { LoadingBlock, EmptyState } from "./shared";

const TABS = [
  { key: "galleries", label: "Event Galleries" },
  { key: "library", label: "Content Library" },
] as const;

/**
 * Private gallery files are stored as `storage:<path>` and signed on demand with a
 * short lifetime. Long-lived links could not be revoked when a photo is unpublished.
 */
const SIGNED_URL_TTL = 3600;
const STORAGE_PREFIX = "storage:";

/** Resolve a stored media reference into a currently-valid displayable URL. */
function useMediaSrc(mediaUrl: string): string | undefined {
  const [src, setSrc] = useState<string | undefined>(
    mediaUrl.startsWith(STORAGE_PREFIX) ? undefined : mediaUrl,
  );
  useEffect(() => {
    let active = true;
    if (!mediaUrl.startsWith(STORAGE_PREFIX)) {
      setSrc(mediaUrl);
      return;
    }
    setSrc(undefined);
    supabase.storage
      .from("gallery")
      .createSignedUrl(mediaUrl.slice(STORAGE_PREFIX.length), SIGNED_URL_TTL)
      .then(({ data }) => {
        if (active && data?.signedUrl) setSrc(data.signedUrl);
      });
    return () => {
      active = false;
    };
  }, [mediaUrl]);
  return src;
}

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
  const [general, setGeneral] = useState(false);

  const events = (opps.data ?? []).filter((o) => o.kind === "event");

  if (opps.isLoading) return <LoadingBlock />;

  if (general) return <EventGallery event={null} onBack={() => setGeneral(false)} />;
  if (selected) return <EventGallery event={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        onClick={() => setGeneral(true)}
        className="rounded-2xl border-2 border-dashed border-baba-blue/25 bg-card p-5 text-left hover:border-baba-blue/50"
      >
        <Images className="h-6 w-6 text-baba-blue" />
        <h3 className="mt-2 font-display text-lg font-bold text-baba-slate">General media</h3>
        <p className="mt-1 text-xs text-baba-slate/50">
          Photos and videos that are not tied to a specific event.
        </p>
        <p className="mt-3 text-sm font-semibold text-baba-blue">Upload media →</p>
      </button>

      {events.length === 0 ? (
        <div className="sm:col-span-2">
          <EmptyState>
            No events yet. Create one in the Opportunities tab to give it its own gallery — or use
            General media to upload right away.
          </EmptyState>
        </div>
      ) : (
        events.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelected(e)}
            className="rounded-2xl border border-baba-blue/10 bg-card p-5 text-left hover:border-baba-blue/30"
          >
            <h3 className="font-display text-lg font-bold text-baba-slate">{e.title}</h3>
            <p className="mt-1 text-xs text-baba-slate/50">
              {e.event_date ? new Date(e.event_date).toLocaleDateString() : "—"}
              {e.completed ? " · completed" : ""}
            </p>
            <p className="mt-3 text-sm font-semibold text-baba-blue">Manage gallery →</p>
          </button>
        ))
      )}
    </div>
  );
}

function EventGallery({ event, onBack }: { event: Opportunity | null; onBack: () => void }) {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listGalleryMedia);
  const addFn = useServerFn(addGalleryMedia);
  const updateFn = useServerFn(updateGalleryMedia);
  const deleteFn = useServerFn(deleteGalleryMedia);
  const fileInput = useRef<HTMLInputElement>(null);

  const key = event?.id ?? "general";
  const q = useQuery({
    queryKey: ["gallery", key],
    queryFn: () => listFn(event ? { data: { opportunity_id: event.id } } : { data: {} }),
    select: (rows) => (event ? rows : rows.filter((r) => !r.opportunity_id)),
  });

  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["gallery", key] });
    queryClient.invalidateQueries({ queryKey: ["gallery-all"] });
  };

  const addMut = useMutation({
    mutationFn: (payload: { media_url: string; media_type: "image" | "video"; caption: string }) =>
      addFn({
        data: {
          ...(event ? { opportunity_id: event.id } : {}),
          media_url: payload.media_url,
          caption: payload.caption,
          media_type: payload.media_type,
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

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${key}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("gallery")
          .upload(path, file, { cacheControl: "31536000", upsert: false });
        if (upErr) throw new Error(upErr.message);
        // Store the object path, not a long-lived signed link: access is granted
        // per view so unpublishing/deleting actually revokes access.
        await addMut.mutateAsync({
          media_url: `${STORAGE_PREFIX}${path}`,
          media_type: file.type.startsWith("video") ? "video" : "image",
          caption: caption || file.name,
        });
      }
      toast.success("Upload complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

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
      <h2 className="font-display text-xl font-extrabold text-baba-blue">
        {event ? `${event.title} — gallery` : "General media"}
      </h2>

      {/* Upload from device */}
      <div className="mt-4 rounded-2xl border-2 border-dashed border-baba-blue/25 bg-card p-5 text-center">
        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload className="mx-auto h-6 w-6 text-baba-blue" />
        <p className="mt-2 text-sm font-semibold text-baba-slate">
          Upload photos or videos from your device
        </p>
        <p className="text-xs text-baba-slate/50">You can pick several files at once.</p>
        <button
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
          className="mt-3 inline-flex items-center gap-2 rounded-lg baba-cta px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploading ? "Uploading…" : "Choose files"}
        </button>
      </div>

      {/* Or paste a link */}
      <div className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl border border-baba-blue/10 bg-card p-4">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-baba-slate/60">
            Or paste a media link
          </span>
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
            onChange={(e) => setMediaType(e.target.value as "image" | "video")}
            className="rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </label>
        <button
          disabled={!url || addMut.isPending}
          onClick={() => addMut.mutate({ media_url: url, media_type: mediaType, caption })}
          className="flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {addMut.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add media
        </button>
      </div>

      {q.isLoading ? (
        <LoadingBlock />
      ) : media.length === 0 ? (
        <div className="mt-4">
          <EmptyState>No media yet. Upload photos or videos above.</EmptyState>
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
  const src = useMediaSrc(m.media_url);
  return (
    <div className="overflow-hidden rounded-xl border border-baba-blue/10 bg-card">
      {m.media_type === "video" ? (
        <video src={src} className="h-32 w-full object-cover" controls />
      ) : (
        <img src={src} alt={m.caption ?? ""} className="h-32 w-full object-cover" />
      )}
      <div className="p-3">
        <p className="truncate text-sm text-baba-slate">{m.caption || "Untitled"}</p>
        <div className="mt-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs text-baba-slate/60">
            <Switch checked={m.published} onCheckedChange={onTogglePublish} /> Published
          </label>
          <button onClick={onDelete} className="text-red-500" aria-label="Delete media">
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
            <LibraryCard key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryCard({ m }: { m: GalleryMedia }) {
  const src = useMediaSrc(m.media_url);
  return (
    <div className="overflow-hidden rounded-xl border border-baba-blue/10 bg-card">
      {m.media_type === "video" ? (
        <video src={src} className="h-28 w-full object-cover" />
      ) : (
        <img src={src} alt={m.caption ?? ""} className="h-28 w-full object-cover" />
      )}
      <p className="truncate p-2 text-xs text-baba-slate/70">{m.caption || "Untitled"}</p>
    </div>
  );
}
