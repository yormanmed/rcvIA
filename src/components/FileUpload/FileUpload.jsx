import { useRef } from 'react';
import './FileUpload.css';

function FileUpload({
  onFileChange,
  preview,
  accept = 'image/png,image/jpeg,image/jpg,application/pdf',
}) {
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('file-upload--drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('file-upload--drag-over');
  };

  const handleClick = () => inputRef.current.click();

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileChange(file);
    e.target.value = '';
  };

  return (
    <div
      className={`file-upload ${preview ? 'file-upload--has-preview' : ''}`}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="file-upload__input"
      />

      {preview ? (
        <img src={preview} alt="Vista previa" className="file-upload__preview" />
      ) : (
        <div className="file-upload__placeholder">
          <div className="file-upload__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="2" y="2" width="44" height="44" rx="12" fill="#f3eefb" />
              <path
                d="M24 16V32"
                stroke="#3d1f8f"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M18 22L24 16L30 22"
                stroke="#3d1f8f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 36H32"
                stroke="#3d1f8f"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="file-upload__text">
            <span className="file-upload__link"><h2>Haz clíc aquí</h2></span> 
          </div>
          <p className="file-upload__text">
            Para subir o tomar la Foto de tu carnet
          </p>
          
          <p className="file-upload__hint">PNG, JPG o PDF</p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
