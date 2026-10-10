import { useEffect, useMemo, useState } from "react";
import { BggClient, BggSearchResult } from "../services/bgg";
import { useLibrary } from "../state/libraryContext";
import { IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonItem, IonLabel, IonList, IonModal, IonSearchbar, IonSpinner, IonText, IonTitle, IonToolbar, useIonToast } from "@ionic/react";
import { bggClient } from "../services/bggXmlClient";
import { rankResults } from "../logic/searchRank";
import GamePreview from "./GamePreview";
import { useAddGame, WISHLIST } from "../hooks/useAddGame";

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 'wishlist' when opened from the Wishlist tab. */
  defaultTarget?: string;
  client?: BggClient;
}

const PAGE_SIZE = 25;

export default function AddGameModal({ isOpen, onClose, defaultTarget = WISHLIST, client = bggClient }: AddGameModalProps) {
  const { data, actions } = useLibrary();
  const { adding, addGame, targetName } = useAddGame(client);
  const [query, setQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<BggSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(defaultTarget);
  const [exact, setExact] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [previewing, setPreviewing] = useState<BggSearchResult | null>(null);
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

  async function removeGame(game: BggSearchResult) {
    const gameId = data.games.find(g => g.bggId === game.bggId && (
      target === WISHLIST
        ? g.ownership.kind === WISHLIST
        : g.ownership.kind === 'owned' && g.ownership.ownerId === target
    ))?.id;
    if (gameId) {
      actions.removeGame(gameId)
      await dismissToast();
      presentToast(`${game.name} removed from ${targetName(target)}`, 1000);
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
              <IonItem key={r.bggId} button detail={false} onClick={() => setPreviewing(r)}>
                <IonLabel style={{ opacity: alreadyThere(r.bggId) ? 0.3 : 1}}>
                  <h3>{r.name}</h3>
                  <p>{r.yearPublished}</p>
                </IonLabel>
                {!alreadyThere(r.bggId) ? (
                  <IonButton size="small" slot="end" disabled={adding.includes(r.bggId)} onClick={(e) => { e.stopPropagation(); addGame(r, target)}} >
                    Add
                  </IonButton>
                ) : (
                  <IonButton size="small" slot="end" onClick={(e) => { e.stopPropagation(); removeGame(r)}}>
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

      <IonModal isOpen={previewing !== null} onDidDismiss={() => setPreviewing(null)} initialBreakpoint={0.75} breakpoints={[0, 0.75, 1]}>
        {previewing && (
          <GamePreview
            result={previewing}
            client={client}
            alreadyAdded={alreadyThere(previewing.bggId)}
            adding={adding.includes(previewing.bggId)}
            addOptions={[{ label: 'Add', target }]}
            onAdd={(details, to) => addGame(previewing, to, details)}
            onRemove={() => removeGame(previewing)}
          />
        )}
      </IonModal>
    </IonModal>
  )
}