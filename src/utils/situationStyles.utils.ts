export const getBorderCardStyle = (situation: string, completed: string, pending: string, execution: string, canceled: string) => {
    switch (situation) {
        case completed:
            return { borderLeft: '5px solid var(--color-success)' };
        case pending:
            return { borderLeft: '5px solid var(--color-warning)' };
        case execution:
            return { borderLeft: '5px solid var(--color-execution)' };
        case canceled:
            return { borderLeft: '5px solid var(--color-error)' };
        default:
            return {};
    }
};

export const getSituationStyle = (situation: string, completed: string, pending: string, execution: string, canceled: string) => {
    switch (situation) {
        case completed:
            return { backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' };
        case pending:
            return { backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' };
        case execution:
            return { backgroundColor: 'var(--color-execution-bg)', color: 'var(--color-execution-text)' };
        case canceled:
            return { backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error-text)' };
        default:
            return {};
    }
};
