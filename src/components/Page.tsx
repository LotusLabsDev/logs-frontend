import React, { useContext, useEffect } from "react";
import styled from "styled-components";
import { store } from "../store";
import { Filters } from "./Filters";
import { Footer } from "./Footer";
import GradualBlur from "./GradualBlur";
import { LogContainer } from "./LogContainer";
import { OptoutPanel } from "./Optout";

const PageContainer = styled.div<{ $fullscreen: boolean; $landing: boolean }>`
    position: relative;
    min-height: 100vh;
    height: ${props => props.$landing && !props.$fullscreen ? "100vh" : "auto"};
    overflow: ${props => props.$landing && !props.$fullscreen ? "hidden" : "visible"};
    padding-bottom: ${props => props.$fullscreen || props.$landing ? "0" : "4.5rem"};
`;

const gradualBlurProps = {
    target: "page" as const,
    height: "7rem",
    strength: 2,
    divCount: 5,
    curve: "bezier" as const,
    exponential: true,
    opacity: 1,
};

export function Page() {
	const {state} = useContext(store);
    const fullscreen = state.logFullscreen;
    const landing = !state.currentChannel && !state.currentUsername;

    useEffect(() => {
        if (landing || !state.currentChannel) {
            document.title = "LotusLabs Logs";
            return;
        }

        document.title = `@${state.currentChannel} - LotusLabs Logs`;
    }, [landing, state.currentChannel]);

	return <PageContainer $fullscreen={fullscreen} $landing={landing}>
        {!fullscreen && (
            <GradualBlur
                {...gradualBlurProps}
                position="top"
                style={{ zIndex: 14 }}
            />
        )}
		{!fullscreen && <Filters />}
		{!fullscreen && <OptoutPanel />}
		{!landing && <LogContainer />}
		{!fullscreen && <Footer />}
        {!fullscreen && (
            <GradualBlur
                {...gradualBlurProps}
                position="bottom"
                height="2.75rem"
                style={{ zIndex: 9 }}
            />
        )}
	</PageContainer>;
}
