import React, { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useQuery, useQueryClient } from "react-query";
import { useChannels } from "../hooks/useChannels";
import { store } from "../store";
import { CompactPills } from "./ActionPill";
import { Docs } from "./Docs";
import { DiscordLink } from "./DiscordLink";
import { Info } from "./Info";
import { LotusLabsLink } from "./LotusLabsLink";
import { Optout } from "./Optout";
import { Settings } from "./Settings";

const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

const FiltersWrapper = styled.div<{ $centered: boolean }>`
    position: ${props => props.$centered ? "relative" : "sticky"};
    top: ${props => props.$centered ? "auto" : "0"};
    z-index: 15;
    display: flex;
    flex-direction: ${props => props.$centered ? "column" : "row"};
    align-items: ${props => props.$centered ? "center" : "stretch"};
    justify-content: ${props => props.$centered ? "center" : "flex-start"};
    min-height: ${props => props.$centered ? "100vh" : "auto"};
    padding: ${props => props.$centered ? "2.5rem 1.25rem 1.5rem" : "1rem 1.25rem 0"};
    background: transparent;
`;

const TopBar = styled.div<{ $centered: boolean }>`
    display: ${props => props.$centered ? "flex" : "grid"};
    width: 100%;
    flex-direction: column;
    align-items: center;
    grid-template-columns: 1fr auto 1fr;
    column-gap: 16px;
`;

const HomeLink = styled.a<{ $centered: boolean }>`
    display: block;
    flex-shrink: 0;
    margin-bottom: ${props => props.$centered ? "2rem" : "0"};
    justify-self: start;
    line-height: 0;
`;

const Wordmark = styled.img<{ $centered: boolean }>`
    display: block;
    height: ${props => props.$centered ? "52px" : "32px"};
    width: auto;
`;

const SearchForm = styled.form<{ $centered: boolean }>`
    position: relative;
    display: flex;
    width: min(100%, 640px);
    margin: ${props => props.$centered ? "0 auto" : "0"};
    justify-self: center;
    align-items: center;
    gap: 12px;
    border-radius: 999px;
    border: 1px solid #46383e;
    background: #241c20;
    padding: 8px;
    transition: border-color 200ms ${easeOut};

    &:focus-within {
        border-color: #7a6870;
    }
`;

const IconSlot = styled.span`
    position: relative;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
`;

const SlotImage = styled.img<{ $show: boolean; $pfp?: boolean }>`
    position: absolute;
    inset: 0;
    width: 40px;
    height: 40px;
    object-fit: ${props => props.$pfp ? "cover" : "contain"};
    padding: ${props => props.$pfp ? "0" : "9px"};
    box-sizing: border-box;
    border-radius: ${props => props.$pfp ? "50%" : "0"};
    opacity: ${props => props.$show ? (props.$pfp ? 1 : 0.72) : 0};
    pointer-events: none;
    transition: opacity 280ms ${easeOut};
`;

const FieldInput = styled.input`
    min-width: 0;
    flex: 1;
    border: none;
    background: transparent;
    padding: 8px 0;
    font-family: Satoshi, ui-sans-serif, sans-serif;
    font-size: 15px;
    color: #f4f4ff;
    outline: none;

    &::placeholder {
        color: #8a767e;
    }
`;

const Divider = styled.span`
    width: 1px;
    height: 28px;
    flex-shrink: 0;
    background: #46383e;
`;

const SubmitButton = styled.button<{ $error: boolean; $idle: boolean }>`
    display: flex;
    height: 40px;
    min-width: 40px;
    flex-shrink: 0;
    align-items: center;
    overflow: hidden;
    border: none;
    border-radius: 999px;
    padding-right: 11px;
    font-family: Satoshi, ui-sans-serif, sans-serif;
    transition: background-color 300ms ${easeOut}, color 300ms ${easeOut}, padding 300ms ${easeOut}, transform 160ms ${easeOut};

    ${props => props.$error ? `
        background: #ea5a6e;
        padding-left: 16px;
        color: #f4f4ff;
        cursor: ${props.$idle ? "not-allowed" : "pointer"};

        &:hover {
            background: #d64a5e;
        }
    ` : props.$idle ? `
        background: #46383e;
        padding-left: 11px;
        color: #8a767e;
        cursor: not-allowed;
    ` : `
        background: #fff5f7;
        padding-left: 11px;
        color: #14080c;
        cursor: pointer;

        &:hover {
            background: #cbb8be;
        }

        &:active {
            transform: scale(0.97);
        }
    `}
`;

