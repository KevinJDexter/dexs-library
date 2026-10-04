import { useEffect, useMemo, useState } from "react";
import { BggClient, BggGameDetails, BggSearchResult } from "../services/bgg";
import { useLibrary } from "../state/libraryContext";
import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonModal, IonSearchbar, IonSpinner, IonText, IonTitle, IonToolbar, useIonToast } from "@ionic/react";
import { Ownership } from "../domain/types";
import { bggClient } from "../services/bggXmlClient";

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 'wishlist' when opened from the Wishlist tab. */
  defaultTarget?: string;
  client?: BggClient;
}

const WISHLIST = 'wishlist';

export default function AddGameModal({ isOpen, onClose, defaultTarget = WISHLIST, client = bggClient }: AddGameModalProps) {
  const { data, actions } = useLibrary();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BggSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(defaultTarget);
  const [presentToast, dismissToast] = useIonToast();

  const personName = useMemo(() => (
    target === WISHLIST ? 'Wishlist' : data.people.find(person => person.id === target)?.name
  ), [data, target])

  useEffect(() => {
    let cancelled = false;
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    };
    setLoading(true);
    client
      .search(query)
      .then(res => !cancelled && setResults(res))
      .finally(() => !cancelled && setLoading(false))
    return () => {cancelled = true};
  }, [query, client])

  useEffect(() => {
    setTarget(defaultTarget)
  }, [defaultTarget])

  const alreadyThere = (bggId: number) => (
    data.games.some((game) => (
      game.bggId === bggId
        && (target === WISHLIST
          ? game.ownership.kind === WISHLIST
          : game.ownership.kind === 'owned' && game.ownership.ownerId === target
        )
    ))
  )

  async function addGame(game: BggSearchResult) {
    const details: BggGameDetails = await client.getDetails(game.bggId);
    const ownership: Ownership = target === WISHLIST ? { kind: WISHLIST } : { kind: 'owned', ownerId: target }
    actions.addGame({
      ...details,
      ownership,
      status: 'not-played',
      favorite: false,
    });
    const addedTo = target === WISHLIST ? 'the wishlist' : `${personName}'s games`
    await dismissToast();
    presentToast(`${game.name} added to ${addedTo}`, 1000);
  }

  async function removeGame(game: BggSearchResult) {
    const gameId = data.games.find(g => g.bggId === game.bggId && (
      target === WISHLIST
        ? g.ownership.kind === WISHLIST
        : g.ownership.kind === 'owned' && g.ownership.ownerId === target
    ))?.id;
    if (gameId) {
      actions.removeGame(gameId)
      const removedFrom = target === WISHLIST ? 'the wishlist' : `${personName}'s games`;
      await dismissToast();
      presentToast(`${game.name} removed from ${removedFrom}`, 1000);
    }
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonText slot="start" style={{ margin: "2px 16px 0" }}>{personName}</IonText>
          <IonTitle>Add a Game</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            debounce={250}
            placeholder="Search for a Game..."
            value={query}
            onIonInput={(e) => setQuery(e.detail.value ?? '')}
          />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {loading && (
          <div className='ion-text-center ion-padding'>
            <IonSpinner />
          </div>
        )}
        <IonList>
          {results.map((r) => (
            <IonItem key={r.bggId}>
              <IonLabel style={{ opacity: alreadyThere(r.bggId) ? 0.3 : 1}}>{r.name}</IonLabel>
              {!alreadyThere(r.bggId) ? (
                <IonButton size="small" slot="end" onClick={() => addGame(r)}>
                  Add
                </IonButton>
              ) : (
                <IonButton size="small" slot="end" onClick={() => removeGame(r)}>
                  Remove
                </IonButton>
              )}
            </IonItem>
          ))}
        </IonList>
        {!loading && query && results.length === 0 && <p>No match found</p>}
        {!loading && !query && <p>Waiting for query</p>}
      </IonContent>
    </IonModal>
  )
}