
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useComplaints } from '../contexts/ComplaintContext';

export default function Apply() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addComplaint } = useComplaints();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const geocoderRef = useRef(null);

  // 카카오맵 초기화
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let script = null;

    const initializeMap = () => {
      if (cancelled || !mapContainerRef.current) return;

      window.kakao.maps.load(() => {
        if (cancelled || !mapContainerRef.current) return;

        const kakao = window.kakao;

        // 기본 위치 (현재 위치 확인 실패 시 서울)
        const defaultPosition = new kakao.maps.LatLng(
          37.5665,
          126.9780
        );

        const map = new kakao.maps.Map(
          mapContainerRef.current,
          {
            center: defaultPosition,
            level: 4
          }
        );

        mapRef.current = map;

        geocoderRef.current =
          new kakao.maps.services.Geocoder();

        // 민원 발생 위치 마커
        const marker = new kakao.maps.Marker({
          position: defaultPosition,
          draggable: true
        });

        markerRef.current = marker;

        // 마커 위치 변경 시 주소 업데이트
        const updateComplaintLocation = (latlng) => {
          const lat = Number(latlng.getLat().toFixed(7));
          const lng = Number(latlng.getLng().toFixed(7));

          setCoords({ lat, lng });

          geocoderRef.current.coord2Address(
            lng,
            lat,
            (result, status) => {
              if (
                status === kakao.maps.services.Status.OK &&
                result.length > 0
              ) {
                const address =
                  result[0].road_address?.address_name ||
                  result[0].address?.address_name;

                if (address) setLocation(address);
              }
            }
          );
        };

        // 지도 클릭으로 핀 지정
        kakao.maps.event.addListener(
          map,
          'click',
          (mouseEvent) => {
            const latlng = mouseEvent.latLng;

            marker.setPosition(latlng);
            marker.setMap(map);

            updateComplaintLocation(latlng);
          }
        );

        // 핀 드래그 종료 시 위치 변경
        kakao.maps.event.addListener(
          marker,
          'dragend',
          () => {
            updateComplaintLocation(marker.getPosition());
          }
        );

        // 현재 위치 가져오기
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (cancelled) return;

              const currentPosition = new kakao.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
              );

              // 지도 중심을 현재 위치로 이동
              map.setCenter(currentPosition);

            },
            (error) => {
              console.warn(
                '현재 위치를 가져오지 못했습니다.',
                error
              );
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        }
      });
    };

    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY;

    if (!appKey) {
      console.error('카카오맵 JavaScript 키가 없습니다.');
      return;
    }

    if (window.kakao?.maps) {
      initializeMap();
    } else {
      script = document.createElement('script');

      script.src =
        `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;

      script.async = true;

      script.onload = initializeMap;

      script.onerror = () => {
        console.error('카카오맵 SDK 로딩에 실패했습니다.');
      };

      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;

      if (script?.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [user]);

  // 주소 검색 스크립트
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src*="postcode.v2.js"]'
    );

    if (existingScript) return;

    const script = document.createElement('script');

    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

    script.async = true;

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // 주소 검색
  const searchAddress = () => {
    if (!window.daum?.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        const address =
          data.roadAddress || data.jibunAddress;

        setLocation(address);

        if (!mapRef.current || !geocoderRef.current) return;

        geocoderRef.current.addressSearch(
          address,
          (result, status) => {
            if (
              status === window.kakao.maps.services.Status.OK &&
              result.length > 0
            ) {
              const lat = Number(result[0].y);
              const lng = Number(result[0].x);

              const position =
                new window.kakao.maps.LatLng(lat, lng);

              mapRef.current.setCenter(position);

              markerRef.current.setPosition(position);
              markerRef.current.setMap(mapRef.current);

              setCoords({ lat, lng });
            }
          }
        );
      }
    }).open();
  };

  // 위치 초기화
  const resetLocation = () => {
    setLocation('');
    setCoords(null);

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const kakao = window.kakao;

          const currentPosition = new kakao.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );

          mapRef.current.setCenter(currentPosition);
        }
      );
    }
  };

  // 민원 접수
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      await addComplaint({
        title,
        content,
        location: location.trim() || '미입력',
        category_id: 1,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null
      });

      alert('민원이 접수되었습니다!');
      navigate('/');
    } catch (e) {
      console.error(e);
      alert('민원 접수 실패. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 로그인 확인
  if (!user) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          padding: '60px 20px',
          textAlign: 'center'
        }}
      >
        <div style={{
          fontSize: '22px',
          fontWeight: 800,
          color: '#172238'
        }}>
          로그인이 필요한 서비스입니다
        </div>

        <div style={{
          fontSize: '14px',
          color: '#778090',
          lineHeight: 1.8
        }}>
          민원신청은 회원만 이용할 수 있습니다.
          <br />
          로그인 후 이용해 주세요.
        </div>

        <button
          onClick={() => navigate('/', {
            state: { openLogin: true }
          })}
          style={{
            background: '#1555a4',
            color: '#fff',
            border: 'none',
            padding: '13px 32px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          로그인
        </button>

        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          ← 홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="inner-page">
      <div className="wrap">

        <div className="breadcrumb">
          <span onClick={() => navigate('/')}>홈</span>
          <span className="sep">›</span>
          <span>민원신청</span>
        </div>

        <h1 className="pg-title">민원신청</h1>

        <p className="pg-desc">
          일상생활 속 불편과 개선이 필요한 사항을 신청할 수 있습니다.
        </p>

        {/* 신청 단계 */}
        <div
          className="apply-steps"
          style={{ marginTop: '28px' }}
        >
          <div className="apply-step active">
            <div className="a-num">1</div>
            <div className="a-label">신청서 작성</div>
          </div>

          <div className="apply-step-line"></div>

          <div className="apply-step">
            <div className="a-num">2</div>
            <div className="a-label">내용 확인</div>
          </div>

          <div className="apply-step-line"></div>

          <div className="apply-step">
            <div className="a-num">3</div>
            <div className="a-label">신청 완료</div>
          </div>
        </div>

        <div
          className="cf-form-wrap"
          style={{ marginTop: '28px' }}
        >

          {/* 민원 정보 */}
          <div className="cf-form-section">

            <div className="cf-form-section-title">
              민원 정보 입력
            </div>

            <div className="cf-form-row">
              <div className="cf-form-group">
                <label>
                  민원 제목 <span className="req">*</span>
                </label>

                <input
                  type="text"
                  placeholder="민원 제목을 입력하세요."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="cf-form-row">
              <div className="cf-form-group">
                <label>
                  민원 내용 <span className="req">*</span>
                </label>

                <textarea
                  placeholder="자세한 내용을 입력해 주세요."
                  style={{ minHeight: '140px' }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            {/* 발생 위치 */}
            <div className="cf-form-row">
              <div className="cf-form-group">

                <label>발생 위치</label>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <input
                    type="text"
                    placeholder="주소 검색 또는 지도에서 위치를 선택하세요."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ flex: 1 }}
                    readOnly
                  />

                  <button
                    type="button"
                    onClick={searchAddress}
                    style={{
                      padding: '10px 16px',
                      background: '#1555a4',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    주소 검색
                  </button>

                  <button
                    type="button"
                    onClick={resetLocation}
                    style={{
                      padding: '10px 16px',
                      background: '#f3f4f6',
                      color: '#555',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    초기화
                  </button>
                </div>

                {/* 안내 문구 */}
                <div style={{
                  padding: '14px 16px',
                  background: '#eff6ff',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  color: '#1555a4',
                  fontSize: '13px',
                  lineHeight: 1.8
                }}>
                  📍 정확한 발생 위치를 선택해주세요.
                  <br />
                  지도에서 원하는 장소를 클릭하거나 핀을 드래그하면
                  위치를 직접 지정할 수 있습니다.
                </div>

                {/* 카카오 지도 */}
                <div
                  ref={mapContainerRef}
                  style={{
                    width: '100%',
                    height: '380px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                  }}
                />

              </div>
            </div>
          </div>

          {/* 첨부파일 */}
          <div className="cf-form-section">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#374151'
              }}>
                첨부파일
              </span>

              <div
                className="cf-upload-row"
                style={{ padding: 0 }}
              >
                <button className="cf-upload-btn">
                  파일 첨부
                </button>

                <span className="cf-upload-hint">
                  최대 5개, 총 20MB까지 가능 (jpg, png, pdf 등)
                </span>
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="cf-form-actions">

            <button
              className="cf-btn-secondary"
              onClick={() => navigate('/')}
            >
              취소
            </button>

            <button
              className="cf-btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '접수중...' : '다음 단계'}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
