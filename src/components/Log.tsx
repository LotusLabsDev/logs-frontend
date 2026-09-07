import { ChevronLeft, ChevronRight, FileDown, Maximize2, Minimize2, Search } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { formatLogMonth } from "../services/formatLogMonth";
import { getUserId, isUserId } from "../services/isUserId";
import { store } from "../store";
import { ContentLog } from "./ContentLog";
import { TwitchChatContentLog } from "./TwitchChatLogContainer";

const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

const LogCard = styled.div<{ $fullscreen?: boolean }>`
    --log-pad: 12px;
    --search-radius: 20px;
    position: ${props => props.$fullscreen ? "fixed" : "relative"};
    inset: ${props => props.$fullscreen ? "0" : "auto"};
    z-index: ${props => props.$fullscreen ? "50" : "auto"};
    display: ${props => props.$fullscreen ? "flex" : "block"};
    flex-direction: column;
    height: ${props => props.$fullscreen ? "100dvh" : "auto"};
    background: #1f171b;
    border: ${props => props.$fullscreen ? "none" : "1px solid #46383e"};
    border-radius: ${props => props.$fullscreen ? "0" : "calc(var(--search-radius) + var(--log-pad))"};
    padding: ${props => props.$fullscreen ? "1rem 1.25rem 1.25rem" : "var(--log-pad)"};
    margin-top: ${props => props.$fullscreen ? "0" : "1.25rem"};
`;

const Toolbar = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    flex-shrink: 0;
    gap: 12px;
    margin-bottom: 12px;
`;

const SearchBar = styled.label`
    box-sizing: border-box;
    display: flex;
    width: 440px;
    max-width: 100%;
    justify-self: start;
    align-items: center;
    gap: 12px;
    height: 56px;
    border-radius: var(--search-radius);
    border: 1px solid #46383e;
    background: #241c20;
    padding: 8px 16px 8px 20px;
    transition: border-color 200ms ${easeOut};

    &:focus-within {
        border-color: #7a6870;
    }

    svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        color: #9a8088;
    }
`;

const SearchInput = styled.input`
    min-width: 0;
    flex: 1;
    border: none;
    background: transparent;
    padding: 0;
    font-family: Satoshi, ui-sans-serif, sans-serif;
    font-size: 15px;
    color: #f4f4ff;
    outline: none;

    &::placeholder {
        color: #8a767e;
    }
`;

const MonthTitle = styled.h2`
    margin: 0;
    padding: 0 4px;
    font-family: Satoshi, ui-sans-serif, sans-serif;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: -0.02em;
    color: #f4f4ff;
    white-space: nowrap;
`;

const TitleNav = styled.div`
    display: flex;
    align-items: center;
    gap: 28px;
    justify-self: center;
    color: #f4f4ff;
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    justify-self: end;
    gap: 12px;
`;

const IconButton = styled.button<{ $disabled?: boolean }>`
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    padding: 0;
    border-radius: var(--search-radius);
    border: 1px solid #46383e;
    background: #241c20;
    color: #f4f4ff;
    cursor: ${props => props.$disabled ? "not-allowed" : "pointer"};
    opacity: ${props => props.$disabled ? 0.35 : 1};
    transition: border-color 200ms ${easeOut}, background-color 200ms ${easeOut}, transform 160ms ${easeOut}, opacity 200ms ${easeOut};

    svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }

    &:hover {
        border-color: ${props => props.$disabled ? "#46383e" : "#7a6870"};
        background: ${props => props.$disabled ? "#241c20" : "#342428"};
    }

    &:active {
        transform: ${props => props.$disabled ? "none" : "scale(0.97)"};
    }
`;

const DownloadButton = styled.button`
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    justify-self: end;
    gap: 12px;
    height: 56px;
    padding: 0 20px;
    border-radius: var(--search-radius);
    border: 1px solid #46383e;
    background: #241c20;
    color: #f4f4ff;
    font-family: Satoshi, ui-sans-serif, sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 200ms ${easeOut}, background-color 200ms ${easeOut}, transform 160ms ${easeOut};

    svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }

    &:hover {
        border-color: #7a6870;
        background: #342428;
    }

    &:active {
        transform: scale(0.97);
    }
