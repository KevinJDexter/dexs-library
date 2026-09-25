import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react";
import { Navigate, Route } from "react-router";
import PagePlaceholder from "./PagePlaceholder";
import { cubeOutline, heartOutline, libraryOutline, listOutline } from "ionicons/icons";

export default function Tabs() {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="library" element={<PagePlaceholder title={"Library"} />} />
        <Route path="wishlist" element={<PagePlaceholder title={"Wishlist"} />} />
        <Route path="lists" element={<PagePlaceholder title={"Lists"} />} />
        <Route path="pick" element={<PagePlaceholder title={"Pick a game"} />} />
        <Route index element={<Navigate to="/library" replace />} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="library" href="/tabs/library">
          <IonIcon aria-hidden="true" icon={libraryOutline} />
          <IonLabel>Library</IonLabel>
        </IonTabButton>
        <IonTabButton tab="wishlist" href="/tabs/wishlist">
          <IonIcon aria-hidden="true" icon={heartOutline} />
          <IonLabel>Wishlist</IonLabel>
        </IonTabButton>
        <IonTabButton tab="lists" href="/tabs/lists">
          <IonIcon aria-hidden="true" icon={listOutline} />
          <IonLabel>Lists</IonLabel>
        </IonTabButton>
        <IonTabButton tab="pick" href="/tabs/pick">
          <IonIcon aria-hidden="true" icon={cubeOutline} />
          <IonLabel>Pick</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}