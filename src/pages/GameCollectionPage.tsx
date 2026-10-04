import { useMemo, useState } from "react";
import { useLibrary } from "../state/libraryContext";
import { IonBadge, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonList, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { allCategories, applyFilters, countActiveFilters, DEFAULT_FILTERS, GameFilters, Scope } from "../logic/filters";
import { add, funnelOutline, settingsOutline } from "ionicons/icons";
import GameListItem from "../components/GameListItem";
import AddGameModal from "../components/AddGameModal";
import FilterModal from "../components/FilterModal";

interface GameCollectionPageProps {
  title: string;
  scope: Exclude<Scope, 'all'>;
  basePath: string;
}

export default function GameCollectionPage({ title, scope, basePath }: GameCollectionPageProps) {
  const { data, ready } = useLibrary();
  const [ filters, setFilters ] = useState<GameFilters>({ ...DEFAULT_FILTERS, scope })
  const [ filterModalOpen, setFilterModalOpen ] = useState(false);
  const [ addGameModalOpen, setAddGameModalOpen ] = useState(false);
  const [ libraryOwnerId, setLibraryOwnerId ] = useState(scope === 'wishlist' ? 'wishlist' : data.people[0].id)

  const ownedGames = useMemo(() => (
    data.games.filter(game => scope === 'owned' ? game.ownership.kind === 'owned' && game.ownership.ownerId === libraryOwnerId : game.ownership.kind === 'wishlist')
  ), [data.games, libraryOwnerId, scope])
  const visible = useMemo(() => (
    applyFilters(ownedGames, filters, data.lists).sort((a, b) => a.name.localeCompare(b.name))
  ), [ownedGames, data.lists, filters])
  const activeCount = countActiveFilters(filters);
  const totalInScope = ownedGames.length;
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ display: 'flex' }}>
          { scope === 'owned' && (
            <IonSelect slot="start" style={{ margin: "2px 16px 0" }} value={libraryOwnerId} onIonChange={(e) => setLibraryOwnerId(e.detail.value)}>
              {data.people.map(person => (
                <IonSelectOption key={person.id} value={person.id}>
                  {person.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          )}
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setFilterModalOpen(true)}>
              <IonIcon slot="icon-only" icon={funnelOutline} />
              { activeCount > 0 && <IonBadge color="primary">{activeCount}</IonBadge>}
            </IonButton>
            { scope === 'owned' && 
              <IonButton routerLink={`${basePath}/settings`}>
                <IonIcon slot="icon-only" icon={settingsOutline} />
              </IonButton>
            }
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar value={filters.search} onIonInput={(e) => setFilters({...filters, search: e.detail.value ?? ''})} />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {ready && totalInScope === 0 && (
          <div className="ion-padding ion-text-center">
            <IonText color="medium">
              <p>{scope === 'owned' ? 'No games owned.' : 'No games in wishlist.'} Tap + to add one.</p>
            </IonText>
          </div>
        )}

        {totalInScope > 0 && visible.length === 0 && (
          <div className="ion-padding ion-text-center">
            <IonText color="medium">
              <p>No games match filters.</p>
            </IonText>
          </div>
        )}

        <IonList>
          {visible.map(game => (
            <GameListItem key={game.id} game={game} href={`${basePath}/game/${game.id}`}/>
          ))}
        </IonList>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={() => setAddGameModalOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>

      <AddGameModal
        isOpen={addGameModalOpen}
        onClose={() => setAddGameModalOpen(false)}
        defaultTarget={scope === "owned" ? libraryOwnerId : "wishlist"}
      />
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onChange={setFilters}
        people={data.people}
        lists={data.lists}
        categories={allCategories(data.games)}
        showOwner={scope === 'owned'}
      />
    </IonPage>
  )
}