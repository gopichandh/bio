/**
 * Lightweight global achievement system.
 *
 * Any component can call `unlockAchievement(id, label)` to fire a toast and
 * record the achievement (deduped in sessionStorage). The <Achievements />
 * component listens for the event and renders the toast notifications.
 */

export type Achievement = {
  id: string;
  label: string;
};

const STORE_KEY = "vm-achievements";

export const getUnlocked = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const unlockAchievement = (id: string, label: string) => {
  const unlocked = getUnlocked();
  if (unlocked.includes(id)) return; // already earned this session
  unlocked.push(id);
  sessionStorage.setItem(STORE_KEY, JSON.stringify(unlocked));
  window.dispatchEvent(
    new CustomEvent<Achievement>("achievement", { detail: { id, label } })
  );
};
