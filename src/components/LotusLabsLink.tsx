import { ActionPill } from "./ActionPill";

export function LotusLabsLink() {
    return (
        <ActionPill
            href="https://lotuslabs.dev"
            icon={<img src="/lotus.svg" alt="" />}
        >
            LotusLabs
        </ActionPill>
    );
}
