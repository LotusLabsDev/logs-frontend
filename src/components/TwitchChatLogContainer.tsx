import React, { useContext } from "react";
import styled from "styled-components";
import { useLog } from "../hooks/useLog";
import { store } from "../store";
import { TwitchChatLogLine } from "./TwitchChatLogLine";

const ContentLogContainer = styled.ul<{ $fill?: boolean }>`
    list-style: none;
    padding: 0;
    margin: 0;
    width: 340px;
    ${props => props.$fill ? `
        width: 100%;
        flex: 1;
        min-height: 0;
        overflow: auto;
    ` : ""}
`;

export function TwitchChatContentLog({ year, month, fill = false }: { year: string, month: string, fill?: boolean }) {
    const { state } = useContext(store);

    const logs = useLog(state.currentChannel ?? "", state.currentUsername ?? "", year, month)

    return <ContentLogContainer $fill={fill}>
        {logs.map((log, index) => <TwitchChatLogLine key={log.id ? log.id : index} message={log} />)}
    </ContentLogContainer>
}