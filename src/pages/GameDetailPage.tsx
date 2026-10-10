import { useLocation, useParams } from "react-router";
import { useLibrary } from "../state/libraryContext";
import { IonBackButton, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToggle, IonToolbar, useIonAlert, useIonRouter, useIonToast } from "@ionic/react";
import { Ownership } from "../domain/types";
import GameHeader from "../components/GameHeader";
import { useState } from "react";
import { bggClient } from "../services/bggXmlClient";
import { refreshOutline } from "ionicons/icons";
import PlayHistory from "../components/PlayHistory";
import ExpansionChecklist from "../components/ExpansionChecklist";
import RelatedGames from "../components/RelatedGames";
import FamilyList from "../components/FamilyList";
import Section from "../components/Section";
import { collectionFor, Facet } from "../logic/matching";
import MatchingGames from "../components/MatchingGames";
import MechanicList from "../components/MechanicList";

export default function GameDetailPage({backHref}: {backHref: string}) {
  const { gameId, listId } = useParams<{ gameId: string, listId?: string }>();
  const { data, actions } = useLibrary();
  const [ presentAlert ] = useIonAlert();
  const router = useIonRouter();
  const [ presentToast ] = useIonToast();
  const [ refreshing, setRefreshing ] = useState(false);
  const [ facet, setFacet ] = useState<Facet | null>(null);
  const location = useLocation();

  const game = data.games.find(g => g.id === gameId);

  async function refreshFromBgg() {
    if (!game?.bggId) return;
    setRefreshing(true);
    try {
      const details = await bggClient.getDetails(game.bggId);
      actions.updateBggDetails([details]);
      presentToast({ message: "Updated from BGG", duration: 1000 });
    } catch (err) {
      presentToast({ message: `Couldn't refresh: ${(err as Error).message}`, duration: 3000, color: 'danger' });
    } finally {
      setRefreshing(false);
    }
  }

  if (!game) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={backHref} />
            </IonButtons>
            <IonTitle>
              Game not found
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          This game is no longer in your library.
        </IonContent>
      </IonPage>
    )
  }

  const ownershipValue = game.ownership.kind === 'owned' ? game.ownership.ownerId : 'wishlist';
  const setOwnership = (value: string) => {
    const ownership: Ownership = value === 'wishlist' ? { kind: 'wishlist' } : { kind: 'owned', ownerId: value };
    actions.updateGame(game.id, { ownership });
  }
  const listIdsForGame = data.lists.filter(list => list.gameIds.includes(game.id)).map(list => list.id);
  const hrefFor = (id: string) => location.pathname.replace(/[^/]+$/, id);

  const confirmDelete = () => {
    presentAlert({
      header: `Remove ${game.name}`,
      message: "It will also be removed from your lists",
      buttons: [
        { text: "Cancel", role: "cancel" },
        { text: "Remove", role: "destructive", handler: () => {
          actions.removeGame(game.id);
          router.goBack();
        }}
      ]
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={backHref}/>
          </IonButtons>
          <IonTitle>{game.name}</IonTitle>
          {game.bggId && (
            <IonButtons slot="end">
              <IonButton onClick={refreshFromBgg} disabled={refreshing} aria-label="Refresh from BGG">
                {refreshing ? <IonSpinner name="crescent" /> : <IonIcon slot="icon-only" icon={refreshOutline} />}
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <GameHeader game={game} onSelect={setFacet}/>
          {game.syncedAt && <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.6 }}>BGG data from {new Date(game.syncedAt).toLocaleDateString()}</p>}
        </div>

        <IonList inset>
          <IonItem>
            <IonToggle checked={game.favorite} onIonChange={(e) => actions.updateGame(game.id, {'favorite': e.detail.checked})}>
              Favorite
            </IonToggle>
          </IonItem>
          <IonItem>
            <IonSelect label="Owner" value={ownershipValue} onIonChange={(e) => setOwnership(e.detail.value)}>
              {data.people.map(person => (
                <IonSelectOption key={person.id} value={person.id}>
                  {person.name}
                </IonSelectOption>
              ))}
              <IonSelectOption value={'wishlist'}>Wishlist</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonInput
              label="Setup Time (min)"
              type="number"
              inputMode="numeric"
              min={0}
              value={game.setupTime}
              onIonChange={(e) => actions.updateGame(game.id, {'setupTime': e.detail.value && Number(e.detail.value) > 0 ? Number(e.detail.value) : undefined})}
            />
          </IonItem>
        </IonList>

        <PlayHistory game={game} />

        <Section id="lists" title="Lists" summary={`In ${listIdsForGame.length} of ${data.lists.length}`}>
          {data.lists.length === 0 && (
            <IonItem>
              <IonLabel color="medium">Create Lists in the Lists tab</IonLabel>
            </IonItem>
          )}
          {data.lists.map(list => (
            <IonItem key={list.id}>
              <IonCheckbox checked={listIdsForGame.includes(list.id)} onIonChange={(e) => {
                actions.setGameLists(game.id, e.detail.checked ? [...listIdsForGame, list.id] : [...listIdsForGame.filter(id => id !== list.id)])
              }}>
                {list.name}
              </IonCheckbox>
            </IonItem>
          ))}
        </Section>

        <ExpansionChecklist game={game} />

        <RelatedGames game={game} hrefFor={hrefFor} />

        <MechanicList game={game} onSelect={setFacet} />

        <FamilyList game={game} onSelect={setFacet} />

        <div className="ion-padding">
          <IonButton expand="block" color="danger" fill="outline" onClick={confirmDelete}>
            Remove Game
          </IonButton>
        </div>
      </IonContent>

      <MatchingGames
        facet={facet}
        collection={collectionFor(game, data, listId)}
        currentGameId={game.id}
        hrefFor={hrefFor}
        onClose={() => setFacet(null)}
      />
    </IonPage>
  )
}