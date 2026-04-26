import Link from 'next/link';

export function GenerationMethodSelector() {
  const methods = [
    {
      id: 'pdf',
      icon: '📄',
      title: 'PDF 업로드',
      description: 'PDF 파일에서 자동으로 문제를 생성합니다',
      href: '/study/generate/pdf',
      cta: 'PDF 선택',
    },
    {
      id: 'excel',
      icon: '📊',
      title: '엑셀 템플릿',
      description: '엑셀 파일 형식으로 문제를 업로드합니다',
      href: '/study/generate/template',
      cta: '템플릿 다운로드',
    },
    {
      id: 'manual',
      icon: '✍️',
      title: '직접 입력',
      description: '웹 에디터에서 직접 문제를 작성합니다',
      href: '#manual',
      cta: '시작하기',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {methods.map((method) => (
        <Link key={method.id} href={method.href}>
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
            <div className="text-4xl mb-3">{method.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{method.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{method.description}</p>
            <button className="mt-4 w-full rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
              {method.cta}
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}
