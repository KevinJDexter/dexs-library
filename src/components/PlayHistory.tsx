import { IonButton, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonNote, useIonAlert } from "@ionic/react";
import { Game } from "../domain/types";
import { useLibrary } from "../state/libraryContext";
import { describeAgo, formatDate, today } from "../logic/dates";
import { useState } from "react";
import Section from "./Section";

const SHOWN = 5;

export default function PlayHistory({ game }: {game: Game}) {
  const { data, stats, actions } = useLibrary();
  const [ presentAlert ] = useIonAlert();
  const [ showAll, setShowAll ] = useState(false);

  const gameStats = stats.get(game.id);
  const count = gameStats?.count ?? 0;
  const plays = data.plays
    .filter(play => play.gameId === game.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const shown = showAll ? plays : plays.slice(0, SHOWN);

  function askForDate() {
    presentAlert({
      header: `Log a play of ${game.name}`,
      inputs: [{ name: 'date', type: 'date', value: today(), max: today() }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Log', handler: (values: {date?: string}) => { actions.logPlay(game.id, values.date || today()) } },
      ]
    });
  }

  return (
    <Section id="plays" title="Plays" summary={count === 0 ? 'Never played' : `${count} ${count === 1 ? 'play' : 'plays'}`}>
      <IonItem lines="none">
        <IonLabel>
          <h2>{count === 0 ? "Never played" : `Played ${count} ${count === 1 ? "time" : "times"}`}</h2>
          {gameStats?.lastPlayed && <p>Last played {describeAgo(gameStats.lastPlayed)}</p>}
        </IonLabel>
      </IonItem>
      <div className="ion-padding-horizontal" style={{ display: 'flex', gap: 8 }}>
        <IonButton style={{ flex: 1 }} onClick={(() => actions.logPlay(game.id))}>Played today</IonButton>
        <IonButton style={{ flex: 1 }} fill="outline" onClick={askForDate}>Another day</IonButton>
      </div>
      <IonItem>
        <IonInput
          label="Plays before logging"
          type="number"
          inputMode="numeric"
          min={0}
          value={game.priorPlays ?? 0}
          onIonChange={(e) => {
            const value = Math.max(0, Math.floor(Number(e.detail.value) || 0));
            actions.updateGame(game.id, { priorPlays: value || undefined});
          }}
        />
      </IonItem>
      {shown.map(play => (
        <IonItemSliding key={play.id}>
          <IonItem>
            <IonLabel>{formatDate(play.date)}</IonLabel>
            <IonNote slot="end">{describeAgo(play.date)}</IonNote>
          </IonItem>
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={() => actions.removePlay(play.id)}>Delete</IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      ))}
      {plays.length > SHOWN && (
        <IonItem button detail={false} onClick={() => setShowAll(!showAll)}>
          <IonLabel color="primary">{showAll ? 'Show fewer' : `Show all ${plays.length} plays`}</IonLabel>
        </IonItem>
      )}
    </Section>
  )
}