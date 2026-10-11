import { useState } from "react";
import { IonButton, IonChip, IonIcon, IonLabel, useIonAlert } from "@ionic/react";
import { addOutline, closeCircle } from "ionicons/icons";
import { FilterPreset } from "../domain/types";
import { countActiveFilters, GameFilters, sameFilters } from "../logic/filters";
import { useLibrary } from "../state/libraryContext";

interface FilterPresetsProps {
  filters: GameFilters;
  onApply: (filters: GameFilters) => void;
}

export default function FilterPresets({ filters, onApply }: FilterPresetsProps) {
  const { data, actions } = useLibrary();
  const [presentAlert] = useIonAlert();
  const [editing, setEditing] = useState(false);
  const presets = data.settings.filterPresets;

  function askForName() {
    presentAlert({
      header: 'Save these filters',
      inputs: [{ name: 'name', type: 'text', placeholder: "e.g. Joy's unplayed 2-player games" }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (values: { name?: string }) => {
            const name = values.name?.trim();
            if (!name) return false; // keeps the alert open
            actions.savePreset(name, filters);
          },
        },
      ],
    });
  }

  function confirmDelete(preset: FilterPreset) {
    presentAlert({
      header: `Delete "${preset.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => actions.deletePreset(preset.id) },
      ],
    });
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      {presets.map(preset => {
        const active = sameFilters(preset.filters, filters);
        return (
          <IonChip
            key={preset.id}
            color={active ? 'primary' : undefined}
            outline={!active}
            onClick={() => (editing ? confirmDelete(preset) : onApply(preset.filters))}
          >
            <IonLabel>{preset.name}</IonLabel>
            {editing && <IonIcon icon={closeCircle} color="danger" />}
          </IonChip>
        );
      })}
      {!editing && (
        <IonChip outline disabled={countActiveFilters(filters) === 0} onClick={askForName}>
          <IonIcon icon={addOutline} />
          <IonLabel>Save filters</IonLabel>
        </IonChip>
      )}
      {presets.length > 0 && (
        <IonButton fill="clear" size="small" onClick={() => setEditing(!editing)}>
          {editing ? 'Done' : 'Edit'}
        </IonButton>
      )}
    </div>
  );
}