'use client';
import { useState } from 'react';
import StudyHelper from '@/components/StudyHelper/StudyHelper';
import Login from '@/components/Login/Login';

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return <Login onLogin={setIsAuthenticated} />;
    }

    return (
        <main className="min-h-screen">
            <StudyHelper />
        </main>
    );
}