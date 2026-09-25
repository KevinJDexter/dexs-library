import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

// Temporary stand-in for unbuild pages
export default function PagePlaceholder({ title }: { title: string }) {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">{title} is coming soon.</IonContent>
    </IonPage>
  );
}