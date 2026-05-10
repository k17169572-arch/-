"use client";

import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Search, Crown, Shield, Link as LinkIcon, User, Lock, Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.03998C6.5 2.03998 2 6.52998 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.59998H15.19C13.95 8.59998 13.56 9.36998 13.56 10.18V12.06H16.35L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.52998 17.5 2.03998 12 2.03998Z" />
  </svg>
);
import styles from './page.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR('/api/public/data', fetcher, {
    refreshInterval: 2000, 
  });
  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Playback failed:", err);
        });
      }
    }
  };

  // Autoplay attempt on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying && setting?.musicUrl) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
          })
          .catch(() => {
            // Still blocked or failed, keep listener
          });
      }
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [setting?.musicUrl, isPlaying]);

  // Update audio source when setting changes
  useEffect(() => {
    if (audioRef.current && setting?.musicUrl) {
      audioRef.current.load();
      // Don't auto-set isPlaying to true here, wait for interaction or toggle
    }
  }, [setting?.musicUrl]);

  if (error) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Failed to load directory.</div>;

  const categories = data?.categories || [];
  const setting = data?.setting || {};

  // Default active category
  if (!activeCategoryId && categories.length > 0) {
    setActiveCategoryId(categories[0].id);
  }

  const activeCategory = categories.find((c: any) => c.id === activeCategoryId);
  const positions = activeCategory?.positions || [];

  // Filter members by search query
  const filteredPositions = positions.map((pos: any) => ({
    ...pos,
    members: pos.members.filter((m: any) => 
      m.name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter((pos: any) => pos.members.length > 0);

  return (
    <div className={styles.pageWrapper}>
      {setting.backgroundUrl && (
        <div 
          className={styles.background} 
          style={{ backgroundImage: `url(${setting.backgroundUrl})` }}
        />
      )}
      <div className={styles.overlay} />

      {setting.musicUrl && (
        <>
          <audio ref={audioRef} src={setting.musicUrl} loop />
          <div className={styles.musicContainer}>
            {isPlaying && (
              <div className={styles.nowPlaying}>
                <div className={styles.bar} />
                <div className={styles.bar} />
                <div className={styles.bar} />
              </div>
            )}
            <button className={styles.musicBtn} onClick={toggleMusic} title="Toggle Music">
              {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
          </div>
        </>
      )}

      <div 
        className={styles.adminLock} 
        onClick={() => router.push('/admin/login')}
        title="Admin Login"
      >
        <Lock size={20} />
      </div>

      <div className={`${styles.header} animate-fade-in`}>
        <h1 className={styles.title}>Layout Lady</h1>
        <div className={styles.subtitle}>Member of The Layout Lady</div>
      </div>

      <div className={`container animate-fade-in`}>
        {categories.length > 0 && (
          <div className={styles.categoryTabs}>
            {categories.map((cat: any) => (
              <button 
                key={cat.id}
                className={`${styles.categoryTab} ${activeCategoryId === cat.id ? styles.categoryTabActive : ''}`}
                onClick={() => setActiveCategoryId(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="ค้นหารายชื่อสมาชิก..." 
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#888' }}>กำลังโหลดรายชื่อ...</div>
        ) : (
          filteredPositions.map((position: any) => {
            const posName = position.name.toLowerCase();
            const isGold = position.iconType === 'crown' || posName === 'owner';
            const isBlue = position.iconType.includes('blue') || posName.includes('member');
            
            // Custom Colors requested by user
            let accentColor = 'var(--accent-red)'; // Default
            if (isGold) accentColor = 'var(--accent-gold)';
            else if (isBlue) accentColor = '#4488ff';
            else if (posName.includes('leader')) accentColor = '#ff4444'; // Red for Leader
            else if (posName.includes('staff')) accentColor = '#44ff44';  // Green for Staff

            const Icon = position.iconType.includes('crown') ? Crown : 
                         (position.iconType.includes('shield') ? Shield : User);

            // Determine line and role class based on color
            const lineClass = isGold ? styles.goldLine : 
                             (posName.includes('staff') ? styles.greenLine : 
                             (posName.includes('leader') ? styles.redLine : 
                             (isBlue ? styles.blueLine : styles.redLine)));
            
            const roleClass = isGold ? styles.goldRole : 
                             (posName.includes('staff') ? styles.greenRole : 
                             (posName.includes('leader') ? styles.redRole : 
                             (isBlue ? styles.blueRole : styles.redRole)));

            return (
              <div key={position.id} className={styles.positionSection}>
                <div className={styles.positionHeader}>
                  <Icon color={accentColor} size={24} style={{ filter: `drop-shadow(0 0 8px ${accentColor})` }} />
                  <h2 className={styles.positionTitle} style={{ color: accentColor, textShadow: `0 0 10px ${accentColor}` }}>
                    {position.name}
                  </h2>
                  <div className={`${styles.positionLine} ${lineClass}`} />
                </div>

                <div className={styles.grid}>
                  {position.members.map((member: any) => (
                    <div key={member.id} className={`${styles.card} glass-panel`}>
                      <div className={styles.cardHeader}>
                        {member.image ? (
                          <img src={member.image} alt={member.name} className={styles.avatar} />
                        ) : (
                          <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User color="#888" />
                          </div>
                        )}
                        <div className={styles.memberInfo}>
                          <span className={`${styles.memberRole} ${roleClass}`}>
                            + {position.name}
                          </span>
                          <span className={styles.memberName}>{member.name}</span>
                        </div>
                      </div>
                      
                      <div className={styles.cardActions}>
                        {member.facebookLink && (
                          <a href={member.facebookLink} target="_blank" rel="noopener noreferrer" className={styles.btn}>
                            <FacebookIcon /> Facebook
                          </a>
                        )}
                        {member.pageLink && (
                          <a href={member.pageLink} target="_blank" rel="noopener noreferrer" className={styles.btn}>
                            <LinkIcon size={16} /> Page
                          </a>
                        )}
                        {(!member.facebookLink && !member.pageLink) && (
                          <div style={{ height: '38px' }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
        
        {!isLoading && filteredPositions.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
            ไม่พบรายชื่อในหมวดหมู่นี้
          </div>
        )}
      </div>
    </div>
  );
}
