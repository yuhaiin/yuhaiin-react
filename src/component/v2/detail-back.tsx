import { useAppBarBack } from '@/hooks/app-bar';
import { ArrowLeft } from 'lucide-react';
import { Button } from './button';

/**
 * Back from a phone detail to its list. On a phone the App Bar shows it as its
 * leading arrow; where no App Bar hosts it, the button renders here, above the
 * detail's heading. From md the detail sits beside its list and needs neither.
 */
export function DetailBack({ label, onBack }: { label: string; onBack: () => void }) {
    const hosted = useAppBarBack(label, onBack);
    if (hosted) return null;
    return <Button size="sm" variant="outline-secondary" className="mb-3 gap-2 border-transparent bg-transparent md:hidden" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" />{label}
    </Button>;
}
