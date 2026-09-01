import { useEffect, useState } from 'react';
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
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-6" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function ManualCompanyForm({ onAdded, compact = false }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const response = await api.post('/companies', {
        name: name.trim(),
        address: address.trim() || null,
      });
      onAdded(response.data);
      setName('');
      setAddress('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add the company.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={`manual-company-form ${compact ? 'compact-manual-form' : ''}`} onSubmit={submit}>
      <div className="manual-form-heading">
        <div className="manual-form-icon"><Icon name="building" size={16} /></div>
        <div>
          <b>Add company manually</b>
          <span>Company coordinates are not required.</span>
        </div>
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name (e.g. TCS)" required />
      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Company address (optional)" />
      <button type="submit" disabled={saving || !name.trim()}>
        <Icon name="plus" size={15} /> {saving ? 'Adding company…' : 'Add company'}
      </button>
      {error && <div className="error-msg">{error}</div>}
    </form>
  );
}

function TaggedCompanies({ property, onChange }) {
  const [tagged, setTagged] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const response = await api.get(`/properties/${property.id}/companies`);
      setTagged(response.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load company tags.');
    }
  }

  useEffect(() => { load(); }, [property.id]);

  async function remove(companyId) {
    setBusyId(companyId);
    setError('');
    try {
      await api.delete(`/properties/${property.id}/companies/${companyId}`);
      await load();
      onChange?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not remove the company tag.');
    } finally {
      setBusyId(null);
    }
  }

  async function addManualCompany(company) {
    setError('');
    setBusyId(company.id);
    try {
      await api.post(`/properties/${property.id}/companies`, { companyId: company.id });
      await load();
      setShowAdd(false);
      onChange?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not tag the company.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="listing-tags">
      <div className="tag-title-row">
        <div>
          <span className="tag-label">WORKPLACE TAGS</span>
          <b>{tagged.length ? `${tagged.length} compan${tagged.length === 1 ? 'y' : 'ies'} tagged` : 'No companies tagged yet'}</b>
        </div>
        <button type="button" className={`manage-tags ${showAdd ? 'open' : ''}`} onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? 'Close' : <><Icon name="plus" size={15} /> Add company</>}
        </button>
      </div>

      {tagged.length > 0 && (
        <div className="tag-chips">
          {tagged.map((company) => (
            <span className="tag-chip" key={company.id}>
              <Icon name="building" size={12} /> {company.name}
              <button type="button" disabled={busyId === company.id} onClick={() => remove(company.id)} aria-label={`Remove ${company.name}`}>
                <Icon name="x" size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="inline-manual-company">
          <ManualCompanyForm onAdded={addManualCompany} compact />
          <div className="manual-tag-note"><Icon name="check" size={13} /> The new company will be added and tagged to this property automatically.</div>
        </div>
      )}
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}

export default function OwnerDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [props, setProps] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedCompanyNames, setSelectedCompanyNames] = useState([]);
  const [f, setF] = useState(EMPTY_FORM);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user.userId) { navigate('/login'); return; }
    api.get('/properties/owner/' + user.userId)
      .then((response) => setProps(response.data))
      .catch((e) => setError(e.response?.data?.message || 'Could not load your dashboard.'));
  }, []);

  const set = (key, value) => setF((current) => ({ ...current, [key]: value }));

  async function refreshProperties() {
    const response = await api.get('/properties/owner/' + user.userId);
    setProps(response.data);
  }

  async function addCompanyToNewProperty(company) {
    if (selectedCompanies.includes(company.id)) return;
    setSelectedCompanies((current) => [...current, company.id]);
    setSelectedCompanyNames((current) => [...current, { id: company.id, name: company.name }]);
  }

  function removeSelectedCompany(id) {
    setSelectedCompanies((current) => current.filter((x) => x !== id));
    setSelectedCompanyNames((current) => current.filter((x) => x.id !== id));
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
      setSelectedCompanyNames([]);
      setMessage(selectedCompanies.length
        ? `Property added and tagged to ${selectedCompanies.length} compan${selectedCompanies.length === 1 ? 'y' : 'ies'}.`
        : 'Property added successfully.');
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
        <div><small>OWNER SPACE</small><h1>Manage your properties.</h1><p>Connect each home or PG with every workplace that matters to your tenants.</p></div>
        <div className="header-stat"><span>YOUR LISTINGS</span><b>{props.length}</b><small>active properties</small></div>
      </header>

      <div className="ownergrid">
        <form className="form compact property-form" onSubmit={add}>
          <div className="form-heading"><div className="form-icon"><Icon name="plus" size={21} /></div><div><h2>Add property</h2><p>List a new place and manually add every workplace you want to tag.</p></div></div>
          <label>Property name<input required placeholder="e.g. Shreyasi PG" value={f.name} onChange={(e) => set('name', e.target.value)} /></label>
          <label>Address<input placeholder="Street, area, city" value={f.address} onChange={(e) => set('address', e.target.value)} /></label>
          <div className="two"><label>Monthly rent<input required type="number" min="0" placeholder="₹ 6,000" value={f.rent} onChange={(e) => set('rent', e.target.value)} /></label><label>Property type<select value={f.propertyType} onChange={(e) => set('propertyType', e.target.value)}><option>1BHK</option><option>2BHK</option><option>3BHK</option><option>PG</option></select></label></div>
          <div className="two"><label>Latitude<input required type="number" step="any" placeholder="17.3850" value={f.latitude} onChange={(e) => set('latitude', e.target.value)} /></label><label>Longitude<input required type="number" step="any" placeholder="78.4867" value={f.longitude} onChange={(e) => set('longitude', e.target.value)} /></label></div>
          <div className="coordinates-hint"><Icon name="pin" size={15} /><span>These coordinates are only for the property location. They are not used to find companies.</span></div>
          <label>Description<textarea placeholder="Tell tenants what makes this property a good fit..." value={f.description} onChange={(e) => set('description', e.target.value)} /></label>

          <div className="manual-tag-panel">
            <div className="manual-tag-panel-heading">
              <div><span className="eyebrow">MANUAL TAGGING</span><h3>Add workplaces</h3><p>Add as many companies as you want. No company search and no company coordinates.</p></div>
              <span className="selected-count">{selectedCompanyNames.length} tagged</span>
            </div>

            {selectedCompanyNames.length > 0 && <div className="tag-chips new-property-tags">{selectedCompanyNames.map((company) => <span className="tag-chip" key={company.id}><Icon name="building" size={12} /> {company.name}<button type="button" onClick={() => removeSelectedCompany(company.id)} aria-label={`Remove ${company.name}`}><Icon name="x" size={12} /></button></span>)}</div>}

            <ManualCompanyForm onAdded={addCompanyToNewProperty} />
            <div className="manual-flow-hint"><Icon name="check" size={13} /><span>Need another workplace? Add it above again. Every company you add is tagged to this property.</span></div>
          </div>

          <button className="submit-property" disabled={saving}>{saving ? 'Saving property…' : <>{selectedCompanies.length ? `Add property · ${selectedCompanies.length} tagged` : 'Add property'} <span>→</span></>}</button>
          {message && <div className="msg success-msg">{message}</div>}
          {error && <div className="error-msg">{error}</div>}
        </form>

        <section className="listings-section">
          <div className="section-heading"><div><span className="eyebrow">YOUR LISTINGS</span><h2>Properties & workplace tags</h2></div><span className="listing-count">{props.length} total</span></div>
          {props.length ? props.map((property) => <article className="owneritem enhanced-item" key={property.id}>
            <div className="property-summary"><div className="property-type-badge">{property.propertyType}</div><div><div className="property-name-row"><h3>{property.name}</h3><span className="available-badge">Available</span></div><span className="property-meta">₹{Number(property.rent).toLocaleString()} <i /> {property.address || `${property.latitude}, ${property.longitude}`}</span>{property.description && <p>{property.description}</p>}</div></div>
            <TaggedCompanies property={property} onChange={refreshProperties} />
          </article>) : <div className="empty enhanced-empty"><div className="empty-icon"><Icon name="building" size={28} /></div><h3>No properties yet</h3><p>Your new property will appear here after you add it.</p></div>}
        </section>
      </div>
    </div>
  );
}
