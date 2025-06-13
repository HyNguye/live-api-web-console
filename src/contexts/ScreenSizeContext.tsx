// ScreenSizeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Định nghĩa interface cho giá trị context
interface ScreenSizeContextType {
  isMobile: boolean;
}

// Tạo Context với giá trị mặc định
const ScreenSizeContext = createContext<ScreenSizeContextType | undefined>(undefined);

// Props cho Provider
interface ScreenSizeProviderProps {
  children: ReactNode;
}

// Provider Component
export const ScreenSizeProvider: React.FC<ScreenSizeProviderProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 600);

  useEffect(() => {
    // Hàm xử lý thay đổi kích thước màn hình
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    // Thêm event listener cho sự kiện resize
    window.addEventListener('resize', handleResize);

    // Cleanup để tránh memory leak
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ScreenSizeContext.Provider value={{ isMobile }}>
      {children}
    </ScreenSizeContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng context
export const useScreenSize = (): ScreenSizeContextType => {
  const context = useContext(ScreenSizeContext);
  if (!context) {
    throw new Error('useScreenSize must be used within a ScreenSizeProvider');
  }
  return context;
};