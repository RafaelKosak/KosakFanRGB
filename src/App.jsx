import { useState, useEffect, useCallback } from 'react';
import { FaFan, FaMicrochip, FaMemory, FaQuestion, FaSync, FaStar, FaRegStar, FaSun, FaMoon, FaClone, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import { HexColorPicker } from 'react-colorful';
import './index.css';

const EFFECTS = [
  { id: 'static',     label: 'Estático' },
  { id: 'breathing',  label: 'Respiração' },
  { id: 'rainbow',    label: 'Rainbow' },
  { id: 'wave',       label: 'Onda' },
  { id: 'pulse',      label: 'Pulso' },
  { id: 'gradient',   label: 'Gradiente' },
  { id: 'blink',      label: 'Piscar' },
  { id: 'colorcycle', label: 'Ciclo de Cores' },
  { id: 'off',        label: 'Desligado' },
];

const ANIMATED_EFFECTS = ['breathing', 'rainbow', 'wave', 'pulse', 'blink', 'colorcycle'];

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
  const [effect, setEffect] = useState('static');
  const [effectSpeed, setEffectSpeed] = useState(50);
  const [effectDirection, setEffectDirection] = useState(0);
  const [effectSmoothness, setEffectSmoothness] = useState(50);
  const [version, setVersion] = useState('');

  // Profiles system states
  const [profiles, setProfiles] = useState([
    {
      id: 'default',
      name: 'Padrão',
      color: '#aa3bff',
      brightness: 100,
      effect: 'static',
      effectSpeed: 50,
      effectDirection: 0,
      effectSmoothness: 50
    }
  ]);
  const [activeProfileId, setActiveProfileId] = useState('default');

  useEffect(() => {
    const load = async () => {
      if (window.electronAPI?.getAppVersion) {
        try {
          const v = await window.electronAPI.getAppVersion();
          setVersion(v);
        } catch (e) {
          console.error(e);
        }
      }
      if (!window.electronAPI?.getSettings) return;
      const s = await window.electronAPI.getSettings();
      if (!s) return;
      
      if (Array.isArray(s.profiles)) {
        setProfiles(s.profiles);
      }
      if (s.activeProfileId) {
        setActiveProfileId(s.activeProfileId);
      }

      // Load active profile configs
      const active = s.profiles?.find(p => p.id === s.activeProfileId) || s.profiles?.[0] || s;
      if (active.color) setColor(active.color);
      if (active.brightness !== undefined) setBrightness(active.brightness);
      if (active.effect) setEffect(active.effect);
      if (active.effectSpeed !== undefined) setEffectSpeed(active.effectSpeed);
      if (active.effectDirection !== undefined) setEffectDirection(active.effectDirection);
      if (active.effectSmoothness !== undefined) setEffectSmoothness(active.effectSmoothness);

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

    let updatedProfiles = overrides.profiles !== undefined ? overrides.profiles : profiles;
    const currentActiveId = overrides.activeProfileId !== undefined ? overrides.activeProfileId : activeProfileId;

    // Update active profile values in profiles list
    updatedProfiles = updatedProfiles.map(p => {
      if (p.id === currentActiveId) {
        return {
          ...p,
          color: overrides.color !== undefined ? overrides.color : color,
          brightness: overrides.brightness !== undefined ? overrides.brightness : brightness,
          effect: overrides.effect !== undefined ? overrides.effect : effect,
          effectSpeed: overrides.effectSpeed !== undefined ? overrides.effectSpeed : effectSpeed,
          effectDirection: overrides.effectDirection !== undefined ? overrides.effectDirection : effectDirection,
          effectSmoothness: overrides.effectSmoothness !== undefined ? overrides.effectSmoothness : effectSmoothness,
        };
      }
      return p;
    });

    await window.electronAPI.saveSettings({
      startWithWindows: overrides.startWithWindows !== undefined ? overrides.startWithWindows : startWithWindows,
      startHidden: overrides.startHidden !== undefined ? overrides.startHidden : startHidden,
      favoriteColors: overrides.favoriteColors !== undefined ? overrides.favoriteColors : favoriteColors,
      theme: overrides.theme !== undefined ? overrides.theme : theme,
      profiles: updatedProfiles,
      activeProfileId: currentActiveId,
      // For backwards compatibility
      color: overrides.color !== undefined ? overrides.color : color,
      brightness: overrides.brightness !== undefined ? overrides.brightness : brightness,
      effect: overrides.effect !== undefined ? overrides.effect : effect,
      effectSpeed: overrides.effectSpeed !== undefined ? overrides.effectSpeed : effectSpeed,
      effectDirection: overrides.effectDirection !== undefined ? overrides.effectDirection : effectDirection,
      effectSmoothness: overrides.effectSmoothness !== undefined ? overrides.effectSmoothness : effectSmoothness,
    });
  }, [color, brightness, startWithWindows, startHidden, favoriteColors, theme, effect, effectSpeed, effectDirection, effectSmoothness, profiles, activeProfileId]);

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

  // Device scanning
  const fetchDevices = useCallback(async () => {
    if (!window.electronAPI) { setStatus('error'); setError('Electron API não disponível'); return; }
    setStatus('scanning');
    setError('');
    const result = await window.electronAPI.getDevices();
    if (result?.error) { setStatus('error'); setError(result.error); }
    else if (Array.isArray(result)) {
      setDevices(result);
      if (result.length > 0) { setActiveDevice(result[0]); setStatus('connected'); }
      else { setStatus('error'); setError('Nenhum dispositivo RGB detectado.'); }
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

  // Apply effect
  const applyEffect = async () => {
    if (!activeDevice || !window.electronAPI) return;
    const opts = { effect, color, brightness, speed: effectSpeed, direction: effectDirection, smoothness: effectSmoothness };
    const result = await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, opts);
    if (result?.error) { alert('Erro: ' + result.error); return; }
    await save();
  };

  // Profiles operations
  const selectProfile = async (id) => {
    const p = profiles.find(prof => prof.id === id);
    if (!p) return;

    setActiveProfileId(id);
    setColor(p.color);
    setBrightness(p.brightness);
    setEffect(p.effect);
    setEffectSpeed(p.effectSpeed);
    setEffectDirection(p.effectDirection);
    setEffectSmoothness(p.effectSmoothness);

    // Auto apply
    if (activeDevice && window.electronAPI) {
      await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, {
        effect: p.effect, color: p.color, brightness: p.brightness, speed: p.effectSpeed, direction: p.effectDirection, smoothness: p.effectSmoothness
      });
    }

    await save({
      activeProfileId: id, color: p.color, brightness: p.brightness, effect: p.effect, effectSpeed: p.effectSpeed, effectDirection: p.effectDirection, effectSmoothness: p.effectSmoothness
    });
  };

  const createNewProfile = async () => {
    const name = prompt('Nome do novo perfil:');
    if (!name || !name.trim()) return;

    const newId = 'profile_' + Date.now();
    const newP = {
      id: newId,
      name: name.trim(),
      color, brightness, effect, effectSpeed, effectDirection, effectSmoothness
    };

    const updated = [...profiles, newP];
    setProfiles(updated);
    setActiveProfileId(newId);

    await save({ profiles: updated, activeProfileId: newId });

    if (activeDevice && window.electronAPI) {
      await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, {
        effect, color, brightness, speed: effectSpeed, direction: effectDirection, smoothness: effectSmoothness
      });
    }
  };

  const duplicateProfile = async (id) => {
    const target = profiles.find(p => p.id === id);
    if (!target) return;

    const newId = 'profile_' + Date.now();
    const copy = {
      ...target,
      id: newId,
      name: `${target.name} (Cópia)`
    };

    const updated = [...profiles, copy];
    setProfiles(updated);
    setActiveProfileId(newId);

    setColor(copy.color);
    setBrightness(copy.brightness);
    setEffect(copy.effect);
    setEffectSpeed(copy.effectSpeed);
    setEffectDirection(copy.effectDirection);
    setEffectSmoothness(copy.effectSmoothness);

    await save({
      profiles: updated, activeProfileId: newId, color: copy.color, brightness: copy.brightness, effect: copy.effect, effectSpeed: copy.effectSpeed, effectDirection: copy.effectDirection, effectSmoothness: copy.effectSmoothness
    });

    if (activeDevice && window.electronAPI) {
      await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, {
        effect: copy.effect, color: copy.color, brightness: copy.brightness, speed: copy.effectSpeed, direction: copy.effectDirection, smoothness: copy.effectSmoothness
      });
    }
  };

  const deleteProfile = async (id) => {
    if (profiles.length <= 1) return;

    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);

    if (activeProfileId === id) {
      const first = updated[0];
      setActiveProfileId(first.id);
      setColor(first.color);
      setBrightness(first.brightness);
      setEffect(first.effect);
      setEffectSpeed(first.effectSpeed);
      setEffectDirection(first.effectDirection);
      setEffectSmoothness(first.effectSmoothness);

      await save({
        profiles: updated, activeProfileId: first.id, color: first.color, brightness: first.brightness, effect: first.effect, effectSpeed: first.effectSpeed, effectDirection: first.effectDirection, effectSmoothness: first.effectSmoothness
      });

      if (activeDevice && window.electronAPI) {
        await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, {
          effect: first.effect, color: first.color, brightness: first.brightness, speed: first.effectSpeed, direction: first.effectDirection, smoothness: first.effectSmoothness
        });
      }
    } else {
      await save({ profiles: updated });
    }
  };

  const handleExportProfile = async (profile) => {
    if (!window.electronAPI?.exportProfile) return;
    const res = await window.electronAPI.exportProfile(profile);
    if (res?.error) alert('Erro ao exportar: ' + res.error);
  };

  const handleImportProfile = async () => {
    if (!window.electronAPI?.importProfile) return;
    const res = await window.electronAPI.importProfile();
    if (res?.error) { alert(res.error); return; }
    if (res?.profile) {
      const newP = res.profile;
      const updated = [...profiles, newP];
      setProfiles(updated);
      setActiveProfileId(newP.id);

      setColor(newP.color);
      setBrightness(newP.brightness);
      setEffect(newP.effect);
      setEffectSpeed(newP.effectSpeed);
      setEffectDirection(newP.effectDirection);
      setEffectSmoothness(newP.effectSmoothness);

      await save({
        profiles: updated, activeProfileId: newP.id, color: newP.color, brightness: newP.brightness, effect: newP.effect, effectSpeed: newP.effectSpeed, effectDirection: newP.effectDirection, effectSmoothness: newP.effectSmoothness
      });

      if (activeDevice && window.electronAPI) {
        await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, {
          effect: newP.effect, color: newP.color, brightness: newP.brightness, speed: newP.effectSpeed, direction: newP.effectDirection, smoothness: newP.effectSmoothness
        });
      }
    }
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
  const isAnimated = ANIMATED_EFFECTS.includes(effect);
  const showColorPicker = effect !== 'off' && effect !== 'rainbow' && effect !== 'colorcycle';

  return (
    <>
      <div className="title-bar">KOSAK FAN RGB</div>
      <div className="app-layout">
        <div className="sidebar">
          {/* Devices List */}
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

          {/* Profiles System */}
          <div className="sidebar-label">Perfis</div>
          <div className="profile-list">
            {profiles.map(p => (
              <div key={p.id} className={`profile-item ${activeProfileId === p.id ? 'active' : ''}`} onClick={() => selectProfile(p.id)}>
                <span className="profile-name">{p.name}</span>
                <div className="profile-actions">
                  <button className="profile-action-btn" onClick={(e) => { e.stopPropagation(); duplicateProfile(p.id); }} title="Duplicar"><FaClone size={10} /></button>
                  <button className="profile-action-btn" onClick={(e) => { e.stopPropagation(); handleExportProfile(p); }} title="Exportar"><FaDownload size={10} /></button>
                  {profiles.length > 1 && (
                    <button className="profile-action-btn delete" onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); }} title="Excluir"><FaTrash size={10} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="profile-global-btns">
            <button className="btn-small-sidebar" onClick={createNewProfile}>+ Novo Perfil</button>
            <button className="btn-small-sidebar" onClick={handleImportProfile}><FaUpload size={9} /> Importar</button>
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
            {version && (
              <div className="app-version">v{version}</div>
            )}
          </div>
        </div>

        <div className="main-panel">
          {activeDevice ? (
            <>
              <div className="main-scroll">
                {/* Effects */}
                <div className="section">
                  <div className="section-title">Efeito</div>
                  <div className="effects-grid">
                    {EFFECTS.map(fx => (
                      <button
                        key={fx.id}
                        className={`effect-btn ${effect === fx.id ? 'active' : ''}`}
                        onClick={() => setEffect(fx.id)}
                      >
                        {fx.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker - hidden for rainbow/colorcycle/off */}
                {showColorPicker && (
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
                )}

                {/* Favorites */}
                {favoriteColors.length > 0 && showColorPicker && (
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

                {/* Effect Settings */}
                {effect !== 'off' && (
                  <div className="section">
                    <div className="section-title">Configurações</div>

                    {/* Brightness - always */}
                    <div className="config-row">
                      <span className="config-label">Brilho</span>
                      <div className="config-slider">
                        <input type="range" min="0" max="100" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} />
                        <span className="config-val">{brightness}%</span>
                      </div>
                    </div>

                    {/* Speed - animated only */}
                    {isAnimated && (
                      <div className="config-row">
                        <span className="config-label">Velocidade</span>
                        <div className="config-slider">
                          <input type="range" min="0" max="100" value={effectSpeed} onChange={e => setEffectSpeed(parseInt(e.target.value))} />
                          <span className="config-val">{effectSpeed}%</span>
                        </div>
                      </div>
                    )}

                    {/* Direction - animated only */}
                    {isAnimated && (
                      <div className="config-row">
                        <span className="config-label">Direção</span>
                        <div className="config-btns">
                          <button className={`dir-btn ${effectDirection === 0 ? 'active' : ''}`} onClick={() => setEffectDirection(0)}>→</button>
                          <button className={`dir-btn ${effectDirection === 1 ? 'active' : ''}`} onClick={() => setEffectDirection(1)}>←</button>
                        </div>
                      </div>
                    )}

                    {/* Smoothness - animated only */}
                    {isAnimated && (
                      <div className="config-row">
                        <span className="config-label">Suavidade</span>
                        <div className="config-slider">
                          <input type="range" min="0" max="100" value={effectSmoothness} onChange={e => setEffectSmoothness(parseInt(e.target.value))} />
                          <span className="config-val">{effectSmoothness}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="main-footer">
                <button className="btn-theme" onClick={toggleTheme}>
                  {theme === 'dark' ? <FaSun size={11} /> : <FaMoon size={11} />}
                  {theme === 'dark' ? 'Claro' : 'Escuro'}
                </button>
                <button className="btn-apply" onClick={applyEffect}>Aplicar</button>
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
