import { useEffect, useMemo, useState } from "react";
import { BggClient, BggGameDetails, BggSearchResult } from "../services/bgg";
import { useLibrary } from "../state/libraryContext";
import { IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonItem, IonLabel, IonList, IonModal, IonSearchbar, IonSpinner, IonText, IonTitle, IonToolbar, useIonToast } from "@ionic/react";
import { Ownership } from "../domain/types";
import { bggClient } from "../services/bggXmlClient";
import { rankResults } from "../logic/searchRank";

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 'wishlist' when opened from the Wishlist tab. */
  defaultTarget?: string;
  client?: BggClient;
}

const WISHLIST = 'wishlist';
const PAGE_SIZE = 25;

export default function AddGameModal({ isOpen, onClose, defaultTarget = WISHLIST, client = bggClient }: AddGameModalProps) {
  const { data, actions } = useLibrary();
  const [query, setQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<BggSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(defaultTarget);
  const [exact, setExact] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [presentToast, dismissToast] = useIonToast();

  const personName = useMemo(() => (
    target === WISHLIST ? 'Wishlist' : data.people.find(person => person.id === target)?.name
  ), [data, target])

  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchText), 250);
    return () => clearTimeout(timer);
  }, [searchText])

  useEffect(() => {
    let cancelled = false;
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    };
    setLoading(true);
    setVisibleCount(PAGE_SIZE);
    client
      .search(query, { exact })
      .then(res => !cancelled && setResults(rankResults(res, query)))
      .finally(() => !cancelled && setLoading(false))
    return () => {cancelled = true};
  }, [query, client, exact])

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

  const visibleResults = results.slice(0, visibleCount);
  const remaining = results.length - visibleResults.length

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
            placeholder="Search for a Game..."
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value ?? '')}
          />
          <IonCheckbox
            slot="end"
            labelPlacement="start"
            checked={exact}
            onIonChange={(e) => setExact(e.detail.checked)}
            style={{ marginRight: 16 }}
          >
            Exact
          </IonCheckbox>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {loading ? (
          <div className='ion-text-center ion-padding'>
            <IonSpinner />
          </div>
        ) : (
          <IonList>
            {visibleResults.map((r) => (
              <IonItem key={r.bggId}>
                <IonLabel style={{ opacity: alreadyThere(r.bggId) ? 0.3 : 1}}>
                  <h3>{r.name}</h3>
                  <p>{r.yearPublished}</p>
                </IonLabel>
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
            {remaining > 0 && (
              <IonItem button detail={false} onClick={() => setVisibleCount(count => count + PAGE_SIZE)}>
                <IonLabel color="primary" className="ion-text-center">
                  Show {Math.min(PAGE_SIZE, remaining)} more ({remaining} left)
                </IonLabel>
              </IonItem>
            )}
          </IonList>
        )}
        {!loading && query && query === searchText && results.length === 0 && <p>No match found</p>}
        {!searchText && <p>Waiting for query</p>}
      </IonContent>
    </IonModal>
  )
}