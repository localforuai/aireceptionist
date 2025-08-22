import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'header.title': 'AI Receptionist',
    'header.live': 'Live',
    'header.demo': 'Demo',
    'header.exit': 'Exit',
    
    // Metrics
    'metrics.totalCallMinutes': 'Total Call Minutes',
    'metrics.totalCalls': 'Total Calls',
    'metrics.avgCallDuration': 'Avg Call Duration',
    'metrics.successRate': 'Success Rate',
    'metrics.minutes': 'minutes',
    'metrics.calls': 'calls',
    'metrics.minSec': 'min:sec',
    'metrics.success': 'success',
    
    // Subscription
    'subscription.title': 'Subscription',
    'subscription.plan': 'Professional Plan',
    'subscription.usage': 'Usage',
    'subscription.remaining': 'Remaining',
    'subscription.used': 'Used',
    'subscription.total': 'Total',
    'subscription.planRenewal': 'Plan Renewal',
    'subscription.renewsOn': 'Your plan renews on',
    'subscription.freshMinutes': 'with fresh minutes.',
    'subscription.unusedExpire': 'Note: Unused minutes expire and do not roll over to the next month.',
    'subscription.needMore': 'Need More?',
    'subscription.oneTime': 'One-time purchase',
    'subscription.buyMinutes': 'Buy mins',
    'subscription.confirmPurchase': 'Confirm Purchase',
    'subscription.cancel': 'Cancel',
    'subscription.autoTopUp': 'Auto Top-Up',
    'subscription.autoTopUpDesc': 'Auto-buy mins for $ when low.',
    'subscription.runningLow': 'Running low on minutes!',
    
    // Google Calendar
    'calendar.title': 'Google Calendar',
    'calendar.appointmentSync': 'Appointment sync',
    'calendar.connected': 'Connected',
    'calendar.notConnected': 'Not connected',
    'calendar.connect': 'Connect Google Calendar',
    'calendar.selectCalendar': 'Select Calendar',
    'calendar.chooseCalendar': 'Choose calendar...',
    'calendar.syncMode': 'Sync Mode',
    'calendar.twoWaySync': '2-Way Sync',
    'calendar.createOnly': 'Create Only',
    'calendar.freeBusyCheck': 'Free/Busy Check',
    'calendar.disconnect': 'Disconnect',
    'calendar.confirm': 'Confirm',
    'calendar.todaysBookings': "Today's Bookings",
    'calendar.appointments': 'Appointments',
    'calendar.lastSync': 'Last Sync',
    'calendar.autoSync': 'Sync runs every 15 minutes automatically',
    'calendar.never': 'Never',
    'calendar.justNow': 'Just now',
    'calendar.minutesAgo': 'm ago',
    'calendar.hoursAgo': 'h ago',
    
    // Charts
    'charts.endReasons': 'End Reasons',
    'charts.dailyVolume': 'Daily Volume',
    'charts.calls': 'calls',
    
    // End Reasons
    'endReasons.customerHangup': 'Customer Hangup',
    'endReasons.customerComplete': 'Customer Complete',
    'endReasons.assistantHangup': 'Assistant Hangup',
    'endReasons.systemError': 'System Error',
    'endReasons.timeout': 'Timeout',
    
    // Call Logs
    'callLogs.title': 'Call Logs',
    'callLogs.searchCalls': 'Search calls...',
    'callLogs.allStatus': 'All Status',
    'callLogs.completed': 'Completed',
    'callLogs.failed': 'Failed',
    'callLogs.inProgress': 'In Progress',
    'callLogs.allAssistants': 'All Assistants',
    'callLogs.date': 'Date',
    'callLogs.customer': 'Customer',
    'callLogs.assistant': 'Assistant',
    'callLogs.duration': 'Duration',
    'callLogs.status': 'Status',
    'callLogs.success': 'Success',
    'callLogs.actions': 'Actions',
    'callLogs.done': 'Done',
    'callLogs.active': 'Active',
    'callLogs.noCalls': 'No calls found.',
    'callLogs.showing': 'Showing',
    'callLogs.of': 'of',
    'callLogs.viewDetails': 'View Details',
    'callLogs.playAudio': 'Play Audio',
    
    // API Setup
    'api.demoMode': 'Demo Mode',
    'api.demoDesc': 'Viewing demo data. Switch to live data to connect to Vapi.',
    'api.switchToLive': 'Switch to Live Data',
    'api.requiresBackend': '(Requires backend server running on port 3001)',
    'api.liveData': 'Live Data',
    'api.liveDesc': 'Connected to your Vapi account via secure backend server using your private key.',
    'api.switchToDemo': 'Switch to Demo Mode',
    'api.backendServer': 'Backend Server: http://localhost:3001 | Private Key: Secure ✓',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.tryAgain': 'Try Again',
    'common.close': 'Close'
  },
  th: {
    // Header
    'header.title': 'AI พนักงานต้อนรับ',
    'header.live': 'สด',
    'header.demo': 'ทดสอบ',
    'header.exit': 'ออก',
    
    // Metrics
    'metrics.totalCallMinutes': 'นาทีโทรศัพท์ทั้งหมด',
    'metrics.totalCalls': 'สายโทรทั้งหมด',
    'metrics.avgCallDuration': 'ระยะเวลาโทรเฉลี่ย',
    'metrics.successRate': 'อัตราความสำเร็จ',
    'metrics.minutes': 'นาที',
    'metrics.calls': 'สาย',
    'metrics.minSec': 'นาที:วินาที',
    'metrics.success': 'สำเร็จ',
    
    // Subscription
    'subscription.title': 'แพ็กเกจ',
    'subscription.plan': 'แพ็กเกจมืออาชีพ',
    'subscription.usage': 'การใช้งาน',
    'subscription.remaining': 'เหลือ',
    'subscription.used': 'ใช้แล้ว',
    'subscription.total': 'ทั้งหมด',
    'subscription.planRenewal': 'ต่ออายุแพ็กเกจ',
    'subscription.renewsOn': 'แพ็กเกจของคุณจะต่ออายุในวันที่',
    'subscription.freshMinutes': 'พร้อมนาทีใหม่',
    'subscription.unusedExpire': 'หมายเหตุ: นาทีที่ไม่ได้ใช้จะหมดอายุและไม่สามารถโอนไปเดือนถัดไปได้',
    'subscription.needMore': 'ต้องการเพิ่ม?',
    'subscription.oneTime': 'ซื้อครั้งเดียว',
    'subscription.buyMinutes': 'ซื้อ นาที',
    'subscription.confirmPurchase': 'ยืนยันการซื้อ',
    'subscription.cancel': 'ยกเลิก',
    'subscription.autoTopUp': 'เติมอัตโนมัติ',
    'subscription.autoTopUpDesc': 'ซื้อ นาที ในราคา $ เมื่อเหลือน้อย',
    'subscription.runningLow': 'นาทีเหลือน้อย!',
    
    // Google Calendar
    'calendar.title': 'Google ปฏิทิน',
    'calendar.appointmentSync': 'ซิงค์การนัดหมาย',
    'calendar.connected': 'เชื่อมต่อแล้ว',
    'calendar.notConnected': 'ไม่ได้เชื่อมต่อ',
    'calendar.connect': 'เชื่อมต่อ Google ปฏิทิน',
    'calendar.selectCalendar': 'เลือกปฏิทิน',
    'calendar.chooseCalendar': 'เลือกปฏิทิน...',
    'calendar.syncMode': 'โหมดซิงค์',
    'calendar.twoWaySync': 'ซิงค์ 2 ทาง',
    'calendar.createOnly': 'สร้างเท่านั้น',
    'calendar.freeBusyCheck': 'ตรวจสอบว่าง/ไม่ว่าง',
    'calendar.disconnect': 'ตัดการเชื่อมต่อ',
    'calendar.confirm': 'ยืนยัน',
    'calendar.todaysBookings': 'การจองวันนี้',
    'calendar.appointments': 'นัดหมาย',
    'calendar.lastSync': 'ซิงค์ล่าสุด',
    'calendar.autoSync': 'ซิงค์อัตโนมัติทุก 15 นาที',
    'calendar.never': 'ไม่เคย',
    'calendar.justNow': 'เมื่อกี้นี้',
    'calendar.minutesAgo': ' นาทีที่แล้ว',
    'calendar.hoursAgo': ' ชั่วโมงที่แล้ว',
    
    // Charts
    'charts.endReasons': 'สาเหตุการสิ้นสุด',
    'charts.dailyVolume': 'ปริมาณรายวัน',
    'charts.calls': 'สาย',
    
    // End Reasons
    'endReasons.customerHangup': 'ลูกค้าวางสาย',
    'endReasons.customerComplete': 'ลูกค้าเสร็จสิ้น',
    'endReasons.assistantHangup': 'ผู้ช่วยวางสาย',
    'endReasons.systemError': 'ข้อผิดพลาดระบบ',
    'endReasons.timeout': 'หมดเวลา',
    
    // Call Logs
    'callLogs.title': 'บันทึกการโทร',
    'callLogs.searchCalls': 'ค้นหาการโทร...',
    'callLogs.allStatus': 'สถานะทั้งหมด',
    'callLogs.completed': 'เสร็จสิ้น',
    'callLogs.failed': 'ล้มเหลว',
    'callLogs.inProgress': 'กำลังดำเนินการ',
    'callLogs.allAssistants': 'ผู้ช่วยทั้งหมด',
    'callLogs.date': 'วันที่',
    'callLogs.customer': 'ลูกค้า',
    'callLogs.assistant': 'ผู้ช่วย',
    'callLogs.duration': 'ระยะเวลา',
    'callLogs.status': 'สถานะ',
    'callLogs.success': 'ความสำเร็จ',
    'callLogs.actions': 'การดำเนินการ',
    'callLogs.done': 'เสร็จ',
    'callLogs.active': 'ใช้งาน',
    'callLogs.noCalls': 'ไม่พบการโทร',
    'callLogs.showing': 'แสดง',
    'callLogs.of': 'จาก',
    'callLogs.viewDetails': 'ดูรายละเอียด',
    'callLogs.playAudio': 'เล่นเสียง',
    
    // API Setup
    'api.demoMode': 'โหมดทดสอบ',
    'api.demoDesc': 'กำลังดูข้อมูลทดสอบ เปลี่ยนเป็นข้อมูลสดเพื่อเชื่อมต่อกับ Vapi',
    'api.switchToLive': 'เปลี่ยนเป็นข้อมูลสด',
    'api.requiresBackend': '(ต้องการเซิร์ฟเวอร์แบ็กเอนด์ทำงานที่พอร์ต 3001)',
    'api.liveData': 'ข้อมูลสด',
    'api.liveDesc': 'เชื่อมต่อกับบัญชี Vapi ของคุณผ่านเซิร์ฟเวอร์แบ็กเอนด์ที่ปลอดภัยโดยใช้คีย์ส่วนตัว',
    'api.switchToDemo': 'เปลี่ยนเป็นโหมดทดสอบ',
    'api.backendServer': 'เซิร์ฟเวอร์แบ็กเอนด์: http://localhost:3001 | คีย์ส่วนตัว: ปลอดภัย ✓',
    
    // Common
    'common.loading': 'กำลังโหลด...',
    'common.error': 'ข้อผิดพลาด',
    'common.tryAgain': 'ลองอีกครั้ง',
    'common.close': 'ปิด'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};