export default function MiniCalendar({ eventDates = [] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventDays = new Set(
    eventDates
      .map((d) => new Date(d))
      .filter((d) => d.getFullYear() === year && d.getMonth() === month)
      .map((d) => d.getDate()),
  );
  const monthName = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(<span className="cal-day muted" key={`pad-${i}`} />);
  for (let d = 1; d <= daysInMonth; d += 1) {
    const isToday = d === now.getDate();
    const hasEvent = eventDays.has(d);
    cells.push(
      <span className={`cal-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}`} key={d}>{d}</span>,
    );
  }

  return (
    <div className="mini-calendar">
      <div className="cal-head"><span>{monthName}</span></div>
      <div className="cal-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span className="cal-day-name" key={i}>{d}</span>)}
        {cells}
      </div>
    </div>
  );
}
