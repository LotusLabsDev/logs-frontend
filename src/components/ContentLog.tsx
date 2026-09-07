import React, { useContext, useEffect, useRef, CSSProperties, useState } from "react";
import styled from "styled-components";
import { useLog } from "../hooks/useLog";
import { store } from "../store";
import { LogLine } from "./LogLine";
import { FixedSizeList as List } from "react-window";

const ContentLogContainer = styled.div<{ $fill?: boolean }>`
    padding: 0;
    margin: 0;
    position: relative;
    ${props => props.$fill ? `
        flex: 1;
        min-height: 0;
        height: 100%;
    ` : ""}

    .logLine {
        white-space: nowrap;
    }

    .list {
        scrollbar-color: #46383e #1f171b;
    }
`;

export function ContentLog({ year, month, searchText, fill = false }: { year: string, month: string, searchText: string, fill?: boolean }) {
    const { state } = useContext(store);
    const container = useRef<HTMLDivElement>(null);
    const [listHeight, setListHeight] = useState(600);

    useEffect(() => {
        if (!fill) {
            setListHeight(600);
            return;
        }

        const el = container.current;
        if (!el) return;

        const update = () => setListHeight(Math.max(0, el.clientHeight));
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, [fill]);

    const logs = useLog(state.currentChannel ?? "", state.currentUsername ?? "", year, month)
        .filter(log => log.text.toLowerCase().includes(searchText.toLowerCase()));

    const Row = ({ index, style }: { index: number, style: CSSProperties }) => (
        <div style={style}><LogLine key={logs[index].id ? logs[index].id : index} message={logs[index]} /></div>
    );

    return <ContentLogContainer ref={container} $fill={fill}>
        <List
            className="list"
            height={listHeight}
            itemCount={logs.length}
            itemSize={20}
            width={"100%"}
        >
            {Row}
        </List>
    </ContentLogContainer>
}
