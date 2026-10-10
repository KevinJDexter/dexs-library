import { IonBadge, IonItem, IonLabel, useIonActionSheet } from "@ionic/react";
import { PersonId } from "../domain/types";
import { useLibrary } from "../state/libraryContext";
import { LooseExpansion, looseExpansions } from "../logic/expansions";
import Section from "./Section";

export default function LooseExpansions({ personId }: { personId: PersonId }) {
  const { data, actions } = useLibrary();
  const [presentActionSheet] = useIonActionSheet();
  const loose = looseExpansions(personId, data.games, data.expansions);
  if (loose.length === 0) return null;

  function choose(expansion: LooseExpansion) {
    presentActionSheet({
      header: expansion.name,
      buttons: [
        expansion.state === 'owned'
          ? { text: 'Wanted instead', handler: () => actions.markExpansionWanted(personId, expansion) }
          : { text: 'Owned now', handler: () => actions.markExpansionOwned(personId, expansion) },
        { text: 'Remove', role: 'destructive', handler: () => actions.clearExpansion(personId, expansion.bggId) },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
  }

  return (
    <Section id="loose-expansions" title="Expansions without their base game" summary={`${loose.length}`}>
      {loose.map(expansion => (
        <IonItem key={expansion.bggId} button detail={false} onClick={() => choose(expansion)}>
          <IonLabel>{expansion.name}</IonLabel>
          {expansion.state === 'owned'
            ? <IonBadge slot="end" color="success">Owned</IonBadge>
            : <IonBadge slot="end" color="warning">Wanted</IonBadge>}
        </IonItem>
      ))}
    </Section>
  );
}