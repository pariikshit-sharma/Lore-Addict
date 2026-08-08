"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import type { JSONContent } from "@tiptap/react";
import {
  Button,
  Input,
  Textarea,
  Badge,
} from "@lore-addict/ui";
import { MediaUploader } from "./media-uploader";
import { RoleGate } from "./role-gate";
import {
  saveArticleAction,
  autosaveRevisionAction,
  publishArticleAction,
  scheduleArticleAction,
  archiveArticleAction,
  type ArticleActionResult,
} from "@/actions/articles";

// Tiptap (editor core + ProseMirror + extensions) is a meaningful chunk of
// JS that only ever matters on this one CMS route — deferring it behind a
// dynamic import means the rest of the editor form (title, metadata,
// publish controls) paints immediately without waiting on it, and
// ssr: false because Tiptap explicitly isn't meant to render server-side.
const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[460px] animate-pulse rounded-bubble border border-plum-deep bg-ink-raised" />
    ),
  },
);
import type { UserRole, ArticleType } from "@lore-addict/types";

export interface ArticleEditorProps {
  article: {
    id: string;
    title: string;
    subtitle: string | null;
    excerpt: string | null;
    content_json: JSONContent;
    type: ArticleType;
    category_id: string | null;
    cover_image_url: string | null;
    cover_image_alt: string | null;
    contains_spoilers: boolean;
    spoiler_scope: string | null;
    seo_title: string | null;
    seo_description: string | null;
    status: string;
  };
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
  selectedTagIds: string[];
  role: UserRole;
}

const ARTICLE_TYPES: ArticleType[] = [
  "news",
  "review",
  "theory",
  "editorial",
  "listicle",
  "recap",
];

const initialState: ArticleActionResult = {};

