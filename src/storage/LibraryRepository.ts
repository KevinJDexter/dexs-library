import { Preferences } from "@capacitor/preferences";
import { LibraryData } from "../domain/types";
import { DEFAULT_SETTINGS, migrate } from "./migrate";

const STORAGE_KEY = "dexs-library";
const BACKUP_KEY = `${STORAGE_KEY}-backup`;

export const emptyLibrary: () => LibraryData = () => ({
  version: 2,
  people: [
    { id: "user1", name: "Dexter" },
    { id: "user2", name: "Joy" },
    { id: "user3", name: "Doug" }
  ],
  lists: [],
  games: [],
  plays: [],
  expansions: {},
  settings: DEFAULT_SETTINGS,
})

export async function loadLibrary(): Promise<LibraryData> {
  const {value} = await Preferences.get({ key: STORAGE_KEY });
  if (!value) return emptyLibrary();
  try {
    return migrate(JSON.parse(value));
  } catch (err) {
    console.warn("Library could not be read. Saved a backup copy.", err);
    const existing = await Preferences.get({ key: BACKUP_KEY });
    if (!existing.value) {
      await Preferences.set({ key: BACKUP_KEY, value });
    }
    return emptyLibrary();
  }
}

export async function saveLibrary(data: LibraryData): Promise<void> {
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(data) })
}