import EmptyState from '../common/EmptyState.jsx'

export default function DashboardTable({
  columns,
  rows,
  emptyMessage = 'No records available.',
  emptyTitle = 'Nothing to show yet',
  getRowKey = (row) => row.id,
}) {
  if (!rows.length) {
    return <EmptyState description={emptyMessage} title={emptyTitle} />
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            {columns.map((column) => (
              <th className={column.headerClassName} key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td className={column.className} key={column.key}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
