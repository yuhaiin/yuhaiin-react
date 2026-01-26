"use client"

import { Plus, Trash } from 'lucide-react';
import { FC, useState } from 'react';
import { Button } from './button';
import { Input, Textarea } from './input';
import { InputGroup } from './inputgroup';

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
        const lines = newItem.split('\n').map(x => x.trim()).filter(x => x !== "");
        if (lines.length > 0) {
            onChange([...data, ...lines]);
            setNewItem("");
        }
    }

    const remove = (i: number) => {
        if (disabled) return;
        const newData = [...data];
        newData.splice(i, 1);
        onChange(newData);
    }

    const edit = (i: number, val: string) => {
        if (disabled) return;
        const newData = [...data];
        newData[i] = val;
        onChange(newData);
    }

    return (
        <div className={className}>
            <label className="form-label fw-bold">{title}</label>
            {!disabled && (
                <InputGroup className="mb-2">
                    <Textarea
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={placeholder || `Add new ${title}${textarea ? " (one per line)" : ""}`}
                        rows={textarea ? 3 : undefined}
                        className="flex-grow-1"
                        style={{
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0
                        }}
                    />
                    <Button
                        onClick={add}
                        style={{
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            marginLeft: '-1px'
                        }}
                    >
                        <Plus />
                    </Button>
                </InputGroup>
            )}

            <div className="d-flex flex-column gap-2">
                {data.map((item, i) => (
                    <InputGroup key={i}>
                        {textarea ? (
                            <Textarea
                                value={item}
                                onChange={(e) => edit(i, e.target.value)}
                                rows={1} // Start small, can be adjusted
                                className="flex-grow-1"
                                disabled={disabled}
                                style={{
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0
                                }}
                            />
                        ) : (
                            <Input
                                value={item}
                                onChange={(e) => edit(i, e.target.value)}
                                className="flex-grow-1"
                                disabled={disabled}
                                style={{
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0
                                }}
                            />
                        )}
                        {!disabled && (
                            <Button
                                variant="outline-danger"
                                onClick={() => remove(i)}
                                style={{
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                    marginLeft: '-1px' // Merge borders
                                }}
                            >
                                <Trash />
                            </Button>
                        )}
                    </InputGroup>
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
                    <Button onClick={add} style={{ alignSelf: 'flex-start' }}>
                        <Plus />
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
