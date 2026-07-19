interface SelectionPanelProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

function SelectionPanel({ title, subtitle, children }: SelectionPanelProps) {
    return (
        <div className="selection-panel">
            <h3 className="selection-title text-lg tracking-wide">{title}</h3>
            {subtitle && <h4 className="text-base tracking-wide">{subtitle}</h4>}
            {children}
        </div>
    );
}

export default SelectionPanel;