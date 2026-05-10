"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
});

export default function AdminDashboard() {
  const router = useRouter();
  const { data: categories, mutate: mutateCategories, error: catError } = useSWR('/api/admin/categories', fetcher);
  const { data: positions, mutate: mutatePositions } = useSWR('/api/admin/positions', fetcher);
  const { data: members, mutate: mutateMembers } = useSWR('/api/admin/members', fetcher);
  const { data: setting, mutate: mutateSetting } = useSWR('/api/admin/settings', fetcher);

  const [activeTab, setActiveTab] = useState('categories');

  // If unauthorized, redirect to login
  if (catError) {
    router.push('/admin/login');
    return null;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (!categories || !positions || !members || !setting) return <div style={{ color: 'white', padding: '50px' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 20px', color: 'white' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ color: '#d4af37', margin: 0 }}>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => router.push('/')} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← หน้าหลัก</button>
            <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('categories')} style={tabStyle(activeTab === 'categories')}>หมวดหมู่ (Categories)</button>
          <button onClick={() => setActiveTab('positions')} style={tabStyle(activeTab === 'positions')}>ตำแหน่ง (Positions)</button>
          <button onClick={() => setActiveTab('members')} style={tabStyle(activeTab === 'members')}>รายชื่อ (Members)</button>
          <button onClick={() => setActiveTab('settings')} style={tabStyle(activeTab === 'settings')}>ตั้งค่า (Settings)</button>
        </div>

        <div className="glass-panel" style={{ padding: '30px' }}>
          {activeTab === 'categories' && <CategoriesManager categories={categories} mutate={mutateCategories} />}
          {activeTab === 'positions' && <PositionsManager positions={positions} categories={categories} mutate={mutatePositions} />}
          {activeTab === 'members' && <MembersManager members={members} positions={positions} categories={categories} mutate={mutateMembers} />}
          {activeTab === 'settings' && <SettingsManager setting={setting} mutate={mutateSetting} />}
        </div>
      </div>
    </div>
  );
}

function tabStyle(active: boolean) {
  return {
    padding: '10px 20px',
    background: active ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
    color: active ? '#d4af37' : 'white',
    border: `1px solid ${active ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '8px',
    cursor: 'pointer',
  };
}

function CategoriesManager({ categories, mutate }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [order, setOrder] = useState(0);

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setName(c.name);
    setOrder(c.order);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setOrder(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    await fetch('/api/admin/categories', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, name, order: Number(order) }),
    });
    handleCancel();
    mutate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบ? ตำแหน่งและสมาชิกในหมวดหมู่นี้จะได้รับผลกระทบ')) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    mutate();
  };

  return (
    <div>
      <h3 style={{ color: '#d4af37', marginBottom: '20px' }}>จัดการหมวดหมู่</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', margin: '20px 0', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อหมวดหมู่ เช่น Head" style={inputStyle} />
        <input type="number" value={order} onChange={e => setOrder(e.target.value as any)} placeholder="ลำดับ" style={{...inputStyle, flex: 0.3}} />
        <button type="submit" style={btnStyle}>{editingId ? 'บันทึก' : 'เพิ่มหมวดหมู่'}</button>
        {editingId && <button type="button" onClick={handleCancel} style={{ ...btnStyle, background: '#666' }}>ยกเลิก</button>}
      </form>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ padding: '12px' }}>ลำดับ</th>
              <th style={{ padding: '12px' }}>ชื่อหมวดหมู่</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #222', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '12px' }}>{c.order}</td>
                <td style={{ padding: '12px' }}>{c.name}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(c)} style={{ ...btnStyle, background: '#4444ff', marginRight: '5px', padding: '5px 10px', fontSize: '0.8rem' }}>แก้ไข</button>
                  <button onClick={() => handleDelete(c.id)} style={{ ...btnStyle, background: '#ff4444', padding: '5px 10px', fontSize: '0.8rem' }}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PositionsManager({ positions, categories, mutate }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [iconType, setIconType] = useState('crown');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [order, setOrder] = useState(0);

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setIconType(p.iconType);
    setCategoryId(p.categoryId);
    setOrder(p.order);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setIconType('crown');
    setOrder(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    await fetch('/api/admin/positions', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, name, iconType, categoryId, order: Number(order) }),
    });
    handleCancel();
    mutate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบ? สมาชิกในตำแหน่งนี้จะได้รับผลกระทบ')) return;
    await fetch(`/api/admin/positions?id=${id}`, { method: 'DELETE' });
    mutate();
  };

  // Group positions by category
  const grouped = categories.map((cat: any) => ({
    ...cat,
    positions: positions.filter((p: any) => p.categoryId === cat.id)
  })).filter((cat: any) => cat.positions.length > 0);

  return (
    <div>
      <h3 style={{ color: '#d4af37', marginBottom: '20px' }}>จัดการตำแหน่ง/ยศ</h3>
      {categories.length === 0 ? <p style={{color:'red'}}>กรุณาสร้างหมวดหมู่ก่อน!</p> : (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '20px 0', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อตำแหน่ง เช่น OWNER" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={iconType} onChange={e => setIconType(e.target.value)} style={inputStyle}>
            <option value="crown">Crown (Gold)</option>
            <option value="shield">Shield (Red)</option>
            <option value="shield-blue">Shield (Blue)</option>
            <option value="user">User (Red)</option>
            <option value="user-blue">User (Blue)</option>
          </select>
          <input type="number" value={order} onChange={e => setOrder(e.target.value as any)} placeholder="ลำดับ" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={btnStyle}>{editingId ? 'บันทึกการแก้ไข' : 'เพิ่มตำแหน่ง'}</button>
          {editingId && <button type="button" onClick={handleCancel} style={{ ...btnStyle, background: '#666' }}>ยกเลิก</button>}
        </div>
      </form>
      )}
      
      {grouped.map((group: any) => (
        <div key={group.id} style={{ marginBottom: '30px' }}>
          <h4 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '5px' }}>{group.name}</h4>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <tbody>
              {group.positions.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px', width: '50px' }}>{p.order}</td>
                  <td style={{ padding: '10px' }}>{p.name} <span style={{fontSize:'0.8rem', color:'#666'}}>({p.iconType})</span></td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(p)} style={{ ...btnStyle, background: '#4444ff', marginRight: '5px', padding: '5px 10px', fontSize: '0.8rem' }}>แก้ไข</button>
                    <button onClick={() => handleDelete(p.id)} style={{ ...btnStyle, background: '#ff4444', padding: '5px 10px', fontSize: '0.8rem' }}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function MembersManager({ members, positions, categories, mutate }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [positionId, setPositionId] = useState('');
  const [image, setImage] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [pageLink, setPageLink] = useState('');

  const handleEditClick = (m: any) => {
    setEditingId(m.id);
    setName(m.name);
    setPositionId(m.positionId);
    setImage(m.image || '');
    setFacebookLink(m.facebookLink || '');
    setPageLink(m.pageLink || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName(''); setPositionId(positions[0]?.id || '');
    setImage(''); setFacebookLink(''); setPageLink('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch('/api/admin/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name, positionId, image, facebookLink, pageLink }),
      });
    } else {
      await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, positionId, image, facebookLink, pageLink }),
      });
    }
    handleCancelEdit();
    mutate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบ?')) return;
    await fetch(`/api/admin/members?id=${id}`, { method: 'DELETE' });
    mutate();
  };

  // Group members by category/position
  const groupedMembers = categories.map((cat: any) => {
    const catPositions = positions.filter((p: any) => p.categoryId === cat.id);
    const catMembers = members.filter((m: any) => catPositions.some((p: any) => p.id === m.positionId));
    return { ...cat, members: catMembers };
  }).filter((cat: any) => cat.members.length > 0);

  return (
    <div>
      <h3 style={{ color: '#d4af37', marginBottom: '20px' }}>จัดการรายชื่อสมาชิก</h3>
      {positions.length === 0 ? <p style={{color:'red'}}>กรุณาสร้างตำแหน่งก่อน!</p> : (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '20px 0', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
        <h4 style={{margin:0, color:'#d4af37'}}>{editingId ? 'แก้ไขสมาชิก' : 'เพิ่มสมาชิกใหม่'}</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อสมาชิก" style={inputStyle} />
          <select required value={positionId} onChange={e => setPositionId(e.target.value)} style={inputStyle}>
            <option value="" disabled>เลือกตำแหน่ง...</option>
            {categories.map((cat: any) => {
              const catPos = positions.filter((p: any) => p.categoryId === cat.id);
              return catPos.length > 0 && (
                <optgroup key={cat.id} label={cat.name}>
                  {catPos.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
        <input value={image} onChange={e => setImage(e.target.value)} placeholder="URL รูปโปรไฟล์ (ไม่บังคับ)" style={inputStyle} />
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input value={facebookLink} onChange={e => setFacebookLink(e.target.value)} placeholder="ลิงก์ Facebook (ไม่บังคับ)" style={inputStyle} />
          <input value={pageLink} onChange={e => setPageLink(e.target.value)} placeholder="ลิงก์ Page (ไม่บังคับ)" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={btnStyle}>{editingId ? 'บันทึกการแก้ไข' : 'เพิ่มสมาชิก'}</button>
          {editingId && <button type="button" onClick={handleCancelEdit} style={{ ...btnStyle, background: '#666' }}>ยกเลิก</button>}
        </div>
      </form>
      )}

      {groupedMembers.map((cat: any) => (
        <div key={cat.id} style={{ marginBottom: '30px' }}>
          <h4 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '5px' }}>{cat.name}</h4>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <tbody>
              {cat.members.map((m: any) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px', width: '50px' }}>
                    {m.image ? <img src={m.image} alt="" style={{width:'35px', height:'35px', borderRadius:'50%', objectFit:'cover'}} /> : <div style={{width:'35px', height:'35px', borderRadius:'50%', background:'#333'}} />}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{fontWeight:'bold'}}>{m.name}</div>
                    <div style={{fontSize:'0.8rem', color:'#888'}}>{m.position?.name}</div>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <button onClick={() => handleEditClick(m)} style={{ ...btnStyle, background: '#4444ff', marginRight: '5px', padding: '5px 10px', fontSize: '0.8rem' }}>แก้ไข</button>
                    <button onClick={() => handleDelete(m.id)} style={{ ...btnStyle, background: '#ff4444', padding: '5px 10px', fontSize: '0.8rem' }}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function SettingsManager({ setting, mutate }: any) {
  const [backgroundUrl, setBackgroundUrl] = useState(setting.backgroundUrl || '');
  const [musicUrl, setMusicUrl] = useState(setting.musicUrl || '');
  const [password, setPassword] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backgroundUrl, musicUrl, password: password || undefined }),
    });
    setPassword('');
    alert('บันทึกสำเร็จ');
    mutate();
  };

  return (
    <div>
      <h3 style={{ color: '#d4af37', marginBottom: '20px' }}>ตั้งค่าระบบ</h3>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>URL รูปภาพพื้นหลัง (Background Image)</label>
          <input 
            value={backgroundUrl} 
            onChange={e => setBackgroundUrl(e.target.value)} 
            placeholder="https://..." 
            style={{ ...inputStyle, width: '100%' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>URL เพลงพื้นหลัง (Background Music .mp3)</label>
          <input 
            value={musicUrl} 
            onChange={e => setMusicUrl(e.target.value)} 
            placeholder="https://.../music.mp3" 
            style={{ ...inputStyle, width: '100%' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>เปลี่ยนรหัสผ่านแอดมิน (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)</label>
          <input 
            type="password"
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="รหัสผ่านใหม่" 
            style={{ ...inputStyle, width: '100%' }} 
          />
        </div>
        <button type="submit" style={{ ...btnStyle, width: 'fit-content', padding: '12px 25px' }}>บันทึกการตั้งค่า</button>
      </form>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: 'white', flex: 1, outline: 'none' };
const btnStyle = { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d4af37', color: 'black', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.1s, opacity 0.2s' };