`;

const LoadButton = styled.button`
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
    transition: background-color 200ms ${easeOut}, transform 160ms ${easeOut};

    &:hover {
        background: #cbb8be;
    }

    &:active {
        transform: scale(0.97);
    }
`;

export function LoadMonthButton({ year, month, onLoad }: { year: string, month: string, onLoad: () => void }) {
    return (
        <LoadButton type="button" onClick={onLoad}>Load {formatLogMonth(year, month)}</LoadButton>
    );
}

export function Log({
    year,
    month,
    fullscreen = false,
    onOpenFullscreen,
    onCloseFullscreen,
    onPrev,
    onNext,
    canPrev = false,
    canNext = false,
}: {
    year: string,
    month: string,
    fullscreen?: boolean,
    onOpenFullscreen?: () => void,
    onCloseFullscreen?: () => void,
    onPrev?: () => void,
    onNext?: () => void,
    canPrev?: boolean,
    canNext?: boolean,
}) {
    const { state, setState } = useContext(store);
    const [searchText, setSearchText] = useState("");
    const search = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (state.settings.twitchChatMode.value) return;
        setState({ ...state, activeSearchField: search.current });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.settings.twitchChatMode.value, year, month, fullscreen]);

    useEffect(() => {
        if (!fullscreen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [fullscreen]);

    const downloadTxt = () => {
        let txtHref = `${state.apiBaseUrl}`;
        if (state.currentChannel && isUserId(state.currentChannel)) {
            txtHref += `/channelid/${getUserId(state.currentChannel)}`;
        } else {
            txtHref += `/channel/${state.currentChannel}`;
        }

        if (state.currentUsername && isUserId(state.currentUsername)) {
            txtHref += `/userid/${getUserId(state.currentUsername)}`;
        } else {
            txtHref += `/user/${state.currentUsername}`;
        }

        txtHref += `/${year}/${month}?reverse`;
        window.open(txtHref, "__blank", "noopener,noreferrer");
    };

    const monthTitle = formatLogMonth(year, month);

    return <LogCard $fullscreen={fullscreen}>
        <Toolbar>
            {!state.settings.twitchChatMode.value ? (
                <SearchBar>
                    <Search strokeWidth={2} aria-hidden="true" />
                    <SearchInput
                        ref={search}
                        value={searchText}
                        onChange={event => setSearchText(event.target.value)}
                        onFocus={() => setState({ ...state, activeSearchField: search.current })}
                        placeholder="Search"
                        aria-label="Search"
                    />
                </SearchBar>
            ) : <span />}
            <TitleNav>
                {fullscreen && (
                    <IconButton
                        type="button"
                        $disabled={!canPrev}
                        disabled={!canPrev}
                        onClick={onPrev}
                        aria-label="Previous month"
                    >
                        <ChevronLeft strokeWidth={2} aria-hidden="true" />
                    </IconButton>
                )}
                <MonthTitle>{monthTitle}</MonthTitle>
                {fullscreen && (
                    <IconButton
                        type="button"
                        $disabled={!canNext}
                        disabled={!canNext}
                        onClick={onNext}
                        aria-label="Next month"
                    >
                        <ChevronRight strokeWidth={2} aria-hidden="true" />
                    </IconButton>
                )}
            </TitleNav>
            <Actions>
                <DownloadButton type="button" onClick={downloadTxt}>
                    <FileDown strokeWidth={2} aria-hidden="true" />
                    Download
                </DownloadButton>
                {fullscreen ? (
                    <IconButton type="button" onClick={onCloseFullscreen} aria-label="Exit fullscreen">
                        <Minimize2 strokeWidth={2} aria-hidden="true" />
                    </IconButton>
                ) : (
                    <IconButton type="button" onClick={onOpenFullscreen} aria-label="Fullscreen">
                        <Maximize2 strokeWidth={2} aria-hidden="true" />
                    </IconButton>
                )}
            </Actions>
        </Toolbar>
        {!state.settings.twitchChatMode.value && <ContentLog year={year} month={month} searchText={searchText} fill={fullscreen} />}
        {state.settings.twitchChatMode.value && <TwitchChatContentLog year={year} month={month} fill={fullscreen} />}
    </LogCard>
}
