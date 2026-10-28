import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonModal, IonNote, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";
import { Collection, Facet, facetTitle, FilterTarget, matchesFacet } from "../logic/matching";
import { useRef } from "react";
import GameThumb from "./GameThumb";
import { playersLine } from "../logic/format";

interface MatchingGamesProps {
  facet: Facet | null;
  collection: Collection;
  currentGameId: string;
  hrefFor: (gameId: string) => string;
  onClose: () => void;
  filterTarget?: FilterTarget;
}

export default function MatchingGames({ facet, collection, currentGameId, hrefFor, onClose, filterTarget}: MatchingGamesProps) {
  const router = useIonRouter();
  const modal = useRef<HTMLIonModalElement>(null);
  const goTo = useRef<string | null>(null);
  const goToRoot = useRef(false);

  const matches = facet
    ? collection.games
      .filter(game => game.id !== currentGameId && matchesFacet(game, facet))
      .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  function open(gameId: string) {
    goTo.current = hrefFor(gameId);
    modal.current?.dismiss();
  }

  function filterBy(target: FilterTarget) {
    goTo.current = target.href;
    goToRoot.current = true;
    modal.current?.dismiss();
  }

  return (
    <IonModal
      ref={modal}
      isOpen={facet !== null}
      initialBreakpoint={0.6}
      breakpoints={[0, 0.6, 1]}
      onDidDismiss={() => {
        onClose();
        if (goTo.current) router.push(goTo.current, goToRoot.current ? 'root' : 'forward');
        goTo.current = null;
        goToRoot.current = false;
      }}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{facet && facetTitle(facet)}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {filterTarget && (
          <IonButton expand="block" fill="outline" className="ion-margin" onClick={() => filterBy(filterTarget)}>
            {filterTarget.label}
          </IonButton>
        )}
        <IonNote>
          <p className="ion-padding-horizontal">
            {
              matches.length === 0
                ? 'No other games'
                : `${matches.length} other ${matches.length === 1 ? 'game' : 'games'}`
            } in {collection.name}
          </p>
        </IonNote>
        <IonList>
          {matches.map(game => (
            <IonItem key={game.id} button onClick={() => open(game.id)}>
              <div slot="start"><GameThumb name={game.name} src={game.thumbnail}/></div>
              <IonLabel>
                <h3>{game.name}</h3>
                <p>{playersLine(game)}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonModal>
  )
}