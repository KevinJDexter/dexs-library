import { IonBadge, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonNote } from "@ionic/react";
import { Game } from "../domain/types";
import { useLibrary } from "../state/libraryContext";
import GameThumb from "./GameThumb";
import { heart, heartOutline } from "ionicons/icons";
import { gameSummary } from "../logic/format";
import { isStale } from "../logic/plays";

export default function GameListItem({ game, href, showOwner = false}: { game: Game, href: string, showOwner?: boolean }) {
  const { data, stats, actions } = useLibrary();
  const gameStats = stats.get(game.id);
  const count = gameStats?.count ?? 0;
  const badgeColor = count === 0 ? 'medium' : isStale(gameStats) ? 'warning' : 'success';
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
          {showOwner && owner && <p>{owner}</p>}
        </IonLabel>
        <IonNote slot="end">
          <IonBadge color={badgeColor}>
            {count === 0 ? 'New' : `${count} ${count === 1 ? 'play' : 'plays'}`}
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