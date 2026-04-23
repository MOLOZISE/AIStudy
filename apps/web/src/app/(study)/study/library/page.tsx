import { StudyShell } from '@/components/study/StudyShell';
import { WorkbookList } from '@/components/study/WorkbookList';
import { WorkbookUploadForm } from '@/components/study/WorkbookUploadForm';

export default function StudyLibraryPage() {
  return (
    <StudyShell title="문제집 라이브러리" description="업로드된 workbook과 import job 상태를 확인하는 화면입니다.">
      <div className="space-y-5">
        <WorkbookUploadForm />
        <WorkbookList />
      </div>
    </StudyShell>
  );
}
