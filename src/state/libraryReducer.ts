import { Game, GameList, LibraryData, Person, PersonId, Play } from "../domain/types";

export type LibraryAction =
  | { type: "hydrate"; data: LibraryData}
  | { type: "addGame"; game: Game}
  | { type: "updateGame"; id: string; patch: Partial<Omit<Game, "id">> }
  | { type: "removeGame"; id: string}
  | { type: "addPerson"; person: Person }
  | { type: "renamePerson"; id: PersonId, name: string }
  | { type: "removePerson"; id: PersonId }
  | { type: "createList"; list: GameList}
  | { type: "renameList"; id: string, name: string}
  | { type: "deleteList"; id: string}
  | { type: "setGameLists"; gameId: string; listIds: string[]}
  | { type: "updateBggDetails"; details: BggUpdate[]; syncedAt: string }
  | { type: "logPlay"; play: Play }
  | { type: "removePlay"; id: string };

export type BggUpdate = Partial<Omit<Game, "id">> & { bggId: number };

export function libraryReducer (state: LibraryData, action: LibraryAction): LibraryData {
  switch (action.type) {
    case "hydrate":
      return action.data;
    case "addGame":
      return {...state, games: [...state.games, action.game]};
    case "updateGame":
      return {
        ...state,
        games: state.games.map(game => game.id === action.id ? {...game, ...action.patch } : game),
      };
    case "removeGame":
      return {
        ...state,
        games: state.games.filter(game => game.id !== action.id),
        lists: state.lists.map(list => ({...list, gameIds: list.gameIds.filter(gameId => gameId !== action.id)})),
        plays: state.plays.filter(play => play.gameId !== action.id),
      };
    case "addPerson":
      return {
        ...state,
        people: [...state.people, action.person]
      }
    case "renamePerson":
      return {
        ...state,
        people: state.people.map(person => person.id === action.id ? { ...person, name: action.name } : person )
      };
    case "removePerson":
      if (state.people.length <= 1) return state;
      else {
        const ownedGameIds = state.games.filter(game => game.ownership.kind === 'owned' && game.ownership.ownerId === action.id).map(game => game.id);
        const remainingGames = state.games.filter(game => game.ownership.kind === 'wishlist' || game.ownership.ownerId !== action.id);

        return {
          ...state,
          people: state.people.filter(person => person.id !== action.id),
          games: remainingGames,
          lists: state.lists.map(list => ({ ...list, gameIds: list.gameIds.filter(id => !ownedGameIds.includes(id))})),
          plays: state.plays.filter(play => !ownedGameIds.includes(play.gameId)),
        }
      }
    case "createList":
      return {
        ...state,
        lists: [...state.lists, action.list],
      };
    case "renameList":
      return {
        ...state, 
        lists: state.lists.map(list => list.id === action.id ? { ...list, name: action.name } : list )
      };
    case "deleteList":
      return {
        ...state,
        lists: state.lists.filter(list => list.id !== action.id)
      };
    case "setGameLists":
      return {
        ...state,
        lists: state.lists.map(list => {
          const shouldContain = action.listIds.includes(list.id);
          const doesContain = list.gameIds.includes(action.gameId);
          if (shouldContain === doesContain) return list;
          return {
            ...list,
            gameIds: shouldContain
              ? [...list.gameIds, action.gameId]
              : list.gameIds.filter(id => id !== action.gameId)
          }
        })
      };
    case "updateBggDetails": {
      const byBggId = new Map(action.details.map(details => [details.bggId, details]));
      console.log(action.details)
      return {
        ...state,
        // Every copy of the game is updated, e.g. when two people own Azul.
        games: state.games.map(game => {
          const details = game.bggId === undefined ? undefined : byBggId.get(game.bggId);
          return details ? { ...game, ...details, syncedAt: action.syncedAt } : game;
        }),
      };
    };
    case "logPlay":
      return {
        ...state,
        plays: [...state.plays, action.play]
      }
    case "removePlay":
      return {
        ...state,
        plays: state.plays.filter(play => play.id !== action.id)
      }
  }
}
