import { useParams } from "react-router";
import { useLibrary } from "../state/libraryContext";
import { IonBackButton, IonButtons, IonContent, IonHeader, IonList, IonPage, IonText, IonTitle, IonToolbar } from "@ionic/react";
import GameListItem from "../components/GameListItem";

export default function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>();
  const { data } = useLibrary();
  const list = data.lists.find(l => l.id === listId);
  const games = data.games.filter(game => list?.gameIds.includes(game.id));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/lists" />
          </IonButtons>
          <IonTitle>{list?.name ?? 'List'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {games.length === 0 && (
          <div className="ion-padding ion-text-center">
            <IonText color="medium">
              <p>Add games to this list from the games page.</p>
            </IonText>
          </div>
        )}
        <IonList>
          {games.map(game => (
            <GameListItem key={game.id} game={game} href={`/tabs/lists/${listId}/games/${game.id}`} />
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  )
}