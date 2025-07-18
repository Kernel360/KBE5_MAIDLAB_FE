import { MessageSquare, Clock } from 'lucide-react';

interface AnswerSectionProps {
  answer?: string;
  answerCreatedAt?: string;
}

export default function AnswerSection({
  answer,
  answerCreatedAt,
}: AnswerSectionProps) {
  const hasAnswer = !!answer;
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-600 overflow-hidden">
      {/* 답변 헤더 */}
      <div
        className={`flex items-center justify-between px-5 py-3 ${hasAnswer ? 'bg-green-50' : 'bg-yellow-50'}`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${hasAnswer ? 'bg-green-100' : 'bg-yellow-100'}`}
          >
            {hasAnswer ? (
              <MessageSquare className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-600" />
            )}
          </div>
          <span className="text-base font-semibold text-gray-900 dark:text-white">답변</span>
        </div>
        {hasAnswer && answerCreatedAt && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            {formatDate(answerCreatedAt)}
          </span>
        )}
      </div>
      {/* 답변 본문 */}
      <div className="px-5 py-5 bg-gray-50 dark:bg-gray-900">
        {hasAnswer ? (
          <div>
            <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed text-[15px]">
              {answer}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              관리자가 답변을 작성하는 중입니다.
              <br />
              조금만 기다려주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
