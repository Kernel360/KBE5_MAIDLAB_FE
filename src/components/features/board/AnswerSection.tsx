interface AnswerSectionProps {
  answer?: string;
}

export default function AnswerSection({ answer }: AnswerSectionProps) {
  if (!answer) return null;

  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">답변</h3>
      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap">{answer}</p>
      </div>
    </div>
  );
} 