import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '../components/FilterBar';
describe('FilterBar', () => {
    it('renders all four filter buttons', () => {
        render(_jsx(FilterBar, { active: "All", onChange: vi.fn() }));
        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('Bullish')).toBeInTheDocument();
        expect(screen.getByText('Bearish')).toBeInTheDocument();
        expect(screen.getByText('Neutral')).toBeInTheDocument();
    });
    it('calls onChange with correct value when a button is clicked', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(_jsx(FilterBar, { active: "All", onChange: onChange }));
        await user.click(screen.getByText('Bullish'));
        expect(onChange).toHaveBeenCalledWith('Bullish');
    });
    it('calls onChange with Bearish when Bearish is clicked', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(_jsx(FilterBar, { active: "All", onChange: onChange }));
        await user.click(screen.getByText('Bearish'));
        expect(onChange).toHaveBeenCalledWith('Bearish');
    });
    it('applies active styling to the active filter button', () => {
        render(_jsx(FilterBar, { active: "Bullish", onChange: vi.fn() }));
        const bullishBtn = screen.getByRole('button', { name: 'Bullish' });
        // Active button has bg-bullish in its class
        expect(bullishBtn.className).toContain('bg-bullish');
    });
    it('has correct id attributes on buttons', () => {
        render(_jsx(FilterBar, { active: "All", onChange: vi.fn() }));
        expect(document.getElementById('filter-all')).toBeInTheDocument();
        expect(document.getElementById('filter-bullish')).toBeInTheDocument();
        expect(document.getElementById('filter-bearish')).toBeInTheDocument();
        expect(document.getElementById('filter-neutral')).toBeInTheDocument();
    });
});
