import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Spline from '@splinetool/react-spline'
import { MapPin, Shield, PhoneCall, Send, User2, Map, AlertTriangle, Languages, LogOut, Trash2 } from 'lucide-react'
import { Player } from 'lottie-react'
import successAnim from './assets/success.json'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

// Utility UI
const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`rounded-xl px-4 py-3 font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg shadow-pink-200/60 hover:shadow-pink-400/60 active:scale-[0.99] transition-all ${className}`}
  >
    {children}
  </button>
)

const OutlineButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`rounded-xl px-4 py-3 font-semibold text-pink-600 bg-white/70 border border-pink-200 hover:bg-white shadow-sm hover:shadow-md transition-all ${className}`}
  >
    {children}
  </button>
)

// Auth storage helpers
const saveSession = (data) => localStorage.setItem('session', JSON.stringify(data))
const getSession = () => {
  const s = localStorage.getItem('session')
  return s ? JSON.parse(s) : null
}
const clearSession = () => localStorage.removeItem('session')

// Pages
function Login() {
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Account not found')
      const data = await res.json()
      saveSession(data)
      nav('/home')
    } catch (err) {
      setError('Account not found. Please create an account.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      <div className="relative hidden md:block">
        <Spline scene="https://prod.spline.design/4HIlOdlXYYkZW66z/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-pink-100 text-pink-600"><Shield /></div>
            <h1 className="text-2xl font-bold text-gray-800">SheSecure</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Login</h2>
          <p className="text-gray-500 mb-6">Welcome back! Stay safe and confident.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            {['name','phone','email'].map((k)=> (
              <div key={k}>
                <label className="block text-sm text-gray-600 mb-1 capitalize">{k}</label>
                <input required type={k==='email'?'email':'text'} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                  className="w-full rounded-xl border border-pink-200/60 focus:border-pink-400 outline-none px-4 py-3 bg-white/70" />
              </div>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <PrimaryButton type="submit" className="w-full flex items-center justify-center gap-2">{loading? 'Signing in...' : 'Login'}</PrimaryButton>
          </form>
          <div className="mt-6 text-center">
            <Link to="/signup" className="text-pink-600 hover:underline">Create Account</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Signup() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', state: '', photo_url: '', language: 'en',
    emergency_contacts: ['', '', '', '']
  })
  const [loading, setLoading] = useState(false)
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, emergency_contacts: form.emergency_contacts.filter(Boolean) }
      const res = await fetch(`${API_BASE}/api/signup`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      saveSession(data)
      nav('/home')
    } catch (e) {
      alert(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex items-center justify-center p-6">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-2xl bg-white/80 backdrop-blur rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {k:'photo_url', label:'Profile Photo URL'},
            {k:'name', label:'Full Name'},
            {k:'phone', label:'Phone Number'},
            {k:'email', label:'Email', type:'email'},
            {k:'address', label:'Address'},
            {k:'state', label:'State'},
          ].map(({k,label,type})=> (
            <div key={k} className="col-span-1">
              <label className="block text-sm text-gray-600 mb-1">{label}</label>
              <input required={k!=='photo_url' && k!=='address' && k!=='state'} type={type||'text'} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                className="w-full rounded-xl border border-pink-200/60 focus:border-pink-400 outline-none px-4 py-3 bg-white/70" />
            </div>
          ))}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({length:4}).map((_,i)=> (
              <div key={i}>
                <label className="block text-sm text-gray-600 mb-1">Emergency Contact {i+1}</label>
                <input type="tel" value={form.emergency_contacts[i]} onChange={e=>{
                  const arr=[...form.emergency_contacts]; arr[i]=e.target.value; setForm({...form, emergency_contacts: arr})
                }} className="w-full rounded-xl border border-pink-200/60 focus:border-pink-400 outline-none px-4 py-3 bg-white/70" />
              </div>
            ))}
          </div>
          <div className="md:col-span-2 flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600"><Languages size={18}/> Language
              <select value={form.language} onChange={e=>setForm({...form, language:e.target.value})} className="ml-2 rounded-lg border border-pink-200 bg-white/70 px-2 py-1">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
            <PrimaryButton type="submit">{loading? 'Creating...' : 'Create Account'}</PrimaryButton>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Map View using Mapbox GL (basic)
import mapboxgl from 'mapbox-gl'
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

function Home() {
  const nav = useNavigate()
  const session = getSession()
  useEffect(()=>{ if(!session) nav('/') }, [])

  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState('')
  const [route, setRoute] = useState(null)
  const [summary, setSummary] = useState(null)
  const [sending, setSending] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const holdTimer = useRef(null)
  const cancelTimer = useRef(null)

  // init map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [77.5946, 12.9716],
      zoom: 12
    })
    mapRef.current = map

    // geolocate
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords
        setOrigin([latitude, longitude])
        map.flyTo({ center: [longitude, latitude], zoom: 14 })
        new mapboxgl.Marker({ color: '#ec4899' }).setLngLat([longitude, latitude]).addTo(map)
      })
    }
  }, [])

  const findRoute = async () => {
    if (!origin || !destination) return
    // geocode destination using Mapbox
    const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${mapboxgl.accessToken}`)
    const gc = await resp.json()
    if (!gc.features?.length) { alert('Destination not found'); return }
    const [lng, lat] = gc.features[0].center

    // ask backend for safety
    const res = await fetch(`${API_BASE}/api/route-safety`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ origin, destination: [lat, lng] }) })
    const data = await res.json()
    setRoute({ path: data.path, safety: data.safety, score: data.score })
    setSummary({ safety: data.safety, reasons: data.reasons })

    // draw simple line
    const map = mapRef.current
    if (map.getSource('route')) {
      map.removeLayer('route-line'); map.removeSource('route')
    }
    const color = data.safety==='safe'? '#16a34a' : data.safety==='moderate'? '#f59e0b' : '#dc2626'
    map.addSource('route', { type:'geojson', data: { type:'Feature', geometry:{ type:'LineString', coordinates: data.path.map(p=>[p.lng, p.lat]) } } })
    map.addLayer({ id:'route-line', type:'line', source:'route', paint:{ 'line-color': color, 'line-width': 6, 'line-opacity': 0.8 } })

    map.fitBounds([
      [Math.min(origin[1], lng), Math.min(origin[0], lat)],
      [Math.max(origin[1], lng), Math.max(origin[0], lat)]
    ], { padding: 60, duration: 1200 })
  }

  const startHold = (which) => {
    holdTimer.current = setTimeout(()=> { which==='sos'? triggerSOS() : triggerPolice() }, 3000)
  }
  const endHold = () => { clearTimeout(holdTimer.current) }

  const triggerPolice = () => {
    window.location.href = 'tel:112'
  }

  const triggerSOS = async () => {
    if (!origin) { alert('Location not ready'); return }
    setSending(true)
    // cancel window
    cancelTimer.current = setTimeout(async ()=>{
      const [lat, lng] = origin
      const res = await fetch(`${API_BASE}/api/sos`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: session.user_id, name: 'User', phone:'', lat, lng }) })
      await res.json()
      setConfirm(true); setSending(false)
      setTimeout(()=> setConfirm(false), 3000)
    }, 5000)
  }

  const cancelSOS = () => { clearTimeout(cancelTimer.current); setSending(false) }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-white">
      <header className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-100 text-pink-600"><Shield size={18}/></div>
          <h1 className="font-bold text-lg">Welcome to SheSecure</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/profile"><OutlineButton className="flex items-center gap-2"><User2 size={16}/> Profile</OutlineButton></Link>
          <OutlineButton onClick={()=>{ clearSession(); location.href='/' }} className="flex items-center gap-2 text-red-600 border-red-200"><LogOut size={16}/> Logout</OutlineButton>
        </div>
      </header>

      <div className="px-4 pb-32">
        <div className="rounded-3xl overflow-hidden shadow-xl border border-pink-100 h-[60vh]">
          <div ref={mapContainer} className="w-full h-full" />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input placeholder="Enter destination" value={destination} onChange={e=>setDestination(e.target.value)} className="rounded-xl border border-pink-200 px-4 py-3 bg-white" />
          <PrimaryButton onClick={findRoute} className="md:col-span-1 flex items-center justify-center gap-2"><Map size={18}/> Find Safe Route</PrimaryButton>
          <Link to="/report" className="md:col-span-1"><OutlineButton className="w-full flex items-center justify-center gap-2"><AlertTriangle size={18}/> Report Unsafe Area</OutlineButton></Link>
        </div>

        {summary && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="mt-4 p-4 rounded-2xl bg-white shadow-md border border-pink-100">
            <p className="font-semibold">Route Safety: <span className={summary.safety==='safe'?'text-green-600': summary.safety==='moderate'?'text-yellow-600':'text-red-600'}>{summary.safety.toUpperCase()}</span></p>
            <p className="text-sm text-gray-600 mt-1">Reasons: {summary.reasons?.join(', ') || 'Computed from reports and time of day'}</p>
          </motion.div>
        )}
      </div>

      {/* Floating buttons */}
      <div className="fixed right-4 bottom-4 flex flex-col items-end gap-3">
        {sending && (
          <div className="bg-white/90 backdrop-blur rounded-xl px-4 py-3 shadow-lg border border-pink-100">
            <p className="text-sm">Sending SOS in 5s...</p>
            <button onClick={cancelSOS} className="text-pink-600 text-sm underline">Cancel</button>
          </div>
        )}
        <button onMouseDown={()=>startHold('police')} onMouseUp={endHold} onTouchStart={()=>startHold('police')} onTouchEnd={endHold}
          className="rounded-full w-14 h-14 flex items-center justify-center text-white bg-blue-600 shadow-xl shadow-blue-300/50 active:scale-95 transition">
          <PhoneCall />
        </button>
        <button onMouseDown={()=>startHold('sos')} onMouseUp={endHold} onTouchStart={()=>startHold('sos')} onTouchEnd={endHold}
          className="rounded-full w-20 h-20 flex items-center justify-center text-white bg-red-600 shadow-2xl shadow-red-300/60 active:scale-95 transition relative">
          <span className="absolute inset-0 rounded-full bg-red-400/40 animate-ping" />
          <span className="relative"><Send /></span>
        </button>
      </div>

      <AnimatePresence>
        {confirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 grid place-items-center bg-black/30">
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-32 mx-auto"><Player autoplay keepLastFrame src={successAnim} /></div>
              <p className="mt-2 font-semibold text-green-600">SOS sent successfully</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ReportPage(){
  const nav = useNavigate()
  const [desc, setDesc] = useState('')
  const [photo_url, setPhoto] = useState('')
  const [loc, setLoc] = useState(null)

  useEffect(()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(p=> setLoc([p.coords.latitude, p.coords.longitude]))
    }
  },[])

  const submit = async ()=>{
    if(!loc){ alert('Location not available'); return }
    const [lat,lng] = loc
    const res = await fetch(`${API_BASE}/api/report`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ lat, lng, description: desc, photo_url }) })
    if(res.ok){ alert('Report submitted'); nav('/home') } else { alert('Failed') }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6">
      <div className="max-w-xl mx-auto bg-white/80 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Report Unsafe Area</h2>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe the issue" className="w-full h-32 rounded-xl border border-pink-200 p-3" />
        <input value={photo_url} onChange={e=>setPhoto(e.target.value)} placeholder="Photo URL (optional)" className="w-full rounded-xl border border-pink-200 p-3 mt-3" />
        <PrimaryButton onClick={submit} className="mt-4">Submit Report</PrimaryButton>
      </div>
    </div>
  )
}

function Profile(){
  const session = getSession()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async ()=>{
    if(!session) return nav('/')
    try{
      const res = await fetch(`${API_BASE}/api/profile/${session.user_id}`)
      const d = await res.json(); setData(d)
    }catch(e){ console.error(e) }
  }
  useEffect(()=>{ load() },[])

  const save = async ()=>{
    setSaving(true)
    await fetch(`${API_BASE}/api/profile/${session.user_id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: data.name, address: data.address, state: data.state, photo_url: data.photo_url, emergency_contacts: data.emergency_contacts }) })
    setSaving(false)
    alert('Saved')
  }
  const del = async ()=>{
    if(!confirm('Delete your account?')) return
    await fetch(`${API_BASE}/api/profile/${session.user_id}`, { method:'DELETE' })
    clearSession(); nav('/')
  }

  if(!data) return <div className="min-h-screen grid place-items-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6">
      <div className="max-w-2xl mx-auto bg-white/80 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img src={data.photo_url || 'https://i.pravatar.cc/120'} className="w-16 h-16 rounded-2xl object-cover"/>
          <div>
            <h3 className="text-xl font-bold">{data.name}</h3>
            <p className="text-sm text-gray-500">{data.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {['name','address','state','photo_url'].map(k=> (
            <div key={k}>
              <label className="block text-sm text-gray-600 mb-1 capitalize">{k.replace('_',' ')}</label>
              <input value={data[k]||''} onChange={e=>setData({...data,[k]:e.target.value})} className="w-full rounded-xl border border-pink-200 p-3 bg-white"/>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({length:4}).map((_,i)=> (
            <input key={i} placeholder={`Emergency Contact ${i+1}`} value={data.emergency_contacts?.[i]||''} onChange={e=>{
              const arr=[...(data.emergency_contacts||['','','',''])]; arr[i]=e.target.value; setData({...data, emergency_contacts: arr})
            }} className="rounded-xl border border-pink-200 p-3" />
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <PrimaryButton onClick={save}>{saving? 'Saving...':'Save Changes'}</PrimaryButton>
          <button onClick={del} className="flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50"><Trash2 size={16}/> Delete My Account</button>
        </div>
      </div>
    </div>
  )
}

function App(){
  return (
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/home" element={<Home/>} />
      <Route path="/report" element={<ReportPage/>} />
      <Route path="/profile" element={<Profile/>} />
    </Routes>
  )
}

export default App
