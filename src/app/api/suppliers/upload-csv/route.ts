import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadSupplierCSV } from '@/lib/providers/supplierProvider';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const text = await file.text();
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await uploadSupplierCSV(text, user.id);

        return NextResponse.json({ success: true, count: result.count });

    } catch (error: any) {
        console.error('CSV Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
