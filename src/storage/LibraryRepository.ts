import { Preferences } from "@capacitor/preferences";
import { LibraryData } from "../domain/types";

const STORAGE_KEY = "dexs-library";

export const emptyLibrary: () => LibraryData = () => ({
  version: 1,
  people: [
    { id: "dexter", name: "Dexter" },
    { id: "joy", name: "Joy" },
    { id: "doug", name: "Doug" }
  ],
  lists: [],
  games: []
})

export async function loadLibrary(): Promise<LibraryData> {
  const {value} = await Preferences.get({ key: STORAGE_KEY });
  if (!value) return emptyLibrary();
  try {
    return JSON.parse(value) as LibraryData;
  } catch {
    console.warn("Library could not be read.");
    return emptyLibrary();
  }
}

export async function saveLibrary(data: LibraryData): Promise<void> {
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(data) })
}