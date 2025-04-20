import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboard from 'src/pages/dashboard.tsx';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mockAxios = new MockAdapter(axios);

describe('AdminDashboard', () => {
    beforeEach(() => {
        mockAxios.reset();
    });

    it('renders Run End-of-Year Cleanup button', () => {
        render(<AdminDashboard />);
        expect(screen.getByText('Run End-of-Year Cleanup')).toBeInTheDocument();
    });

    it('shows loading state and calls API on button click', async () => {
        mockAxios.onPost('/api/end-of-year-cleanup').reply(200, { message: 'Cleanup successful!' });

        render(<AdminDashboard />);
        const button = screen.getByText('Run End-of-Year Cleanup');
        fireEvent.click(button);

        expect(button).toHaveTextContent('Running Cleanup...');
        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0].url).toBe('/api/end-of-year-cleanup');

        await screen.findByText('Cleanup successful!');
    });

    it('handles API error', async () => {
        mockAxios.onPost('/api/end-of-year-cleanup').reply(500, { message: 'Cleanup failed!' });

        render(<AdminDashboard />);
        const button = screen.getByText('Run End-of-Year Cleanup');
        fireEvent.click(button);

        expect(button).toHaveTextContent('Running Cleanup...');
        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0].url).toBe('/api/end-of-year-cleanup');

        await screen.findByText('Cleanup failed!');
    });
});