import { Game, GameList, LibraryData, Person, PersonId } from "../domain/types";

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
  | { type: "setGameLists"; gameId: string; listIds: string[]};

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
        lists: state.lists.map(list => ({...list, gameIds: list.gameIds.filter(gameId => gameId !== action.id)}))
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
          lists: state.lists.map(list => ({ ...list, gameIds: list.gameIds.filter(id => !ownedGameIds.includes(id))}))
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
      }
  }
}
