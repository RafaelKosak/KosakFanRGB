import { useState, useEffect, useCallback } from 'react';
import { FaFan, FaMicrochip, FaMemory, FaQuestion, FaSync } from 'react-icons/fa';
import { HexColorPicker } from 'react-colorful';
import './index.css';

const PRESET_COLORS = [
  '#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff',
  '#0000ff', '#8800ff', '#ff00ff', '#ffffff', '#000000'
];

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    red: parseInt(result[1], 16),
    green: parseInt(result[2], 16),
    blue: parseInt(result[3], 16)
  } : { red: 0, green: 0, blue: 0 };
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

  // Load saved settings on mount
  useEffect(() => {
    const loadSavedSettings = async () => {
      if (window.electronAPI && window.electronAPI.getSettings) {
        const saved = await window.electronAPI.getSettings();
        if (saved) {
          if (saved.color) setColor(saved.color);
          if (saved.brightness !== undefined) setBrightness(saved.brightness);
          if (saved.startWithWindows !== undefined) setStartWithWindows(saved.startWithWindows);
          if (saved.startHidden !== undefined) setStartHidden(saved.startHidden);
        }
      }
    };
    loadSavedSettings();
  }, []);

  const handleToggleStartWithWindows = async (e) => {
    const val = e.target.checked;
    setStartWithWindows(val);
    if (window.electronAPI && window.electronAPI.saveSettings) {
      await window.electronAPI.saveSettings({
        color,
        brightness,
        startWithWindows: val,
        startHidden
      });
    }
  };

  const handleToggleStartHidden = async (e) => {
    const val = e.target.checked;
    setStartHidden(val);
    if (window.electronAPI && window.electronAPI.saveSettings) {
      await window.electronAPI.saveSettings({
        color,
        brightness,
        startWithWindows,
        startHidden: val
      });
    }
  };

  const fetchDevices = useCallback(async () => {
    if (!window.electronAPI) {
      setStatus('error');
      setError('Electron API não disponível');
      return;
    }

    setStatus('scanning');
    setError('');

    const result = await window.electronAPI.getDevices();

    if (result && result.error) {
      setStatus('error');
      setError(result.error);
    } else if (Array.isArray(result)) {
      setDevices(result);
      if (result.length > 0) {
        setActiveDevice(result[0]);
        setStatus('connected');
      } else {
        setStatus('error');
        setError('Nenhum dispositivo RGB detectado.\nVerifique se seus fans/placas possuem LEDs RGB.');
      }
    }
  }, []);

  // On mount: wait a bit for the backend to connect, then fetch
  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    const tryFetch = async () => {
      while (!cancelled && attempt < 10) {
        attempt++;
        console.log(`[UI] Fetch attempt ${attempt}...`);

        if (window.electronAPI) {
          const result = await window.electronAPI.getDevices();

          if (cancelled) return;

          if (result && result.error) {
            console.log(`[UI] Attempt ${attempt} error:`, result.error);
            // Wait 2 seconds and retry
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }

          if (Array.isArray(result) && result.length > 0) {
            setDevices(result);
            setActiveDevice(result[0]);
            setStatus('connected');
            return;
          }

          if (Array.isArray(result) && result.length === 0) {
            setStatus('error');
            setError('Nenhum dispositivo RGB detectado.');
            return;
          }
        }

        await new Promise(r => setTimeout(r, 2000));
      }

      if (!cancelled) {
        setStatus('error');
        setError('Não foi possível conectar ao motor de hardware após várias tentativas.\nTente executar como Administrador.');
      }
    };

    // Give the backend 3 seconds head start to connect
    const timer = setTimeout(() => {
      setStatus('scanning');
      tryFetch();
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleRetry = async () => {
    setStatus('scanning');
    setError('');
    if (window.electronAPI && window.electronAPI.retryConnection) {
      await window.electronAPI.retryConnection();
    }
    await fetchDevices();
  };

  const applyColors = async () => {
    if (!activeDevice || !window.electronAPI) return;

    const baseRgb = hexToRgb(color);
    const finalRgb = {
      red: Math.floor(baseRgb.red * (brightness / 100)),
      green: Math.floor(baseRgb.green * (brightness / 100)),
      blue: Math.floor(baseRgb.blue * (brightness / 100)),
    };

    const ledCount = activeDevice.colors.length;
    const colorArray = new Array(ledCount).fill(finalRgb);

    const result = await window.electronAPI.updateLeds(activeDevice.index, colorArray);
    if (result.error) {
      alert('Erro ao aplicar cores: ' + result.error);
    } else {
      if (window.electronAPI.saveSettings) {
        await window.electronAPI.saveSettings({
          color,
          brightness,
          startWithWindows,
          startHidden
        });
      }
    }
  };

  const getDeviceIcon = (type) => {
    if (!type) return <FaQuestion />;
    const t = String(type).toLowerCase();
    if (t.includes('fan') || t.includes('cooler')) return <FaFan />;
    if (t.includes('motherboard') || t.includes('mainboard')) return <FaMicrochip />;
    if (t.includes('dram') || t.includes('memory')) return <FaMemory />;
    return <FaMicrochip />;
  };

  const renderStatusText = () => {
    switch (status) {
      case 'starting':
        return (
          <div className="status-msg">
            <div className="spinner"></div>
            <p>Iniciando motor de hardware...</p>
          </div>
        );
      case 'scanning':
        return (
          <div className="status-msg">
            <div className="spinner"></div>
            <p>Procurando dispositivos RGB...</p>
          </div>
        );
      case 'error':
        return (
          <div className="status-msg error">
            <p style={{ whiteSpace: 'pre-line' }}>{error}</p>
            <button className="btn-retry" onClick={handleRetry}>
              <FaSync /> Tentar Novamente
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="title-bar">KOSAK FAN RGB</div>

      <div className="app-container">
        <div className="glass-panel sidebar">
          <h2 style={{ fontSize: '16px', margin: '0 0 10px 0', paddingLeft: '5px' }}>Dispositivos</h2>

          {status !== 'connected' && renderStatusText()}

          {devices.map(device => (
            <div
              key={device.index}
              className={`device-item ${activeDevice?.index === device.index ? 'active' : ''}`}
              onClick={() => setActiveDevice(device)}
            >
              <div className="device-icon">
                {getDeviceIcon(device.type)}
              </div>
              <div className="device-info">
                <h3>{device.name}</h3>
                <p>{device.leds ? `${device.leds.length} LEDs` : 'Dispositivo RGB'}</p>
              </div>
            </div>
          ))}

          <div className="settings-section" style={{ marginTop: 'auto' }}>
            <h3>Configurações</h3>
            <label className="switch-container">
              <input
                type="checkbox"
                checked={startWithWindows}
                onChange={handleToggleStartWithWindows}
              />
              <span className="switch-label">Iniciar com o Windows</span>
            </label>
            <label className="switch-container">
              <input
                type="checkbox"
                checked={startHidden}
                onChange={handleToggleStartHidden}
              />
              <span className="switch-label">Iniciar oculto (bandeja)</span>
            </label>
          </div>

          {status === 'connected' && (
            <button className="btn-retry" onClick={handleRetry} style={{ marginTop: '15px', opacity: 0.6, fontSize: '11px' }}>
              <FaSync /> Atualizar Lista
            </button>
          )}
        </div>

        <div className="glass-panel main-content">
          {activeDevice ? (
            <>
              <div className="control-section">
                <h2>Cores</h2>

                <div className="color-picker-container">
                  <HexColorPicker color={color} onChange={setColor} />
                  <div className="color-preview-bar" style={{ backgroundColor: color, boxShadow: `0 0 30px ${color}50` }}>
                    <span className="color-value-text">{color.toUpperCase()}</span>
                  </div>
                </div>

                <div className="color-grid">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      className={`color-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c, color: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="control-section">
                <h2>Intensidade ({brightness}%)</h2>
                <div className="slider-container">
                  <span style={{ fontSize: '20px' }}>🔅</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                  />
                  <span style={{ fontSize: '20px' }}>🔆</span>
                </div>
              </div>

              <button className="btn-apply" onClick={applyColors}>
                Aplicar ao Dispositivo
              </button>
            </>
          ) : (
            <div className="empty-state">
              <FaFan style={{ fontSize: '64px', opacity: 0.3 }} />
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