export function ArticleEditor({
  article,
  categories,
  tags,
  selectedTagIds,
  role,
}: ArticleEditorProps) {
  // Three independent useActionState hooks, one per status-changing
  // action. Each gets its own pending/error state, and — critically —
  // each now runs persistArticleFields first (see actions/articles.ts),
  // so every one of these buttons saves the current form before doing
  // anything else. Previously Publish and Schedule bypassed saving
  // entirely by submitting through a `formAction` override that pointed
  // at an action taking only an articleId — that's the bug this fixes.
  const [saveState, saveFormAction, isSaving] = useActionState(
    saveArticleAction.bind(null, article.id),
    initialState,
  );
  const [publishState, publishFormAction, isPublishing] = useActionState(
    publishArticleAction.bind(null, article.id),
    initialState,
  );
  const [scheduleState, scheduleFormAction, isScheduling] = useActionState(
    scheduleArticleAction.bind(null, article.id),
    initialState,
  );

  const [contentJson, setContentJson] = useState<JSONContent>(article.content_json);
  const [coverImageUrl, setCoverImageUrl] = useState(article.cover_image_url ?? "");
  const [containsSpoilers, setContainsSpoilers] = useState(article.contains_spoilers);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(selectedTagIds));
  const [lastAutosave, setLastAutosave] = useState<Date | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  async function handleAutosave(json: JSONContent) {
    const result = await autosaveRevisionAction(article.id, json);
    if (result.ok) setLastAutosave(new Date());
  }

  function toggleTag(id: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Local ISO string one minute from now, formatted for a
  // datetime-local input's min attribute — schedules must be future dates.
  const minSchedule = new Date(Date.now() + 60_000).toISOString().slice(0, 16);

  return (
    <form action={saveFormAction} className="grid grid-cols-3 gap-8">
      <input type="hidden" name="contentJson" value={JSON.stringify(contentJson)} />

      <div className="col-span-2 flex flex-col gap-4">
        <Input
          name="title"
          defaultValue={article.title}
          placeholder="Article title"
          className="h-auto border-none bg-transparent px-0 font-display text-3xl font-semibold focus-visible:ring-0"
          required
        />
        {(saveState.fieldErrors?.title ?? publishState.fieldErrors?.title ?? scheduleState.fieldErrors?.title) && (
          <p className="text-xs text-danger">
            {saveState.fieldErrors?.title ?? publishState.fieldErrors?.title ?? scheduleState.fieldErrors?.title}
          </p>
        )}

        <Input
          name="subtitle"
          defaultValue={article.subtitle ?? ""}
          placeholder="Subtitle (optional)"
          className="h-auto border-none bg-transparent px-0 font-body text-lg text-mute focus-visible:ring-0"
        />

        <RichTextEditor
          initialContent={article.content_json}
          onChange={setContentJson}
          onAutosave={handleAutosave}
        />
        {(saveState.fieldErrors?.contentJson ?? publishState.fieldErrors?.contentJson ?? scheduleState.fieldErrors?.contentJson) && (
          <p className="text-xs text-danger">
            {saveState.fieldErrors?.contentJson ?? publishState.fieldErrors?.contentJson ?? scheduleState.fieldErrors?.contentJson}
          </p>
        )}
        <p className="text-xs text-mute">
          {lastAutosave
            ? `Autosaved ${lastAutosave.toLocaleTimeString()}`
            : "Not autosaved yet"}
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-mute">Excerpt</label>
          <Textarea
            name="excerpt"
            defaultValue={article.excerpt ?? ""}
            placeholder="Shown on cards and used as the meta description fallback"
            rows={3}
          />
        </div>
      </div>

      <aside className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <RoleGate role={role} permission="PUBLISH_ANY_ARTICLE">
            <Button
              type="submit"
              formAction={publishFormAction}
              disabled={isPublishing}
              className="w-full"
            >
              {isPublishing ? "Publishing…" : "Publish"}
            </Button>
          </RoleGate>

          <Button type="submit" variant="secondary" disabled={isSaving} className="w-full">
            {isSaving ? "Saving…" : "Save draft"}
          </Button>

          <RoleGate role={role} permission="PUBLISH_ANY_ARTICLE">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowSchedule((v) => !v)}
              className="w-full"
            >
              {showSchedule ? "Cancel scheduling" : "Schedule…"}
            </Button>
            {showSchedule && (
              <div className="flex flex-col gap-2 rounded-bubble border border-plum-deep p-3">
                <label htmlFor="scheduledFor" className="text-xs text-mute">
                  Publish at
                </label>
                <Input
                  id="scheduledFor"
                  name="scheduledFor"
                  type="datetime-local"
                  min={minSchedule}
                  className="text-sm"
                />
                <Button
                  type="submit"
                  formAction={scheduleFormAction}
                  disabled={isScheduling}
                  size="sm"
                >
                  {isScheduling ? "Scheduling…" : "Confirm schedule"}
                </Button>
                {scheduleState.error && (
                  <p className="text-xs text-danger">{scheduleState.error}</p>
                )}
              </div>
            )}
          </RoleGate>

          <RoleGate role={role} permission="EDIT_ANY_ARTICLE">
            <Button
              type="submit"
              variant="ghost"
              formAction={archiveArticleAction.bind(null, article.id)}
              className="w-full text-danger"
            >
              Archive
            </Button>
          </RoleGate>
        </div>

        {(saveState.error ?? publishState.error) && (
          <p className="text-sm text-danger">{saveState.error ?? publishState.error}</p>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-mute">Type</label>
          <select
            name="type"
            defaultValue={article.type}
            className="h-10 rounded-bubble border border-plum-deep bg-ink px-3 text-sm text-paper"
          >
            {ARTICLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-mute">Category</label>
          <select
            name="categoryId"
            defaultValue={article.category_id ?? ""}
            className="h-10 rounded-bubble border border-plum-deep bg-ink px-3 text-sm text-paper"
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-mute">Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
              >
                <Badge variant={selectedTags.has(tag.id) ? "category" : "default"}>
                  {tag.name}
                </Badge>
              </button>
            ))}
          </div>
          {Array.from(selectedTags).map((id) => (
            <input key={id} type="hidden" name="tagIds" value={id} />
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-mute">Cover image</label>
          <MediaUploader
            bucket="covers"
            value={coverImageUrl}
            onUploaded={setCoverImageUrl}
          />
          <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
          <Input
            name="coverImageAlt"
            defaultValue={article.cover_image_alt ?? ""}
            placeholder="Alt text"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-paper">
            <input
              type="checkbox"
              name="containsSpoilers"
              checked={containsSpoilers}
              onChange={(e) => setContainsSpoilers(e.target.checked)}
            />
            Contains spoilers
          </label>
          {containsSpoilers && (
            <Input
              name="spoilerScope"
              defaultValue={article.spoiler_scope ?? ""}
              placeholder="e.g. up to episode 12"
            />
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-plum-deep pt-4">
          <p className="text-sm font-medium text-paper">SEO</p>
          <Input
            name="seoTitle"
            defaultValue={article.seo_title ?? ""}
            placeholder="SEO title override (optional)"
          />
          <Textarea
            name="seoDescription"
            defaultValue={article.seo_description ?? ""}
            placeholder="Meta description override (optional)"
            rows={2}
          />
        </div>
      </aside>
    </form>
  );
}
