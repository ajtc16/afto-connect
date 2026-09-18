import { getOwnerContext } from "@/lib/data/dashboard";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { Card } from "@/components/ui/Card";

export default async function ProfileEditorPage() {
  const ctx = await getOwnerContext();
  if (!ctx) return null;
  const profile = ctx.profiles[0];

  if (!profile) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center text-muted">
        No hay un perfil para editar todavía.
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Editar perfil</h1>
        <p className="text-sm text-muted">
          Los cambios se reflejan al instante en tu perfil público.
        </p>
      </div>
      <ProfileEditor profile={profile} />
    </div>
  );
}
