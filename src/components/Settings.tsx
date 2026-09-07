import { Check, Settings as SettingsIcon, X } from "lucide-react";
import React, { MouseEvent, useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Setting, store } from "../store";
import { ActionPill } from "./ActionPill";

const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

const SettingsContainer = styled.div`
	position: relative;
`;

const MenuList = styled.ul`
	position: absolute;
	top: calc(100% + 8px);
	right: 0;
	z-index: 20;
	margin: 0;
	padding: 6px;
	list-style: none;
	min-width: 240px;
	border-radius: 18px;
	border: 1px solid #46383e;
	background: #241c20;
`;

const MenuOption = styled.button`
	display: flex;
	align-items: center;
	gap: 10px;
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

	svg {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: #9a8088;
	}
`;

export function Settings() {
	const { state, setSettings } = useContext(store);
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;

		function onPointerDown(event: PointerEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		}

		function onKey(event: KeyboardEvent) {
			if (event.key === "Escape") setOpen(false);
		}

		window.addEventListener("pointerdown", onPointerDown);
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("pointerdown", onPointerDown);
			window.removeEventListener("keydown", onKey);
		};
	}, [open]);

	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		setOpen(current => !current);
	};

	const toggleSetting = (name: string, setting: Setting) => {
		const newSetting = { ...setting, value: !setting.value };

		setSettings({ ...state.settings, [name]: newSetting });
	};

	return (
		<SettingsContainer ref={containerRef}>
			<ActionPill
				icon={<SettingsIcon strokeWidth={2} aria-hidden="true" />}
				aria-controls="settings"
				aria-haspopup="true"
				aria-expanded={open}
				expanded={open}
				onClick={handleClick}
			>
				Settings
			</ActionPill>
			{open && (
				<MenuList id="settings">
					{Object.entries(state.settings).map(([name, setting]) => (
						<li key={name}>
							<MenuOption type="button" onClick={() => toggleSetting(name, setting)}>
								{setting.value ? <Check strokeWidth={2} aria-hidden="true" /> : <X strokeWidth={2} aria-hidden="true" />}
								{setting.displayName}
							</MenuOption>
						</li>
					))}
				</MenuList>
			)}
		</SettingsContainer>
	);
}
