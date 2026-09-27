import { IonBackButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { useLibrary } from "../state/libraryContext";

export default function SettingsPage() {
  const { data, actions } = useLibrary();

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
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  )
}