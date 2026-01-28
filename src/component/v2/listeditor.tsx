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
    placeholder?: string;
    disabled?: boolean;
}> = ({ title, data, onChange, className, textarea, placeholder, disabled }) => {
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
            <label className="block mb-2 font-bold">{title}</label>
            {!disabled && (
                <InputGroup className="mb-2">
                    <Textarea
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={placeholder || `Add new ${title}${textarea ? " (one per line)" : ""}`}
                        rows={textarea ? 3 : undefined}
                        className="grow"
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
                        <Plus size={18} />
                    </Button>
                </InputGroup>
            )}

            <div className="flex flex-col gap-2">
                {data.map((item, i) => (
                    <InputGroup key={i}>
                        {textarea ? (
                            <Textarea
                                value={item}
                                onChange={(e) => edit(i, e.target.value)}
                                rows={1} // Start small, can be adjusted
                                className="grow"
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
                                className="grow"
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
                                <Trash size={16} />
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
            <label className="block mb-2 text-sm font-bold opacity-75">{title}</label>
            {!disabled && (
                <div className="flex gap-2 mb-3">
                    <Textarea
                        placeholder={`Paste or type ${title} bytes here...`}
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        rows={3}
                        className="text-sm font-mono shadow-none !text-[0.85rem]"
                    />
                    <Button onClick={add} style={{ alignSelf: 'flex-start' }}>
                        <Plus size={18} />
                    </Button>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {(data || []).map((v, i) => (
                    <div key={i} className="relative p-3 rounded-lg bg-[var(--bs-secondary-bg)] group">
                        <div className="flex items-center justify-between mb-2">
                            <small className="font-bold text-[var(--bs-secondary-color)]">ENTRY #{i + 1}</small>
                            {!disabled && (
                                <Button variant="outline-danger" size="sm" onClick={() => remove(i)}>
                                    <Trash size={16} />
                                </Button>
                            )}
                        </div>
                        <Textarea
                            value={new TextDecoder().decode(v)}
                            onChange={(e) => edit(i, e.target.value)}
                            readOnly={disabled}
                            rows={3}
                            className="p-0 text-sm font-mono bg-transparent border-0 shadow-none"
                            style={{ fontSize: '0.8rem', lineHeight: '1.4' }}
                        />
                    </div>
                ))}
                {(!data || data.length === 0) && (
                    <div className="py-4 italic text-center border border-dashed rounded-lg opacity-50 text-[var(--bs-secondary-color)]">
                        No {title} entries yet.
                    </div>
                )}
            </div>
        </div>
    )
}
