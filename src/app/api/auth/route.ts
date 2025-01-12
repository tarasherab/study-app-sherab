import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        
        const correctPassword = process.env.password;
        if (password === correctPassword) {
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false }, { status: 401 });
    } catch (err) {
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}