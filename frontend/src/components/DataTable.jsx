import { useMemo, useState } from 'react';

export default function DataTable({
  title, rows, columns, searchKeys, rowKey = 'id', onRowClick, actions, pageSize = 8, toolbarExtra, searchPlaceholder,
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const keys = searchKeys || columns.map((c) => c.key);

  const filtered = useMemo(() => {
    let list = rows;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((row) => keys.some((key) => String(row[key] ?? '').toLowerCase().includes(q)));
    }
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        let cmp;
        if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
        else cmp = String(av ?? '').localeCompare(String(bv ?? ''));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const colCount = columns.length + (actions ? 1 : 0);

  return (
    <article className="table-card">
      <div className="card-head"><h3>{title}</h3></div>
      <div className="table-toolbar">
        <label className="table-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder={searchPlaceholder || 'Search this table...'}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </label>
        {toolbarExtra}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col) => {
                const sortable = col.sortable !== false;
                const arrow = sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '';
                return (
                  <th
                    key={col.key}
                    className={sortable ? 'sortable' : ''}
                    onClick={sortable ? () => toggleSort(col.key) : undefined}
                  >
                    {col.label}
                    {sortable ? <span className="sort-arrow">{arrow}</span> : null}
                  </th>
                );
              })}
              {actions ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? pageRows.map((row) => (
              <tr
                key={row[rowKey]}
                className={onRowClick ? 'clickable' : ''}
                onClick={onRowClick ? () => onRowClick(row[rowKey]) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : (row[col.key] ?? '—')}</td>
                ))}
                {actions ? (
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">{actions(row)}</div>
                  </td>
                ) : null}
              </tr>
            )) : (
              <tr><td colSpan={colCount}><div className="empty-state">No records found.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-pagination">
        <span>{filtered.length} record{filtered.length === 1 ? '' : 's'} · page {safePage} of {totalPages}</span>
        <button type="button" className="ghost-btn" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>‹ Prev</button>
        <button type="button" className="ghost-btn" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>Next ›</button>
      </div>
    </article>
  );
}
