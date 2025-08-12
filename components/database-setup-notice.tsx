import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export function DatabaseSetupNotice() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <AlertTriangle className="h-5 w-5" />
          Database Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          It looks like your database hasn't been set up yet. To use the photo gallery, 
          you need to run the setup SQL script in your Supabase project.
        </p>
        
        <div className="space-y-2">
          <h4 className="font-medium">Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Go to your Supabase dashboard</li>
            <li>Navigate to the SQL Editor</li>
            <li>Copy and paste the contents of <code className="bg-muted px-1 rounded">supabase-setup.sql</code></li>
            <li>Run the script</li>
            <li>Refresh this page</li>
          </ol>
        </div>

        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm font-medium mb-2">The script will create:</p>
          <ul className="text-sm space-y-1">
            <li>• Photos table with proper schema</li>
            <li>• Storage bucket for photo files</li>
            <li>• Row Level Security policies</li>
            <li>• Storage access policies</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
