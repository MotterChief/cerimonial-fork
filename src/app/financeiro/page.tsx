
'use client';

import { useState, useEffect } from 'react';
import InfoCard from '@/components/InfoCard';
import PaymentControl from '@/components/PaymentControl';
import NewTransaction from '@/components/NewTransaction';
import { useAuth } from '@/context/AuthContext';
import { getEvents } from '@/services/event.service';
import { getClients, updateClient, Client, Installment } from '@/services/client.service';
import { useNotification } from '@/context/NotificationContext';

interface FinancialData {
  totalRevenue: number;
  dueInstallments: number;
  upcomingInstallments: number;
  doneInstallments: number;
  receivable: number;
  paid: number;
}

interface Contract {
  id: string;
  name: string;
  totalValue: number;
  paidValue: number;
  nextDueDate: string;
  clientId: string;
  installments?: Installment[];
}

export default function FinanceiroPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [financials, setFinancials] = useState<FinancialData>({ totalRevenue: 0, dueInstallments: 0, upcomingInstallments: 0, doneInstallments: 0, receivable: 0, paid: 0 });
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [newTransaction, setNewTransaction] = useState({ type: 'receita', value: '', description: '', contractId: '', date: '' });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const userEvents = await getEvents(user.uid);
      const userClients = await getClients(user.uid);
      setClients(userClients);

      const contractsData = userEvents.map(event => {
        const client = userClients.find(c => c.id === event.clientId);
        return {
          id: event.id,
          name: event.eventName,
          totalValue: client ? client.budget || 0 : 0,
          paidValue: client ? client.paidValue || 0 : 0,
          nextDueDate: event.eventDate,
          clientId: event.clientId,
          installments: client ? client.installments || [] : [],
        };
      });

      setContracts(contractsData);
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const totalRevenue = contracts.reduce((acc, contract) => acc + contract.totalValue, 0);
    const paid = contracts.reduce((acc, contract) => acc + contract.paidValue, 0);
    const receivable = totalRevenue - paid;

    let dueInstallments = 0;
    let upcomingInstallments = 0;
    let doneInstallments = 0;
    const today = new Date();

    contracts.forEach(contract => {
      contract.installments?.forEach(installment => {
        const dueDate = new Date(installment.dueDate.split('/').reverse().join('-'));
        doneInstallments++;
        if (installment.status === 'pendente' && dueDate < today) {
          dueInstallments++;
        } else if (installment.status === 'pendente' && dueDate >= today) {
          upcomingInstallments++;
        } else if (installment.status === 'atrasada') {
          dueInstallments++;
        }
      });
    });

    doneInstallments = doneInstallments - dueInstallments - upcomingInstallments;

    setFinancials({ totalRevenue, paid, receivable, dueInstallments, upcomingInstallments, doneInstallments });
  }, [contracts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const { type, value, contractId } = newTransaction;
    const transactionValue = parseFloat(value);

    if (!user) {
      addNotification('Usuário não autenticado!', 'error');
      return;
    }

    if (!contractId || isNaN(transactionValue)) {
      addNotification('Por favor, preencha todos os campos corretamente.', 'error');
      return;
    }

    const contractToUpdate = contracts.find(c => c.id === contractId);
    if (!contractToUpdate) {
      addNotification('Contrato não encontrado!', 'error');
      return;
    }

    const clientToUpdate = clients.find(c => c.id === contractToUpdate.clientId);
    if (!clientToUpdate) {
      addNotification('Cliente não encontrado!', 'error');
      return;
    }

    let updatedInstallments = JSON.parse(JSON.stringify(clientToUpdate.installments || []));
    let newPaidValue = Number(clientToUpdate.paidValue || 0);
    let newTotalValue = Number(clientToUpdate.budget || 0);

    if (type === 'receita') {
      newPaidValue += transactionValue;
      let remainingValueToDiscount = transactionValue;
      for (let i = 0; i < updatedInstallments.length && remainingValueToDiscount > 0; i++) {
        if (updatedInstallments[i].status === 'pendente') {
          const installmentValue = updatedInstallments[i].value;
          if (remainingValueToDiscount >= installmentValue) {
            remainingValueToDiscount -= installmentValue;
            updatedInstallments[i].value = 0;
            updatedInstallments[i].status = 'paga';
          } else {
            updatedInstallments[i].value -= remainingValueToDiscount;
            remainingValueToDiscount = 0;
          }
        }
      }
    } else if (type === 'despesa') {
      if (updatedInstallments.length > 0) {
        const lastInstallment = updatedInstallments[updatedInstallments.length - 1];
        lastInstallment.value = Number(lastInstallment.value) + transactionValue;
        newTotalValue += transactionValue;
      }
    }

        await updateClient(user.uid, clientToUpdate.id, {
          name: clientToUpdate.name,
          installments: updatedInstallments,
          paidValue: newPaidValue,
          budget: newTotalValue
        });
    setClients(prevClients =>
      prevClients.map(client => {
        if (client.id === clientToUpdate.id) {
          return { ...client, installments: updatedInstallments, paidValue: newPaidValue, budget: newTotalValue };
        }
        return client;
      })
    );

    setContracts(prevContracts =>
      prevContracts.map(contract => {
        if (contract.id === contractId) {
          return { ...contract, installments: updatedInstallments, paidValue: newPaidValue, totalValue: newTotalValue };
        }
        return contract;
      })
    );

    addNotification('Movimentação salva com sucesso!', 'success');
    setNewTransaction({ type: 'receita', value: '', description: '', contractId: '', date: '' });
  };

  const handleUpdateInstallment = async (contractId: string, installmentIndex: number, updatedInstallment: Installment) => {
    const contractToUpdate = contracts.find(c => c.id === contractId);

    if (!user) {
      addNotification('Usuário não autenticado!', 'error');
      return;
    }

    if (!contractToUpdate) {
      addNotification('Contrato não encontrado!', 'error');
      return;
    }

    const clientToUpdate = clients.find(c => c.id === contractToUpdate.clientId);
    if (!clientToUpdate) {
      addNotification('Cliente não encontrado!', 'error');
      return;
    }

    const updatedInstallments = [...(clientToUpdate.installments || [])];
    updatedInstallments[installmentIndex] = updatedInstallment;

    const newPaidValue = updatedInstallments.reduce((acc, installment) => {
      if (installment.status === 'paga') {
        return acc + installment.value;
      }
      return acc;
    }, 0);

    await updateClient(user.uid, clientToUpdate.id, {
      name: clientToUpdate.name,
      installments: updatedInstallments,
      paidValue: newPaidValue
    });

    setClients(prevClients =>
      prevClients.map(client => {
        if (client.id === clientToUpdate.id) {
          return { ...client, installments: updatedInstallments, paidValue: newPaidValue };
        }
        return client;
      })
    );

    setContracts(prevContracts =>
      prevContracts.map(contract => {
        if (contract.id === contractId) {
          return { ...contract, installments: updatedInstallments, paidValue: newPaidValue };
        }
        return contract;
      })
    );
  };

  const handleGenerateInstallments = async (contractId: string, installments: number, totalValue: number, dueDay: number) => {
    const contractToUpdate = contracts.find(c => c.id === contractId);

    if (!user) {
      addNotification('Usuário não autenticado!', 'error');
      return;
    }

    if (!contractToUpdate) {
      addNotification('Contrato não encontrado!', 'error');
      return;
    }

    const clientToUpdate = clients.find(c => c.id === contractToUpdate.clientId);
    if (!clientToUpdate) {
      addNotification('Cliente não encontrado!', 'error');
      return;
    }

    const newInstallments: Installment[] = [];
    if (installments > 0) {
      for (let i = 0; i < installments; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        dueDate.setDate(dueDay);
        newInstallments.push({
          dueDate: dueDate.toLocaleDateString('pt-BR'),
          value: totalValue / installments,
          status: 'pendente',
        });
      }
    }

    await updateClient(user.uid, clientToUpdate.id, {
      name: clientToUpdate.name,
      installments: newInstallments
    });

    setClients(prevClients =>
      prevClients.map(client => {
        if (client.id === clientToUpdate.id) {
          return { ...client, installments: newInstallments };
        }
        return client;
      })
    );

    setContracts(prevContracts =>
      prevContracts.map(contract => {
        if (contract.id === contractId) {
          return { ...contract, installments: newInstallments };
        }
        return contract;
      })
    );
  };

  return (
    <div>
      <div className="grid grid-3" style={{ marginTop: '15px', marginBottom: '20px' }}>
        <InfoCard title="Receita Total" value={financials.totalRevenue} icon="fa-dollar-sign" type="revenue" isFinancial={true}/>
        <InfoCard title="A Receber" value={financials.receivable} icon="fa-hand-holding-usd" type="receivable" isFinancial={true}/>
        <InfoCard title="Total Pago" value={financials.paid} icon="fa-check-circle" type="paid" isFinancial={true}/>
      </div>
      <div className="grid grid-3" style={{ marginBottom: '20px' }}>
        <InfoCard title="Parcelas a Vencer" value={financials.upcomingInstallments} icon="fa-chart-line" type="netProfit" />
        <InfoCard title="Parcelas Vencidas" value={financials.dueInstallments} icon="fa-file-invoice-dollar" type="expenses" />
        <InfoCard title="Parcelas Pagas" value={financials.doneInstallments} icon="fa-chart-line" type="revenue" />
      </div>

      <div className="grid grid-1">
        <NewTransaction 
          contracts={contracts}
          newTransaction={newTransaction}
          handleInputChange={handleInputChange}
          handleSaveTransaction={handleSaveTransaction}
        />
        <PaymentControl contracts={contracts} handleUpdateInstallment={handleUpdateInstallment} handleGenerateInstallments={handleGenerateInstallments} />
      </div>
    </div>
  );
}













