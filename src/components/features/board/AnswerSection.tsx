import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, Clock } from 'lucide-react';

interface AnswerSectionProps {
  answer?: string;
}

export default function AnswerSection({ answer }: AnswerSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasAnswer = !!answer;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 토글 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            hasAnswer ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {hasAnswer ? (
              <MessageSquare className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-600" />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">답변</h3>
            <p className="text-sm text-gray-500">
              {hasAnswer ? '관리자 답변을 확인하세요' : '답변을 기다리는 중입니다'}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* 답변 내용 */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="p-4 bg-gray-50">
            {hasAnswer ? (
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {answer}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-gray-500 text-sm">
                  관리자가 답변을 작성하는 중입니다.<br />
                  조금만 기다려주세요.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 