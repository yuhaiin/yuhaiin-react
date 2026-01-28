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
            <label className="mb-2 block font-bold">{title}</label>
            {!disabled && (
                <InputGroup className="mb-2">
                    <Textarea
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={placeholder || `Add new ${title}${textarea ? " (one per line)" : ""}`}
                        rows={textarea ? 3 : undefined}
                        className="grow !rounded-r-none"
                    />
                    <Button
                        onClick={add}
                        className="!rounded-l-none ml-[-1px]"
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
                                className="grow !rounded-r-none"
                                disabled={disabled}
                            />
                        ) : (
                            <Input
                                value={item}
                                onChange={(e) => edit(i, e.target.value)}
                                className="grow !rounded-r-none"
                                disabled={disabled}
                            />
                        )}
                        {!disabled && (
                            <Button
                                variant="outline-danger"
                                onClick={() => remove(i)}
                                className="!rounded-l-none ml-[-1px]"
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
            <label className="mb-2 block text-sm font-bold opacity-75">{title}</label>
            {!disabled && (
                <div className="flex gap-2 mb-3">
                    <Textarea
                        placeholder={`Paste or type ${title} bytes here...`}
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        rows={3}
                        className="font-mono text-[0.85rem] shadow-none"
                    />
                    <Button onClick={add} style={{ alignSelf: 'flex-start' }}>
                        <Plus size={18} />
                    </Button>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {(data || []).map((v, i) => (
                    <div key={i} className="bg-secondary-bg p-3 rounded-lg relative group">
                        <div className="flex justify-between items-center mb-2">
                            <small className="text-secondary font-bold">ENTRY #{i + 1}</small>
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
                            className="bg-transparent border-0 font-mono text-[0.8rem] leading-[1.4] shadow-none p-0 !h-auto"
                        />
                    </div>
                ))}
                {(!data || data.length === 0) && (
                    <div className="text-center text-secondary italic py-4 opacity-50 border rounded-lg border-dashed">
                        No {title} entries yet.
                    </div>
                )}
            </div>
        </div>
    )
}
