import { IonItem, IonLabel, IonNote } from "@ionic/react";
import { BggRef, Game } from "../domain/types";
import { useLibrary } from "../state/libraryContext";
import Section from "./Section";

interface RelatedGamesProps {
  game: Game;
  hrefFor: (gameId: string) => string;
}

export default function RelatedGames({ game, hrefFor }: RelatedGamesProps) {
  const { data } = useLibrary();
  const sections: [string, string, BggRef[] | undefined][] = [
    ['expansion-of', 'Expansion for', game.expansionOf],
    ['integrations', 'Combines with', game.integrations],
    ['reimplements', 'New version of', game.reimplements],
    ['reimplemented-by', 'Newer versions', game.reimplementedBy],
  ];

  return (
    <>
      {sections.filter(([, , refs]) => refs?.length).map(([id, title, refs]) => (
        <Section key={id} id={id} title={title} summary={`${refs!.length}`}>
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
        </Section>
      ))}
    </>
  );
}