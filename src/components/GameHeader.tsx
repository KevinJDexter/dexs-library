import { ReactNode } from "react";
import { IonChip } from "@ionic/react";
import { Game } from "../domain/types";
import GameThumb from "./GameThumb";
import { gameSummary, listWithMore, playerRange } from "../logic/format";

export type HeaderFields = Pick<Game,
  'name' | 'thumbnail' | 'yearPublished' | 'designers' | 'publishers' | 'categories' |
  'minPlayers' | 'maxPlayers' | 'bestPlayers' | 'recommendedPlayers' | 'playTime' | 'complexity'
>;

interface GameHeaderProps {
  game: HeaderFields;
  thumbSize?: number;
  children?: ReactNode;
}

const line = { margin: '2px 0 0' };

export default function GameHeader({ game, thumbSize = 72, children }: GameHeaderProps) {
  return (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <GameThumb name={game.name} src={game.thumbnail} size={thumbSize} />
        <div>
          <h2 style={{ margin: 0 }}>{game.name}</h2>
          <p style={line}>{gameSummary(game)}</p>
          {game.recommendedPlayers?.length ? (
            <p style={line}>
              Recommended at {playerRange(Math.min(...game.recommendedPlayers), Math.max(...game.recommendedPlayers))}
            </p>
          ) : null}
          <p style={line}>{game.yearPublished ? `Published ${game.yearPublished}` : 'Year unknown'}</p>
          {game.designers?.length ? <p style={line}>Designed by {listWithMore(game.designers)}</p> : null}
          {game.publishers?.length ? <p style={line}>Published by {listWithMore(game.publishers)}</p> : null}
          {children}
        </div>
      </div>
      {game.categories?.length ? (
        <div style={{ marginTop: 8 }}>
          {game.categories.map(category => <IonChip key={category} outline>{category}</IonChip>)}
        </div>
      ) : null}
    </>
  );
}