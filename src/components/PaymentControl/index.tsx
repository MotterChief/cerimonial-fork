
import React, { useState } from 'react';
import styles from './PaymentControl.module.css';
import Modal from '@/components/Modal';
import { Installment } from '@/services/client.service';
import { useNotification } from '@/context/NotificationContext';
import { formatCurrency } from '@/utils/currency.utils';

interface Contract {
  id: string;
  name: string;
  totalValue: number;
  paidValue: number;
  nextDueDate: string;
  installments?: Installment[];
}

interface PaymentControlProps {
  contracts: Contract[];
  handleUpdateInstallment: (contractId: string, installmentIndex: number, updatedInstallment: Installment) => void;
  handleGenerateInstallments: (contractId: string, installments: number, totalValue: number, dueDay: number) => void;
}

const PaymentControl: React.FC<PaymentControlProps> = ({ contracts, handleUpdateInstallment, handleGenerateInstallments }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [installments, setInstallments] = useState(1);
  const [dueDay, setDueDay] = useState(1);
  const { addNotification } = useNotification()

  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra os contratos baseado no searchTerm
  const filteredContractsTerm = contracts.filter(contract => 
    contract.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleStatusChange = (index: number, newStatus: Installment['status']) => {
    if (selectedContract) {
      const updatedInstallments = [...selectedContract.installments!];
      const updatedInstallment = { ...updatedInstallments[index], status: newStatus };
      updatedInstallments[index] = updatedInstallment;
      
      const updatedContract = { ...selectedContract, installments: updatedInstallments };
      setSelectedContract(updatedContract);

      handleUpdateInstallment(selectedContract.id, index, updatedInstallment);
    }
  };

  const generateInstallments = () => {
    if (installments === null || installments === undefined || Number.isNaN(installments) || installments <= 0) {
      addNotification('Por favor, insira um número válido de parcelas.', 'error');
      return;
    }
    if (dueDay == null || dueDay === undefined || Number.isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      addNotification('Por favor, insira um dia de vencimento válido (1-31).', 'error');
      return;
    }

    if (selectedContract) {
      handleGenerateInstallments(selectedContract.id, installments, selectedContract.totalValue, dueDay);
      closeModal();
    }
  };

  return (
    <>
      <div className="card card-consult">
        <h3><i className="fas fa-money-bill-wave"></i> Controle de Pagamentos <span className="counter">{filteredContractsTerm.length} encontrados</span></h3>
        <div className="form-group">
            <input 
              type="text"
              placeholder="Buscar por nome de pagamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        <div id="paymentList" className="list-container">
          {filteredContractsTerm.map(contract => {
            const paidInstallments = contract.installments?.filter(i => i.status === 'paga').length || 0;
            const totalInstallments = contract.installments?.length || 0;
            const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;
            return (
              <div key={contract.id} className="supplier-card">
                <h4>{contract.name}</h4>
                <p>Total: {formatCurrency(contract.totalValue)} | Pago: {formatCurrency(contract.paidValue)}</p>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                </div>
                <p>Próximo pagamento: {contract.nextDueDate}</p>
                <button className="btn btn-small" onClick={() => openModal(contract)}>Ver Parcelas</button>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Parcelas">
        <div>
          <div className="form-group">
            <label>Número de Parcelas</label>
            <input type="number" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Dia do Vencimento</label>
            <input type="number" value={dueDay} onChange={(e) => setDueDay(parseInt(e.target.value))} min="1" max="31" />
          </div>
          <button className="btn btn-small" style={{ margin:"10px" }} onClick={generateInstallments}>Gerar Parcelas</button>
          <div className={styles.tableResponsiveContainer}>
            <table className={styles.paymentTable}>
              <thead>
                <tr>
                  <th>Data de Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {selectedContract?.installments?.map((installment, index) => (
                  <tr key={index} className={styles[installment.status]}>
                    <td>{installment.dueDate}</td>
                    <td>{formatCurrency(installment.value)}</td>
                    <td>{installment.status}</td>
                    <td>
                      <select className={styles.select} value={installment.status} onChange={(e) => handleStatusChange(index, e.target.value as Installment['status'])}>
                        <option value="pendente">Pendente</option>
                        <option value="paga">Paga</option>
                        <option value="atrasada">Atrasada</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PaymentControl;
