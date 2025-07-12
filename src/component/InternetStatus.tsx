import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const InternetStatusToast = () => {
  useEffect(() => {
    const handleOnline = () => {
      toast.dismiss('offline-toast');
      toast.success('Koneksi internet kembali pulih', {
        id: 'online-toast',
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#4BB543',
          color: '#fff',
        },
      });
    };

    const handleOffline = () => {
      toast.dismiss('online-toast');
      toast.error('Anda sedang offline. Periksa koneksi internet Anda', {
        id: 'offline-toast',
        duration: Infinity, // Toast akan tetap ada sampai offline
        position: 'top-center',
        style: {
          background: '#ff3333',
          color: '#fff',
        },
      });
    };

    // Tambahkan event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periksa status awal
    if (!navigator.onLine) {
      handleOffline();
    }

    // Bersihkan event listeners saat komponen unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return <Toaster />;
};

export default InternetStatusToast;