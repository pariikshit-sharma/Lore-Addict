import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdSlots } from "@/lib/data/admin";
import { AdSlotForm } from "@/components/admin/ad-slot-form";
import { AdSlotToggle } from "@/components/admin/ad-slot-toggle";
import { deleteAdSlotAction } from "@/actions/admin";
import { Button } from "@lore-addict/ui";

export default async function SettingsPage() {
  await requireAdmin("MANAGE_AD_SLOTS");
  const slots = await getAdSlots();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-display text-2xl font-medium text-paper">
        Site settings
      </h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-paper">Ad slots</h2>
        <p className="text-xs text-mute">
          This manages the inventory of named ad placements and which
          provider serves them. Actually rendering ads requires wiring a
          real ad network's script into the placements below — that
          integration isn't built, since there's no live network account
          to integrate against yet.
        </p>

        <AdSlotForm />

        <ul className="flex flex-col divide-y divide-plum-deep rounded-bubble border border-plum-deep">
          {slots.map((slot) => (
            <li key={slot.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-paper">{slot.name}</p>
                <p className="text-xs text-mute">{slot.provider}</p>
              </div>
              <div className="flex items-center gap-3">
                <AdSlotToggle adSlotId={slot.id} isActive={slot.is_active} />
                <form action={deleteAdSlotAction.bind(null, slot.id)}>
                  <Button type="submit" variant="ghost" size="sm" className="text-danger">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))}
          {slots.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-mute">
              No ad slots yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
