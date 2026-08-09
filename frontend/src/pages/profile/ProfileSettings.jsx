import { useEffect, useState } from "react";
import api from "../../axiosClient";
import { Button, TextField } from "../../components/DataFields";
import { useToast } from "../../components/Popups";
import { accessLevelLabel, getAccessLevel } from "../../utils/accessControl";
import { getStoredUser, saveAuthSession } from "../../utils/authStorage";

const messageOf = (error) =>
  Object.values(error?.response?.data?.errors || {}).flat().join(" ") ||
  error?.response?.data?.message ||
  "Request failed.";

export const ProfileSettings = () => {
  const { showToast, ToastContainer } = useToast();
  const [user, setUser] = useState(getStoredUser());
  const [passwords, setPasswords] = useState({ old_password: "", new_password: "", new_password_confirmation: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => {
      if (!data.user) return;
      setUser(data.user);
      const token = localStorage.getItem("ACCESS_TOKEN") || sessionStorage.getItem("ACCESS_TOKEN");
      if (token) saveAuthSession({ token, user: data.user, rememberMe: Boolean(localStorage.getItem("ACCESS_TOKEN")) });
    }).catch(() => {});
  }, []);

  const changePassword = async () => {
    setSaving(true);
    try {
      await api.post("/auth/password/change", passwords);
      setPasswords({ old_password: "", new_password: "", new_password_confirmation: "" });
      showToast({ type: "success", message: "Password changed successfully." });
    } catch (error) {
      showToast({ type: "error", message: messageOf(error), duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      <header>
        <p className="text-sm font-semibold text-blue-600">Account</p>
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Profile & Security</h1>
        <p className="mt-1 text-sm text-slate-500">Your current identity, branch and login security.</p>
      </header>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111318]">
          <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Account details</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Name", user?.name], ["Username", user?.username], ["Email", user?.email],
              ["Phone", user?.phone], ["Role", user?.role?.name], ["Access level", `${getAccessLevel(user)} — ${accessLevelLabel(getAccessLevel(user))}`],
              ["Branch", user?.branch?.name || `Branch #${user?.branch_id}`], ["Status", user?.status],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-1 font-medium text-slate-900 dark:text-white">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111318]">
          <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Change password</h2>
          <div className="space-y-4">
            <TextField label="Current Password" type="password" value={passwords.old_password} onChange={(event) => setPasswords({ ...passwords, old_password: event.target.value })} fullWidth />
            <TextField label="New Password" type="password" value={passwords.new_password} onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })} fullWidth />
            <TextField label="Confirm New Password" type="password" value={passwords.new_password_confirmation} onChange={(event) => setPasswords({ ...passwords, new_password_confirmation: event.target.value })} fullWidth />
            <Button onClick={changePassword} disabled={saving || !passwords.old_password || !passwords.new_password}>{saving ? "Updating…" : "Change Password"}</Button>
          </div>
        </section>
      </div>
    </div>
  );
};
