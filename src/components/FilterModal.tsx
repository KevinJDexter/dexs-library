import { IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonRange, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar } from "@ionic/react";
import { GameList, Person } from "../domain/types";
import { COMPLEXITY_MAX, COMPLEXITY_MIN, DEFAULT_FILTERS, GameFilters, PlayedFilter } from "../logic/filters";
import { STALE_MONTHS } from "../logic/plays";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: GameFilters;
  onChange: (next: GameFilters) => void;
  people: Person[];
  lists: GameList[];
  categories: string[];
  showOwner?: boolean;
}

const PLAYER_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 12, 16]
const PLAY_TIMES = [15, 30, 45, 60, 90, 120];
const SETUP_TIMES = [5, 10, 15, 20, 30];

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onChange,
  people,
  lists,
  categories,
  showOwner
}: FilterModalProps) {
  const set = <K extends keyof GameFilters>(key: K, value: GameFilters[K]) => onChange({ ...filters, [key]: value });
  const toggleIn = <T,>(arr: T[], item: T) => (arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.75} breakpoints={[0, .75, 1]}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => onChange({ ...DEFAULT_FILTERS, scope: filters.scope, search: filters.search })}>
              Reset
            </IonButton>
          </IonButtons>
          <IonTitle>
            Filters
          </IonTitle>
          <IonButtons slot="end">
            <IonButton strong onClick={onClose}>
              Done
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {showOwner && (
            <IonItem>
              <IonSelect label="Owner" value={filters.ownerId} onIonChange={(e) => set('ownerId', e.detail.value)}>
                <IonSelectOption value={'any'} >Anyone</IonSelectOption>
                {people.map(person => (
                  <IonSelectOption key={person.id} value={person.id}>
                    {person.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          )}
          <IonItem>
            <IonSelect label="List" value={filters.listId} onIonChange={(e) => set('listId', e.detail.value === 'none' ? null : e.detail.value)}>
              <IonSelectOption value={'none'}>All Games</IonSelectOption>
              {lists.map(list => (
                <IonSelectOption key={list.id} value={list.id}>
                  {list.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonSelect label="Players" value={filters.playerCount ?? 0} onIonChange={(e) => set('playerCount', e.detail.value === 0 ? null : e.detail.value)}>
              <IonSelectOption value={0}>Any</IonSelectOption>
              {PLAYER_COUNTS.map(count => (
                <IonSelectOption key={count} value={count}>
                  {count}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          {filters.playerCount !== null && (
            <IonItem>
              <IonSelect label="Player fit" value={filters.playerFit} onIonChange={(e) => set('playerFit', e.detail.value)}>
                <IonSelectOption value={"supports"}>Supports</IonSelectOption>
                <IonSelectOption value={"recommended"}>Recommended on BGG</IonSelectOption>
                <IonSelectOption value={"best"}>Best on BGG</IonSelectOption>
              </IonSelect>
            </IonItem>
          )}
          <IonItem>
            <IonSelect label="Play Time" value={filters.maxPlayTime} onIonChange={(e) => set('maxPlayTime', e.detail.value === 0 ? null : e.detail.value)}>
              <IonSelectOption value={0}>Any</IonSelectOption>
              {PLAY_TIMES.map(playtime => (
                <IonSelectOption key={playtime} value={playtime}>{playtime} min</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonSelect label="Setup Time" value={filters.maxSetupTime} onIonChange={(e) => set('maxSetupTime', e.detail.value === 0 ? null : e.detail.value)}>
              <IonSelectOption value={0}>Any</IonSelectOption>
              {SETUP_TIMES.map(setupTime => (
                <IonSelectOption key={setupTime} value={setupTime}>{setupTime} min</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonRange
              label={`Complexity ${filters.complexity.lower}-${filters.complexity.upper}`}
              labelPlacement="stacked"
              dualKnobs
              min={COMPLEXITY_MIN}
              max={COMPLEXITY_MAX}
              step={0.5}
              snaps
              pin
              value={filters.complexity}
              onIonChange={(e) => set('complexity', e.detail.value as GameFilters['complexity'])}
            />
          </IonItem>
          <IonItem>
            <IonToggle checked={filters.favoritesOnly} onIonChange={(e) => set('favoritesOnly', e.detail.checked)}>
              Favorites only
            </IonToggle>
          </IonItem>
          
          <IonItem>
            <IonSelect label="Played" value={filters.played} onIonChange={(e) => set('played', e.detail.value as PlayedFilter)}>
              <IonSelectOption value="any">Any</IonSelectOption>
              <IonSelectOption value="never">Never played</IonSelectOption>
              <IonSelectOption value="played">Played at least once</IonSelectOption>
              <IonSelectOption value="stale">Not played in {STALE_MONTHS}+ months</IonSelectOption>
            </IonSelect>
          </IonItem>

          {categories.length > 0 && (
            <IonListHeader>
              <IonLabel>
                Type of Game
              </IonLabel>
            </IonListHeader>
          )}
          {categories.map(category => (
            <IonItem key={category}>
              <IonCheckbox checked={filters.categories.includes(category)} onIonChange={() => set('categories', toggleIn(filters.categories, category))}>
                {category}
              </IonCheckbox>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonModal>
  )
}