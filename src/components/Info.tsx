import { Info as InfoIcon } from "lucide-react";
import { useContext } from "react";
import { ActionPill } from "./ActionPill";
import { store } from "../store";

export function Info() {
    const { setShowTerms } = useContext(store);

    return (
        <ActionPill
            icon={<InfoIcon strokeWidth={2} aria-hidden="true" />}
            onClick={() => setShowTerms(true)}
        >
            Info
        </ActionPill>
    );
}
