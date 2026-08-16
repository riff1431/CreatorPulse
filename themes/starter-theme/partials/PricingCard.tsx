import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../components/Button';

export interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  onSelect?: () => void;
}

/**
 * Starter Theme SDK Partial: Membership Pricing Card
 */
export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period = '/month',
  description,
  features,
  isPopular = false,
  onSelect,
}) => {
  return (
    <div
      className={`relative rounded-[var(--radius-card)] bg-[var(--color-surface)] border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
        isPopular
          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-md'
          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/40 shadow-xs'
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[var(--color-primary)] text-white shadow-xs">
          Most Popular
        </span>
      )}

      <div>
        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{title}</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{description}</p>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-black text-[var(--color-text-primary)]">{price}</span>
          <span className="text-xs text-[var(--color-text-muted)]">{period}</span>
        </div>

        <ul className="mt-6 space-y-2.5 text-xs text-[var(--color-text-secondary)]">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[var(--color-soft-primary)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                <Check size={11} strokeWidth={3} />
              </span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Button
          variant={isPopular ? 'primary' : 'secondary'}
          className="w-full"
          onClick={onSelect}
        >
          Join {title}
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;
