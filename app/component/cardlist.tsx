import { FC, useState } from "react";
import { Button, Col, Form, InputGroup, Card as RCard, Row, Spinner } from "react-bootstrap";
import styles from './list.module.css';

type CardListProps<T> = {
    items: T[];
    onClickItem?: (item: T, index: number) => void;
    renderListItem: (item: T, index: number) => React.ReactNode;
    footer?: React.ReactNode;
    header?: React.ReactNode;
    onAddNew?: (name: string) => void;
    adding?: boolean
};

export const Card: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <RCard className={`${styles.configCard} ${className}`} style={style}>
        {children}
    </RCard>
);

export const CardHeader: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <RCard.Header className={`${styles.cardHeaderCustom} ${className}`} style={style}>
        {children}
    </RCard.Header>
);

export const CardBody: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <RCard.Body className={className && `${className}`} style={style}>
        {children}
    </RCard.Body>
);

export const CardFooter: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <RCard.Footer className={`bg-transparent border-top border-secondary border-opacity-10 py-3 ${className}`} style={style}>
        {children}
    </RCard.Footer>
);

export function CardList<T>({ items, onClickItem, footer, renderListItem: body, header }: CardListProps<T>) {
    return (
        <Card>

            {header && <CardHeader> {header}</CardHeader>}

            <CardBody>
                <Row className="g-3">
                    {items.length > 0 ? (
                        items.map((child, index) => (
                            <Col xs={12} key={index}>
                                <div className={styles.listItem} onClick={onClickItem ? () => onClickItem(child, index) : undefined}>
                                    <div className="d-flex w-100 flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                                        {body(child, index)}
                                    </div>
                                </div>
                            </Col>
                        ))
                    ) : (
                        <div className="text-center text-muted p-5 opacity-50">
                            <i className="bi bi-clock-history fs-1 d-block mb-2"></i>
                            No records found.
                        </div>
                    )}
                </Row>
            </CardBody>

            {footer &&
                <CardFooter>
                    <div className="d-flex justify-content-center">
                        {footer}
                    </div>
                </CardFooter>
            }

        </Card>
    );
}

export function CardRowList<T>({
    items,
    onClickItem,
    footer,
    renderListItem: body,
    header,
    onAddNew,
    adding
}: CardListProps<T>) {
    const [newdata, setNewdata] = useState({ value: '' });

    return <Card>

        {header &&
            <CardHeader>
                {header}
            </CardHeader>
        }
        <CardBody>
            <div className="row g-3">
                {
                    items.map((value, index) =>
                        <div className="col-md-6 col-lg-4">
                            <ListItem onClick={() => onClickItem(value, index)}>
                                {body(value, index)}
                            </ListItem>
                        </div>
                    )
                }

                {onAddNew &&
                    <div className="col-md-6 col-lg-4">
                        <ListItem className={`${styles.newItemBox}`}>
                            <InputGroup className="w-100 align-items-center">
                                <Form.Control
                                    value={newdata.value}
                                    onChange={(e) => setNewdata({ value: e.target.value })}
                                    placeholder="Create new..."
                                    className={styles.seamlessInput}
                                    onKeyDown={(e) => {
                                        if (!newdata.value) return
                                        if (e.key === 'Enter') onAddNew(newdata.value)
                                    }}
                                    autoComplete="off"
                                />
                                <Button
                                    variant='link'
                                    onClick={() => {
                                        if (!newdata.value) return
                                        onAddNew(newdata.value)
                                    }}
                                    className={styles.seamlessBtn}
                                    disabled={adding}
                                >
                                    {adding ? <Spinner animation="border" size="sm" /> : <i className="bi bi-plus-lg fs-5" />}
                                </Button>
                            </InputGroup>
                        </ListItem>
                    </div>
                }

            </div>

            {items.length === 0 && (
                <div className="text-center text-muted p-3">
                    No records found.
                </div>
            )}
        </CardBody>

        {
            footer &&
            <CardFooter>
                <div className="d-flex justify-content-center">
                    {footer}
                </div>
            </CardFooter>
        }
    </Card >
}

