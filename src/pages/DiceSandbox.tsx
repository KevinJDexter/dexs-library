import { useRef, useState } from "react";
import DiceRoller, { DiceHandle } from "../components/DiceRoller";
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

export default function DiceSandbox() {
  const die = useRef<DiceHandle>(null);
  const [result, setResult] = useState<number | null>(null)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dice sandbox</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ height: 260 }}>
          <DiceRoller ref={die} />
        </div>
        <IonButton expand="block" onClick={async() => setResult(await die.current?.roll() ?? null)}>
          Roll
        </IonButton>
        { result !== null && (
          <p className="ion-text-center">You rolled a {result}</p>
        )}
      </IonContent>
    </IonPage>
  )
}