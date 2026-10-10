import { ReactNode } from "react";
import { IonChip } from "@ionic/react";
import { Game } from "../domain/types";
import GameThumb from "./GameThumb";
import { complexityLine, listWithMore, playersLine, timeLine } from "../logic/format";
import { Facet } from "../logic/matching";

export type HeaderFields = Pick<Game,
  'name' | 'thumbnail' | 'yearPublished' | 'designers' | 'publishers' | 'categories' | 'mechanics' |
  'minPlayers' | 'maxPlayers' | 'bestPlayers' | 'recommendedPlayers' | 'playTime' | 'setupTime' | 'complexity'
>;

interface GameHeaderProps {
  game: HeaderFields;
  thumbSize?: number;
  children?: ReactNode;
  onSelect?: (facet: Facet) => void;
}

const line = { margin: '2px 0 0' };

export default function GameHeader({ game, thumbSize = 72, children, onSelect }: GameHeaderProps) {
  const time = timeLine(game);
  const complexity = complexityLine(game);
  return (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <GameThumb name={game.name} src={game.thumbnail} size={thumbSize} />
        <div>
          <h2 style={{ margin: 0 }}>{game.name}</h2>
          <p style={line}>{playersLine(game, true)}</p>
          {time && <p style={line}>{time}</p>}
          {complexity && <p style={line}>{complexity}</p>}
        </div>
      </div>
          

      <div style={{ marginTop: 10, fontSize: 14, opacity: 0.85 }}>
        <p style={line}>{game.yearPublished ? `Published ${game.yearPublished}` : 'Year unknown'}</p>
        {game.designers?.length ? <p style={line}>Designed by {listWithMore(game.designers)}</p> : null}
        {game.publishers?.length ? <p style={line}>Published by {listWithMore(game.publishers)}</p> : null}
        {children}
      </div>

      {game.categories?.length ? (
        <div style={{ marginTop: 8 }}>
          {game.categories.map(category => (
            <IonChip key={category} outline onClick={onSelect && (() => onSelect({ kind: 'category', value: category }))}>
              {category}
            </IonChip>
          ))}
        </div>
      ) : null}

      {game.mechanics?.length ? (
        <div style={{ marginTop: 8 }}>
          {game.mechanics.map(mechanic => (
            <IonChip key={mechanic} outline onClick={onSelect && (() => onSelect({ kind: 'mechanic', value: mechanic }))}>
              {mechanic}
            </IonChip>
          ))}
        </div>
      ) : null}
    </>
  );
}