export const IconBadge: FC<{ icon: string, text: string | number, color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" }> = ({ icon, text, color = "primary" }) => (
    <div className={`d-flex align-items-center gap-1 px-2 py-1 rounded bg-${color} bg-opacity-10 text-${color}`} style={{ fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
        <i className={`bi ${icon}`}></i>
        <span className="text-uppercase">{text}</span>
    </div>
)

export const SettingLabel: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <label className={`${styles.settingLabel} ${className}`} style={style}>{children}</label>
);

export const MainContainer: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={`${styles.mainContainer} ${className}`} style={style}>
        {children}
    </div>
);

export const SettingsBox: FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={styles.settingsBox}>
        {children}
    </div>
);

export const IconBox: FC<{
    icon: string,
    color: string,
    borderColor?: string,
    background?: string,
    className?: string,
    title?: string,
    description?: string,
    style?: React.CSSProperties
}> = ({ icon, color, borderColor, background, className, style, title, description }) => (
    <div className="d-flex align-items-center">
        <div
            className={`${styles.iconBox} ${className}`}
            style={{ color: color, borderColor: borderColor || `${color}33`, background: background || `${color}1A`, ...style }}
        >
            <i className={`bi bi-${icon}`}></i>
        </div>
        <div>
            <h5 className="mb-0 fw-bold">{title}</h5>
            <small className="text-muted">{description}</small>
        </div>
    </div>
);


export const IconBoxRounded: FC<{
    icon: string,
    color: string,
    borderColor?: string,
    background?: string,
    className?: string,
    style?: React.CSSProperties
}> = ({ icon, color, borderColor, background, className, style }) => (
    <div
        className={`${styles.iconBox} rounded-circle ${className}`}
        style={{ color: color, borderColor: borderColor || `${color}33`, background: background || `${color}1A`, ...style }}
    >
        <i className={`bi bi-${icon}`}></i>
    </div>
);

export const FilterSearch: FC<{ onEnter: (str: string) => void, className?: string, style?: React.CSSProperties }> = ({ onEnter, className, style }) => {
    const [filterInput, setFilterInput] = useState('');
    return <div className={`${styles.filterSearchWrapper} ${className}`} style={style}>
        <i className={`bi bi-search ${styles.filterSearchIcon}`}></i>
        <Form.Control
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            placeholder="Search..."
            onKeyDown={(e) => e.key === 'Enter' && onEnter(filterInput.toLowerCase())}
            className={styles.filterSearchInput}
            autoComplete="off"
        />
    </div>
}

export const ErrorBox: FC<{ msgs: string[] }> = ({ msgs }) => {
    if (msgs.length > 0)
        return <div className={`alert alert-danger mb-0 d-flex align-items-start shadow-sm ${styles.errorBox}`}>
            <i className="bi bi-exclamation-triangle-fill me-3 mt-1 fs-5 text-danger"></i>
            <div className="flex-grow-1">
                <h6 className="alert-heading fw-bold mb-2 text-danger">Configuration Error</h6>
                <ul className="mb-0 ps-3 text-danger text-opacity-75">
                    {msgs.map((v, index) => (
                        <li key={index}>{v}</li>
                    ))}
                </ul>
            </div>
        </div>
    else
        return <></>
};

export const ErrorMsg: FC<{ msg: string, code?: string, raw?: string }> = ({ msg, code, raw }) => {
    return <div className={styles.errorBox + " alert alert-danger"}>
        <h4 className="alert-heading">{code} - {msg}</h4>
        <pre className="mb-0 small">{raw}</pre>
    </div>
}

export const ListItem: FC<{
    children: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
    onClick?: () => void
}> = ({ children, className, style, onClick }) => (
    <div className={`${styles.listItem} ${className}`} style={style} onClick={onClick}>
        {children}
    </div>
);