import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchBuildings } from '../features/buildingsSlice';
import { fetchAudits } from '../features/auditsSlice';

function Audits() {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector(state => state.buildings.buildings);
  const audits = useAppSelector(state => state.audits.audits);
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);

 useEffect(() => {
    dispatch(fetchBuildings());
  }, [dispatch]);

  useEffect(() => {
    if (buildings.length > 0 && !selectedBuilding) {
      setSelectedBuilding(buildings[0].id);
    }
  }, [buildings, selectedBuilding]);

  useEffect(() => {
    if (selectedBuilding) {
      dispatch(fetchAudits(selectedBuilding));
    }
  }, [selectedBuilding, dispatch]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Audit Logs</h2>

      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">Select Building:</label>
        <select
          onChange={(e) => setSelectedBuilding(Number(e.target.value))}
          className="p-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-1/3 bg-white"
        >
          <option value="">-- Select Building --</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {selectedBuilding && (
        <div className="space-y-4">
          {audits.length === 0 ? (
            <p className="text-gray-500">No audit logs found for this building.</p>
          ) : (
            audits.map((audit) => (
              <div
                key={audit.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">{audit.action}</span>
                  <span className="text-sm text-gray-500">
                    User {audit.userId} | {new Date(audit.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">
                  Details: <span className="font-medium">{audit.details || 'N/A'}</span>
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Audits;
