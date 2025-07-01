import React, { useState } from 'react';
import { formatPrice } from '@/utils/format';

interface WeeklySettlement {
  week: number;
  startDate: Date;
  totalAmount: number;
  settlementsCount: number;
}

interface WeeklySettlementChartProps {
  weeklySettlements: WeeklySettlement[];
}

const WeeklySettlementChart: React.FC<WeeklySettlementChartProps> = ({
  weeklySettlements,
}) => {
  // 툴팁 상태
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    week: WeeklySettlement;
  } | null>(null);

  // 현재 주차 계산
  const getCurrentWeek = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // 이번 달의 첫째 날
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

    // 월요일 기준으로 첫째 주 시작일 계산
    let currentWeekStart = new Date(firstDayOfMonth);
    currentWeekStart.setDate(
      currentWeekStart.getDate() - ((currentWeekStart.getDay() + 6) % 7),
    );

    let weekNumber = 1;

    // 오늘이 몇 주차인지 찾기
    while (weekNumber <= 5) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      if (today >= currentWeekStart && today <= weekEnd) {
        return weekNumber;
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
    }

    return 1; // 기본값
  };

  const currentWeek = getCurrentWeek();
  const currentWeekData = weeklySettlements.find(
    (week) => week.week === currentWeek,
  );

  if (weeklySettlements.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">📊</div>
        <p className="text-gray-500">정산 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 그래프 */}
      <div className="bg-white rounded-lg p-4 border border-gray-100">
        <div className="relative h-48">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 300 180"
            className="overflow-visible"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {(() => {
              const maxAmount = Math.max(
                ...weeklySettlements.map((w) => w.totalAmount),
              );
              const padding = 30;
              const graphWidth = 300;
              const graphHeight = 140;

              // 좌표 계산
              const points = weeklySettlements.map((week, index) => {
                const x =
                  padding +
                  15 +
                  (index * (graphWidth - padding * 2 - 20)) /
                    (weeklySettlements.length - 1);
                const y =
                  maxAmount > 0
                    ? graphHeight -
                      (week.totalAmount / maxAmount) * (graphHeight - padding)
                    : graphHeight - padding;
                return { x, y, week };
              });

              // 선 경로 생성
              const pathData = points
                .map(
                  (point, index) =>
                    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`,
                )
                .join(' ');

              return (
                <g>
                  {/* 격자선 */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                    <line
                      key={ratio}
                      x1={padding + 15}
                      y1={graphHeight - ratio * (graphHeight - padding)}
                      x2={graphWidth - padding - 5}
                      y2={graphHeight - ratio * (graphHeight - padding)}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Y축 라벨 */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                    <text
                      key={ratio}
                      x={padding - 8}
                      y={graphHeight - ratio * (graphHeight - padding) + 4}
                      textAnchor="end"
                      className="text-xs fill-gray-500"
                    >
                      {maxAmount > 0
                        ? Math.round((maxAmount * ratio) / 10000) + '만'
                        : '0'}
                    </text>
                  ))}

                  {/* 꺾은선 */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* 데이터 포인트 */}
                  {points.map((point, index) => (
                    <g key={index}>
                      {/* 호버 영역 (투명한 큰 원) */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="15"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={(e) => {
                          const svg = e.currentTarget.ownerSVGElement;
                          const rect = svg?.getBoundingClientRect();
                          if (rect && svg) {
                            const viewBox = svg.viewBox.baseVal;
                            const scaleX = rect.width / viewBox.width;
                            const scaleY = rect.height / viewBox.height;

                            const screenX = rect.left + point.x * scaleX;
                            const screenY = rect.top + point.y * scaleY;

                            setHoveredPoint({
                              x: screenX,
                              y: screenY,
                              week: point.week,
                            });
                          }
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          const svg = e.currentTarget.ownerSVGElement;
                          const rect = svg?.getBoundingClientRect();
                          if (rect && svg) {
                            const viewBox = svg.viewBox.baseVal;
                            const scaleX = rect.width / viewBox.width;
                            const scaleY = rect.height / viewBox.height;

                            const screenX = rect.left + point.x * scaleX;
                            const screenY = rect.top + point.y * scaleY;

                            setHoveredPoint({
                              x: screenX,
                              y: screenY,
                              week: point.week,
                            });

                            // 3초 후 자동으로 툴팁 숨김
                            setTimeout(() => {
                              setHoveredPoint(null);
                            }, 3000);
                          }
                        }}
                      />
                      {/* 실제 데이터 포인트 */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#f97316"
                        stroke="white"
                        strokeWidth="2"
                        className="pointer-events-none"
                      />

                      {/* X축 라벨 */}
                      <text
                        x={point.x}
                        y={graphHeight + 20}
                        textAnchor="middle"
                        className="text-xs fill-gray-600 font-medium"
                      >
                        {point.week.week}주차
                      </text>
                    </g>
                  ))}
                </g>
              );
            })()}
          </svg>

          {/* 툴팁 */}
          {hoveredPoint && (
            <div
              className="fixed z-50 bg-gray-100 text-black text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-200"
              style={{
                left: hoveredPoint.x,
                top: hoveredPoint.y - 10,
                transform: 'translate(-50%, -100%)',
              }}
              onClick={() => setHoveredPoint(null)}
            >
              <div className="font-semibold">{hoveredPoint.week.week}주차</div>
              <div className="text-orange-600 font-medium">
                {formatPrice(hoveredPoint.week.totalAmount)}
              </div>
              <div className="text-gray-600 text-xs">
                {hoveredPoint.week.settlementsCount}건
              </div>
              {/* 모바일 닫기 힌트 */}
              <div className="text-gray-500 text-xs mt-1 block md:hidden">
                탭하여 닫기
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 요약 정보 */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">
            이번주 정산 ({currentWeek}주차)
          </p>
          <p className="text-lg font-bold text-gray-900">
            {formatPrice(currentWeekData?.totalAmount || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">총 정산금액</p>
          <p className="text-lg font-bold text-blue-500">
            {formatPrice(
              weeklySettlements.reduce(
                (sum, week) => sum + week.totalAmount,
                0,
              ),
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">주평균</p>
          <p className="text-lg font-bold text-green-500">
            {formatPrice(
              Math.round(
                weeklySettlements.reduce(
                  (sum, week) => sum + week.totalAmount,
                  0,
                ) / weeklySettlements.length,
              ),
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklySettlementChart;