const ErrorLabel = styled.span<{ $open: boolean }>`
    display: grid;
    grid-template-columns: ${props => props.$open ? "1fr" : "0fr"};
    transition: grid-template-columns 0.3s ${easeOut};

    > span {
        min-width: 0;
        overflow: hidden;
    }
`;

const ErrorText = styled.span`
    display: block;
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 8px;
    font-size: 12px;
    font-weight: 500;
`;

const ArrowIcon = styled.svg`
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    transform: rotate(45deg);
`;

const Suggestions = styled.ul`
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 20;
    margin: 0;
    padding: 6px;
    list-style: none;
    border-radius: 18px;
    border: 1px solid #46383e;
    background: #241c20;
    max-height: 220px;
    overflow: auto;
`;

const Suggestion = styled.button`
    display: block;
    width: 100%;
    border: none;
    border-radius: 12px;
    background: transparent;
    padding: 8px 12px;
    text-align: left;
    font-family: Satoshi, ui-sans-serif, sans-serif;
    font-size: 14px;
    color: #f4f4ff;
    cursor: pointer;
    transition: background-color 150ms ${easeOut};

    &:hover,
    &:focus {
        background: #342428;
        outline: none;
    }
`;

/* const SearchHint = styled.p`
    margin: 16px 0 0;
    max-width: 640px;
    text-align: center;
    font-size: 13px;
    line-height: 1.45;
    color: #8a767e;
`; */

const Actions = styled.div<{ $centered: boolean }>`
    display: flex;
    align-items: center;
    gap: 20px;
    flex-shrink: 0;
    margin-top: ${props => props.$centered ? "10px" : "0"};
    margin-left: 0;
    justify-self: end;
`;

const ActionGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

function useDebouncedValue(value: string, delay: number) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

function useTwitchAvatar(channel: string) {
    const login = channel.trim().replace(/^@/, "").toLowerCase();
    const enabled = Boolean(login) && !login.startsWith("id:");

    return useQuery(
        ["twitch-avatar", login],
        async () => {
            const endpoint = `https://decapi.me/twitch/avatar/${encodeURIComponent(login)}`;
            let src = endpoint;

            try {
                const response = await fetch(endpoint);
                const text = (await response.text()).trim();
                if (text.startsWith("http")) src = text;
            } catch {
                src = endpoint;
            }

            await new Promise<void>((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve();
                image.onerror = () => reject(new Error("avatar"));
                image.src = src;
            });

            return src;
        },
        {
            enabled,
            staleTime: 30 * 60 * 1000,
            retry: false,
            keepPreviousData: true,
        }
    );
}

function ChannelIcon({ channel }: { channel: string }) {
    const live = channel.trim().replace(/^@/, "").toLowerCase();
    const debounced = useDebouncedValue(live, 450);
    const { data: avatar, isSuccess, isError, isFetching } = useTwitchAvatar(debounced);
    const [displaySrc, setDisplaySrc] = useState("");
    const [showPfp, setShowPfp] = useState(false);

    useEffect(() => {
        if (!isSuccess || !avatar) return;
        setDisplaySrc(avatar);
        setShowPfp(true);
    }, [isSuccess, avatar]);

    useEffect(() => {
        if (live) return;

        const hide = window.setTimeout(() => setShowPfp(false), 400);
        const clear = window.setTimeout(() => setDisplaySrc(""), 720);
        return () => {
            window.clearTimeout(hide);
            window.clearTimeout(clear);
        };
    }, [live]);

    useEffect(() => {
        if (!debounced || isFetching || !isError) return;
        const hide = window.setTimeout(() => setShowPfp(false), 400);
        return () => window.clearTimeout(hide);
    }, [debounced, isFetching, isError]);

    return (
        <IconSlot>
            <SlotImage src="/twitch.svg" alt="" aria-hidden="true" $show={!showPfp} />
            {displaySrc ? (
                <SlotImage src={displaySrc} alt="" aria-hidden="true" $pfp $show={showPfp} />
            ) : null}
        </IconSlot>
    );
}

function ArrowUpRight() {
    return (
        <ArrowIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
        </ArrowIcon>
    );
}

