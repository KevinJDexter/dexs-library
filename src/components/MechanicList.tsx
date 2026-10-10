import { IonChip, IonItem, IonLabel } from "@ionic/react";
import { Game } from "../domain/types";
import { Facet } from "../logic/matching";
import Section from "./Section";

export default function MechanicList({ game, onSelect }: {game: Game, onSelect?: (facet: Facet) => void}) {
  const mechanics = game.mechanics ?? [];
  if (mechanics.length === 0) return null;

  return (
    <Section id="mechanics" title="Mechanics" summary={`${mechanics.length}`}>
      <IonItem>
        <IonLabel>
          <div>
            {mechanics.map(mechanic => (
              <IonChip
                key={mechanic}
                outline
                style={{ marginInlineStart: 0 }}
                onClick={onSelect && (() => onSelect({ kind: 'mechanic', value: mechanic }))}
              >
                {mechanic}
              </IonChip>
            ))}
          </div>
        </IonLabel>
      </IonItem>
    </Section>
  )
}