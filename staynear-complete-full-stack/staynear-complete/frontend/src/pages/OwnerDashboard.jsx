import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const EMPTY_FORM = {
  name: '',
  address: '',
  rent: '',
  propertyType: '2BHK',
  latitude: '',
  longitude: '',
  description: '',
};

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-6" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (Number(v) * Math.PI) / 180;
  const dLat = toRad(Number(lat2) - Number(lat1));
  const dLon = toRad(Number(lon2) - Number(lon1));
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function CompanyPicker({ companies, selected, setSelected, latitude, longitude, radius, setRadius }) {
  const [query, setQuery] = useState('');
  const hasCoords = latitude !== '' && longitude !== '' && !Number.isNaN(Number(latitude)) && !Number.isNaN(Number(longitude));

  const nearby = useMemo(() => {
    if (!hasCoords) return [];
    return companies
      .map((company) => ({ ...company, distanceKm: distanceKm(latitude, longitude, company.latitude, company.longitude) }))
      .filter((company) => company.distanceKm <= Number(radius))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [companies, latitude, longitude, radius, hasCoords]);

  const filtered = nearby.filter((company) => company.name.toLowerCase().includes(query.toLowerCase()) || (company.address || '').toLowerCase().includes(query.toLowerCase()));

  const toggle = (id) => {
    setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  };

  return (
    <div className="company-picker">
      <div className="picker-heading">
        <div>
          <span className="eyebrow">SMART TAGGING</span>
          <h3>Tag nearby companies</h3>
          <p>Select one or more workplaces this property is convenient for.</p>
        </div>
        <div className="selected-count">{selected.length} selected</div>
      </div>

      <div className="radius-row">
        <span>Search radius</span>
        <div className="radius-options">
          {[5, 10, 25].map((value) => (
            <button type="button" key={value} className={Number(radius) === value ? 'active' : ''} onClick={() => setRadius(value)}>{value} km</button>
          ))}
        </div>
      </div>

      {!hasCoords ? (
        <div className="picker-empty"><Icon name="pin" size={22} /><div><b>Add latitude & longitude first</b><span>Nearby companies will appear automatically once the property coordinates are entered.</span></div></div>
      ) : (
        <>
          <div className="company-search"><Icon name="search" size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search nearby companies..." /></div>
          <div className="company-options">
            {filtered.map((company) => {
              const isSelected = selected.includes(company.id);
              return (
                <button type="button" key={company.id} className={`company-option ${isSelected ? 'selected' : ''}`} onClick={() => toggle(company.id)}>
                  <span className="company-check">{isSelected && <Icon name="check" size={14} />}</span>
                  <span className="company-avatar"><Icon name="building" size={17} /></span>
                  <span className="company-info"><b>{company.name}</b><small>{company.address || 'Company location'}</small></span>
                  <span className="company-distance">{company.distanceKm.toFixed(1)} km</span>
                </button>
              );
            })}
            {!filtered.length && <div className="picker-empty compact-empty"><Icon name="search" size={20} /><div><b>No nearby companies found</b><span>Try a larger search radius or another search term.</span></div></div>}
          </div>
        </>
      )}

      {selected.length > 0 && (
        <div className="selection-summary">
          <span>Selected workplaces</span>
          <div>{selected.map((id) => {
            const company = companies.find((item) => item.id === id);
            return company ? <span className="selection-chip" key={id}>{company.name}<button type="button" onClick={() => toggle(id)} aria-label={`Remove ${company.name}`}><Icon name="x" size={12} /></button></span> : null;
          })}</div>
        </div>
      )}
    </div>
  );
}

function TaggedCompanies({ property, companies, onChange }) {
  const [open, setOpen] = useState(false);
  const [nearby, setNearby] = useState([]);
  const [tagged, setTagged] = useState([]);
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [taggedResponse, nearbyResponse] = await Promise.all([
        api.get(`/properties/${property.id}/companies`),
        api.get(`/properties/${property.id}/nearby-companies`, { params: { radiusKm: radius } }),
      ]);
      setTagged(taggedResponse.data);
      setNearby(nearbyResponse.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load company tags.');
    }
  }

  useEffect(() => { if (open) load(); }, [open, radius]);

  const filtered = nearby.filter((company) => company.name.toLowerCase().includes(query.toLowerCase()) || (company.address || '').toLowerCase().includes(query.toLowerCase()));
  const taggedIds = new Set(tagged.map((company) => company.id));

  async function toggle(company) {
    setBusy(true);
    setError('');
    try {
      if (taggedIds.has(company.id)) await api.delete(`/properties/${property.id}/companies/${company.id}`);
      else await api.post(`/properties/${property.id}/companies`, { companyId: company.id });
      await load();
      onChange?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not update this company tag.');
    } finally { setBusy(false); }
  }

  return (
    <div className="listing-tags">
      <div className="tag-title-row">
        <div><span className="tag-label">WORKPLACE TAGS</span><b>{tagged.length ? `${tagged.length} company${tagged.length > 1 ? 'ies' : ''}` : 'No companies tagged yet'}</b></div>
        <button type="button" className={`manage-tags ${open ? 'open' : ''}`} onClick={() => setOpen((value) => !value)}>
          {open ? 'Done' : <><Icon name="plus" size={15} /> Manage</>}
        </button>
      </div>

      {tagged.length > 0 && <div className="tag-chips">{tagged.map((company) => <span className="tag-chip" key={company.id}><Icon name="building" size={12} />{company.name}<span>{Number(company.distanceKm).toFixed(1)} km</span>{open && <button type="button" disabled={busy} onClick={() => toggle(company)} aria-label={`Remove ${company.name}`}><Icon name="x" size={12} /></button>}</span>)}</div>}

      {open && <div className="tag-manager">
        <div className="radius-row manager-radius"><span>Show companies within</span><div className="radius-options">{[5, 10, 25].map((value) => <button type="button" key={value} className={radius === value ? 'active' : ''} onClick={() => setRadius(value)}>{value} km</button>)}</div></div>
        <div className="company-search"><Icon name="search" size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search companies..." /></div>
        <div className="manager-options">
          {filtered.map((company) => {
            const isSelected = taggedIds.has(company.id);
            return <button type="button" disabled={busy} key={company.id} className={`manager-option ${isSelected ? 'selected' : ''}`} onClick={() => toggle(company)}>
              <span className="company-check">{isSelected && <Icon name="check" size={14} />}</span>
              <span><b>{company.name}</b><small>{company.address || 'Company location'}</small></span>
              <strong>{Number(company.distanceKm).toFixed(1)} km</strong>
            </button>;
          })}
          {!filtered.length && <div className="mini-empty">No companies found in this radius.</div>}
        </div>
        {error && <div className="error-msg">{error}</div>}
      </div>}
    </div>
  );
}

