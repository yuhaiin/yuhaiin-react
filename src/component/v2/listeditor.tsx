"use client"

import { FC, useState } from 'react';
import { PlusLg, Trash } from 'react-bootstrap-icons';
import { Button } from './button';
import { Input, Textarea } from './input';

export const InputList: FC<{
    title: string;
    data: string[];
    onChange: (data: string[]) => void;
    className?: string;
    textarea?: boolean;
    dump?: boolean;
    placeholder?: string;
    disabled?: boolean;
}> = ({ title, data, onChange, className, textarea, dump, placeholder, disabled }) => {
    const [newItem, setNewItem] = useState("");

    const add = () => {
        if (!newItem || disabled) return;
        onChange([...data, newItem]);
        setNewItem("");
    }

    const remove = (i: number) => {
        if (disabled) return;
        const newData = [...data];
        newData.splice(i, 1);
        onChange(newData);
    }

    return (
        <div className={className}>
            <label className="form-label fw-bold">{title}</label>
            {!disabled && (
                <div className="d-flex gap-2 mb-2">
                    {textarea ?
                        <Textarea
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder={placeholder || `Add new ${title}`}
                            rows={3}
                        /> :
                        <Input
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder={placeholder || `Add new ${title}`}
                            onKeyDown={(e) => { if (e.key === 'Enter') add() }}
                        />
                    }
                    <Button variant="outline-primary" onClick={add} style={{ alignSelf: textarea ? 'flex-start' : 'auto' }}>
                        <PlusLg />
                    </Button>
                </div>
            )}

            <div className="d-flex flex-column gap-2">
                {data.map((item, i) => (
                    <div key={i} className="d-flex gap-2 align-items-center bg-body-secondary p-2 rounded">
                        <div className="flex-grow-1 text-break font-monospace small" style={{ minWidth: 0 }}>
                            {dump ? <pre className="m-0 text-wrap" style={{ whiteSpace: 'pre-wrap' }}>{item}</pre> : item}
                        </div>
                        {!disabled && (
                            <Button variant="outline-danger" size="sm" onClick={() => remove(i)}>
                                <Trash />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export const InputBytesList: FC<{
    title: string;
    data: Uint8Array[] | undefined | null;
    onChange: (data: Uint8Array[]) => void;
    className?: string;
    disabled?: boolean;
}> = ({ title, data = [], onChange, className, disabled }) => {
    const [newItem, setNewItem] = useState("");

    const add = () => {
        if (!newItem.trim() || disabled) return;
        onChange([...(data || []), new TextEncoder().encode(newItem)]);
        setNewItem("");
    }

    const remove = (i: number) => {
        if (disabled) return;
        const newData = [...(data || [])];
        newData.splice(i, 1);
        onChange(newData);
    }

    const edit = (i: number, val: string) => {
        if (disabled) return;
        const newData = [...(data || [])];
        newData[i] = new TextEncoder().encode(val);
        onChange(newData);
    }

    return (
        <div className={className}>
            <label className="form-label small fw-bold opacity-75 mb-2">{title}</label>
            {!disabled && (
                <div className="d-flex gap-2 mb-3">
                    <Textarea
                        placeholder={`Paste or type ${title} bytes here...`}
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        rows={3}
                        className="font-monospace small shadow-none"
                        style={{ fontSize: '0.85rem' }}
                    />
                    <Button variant="outline-primary" onClick={add} style={{ alignSelf: 'flex-start' }}>
                        <PlusLg />
                    </Button>
                </div>
            )}

            <div className="d-flex flex-column gap-3">
                {(data || []).map((v, i) => (
                    <div key={i} className="bg-body-secondary p-3 rounded-3 position-relative group">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted fw-bold">ENTRY #{i + 1}</small>
                            {!disabled && (
                                <Button variant="outline-danger" size="sm" onClick={() => remove(i)}>
                                    <Trash />
                                </Button>
                            )}
                        </div>
                        <Textarea
                            value={new TextDecoder().decode(v)}
                            onChange={(e) => edit(i, e.target.value)}
                            readOnly={disabled}
                            rows={3}
                            className="bg-transparent border-0 font-monospace small shadow-none p-0"
                            style={{ fontSize: '0.8rem', lineHeight: '1.4' }}
                        />
                    </div>
                ))}
                {(!data || data.length === 0) && (
                    <div className="text-center text-muted fst-italic py-4 opacity-50 border rounded-3 border-dashed">
                        No {title} entries yet.
                    </div>
                )}
            </div>
        </div>
    )
}
