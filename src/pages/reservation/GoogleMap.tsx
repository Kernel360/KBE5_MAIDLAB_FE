import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
function GoogleMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMap, setGoogleMap] = useState<google.maps.Map>();
  const [address, setAddress] = useState<string>('');
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 37.5,
    lng: 127.0,
  });
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState<string>('');
  const navigate = useNavigate();

  // 한글 주소 역지오코딩 함수
  const geocodeLatLng = (lat: number, lng: number) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const koResult = results.find((r) =>
          r.formatted_address.match(/[가-힣]/),
        );
        let address = koResult
          ? koResult.formatted_address
          : results[0].formatted_address;
        // '대한민국' 제거
        address = address.replace(/대한민국\s*/, '').trim();
        setAddress(address);
      } else {
        setAddress('');
      }
    });
  };

  // 내 위치로 이동 함수
  const moveToMyLocation = () => {
    setLoading(true);
    setGeoError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const position = { lat: latitude, lng: longitude };
          if (googleMap) googleMap.setCenter(position);
          setLoading(false);
        },
        (err) => {
          setGeoError('내 위치를 찾을 수 없습니다. 위치 권한을 허용해주세요.');
          setLoading(false);
        },
      );
    } else {
      setGeoError('이 브라우저에서는 위치 기능을 지원하지 않습니다.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;
    const instance = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 16,
      disableDefaultUI: false,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      gestureHandling: 'cooperative',
    });
    setGoogleMap(instance);
    setLoading(true);
    // 최초 내 위치로 이동
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const position = { lat: latitude, lng: longitude };
          instance.setCenter(position);
          setCenter(position);
          setLoading(false);
        },
        () => {
          setLoading(false);
        },
      );
    } else {
      setLoading(false);
    }
    // 지도 이동 시 center 업데이트
    instance.addListener('center_changed', () => {
      const c = instance.getCenter();
      if (c) {
        const newCenter = { lat: c.lat(), lng: c.lng() };
        setCenter(newCenter);
      }
    });
    // 최초 주소 역지오코딩
    geocodeLatLng(center.lat, center.lng);
    // eslint-disable-next-line
  }, []);

  // center가 바뀔 때마다 주소 역지오코딩
  useEffect(() => {
    if (!googleMap) return;
    geocodeLatLng(center.lat, center.lng);
    // eslint-disable-next-line
  }, [center]);

  // UI 오버레이
  return (
    <div>
      {/* 지도 */}
      <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />
      {/* 중앙 마커 오버레이 */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: 48,
          height: 48,
          transform: 'translate(-50%, -70%)',
          zIndex: 1100,
          pointerEvents: 'none',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill="#FF5722"
            stroke="#FFF"
            strokeWidth="1"
          />
        </svg>
      </div>
      {/* 주소/버튼 오버레이 */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1200,
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: 16,
          minWidth: 300,
          maxWidth: '90vw',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">선택된 위치 주소</span>
          <button
            className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm border border-gray-200"
            onClick={moveToMyLocation}
            type="button"
          >
            내 위치로 이동
          </button>
        </div>
        <div
          className="text-sm text-gray-700 mb-2"
          style={{ wordBreak: 'break-all' }}
        >
          {loading
            ? '위치 불러오는 중...'
            : address || '주소를 찾을 수 없습니다.'}
        </div>
        {geoError && (
          <div className="text-red-500 text-xs mb-2">{geoError}</div>
        )}
        <button
          className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition"
          disabled={!address}
          onClick={() => {
            if (center && address) {
              navigate(ROUTES.CONSUMER.RESERVATION_CREATE, {
                state: {
                  address,
                  lat: center.lat,
                  lng: center.lng,
                  step: 2,
                },
                replace: true,
              });
            }
          }}
        >
          이 위치로 주소 선택하기
        </button>
      </div>
    </div>
  );
}

export default GoogleMap;
