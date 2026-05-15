import colorStyles from '../data/colorStyles.json'
import './StylePicker.css'

export default function StylePicker({ selected, onSelect }) {
  return (
    <div className="style-picker">
      <p className="style-picker-label">Kies een filmstijl</p>
      <div className="style-grid">
        {Object.entries(colorStyles).map(([key, style]) => (
          <button
            key={key}
            className={`style-card ${selected === key ? 'selected' : ''}`}
            onClick={() => onSelect(key)}
          >
            <span className="style-name">{style.label}</span>
            <span className="style-desc">{style.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
