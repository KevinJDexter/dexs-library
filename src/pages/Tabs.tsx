import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react";
import { Navigate, Route } from "react-router";
import PagePlaceholder from "./PagePlaceholder";
import { cubeOutline, heartOutline, libraryOutline, listOutline } from "ionicons/icons";
import GameCollectionPage from "../components/GameCollectionPage";
import GameDetailPage from "../components/GameDetailPage";
import SettingsPage from "../components/SettingsPage";
import ListsPage from "../components/ListsPage";
import ListDetailPage from "../components/ListDetailPage";

export default function Tabs() {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="library" element={<GameCollectionPage title="Library" scope="owned" basePath="/tabs/library" />} />
        <Route path="library/game/:gameId" element={<GameDetailPage backHref="/tabs/library" />} />
        <Route path="library/settings" element={<SettingsPage />} />

        <Route path="wishlist" element={<GameCollectionPage title="Wishlist" scope="wishlist" basePath="/tabs/wishlist" />} />
        <Route path="wishlist/game/:gameId" element={<GameDetailPage backHref="/tabs/wishlist" />} />

        <Route path="lists" element={<ListsPage />} />
        <Route path="lists/:listId" element={<ListDetailPage />} />
        <Route path="lists/:listId/games/:gameId" element={<GameDetailPage backHref="/tabs/lists" />} />
        
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