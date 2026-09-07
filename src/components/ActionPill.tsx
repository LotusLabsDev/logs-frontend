import { AnchorHTMLAttributes, ButtonHTMLAttributes, createContext, ReactNode, useContext, useState } from "react";
import styled, { css } from "styled-components";

const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

const CompactContext = createContext(false);

export function CompactPills({ compact, children }: { compact: boolean; children: ReactNode }) {
    return <CompactContext.Provider value={compact}>{children}</CompactContext.Provider>;
}

const Label = styled.span<{ $open: boolean }>`
    display: grid;
    grid-template-columns: ${props => props.$open ? "1fr" : "0fr"};
    transition: grid-template-columns 0.3s ${easeOut};

    > span {
        min-width: 0;
        overflow: hidden;
    }

    > span > span {
        display: block;
        padding-right: 8px;
        white-space: nowrap;
    }
`;

const pillStyles = css<{ $active?: boolean; $iconOnly?: boolean; $compact?: boolean; $open?: boolean; $tint?: string }>`
    display: inline-flex;
    align-items: center;
    overflow: hidden;
    height: 40px;
    min-width: 40px;
    flex-shrink: 0;
    gap: ${props => props.$iconOnly || (props.$compact && !props.$open) ? "0" : "8px"};
    padding-left: 12px;
    padding-right: ${props => props.$iconOnly || (props.$compact && !props.$open) ? "12px" : "8px"};
    border-radius: 999px;
    border: 1px solid ${props => props.$tint
        ? `color-mix(in srgb, #46383e 58%, ${props.$tint} 42%)`
        : (props.$active ? "#7a6870" : "#46383e")};
    background: ${props => props.$tint
        ? `color-mix(in srgb, #241c20 76%, ${props.$tint} 24%)`
        : (props.$active ? "#342428" : "#241c20")};
    color: #f4f4ff;
    font-family: Satoshi, ui-sans-serif, sans-serif;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    opacity: ${props => props.$active || props.$open ? 1 : 0.62};
    transition: border-color 200ms ${easeOut}, background-color 200ms ${easeOut}, transform 160ms ${easeOut}, opacity 200ms ${easeOut}, padding 300ms ${easeOut}, gap 300ms ${easeOut};

    @media (hover: hover) and (pointer: fine) {
        &:hover {
            border-color: ${props => props.$tint
                ? `color-mix(in srgb, #46383e 40%, ${props.$tint} 60%)`
                : "#7a6870"};
            background: ${props => props.$tint
                ? `color-mix(in srgb, #241c20 62%, ${props.$tint} 38%)`
                : "#342428"};
            opacity: 1;
        }
    }

    &:focus-visible {
        opacity: 1;
    }

    &:active {
        transform: scale(0.97);
    }

    svg,
    img {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        object-fit: contain;
        ${props => props.$tint ? "filter: brightness(0) invert(1);" : ""}
    }
`;

const PillButton = styled.button<{ $active?: boolean; $iconOnly?: boolean; $compact?: boolean; $open?: boolean; $tint?: string }>`
    ${pillStyles}
`;

const PillLink = styled.a<{ $active?: boolean; $iconOnly?: boolean; $compact?: boolean; $open?: boolean; $tint?: string }>`
    ${pillStyles}
`;

type SharedProps = {
    icon: ReactNode;
    active?: boolean;
    iconOnly?: boolean;
    compact?: boolean;
    expanded?: boolean;
    tint?: string;
    children?: ReactNode;
};

type ActionPillButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
};

type ActionPillLinkProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
};

export function ActionPill(props: ActionPillButtonProps | ActionPillLinkProps) {
    const compactFromNav = useContext(CompactContext);
    const { icon, active, iconOnly, compact = compactFromNav, expanded, tint, children, onMouseEnter, onMouseLeave, ...rest } = props;
    const [hint, setHint] = useState(false);
    const labelOpen = Boolean(children) && (!compact || hint || Boolean(expanded));

    const showHint = () => {
        if (compact && !iconOnly) setHint(true);
    };

    const hideHint = () => setHint(false);

    const label = children ? (
        <Label $open={labelOpen}>
            <span>
                <span>{children}</span>
            </span>
        </Label>
    ) : null;

    if ("href" in props && props.href) {
        const linkProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
        return (
            <PillLink
                $active={active}
                $iconOnly={iconOnly}
                $compact={compact}
                $open={labelOpen}
                $tint={tint}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={event => {
                    showHint();
                    onMouseEnter?.(event);
                }}
                onMouseLeave={event => {
                    hideHint();
                    onMouseLeave?.(event);
                }}
                {...linkProps}
            >
                {icon}
                {label}
            </PillLink>
        );
    }

    const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
        <PillButton
            type="button"
            $active={active}
            $iconOnly={iconOnly}
            $compact={compact}
            $open={labelOpen}
            $tint={tint}
            onMouseEnter={event => {
                showHint();
                onMouseEnter?.(event);
            }}
            onMouseLeave={event => {
                hideHint();
                onMouseLeave?.(event);
            }}
            {...buttonProps}
        >
            {icon}
            {label}
        </PillButton>
    );
}
