import { Webhook } from "lucide-react";
import { useContext } from "react";
import { store } from "../store";
import { ActionPill } from "./ActionPill";

export function Docs() {
    const { state } = useContext(store);

    const handleClick = () => {
        window.location.href = `${state.apiBaseUrl}/docs`;
    };

    return (
        <ActionPill
            icon={<Webhook strokeWidth={2} aria-hidden="true" />}
            onClick={handleClick}
        >
            Docs
        </ActionPill>
    );
}
