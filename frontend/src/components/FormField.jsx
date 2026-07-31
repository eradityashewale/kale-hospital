export default function FormField({
  label, name, type = 'text', defaultValue = '', required = false, placeholder = '',
  options = null, full = false, hint = '', rows = null, accept,
}) {
  const cls = full ? 'form-full' : '';

  let control;
  if (type === 'select') {
    control = (
      <select name={name} required={required} defaultValue={defaultValue}>
        {(options || []).map((opt) => {
          const optVal = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return <option key={optVal} value={optVal}>{optLabel}</option>;
        })}
      </select>
    );
  } else if (type === 'textarea') {
    control = <textarea name={name} required={required} placeholder={placeholder} rows={rows || undefined} defaultValue={defaultValue} />;
  } else if (type === 'file') {
    control = <input name={name} type="file" accept={accept} />;
  } else {
    control = <input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} />;
  }

  return (
    <label className={cls}>
      {label}
      {control}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
