import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { signOut, updateProfile } from "@/lib/auth-service";

const MAX_AVATAR_SIZE_MB = 2;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, refresh } = useAuth();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName ?? "");
    setCompany(user.company ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-16 text-center">
          <p className="text-muted-foreground">Sign in to view your profile.</p>
          <Link to="/auth" className="glass-pill mt-6 inline-block rounded-full px-6 py-3 font-medium">
            Sign in
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const uploadAvatar = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error(`Avatar must be ${MAX_AVATAR_SIZE_MB}MB or smaller.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-muted-foreground">Manage your account details and quick settings.</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Account email</p>
          <p className="mt-1 text-lg font-semibold">{user.email}</p>

          <p className="mt-5 text-xs uppercase tracking-wide text-muted-foreground">Current plan</p>
          <p className="mt-1 text-lg font-semibold capitalize">{user.billingTier ?? "free"}</p>
        </div>

        <form
          className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              await updateProfile({ fullName, company, avatarUrl });
              await refresh();
              toast.success("Profile updated.");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Could not update profile.");
            } finally {
              setSaving(false);
            }
          }}
        >
          <h2 className="font-semibold">Edit profile</h2>

          <div className="mt-4 flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar preview" className="h-16 w-16 rounded-full border border-white/20 object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 text-xs text-muted-foreground">
                No photo
              </div>
            )}
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadAvatar(e.currentTarget.files?.[0] ?? null)}
                className="block text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/15 file:px-3 file:py-1.5 file:text-primary"
              />
              {avatarUrl ? (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="text-sm text-muted-foreground underline decoration-dotted underline-offset-4"
                >
                  Remove photo
                </button>
              ) : null}
            </div>
          </div>

          <label className="mt-5 block text-sm text-muted-foreground">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={120}
            className="mt-2 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none transition focus:border-primary"
            placeholder="Your name"
          />

          <label className="mt-4 block text-sm text-muted-foreground">Company</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            maxLength={120}
            className="mt-2 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none transition focus:border-primary"
            placeholder="Your company (optional)"
          />

          <button type="submit" disabled={saving} className="glass-pill mt-6 rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60">
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/app" className="glass-subtle rounded-full px-5 py-2.5 text-sm font-medium">
            Dashboard
          </Link>
          <Link to="/billing" className="glass-subtle rounded-full px-5 py-2.5 text-sm font-medium">
            Plans & billing
          </Link>
          <Link to="/analytics" className="glass-subtle rounded-full px-5 py-2.5 text-sm font-medium">
            Analytics
          </Link>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              await refresh();
              navigate("/auth");
            }}
            className="rounded-full border border-destructive/40 px-5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            Sign out
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Profile;
