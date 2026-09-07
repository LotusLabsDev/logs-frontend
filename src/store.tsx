import { createContext, useState } from "react";
import { QueryClient } from 'react-query';
import { useLocalStorage } from "./hooks/useLocalStorage";

export interface Settings {
    showEmotes: Setting,
    showName: Setting,
    showTimestamp: Setting,
    twitchChatMode: Setting,
    newOnBottom: Setting,
}

export enum LocalStorageSettings {
    showEmotes,
    showName,
    showTimestamp,
    twitchChatMode,
    newOnBottom,
}

export interface Setting {
    displayName: string,
    value: boolean,
}

export interface State {
    settings: Settings,
    queryClient: QueryClient,
    apiBaseUrl: string,
    currentChannel: string | null,
    currentUsername: string | null,
    prefillChannel: string,
    prefillUsername: string,
    error: boolean,
    activeSearchField: HTMLInputElement | null,
    showOptout: boolean,
    showTerms: boolean,
    logFullscreen: boolean,
}

export type Action = Record<string, unknown>;

const url = new URL(window.location.href);
const initialChannel = url.searchParams.get("channel")?.trim() || null;
const initialUsername = url.searchParams.get("username")?.trim() || null;
const incompleteQuery = Boolean(initialChannel) !== Boolean(initialUsername);

if (incompleteQuery) {
    url.searchParams.delete("channel");
    url.searchParams.delete("username");
    window.history.replaceState({}, "justlog", url.toString());
}

const defaultContext = {
    state: {
        queryClient: new QueryClient(),
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? window.location.protocol + "//" + window.location.host,
        settings: {
            showEmotes: {
                displayName: "Show Emotes",
                value: true,
            },
            showName: {
                displayName: "Show Name",
                value: true,
            },
            showTimestamp: {
                displayName: "Show Timestamp",
                value: true,
            },
            twitchChatMode: {
                displayName: "Twitch Chat Mode",
                value: false,
            },
            newOnBottom: {
                displayName: "Newest messages on bottom",
                value: false,
            },
        },
        currentChannel: incompleteQuery ? null : initialChannel,
        currentUsername: incompleteQuery ? null : initialUsername,
        prefillChannel: initialChannel ?? "",
        prefillUsername: initialUsername ?? "",
        showOptout: url.searchParams.has("optout"),
        showTerms: false,
        logFullscreen: false,
        error: false,
    } as State,
    setState: (state: State) => { },
    setCurrents: (currentChannel: string | null = null, currentUsername: string | null = null) => { },
    setSettings: (newSettings: Settings) => { },
    setShowOptout: (show: boolean) => { },
    setShowTerms: (show: boolean) => { },
    setLogFullscreen: (show: boolean) => { },
};

const store = createContext(defaultContext);
const { Provider } = store;

const StateProvider = ({ children }: { children: JSX.Element }): JSX.Element => {

    const [settings, setSettingsStorage] = useLocalStorage("justlog:settings", defaultContext.state.settings);
    const [state, setState] = useState({ ...defaultContext.state, settings });

    const setShowOptout = (show: boolean) => {
        const url = new URL(window.location.href);

        if (show) {
            url.searchParams.set("optout", "");
        } else {
            url.searchParams.delete("optout");
        }

        window.history.replaceState({}, "justlog", url.toString());

        setState({ ...state, showOptout: show })
    }

    const setShowTerms = (show: boolean) => {
        setState({ ...state, showTerms: show });
    }

    const setLogFullscreen = (show: boolean) => {
        setState({ ...state, logFullscreen: show });
    }

    const setSettings = (newSettings: Settings) => {
        for (const key of Object.keys(newSettings)) {
            if (typeof (defaultContext.state.settings as unknown as Record<string, Setting>)[key] === "undefined") {
                delete (newSettings as unknown as Record<string, Setting>)[key];
            }
        }

        state.queryClient.removeQueries("log");

        setSettingsStorage(newSettings);
        setState({ ...state, settings: newSettings });
    }

    const setCurrents = (currentChannel: string | null = null, currentUsername: string | null = null) => {
        currentChannel = currentChannel?.toLowerCase().trim() ?? null;
        currentUsername = currentUsername?.toLowerCase().trim() ?? null;

        setState({ ...state, currentChannel, currentUsername, error: false, logFullscreen: false });

        const url = new URL(window.location.href);
        if (currentChannel) {
            url.searchParams.set("channel", currentChannel);
        } else {
            url.searchParams.delete("channel");
        }
        if (currentUsername) {
            url.searchParams.set("username", currentUsername);
        } else {
            url.searchParams.delete("username");
        }

        window.history.replaceState({}, "justlog", url.toString());
    }

    return <Provider value={{ state, setState, setSettings, setCurrents, setShowOptout, setShowTerms, setLogFullscreen }}>{children}</Provider>;
};

export { store, StateProvider };

export const QueryDefaults = {
    staleTime: 5 * 10 * 1000,
};
