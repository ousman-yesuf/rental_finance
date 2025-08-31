import React from 'react';

interface TableProps {
  headers: string[];
  data: any[];
  renderRow: (row: any) => React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ headers, data, renderRow, className }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse border bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header) => (
              <th key={header} className="p-3 text-left border-b">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => renderRow(row))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
