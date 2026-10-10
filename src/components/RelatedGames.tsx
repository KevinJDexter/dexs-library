import { IonItem, IonLabel, IonModal, IonNote } from "@ionic/react";
import { BggRef, Game } from "../domain/types";
import { useLibrary } from "../state/libraryContext";
import Section from "./Section";
import { AddTarget, useAddGame, WISHLIST } from "../hooks/useAddGame";
import { BggGameDetails } from "../services/bgg";
import { useState } from "react";
import GamePreview from "./GamePreview";
import { bggClient } from "../services/bggXmlClient";

interface RelatedGamesProps {
  game: Game;
  hrefFor: (gameId: string) => string;
}

export default function RelatedGames({ game, hrefFor }: RelatedGamesProps) {
  const { data } = useLibrary();
  const { adding, addGame, targetName } = useAddGame();
  const [previewing, setPreviewing] = useState<BggRef | null>(null);

  const sections: [string, string, BggRef[] | undefined][] = [
    ['expansion-of', 'Expansion for', game.expansionOf],
    ['integrations', 'Combines with', game.integrations],
    ['reimplements', 'New version of', game.reimplements],
    ['reimplemented-by', 'Newer versions', game.reimplementedBy],
  ];

  const targets: AddTarget[] = game.ownership.kind === 'owned' ? [game.ownership.ownerId, WISHLIST] : [WISHLIST];
  const addOptions = targets.map(target => ({ label: `Add to ${targetName(target)}`, target }));

  async function add(ref: BggRef, details: BggGameDetails, target: AddTarget, asGame?: boolean) {
    if (await addGame(ref, target, details, asGame)) setPreviewing(null);
  }

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
              <IonItem key={ref.bggId} button detail={false} onClick={() => setPreviewing(ref)}>
                <IonLabel>{ref.name}</IonLabel>
                <IonNote slot="end">Preview</IonNote>
              </IonItem>
            );
          })}
        </Section>
      ))}

      <IonModal isOpen={previewing !== null} onDidDismiss={() => setPreviewing(null)} initialBreakpoint={0.75} breakpoints={[0, 0.75, 1]}>
        {previewing && (
          <GamePreview
            result={previewing}
            client={bggClient}
            alreadyAdded={data.games.some(other => other.bggId === previewing.bggId)}
            adding={adding.includes(previewing.bggId)}
            addOptions={addOptions}
            onAdd={(details, target, asGame) => add(previewing, details, target, asGame)}
          />
        )}
      </IonModal>
    </>
  );
}