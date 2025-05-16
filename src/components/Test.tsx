import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

interface StorylaneRecord {
  Demo: string;
  Link: string;
  'Last View': string;
  'Total Time': string;
  'Steps Completed': string;
  'Percent Complete': string;
  'Opened CTA': string;
  Country: string;
}

const Test: React.FC = () => {
  const [data, setData] = useState<StorylaneRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rawCsv, setRawCsv] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Directly fetch the CSV
        const response = await fetch('/storylane all.csv');
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
        }
        
        const csvText = await response.text();
        setRawCsv(csvText);
        
        // Parse the CSV
        const result = Papa.parse<StorylaneRecord>(csvText, {
          header: true,
          skipEmptyLines: true
        });
        
        console.log('Parse result:', result);
        
        if (result.errors && result.errors.length > 0) {
          console.error('CSV parse errors:', result.errors);
          setError(`Parse errors: ${JSON.stringify(result.errors)}`);
        }
        
        setData(result.data);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    loadData();
  }, []);
  
  return (
    <div>
      <h1>Test Component</h1>
      
      {error && (
        <div style={{ color: 'red', margin: '20px 0' }}>
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}
      
      <div style={{ margin: '20px 0' }}>
        <h3>Raw CSV:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f0f0f0', padding: '10px' }}>
          {rawCsv}
        </pre>
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <h3>Parsed Data ({data.length} records):</h3>
        {data.length > 0 ? (
          <ul>
            {data.map((item, index) => (
              <li key={index}>
                <strong>{item.Demo}</strong> - {item.Country} - Completion: {item['Percent Complete']}%
              </li>
            ))}
          </ul>
        ) : (
          <p>No data found</p>
        )}
      </div>
    </div>
  );
};

export default Test; 