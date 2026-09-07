import { ActionPill } from "./ActionPill";

export function DiscordLink() {
    return (
        <ActionPill
            href="https://lotuslabs.dev/discord"
            iconOnly
            tint="#5865F2"
            aria-label="Discord"
            icon={<img src="/discord.svg" alt="" />}
        />
    );
}
