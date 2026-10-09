import { useMemo, useState } from "react";
import { IonBadge, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonSearchbar, useIonActionSheet } from "@ionic/react";
import { BggRef, Game } from "../domain/types";
import { useLibrary } from "../state/libraryContext";
import { baseGamesByExpansion, expansionCounts } from "../logic/expansions";

const SEARCH_FROM = 10;

export default function ExpansionChecklist({ game }: { game: Game }) {
  const { data, actions } = useLibrary();
  const [presentActionSheet] = useIonActionSheet();
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');

  const catalog = game.expansionCatalog ?? [];
  const fits = useMemo(() => baseGamesByExpansion(data.games), [data.games]);
  const counts = expansionCounts(game, data.expansions);
  if (catalog.length === 0) return null;

  const tracked = catalog.filter(expansion => data.expansions[expansion.bggId]);
  const query = search.trim().toLowerCase();
  const rows = expanded
    ? catalog.filter(expansion => !query || expansion.name.toLowerCase().includes(query))
    : tracked;

  const gameOwnerId = game.ownership.kind === 'owned' ? game.ownership.ownerId : undefined;
  const people = [...data.people].sort((a, b) => Number(b.id === gameOwnerId) - Number(a.id === gameOwnerId));

  function choose(expansion: BggRef) {
    const current = data.expansions[expansion.bggId];
    presentActionSheet({
      header: expansion.name,
      buttons: [
        ...people.map(person => ({
          text: `Owned by ${person.name}`,
          handler: () => actions.markExpansionOwned(expansion, person.id),
        })),
        { text: 'Wanted', handler: () => actions.markExpansionWanted(expansion) },
        ...(current ? [{ text: 'Not owned', role: 'destructive', handler: () => actions.clearExpansion(expansion.bggId) }] : []),
        { text: 'Cancel', role: 'cancel' },
      ],
    });
  }

  return (
    <IonList inset>
      <IonListHeader>
        <IonLabel>Expansions</IonLabel>
      </IonListHeader>
      <IonItem button detail={false} onClick={() => setExpanded(!expanded)}>
        <IonLabel>
          {counts.owned} of {counts.total} owned{counts.wanted > 0 && `, ${counts.wanted} wanted`}
        </IonLabel>
        <IonNote slot="end" color="primary">{expanded ? 'Hide' : 'Show all'}</IonNote>
      </IonItem>

      {expanded && catalog.length >= SEARCH_FROM && (
        <IonSearchbar placeholder="Find an expansion" value={search} onIonInput={(e) => setSearch(e.detail.value ?? '')} />
      )}

      {rows.map(expansion => {
        const state = data.expansions[expansion.bggId];
        const owner = data.people.find(person => person.id === state?.ownerId);
        const alsoFits = (fits.get(expansion.bggId) ?? []).filter(base => base.bggId !== game.bggId);
        return (
          <IonItem key={expansion.bggId} button detail={false} onClick={() => choose(expansion)}>
            <IonLabel>
              <h3>{expansion.name}</h3>
              {alsoFits.length > 0 && <p>Also fits {alsoFits.map(base => base.name).join(', ')}</p>}
            </IonLabel>
            {state?.state === 'owned' && <IonBadge slot="end" color="success">{owner?.name ?? 'Owned'}</IonBadge>}
            {state?.state === 'wanted' && <IonBadge slot="end" color="warning">Wanted</IonBadge>}
          </IonItem>
        );
      })}
    </IonList>
  );
}