import { IonChip, IonItem, IonLabel, IonList, IonListHeader } from "@ionic/react";
import { Game } from "../domain/types";
import { visibleFamilies } from "../logic/families";
import { useLibrary } from "../state/libraryContext";

export default function FamilyList({ game }: { game: Game }) {
  const { data } = useLibrary();
  const groups = visibleFamilies(game.families ?? [], data.settings.hiddenFamilyPrefixes);
  if (groups.length === 0) return null;

  return (
    <IonList inset>
      <IonListHeader>
        <IonLabel>Families</IonLabel>
      </IonListHeader>
      {groups.map(([prefix, labels]) => (
        <IonItem key={prefix}>
          <IonLabel>
            <p>{prefix}</p>
            <div>
              {labels.map(label => (
                <IonChip key={label} outline style={{marginInlineStart: 0}}>
                  {label}
                </IonChip>
              ))}
            </div>
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  )
}