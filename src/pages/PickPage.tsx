import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { useLibrary } from "../state/libraryContext";
import { allCategories, applyFilters, countActiveFilters, DEFAULT_FILTERS, GameFilters } from "../logic/filters";
import { Game } from "../domain/types";
import type { DiceHandle } from "../components/DiceRoller";
import { pickRandom } from "../logic/random";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Share } from "@capacitor/share";
import { gameSummary } from "../logic/format";
import { IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonPage, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { funnelOutline, shareOutline } from "ionicons/icons";
import FilterModal from "../components/FilterModal";

const DiceRoller = lazy(() => import('../components/DiceRoller'));

export default function PickPage() {
  const { data } = useLibrary();
  const [filters, setFilters] = useState<GameFilters>({...DEFAULT_FILTERS, scope: 'owned'});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [picked, setPicked] = useState<Game | null>(null);
  const [rolling, setRolling] = useState(false);
  const dice = useRef<DiceHandle>(null)

  const candidates = useMemo(() => applyFilters(data.games, filters, data.lists), [data.games, data.lists, filters]);
  const partner = data.people[1];

  async function roll() {
    const choice = pickRandom(candidates);
    if (!choice || !dice.current) return;
    setRolling(true);
    setPicked(null);

    await Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    await dice.current.roll();

    setPicked(choice);
    setRolling(false);

    await Haptics.notification({ type: NotificationType.Success }).catch(() => {});
  }

  async function share(game: Game) {
    const { value: canShare } = await Share.canShare();
    if (!canShare) return;
    await Share.share({ title: "Tonight's Game", text: `The app picked ${game.name}. ${gameSummary(game)}`})
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pick a Game</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setFiltersOpen(true)}>
              <IonIcon slot="icon-only" icon={funnelOutline} />
              { countActiveFilters(filters) > 0 && <IonBadge>{countActiveFilters(filters)}</IonBadge>}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {partner && (
          <IonButton
            size="small"
            fill="outline"
            onClick={() => 
              setFilters({
                ...DEFAULT_FILTERS,
                ownerId: partner.id,
                statuses: ['not-played'],
                playerCount: 2,
                playerFit: 'recommended',
                scope: 'owned',
              })
            }
          >
            {partner.name}'s unplayed games good for 2 players
          </IonButton>
        )}

        <div className="dice-stage">
          <Suspense fallback={null}>
            <DiceRoller ref={dice} />
          </Suspense>
        </div>

        <IonText color="medium">
          <p className="ion-text-center">
            {candidates.length} {candidates.length === 1 ? 'game matches' : 'games match'}
          </p>
        </IonText>
        <IonButton
          expand="block"
          size="large"
          disabled={rolling || candidates.length === 0}
          onClick={roll}
        >
          {rolling ? 'Rolling...' : 'Roll'}
        </IonButton>

        {picked && (
          <IonCard>
            <IonCardHeader>
              <IonCardSubtitle>Tonight you're playing</IonCardSubtitle>
              <IonCardTitle>{picked.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>{gameSummary(picked)}</p>
              <IonButton fill="clear" routerLink={`/tabs/pick/games/${picked.id}`}>
                Details
              </IonButton>
              <IonButton fill="clear" onClick={() => share(picked)}>
                <IonIcon slot="start" icon={shareOutline} />
                Share
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>

        <FilterModal
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          onChange={setFilters}
          people={data.people}
          lists={data.lists}
          categories={allCategories(data.games)}
        />
    </IonPage>
  )
}