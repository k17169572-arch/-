"use client";

import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Search, Crown, Shield, Link as LinkIcon, User, Lock, Volume2, VolumeX, ChevronRight } from 'lucide-react';
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
  const [showLanding, setShowLanding] = useState(true);
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

  const enterSite = () => {
    setShowLanding(false);
    document.body.style.overflow = 'auto'; // ปลดล็อคการเลื่อนหน้าจอ
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error("Autoplay failed:", err));
    }
  };

  // ล็อคการเลื่อนหน้าจอตอนอยู่หน้า Landing
  useEffect(() => {
    if (showLanding) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showLanding]);

  // Default active category
  useEffect(() => {
    if (!activeCategoryId && data?.categories?.length > 0) {
      setActiveCategoryId(data.categories[0].id);
    }
  }, [data, activeCategoryId]);

  if (error) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Failed to load directory.</div>;

  const categories = data?.categories || [];
  const setting = data?.setting || {};
  
  const defaultMusicUrl = "https://files.catbox.moe/9vzv2r.mp3";
  const musicUrl = setting.musicUrl || defaultMusicUrl;

  const activeCategory = categories.find((c: any) => c.id === activeCategoryId);
  const positions = activeCategory?.positions || [];

  const filteredPositions = positions.map((pos: any) => ({
    ...pos,
    members: pos.members.filter((m: any) => 
      m.name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter((pos: any) => pos.members.length > 0);

  return (
    <div className={styles.pageWrapper}>
      {/* Background for Directory */}
      <div 
        className={styles.background} 
        style={{ backgroundImage: `url(${setting.backgroundUrl || ''})` }}
      />
      <div className={styles.overlay} />

      {/* Landing Page Layer */}
      {showLanding && (
        <div className={styles.landingLayer}>
          <div 
            className={styles.landingBg} 
            style={{ backgroundImage: `url(${setting.landingBackgroundUrl || setting.backgroundUrl || ''})` }}
          />
          <div className={styles.landingOverlay} />
          
          <div className={styles.landingContent}>
            <div className={styles.landingTitleContainer}>
              <div className={styles.landingSubtitle}>{setting.landingSubtitle || 'Member of The Layout Lady'}</div>
              <h1 className={styles.landingTitle}>{setting.landingTitle || 'Layout Lady'}</h1>
              <div className={styles.titleUnderline} />
            </div>
            
            <button className={styles.enterBtn} onClick={enterSite}>
              <span>Enter Site</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Background Music */}
      {musicUrl && (
        <>
          <audio ref={audioRef} src={musicUrl} loop />
          <div className={styles.musicContainer} style={{ opacity: showLanding ? 0 : 1, pointerEvents: showLanding ? 'none' : 'auto' }}>
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

      {/* Admin Lock */}
      <div 
        className={styles.adminLock} 
        onClick={() => router.push('/admin/login')}
        title="Admin Login"
      >
        <Lock size={20} />
      </div>

      {/* Main Directory UI */}
      <div className={`${styles.mainContent} ${!showLanding ? styles.showContent : ''}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Layout Lady</h1>
          <div className={styles.subtitle}>Member of The Layout Lady</div>
        </div>

        <div className={`container`}>
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
              
              let accentColor = 'var(--accent-red)'; 
              if (isGold) accentColor = 'var(--accent-gold)';
              else if (isBlue) accentColor = '#4488ff';
              else if (posName.includes('leader')) accentColor = '#ff4444'; 
              else if (posName.includes('staff')) accentColor = '#44ff44';  

              const Icon = position.iconType.includes('crown') ? Crown : 
                           (position.iconType.includes('shield') ? Shield : User);

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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
