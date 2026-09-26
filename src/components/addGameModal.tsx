import { useEffect, useState } from "react";
import { BggClient, BggGameDetails, BggSearchResult } from "../services/bgg";
import { useLibrary } from "../state/libraryContext";
import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonModal, IonSearchbar, IonSegment, IonSegmentButton, IonSpinner, IonTitle, IonToolbar, useIonToast } from "@ionic/react";
import { mockBggClient } from "../services/mockBggClient";
import { Ownership } from "../domain/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** 'wishlist' when opened from the Wishlist tab. */
  defaultTarget?: string;
  client?: BggClient;
}

const WISHLIST = 'wishlist';

export default function AddGameModal({ isOpen, onClose, defaultTarget, client = mockBggClient }: Props) {
  const { data, actions } = useLibrary();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BggSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(defaultTarget ? data.people[0].id : WISHLIST);
  const [presentToast] = useIonToast();

  useEffect(() => {
    let cancelled = false;
    if (!query.trim) {
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
    const addedTo = target === WISHLIST ? 'the wishlist' : `${data.people.find(person => person.id === target)?.name}'s games`
    presentToast(`${game.name} added to ${addedTo}`);
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add a Game</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={target} onIonChange={(e) => setTarget(String(e.detail.value))}>
            {/* Need to allow for scrolling later */}
            {data.people.map(person => (
              <IonSegmentButton key={person.id} value={person.id}>
                <IonLabel>{person.name}</IonLabel>
              </IonSegmentButton>
            ))}
            <IonSegmentButton value={WISHLIST}>
              <IonLabel>Wishlist</IonLabel>
            </IonSegmentButton>
          </IonSegment>
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
            <IonItem key={r.bggId} button disabled={alreadyThere(r.bggId)} onClick={() => addGame(r)}>
              <IonLabel></IonLabel>
            </IonItem>
          ))}
        </IonList>
        {!loading && query && results.length === 0 && <p>No match found</p>}
      </IonContent>
    </IonModal>
  )
}