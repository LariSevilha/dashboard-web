import React, { useState, useCallback } from 'react';
import { FileInputField, SelectField, InputField } from '../components/UserFormComponents';
import { File, Plus, Minus, ChevronDown } from '../components/Icons';
import styles from '../styles/UserForm.module.css';
import { WeekdayOptions } from './FormConstants';

interface WeeklyPdf {
  id: number | null;
  weekday: string;
  pdf_file: File | null;
  pdf_url?: string;
  pdf_filename?: string;
  notes?: string;
  _destroy: boolean;
}

interface PdfProps {
  weeklyPdfs: WeeklyPdf[];
  handlePdfChange: (index: number, field: string, value: any) => void;
  removePdf: (index: number) => void;
  addPdf: () => void;
}

const PdfForm: React.FC<PdfProps> = ({ weeklyPdfs, handlePdfChange, removePdf, addPdf }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(weeklyPdfs.length - 1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = useCallback((field: string, value: string) => {
    if (field === 'weekday' && !value) {
      return 'Selecione um dia da semana';
    }
    return '';
  }, []);

  const handleAddPdf = useCallback(() => {
    addPdf();
    setOpenIndex(weeklyPdfs.length);
  }, [addPdf, weeklyPdfs.length]);

  const handleRemovePdf = useCallback(
    (index: number) => {
      if (window.confirm('Tem certeza que deseja excluir este PDF?')) {
        removePdf(index);
      }
    },
    [removePdf]
  );

  const handleChangeWithValidation = useCallback(
    (index: number, field: string, value: any) => {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [`${index}-${field}`]: error,
      }));
      handlePdfChange(index, field, value);
    },
    [handlePdfChange, validateField]
  );

  const togglePdf = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>PDF Semanal</h3>
        <button type="button" className={styles.addButton} onClick={handleAddPdf} aria-label="Adicionar novo PDF">
          <Plus /> Adicionar PDF
        </button>
      </div>
      {weeklyPdfs.length === 0 || weeklyPdfs.every((pdf) => pdf._destroy) ? (
        <p className={styles.emptyMessage}>Nenhum PDF adicionado ainda.</p>
      ) : (
        weeklyPdfs.map((pdfItem, index) =>
          !pdfItem._destroy ? (
            <div
              className={`${styles.groupCard} ${openIndex === index ? '' : styles.collapsed}`}
              key={pdfItem.id || `pdf-${index}`}
              role="region"
              aria-labelledby={`pdf-header-${index}`}
            >
              <div
                className={styles.groupCardHeader}
                onClick={() => togglePdf(index)}
                onKeyDown={(e) => e.key === 'Enter' && togglePdf(index)}
                role="button"
                aria-expanded={openIndex === index}
                aria-controls={`pdf-content-${index}`}
                tabIndex={0}
              >
                <span>{pdfItem.pdf_filename || `PDF ${index + 1}`}</span>
                <span
                  style={{
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <ChevronDown />
                </span>
              </div>
              <div id={`pdf-content-${index}`} className={styles.groupCardContent}>
                <div className={styles.sectionGroup}>
                  <SelectField
                    label="Dia da Semana"
                    name={`pdf-${index}-weekday`}
                    value={pdfItem.weekday}
                    onChange={(e) => handleChangeWithValidation(index, 'weekday', e.target.value)}
                    options={WeekdayOptions}
                    icon={<File />}
                    error={errors[`${index}-weekday`]}
                  />
                  <FileInputField
                    label="Upload PDF"
                    name={`pdf-${index}-file`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChangeWithValidation(index, 'pdf_file', e.target.files ? e.target.files[0] : null)
                    }
                    icon={<File />}
                    required={!pdfItem.id && !pdfItem.pdf_url && !pdfItem.pdf_file}
                    currentFileName={
                      pdfItem.pdf_filename || (pdfItem.pdf_file ? pdfItem.pdf_file.name : undefined)
                    }
                    hasExistingFile={!!pdfItem.pdf_url}
                    error={errors[`${index}-pdf_file`]}
                  />
                  <InputField
                    label="Notas (opcional)"
                    type="text"
                    name={`pdf-${index}-notes`}
                    value={pdfItem.notes || ''}
                    onChange={(e) => handleChangeWithValidation(index, 'notes', e.target.value)}
                    placeholder="Notas sobre o PDF"
                    icon={<File />}
                    optional
                    error={errors[`${index}-notes`]}
                  />
                </div>
                <div className={styles.buttonRow}>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemovePdf(index)}
                    aria-label="Remover PDF"
                  >
                    <Minus /> Remover PDF
                  </button>
                </div>
              </div>
            </div>
          ) : null
        )
      )}
    </div>
  );
};

export default PdfForm;