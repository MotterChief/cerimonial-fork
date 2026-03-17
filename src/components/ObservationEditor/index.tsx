'use client';

import React from 'react';
import { Observation } from '@/services/script.service';
import styles from './ObservationEditor.module.css'

interface ObservationEditorProps {
  observations: Observation[];
  onChange: (observations: Observation[]) => void;
}

const ObservationEditor: React.FC<ObservationEditorProps> = ({ observations, onChange }) => {

  const handleObservationChange = (index: number, field: keyof Observation, value: string) => {
    const newObservations = [...observations];
    newObservations[index] = { ...newObservations[index], [field]: value };
    onChange(newObservations);
  };

  const addObservation = () => {
    onChange([...observations, { key: '', value: '' }]);
  };

  const removeObservation = (index: number) => {
    const newObservations = observations.filter((_, i) => i !== index);
    onChange(newObservations);
  };

  return (
    <div className={styles.observationEditor}>
      <label>Observações:</label>
      {observations.map((obs, index) => (
        <div key={index} className={styles.observationItem}>
          <input
            type="text"
            placeholder="Chave (ex: Música)"
            value={obs.key}
            onChange={(e) => handleObservationChange(index, 'key', e.target.value)}
          />
          <input
            type="text"
            placeholder="Valor (ex: Nome da música)"
            value={obs.value}
            onChange={(e) => handleObservationChange(index, 'value', e.target.value)}
          />
          <button type="button" onClick={() => removeObservation(index)} className="btn-delete-icon">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ))}
      <button type="button" onClick={addObservation} className="btn btn-outline">
        <i className="fas fa-plus"></i> Adicionar Observação
      </button>
    </div>
  );
};

export default ObservationEditor;