export default function OwnerDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [props, setProps] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [pickerRadius, setPickerRadius] = useState(10);
  const [f, setF] = useState(EMPTY_FORM);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user.userId) { navigate('/login'); return; }
    Promise.all([api.get('/companies'), api.get('/properties/owner/' + user.userId)])
      .then(([companyResponse, propertyResponse]) => {
        setCompanies(companyResponse.data);
        setProps(propertyResponse.data);
      })
      .catch((e) => setError(e.response?.data?.message || 'Could not load your dashboard.'));
  }, []);

  const set = (key, value) => setF((current) => ({ ...current, [key]: value }));

  async function refreshProperties() {
    const response = await api.get('/properties/owner/' + user.userId);
    setProps(response.data);
  }

  async function add(e) {
    e.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      const response = await api.post('/properties', {
        ...f,
        ownerId: user.userId,
        rent: Number(f.rent),
        latitude: Number(f.latitude),
        longitude: Number(f.longitude),
        available: true,
      });
      const propertyId = response.data.id;
      await Promise.all(selectedCompanies.map((companyId) => api.post(`/properties/${propertyId}/companies`, { companyId })));
      await refreshProperties();
      setF(EMPTY_FORM);
      setSelectedCompanies([]);
      setMessage(selectedCompanies.length ? `Property added and tagged to ${selectedCompanies.length} compan${selectedCompanies.length === 1 ? 'y' : 'ies'}.` : 'Property added successfully.');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not add the property.');
    } finally { setSaving(false); }
  }

  function logout() {
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className="dash owner-dash">
      <nav className="dashboard-nav">
        <Link className="brand" to="/">stay<span>near</span></Link>
        <div className="nav-right"><span className="owner-pill"><span className="online-dot" /> Owner</span><button type="button" className="logout-link" onClick={logout}><Icon name="logout" size={16} /> Logout</button></div>
      </nav>

      <header className="owner-header">
        <div><small>OWNER SPACE</small><h1>Manage your properties.</h1><p>Connect each home or PG with every nearby workplace that matters to your tenants.</p></div>
        <div className="header-stat"><span>YOUR LISTINGS</span><b>{props.length}</b><small>active properties</small></div>
      </header>

      <div className="ownergrid">
        <form className="form compact property-form" onSubmit={add}>
          <div className="form-heading"><div className="form-icon"><Icon name="plus" size={21} /></div><div><h2>Add property</h2><p>List a new place and tag its workplaces.</p></div></div>
          <label>Property name<input required placeholder="e.g. Shreyasi PG" value={f.name} onChange={(e) => set('name', e.target.value)} /></label>
          <label>Address<input placeholder="Street, area, city" value={f.address} onChange={(e) => set('address', e.target.value)} /></label>
          <div className="two"><label>Monthly rent<input required type="number" min="0" placeholder="₹ 6,000" value={f.rent} onChange={(e) => set('rent', e.target.value)} /></label><label>Property type<select value={f.propertyType} onChange={(e) => set('propertyType', e.target.value)}><option>1BHK</option><option>2BHK</option><option>3BHK</option><option>PG</option></select></label></div>
          <div className="two"><label>Latitude<input required type="number" step="any" placeholder="17.3850" value={f.latitude} onChange={(e) => set('latitude', e.target.value)} /></label><label>Longitude<input required type="number" step="any" placeholder="78.4867" value={f.longitude} onChange={(e) => set('longitude', e.target.value)} /></label></div>
          <div className="coordinates-hint"><Icon name="pin" size={15} /><span>Coordinates power the workplace distance calculation.</span></div>
          <label>Description<textarea placeholder="Tell tenants what makes this property a good fit..." value={f.description} onChange={(e) => set('description', e.target.value)} /></label>

          <CompanyPicker companies={companies} selected={selectedCompanies} setSelected={setSelectedCompanies} latitude={f.latitude} longitude={f.longitude} radius={pickerRadius} setRadius={setPickerRadius} />

          <button className="submit-property" disabled={saving}>{saving ? 'Saving property…' : <>{selectedCompanies.length ? `Add property · ${selectedCompanies.length} tagged` : 'Add property'} <span>→</span></>}</button>
          {message && <div className="msg success-msg">{message}</div>}
          {error && <div className="error-msg">{error}</div>}
        </form>

        <section className="listings-section">
          <div className="section-heading"><div><span className="eyebrow">YOUR LISTINGS</span><h2>Properties & workplace tags</h2></div><span className="listing-count">{props.length} total</span></div>
          {props.length ? props.map((property) => <article className="owneritem enhanced-item" key={property.id}>
            <div className="property-summary"><div className="property-type-badge">{property.propertyType}</div><div><div className="property-name-row"><h3>{property.name}</h3><span className="available-badge">Available</span></div><span className="property-meta">₹{Number(property.rent).toLocaleString()} <i /> {property.address || `${property.latitude}, ${property.longitude}`}</span>{property.description && <p>{property.description}</p>}</div></div>
            <TaggedCompanies property={property} companies={companies} onChange={() => {}} />
          </article>) : <div className="empty enhanced-empty"><div className="empty-icon"><Icon name="building" size={28} /></div><h3>No properties yet</h3><p>Your new property will appear here after you add it.</p></div>}
        </section>
      </div>
    </div>
  );
}
