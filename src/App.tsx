import  React, { useEffect, useState } from 'react';
import './styles/App.css';

function App(): React.ReactElement {
  const [data, setData] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);  // 성공 여부 체크
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append("files", file); // ← 백엔드에서 @RequestParam("files")로 받아야 함
    });

    try {
      const response = await fetch("https://api-maidlab.duckdns.org/api/managers/me/fileupload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.text();
        alert("업로드 성공: " + result);
      } else {
        alert("업로드 실패");
      }
    } catch (error) {
      console.error("에러 발생:", error);
      alert("업로드 중 에러 발생");
    }
  };


  
  useEffect(() => {
    if (!hasFetched) {
      fetch('https://api-maidlab.duckdns.org/api/consumers/me/profile/2')
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(json => {
          setData(json);
          setHasFetched(true);  // 성공했으니 다시 시도 안함
        })
        .catch(err => {
          setError(err.message);
          // 실패해도 hasFetched를 안 바꾸면 재시도 가능
        });
    }
  }, [hasFetched]);

  return (
    <>
      <h1>MAIDLAB</h1>
      {data ? (
        <div>
          <p>ID: {data.id}</p>
          <p>NAME: {data.name}</p>
          <p>ADDRESS: {data.address}</p>
        </div>
      ) : !error? (
        <p>Loading...</p>
      ) : (
        <button onClick={() => setHasFetched(false)}>Retry</button>
      )}
      <div>
        <h2>파일 업로드</h2>
        <input type="file" multiple onChange={handleFileChange} />
        <button onClick={handleUpload}>전송</button>
      </div>
      </>          
  );
}

export default App;
