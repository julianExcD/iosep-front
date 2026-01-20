export const useCtaCte = () => {
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) {
      return '';
    }
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return '';
    }
    const [dateValues] = value.split('T');
    return dateValues ?? '';
  };

  return {
    formatCurrency,
    formatDate,
  };
};
