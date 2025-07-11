import React, { useState } from 'react';
import { FileInputField, SelectField, InputField } from '../components/UserFormComponents';
import * as Icons from '../components/Icons';
import styles from '../styles/UserForm.module.css';
import { WeekdayOptions } from './FormConstants';

interface PdfProps {
  weeklyPdfs: any[];
  handlePdfChange: (index: number, field: string, value: any) => void;
  removePdf: (index: number) => void;
  addPdf: () => void;
}

const PdfForm: React.FC<PdfProps> = ({ weeklyPdfs, handlePdfChange, removePdf, addPdf }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(weeklyPdfs.length - 1);

  const handleAddPdf = () => {
    addPdf();
    setOpenIndex(weeklyPdfs.length);
  };

  const togglePdf = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>PDF Semanal</h3>
        {/* <button type="button" className={styles.addButton} onClick={handleAddPdf} aria-label="Adicionar novo PDF">
          <Icons.Plus /> Adicionar PDF
        </button> */}
      </div>
      {weeklyPdfs.map((pdfItem, index) =>
        !pdfItem._destroy ? (
          <div
            className={`${styles.groupCard} ${openIndex === index ? '' : styles.collapsed}`}
            key={pdfItem.id || `pdf-${index}`}
          >
            <div className={styles.groupCardHeader} onClick={() => togglePdf(index)}>
              <span>{pdfItem.pdf_filename || `PDF ${index + 1}`}</span>
              <span style={{ transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                <Icons.ChevronDown />
              </span>
            </div>
            <div className={styles.groupCardContent}>
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
                {/* <InputField
                  label="Notas (opcional)"
                  type="text"
                  name={`pdf-${index}-notes`}
                  value={pdfItem.notes || ''}
                  onChange={(e) => handlePdfChange(index, 'notes', e.target.value)}
                  placeholder="Notas sobre o PDF"
                  icon={<Icons.Info />}
                  optional
                /> */}
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
          </div>
        ) : null
      )}
    </div>
  );
};

export default PdfForm;