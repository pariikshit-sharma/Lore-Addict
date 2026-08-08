// @lore-addict/types — shared TypeScript types across every app in the workspace.
//
// `database.types.ts` is provisional hand-authored output (see that file's
// header comment) until a live Supabase project lets `pnpm db:types`
// generate it for real. Exported here the same way either way, so no
// consuming code changes when that swap happens.
export type {
  Database,
  UserRole,
  ArticleStatus,
  ArticleType,
  CommentStatus,
  ArticleEventType,
} from "./database.types";
