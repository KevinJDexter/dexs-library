import { useState } from "react";
import { useIonToast } from "@ionic/react";
import { Ownership, PersonId } from "../domain/types";
import { BggClient, BggGameDetails, BggSearchResult } from "../services/bgg";
import { bggClient } from "../services/bggXmlClient";
import { useLibrary } from "../state/libraryContext";

export const WISHLIST = 'wishlist';

/** Where a new game goes: someone's library, or the wishlist. */
export type AddTarget = PersonId | typeof WISHLIST;

/** Adding a game from BGG, shared by search and the related-game previews. */
export function useAddGame(client: BggClient = bggClient) {
  const { data, actions } = useLibrary();
  const [adding, setAdding] = useState<number[]>([]); // bggIds being added right now
  const [presentToast, dismissToast] = useIonToast();

  const targetName = (target: AddTarget) => (
    target === WISHLIST ? 'the wishlist' : `${data.people.find(person => person.id === target)?.name ?? 'their'}'s games`
  );

  /** Pass details when you already have them (a preview did); otherwise they're fetched. Resolves to whether it worked. */
  async function addGame(game: BggSearchResult, target: AddTarget, knownDetails?: BggGameDetails): Promise<boolean> {
    if (adding.includes(game.bggId)) return false;
    setAdding(ids => [...ids, game.bggId]);
    try {
      const details = knownDetails ?? await client.getDetails(game.bggId);
      const ownership: Ownership = target === WISHLIST ? { kind: 'wishlist' } : { kind: 'owned', ownerId: target };
      actions.addGame({
        ...details,
        ownership,
        favorite: false,
        addedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString(),
      });
      await dismissToast();
      presentToast(`${game.name} added to ${targetName(target)}`, 1000);
      return true;
    } catch (err) {
      await dismissToast();
      presentToast({ message: `Couldn't add ${game.name}: ${(err as Error).message}`, duration: 3000, color: 'danger' });
      return false;
    } finally {
      setAdding(ids => ids.filter(id => id !== game.bggId));
    }
  }

  return { adding, addGame, targetName };
}