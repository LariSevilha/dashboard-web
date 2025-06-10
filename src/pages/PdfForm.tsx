import React from 'react';
import { InputField, FileInputField } from '../components/UserFormComponents';
import * as Icons from '../components/Icons';
import styles from '../styles/UserForm.module.css';

interface PdfProps {
  weeklyPdfs: any[];
  handlePdfChange: (index: number, field: string, value: any) => void;
  removePdf: (index: number) => void;
  addPdf: () => void;
}

const PdfForm: React.FC<PdfProps> = ({ weeklyPdfs, handlePdfChange, removePdf, addPdf }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>PDFs Semanais</h3>
        <button type="button" className={styles.addButton} onClick={addPdf} aria-label="Adicionar novo PDF">
          <Icons.Plus /> Adicionar PDF
        </button>
      </div>
      {weeklyPdfs.map((pdfItem, index) =>
        !pdfItem._destroy ? (
          <div className={styles.groupCard} key={pdfItem.id || `pdf-${index}`}>
            <div className={styles.sectionGroup}>
              <FileInputField
                label="Upload PDF"
                name={`pdf-${index}-file`}
                onChange={(e) => handlePdfChange(index, 'pdf_file', e.target.files ? e.target.files[0] : null)}
                icon={<Icons.File />}
                required={!pdfItem.id && !pdfItem.pdf_url && !pdfItem.pdf_file}
                currentFileName={
                  pdfItem.pdf_filename || (pdfItem.pdf_file ? pdfItem.pdf_file.name : undefined)
                }
                hasExistingFile={!!pdfItem.pdf_url}
              />
              <InputField
                label="Notas (opcional)"
                type="text"
                name={`pdf-${index}-notes`}
                value={pdfItem.notes || ''}
                onChange={(e) => handlePdfChange(index, 'notes', e.target.value)}
                placeholder="Adicione notas aqui"
                optional
                icon={<Icons.File />}
              />
            </div>
            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removePdf(index)}
                aria-label="Remover PDF"
              >
                <Icons.Minus /> Remover PDF
              </button>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default PdfForm;