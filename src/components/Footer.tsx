import { useContext, useEffect } from "react";
import styled from "styled-components";
import { store } from "../store";

const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

const FooterBar = styled.footer`
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 1.25rem 18px;
    font-size: 12px;
    color: #6b5a60;
    white-space: nowrap;
    background: transparent;
`;

const FooterLink = styled.a`
    color: inherit;
    text-decoration: none;
    transition: color 200ms ${easeOut};

    &:hover {
        color: #9a8088;
    }
`;

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 1.25rem;
    background: rgba(28, 6, 14, 0.5);
    backdrop-filter: blur(14px);
    animation: tos-fade 0.22s ${easeOut};

    @keyframes tos-fade {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
        animation-duration: 0.16s;
    }
`;

const Dialog = styled.div`
    width: min(100%, 46rem);
    border-radius: 22px;
    border: 1px solid #46383e;
    background: #1f171b;
    padding: 1.35rem 1.4rem 1.5rem;
    animation: tos-in 0.28s ${easeOut};

    @keyframes tos-in {
        from {
            opacity: 0;
            transform: scale(0.96);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        animation: tos-fade 0.16s ${easeOut};
    }
`;

const DialogHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
`;

const DialogTitle = styled.h2`
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #f4f4ff;
    white-space: nowrap;
`;

const CloseButton = styled.button`
    display: grid;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    place-items: center;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: #9a8088;
    cursor: pointer;
    transition: background-color 150ms ${easeOut}, color 150ms ${easeOut}, transform 150ms ${easeOut};

    &:hover {
        background: #342428;
        color: #f4f4ff;
    }

    &:active {
        transform: scale(0.97);
    }
`;

const DialogBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14px;
    line-height: 1.5;
    color: #d1c0c6;

    p {
        margin: 0;
    }
`;

const Link = styled.a`
    color: #f4f4ff;
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-color: #6b5a60;

    &:hover {
        text-decoration-color: #f4f4ff;
    }
`;

function CloseIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

export function Footer() {
    const { state, setShowTerms } = useContext(store);
    const tosOpen = state.showTerms;

    useEffect(() => {
        if (!tosOpen) return;

        function onKey(event: KeyboardEvent) {
            if (event.key === "Escape") setShowTerms(false);
        }

        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [tosOpen, setShowTerms]);

    return (
        <>
            <FooterBar>
                <span>
                    logs.lotuslabs.dev is an unofficial chat archive powered by rustlog. Not affiliated with, endorsed by, or sponsored by Twitch Interactive, Inc.
                </span>
                <span aria-hidden="true">·</span>
                <span>
                    from{" "}
                    <FooterLink href="https://lotuslabs.dev">LotusLabs</FooterLink>
                </span>
            </FooterBar>
            {tosOpen && (
                <Overlay onClick={() => setShowTerms(false)}>
                    <Dialog
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="tos-title"
                        onClick={event => event.stopPropagation()}
                    >
                        <DialogHeader>
                            <DialogTitle id="tos-title">Welcome to The LotusLabs Logs</DialogTitle>
                            <CloseButton type="button" aria-label="Close" onClick={() => setShowTerms(false)}>
                                <CloseIcon />
                            </CloseButton>
                        </DialogHeader>
                        <DialogBody>
                            <p>An unofficial Twitch chat archive powered by rustlog. Enter a channel to search, then a username to view that chatter's messages in that channel. Both fields are required.</p>
                            <p>logs.lotuslabs.dev is not affiliated with, endorsed by, or sponsored by Twitch Interactive, Inc. This is a free LotusLabs service, provided as-is, with no guarantee of uptime, accuracy, or continued availability.</p>
                            <p>TOS: Do not use this service for scraping, automated bulk fetching, or anything that overloads the logs instance. Do not use it for illegal, harmful, or abusive activity. We may rate-limit requests, block IPs or user agents, refuse automated traffic, or take the service offline if we believe it is being abused, without prior notice.</p>
                            <p>For questions or concerns, join the <Link href="https://lotuslabs.dev/discord" target="_blank" rel="noopener noreferrer">Discord</Link>.</p>
                        </DialogBody>
                    </Dialog>
                </Overlay>
            )}
        </>
    );
}
