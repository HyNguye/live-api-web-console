import React, { useState } from 'react';


// Định nghĩa kiểu cho props
interface NoteListProps {
  notes: string[];
}

const NoteList: React.FC<NoteListProps> = ({ notes }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const notesPerPage: number = 5; // Số ghi chú mỗi trang

  // Tính toán chỉ số bắt đầu và kết thúc của ghi chú trên trang hiện tại
  const indexOfLastNote: number = currentPage * notesPerPage;
  const indexOfFirstNote: number = indexOfLastNote - notesPerPage;
  const currentNotes: string[] = notes.slice(indexOfFirstNote, indexOfLastNote);

  // Tính tổng số trang
  const totalPages: number = Math.ceil(notes.length / notesPerPage);

  // Hàm chuyển trang
  const handlePrevPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = (): void => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="note">
      {notes.length > 0 ? (
        <div className="note-content">
          <h4>Danh sách ghi chú:</h4>
          {currentNotes.map((note, index) => (
            <p key={index}>{note}</p>
          ))}
          <div className="pagination">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <span>{currentPage} / {totalPages}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      ) : (
        <p>Wanna me note something?</p>
      )}
    </div>
  );
};

export default NoteList;