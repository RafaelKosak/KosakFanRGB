import { useState, useEffect, useCallback } from 'react';
import { FaFan, FaMicrochip, FaMemory, FaQuestion, FaSync, FaStar, FaRegStar, FaSun, FaMoon } from 'react-icons/fa';
import { HexColorPicker } from 'react-colorful';
import './index.css';

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { red: parseInt(r[1], 16), green: parseInt(r[2], 16), blue: parseInt(r[3], 16) }
    : { red: 0, green: 0, blue: 0 };
}

function App() {
  const [devices, setDevices] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);
  const [color, setColor] = useState('#aa3bff');
  const [brightness, setBrightness] = useState(100);
  const [status, setStatus] = useState('starting');
  const [error, setError] = useState('');
  const [startWithWindows, setStartWithWindows] = useState(false);
  const [startHidden, setStartHidden] = useState(false);
  const [favoriteColors, setFavoriteColors] = useState([]);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const load = async () => {
      if (!window.electronAPI?.getSettings) return;
      const s = await window.electronAPI.getSettings();
      if (!s) return;
      if (s.color) setColor(s.color);
      if (s.brightness !== undefined) setBrightness(s.brightness);
      if (s.startWithWindows !== undefined) setStartWithWindows(s.startWithWindows);
      if (s.startHidden !== undefined) setStartHidden(s.startHidden);
      if (Array.isArray(s.favoriteColors)) setFavoriteColors(s.favoriteColors);
      if (s.theme) setTheme(s.theme);
    };
    load();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const save = useCallback(async (overrides = {}) => {
    if (!window.electronAPI?.saveSettings) return;
    await window.electronAPI.saveSettings({
      color, brightness, startWithWindows, startHidden, favoriteColors, theme,
      ...overrides
    });
  }, [color, brightness, startWithWindows, startHidden, favoriteColors, theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    save({ theme: next });
  };

  const handleToggle = async (field, val) => {
    if (field === 'startWithWindows') setStartWithWindows(val);
    if (field === 'startHidden') setStartHidden(val);
    await save({ [field]: val });
  };

  const toggleFavorite = async () => {
    const hex = color.toLowerCase();
    const updated = favoriteColors.includes(hex)
      ? favoriteColors.filter(c => c !== hex)
      : [...favoriteColors, hex];
    setFavoriteColors(updated);
    await save({ favoriteColors: updated });
  };

  const removeFav = async (hex) => {
    const updated = favoriteColors.filter(c => c !== hex);
    setFavoriteColors(updated);
    await save({ favoriteColors: updated });
  };

  const isFav = favoriteColors.includes(color.toLowerCase());

  const fetchDevices = useCallback(async () => {
    if (!window.electronAPI) { setStatus('error'); setError('Electron API não disponível'); return; }
    setStatus('scanning');
    setError('');
    const result = await window.electronAPI.getDevices();
    if (result?.error) { setStatus('error'); setError(result.error); }
    else if (Array.isArray(result)) {
      setDevices(result);
      if (result.length > 0) { setActiveDevice(result[0]); setStatus('connected'); }
      else { setStatus('error'); setError('Nenhum dispositivo RGB detectado.\nVerifique se seus fans/placas possuem LEDs RGB.'); }
    }
  }, []);

  useEffect(() => {
    let cancelled = false, attempt = 0;
    const tryFetch = async () => {
      while (!cancelled && attempt < 10) {
        attempt++;
        if (window.electronAPI) {
          const r = await window.electronAPI.getDevices();
          if (cancelled) return;
          if (r?.error) { await new Promise(x => setTimeout(x, 2000)); continue; }
          if (Array.isArray(r) && r.length > 0) { setDevices(r); setActiveDevice(r[0]); setStatus('connected'); return; }
          if (Array.isArray(r) && r.length === 0) { setStatus('error'); setError('Nenhum dispositivo RGB detectado.'); return; }
        }
        await new Promise(x => setTimeout(x, 2000));
      }
      if (!cancelled) { setStatus('error'); setError('Não foi possível conectar ao hardware.\nTente executar como Administrador.'); }
    };
    const t = setTimeout(() => { setStatus('scanning'); tryFetch(); }, 3000);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const handleRetry = async () => {
    setStatus('scanning'); setError('');
    if (window.electronAPI?.retryConnection) await window.electronAPI.retryConnection();
    await fetchDevices();
  };

  const applyColors = async () => {
    if (!activeDevice || !window.electronAPI) return;
    const base = hexToRgb(color);
    const final = {
      red: Math.floor(base.red * brightness / 100),
      green: Math.floor(base.green * brightness / 100),
      blue: Math.floor(base.blue * brightness / 100),
    };
    const result = await window.electronAPI.updateLeds(activeDevice.index, new Array(activeDevice.colors.length).fill(final));
    if (result.error) alert('Erro: ' + result.error);
    else await save();
  };

  const icon = (type) => {
    if (!type) return <FaQuestion />;
    const t = String(type).toLowerCase();
    if (t.includes('fan') || t.includes('cooler')) return <FaFan />;
    if (t.includes('motherboard') || t.includes('mainboard')) return <FaMicrochip />;
    if (t.includes('dram') || t.includes('memory')) return <FaMemory />;
    return <FaMicrochip />;
  };

  const statusContent = () => {
    if (status === 'starting' || status === 'scanning')
      return <div className="status-msg"><div className="spinner" /><p>{status === 'starting' ? 'Iniciando hardware...' : 'Procurando dispositivos...'}</p></div>;
    if (status === 'error')
      return <div className="status-msg error"><p style={{ whiteSpace: 'pre-line' }}>{error}</p><button className="btn-retry" onClick={handleRetry}><FaSync /> Tentar Novamente</button></div>;
    return null;
  };

  const rgb = hexToRgb(color);

  return (
    <>
      <div className="title-bar">KOSAK FAN RGB</div>
      <div className="app-layout">
        <div className="sidebar">
          <div className="sidebar-label">Dispositivos</div>
          <div className="device-list">
            {status !== 'connected' && statusContent()}
            {devices.map(d => (
              <div key={d.index} className={`device-item ${activeDevice?.index === d.index ? 'active' : ''}`} onClick={() => setActiveDevice(d)}>
                <div className="device-icon">{icon(d.type)}</div>
                <div className="device-info">
                  <h3>{d.name}</h3>
                  <p>{d.leds ? `${d.leds.length} LEDs` : 'RGB'}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="toggle-row">
              <span className="toggle-label">Iniciar com Windows</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={startWithWindows} onChange={e => handleToggle('startWithWindows', e.target.checked)} />
                <span className="toggle-track" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-label">Iniciar oculto</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={startHidden} onChange={e => handleToggle('startHidden', e.target.checked)} />
                <span className="toggle-track" />
              </label>
            </div>
            {status === 'connected' && (
              <button className="btn-small" onClick={handleRetry}><FaSync size={9} /> Atualizar</button>
            )}
          </div>
        </div>

        <div className="main-panel">
          {activeDevice ? (
            <>
              <div className="main-scroll">
                <div className="section">
                  <div className="section-title">Cor</div>
                  <div className="picker-row">
                    <HexColorPicker color={color} onChange={setColor} />
                    <div className="color-details">
                      <div className="color-swatch" style={{ backgroundColor: color }}>
                        <span className="color-hex">{color.toUpperCase()}</span>
                      </div>
                      <div className="rgb-row">
                        <div className="rgb-cell"><span className="rgb-cell-label r">R</span><span className="rgb-cell-val">{rgb.red}</span></div>
                        <div className="rgb-cell"><span className="rgb-cell-label g">G</span><span className="rgb-cell-val">{rgb.green}</span></div>
                        <div className="rgb-cell"><span className="rgb-cell-label b">B</span><span className="rgb-cell-val">{rgb.blue}</span></div>
                      </div>
                      <button className={`btn-fav ${isFav ? 'is-fav' : ''}`} onClick={toggleFavorite}>
                        {isFav ? <FaStar size={11} /> : <FaRegStar size={11} />}
                        {isFav ? 'Favoritada' : 'Favoritar'}
                      </button>
                    </div>
                  </div>
                </div>

                {favoriteColors.length > 0 && (
                  <div className="section">
                    <div className="section-title">Favoritas</div>
                    <div className="favorites-grid">
                      {favoriteColors.map(hex => (
                        <div key={hex} className={`fav-swatch ${color.toLowerCase() === hex ? 'active' : ''}`} style={{ backgroundColor: hex }} onClick={() => setColor(hex)}>
                          <span className="fav-remove" onClick={e => { e.stopPropagation(); removeFav(hex); }}>✕</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="section">
                  <div className="section-title">Intensidade</div>
                  <div className="brightness-row">
                    <span className="brightness-icon">🔅</span>
                    <input type="range" min="0" max="100" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} />
                    <span className="brightness-icon">🔆</span>
                    <span className="brightness-val">{brightness}%</span>
                  </div>
                </div>
              </div>

              <div className="main-footer">
                <button className="btn-theme" onClick={toggleTheme}>
                  {theme === 'dark' ? <FaSun size={11} /> : <FaMoon size={11} />}
                  {theme === 'dark' ? 'Claro' : 'Escuro'}
                </button>
                <button className="btn-apply" onClick={applyColors}>Aplicar</button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <FaFan />
              <h2>Nenhum dispositivo selecionado</h2>
              <p>Selecione um dispositivo na lista lateral.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
