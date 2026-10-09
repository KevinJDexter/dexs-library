import { IonItem, IonLabel, IonList, IonListHeader, IonNote } from "@ionic/react";
import { BggRef, Game } from "../domain/types";
import { useLibrary } from "../state/libraryContext";

interface RelatedGamesProps {
  game: Game;
  hrefFor: (gameId: string) => string;
}

export default function RelatedGames({ game, hrefFor }: RelatedGamesProps) {
  const { data } = useLibrary();
  const sections: [string, BggRef[] | undefined][] = [
    ['Expansion for', game.expansionOf],
    ['Combines with', game.integrations],
    ['New version of', game.reimplements],
    ['Newer versions', game.reimplementedBy],
  ];

  return (
    <>
      {sections.filter(([, refs]) => refs?.length).map(([title, refs]) => (
        <IonList inset key={title}>
          <IonListHeader>
            <IonLabel>{title}</IonLabel>
          </IonListHeader>
          {refs!.map(ref => {
            const inLibrary = data.games.find(other => other.bggId === ref.bggId);
            return inLibrary ? (
              <IonItem key={ref.bggId} routerLink={hrefFor(inLibrary.id)}>
                <IonLabel>{ref.name}</IonLabel>
                <IonNote slot="end" color="success">In library</IonNote>
              </IonItem>
            ) : (
              <IonItem key={ref.bggId} href={`https://boardgamegeek.com/boardgame/${ref.bggId}`} target="_blank" detail={false}>
                <IonLabel>{ref.name}</IonLabel>
                <IonNote slot="end">BGG</IonNote>
              </IonItem>
            );
          })}
        </IonList>
      ))}
    </>
  );
}