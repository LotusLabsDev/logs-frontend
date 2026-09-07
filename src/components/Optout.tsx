import { MessageCircleX } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { store } from "../store";
import { ActionPill } from "./ActionPill";

const OPT_OUT_VIA_DISCORD = true;
const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

export function Optout() {
    const { state, setShowOptout } = useContext(store);

    const handleClick = () => {
        setShowOptout(!state.showOptout);
    }

    return (
        <ActionPill
            icon={<MessageCircleX strokeWidth={2} aria-hidden="true" />}
            active={state.showOptout}
            onClick={handleClick}
        >
            Opt out
        </ActionPill>
    );
}

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
    width: fit-content;
    max-width: min(100%, 46rem);
    border-radius: 22px;
    border: 1px solid #46383e;
    background: #1f171b;
    padding: 1.35rem 1.4rem 1.5rem;
    text-align: center;
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

    a {
        color: #f4f4ff;
        text-decoration: underline;
        text-underline-offset: 2px;
        text-decoration-color: #6b5a60;
    }

    a:hover {
        text-decoration-color: #f4f4ff;
    }

    a code {
        cursor: pointer;
        transition: background-color 150ms ${easeOut};
    }

    a:hover code {
        background: #342428;
    }

    code {
        display: inline-block;
        background: #241c20;
        padding: 0.15rem 0.5rem;
        border-radius: 8px;
        color: #f4f4ff;
    }

    .command {
        display: inline-block;
        background: #241c20;
        padding: 0.5rem 0.75rem;
        border-radius: 12px;
        color: #f4f4ff;
    }

    .generator {
        margin-top: 0.5rem;
        display: flex;
        gap: 0.75rem;
        align-items: center;
        justify-content: center;

        input {
            background: #241c20;
            border: 1px solid #46383e;
            color: #f4f4ff;
            padding: 0.6rem 0.9rem;
            font-size: 1rem;
            text-align: center;
            border-radius: 999px;
            font-family: Satoshi, ui-sans-serif, sans-serif;
        }

        button {
            height: 40px;
            padding: 0 18px;
            border: none;
            border-radius: 999px;
            background: #fff5f7;
            color: #14080c;
            font-family: Satoshi, ui-sans-serif, sans-serif;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
        }

        button:hover {
            background: #cbb8be;
        }
    }

    .small {
        font-size: 0.8rem;
        color: #8a767e;
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

function DiscordOptoutCopy() {
    return (
        <p>
            To opt out, head to the <a href="https://lotuslabs.dev/discord" target="_blank" rel="noopener noreferrer">Discord</a> and look in the channel <a href="https://discord.com/channels/1308462894354010132/1546376047539523694" target="_blank" rel="noopener noreferrer"><code>#logs-opt-out</code></a>
        </p>
    );
}

function CommandOptoutCopy() {
    const { state } = useContext(store);
    const [code, setCode] = useState("");

    const generateCode = () => {
        fetch(state.apiBaseUrl + "/optout", { method: "POST" }).then(res => res.json()).then(setCode).catch(console.error);
    };

    return (
        <>
            <p>
                You can opt out from being logged. This will also delete all of your existing logs!<br />
                This applies to all chats of that rustlog instance.<br />
                Opting out is permanent, there is no reverse action. So think twice if you want to opt out.
            </p>
            <p>
                If you still want to optout generate a token here and paste the command into a logged chat.<br />
                Note that there might not be a confirmation message.
            </p>
            <div><code className="command">!rustlog optout {"<code>"}</code></div>
            <div className="generator">
                <input readOnly type="text" value={code} />
                <button type="button" onClick={generateCode}>Generate code</button>
            </div>
            {code && <p className="small">
                This code is valid for 60 seconds
            </p>}
        </>
    );
}

export function OptoutPanel() {
    const { state, setShowOptout } = useContext(store);
    const open = state.showOptout;

    useEffect(() => {
        if (!open) return;

        function onKey(event: KeyboardEvent) {
            if (event.key === "Escape") setShowOptout(false);
        }

        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, setShowOptout]);

    if (!open) return null;

    return (
        <Overlay onClick={() => setShowOptout(false)}>
            <Dialog
                role="dialog"
                aria-modal="true"
                aria-labelledby="optout-title"
                onClick={event => event.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle id="optout-title">Opt out</DialogTitle>
                    <CloseButton type="button" aria-label="Close" onClick={() => setShowOptout(false)}>
                        <CloseIcon />
                    </CloseButton>
                </DialogHeader>
                <DialogBody>
                    {OPT_OUT_VIA_DISCORD ? <DiscordOptoutCopy /> : <CommandOptoutCopy />}
                </DialogBody>
            </Dialog>
        </Overlay>
    );
}
