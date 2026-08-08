import { requireAdmin } from "@/lib/auth/require-admin";
import { getAllProfiles } from "@/lib/data/admin";
import { Avatar } from "@lore-addict/ui";
import { RoleSelect } from "@/components/admin/role-select";

export default async function UsersPage() {
  const admin = await requireAdmin("MANAGE_USERS");
  const profiles = await getAllProfiles();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-medium text-paper">Users</h1>

      <div className="overflow-hidden rounded-bubble border border-plum-deep">
        <table className="w-full text-sm">
          <thead className="bg-ink-raised text-left text-mute">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-t border-plum-deep">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={profile.avatar_url} name={profile.display_name} size={28} />
                    <div>
                      <p className="text-paper">{profile.display_name}</p>
                      <p className="text-xs text-mute">@{profile.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-mute">
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <RoleSelect
                    userId={profile.id}
                    currentRole={profile.role}
                    disabled={profile.id === admin.id}
                  />
                  {profile.id === admin.id && (
                    <p className="mt-1 text-xs text-mute">Can&apos;t change your own role</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
