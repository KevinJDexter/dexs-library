import { useEffect, useState } from "react";
import { IonButton, IonContent, IonHeader, IonNote, IonSpinner, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { BggClient, BggGameDetails, BggSearchResult } from "../services/bgg";
import GameHeader from "./GameHeader";
import { listWithMore } from "../logic/format";
import { AddTarget } from "../hooks/useAddGame";

interface GamePreviewProps {
  result: BggSearchResult;
  client: BggClient;
  alreadyAdded: boolean;
  adding: boolean;
  addOptions: { label: string; target: AddTarget }[];
  onAdd: (details: BggGameDetails, target: AddTarget, asGame?: boolean) => void;
  onRemove?: () => void;
}

export default function GamePreview({ result, client, alreadyAdded, adding, addOptions, onAdd, onRemove }: GamePreviewProps) {
  const [details, setDetails] = useState<BggGameDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetails(null);
    setError(null);
    client.getDetails(result.bggId)
      .then(found => !cancelled && setDetails(found))
      .catch(err => !cancelled && setError(String(err.message ?? err)));
    return () => { cancelled = true };
  }, [result.bggId, client]);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{result.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {error && <IonText color="danger"><p>{error}</p></IonText>}
        {!details && !error && <div className="ion-text-center"><IonSpinner /></div>}
        {details && (
          <>
            <GameHeader game={details} thumbSize={96}>
              {details.expansionCatalog?.length ? <p style={{ margin: '2px 0 0' }}>{details.expansionCatalog.length} expansions on BGG</p> : null}
            </GameHeader>

            {details.isExpansion && (
              <IonNote color="warning">
                <p>
                  This is an expansion
                  {details.expansionOf?.length ? ` for ${listWithMore(details.expansionOf.map(ref => ref.name))}` : ''}.
                  You can mark expansions as owned from their base game's page.
                </p>
              </IonNote>
            )}

            <div className="ion-margin-top">
              {alreadyAdded ? (
                onRemove
                  ? <IonButton expand="block" color="medium" onClick={onRemove}>Remove</IonButton>
                  : <IonNote><p className="ion-text-center">In your library</p></IonNote>
              ) : addOptions.map((option, i) => (
                <IonButton
                  key={option.target}
                  expand="block"
                  fill={i === 0 ? 'solid' : 'outline'}
                  disabled={adding}
                  onClick={() => onAdd(details, option.target)}
                >
                  {adding ? 'Adding...' : option.label}
                </IonButton>
              ))}
              {!alreadyAdded && details.isExpansion && (
                <IonButton
                  expand="block"
                  fill="clear"
                  disabled={adding}
                  onClick={() => onAdd(details, addOptions[0].target, true)}
                >
                  Add as a game instead
                </IonButton>
              )}
            </div>
            <IonButton expand="block" fill="clear" href={`https://boardgamegeek.com/boardgame/${details.bggId}`} target="_blank">
              View on BGG
            </IonButton>
          </>
        )}
      </IonContent>
    </>
  );
}