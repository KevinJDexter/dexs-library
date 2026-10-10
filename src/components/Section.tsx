import { ReactNode } from "react";
import { useLibrary } from "../state/libraryContext";
import { IonIcon, IonLabel, IonList, IonListHeader, IonNote } from "@ionic/react";
import { chevronDown, chevronUp } from "ionicons/icons";

interface SectionProps {
  id: string;
  title: string;
  summary?: string;
  children: ReactNode;
}

export default function Section({ id, title, summary, children }: SectionProps) {
  const { data, actions } = useLibrary()
  const collapsed = data.settings.collapsedSections?.includes(id) ?? false;

  return (
    <IonList inset>
      <IonListHeader
        role="button"
        style={{ cursor: 'pointer' }}
        onClick={() => actions.toggleCollapsedSection(id)}
      >
        <IonLabel>{title}</IonLabel>
        {collapsed && summary && <IonNote style={{ marginInlineEnd: 8, fontSize: 14 }}>{summary}</IonNote>}
        <IonIcon icon={collapsed ? chevronDown : chevronUp} style={{ marginInlineEnd: 16 }}/>
      </IonListHeader>
      {!collapsed && children}
    </IonList>
  )
}