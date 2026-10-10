import { useState } from "react";
import { useIonActionSheet, useIonToast } from "@ionic/react";
import { Game, Ownership, PersonId } from "../domain/types";
import { BggClient, BggGameDetails, BggSearchResult } from "../services/bgg";
import { bggClient } from "../services/bggXmlClient";
import { useLibrary } from "../state/libraryContext";

export const WISHLIST = 'wishlist';

export type AddTarget = PersonId | typeof WISHLIST;

const inTarget = (game: Game, target: AddTarget) => (
  target === WISHLIST
    ? game.ownership.kind === WISHLIST
    : game.ownership.kind === 'owned' && game.ownership.ownerId === target
)

export function useAddGame(client: BggClient = bggClient) {
  const { data, actions } = useLibrary();
  const [adding, setAdding] = useState<number[]>([]); // bggIds being added right now
  const [presentToast, dismissToast] = useIonToast();
  const [presentActionSheet] = useIonActionSheet();

  const personName = (personId: PersonId) => data.people.find(person => person.id === personId)?.name ?? 'someone';
  const targetName = (target: AddTarget) => (
    target === WISHLIST ? 'the wishlist' : `${personName(target)}'s games`
  );

  async function toast(message: string, failed = false) {
    await dismissToast();
    presentToast(failed ? { message, duration: 3000, color: 'danger' } : { message, duration: 1000 });
  }

  function expansionHolders(bggId: number, target: AddTarget): PersonId[] {
    const people = target === WISHLIST ? data.people.map(person => person.id) : [target];
    const state = target === WISHLIST ? 'wanted' : 'owned';
    return people.filter(personId => data.expansions[personId]?.[bggId]?.state === state);
  }

  const isAdded = (bggId: number, target: AddTarget) => (
    data.games.some(game => game.bggId === bggId && inTarget(game, target)) || expansionHolders(bggId, target).length > 0
  )

  function remove(item: BggSearchResult, target: AddTarget) {
    data.games
      .filter(game => game.bggId === item.bggId && inTarget(game, target))
      .forEach(game => actions.removeGame(game.id));
    expansionHolders(item.bggId, target).forEach(personId => actions.clearExpansion(personId, item.bggId));
    toast(`${item.name} removed from ${targetName(target)}`);
  }

  function askWhose(name: string): Promise<PersonId | null> {
    if (data.people.length === 1) return Promise.resolve(data.people[0].id);
    return new Promise(resolve => {
      presentActionSheet({
        header: `Who wants ${name}`,
        buttons: [
          ...data.people.map(person => ({ text: person.name, handler: () => resolve(person.id) })),
          { text: 'Cancel', role: 'cancel' }
        ],
        onDidDismiss: () => resolve(null)
      })
    })
  }

  async function addExpansion(item: BggSearchResult, target: AddTarget): Promise<boolean> {
    const ref = { bggId: item.bggId, name: item.name };
    if (target === WISHLIST) {
      const personId = await askWhose(item.name);
      if (!personId) return false;
      actions.markExpansionWanted(personId, ref);
      toast( `${item.name} added to ${personName(personId)}'s wanted expansions`)
    } else {
      actions.markExpansionOwned(target, ref);
      toast(`${item.name} added to ${personName(target)}'s expansions`)
    }
    return true;
  }

  async function addGame(game: BggSearchResult, target: AddTarget, knownDetails?: BggGameDetails, asGame = false): Promise<boolean> {
    if (adding.includes(game.bggId)) return false;
    setAdding(ids => [...ids, game.bggId]);
    try {
      const details = knownDetails ?? await client.getDetails(game.bggId);
      if (details.isExpansion && !asGame) return await addExpansion(game, target);

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

  return { adding, addGame, isAdded, remove, targetName };
}