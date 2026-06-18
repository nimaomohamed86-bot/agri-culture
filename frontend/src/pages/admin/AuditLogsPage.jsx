import { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import { auditApi } from '../../api/services';
import { formatDateTime } from '../../utils/helpers';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });

  useEffect(() => {
    setLoading(true);
    auditApi
      .getAll({ page, limit: 15 })
      .then((res) => {
        setLogs(res.data.data);
        setMeta(res.data.meta);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const columns = [
    { key: 'action', label: 'Action' },
    { key: 'entity', label: 'Entity' },
    { key: 'entityId', label: 'Entity ID', render: (r) => r.entityId?.slice(-8) || '-' },
    {
      key: 'user',
      label: 'User',
      render: (r) => r.user?.fullName || 'System',
    },
    { key: 'ipAddress', label: 'IP', render: (r) => r.ipAddress || '-' },
    { key: 'createdAt', label: 'Timestamp', render: (r) => formatDateTime(r.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-gray-500">System activity and change tracking</p>
      </div>
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        page={page}
        totalPages={meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
