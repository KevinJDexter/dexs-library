import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonNote, IonPage, IonText, IonTitle, IonToolbar, useIonAlert } from "@ionic/react";
import { useLibrary } from "../state/libraryContext";
import { add } from "ionicons/icons";

export default function ListsPage() {
  const { data, actions } = useLibrary();
  const [presentAlert] = useIonAlert();

  const promptForName = (header: string, initial: string, onSave: (name: string) => void) => {
    presentAlert({
      header,
      inputs: [{ name: 'name', type: 'text', value: initial, placeholder: 'e.g. Gencon 2026'}],
      buttons: [
        { text: 'Cancel', role: 'cancel'},
        { 
          text: 'Save',
          handler: (value: { name: string }) => {
            const name = value.name.trim();
            if (!name) return false;
            onSave(name)
          }
        }
      ]
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lists</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => promptForName('New List', '', actions.createList)}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {data.lists.length === 0 && (
          <div className="ion-padding ion-text-center">
            <IonText color="medium">
              <p>Create lists like "Gencon 2026" or "Family Favorites"</p>
            </IonText>
          </div>
        )}
        <IonList>
          {data.lists.map(list => (
            <IonItemSliding key={list.id}>
              <IonItem routerLink={`/tabs/lists/${list.id}`}>
                <IonLabel>{list.name}</IonLabel>
                <IonNote slot="end">{list.gameIds.length}</IonNote>
              </IonItem>
              <IonItemOptions slot="end">
                <IonItemOption onClick={() => promptForName('Rename list', list.name, (name) => actions.renameList(list.id, name))}>
                  Rename
                </IonItemOption>
                <IonItemOption color="danger" onClick={() => actions.deleteList(list.id)}>
                  Delete
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  )
}