import React, { useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { OptOutError } from "../errors/OptOutError";
import { useAvailableLogs } from "../hooks/useAvailableLogs";
import { store } from "../store";
import { Log, LoadMonthButton } from "./Log";
import { OptOutMessage } from "./OptOutMessage";

type MonthLog = { year: string; month: string };

const LogContainerDiv = styled.div`
    color: #f4f4ff;
    padding: 2rem;
    padding-top: 2.5rem;
    width: 100%;
`;

const LoadRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 1.25rem;
`;

function logKey(log: MonthLog) {
    return `${log.year}:${log.month}`;
}

export function LogContainer() {
    const { state, setLogFullscreen } = useContext(store);

    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const ctrlKey = isMac ? "metaKey" : "ctrlKey";

    useEffect(() => {
        const listener = function (e: KeyboardEvent) {
            if (e.key === "f" && e[ctrlKey] && !state.settings.twitchChatMode.value) {
                e.preventDefault();
                if (state.activeSearchField) {
                    state.activeSearchField.focus();
                }
            }
        };

        window.addEventListener("keydown", listener);

        return () => window.removeEventListener("keydown", listener);
    }, [state.activeSearchField, state.settings.twitchChatMode.value, ctrlKey]);

    const [availableLogs, err] = useAvailableLogs(state.currentChannel, state.currentUsername);
    const [loaded, setLoaded] = useState<Set<string>>(new Set());
    const [fullscreen, setFullscreen] = useState<MonthLog | null>(null);
    const firstKey = availableLogs[0] ? logKey(availableLogs[0]) : "";

    useEffect(() => {
        setLoaded(new Set(firstKey ? [firstKey] : []));
        setFullscreen(null);
        setLogFullscreen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.currentChannel, state.currentUsername, firstKey]);

    const groups = useMemo(() => {
        const next: Array<{ loaded: boolean; items: MonthLog[] }> = [];
        for (const log of availableLogs) {
            const isLoaded = loaded.has(logKey(log));
            const last = next[next.length - 1];
            if (last && last.loaded === isLoaded) {
                last.items.push(log);
            } else {
                next.push({ loaded: isLoaded, items: [log] });
            }
        }
        return next;
    }, [availableLogs, loaded]);

    const fullscreenIndex = fullscreen
        ? availableLogs.findIndex(log => logKey(log) === logKey(fullscreen))
        : -1;

    const openFullscreen = (log: MonthLog) => {
        setLoaded(current => new Set(current).add(logKey(log)));
        setFullscreen(log);
        setLogFullscreen(true);
    };

    const closeFullscreen = () => {
        setFullscreen(null);
        setLogFullscreen(false);
    };

    const goFullscreen = (index: number) => {
        const log = availableLogs[index];
        if (!log) return;
        openFullscreen(log);
    };

    useEffect(() => {
        if (!fullscreen || fullscreenIndex < 0) return;

        const listener = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

            if (e.key === "Escape") {
                e.preventDefault();
                closeFullscreen();
                return;
            }
            if (e.key === "ArrowLeft" && fullscreenIndex < availableLogs.length - 1) {
                e.preventDefault();
                goFullscreen(fullscreenIndex + 1);
            }
            if (e.key === "ArrowRight" && fullscreenIndex > 0) {
                e.preventDefault();
                goFullscreen(fullscreenIndex - 1);
            }
        };

        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullscreen, fullscreenIndex, availableLogs]);

    if (err instanceof OptOutError) {
        return <OptOutMessage />;
    }

    return <LogContainerDiv>
        {groups.map((group, index) => {
            if (group.loaded) {
                return (
                    <React.Fragment key={`loaded-${index}`}>
                        {group.items.map(log => (
                            <Log
                                key={logKey(log)}
                                year={log.year}
                                month={log.month}
                                onOpenFullscreen={() => openFullscreen(log)}
                            />
                        ))}
                    </React.Fragment>
                );
            }

            return (
                <LoadRow key={`load-${index}`}>
                    {group.items.map(log => (
                        <LoadMonthButton
                            key={logKey(log)}
                            year={log.year}
                            month={log.month}
                            onLoad={() => setLoaded(current => new Set(current).add(logKey(log)))}
                        />
                    ))}
                </LoadRow>
            );
        })}
        {fullscreen && fullscreenIndex >= 0 && createPortal(
            <Log
                year={fullscreen.year}
                month={fullscreen.month}
                fullscreen
                canPrev={fullscreenIndex < availableLogs.length - 1}
                canNext={fullscreenIndex > 0}
                onPrev={() => goFullscreen(fullscreenIndex + 1)}
                onNext={() => goFullscreen(fullscreenIndex - 1)}
                onCloseFullscreen={closeFullscreen}
            />,
            document.body
        )}
    </LogContainerDiv>
}
