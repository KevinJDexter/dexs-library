import { IonBadge, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonSearchbar, useIonActionSheet } from "@ionic/react";
import { BggRef, ExpansionState, Game } from "../domain/types";
import { useLibrary } from "../state/libraryContext";
import { useMemo, useState } from "react";
import { baseGamesByExpansion, expansionCounts } from "../logic/expansions";

const SEARCH_FROM = 10;

const CLEAR_LABEL: Record<ExpansionState['state'], string> = {
  owned: 'Not owned',
  wanted: 'Not wanted',
  hidden: 'Unhide',
}

export default function ExpansionChecklist({ game }: {game: Game}) {
  const { data, actions } = useLibrary();
  const [ presentActionSheet ] = useIonActionSheet();
  const [ expanded, setExpanded ] = useState(false);
  const [ search, setSearch ] = useState('');
  const [ showHidden, setShowHidden ] = useState(false);

  const ownerId = game.ownership.kind === 'owned' ? game.ownership.ownerId : undefined;
  const personExpansions = useMemo(() => (ownerId ? data.expansions[ownerId] ?? {} : {}), [ownerId, data.expansions]);
  const fits = useMemo(
    () => baseGamesByExpansion(data.games.filter(g => g.ownership.kind === 'owned' && g.ownership.ownerId === ownerId)),
    [data.games, ownerId]
  )

  const catalog = game.expansionCatalog ?? [];
  if (catalog.length === 0) return null;

  if (!ownerId) {
    return (
      <IonList inset>
        <IonListHeader>
          <IonLabel>Expansions</IonLabel>
        </IonListHeader>
        <IonItem>
          <IonLabel color="medium">
            {catalog.length} on BGG. Give this game an owner to track their expansions.
          </IonLabel>
        </IonItem>
      </IonList>
    )
  }

  const counts = expansionCounts(game, personExpansions);
  const query = search.trim().toLowerCase();
  const stateOf = (expansion: BggRef) => personExpansions[expansion.bggId]?.state;
  const rows = expanded
    ? catalog.filter(expansion => 
      (showHidden || stateOf(expansion) !== 'hidden')
      && (!query || expansion.name.toLowerCase().includes(query)))
    : catalog.filter(expansion => stateOf(expansion) === 'owned' || stateOf(expansion) === 'wanted')

  function choose(personId: string, expansion: BggRef) {
    const current = stateOf(expansion);
    presentActionSheet({
      header: expansion.name,
      buttons: [
        { text: 'Owned', handler: () => actions.markExpansionOwned(personId, expansion) },
        { text: 'Wanted', handler: () => actions.markExpansionWanted(personId, expansion) },
        ...(current !== 'hidden' ? [{ text: 'Hide', handler: () => actions.hideExpansion(personId, expansion)}] : []),
        ...(current ? [{ text: CLEAR_LABEL[current], role: 'destructive', handler: () => actions.clearExpansion(personId, expansion.bggId)}] : []),
        { text: 'Cancel', role: 'cancel'},
      ]
    })
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
        const state = stateOf(expansion);
        const alsoFits = (fits.get(expansion.bggId) ?? []).filter(base => base.bggId !== game.bggId);

        return (
          <IonItem key={expansion.bggId} button detail={false} onClick={() => choose(ownerId, expansion)}>
            <IonLabel>
              <h3>{expansion.name}</h3>
              {alsoFits.length > 0 && <p>Also fits {alsoFits.map(fit => fit.name).join(', ')}</p>}
            </IonLabel>
            {state === 'owned' && <IonBadge slot="end" color="success">Owned</IonBadge>}
            {state === 'wanted' && <IonBadge slot="end" color="warning">Wanted</IonBadge>}
            {state === 'hidden' && <IonBadge slot="end" color="medium">Hidden</IonBadge>}
          </IonItem>
        )
      })}

      {expanded && counts.hidden > 0 && (
        <IonItem button detail={false} onClick={() => setShowHidden(!showHidden)}>
          <IonLabel color="medium">{showHidden ? 'Leave out hidden' : `Show ${counts.hidden} hidden`}</IonLabel>
        </IonItem>
      )}
    </IonList>
  )
}