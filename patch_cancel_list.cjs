const fs = require('fs');
let content = fs.readFileSync('src/pages/Bookings/BookingsList.tsx', 'utf8');

const cancelMut = `
  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(\`/bookings/\${id}/cancel\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Operation successful');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Operation failed')
  });
`;

content = content.replace(/return \(/, cancelMut + '\n  return (');

const cancelBtn = `
                    {['PENDING', 'APPROVED', 'ACTIVE'].includes(booking.status) && (
                        <button onClick={() => { if(confirm('Cancel booking?')) cancelMutation.mutate(booking.id); }} className="text-gray-400 hover:text-gray-600 ml-3" title="Cancel">
                          Cancel
                        </button>
                    )}
`;

content = content.replace(/(<\/button>\s*<\/>\s*\)}\s*)<\/td>/, `$1${cancelBtn}                  </td>`);

fs.writeFileSync('src/pages/Bookings/BookingsList.tsx', content);
