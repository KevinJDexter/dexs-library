import { IonBadge, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonNote } from "@ionic/react";
import { Game, PLAY_STATUS_LABELS } from "../domain/types";
import { useLibrary } from "../state/libraryContext";
import GameThumb from "./GameThumb";
import { heart, heartOutline } from "ionicons/icons";
import { gameSummary } from "../logic/format";

const STATUS_COLOR = {
  'not-played': 'medium',
  'tried': 'warning',
  'played': 'success'
}

export default function GameListItem({ game, href }: { game: Game, href: string }) {
  const { data, actions } = useLibrary();
  const ownerId = game.ownership.kind === 'owned' ? game.ownership.ownerId : undefined;
  const owner = data.people.find(person => person.id === ownerId)?.name;

  return (
    <IonItemSliding>
      <IonItem routerLink={href} detail={false}>
        <div slot="start">
          <GameThumb name={game.name} src={game.thumbnail} />
        </div>
        <IonLabel>
          <h2>
            {game.name}
            {game.favorite && <IonIcon icon={heart} color="danger" style={{ marginLeft: 6, verticalAlign: 'middle' }} />}
          </h2>
          <p>{gameSummary(game)}</p>
          {owner && <p>{owner}</p>}
        </IonLabel>
        <IonNote slot="end">
          <IonBadge color={STATUS_COLOR[game.status]}>
            {PLAY_STATUS_LABELS[game.status]}
          </IonBadge>
        </IonNote>
      </IonItem>
      <IonItemOptions slot="end">
        <IonItemOption color={"danger"} onClick={() => actions.updateGame(game.id, { favorite: !game.favorite })}>
          <IonIcon slot="icon-only" icon={game.favorite ? heart : heartOutline} />
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  )
}