import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Game, Person, PersonId } from "../domain/types";
import { emptyLibrary, loadLibrary, saveLibrary } from "../storage/LibraryRepository";
import { BggUpdate, libraryReducer } from "./libraryReducer";
import { newId } from "../domain/id";

type NewGame = Omit<Game, "id" >

function useLibraryStore() {
  const [data, dispatch] = useReducer(libraryReducer, undefined, emptyLibrary);
  const [ready, setReady] = useState(false);
  const skipNextSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    loadLibrary().then((library) => {
      if (cancelled) return;
      dispatch({ type: 'hydrate', data: library });
      setReady(true);
    });
    return () => {
      cancelled = true;
    }
  }, [])

  useEffect(() => {
    if (!ready) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveLibrary(data).catch(err => console.error("Error saving data", err))
  }, [data, ready])

  const actions = useMemo(
    () => ({
      addGame: (newGame: NewGame) => {
        const game = {...newGame, id: newId()};
        dispatch({ type: 'addGame', game });
        return game;
      },
      updateGame: (id: string, patch: Partial<Omit<Game, 'id'>>) => (
        dispatch({ type: 'updateGame', id, patch })
      ),
      removeGame: (id: string) => (
        dispatch({ type: 'removeGame', id })
      ),
      addPerson: ( name: string ) => {
        const person: Person = { id: newId(), name };
        dispatch({ type: 'addPerson', person });
        return person
      },
      renamePerson: (id: PersonId, name: string) => (
        dispatch({ type: 'renamePerson', id, name })
      ),
      removePerson: (id: PersonId) => (
        dispatch({ type: 'removePerson', id})
      ),
      createList: (name: string) => {
        const list = { id: newId(), name, gameIds: []}
        dispatch({ type: 'createList', list })
        return list;
      },
      renameList: (id: string, name: string) => (
        dispatch({ type: 'renameList', id, name })
      ),
      deleteList: (id: string) => (
        dispatch({ type: 'deleteList', id })
      ),
      setGameLists: (gameId: string, listIds: string[]) => (
        dispatch({ type: 'setGameLists', gameId, listIds })
      ),
      updateBggDetails: (details: BggUpdate[]) => (
        dispatch({ type: 'updateBggDetails', details, syncedAt: new Date().toISOString() })
      )
    }),
    []
  )

  return {data, ready, actions};
}

type LibraryContextValue = ReturnType<typeof useLibraryStore>;

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const store = useLibraryStore();
  if (!store.ready) return null;
  return <LibraryContext.Provider value={store}>
    {children}
  </LibraryContext.Provider>
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) throw new Error ("useLibrary must be inside LibraryProvider");
  return context;
}