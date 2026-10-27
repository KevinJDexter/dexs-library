import { useState } from "react";
import { IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonChip, IonContent, IonHeader, IonItem, IonLabel, IonList, IonModal, IonNote, IonRange, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar } from "@ionic/react";
import { GameList, Person } from "../domain/types";
import { COMPLEXITY_MAX, COMPLEXITY_MIN, DEFAULT_FILTERS, GameFilters, PlayedFilter, TAG_KINDS, TagKind } from "../logic/filters";
import { STALE_MONTHS } from "../logic/plays";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: GameFilters;
  onChange: (next: GameFilters) => void;
  people: Person[];
  lists: GameList[];
  tags: Record<TagKind, string[]>;
  showOwner?: boolean;
}

const PLAYER_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 12, 16]
const PLAY_TIMES = [15, 30, 45, 60, 90, 120];
const SETUP_TIMES = [5, 10, 15, 20, 30];
const CHIPS_SHOWN = 12;

const TAG_TITLES: Record<TagKind, string> = { categories: 'Categories', mechanics: 'Mechanics', families: 'Families' };

function TagChips({ title, options, selected, onChange }: {
  title: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  if (options.length === 0) return null;
  const shown = showAll ? options : [...new Set([...selected, ...options.slice(0, CHIPS_SHOWN)])];
  const toggle = (tag: string) => onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag]);

  return (
    <div style={{ marginBottom: 12 }}>
      <IonNote><p style={{ margin: '0 0 4px' }}>{title}</p></IonNote>
      {shown.map(tag => {
        const on = selected.includes(tag);
        return (
          <IonChip key={tag} color={on ? 'primary' : undefined} outline={!on} onClick={() => toggle(tag)}>
            {tag}
          </IonChip>
        );
      })}
      {options.length > CHIPS_SHOWN && (
        <IonButton fill="clear" size="small" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show fewer' : `Show all ${options.length}`}
        </IonButton>
      )}
    </div>
  );
}

const summary = (parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' · ') || 'Any';

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onChange,
  people,
  lists,
  tags,
  showOwner
}: FilterModalProps) {
  const [openSections, setOpenSections] = useState<string[]>(['players']);
  const set = <K extends keyof GameFilters>(key: K, value: GameFilters[K]) => onChange({ ...filters, [key]: value });

  const complexityChanged = filters.complexity.lower !== COMPLEXITY_MIN || filters.complexity.upper !== COMPLEXITY_MAX;
  const playersSummary = summary([
    filters.playerCount !== null && `${filters.playerCount} players`,
    filters.maxPlayTime !== null && `≤ ${filters.maxPlayTime} min`,
    filters.maxSetupTime !== null && `setup ≤ ${filters.maxSetupTime}`,
    complexityChanged && `weight ${filters.complexity.lower}–${filters.complexity.upper}`,
  ]);
  const collectionSummary = summary([
    filters.ownerId !== 'any' && people.find(person => person.id === filters.ownerId)?.name,
    filters.listId !== null && lists.find(list => list.id === filters.listId)?.name,
    filters.favoritesOnly && 'favorites',
    filters.played !== 'any' && { never: 'never played', played: 'played', stale: 'not lately' }[filters.played],
  ]);

  const tagCount = TAG_KINDS.reduce((sum, kind) => sum + filters[kind].length, 0);
  const hasTags = TAG_KINDS.some(kind => tags[kind].length > 0);

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
        <IonAccordionGroup
          multiple
          value={openSections}
          onIonChange={(e) => {
            // ionChange from the selects and toggles inside also bubbles up to here. Only listen to the group's own.
            if (e.target !== e.currentTarget) return;
            setOpenSections(e.detail.value ?? []);
          }}
        >
          <IonAccordion value="players">
            <IonItem slot="header">
              <IonLabel>Players & time</IonLabel>
              <IonNote slot="end">{playersSummary}</IonNote>
            </IonItem>
            <IonList slot="content">
              <IonItem>
                <IonSelect label="Players" value={filters.playerCount ?? 0} onIonChange={(e) => set('playerCount', e.detail.value === 0 ? null : e.detail.value)}>
                  <IonSelectOption value={0}>Any</IonSelectOption>
                  {PLAYER_COUNTS.map(count => (
                    <IonSelectOption key={count} value={count}>{count}</IonSelectOption>
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
                <IonSelect label="Play Time" value={filters.maxPlayTime ?? 0} onIonChange={(e) => set('maxPlayTime', e.detail.value === 0 ? null : e.detail.value)}>
                  <IonSelectOption value={0}>Any</IonSelectOption>
                  {PLAY_TIMES.map(playtime => (
                    <IonSelectOption key={playtime} value={playtime}>{playtime} min</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonSelect label="Setup Time" value={filters.maxSetupTime ?? 0} onIonChange={(e) => set('maxSetupTime', e.detail.value === 0 ? null : e.detail.value)}>
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
            </IonList>
          </IonAccordion>

          <IonAccordion value="collection">
            <IonItem slot="header">
              <IonLabel>Collection</IonLabel>
              <IonNote slot="end">{collectionSummary}</IonNote>
            </IonItem>
            <IonList slot="content">
              {showOwner && (
                <IonItem>
                  <IonSelect label="Owner" value={filters.ownerId} onIonChange={(e) => set('ownerId', e.detail.value)}>
                    <IonSelectOption value={'any'}>Anyone</IonSelectOption>
                    {people.map(person => (
                      <IonSelectOption key={person.id} value={person.id}>{person.name}</IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              )}
              <IonItem>
                <IonSelect label="List" value={filters.listId ?? 'none'} onIonChange={(e) => set('listId', e.detail.value === 'none' ? null : e.detail.value)}>
                  <IonSelectOption value={'none'}>All Games</IonSelectOption>
                  {lists.map(list => (
                    <IonSelectOption key={list.id} value={list.id}>{list.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonSelect label="Played" value={filters.played} onIonChange={(e) => set('played', e.detail.value as PlayedFilter)}>
                  <IonSelectOption value="any">Any</IonSelectOption>
                  <IonSelectOption value="never">Never played</IonSelectOption>
                  <IonSelectOption value="played">Played at least once</IonSelectOption>
                  <IonSelectOption value="stale">Not played in {STALE_MONTHS}+ months</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonToggle checked={filters.favoritesOnly} onIonChange={(e) => set('favoritesOnly', e.detail.checked)}>
                  Favorites only
                </IonToggle>
              </IonItem>
            </IonList>
          </IonAccordion>

          {hasTags && (
            <IonAccordion value="types">
              <IonItem slot="header">
                <IonLabel>Type of game</IonLabel>
                <IonNote slot="end">{tagCount ? `${tagCount} selected` : 'Any'}</IonNote>
              </IonItem>
              <div slot="content" className="ion-padding">
                {TAG_KINDS.map(kind => (
                  <TagChips
                    key={kind}
                    title={TAG_TITLES[kind]}
                    options={tags[kind]}
                    selected={filters[kind]}
                    onChange={next => set(kind, next)}
                  />
                ))}
              </div>
            </IonAccordion>
          )}
        </IonAccordionGroup>
      </IonContent>
    </IonModal>
  )
}