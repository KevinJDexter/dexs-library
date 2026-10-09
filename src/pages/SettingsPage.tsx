import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonTitle, IonToolbar, useIonAlert } from "@ionic/react";
import { useLibrary } from "../state/libraryContext";
import { useState } from "react";
import { Person } from "../domain/types";
import { trashOutline } from "ionicons/icons";
import { bggClient } from "../services/bggXmlClient";

export default function SettingsPage() {
  const { data, actions } = useLibrary();
  const [ newName, setNewName ] = useState('');
  const [ refreshStatus, setRefreshStatus ] = useState<string | null>(null)
  const [ presentAlert ] = useIonAlert();
  
  const bggIds = [...new Set(data.games.flatMap(game => game.bggId === undefined ? [] : [game.bggId]))];

  async function refreshAll() {
    setRefreshStatus(`Refreshing ${bggIds.length} games...`);
    try {
      const details = await bggClient.getDetailsMany(bggIds);
      actions.updateBggDetails(details);
      setRefreshStatus(`Updated ${details.length} ${details.length === 1 ? "game" : "games"}`);
    } catch (err) {
      setRefreshStatus(`Stopped: ${(err as Error).message}`);
    }
  }
  
  function addPerson() {
    const name = newName.trim();
    if (!name) return;
    actions.addPerson(name);
    setNewName('');
  }

  function confirmRemove(person: Person) {
    const gameCount = data.games.filter(game => game.ownership.kind === 'owned' && game.ownership.ownerId === person.id).length;
    const gamesNote = gameCount > 0
      ? `${person.name} has ${gameCount} ${gameCount === 1 ? 'game' : 'games'} that will be deleted. `
      : '';

    presentAlert({
      header: `Remove ${person.name}?`,
      message: `${gamesNote}This action can't be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel'},
        { text: 'Remove', role: 'destructive', handler: () => actions.removePerson(person.id)}
      ]
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/library" />
          </IonButtons>
          <IonTitle>
            Settings
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonListHeader>
            <IonLabel>People</IonLabel>
          </IonListHeader>
          {data.people.map((person, i) => (
            <IonItem key={person.id}>
              <IonInput
                label={`Person ${i + 1}`}
                value={person.name}
                onIonChange={(e) => e.detail.value?.trim() && actions.renamePerson(person.id, e.detail.value.trim())}
              />
              <IonButton
                slot="end"
                fill="clear"
                color="danger"
                disabled={data.people.length <= 1}
                onClick={() => confirmRemove(person)}
              >
                <IonIcon slot="icon-only" icon={trashOutline} />
              </IonButton>
            </IonItem>
          ))}
          <IonItem>
            <IonInput
              label="Add person"
              placeholder="Name"
              value={newName}
              onIonInput={(e) => setNewName(e.detail.value ?? '')}
              onKeyDown={(e) => e.key === 'Enter' && addPerson()}
            />
            <IonButton slot="end" disabled={!newName.trim()} onClick={addPerson}>
              Add
            </IonButton>
          </IonItem>
        </IonList>
        <IonList inset>
          <IonListHeader>
            <IonLabel>BoardGameGeek</IonLabel>
          </IonListHeader>
          <IonItem button detail={false} disabled={bggIds.length === 0 || refreshStatus?.startsWith('Refreshing')} onClick={refreshAll}>
            <IonLabel>
              Refresh all games from BGG
              <p>{refreshStatus ?? `${bggIds.length} games, about ${Math.ceil(bggIds.length / 20) * 2} seconds`}</p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  )
}