export function Filters() {
    const { setCurrents, state } = useContext(store);
    const queryClient = useQueryClient();
    const channels = useChannels();
    const [channel, setChannel] = useState(state.prefillChannel);
    const [username, setUsername] = useState(state.prefillUsername);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showIncompleteHint, setShowIncompleteHint] = useState(false);

    const incomplete = !channel.trim() || !username.trim();
    const showError = state.error || (incomplete && showIncompleteHint);
    const errorText = state.error ? "User not found" : "Enter a channel and username";

    const suggestions = useMemo(() => {
        const query = channel.trim().toLowerCase();
        if (!query) return [];
        return channels.filter(item => item.name.toLowerCase().includes(query)).slice(0, 8);
    }, [channel, channels]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (incomplete) {
            setShowIncompleteHint(true);
            return;
        }

        if (e.target instanceof HTMLFormElement) {
            const data = new FormData(e.target);

            const nextChannel = data.get("channel") as string | null;
            const nextUsername = data.get("username") as string | null;

            queryClient.invalidateQueries(["log", { channel: nextChannel?.toLowerCase(), username: nextUsername?.toLowerCase() }]);

            setCurrents(nextChannel, nextUsername);
        }
    };

    const goHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setChannel("");
        setUsername("");
        setShowIncompleteHint(false);
        setCurrents(null, null);
    };

    const landing = !state.currentChannel && !state.currentUsername;

    return (
        <FiltersWrapper $centered={landing}>
            <TopBar $centered={landing}>
            <HomeLink $centered={landing} href="/" onClick={goHome} aria-label="Home">
                <Wordmark $centered={landing} src="/logs-wordmark.svg" alt="logs" />
            </HomeLink>
            <SearchForm $centered={landing} onSubmit={handleSubmit} action="none" autoComplete="off">
                <ChannelIcon channel={channel} />
                <FieldInput
                    id="channel"
                    name="channel"
                    aria-label="channel"
                    value={channel}
                    onChange={event => {
                        setChannel(event.target.value);
                        setShowSuggestions(event.target.value.trim().length > 0);
                        setShowIncompleteHint(false);
                    }}
                    onFocus={() => {
                        if (channel.trim()) setShowSuggestions(true);
                    }}
                    onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
                    placeholder="channel or id:123"
                    autoFocus={!channel.trim()}
                />
                <Divider aria-hidden="true" />
                <FieldInput
                    id="username"
                    name="username"
                    aria-label="username"
                    value={username}
                    onChange={event => {
                        setUsername(event.target.value);
                        setShowIncompleteHint(false);
                    }}
                    placeholder="username or id:123"
                    autoComplete="off"
                    autoFocus={Boolean(channel.trim()) && !username.trim()}
                />
                <SubmitButton
                    type="submit"
                    $error={showError}
                    $idle={incomplete}
                    aria-disabled={incomplete}
                    aria-label={showError ? errorText : incomplete ? "Enter a channel and username" : "Load logs"}
                    onMouseEnter={() => {
                        if (incomplete) setShowIncompleteHint(true);
                    }}
                    onMouseLeave={() => setShowIncompleteHint(false)}
                >
                    <ErrorLabel $open={showError} role={showError ? "alert" : undefined}>
                        <span>
                            <ErrorText>{errorText}</ErrorText>
                        </span>
                    </ErrorLabel>
                    <ArrowUpRight />
                </SubmitButton>
                {showSuggestions && suggestions.length > 0 && (
                    <Suggestions>
                        {suggestions.map(item => (
                            <li key={item.userID}>
                                <Suggestion
                                    type="button"
                                    onMouseDown={event => event.preventDefault()}
                                    onClick={() => {
                                        setChannel(item.name);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    {item.name}
                                </Suggestion>
                            </li>
                        ))}
                    </Suggestions>
                )}
            </SearchForm>
            {/* {landing && (
                <SearchHint>Enter a channel, then a username, to view their chat logs.</SearchHint>
            )} */}
            <Actions $centered={landing}>
                <CompactPills compact={!landing}>
                <ActionGroup>
                    <Info />
                    <Settings />
                    <Docs />
                    <Optout />
                </ActionGroup>
                <ActionGroup>
                    <LotusLabsLink />
                    <DiscordLink />
                </ActionGroup>
                </CompactPills>
            </Actions>
            </TopBar>
        </FiltersWrapper>
    );
}
