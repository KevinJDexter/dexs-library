import { IonChip, IonItem, IonLabel, } from "@ionic/react";
import { Game } from "../domain/types";
import { familyName, visibleFamilies } from "../logic/families";
import { useLibrary } from "../state/libraryContext";
import Section from "./Section";
import { Facet } from "../logic/matching";

export default function FamilyList({ game, onSelect }: { game: Game, onSelect?: (facet: Facet) => void }) {
  const { data } = useLibrary();
  const groups = visibleFamilies(game.families ?? [], data.settings.hiddenFamilyPrefixes);
  if (groups.length === 0) return null;

  return (
    <Section id="families" title="Families" summary={`${groups.length} ${groups.length === 1 ? 'group' : 'groups'}`}>
      {groups.map(([prefix, labels]) => (
        <IonItem key={prefix}>
          <IonLabel>
            <p>{prefix}</p>
            <div>
              {labels.map(label => (
                <IonChip
                  key={label}
                  outline
                  style={{marginInlineStart: 0}}
                  onClick={onSelect && (() => onSelect({ kind: 'family', value: familyName(prefix, label)}))}
                >
                  {label}
                </IonChip>
              ))}
            </div>
          </IonLabel>
        </IonItem>
      ))}
    </Section>
  )
}