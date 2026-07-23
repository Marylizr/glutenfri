const TYPES = [
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'bakery', label: 'Pastelería' },
  { value: 'store', label: 'Tienda' },
  { value: 'pharmacy', label: 'Farmacia' },
  { value: 'supermarket', label: 'Supermercado' },
];

export default function Filters({ filters, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', padding: '8px', flexWrap: 'wrap' }}>
      <select
        value={filters.type || ''}
        onChange={(e) => onChange({ ...filters, type: e.target.value || undefined })}
      >
        <option value="">Todos los tipos</option>
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <label>
        <input
          type="checkbox"
          checked={!!filters.certifiedOnly}
          onChange={(e) => onChange({ ...filters, certifiedOnly: e.target.checked })}
        />
        Solo certificados APC
      </label>

      <label>
        <input
          type="checkbox"
          checked={!!filters.discountOnly}
          onChange={(e) => onChange({ ...filters, discountOnly: e.target.checked })}
        />
        Con descuento
      </label>
    </div>
  );
}
