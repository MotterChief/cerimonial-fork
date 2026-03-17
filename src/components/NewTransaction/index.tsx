
import React from 'react';
import ExpandableCard from '../ExpandableCard';
import { useIsMobile } from '@/utils/window.utils';
import CustomDatePicker from '../fields/DatePicker';
import CurrencyInput from '../fields/CurrencyInput';
import CustomSelect from '../Select';

interface Contract {
    id: string;
    name: string;
    totalValue: number;
    paidValue: number;
    nextDueDate: string;
}

interface NewTransactionProps {
  contracts: Contract[];
  newTransaction: {
    type: string;
    value: string;
    description: string;
    contractId: string;
    date: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSaveTransaction: (e: React.FormEvent) => void;
}

const getContractOptions = (contracts: Contract[]) => {
  return contracts.map(contract => ({
    value: contract.id,
    label: contract.name,
  }));
};

const NewTransaction: React.FC<NewTransactionProps> = ({ contracts, newTransaction, handleInputChange, handleSaveTransaction }) => {
  return (
    <ExpandableCard title="Nova Movimentação" iconName="fa-plus" collapsible={ useIsMobile() }>
      <form onSubmit={handleSaveTransaction}>
        <div className="form-group">
          <label htmlFor="type">Tipo:</label>
          <select id="type" value={newTransaction.type} onChange={handleInputChange}>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="value">Valor:</label>
          <CurrencyInput
            id="budget"
            value={newTransaction.value || 0}
            onChange={(value) => handleInputChange({ target: { id: 'value', value: value.toString() } } as React.ChangeEvent<HTMLInputElement>)}
            placeholder="R$ 5.000,00"
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Data:</label>
          <CustomDatePicker
            id="date"
            selected={newTransaction.date}
            onChange={(date) => handleInputChange({ target: { id: 'date', value: date ? date.toISOString().split('T')[0] : '' } } as React.ChangeEvent<HTMLInputElement>)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contractId">Evento Relacionado:</label>
          <CustomSelect 
            id="contractId"
            options={getContractOptions(contracts)}
            value={getContractOptions(contracts).find(option => option.value === newTransaction.contractId) || null}
            onChange={(option) => handleInputChange({ target: { id: 'contractId', value: option ? option.value : '' } } as React.ChangeEvent<HTMLInputElement>)}
            placeholder="Selecione um evento"
            isClearable
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Descrição:</label>
          <input type="text" id="description" value={newTransaction.description} onChange={handleInputChange} placeholder="Descrição da movimentação" />
        </div>
        <button type="submit" className="btn">
          <i className="fas fa-save"></i> Salvar Movimentação
        </button>
      </form>
    </ExpandableCard>
  );
};

export default NewTransaction;
